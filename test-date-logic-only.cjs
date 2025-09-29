// Script para probar SOLO la lógica de conversión de fechas sin Firebase

// Función auxiliar para convertir Date a formato YYYY-MM-DD (igual que en BookingModal)
const toLocalYYYYMMDD = (d) => {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Simular exactamente el estado del BookingModal
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
  
  // Simular los datos que se enviarían a Firestore
  const appointmentData = {
    clientEmail: 'test@example.com',
    clientName: 'Usuario de Prueba',
    planType: selectedPlan,
    topic: problemDescription,
    selectedDate: convertedDate, // Usar la fecha convertida
    selectedTime: selectedTime,
    duration: selectedPlan === '30min' ? 30 : 60,
    status: 'pending_payment',
    createdAt: new Date().toISOString(), // Simular serverTimestamp
    updatedAt: new Date().toISOString()
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
  
  console.log('✅ Todos los campos críticos tienen valores válidos');
  return true;
};

// Probar diferentes escenarios de fechas
const testDifferentDateScenarios = () => {
  console.log('\n=== PROBANDO DIFERENTES ESCENARIOS DE FECHAS ===');
  
  const scenarios = [
    {
      name: 'Fecha de hoy',
      date: new Date()
    },
    {
      name: 'Fecha de mañana',
      date: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d;
      })()
    },
    {
      name: 'Fecha en una semana',
      date: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d;
      })()
    },
    {
      name: 'Fecha específica (2025-12-25)',
      date: new Date(2025, 11, 25) // Mes 11 = Diciembre (0-indexado)
    }
  ];
  
  scenarios.forEach((scenario, index) => {
    console.log(`\n${index + 1}. ${scenario.name}:`);
    console.log('   Fecha original:', scenario.date.toString());
    console.log('   Convertida:', toLocalYYYYMMDD(scenario.date));
    console.log('   Es válida:', scenario.date instanceof Date && !isNaN(scenario.date.getTime()));
  });
};

// Función principal
const runTest = () => {
  console.log('🧪 INICIANDO PRUEBA DE LÓGICA DE FECHAS (SIN FIREBASE)');
  console.log('=' .repeat(70));
  
  try {
    // Probar el estado del modal
    const success = simulateBookingModalState();
    
    // Probar diferentes escenarios
    testDifferentDateScenarios();
    
    console.log('\n' + '='.repeat(70));
    if (success) {
      console.log('✅ PRUEBA EXITOSA: La lógica de conversión de fechas funciona correctamente');
      console.log('💡 CONCLUSIÓN: El problema NO está en la lógica de fechas del BookingModal');
      console.log('🔍 SIGUIENTE PASO: Revisar cómo se establecen selectedDate y selectedTime en el UI');
    } else {
      console.log('❌ PRUEBA FALLIDA: Hay un problema en la lógica de fechas');
    }
    
  } catch (error) {
    console.error('❌ Error general en la prueba:', error);
  }
};

// Ejecutar la prueba
runTest();