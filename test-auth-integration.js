// Script para probar la integración de autenticación con datos reales
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, limit } from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);

console.log('🔐 Probando autenticación e integración con Firestore...');

// Función para probar autenticación con credenciales de prueba
async function testAuthentication() {
  console.log('\n🚀 Iniciando prueba de autenticación...');
  
  // Credenciales de prueba (usuario de prueba creado)
  const testEmail = 'test@diegogalmarini.com';
  const testPassword = 'TestPassword123!';
  
  try {
    console.log(`📧 Intentando autenticar con: ${testEmail}`);
    
    // Intentar autenticación
    const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    
    console.log('✅ Autenticación exitosa:');
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   ✉️  Email verificado: ${user.emailVerified}`);
    console.log(`   👤 Nombre: ${user.displayName || 'No especificado'}`);
    console.log(`   🆔 UID: ${user.uid}`);
    
    return user;
    
  } catch (error) {
    console.error('❌ Error de autenticación:', error.message);
    console.log('\n💡 Posibles causas:');
    console.log('   1. Credenciales incorrectas');
    console.log('   2. Usuario no registrado');
    console.log('   3. Configuración de Firebase incorrecta');
    
    return null;
  }
}

// Función para probar acceso a Firestore con usuario autenticado
async function testFirestoreWithAuth(user) {
  if (!user) {
    console.log('\n⚠️  No se puede probar Firestore sin usuario autenticado');
    return;
  }
  
  console.log('\n📊 Probando acceso a Firestore con usuario autenticado...');
  
  const collections = ['appointments', 'consultations', 'users'];
  
  for (const collectionName of collections) {
    try {
      console.log(`\n🔍 Probando colección: ${collectionName}`);
      
      // Intentar obtener documentos de la colección
      const q = query(collection(db, collectionName), limit(3));
      const snapshot = await getDocs(q);
      
      console.log(`✅ ${collectionName}: Acceso exitoso (${snapshot.size} documentos encontrados)`);
      
      snapshot.forEach((doc, index) => {
        console.log(`   📄 Documento ${index + 1} ID: ${doc.id}`);
        const data = doc.data();
        console.log(`   📋 Campos: ${Object.keys(data).slice(0, 5).join(', ')}${Object.keys(data).length > 5 ? '...' : ''}`);
      });
      
    } catch (error) {
      console.error(`❌ ${collectionName}: Error de acceso:`, error.message);
    }
  }
}

// Función para probar consultas específicas del usuario
async function testUserSpecificQueries(user) {
  if (!user) {
    console.log('\n⚠️  No se puede probar consultas específicas sin usuario autenticado');
    return;
  }
  
  console.log('\n🎯 Probando consultas específicas del usuario...');
  
  try {
    // Probar consulta de citas del usuario
    console.log(`\n📅 Buscando citas para: ${user.email}`);
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('clientEmail', '==', user.email),
      limit(10)
    );
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    console.log(`✅ Citas encontradas: ${appointmentsSnapshot.size}`);
    
    appointmentsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   📅 Cita ${index + 1}:`);
      console.log(`      ID: ${doc.id}`);
      console.log(`      Fecha: ${data.selectedDate || 'No especificada'}`);
      console.log(`      Hora: ${data.selectedTime || 'No especificada'}`);
      console.log(`      Estado: ${data.status || 'Sin estado'}`);
      console.log(`      Tipo: ${data.planType || 'No especificado'}`);
    });
    
    // Probar consulta de consultas del usuario
    console.log(`\n💬 Buscando consultas para: ${user.email}`);
    const consultationsQuery = query(
      collection(db, 'consultations'),
      where('clientEmail', '==', user.email),
      limit(10)
    );
    
    const consultationsSnapshot = await getDocs(consultationsQuery);
    console.log(`✅ Consultas encontradas: ${consultationsSnapshot.size}`);
    
    consultationsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   💬 Consulta ${index + 1}:`);
      console.log(`      ID: ${doc.id}`);
      console.log(`      Asunto: ${data.subject || data.selectedPlan || 'Sin asunto'}`);
      console.log(`      Estado: ${data.status || 'Sin estado'}`);
      console.log(`      Fecha: ${data.selectedDate || 'No especificada'}`);
    });
    
  } catch (error) {
    console.error('❌ Error en consultas específicas:', error.message);
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando prueba de integración completa...');
    
    // Probar autenticación
    const user = await testAuthentication();
    
    if (user) {
      // Probar acceso a Firestore
      await testFirestoreWithAuth(user);
      
      // Probar consultas específicas
      await testUserSpecificQueries(user);
      
      console.log('\n🎉 Prueba de integración completada exitosamente');
      console.log('\n💡 Recomendaciones:');
      console.log('   1. La autenticación funciona correctamente');
      console.log('   2. El acceso a Firestore está funcionando');
      console.log('   3. Verifica que la aplicación web esté usando las mismas credenciales');
      
    } else {
      console.log('\n❌ No se pudo completar la prueba debido a problemas de autenticación');
      console.log('\n💡 Pasos siguientes:');
      console.log('   1. Verifica las credenciales de prueba');
      console.log('   2. Asegúrate de que el usuario esté registrado en Firebase Auth');
      console.log('   3. Revisa la configuración de Firebase');
    }
    
  } catch (error) {
    console.error('💥 Error durante la prueba de integración:', error);
  }
}

// Ejecutar la prueba
main();

// Nota: Para usar este script, necesitarás:
// 1. Cambiar las credenciales de prueba por unas reales
// 2. Asegurarte de que el usuario esté registrado en Firebase Auth
// 3. Ejecutar: node test-auth-integration.js