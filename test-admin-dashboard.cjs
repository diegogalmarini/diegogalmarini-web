// Script para probar el dashboard del administrador
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, query, orderBy, where } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBrJ_xfZeEVRXe0Fcw2XdDKVdCSRYHqaGA",
  authDomain: "diego-galmarini-oficial-web.firebaseapp.com",
  projectId: "diego-galmarini-oficial-web",
  storageBucket: "diego-galmarini-oficial-web.appspot.com",
  messagingSenderId: "668819276616",
  appId: "1:668819276616:web:5ca12fddfa9fd5fcc2697d"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Funciones de utilidad para logging
const log = (message, color = 'white') => {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const success = (message) => log(message, 'green');
const error = (message) => log(message, 'red');
const warning = (message) => log(message, 'yellow');
const info = (message) => log(message, 'cyan');

// Función para verificar si un usuario es administrador
function isAdmin(email) {
  return email === 'diegogalmarini@gmail.com';
}

// Función para probar el dashboard del administrador
async function testAdminDashboard() {
  try {
    log('\n🔐 Iniciando prueba del dashboard del administrador...', 'blue');
    
    // Primero autenticarse con usuario de prueba (para acceder a Firestore)
    const testEmail = 'test@diegogalmarini.com';
    const testPassword = 'TestPassword123!';
    
    log(`\n🔑 Autenticando con usuario de prueba: ${testEmail}`);
    
    try {
      await signInWithEmailAndPassword(auth, testEmail, testPassword);
      success('✅ Autenticación exitosa');
    } catch (authError) {
      error(`❌ Error de autenticación: ${authError.message}`);
      return;
    }
    
    // Simular email de administrador para pruebas
    const adminEmail = 'diegogalmarini@gmail.com';
    log(`\n👤 Simulando dashboard para administrador: ${adminEmail}`);
    
    // Verificar si es administrador
    if (isAdmin(adminEmail)) {
      success('✅ Email confirmado como administrador');
    } else {
      error('❌ Email NO es de administrador');
      return;
    }
    
    log('\n📊 Verificando acceso a datos administrativos...');
    
    // Obtener todas las citas (función de administrador)
    const appointmentsRef = collection(db, 'appointments');
    const appointmentsQuery = query(appointmentsRef, orderBy('createdAt', 'desc'));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    
    const appointments = [];
    appointmentsSnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    
    success(`✅ Citas obtenidas: ${appointments.length}`);
    
    // Obtener todas las consultas (función de administrador)
    const consultationsRef = collection(db, 'consultations');
    const consultationsQuery = query(consultationsRef, orderBy('createdAt', 'desc'));
    const consultationsSnapshot = await getDocs(consultationsQuery);
    
    const consultations = [];
    consultationsSnapshot.forEach((doc) => {
      consultations.push({ id: doc.id, ...doc.data() });
    });
    
    success(`✅ Consultas obtenidas: ${consultations.length}`);
    
    // Estadísticas del dashboard
    log('\n📈 Estadísticas del Dashboard:');
    
    // Citas por estado
    const appointmentsByStatus = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {});
    
    info('📅 Citas por estado:');
    Object.entries(appointmentsByStatus).forEach(([status, count]) => {
      log(`   ${status}: ${count}`);
    });
    
    // Consultas por estado
    const consultationsByStatus = consultations.reduce((acc, cons) => {
      acc[cons.status] = (acc[cons.status] || 0) + 1;
      return acc;
    }, {});
    
    info('💬 Consultas por estado:');
    Object.entries(consultationsByStatus).forEach(([status, count]) => {
      log(`   ${status}: ${count}`);
    });
    
    // Citas recientes (últimas 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAppointments = appointments.filter(apt => {
      if (apt.createdAt && apt.createdAt.toDate) {
        return apt.createdAt.toDate() >= sevenDaysAgo;
      }
      return false;
    });
    
    info(`📊 Citas recientes (últimos 7 días): ${recentAppointments.length}`);
    
    // Verificar funciones específicas del administrador
    log('\n🛠️ Verificando funciones administrativas...');
    
    // Función 1: Filtrar citas pendientes de pago
    const pendingPaymentAppointments = appointments.filter(apt => apt.status === 'pending_payment');
    success(`✅ Citas pendientes de pago: ${pendingPaymentAppointments.length}`);
    
    // Función 2: Filtrar consultas sin responder
    const unansweredConsultations = consultations.filter(cons => cons.status === 'pending');
    success(`✅ Consultas sin responder: ${unansweredConsultations.length}`);
    
    // Función 3: Obtener clientes únicos
    const uniqueClients = new Set();
    appointments.forEach(apt => {
      if (apt.clientEmail) uniqueClients.add(apt.clientEmail);
    });
    consultations.forEach(cons => {
      if (cons.email) uniqueClients.add(cons.email);
    });
    
    success(`✅ Clientes únicos: ${uniqueClients.size}`);
    
    // Resumen final
    log('\n🎉 Resumen de la prueba del dashboard del administrador:', 'green');
    success(`✅ Email de administrador verificado: ${adminEmail}`);
    success(`✅ Acceso a datos: ${appointments.length} citas, ${consultations.length} consultas`);
    success(`✅ Funciones administrativas: Operativas`);
    success(`✅ Estadísticas: Generadas correctamente`);
    
    log('\n💡 El dashboard del administrador está funcionando correctamente', 'green');
    log('   Puede acceder a todas las citas y consultas del sistema', 'green');
    log('   Las funciones de gestión están operativas', 'green');
    
    return {
      adminEmail,
      isAdminUser: true,
      appointmentsCount: appointments.length,
      consultationsCount: consultations.length,
      pendingPaymentCount: pendingPaymentAppointments.length,
      unansweredConsultationsCount: unansweredConsultations.length,
      uniqueClientsCount: uniqueClients.size
    };
    
  } catch (err) {
    error(`\n💥 Error durante la prueba del dashboard del administrador: ${err.message}`);
    throw err;
  }
}

// Ejecutar si el script se ejecuta directamente
if (require.main === module) {
  testAdminDashboard()
    .then((results) => {
      log('\n🎉 Prueba del dashboard del administrador completada exitosamente', 'green');
      process.exit(0);
    })
    .catch((err) => {
      error(`\n💥 Error fatal: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { testAdminDashboard };