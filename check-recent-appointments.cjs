#!/usr/bin/env node

/**
 * 🔍 Script para verificar citas recientes en Firestore
 * Especialmente para verificar citas de 30/60 minutos
 */

const { signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { collection, getDocs, query, orderBy, limit, where } = require('firebase/firestore');
const { auth, db } = require('./firebaseConfig.cjs');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function section(title) {
  log(`\n${'='.repeat(50)}`, 'cyan');
  log(`🔍 ${title}`, 'cyan');
  log('='.repeat(50), 'cyan');
}

// Credenciales de prueba
const testCredentials = {
  email: 'test@diegogalmarini.com',
  password: 'TestPassword123!'
};

async function checkRecentAppointments() {
  section('VERIFICACIÓN DE CITAS RECIENTES');
  
  try {
    // Autenticar
    info('Autenticando usuario...');
    await signInWithEmailAndPassword(auth, testCredentials.email, testCredentials.password);
    success('Usuario autenticado correctamente');
    
    // Obtener todas las citas
    info('Obteniendo todas las citas...');
    const appointmentsRef = collection(db, 'appointments');
    const allAppointments = await getDocs(appointmentsRef);
    
    log(`\n📊 TOTAL DE CITAS ENCONTRADAS: ${allAppointments.size}`, 'cyan');
    
    if (allAppointments.size === 0) {
      warning('No se encontraron citas en la base de datos');
      return;
    }
    
    // Analizar cada cita
    const appointments = [];
    allAppointments.forEach((doc) => {
      const data = doc.data();
      appointments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      });
    });
    
    // Ordenar por fecha de creación (más recientes primero)
    appointments.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB - dateA;
    });
    
    // Mostrar detalles de cada cita
    log('\n📋 DETALLES DE TODAS LAS CITAS:', 'cyan');
    appointments.forEach((appointment, index) => {
      log(`\n--- CITA ${index + 1} ---`, 'yellow');
      log(`ID: ${appointment.id}`);
      log(`Cliente: ${appointment.clientName || 'No especificado'}`);
      log(`Email: ${appointment.clientEmail || 'No especificado'}`);
      log(`Fecha seleccionada: ${appointment.selectedDate || 'No especificada'}`);
      log(`Hora seleccionada: ${appointment.selectedTime || 'No especificada'}`);
      log(`Duración: ${appointment.duration || appointment.planType || 'No especificada'}`);
      log(`Tipo de plan: ${appointment.planType || 'No especificado'}`);
      log(`Estado: ${appointment.status || 'No especificado'}`);
      log(`Precio: ${appointment.price || 'No especificado'}`);
      log(`Creada: ${appointment.createdAt || 'No especificada'}`);
      
      // Verificar si es una cita de pago (30 o 60 minutos)
      const isPaidAppointment = appointment.planType === '30min' || appointment.planType === '60min' || 
                               appointment.duration === '30' || appointment.duration === '60';
      
      if (isPaidAppointment) {
        success(`Esta es una CITA DE PAGO (${appointment.planType || appointment.duration} min)`);
      } else {
        info('Esta es una consulta gratuita');
      }
    });
    
    // Filtrar citas de pago recientes
    const paidAppointments = appointments.filter(apt => 
      apt.planType === '30min' || apt.planType === '60min' || 
      apt.duration === '30' || apt.duration === '60'
    );
    
    log(`\n💰 CITAS DE PAGO ENCONTRADAS: ${paidAppointments.length}`, 'green');
    
    if (paidAppointments.length > 0) {
      log('\n🎯 CITAS DE PAGO MÁS RECIENTES:', 'green');
      paidAppointments.slice(0, 3).forEach((apt, index) => {
        log(`${index + 1}. ${apt.clientName} - ${apt.planType || apt.duration}min - ${apt.selectedDate} ${apt.selectedTime}`);
      });
    }
    
    // Verificar citas del usuario de prueba específicamente
    const userAppointments = appointments.filter(apt => 
      apt.clientEmail === testCredentials.email
    );
    
    log(`\n👤 CITAS DEL USUARIO DE PRUEBA: ${userAppointments.length}`, 'blue');
    
    if (userAppointments.length > 0) {
      userAppointments.forEach((apt, index) => {
        log(`${index + 1}. ${apt.planType || apt.duration}min - ${apt.selectedDate} ${apt.selectedTime} - Estado: ${apt.status}`);
      });
    }
    
    await signOut(auth);
    success('\nVerificación completada y sesión cerrada');
    
    return {
      totalAppointments: appointments.length,
      paidAppointments: paidAppointments.length,
      userAppointments: userAppointments.length,
      recentPaidAppointments: paidAppointments.slice(0, 3)
    };
    
  } catch (err) {
    error(`Error durante la verificación: ${err.message}`);
    
    try {
      await signOut(auth);
    } catch (signOutErr) {
      error(`Error al cerrar sesión: ${signOutErr.message}`);
    }
    
    throw err;
  }
}

// Ejecutar si el script se ejecuta directamente
if (require.main === module) {
  checkRecentAppointments()
    .then((results) => {
      log('\n🎉 Verificación completada exitosamente', 'green');
      
      if (results.paidAppointments === 0) {
        warning('\n⚠️  No se encontraron citas de pago (30/60 min)');
        info('Esto podría explicar por qué no aparecen en el calendario del cliente');
      } else {
        success(`\n✅ Se encontraron ${results.paidAppointments} citas de pago`);
        info('Estas deberían aparecer en el calendario del cliente');
      }
      
      process.exit(0);
    })
    .catch((err) => {
      error(`\n💥 Error fatal: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { checkRecentAppointments };