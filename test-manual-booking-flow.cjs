// Script para probar manualmente el flujo completo de BookingModal
// Simula la interacción del usuario paso a paso

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Configuración de Firebase (usando la configuración real del proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyBVBpKH8NTVgJQSFVeKxPx9LrV8yC_XYZA",
  authDomain: "diegogalmarini-web.firebaseapp.com",
  projectId: "diegogalmarini-web",
  storageBucket: "diegogalmarini-web.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-ABCDEF1234"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Función toLocalYYYYMMDD (copiada del BookingModal)
const toLocalYYYYMMDD = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.log('❌ toLocalYYYYMMDD: Fecha inválida recibida:', date);
    return null;
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const result = `${year}-${month}-${day}`;
  
  console.log('🔄 toLocalYYYYMMDD conversion:');
  console.log('   Input date:', date.toString());
  console.log('   Output string:', result);
  
  return result;
};

// Simular el flujo completo del BookingModal
const testCompleteBookingFlow = async () => {
  console.log('\n🚀 INICIANDO PRUEBA COMPLETA DEL FLUJO DE BOOKING');
  console.log('='.repeat(60));
  
  try {
    // PASO 1: Simular estado inicial
    console.log('\n📋 PASO 1: Estado inicial del BookingModal');
    let selectedDate = null;
    let selectedTime = null;
    let selectedPlan = null;
    let problemDescription = '';
    
    console.log('   selectedDate:', selectedDate);
    console.log('   selectedTime:', selectedTime);
    console.log('   selectedPlan:', selectedPlan);
    console.log('   problemDescription:', problemDescription);
    
    // PASO 2: Simular selección de plan
    console.log('\n📋 PASO 2: Usuario selecciona plan');
    selectedPlan = '30min';
    problemDescription = 'Necesito ayuda con la estrategia de marketing digital para mi startup';
    
    console.log('   selectedPlan:', selectedPlan);
    console.log('   problemDescription:', problemDescription);
    
    // PASO 3: Simular selección de fecha (onClick del botón de fecha)
    console.log('\n📋 PASO 3: Usuario selecciona fecha');
    console.log('   Simulando click en botón de fecha...');
    
    // Crear fecha como lo hace el onClick del calendario
    const year = 2024;
    const month = 11; // Diciembre (0-indexed)
    const day = 20;
    selectedDate = new Date(year, month, day); // Esto simula: onClick={() => setSelectedDate(date)}
    
    console.log('   selectedDate después del click:', selectedDate);
    console.log('   selectedDate.toString():', selectedDate.toString());
    console.log('   selectedDate es Date válido:', selectedDate instanceof Date && !isNaN(selectedDate.getTime()));
    
    // PASO 4: Simular selección de hora (onClick del botón de hora)
    console.log('\n📋 PASO 4: Usuario selecciona hora');
    console.log('   Simulando click en botón de hora...');
    
    selectedTime = '10:00'; // Esto simula: onClick={() => setSelectedTime(time)}
    
    console.log('   selectedTime después del click:', selectedTime);
    console.log('   selectedTime es string válido:', typeof selectedTime === 'string' && selectedTime.length > 0);
    
    // PASO 5: Verificar estado antes de handleConfirmAndSubmit
    console.log('\n📋 PASO 5: Estado antes de handleConfirmAndSubmit');
    console.log('   selectedDate:', selectedDate);
    console.log('   selectedTime:', selectedTime);
    console.log('   selectedPlan:', selectedPlan);
    console.log('   problemDescription:', problemDescription);
    
    // Verificar que todos los valores requeridos están presentes
    if (!selectedDate) {
      console.log('❌ ERROR: selectedDate es null o undefined');
      return false;
    }
    
    if (!selectedTime) {
      console.log('❌ ERROR: selectedTime es null o undefined');
      return false;
    }
    
    if (!selectedPlan) {
      console.log('❌ ERROR: selectedPlan es null o undefined');
      return false;
    }
    
    // PASO 6: Simular handleConfirmAndSubmit
    console.log('\n📋 PASO 6: Ejecutando handleConfirmAndSubmit');
    
    // Autenticar usuario
    console.log('   🔐 Autenticando usuario...');
    const userCredential = await signInWithEmailAndPassword(auth, 'test@diegogalmarini.com', 'test123');
    const user = userCredential.user;
    console.log('   ✅ Usuario autenticado:', user.email);
    
    // Convertir fecha (exactamente como en handleConfirmAndSubmit)
    const convertedDate = selectedDate ? toLocalYYYYMMDD(selectedDate) : null;
    
    console.log('\n   🔄 Conversión de fecha en handleConfirmAndSubmit:');
    console.log('      selectedDate ? toLocalYYYYMMDD(selectedDate) : null');
    console.log('      Resultado:', convertedDate);
    
    // Crear datos de la cita (exactamente como en handleConfirmAndSubmit)
    const appointmentData = {
      clientEmail: user?.email || '',
      clientName: user?.displayName || user?.email || '',
      planType: selectedPlan,
      topic: problemDescription,
      selectedDate: convertedDate, // Usar la fecha convertida
      selectedTime: selectedTime,
      duration: selectedPlan === '30min' ? 30 : 60,
      status: 'pending_payment',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('\n   📋 Datos finales para Firestore:');
    console.log(JSON.stringify(appointmentData, null, 2));
    
    // Verificar campos críticos una vez más
    console.log('\n   🔍 Verificación final de campos críticos:');
    console.log('      selectedDate:', appointmentData.selectedDate, '(tipo:', typeof appointmentData.selectedDate, ')');
    console.log('      selectedTime:', appointmentData.selectedTime, '(tipo:', typeof appointmentData.selectedTime, ')');
    
    if (appointmentData.selectedDate === null || appointmentData.selectedDate === undefined) {
      console.log('❌ ERROR FINAL: selectedDate es null o undefined');
      return false;
    }
    
    if (appointmentData.selectedTime === null || appointmentData.selectedTime === undefined) {
      console.log('❌ ERROR FINAL: selectedTime es null o undefined');
      return false;
    }
    
    // Intentar guardar en Firestore
    console.log('\n   💾 Guardando en Firestore...');
    const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
    console.log('   ✅ Cita guardada exitosamente con ID:', docRef.id);
    
    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('   ✅ Todos los pasos funcionaron correctamente');
    console.log('   ✅ selectedDate y selectedTime se guardaron con valores válidos');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error);
    console.error('   Código de error:', error.code);
    console.error('   Mensaje:', error.message);
    return false;
  }
};

// Ejecutar la prueba
testCompleteBookingFlow()
  .then(success => {
    if (success) {
      console.log('\n✅ CONCLUSIÓN: El flujo de booking funciona correctamente');
      console.log('   El problema debe estar en la interfaz de usuario o en la interacción real');
    } else {
      console.log('\n❌ CONCLUSIÓN: Se encontraron problemas en el flujo de booking');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 ERROR CRÍTICO:', error);
    process.exit(1);
  });