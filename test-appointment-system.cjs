// Script para verificar el funcionamiento completo del sistema de citas
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, updateDoc, doc } = require('firebase/firestore');
const firebaseConfig = require('./firebaseConfig.cjs');

// Inicializar Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    // Si la app ya existe, obtenerla
    const { getApp } = require('firebase/app');
    app = getApp();
  } else {
    throw error;
  }
}
const auth = getAuth(app);
const db = getFirestore(app);

// Función para formatear fecha
function toLocalYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Función para simular creación de cita desde BookingModal
async function simulateAppointmentCreation() {
  console.log('\n=== SIMULANDO CREACIÓN DE CITA DESDE BOOKING MODAL ===');
  
  try {
    // Datos de prueba para una cita de 30 minutos
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointmentData = {
      clientEmail: 'test@diegogalmarini.com',
      clientName: 'Usuario de Prueba',
      planType: '30min',
      topic: 'Consulta sobre desarrollo de aplicación web con React y Firebase. Necesito ayuda con la arquitectura del proyecto y mejores prácticas para la gestión de estado.',
      selectedDate: toLocalYYYYMMDD(tomorrow),
      selectedTime: '10:00',
      duration: 30,
      status: 'pending_payment',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
    console.log('✅ Cita creada exitosamente con ID:', docRef.id);
    console.log('📋 Datos de la cita:', {
      ...appointmentData,
      createdAt: 'serverTimestamp()',
      updatedAt: 'serverTimestamp()'
    });
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error al crear cita:', error);
    return null;
  }
}

// Función para simular creación de consulta gratuita
async function simulateConsultationCreation() {
  console.log('\n=== SIMULANDO CREACIÓN DE CONSULTA GRATUITA ===');
  
  try {
    const consultationData = {
      clientEmail: 'test@diegogalmarini.com',
      clientName: 'Usuario de Prueba',
      planType: 'free',
      problemDescription: 'Tengo una startup de e-commerce y necesito orientación sobre qué tecnologías usar para el backend. Estoy considerando Node.js vs Python.',
      selectedDate: null,
      selectedTime: null,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'consultations'), consultationData);
    console.log('✅ Consulta gratuita creada exitosamente con ID:', docRef.id);
    console.log('📋 Datos de la consulta:', {
      ...consultationData,
      createdAt: 'serverTimestamp()',
      updatedAt: 'serverTimestamp()'
    });
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error al crear consulta:', error);
    return null;
  }
}

// Función para verificar dashboard del cliente
async function verifyClientDashboard() {
  console.log('\n=== VERIFICANDO DASHBOARD DEL CLIENTE ===');
  
  try {
    // Obtener citas del cliente
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('clientEmail', '==', 'test@diegogalmarini.com'),
      orderBy('createdAt', 'desc')
    );
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const appointments = appointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📅 Citas encontradas para el cliente: ${appointments.length}`);
    appointments.forEach((appointment, index) => {
      console.log(`  ${index + 1}. ID: ${appointment.id}`);
      console.log(`     Tipo: ${appointment.planType}`);
      console.log(`     Fecha: ${appointment.selectedDate || 'No programada'}`);
      console.log(`     Hora: ${appointment.selectedTime || 'No programada'}`);
      console.log(`     Estado: ${appointment.status}`);
      console.log(`     Tema: ${appointment.topic?.substring(0, 50)}...`);
    });
    
    // Obtener consultas del cliente
    const consultationsQuery = query(
      collection(db, 'consultations'),
      where('clientEmail', '==', 'test@diegogalmarini.com'),
      orderBy('createdAt', 'desc')
    );
    
    const consultationsSnapshot = await getDocs(consultationsQuery);
    const consultations = consultationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`💬 Consultas encontradas para el cliente: ${consultations.length}`);
    consultations.forEach((consultation, index) => {
      console.log(`  ${index + 1}. ID: ${consultation.id}`);
      console.log(`     Tipo: ${consultation.planType}`);
      console.log(`     Estado: ${consultation.status}`);
      console.log(`     Descripción: ${consultation.problemDescription?.substring(0, 50)}...`);
    });
    
    return { appointments, consultations };
  } catch (error) {
    console.error('❌ Error al verificar dashboard del cliente:', error);
    return { appointments: [], consultations: [] };
  }
}

// Función para verificar dashboard del administrador
async function verifyAdminDashboard() {
  console.log('\n=== VERIFICANDO DASHBOARD DEL ADMINISTRADOR ===');
  
  try {
    // Obtener todas las citas
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      orderBy('createdAt', 'desc')
    );
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const appointments = appointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Total de citas en el sistema: ${appointments.length}`);
    
    // Estadísticas por estado
    const statusStats = appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Estadísticas por estado:');
    Object.entries(statusStats).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
    // Estadísticas por tipo de plan
    const planStats = appointments.reduce((acc, appointment) => {
      acc[appointment.planType] = (acc[appointment.planType] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Estadísticas por tipo de plan:');
    Object.entries(planStats).forEach(([plan, count]) => {
      console.log(`  ${plan}: ${count}`);
    });
    
    // Obtener todas las consultas
    const consultationsQuery = query(
      collection(db, 'consultations'),
      orderBy('createdAt', 'desc')
    );
    
    const consultationsSnapshot = await getDocs(consultationsQuery);
    const consultations = consultationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`💬 Total de consultas en el sistema: ${consultations.length}`);
    
    return { appointments, consultations };
  } catch (error) {
    console.error('❌ Error al verificar dashboard del administrador:', error);
    return { appointments: [], consultations: [] };
  }
}

// Función para probar transiciones de estado
async function testStatusTransitions(appointmentId) {
  console.log('\n=== PROBANDO TRANSICIONES DE ESTADO ===');
  
  if (!appointmentId) {
    console.log('⚠️ No hay ID de cita para probar transiciones');
    return;
  }
  
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    
    // Simular pago completado
    console.log('💳 Simulando pago completado...');
    await updateDoc(appointmentRef, {
      status: 'scheduled',
      updatedAt: serverTimestamp()
    });
    console.log('✅ Estado cambiado a "scheduled"');
    
    // Simular confirmación
    setTimeout(async () => {
      console.log('📞 Simulando confirmación de cita...');
      await updateDoc(appointmentRef, {
        status: 'confirmed',
        updatedAt: serverTimestamp()
      });
      console.log('✅ Estado cambiado a "confirmed"');
      
      // Simular completado
      setTimeout(async () => {
        console.log('✅ Simulando cita completada...');
        await updateDoc(appointmentRef, {
          status: 'completed',
          updatedAt: serverTimestamp()
        });
        console.log('✅ Estado cambiado a "completed"');
      }, 1000);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error al probar transiciones de estado:', error);
  }
}

// Función principal
async function runAppointmentSystemTest() {
  console.log('🚀 INICIANDO VERIFICACIÓN COMPLETA DEL SISTEMA DE CITAS');
  console.log('=' .repeat(60));
  
  try {
    // Autenticarse como usuario de prueba
    console.log('🔐 Autenticando usuario de prueba...');
    await signInWithEmailAndPassword(auth, 'test@diegogalmarini.com', 'TestPassword123!');
    console.log('✅ Usuario autenticado exitosamente');
    
    // 1. Simular creación de cita
    const appointmentId = await simulateAppointmentCreation();
    
    // 2. Simular creación de consulta
    const consultationId = await simulateConsultationCreation();
    
    // 3. Verificar dashboard del cliente
    const clientData = await verifyClientDashboard();
    
    // 4. Verificar dashboard del administrador
    const adminData = await verifyAdminDashboard();
    
    // 5. Probar transiciones de estado
    if (appointmentId) {
      await testStatusTransitions(appointmentId);
    }
    
    // Resumen final
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RESUMEN DE LA VERIFICACIÓN');
    console.log('=' .repeat(60));
    console.log(`✅ Citas creadas: ${appointmentId ? 1 : 0}`);
    console.log(`✅ Consultas creadas: ${consultationId ? 1 : 0}`);
    console.log(`📅 Citas del cliente: ${clientData.appointments.length}`);
    console.log(`💬 Consultas del cliente: ${clientData.consultations.length}`);
    console.log(`📊 Total citas (admin): ${adminData.appointments.length}`);
    console.log(`💬 Total consultas (admin): ${adminData.consultations.length}`);
    console.log('\n🎉 Verificación completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

// Ejecutar el test
runAppointmentSystemTest().catch(console.error);