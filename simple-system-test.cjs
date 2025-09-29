#!/usr/bin/env node

/**
 * 🧪 Script de Prueba Simplificado del Sistema CRM
 * 
 * Este script ejecuta pruebas básicas sin requerir índices complejos de Firestore.
 */

const { signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { collection, getDocs, query, limit } = require('firebase/firestore');
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

async function testBasicFirestoreAccess() {
  section('PRUEBA DE ACCESO BÁSICO A FIRESTORE');
  
  const collections = ['consultations', 'appointments'];
  const results = {};
  
  for (const collectionName of collections) {
    try {
      info(`Probando acceso a colección: ${collectionName}`);
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(query(collectionRef, limit(3)));
      
      results[collectionName] = {
        accessible: true,
        documentCount: snapshot.size
      };
      
      success(`${collectionName}: ${snapshot.size} documentos encontrados`);
      
      // Mostrar algunos campos de los documentos
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        const fields = Object.keys(data).slice(0, 3).join(', ');
        info(`  📄 Documento ${index + 1}: ${fields}...`);
      });
      
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

async function testWebServerConnection() {
  section('PRUEBA DE CONEXIÓN AL SERVIDOR WEB');
  
  try {
    info('Verificando servidor de desarrollo...');
    
    const response = await fetch('http://localhost:5173/');
    
    if (response.ok) {
      success('Servidor web funcionando correctamente');
      success(`Estado: ${response.status} ${response.statusText}`);
      return true;
    } else {
      error(`Servidor web respondió con error: ${response.status}`);
      return false;
    }
  } catch (err) {
    error(`No se puede conectar al servidor web: ${err.message}`);
    info('Asegúrate de que el servidor esté ejecutándose con: npm run dev');
    return false;
  }
}

async function generateSimpleReport(results) {
  section('REPORTE DE PRUEBAS SIMPLIFICADO');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Contar pruebas
  if (results.authentication) {
    passedTests++;
    success('✅ Autenticación: EXITOSA');
  } else {
    error('❌ Autenticación: FALLIDA');
  }
  totalTests++;
  
  if (results.firestoreAccess.consultations?.accessible) {
    passedTests++;
    success('✅ Acceso a Firestore: EXITOSO');
  } else {
    error('❌ Acceso a Firestore: FALLIDO');
  }
  totalTests++;
  
  if (results.webServer) {
    passedTests++;
    success('✅ Servidor Web: FUNCIONANDO');
  } else {
    error('❌ Servidor Web: NO DISPONIBLE');
  }
  totalTests++;
  
  // Mostrar resumen
  log(`\n📊 RESUMEN:`, 'cyan');
  log(`   ✅ Pruebas exitosas: ${passedTests}/${totalTests}`, 'green');
  log(`   ❌ Pruebas fallidas: ${totalTests - passedTests}/${totalTests}`, 'red');
  
  if (passedTests === totalTests) {
    success('\n🎉 ¡TODAS LAS PRUEBAS BÁSICAS PASARON!');
    success('El sistema está funcionando correctamente para uso básico.');
  } else {
    error(`\n⚠️  ${totalTests - passedTests} prueba(s) fallaron.`);
    info('Revisa los detalles arriba para solucionar los problemas.');
  }
  
  return {
    passedTests,
    totalTests,
    success: passedTests === totalTests
  };
}

async function runSimpleSystemTest() {
  log('🚀 INICIANDO PRUEBA SIMPLIFICADA DEL SISTEMA CRM', 'cyan');
  log('=================================================\n', 'cyan');
  
  const results = {};
  
  try {
    // 1. Prueba de autenticación
    const user = await testAuthentication();
    results.authentication = true;
    
    // 2. Prueba de acceso básico a Firestore
    results.firestoreAccess = await testBasicFirestoreAccess();
    
    // 3. Prueba de conexión al servidor web
    results.webServer = await testWebServerConnection();
    
    // Generar reporte
    const report = await generateSimpleReport(results);
    
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
    
    return { success: false, error: err.message };
  }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
  runSimpleSystemTest()
    .then((report) => {
      if (report.success) {
        log('\n✨ Pruebas completadas exitosamente', 'green');
        log('\n💡 RECOMENDACIONES PARA PRUEBAS COMPLETAS:', 'yellow');
        log('   1. Usa la aplicación web en: http://localhost:5173/', 'yellow');
        log('   2. Inicia sesión con: test@diegogalmarini.com', 'yellow');
        log('   3. Contraseña: TestPassword123!', 'yellow');
        log('   4. Prueba el dashboard y todas las funcionalidades', 'yellow');
        process.exit(0);
      } else {
        log('\n❌ Algunas pruebas fallaron', 'red');
        process.exit(1);
      }
    })
    .catch((err) => {
      error(`\n💥 Error fatal: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { runSimpleSystemTest };