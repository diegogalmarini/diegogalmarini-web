const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Configuración de Firebase (usando la configuración real del proyecto)
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
const auth = getAuth(app);

// Función auxiliar para convertir Date a formato YYYY-MM-DD (igual que en BookingModal)
const toLocalYYYYMMDD = (d) => {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Simular el estado del BookingModal
const simulateBookingModalState = () => {
  console.log('\n=== SIMULANDO ESTADO DEL BOOKING MODAL ===');
  
  // Simular selectedDate como Date object (como se establece en el modal)
  const selectedDate = new Date();
  selectedDate.setDate(selectedDate.getDate() + 1); // Mañana
  selectedDate.setHours(0, 0, 0, 0); // Resetear horas
  
  // Simular selectedTime como string (como se establece en el modal)
  const selectedTime = '10:00';
  
  // Simular otros datos del modal
  const selectedPlan = '30min';
  const problemDescription = 'Consulta de prueba para verificar el flujo de datos';
  
  console.log('📋 Estado simulado del BookingModal:');
  console.log('   selectedDate (objeto Date):', selectedDate);
  console.log('   selectedDate.toString():', selectedDate.toString());
  console.log('   selectedTime (string):', selectedTime);
  console.log('   selectedPlan:', selectedPlan);
  console.log('   problemDescription:', problemDescription);
  
  // Simular la conversión que hace handleConfirmAndSubmit
  const convertedDate = selectedDate ? toLocalYYYYMMDD(selectedDate) : null;
  
  console.log('\n🔄 Conversión de fecha (como en handleConfirmAndSubmit):');
  console.log('   selectedDate ? toLocalYYYYMMDD(selectedDate) : null');
  console.log('   Resultado:', convertedDate);
  
  // Verificar si los valores son válidos
  console.log('\n✅ Verificación de valores:');
  console.log('   selectedDate es válido:', selectedDate instanceof Date && !isNaN(selectedDate.getTime()));
  console.log('   selectedTime es válido:', typeof selectedTime === 'string' && selectedTime.length > 0);
  console.log('   convertedDate es válido:', typeof convertedDate === 'string' && convertedDate.length > 0);
  
  return {
    selectedDate,
    selectedTime,
    convertedDate,
    selectedPlan,
    problemDescription
  };
};

// Simular handleConfirmAndSubmit con datos reales
const simulateHandleConfirmAndSubmit = async (mockData) => {
  console.log('\n=== SIMULANDO handleConfirmAndSubmit ===');
  
  try {
    // Autenticar usuario de prueba
    console.log('🔐 Autenticando usuario de prueba...');
    const userCredential = await signInWithEmailAndPassword(auth, 'test@diegogalmarini.com', 'test123');
    const user = userCredential.user;
    console.log('✅ Usuario autenticado:', user.email);
    
    // Simular los datos que se enviarían a Firestore
    const appointmentData = {
      clientEmail: user.email || '',
      clientName: user.displayName || user.email || '',
      planType: mockData.selectedPlan,
      topic: mockData.problemDescription,
      selectedDate: mockData.convertedDate, // Usar la fecha convertida
      selectedTime: mockData.selectedTime,
      duration: mockData.selectedPlan === '30min' ? 30 : 60,
      status: 'pending_payment',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('\n📋 Datos que se enviarían a Firestore:');
    console.log(JSON.stringify(appointmentData, null, 2));
    
    // Verificar que los campos críticos no sean undefined
    console.log('\n🔍 Verificación de campos críticos:');
    console.log('   selectedDate:', appointmentData.selectedDate, '(tipo:', typeof appointmentData.selectedDate, ')');
    console.log('   selectedTime:', appointmentData.selectedTime, '(tipo:', typeof appointmentData.selectedTime, ')');
    
    if (appointmentData.selectedDate === null || appointmentData.selectedDate === undefined) {
      console.log('❌ ERROR: selectedDate es null o undefined');
      return false;
    }
    
    if (appointmentData.selectedTime === null || appointmentData.selectedTime === undefined) {
      console.log('❌ ERROR: selectedTime es null o undefined');
      return false;
    }
    
    // Intentar guardar en Firestore
    console.log('\n💾 Guardando en Firestore...');
    const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
    console.log('✅ Cita guardada exitosamente con ID:', docRef.id);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error en simulateHandleConfirmAndSubmit:', error);
    return false;
  }
};

// Función principal
const runTest = async () => {
  console.log('🧪 INICIANDO PRUEBA DE ESTADO DEL BOOKING MODAL');
  console.log('=' .repeat(60));
  
  try {
    // Simular el estado del modal
    const mockData = simulateBookingModalState();
    
    // Simular el envío de datos
    const success = await simulateHandleConfirmAndSubmit(mockData);
    
    console.log('\n' + '='.repeat(60));
    if (success) {
      console.log('✅ PRUEBA EXITOSA: Los datos se procesaron correctamente');
      console.log('💡 El problema NO está en la lógica de conversión de fechas');
    } else {
      console.log('❌ PRUEBA FALLIDA: Hay un problema en el procesamiento de datos');
    }
    
  } catch (error) {
    console.error('❌ Error general en la prueba:', error);
  }
  
  process.exit(0);
};

// Ejecutar la prueba
runTest();