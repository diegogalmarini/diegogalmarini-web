// Script para probar la integridad de datos entre dashboards
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testDataIntegrity() {
  try {
    console.log('🔍 Verificando integridad de datos...');
    
    // Obtener todas las consultas
    const consultationsRef = collection(db, 'consultations');
    const q = query(consultationsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    console.log(`📊 Total de consultas encontradas: ${querySnapshot.size}`);
    
    const consultations = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      consultations.push({
        id: doc.id,
        clientEmail: data.clientEmail,
        status: data.status,
        selectedPlan: data.selectedPlan,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });
    
    // Verificar estados
    const statusCounts = consultations.reduce((acc, consultation) => {
      acc[consultation.status] = (acc[consultation.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Distribución de estados:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
    // Verificar consultas por cliente
    const clientCounts = consultations.reduce((acc, consultation) => {
      acc[consultation.clientEmail] = (acc[consultation.clientEmail] || 0) + 1;
      return acc;
    }, {});
    
    console.log('👥 Consultas por cliente:');
    Object.entries(clientCounts).forEach(([email, count]) => {
      console.log(`  ${email}: ${count}`);
    });
    
    // Verificar consultas sin updatedAt (posible problema de sincronización)
    const withoutUpdatedAt = consultations.filter(c => !c.updatedAt);
    if (withoutUpdatedAt.length > 0) {
      console.log('⚠️  Consultas sin updatedAt:', withoutUpdatedAt.length);
    }
    
    // Verificar problemas de integridad específicos
    console.log('\n🔧 Problemas de integridad detectados:');
    
    // 1. Consultas con estado 'responded' que podrían no estar sincronizadas
    const respondedConsultations = consultations.filter(c => c.status === 'responded');
    console.log(`  - Consultas marcadas como 'responded': ${respondedConsultations.length}`);
    
    // 2. Verificar si hay inconsistencias en los datos
    const inconsistentData = consultations.filter(c => 
      !c.clientEmail || !c.status || !c.createdAt
    );
    if (inconsistentData.length > 0) {
      console.log(`  ⚠️  Consultas con datos inconsistentes: ${inconsistentData.length}`);
    }
    
    console.log('\n✅ Verificación de integridad completada');
    
  } catch (error) {
    console.error('❌ Error al verificar integridad:', error);
  }
}

testDataIntegrity();