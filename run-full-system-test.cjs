#!/usr/bin/env node

/**
 * 🧪 Script de Prueba Integral del Sistema CRM
 * 
 * Este script ejecuta una batería completa de pruebas para verificar
 * que todos los componentes del sistema funcionen correctamente.
 */

const { signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { collection, getDocs, addDoc, query, where, orderBy, limit } = require('firebase/firestore');
const { auth, db } = require('./firebaseConfig.cjs');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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

async function testAuthentication() {
  section('PRUEBA DE AUTENTICACIÓN');
  
  try {
    info('Intentando autenticar usuario de prueba...');
    const userCredential = await signInWithEmailAndPassword(auth, testCredentials.email, testCredentials.password);
    const user = userCredential.user;
    
    success(`Usuario autenticado: ${user.email}`);
    success(`UID: ${user.uid}`);
    success(`Email verificado: ${user.emailVerified ? 'Sí' : 'No'}`);
    
    return user;
  } catch (err) {
    error(`Error de autenticación: ${err.message}`);
    throw err;
  }
}

async function testFirestoreAccess() {
  section('PRUEBA DE ACCESO A FIRESTORE');
  
  const collections = ['consultations', 'appointments', 'users'];
  const results = {};
  
  for (const collectionName of collections) {
    try {
      info(`Probando acceso a colección: ${collectionName}`);
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(query(collectionRef, limit(5)));
      
      results[collectionName] = {
        accessible: true,
        documentCount: snapshot.size,
        documents: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };
      
      success(`${collectionName}: ${snapshot.size} documentos encontrados`);
    } catch (err) {
      error(`${collectionName}: Error de acceso - ${err.message}`);
      results[collectionName] = {
        accessible: false,
        error: err.message
      };
    }
  }
  
  return results;
}

async function testUserSpecificData(userEmail) {
  section('PRUEBA DE DATOS ESPECÍFICOS DEL USUARIO');
  
  try {
    // Probar consultas del usuario
    info('Buscando consultas del usuario...');
    const consultationsRef = collection(db, 'consultations');
    const consultationsQuery = query(
      consultationsRef,
      where('clientEmail', '==', userEmail),
      orderBy('createdAt', 'desc')
    );
    const consultationsSnapshot = await getDocs(consultationsQuery);
    
    success(`Consultas encontradas: ${consultationsSnapshot.size}`);
    
    // Probar citas del usuario
    info('Buscando citas del usuario...');
    const appointmentsRef = collection(db, 'appointments');
    const appointmentsQuery = query(
      appointmentsRef,
      where('clientEmail', '==', userEmail),
      orderBy('selectedDate', 'desc')
    );
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    
    success(`Citas encontradas: ${appointmentsSnapshot.size}`);
    
    return {
      consultations: consultationsSnapshot.size,
      appointments: appointmentsSnapshot.size,
      consultationData: consultationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      appointmentData: appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
  } catch (err) {
    error(`Error al obtener datos del usuario: ${err.message}`);
    throw err;
  }
}

async function testDataIntegrity(userData) {
  section('PRUEBA DE INTEGRIDAD DE DATOS');
  
  const issues = [];
  
  // Verificar consultas
  info('Verificando integridad de consultas...');
  userData.consultationData.forEach((consultation, index) => {
    const requiredFields = ['clientEmail', 'clientName', 'problemDescription', 'status', 'createdAt'];
    const missingFields = requiredFields.filter(field => !consultation[field]);
    
    if (missingFields.length > 0) {
      issues.push(`Consulta ${index + 1}: Campos faltantes - ${missingFields.join(', ')}`);
    }
    
    if (!['pendiente', 'respondida'].includes(consultation.status)) {
      issues.push(`Consulta ${index + 1}: Estado inválido - ${consultation.status}`);
    }
  });
  
  // Verificar citas
  info('Verificando integridad de citas...');
  userData.appointmentData.forEach((appointment, index) => {
    const requiredFields = ['clientEmail', 'clientName', 'selectedDate', 'selectedTime', 'status', 'selectedPlan'];
    const missingFields = requiredFields.filter(field => !appointment[field]);
    
    if (missingFields.length > 0) {
      issues.push(`Cita ${index + 1}: Campos faltantes - ${missingFields.join(', ')}`);
    }
    
    if (!['pendiente de pago', 'pagada y programada'].includes(appointment.status)) {
      issues.push(`Cita ${index + 1}: Estado inválido - ${appointment.status}`);
    }
  });
  
  if (issues.length === 0) {
    success('Todos los datos tienen integridad correcta');
  } else {
    warning(`Se encontraron ${issues.length} problemas de integridad:`);
    issues.forEach(issue => warning(`  - ${issue}`));
  }
  
  return issues;
}

async function testSystemPerformance() {
  section('PRUEBA DE RENDIMIENTO DEL SISTEMA');
  
  const startTime = Date.now();
  
  try {
    // Prueba de consulta múltiple
    info('Ejecutando consultas múltiples...');
    const promises = [
      getDocs(query(collection(db, 'consultations'), limit(10))),
      getDocs(query(collection(db, 'appointments'), limit(10))),
      getDocs(query(collection(db, 'users'), limit(5)))
    ];
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (duration < 2000) {
      success(`Rendimiento excelente: ${duration}ms`);
    } else if (duration < 5000) {
      warning(`Rendimiento aceptable: ${duration}ms`);
    } else {
      error(`Rendimiento lento: ${duration}ms`);
    }
    
    return duration;
  } catch (err) {
    error(`Error en prueba de rendimiento: ${err.message}`);
    throw err;
  }
}

async function generateTestReport(results) {
  section('REPORTE DE PRUEBAS');
  
  const report = {
    timestamp: new Date().toISOString(),
    authentication: results.authentication ? 'EXITOSO' : 'FALLIDO',
    firestoreAccess: results.firestoreAccess,
    userData: results.userData,
    dataIntegrity: results.dataIntegrity,
    performance: results.performance,
    summary: {
      totalTests: 5,
      passedTests: 0,
      failedTests: 0
    }
  };
  
  // Calcular resumen
  if (results.authentication) report.summary.passedTests++;
  else report.summary.failedTests++;
  
  if (results.firestoreAccess.consultations?.accessible) report.summary.passedTests++;
  else report.summary.failedTests++;
  
  if (results.userData.consultations >= 0) report.summary.passedTests++;
  else report.summary.failedTests++;
  
  if (results.dataIntegrity.length === 0) report.summary.passedTests++;
  else report.summary.failedTests++;
  
  if (results.performance < 5000) report.summary.passedTests++;
  else report.summary.failedTests++;
  
  // Mostrar resumen
  log(`\n📊 RESUMEN DE PRUEBAS:`, 'bright');
  log(`   ✅ Pruebas exitosas: ${report.summary.passedTests}/${report.summary.totalTests}`, 'green');
  log(`   ❌ Pruebas fallidas: ${report.summary.failedTests}/${report.summary.totalTests}`, 'red');
  log(`   🕒 Tiempo total: ${results.performance}ms`, 'blue');
  
  if (report.summary.failedTests === 0) {
    success('\n🎉 ¡TODAS LAS PRUEBAS PASARON! El sistema está funcionando correctamente.');
  } else {
    warning(`\n⚠️  ${report.summary.failedTests} prueba(s) fallaron. Revisa los detalles arriba.`);
  }
  
  return report;
}

async function runFullSystemTest() {
  log('🚀 INICIANDO PRUEBA INTEGRAL DEL SISTEMA CRM', 'bright');
  log('================================================\n', 'bright');
  
  const results = {};
  
  try {
    // 1. Prueba de autenticación
    const user = await testAuthentication();
    results.authentication = true;
    
    // 2. Prueba de acceso a Firestore
    results.firestoreAccess = await testFirestoreAccess();
    
    // 3. Prueba de datos específicos del usuario
    results.userData = await testUserSpecificData(user.email);
    
    // 4. Prueba de integridad de datos
    results.dataIntegrity = await testDataIntegrity(results.userData);
    
    // 5. Prueba de rendimiento
    results.performance = await testSystemPerformance();
    
    // Generar reporte
    const report = await generateTestReport(results);
    
    // Cerrar sesión
    await signOut(auth);
    info('\n👋 Sesión cerrada correctamente');
    
    return report;
    
  } catch (err) {
    error(`\n💥 Error crítico en las pruebas: ${err.message}`);
    
    // Intentar cerrar sesión en caso de error
    try {
      await signOut(auth);
    } catch (signOutErr) {
      error(`Error al cerrar sesión: ${signOutErr.message}`);
    }
    
    process.exit(1);
  }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
  runFullSystemTest()
    .then(() => {
      log('\n✨ Pruebas completadas exitosamente', 'green');
      process.exit(0);
    })
    .catch((err) => {
      error(`\n💥 Error fatal: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { runFullSystemTest };