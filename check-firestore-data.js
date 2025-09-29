// Script para verificar datos reales en Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBrJ_xfZeEVRXe0Fcw2XdDKVdCSRYHqaGA",
  authDomain: "diego-galmarini-oficial-web.firebaseapp.com",
  projectId: "diego-galmarini-oficial-web",
  storageBucket: "diego-galmarini-oficial-web.appspot.com",
  messagingSenderId: "668819276616",
  appId: "1:668819276616:web:5ca12fddfa9fd5fcc2697d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkFirestoreData() {
  try {
    console.log('🔍 Verificando datos en Firestore...');
    
    // Verificar colecciones principales
    const collections = ['appointments', 'consultations', 'users'];
    
    for (const collectionName of collections) {
      console.log(`\n📂 Verificando colección: ${collectionName}`);
      
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        console.log(`   📊 Total de documentos: ${snapshot.size}`);
        
        if (snapshot.size > 0) {
          console.log('   📋 Primeros 3 documentos:');
          let count = 0;
          snapshot.forEach((doc) => {
            if (count < 3) {
              console.log(`     - ID: ${doc.id}`);
              const data = doc.data();
              console.log(`       Campos: ${Object.keys(data).join(', ')}`);
              
              // Mostrar algunos campos importantes
              if (data.clientEmail) console.log(`       Cliente: ${data.clientEmail}`);
              if (data.selectedDate) console.log(`       Fecha: ${data.selectedDate}`);
              if (data.status) console.log(`       Estado: ${data.status}`);
              if (data.createdAt) console.log(`       Creado: ${data.createdAt}`);
              
              count++;
            }
          });
        } else {
          console.log('   ⚠️  No se encontraron documentos en esta colección');
        }
        
      } catch (error) {
        console.log(`   ❌ Error accediendo a ${collectionName}:`, error.message);
      }
    }
    
    // Verificar específicamente citas de tokenwatcherapp@gmail.com
    console.log('\n🎯 Verificando citas específicas de tokenwatcherapp@gmail.com...');
    
    try {
      const appointmentsRef = collection(db, 'appointments');
      const userQuery = query(
        appointmentsRef,
        where('clientEmail', '==', 'tokenwatcherapp@gmail.com')
      );
      
      const userSnapshot = await getDocs(userQuery);
      console.log(`   📊 Citas encontradas: ${userSnapshot.size}`);
      
      userSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   📅 Cita ID: ${doc.id}`);
        console.log(`      Fecha: ${data.selectedDate}`);
        console.log(`      Hora: ${data.selectedTime}`);
        console.log(`      Estado: ${data.status}`);
        console.log(`      Tipo: ${data.planType || 'No especificado'}`);
        console.log('      ---');
      });
      
    } catch (error) {
      console.log('   ❌ Error consultando citas específicas:', error.message);
    }
    
    // Verificar consultas también
    console.log('\n🎯 Verificando consultas específicas de tokenwatcherapp@gmail.com...');
    
    try {
      const consultationsRef = collection(db, 'consultations');
      const userConsultQuery = query(
        consultationsRef,
        where('clientEmail', '==', 'tokenwatcherapp@gmail.com')
      );
      
      const userConsultSnapshot = await getDocs(userConsultQuery);
      console.log(`   📊 Consultas encontradas: ${userConsultSnapshot.size}`);
      
      userConsultSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   💬 Consulta ID: ${doc.id}`);
        console.log(`      Asunto: ${data.subject || 'Sin asunto'}`);
        console.log(`      Estado: ${data.status || 'Sin estado'}`);
        console.log(`      Fecha: ${data.createdAt}`);
        console.log('      ---');
      });
      
    } catch (error) {
      console.log('   ❌ Error consultando consultas específicas:', error.message);
    }
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error general:', error);
    console.error('Código de error:', error.code);
    console.error('Mensaje:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n💡 Sugerencias para resolver el error de permisos:');
      console.log('   1. Verificar que las reglas de Firestore permitan lectura sin autenticación');
      console.log('   2. O implementar autenticación en este script');
      console.log('   3. Verificar que el proyecto de Firebase esté configurado correctamente');
    }
  }
}

// Ejecutar la verificación
checkFirestoreData();