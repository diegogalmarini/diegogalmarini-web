// Script para crear un usuario de prueba en Firebase Auth
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

console.log('👤 Creando usuario de prueba en Firebase Auth...');

// Función para crear usuario de prueba
async function createTestUser() {
  const testEmail = 'test@diegogalmarini.com';
  const testPassword = 'TestPassword123!';
  
  try {
    console.log(`📧 Creando usuario: ${testEmail}`);
    
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    
    console.log('✅ Usuario creado exitosamente:');
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🆔 UID: ${user.uid}`);
    console.log(`   🔑 Contraseña: ${testPassword}`);
    
    // Crear documento de usuario en Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      uid: user.uid,
      createdAt: new Date(),
      role: 'user',
      displayName: 'Usuario de Prueba'
    });
    
    console.log('✅ Documento de usuario creado en Firestore');
    
    return { email: testEmail, password: testPassword, user };
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  El usuario ya existe, intentando autenticar...');
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
        console.log('✅ Autenticación exitosa con usuario existente');
        return { email: testEmail, password: testPassword, user: userCredential.user };
      } catch (signInError) {
        console.error('❌ Error al autenticar usuario existente:', signInError.message);
        console.log('💡 Prueba con una contraseña diferente o usa el script de reset de contraseña');
        return null;
      }
    } else {
      console.error('❌ Error al crear usuario:', error.message);
      return null;
    }
  }
}

// Función para crear datos de prueba
async function createTestData(user) {
  if (!user) {
    console.log('⚠️  No se puede crear datos de prueba sin usuario');
    return;
  }
  
  console.log('\n📊 Creando datos de prueba...');
  
  try {
    // Crear consulta de prueba
    const consultationData = {
      clientEmail: user.email,
      clientName: 'Usuario de Prueba',
      subject: 'Consulta de prueba',
      message: 'Esta es una consulta de prueba para verificar el sistema',
      selectedPlan: 'Consulta gratuita',
      status: 'pendiente',
      createdAt: new Date(),
      selectedDate: new Date().toISOString().split('T')[0],
      selectedTime: '10:00'
    };
    
    const consultationRef = doc(db, 'consultations', `test-consultation-${Date.now()}`);
    await setDoc(consultationRef, consultationData);
    
    console.log('✅ Consulta de prueba creada');
    
    // Crear cita de prueba
    const appointmentData = {
      clientEmail: user.email,
      clientName: 'Usuario de Prueba',
      planType: '30min',
      status: 'pendiente de pago',
      createdAt: new Date(),
      selectedDate: new Date().toISOString().split('T')[0],
      selectedTime: '14:00',
      price: 150,
      duration: 30,
      topic: 'Cita de prueba para verificar el sistema'
    };
    
    const appointmentRef = doc(db, 'appointments', `test-appointment-${Date.now()}`);
    await setDoc(appointmentRef, appointmentData);
    
    console.log('✅ Cita de prueba creada');
    
  } catch (error) {
    console.error('❌ Error al crear datos de prueba:', error.message);
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando creación de usuario de prueba...');
    
    const result = await createTestUser();
    
    if (result) {
      await createTestData(result.user);
      
      console.log('\n🎉 Usuario de prueba creado exitosamente!');
      console.log('\n📋 Credenciales para pruebas:');
      console.log(`   📧 Email: ${result.email}`);
      console.log(`   🔑 Contraseña: ${result.password}`);
      console.log('\n💡 Ahora puedes:');
      console.log('   1. Usar estas credenciales en la aplicación web');
      console.log('   2. Ejecutar el script de prueba de autenticación');
      console.log('   3. Probar el dashboard con datos reales');
      
    } else {
      console.log('\n❌ No se pudo crear el usuario de prueba');
    }
    
  } catch (error) {
    console.error('💥 Error durante la creación del usuario:', error);
  }
}

// Ejecutar la creación
main();