const { initializeApp, getApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy, limit, where } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBrJ_xfZeEVRXe0Fcw2XdDKVdCSRYHqaGA",
  authDomain: "diego-galmarini-oficial-web.firebaseapp.com",
  projectId: "diego-galmarini-oficial-web",
  storageBucket: "diego-galmarini-oficial-web.appspot.com",
  messagingSenderId: "668819276616",
  appId: "1:668819276616:web:5ca12fddfa9fd5fcc2697d",
  measurementId: "G-91HFCBNTBY"
};

// Inicializar Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    app = getApp();
  } else {
    throw error;
  }
}

const auth = getAuth(app);
const db = getFirestore(app);

async function diagnoseAppointments() {
  try {
    console.log('🔍 DIAGNÓSTICO DEL SISTEMA DE CITAS');
    console.log('=' .repeat(50));
    
    // Autenticarse como usuario de prueba
    console.log('🔐 Autenticando usuario de prueba...');
    await signInWithEmailAndPassword(auth, 'test@diegogalmarini.com', 'TestPassword123!');
    console.log('✅ Usuario autenticado correctamente');
    
    // 1. Verificar todas las citas
    console.log('\n📅 VERIFICANDO TODAS LAS CITAS:');
    const appointmentsRef = collection(db, 'appointments');
    const allAppointments = await getDocs(appointmentsRef);
    
    console.log(`📊 Total de citas en la base de datos: ${allAppointments.size}`);
    
    if (allAppointments.size > 0) {
      console.log('\n📋 DETALLES DE TODAS LAS CITAS:');
      allAppointments.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n--- Cita ${index + 1} (ID: ${doc.id}) ---`);
        console.log(`📧 Cliente: ${data.clientEmail || 'No especificado'}`);
        console.log(`📞 Teléfono: ${data.clientPhone || 'No especificado'}`);
        console.log(`📅 Fecha: ${data.date || 'No especificada'}`);
        console.log(`⏰ Hora: ${data.time || 'No especificada'}`);
        console.log(`⏱️ Duración: ${data.planType || 'No especificada'}`);
        console.log(`💰 Estado: ${data.status || 'No especificado'}`);
        console.log(`📝 Problema: ${data.problemDescription || 'No especificado'}`);
        console.log(`📅 Creada: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : 'No especificada'}`);
        console.log(`🔄 Actualizada: ${data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toLocaleString() : 'No especificada'}`);
      });
    }
    
    // 2. Verificar citas recientes (últimas 24 horas)
    console.log('\n🕐 VERIFICANDO CITAS RECIENTES (ÚLTIMAS 24 HORAS):');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    try {
      const recentQuery = query(
        appointmentsRef,
        where('createdAt', '>=', yesterday),
        orderBy('createdAt', 'desc')
      );
      const recentAppointments = await getDocs(recentQuery);
      
      console.log(`📊 Citas creadas en las últimas 24 horas: ${recentAppointments.size}`);
      
      if (recentAppointments.size > 0) {
        recentAppointments.forEach((doc, index) => {
          const data = doc.data();
          console.log(`\n🆕 Cita reciente ${index + 1}:`);
          console.log(`   📧 Cliente: ${data.clientEmail}`);
          console.log(`   📅 Fecha: ${data.date}`);
          console.log(`   ⏰ Hora: ${data.time}`);
          console.log(`   ⏱️ Duración: ${data.planType}`);
          console.log(`   💰 Estado: ${data.status}`);
          console.log(`   📅 Creada: ${new Date(data.createdAt.seconds * 1000).toLocaleString()}`);
        });
      }
    } catch (error) {
      console.log(`❌ Error al consultar citas recientes: ${error.message}`);
      console.log('💡 Esto puede indicar un problema con los índices de Firestore');
    }
    
    // 3. Verificar citas por duración de 30 minutos
    console.log('\n⏱️ VERIFICANDO CITAS DE 30 MINUTOS:');
    try {
      const thirtyMinQuery = query(
        appointmentsRef,
        where('planType', 'in', ['30min', 'Sesión de 30 minutos'])
      );
      const thirtyMinAppointments = await getDocs(thirtyMinQuery);
      
      console.log(`📊 Citas de 30 minutos encontradas: ${thirtyMinAppointments.size}`);
      
      if (thirtyMinAppointments.size > 0) {
        thirtyMinAppointments.forEach((doc, index) => {
          const data = doc.data();
          console.log(`\n⏱️ Cita 30min ${index + 1}:`);
          console.log(`   📧 Cliente: ${data.clientEmail}`);
          console.log(`   📅 Fecha: ${data.date}`);
          console.log(`   ⏰ Hora: ${data.time}`);
          console.log(`   💰 Estado: ${data.status}`);
          console.log(`   📅 Creada: ${new Date(data.createdAt.seconds * 1000).toLocaleString()}`);
        });
      }
    } catch (error) {
      console.log(`❌ Error al consultar citas de 30 minutos: ${error.message}`);
    }
    
    // 4. Verificar consultas también
    console.log('\n💬 VERIFICANDO CONSULTAS:');
    const consultationsRef = collection(db, 'consultations');
    const allConsultations = await getDocs(consultationsRef);
    
    console.log(`📊 Total de consultas en la base de datos: ${allConsultations.size}`);
    
    // 5. Estadísticas por estado
    console.log('\n📈 ESTADÍSTICAS POR ESTADO DE CITAS:');
    const statusCount = {};
    allAppointments.forEach(doc => {
      const status = doc.data().status || 'sin_estado';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 DIAGNÓSTICO COMPLETADO');
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  }
}

// Ejecutar diagnóstico
diagnoseAppointments().then(() => {
  console.log('\n✅ Proceso de diagnóstico finalizado');
  process.exit(0);
}).catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});