// Script para probar la funcionalidad de citas
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';

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

async function testAppointmentFunctionality() {
  try {
    console.log('🔍 Probando funcionalidad de citas...');
    
    // 1. Verificar conexión a Firestore
    console.log('\n1. Verificando conexión a Firestore...');
    const appointmentsRef = collection(db, 'appointments');
    const appointmentsSnapshot = await getDocs(appointmentsRef);
    console.log(`✅ Conexión exitosa. Total de citas: ${appointmentsSnapshot.size}`);
    
    // 2. Listar todas las citas
    console.log('\n2. Listando todas las citas:');
    appointmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📅 ID: ${doc.id}`);
      console.log(`   Cliente: ${data.clientName} (${data.clientEmail})`);
      console.log(`   Fecha: ${data.selectedDate}`);
      console.log(`   Hora: ${data.selectedTime}`);
      console.log(`   Estado: ${data.status}`);
      console.log(`   Duración: ${data.duration} min`);
      console.log('   ---');
    });
    
    // 3. Verificar citas de un cliente específico
    console.log('\n3. Verificando citas de tokenwatcherapp@gmail.com...');
    const userAppointmentsQuery = query(
      appointmentsRef,
      where('clientEmail', '==', 'tokenwatcherapp@gmail.com'),
      orderBy('selectedDate', 'desc')
    );
    
    const userAppointmentsSnapshot = await getDocs(userAppointmentsQuery);
    console.log(`📊 Citas encontradas para tokenwatcherapp@gmail.com: ${userAppointmentsSnapshot.size}`);
    
    userAppointmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📅 Cita ID: ${doc.id}`);
      console.log(`   Fecha: ${data.selectedDate}`);
      console.log(`   Hora: ${data.selectedTime}`);
      console.log(`   Estado: ${data.status}`);
      console.log(`   Tipo: ${data.planType}`);
      console.log('   ---');
    });
    
    // 4. Verificar estructura de datos
    console.log('\n4. Verificando estructura de datos...');
    if (appointmentsSnapshot.size > 0) {
      const firstDoc = appointmentsSnapshot.docs[0];
      const data = firstDoc.data();
      
      console.log('📋 Campos disponibles en la primera cita:');
      Object.keys(data).forEach(key => {
        console.log(`   - ${key}: ${typeof data[key]} = ${data[key]}`);
      });
      
      // Verificar campos críticos
      const requiredFields = ['clientEmail', 'clientName', 'selectedDate', 'selectedTime', 'status'];
      const missingFields = requiredFields.filter(field => !data.hasOwnProperty(field));
      
      if (missingFields.length > 0) {
        console.log(`❌ Campos faltantes: ${missingFields.join(', ')}`);
      } else {
        console.log('✅ Todos los campos requeridos están presentes');
      }
    }
    
    console.log('\n✅ Prueba de funcionalidad completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    console.error('Detalles del error:', error.message);
  }
}

// Ejecutar la prueba
testAppointmentFunctionality();