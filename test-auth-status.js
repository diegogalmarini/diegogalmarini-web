// Script para verificar el estado de autenticación y permisos de Firestore
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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

console.log('🔍 Verificando estado de autenticación y permisos de Firestore...');

// Función para verificar el estado de autenticación
function checkAuthState() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Función para probar acceso a Firestore
async function testFirestoreAccess(user) {
  console.log('\n📊 Probando acceso a Firestore...');
  
  const collections = ['appointments', 'consultations', 'users'];
  
  for (const collectionName of collections) {
    try {
      console.log(`\n🔍 Probando colección: ${collectionName}`);
      
      // Intentar obtener documentos de la colección
      const q = query(collection(db, collectionName), limit(1));
      const snapshot = await getDocs(q);
      
      console.log(`✅ ${collectionName}: Acceso exitoso (${snapshot.size} documentos encontrados)`);
      
      if (snapshot.size > 0) {
        const doc = snapshot.docs[0];
        console.log(`   📄 Primer documento ID: ${doc.id}`);
        console.log(`   📋 Campos disponibles: ${Object.keys(doc.data()).join(', ')}`);
      }
      
    } catch (error) {
      console.error(`❌ ${collectionName}: Error de acceso:`, error.message);
      
      if (error.code === 'permission-denied') {
        console.log(`   🔒 Problema de permisos detectado para ${collectionName}`);
      }
    }
  }
}

// Función para probar consultas específicas
async function testSpecificQueries(user) {
  if (!user) {
    console.log('\n⚠️  No hay usuario autenticado, saltando consultas específicas');
    return;
  }
  
  console.log('\n🎯 Probando consultas específicas del usuario...');
  
  try {
    // Probar consulta de citas del usuario
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('userEmail', '==', user.email),
      limit(5)
    );
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    console.log(`✅ Citas del usuario: ${appointmentsSnapshot.size} encontradas`);
    
    // Probar consulta de consultas del usuario
    const consultationsQuery = query(
      collection(db, 'consultations'),
      where('userEmail', '==', user.email),
      limit(5)
    );
    
    const consultationsSnapshot = await getDocs(consultationsQuery);
    console.log(`✅ Consultas del usuario: ${consultationsSnapshot.size} encontradas`);
    
  } catch (error) {
    console.error('❌ Error en consultas específicas:', error.message);
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando verificación...');
    
    // Verificar estado de autenticación
    const user = await checkAuthState();
    
    if (user) {
      console.log('\n✅ Usuario autenticado:');
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   ✉️  Email verificado: ${user.emailVerified}`);
      console.log(`   👤 Nombre: ${user.displayName || 'No especificado'}`);
      console.log(`   🆔 UID: ${user.uid}`);
    } else {
      console.log('\n❌ No hay usuario autenticado');
      console.log('   💡 Esto explica los errores de permisos de Firestore');
    }
    
    // Probar acceso a Firestore
    await testFirestoreAccess(user);
    
    // Probar consultas específicas
    await testSpecificQueries(user);
    
    console.log('\n🏁 Verificación completada');
    
    if (!user) {
      console.log('\n💡 Recomendaciones:');
      console.log('   1. Asegúrate de estar autenticado en la aplicación web');
      console.log('   2. Verifica que el email esté verificado');
      console.log('   3. Revisa las reglas de seguridad de Firestore');
    }
    
  } catch (error) {
    console.error('💥 Error durante la verificación:', error);
  }
}

// Ejecutar la verificación
main();