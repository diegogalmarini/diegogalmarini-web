// Script para verificar específicamente el flujo de datos en BookingModal
// Sin autenticación, solo verificando la lógica de selectedDate y selectedTime

// Función toLocalYYYYMMDD (copiada exactamente del BookingModal)
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

// Simular exactamente cómo se crean las fechas en el calendario del BookingModal
const simulateCalendarDateCreation = () => {
  console.log('\n📅 SIMULANDO CREACIÓN DE FECHAS EN EL CALENDARIO');
  console.log('='.repeat(50));
  
  // Simular el bucle del calendario (líneas 437-459 del BookingModal)
  const year = 2024;
  const month = 11; // Diciembre (0-indexed como en el código real)
  
  console.log('\n🔄 Simulando bucle del calendario:');
  console.log('   for (let day = 1; day <= daysInMonth; day++) {');
  console.log('       const date = new Date(year, month, day);');
  console.log('       ...');
  console.log('       onClick={() => setSelectedDate(date)}');
  console.log('   }');
  
  // Simular clicks en diferentes días
  const testDays = [15, 20, 25];
  const results = [];
  
  testDays.forEach(day => {
    console.log(`\n   📅 Simulando click en día ${day}:`);
    
    // Crear fecha exactamente como en el código del calendario
    const date = new Date(year, month, day);
    
    console.log('      new Date(year, month, day) =', date.toString());
    console.log('      date instanceof Date:', date instanceof Date);
    console.log('      !isNaN(date.getTime()):', !isNaN(date.getTime()));
    
    // Simular setSelectedDate(date)
    const selectedDate = date;
    
    // Verificar conversión
    const convertedDate = selectedDate ? toLocalYYYYMMDD(selectedDate) : null;
    
    results.push({
      day,
      originalDate: date,
      selectedDate,
      convertedDate,
      isValid: convertedDate !== null && convertedDate !== undefined
    });
    
    console.log('      Resultado conversión:', convertedDate);
    console.log('      Es válido:', convertedDate !== null && convertedDate !== undefined);
  });
  
  return results;
};

// Simular exactamente cómo se crean las horas en el selector de tiempo
const simulateTimeSlotCreation = () => {
  console.log('\n⏰ SIMULANDO CREACIÓN DE HORARIOS');
  console.log('='.repeat(50));
  
  // Simular el bucle de horarios (líneas 480-520 del BookingModal)
  const selectedPlan = '30min';
  const interval = selectedPlan === '60min' ? 60 : 30;
  
  console.log('\n🔄 Simulando bucle de horarios:');
  console.log('   const interval = selectedPlan === "60min" ? 60 : 30;');
  console.log('   for (let hour = 9; hour < 16; hour++) {');
  console.log('       for (let minute = 0; minute < 60; minute += interval) {');
  console.log('           const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`');
  console.log('           ...');
  console.log('           onClick={() => setSelectedTime(time)}');
  console.log('       }');
  console.log('   }');
  
  const testTimes = [];
  const results = [];
  
  // Generar algunos horarios de prueba
  for (let hour = 9; hour < 12; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      testTimes.push(time);
      if (testTimes.length >= 5) break; // Solo probar 5 horarios
    }
    if (testTimes.length >= 5) break;
  }
  
  testTimes.forEach(time => {
    console.log(`\n   ⏰ Simulando click en horario ${time}:`);
    
    // Simular setSelectedTime(time)
    const selectedTime = time;
    
    console.log('      selectedTime =', selectedTime);
    console.log('      typeof selectedTime:', typeof selectedTime);
    console.log('      selectedTime.length > 0:', selectedTime.length > 0);
    
    results.push({
      time,
      selectedTime,
      isValid: typeof selectedTime === 'string' && selectedTime.length > 0
    });
    
    console.log('      Es válido:', typeof selectedTime === 'string' && selectedTime.length > 0);
  });
  
  return results;
};

// Simular el flujo completo de datos
const testCompleteDataFlow = () => {
  console.log('\n🔄 SIMULANDO FLUJO COMPLETO DE DATOS');
  console.log('='.repeat(50));
  
  // Simular selección de fecha
  console.log('\n1️⃣ Usuario selecciona fecha del calendario:');
  const year = 2024;
  const month = 11; // Diciembre
  const day = 20;
  const selectedDate = new Date(year, month, day);
  
  console.log('   selectedDate =', selectedDate.toString());
  
  // Simular selección de hora
  console.log('\n2️⃣ Usuario selecciona hora:');
  const selectedTime = '10:30';
  
  console.log('   selectedTime =', selectedTime);
  
  // Simular otros datos
  const selectedPlan = '30min';
  const problemDescription = 'Consulta de prueba';
  
  console.log('\n3️⃣ Otros datos del formulario:');
  console.log('   selectedPlan =', selectedPlan);
  console.log('   problemDescription =', problemDescription);
  
  // Simular handleConfirmAndSubmit (sin Firebase)
  console.log('\n4️⃣ Simulando handleConfirmAndSubmit:');
  
  // Verificar valores antes de conversión
  console.log('\n   📋 Valores antes de conversión:');
  console.log('      selectedDate:', selectedDate);
  console.log('      selectedTime:', selectedTime);
  console.log('      selectedDate es null/undefined:', selectedDate === null || selectedDate === undefined);
  console.log('      selectedTime es null/undefined:', selectedTime === null || selectedTime === undefined);
  
  // Conversión de fecha (línea 284 del BookingModal)
  const convertedDate = selectedDate ? toLocalYYYYMMDD(selectedDate) : null;
  
  console.log('\n   🔄 Conversión de fecha:');
  console.log('      selectedDate ? toLocalYYYYMMDD(selectedDate) : null');
  console.log('      Resultado:', convertedDate);
  
  // Crear datos del appointment (líneas 290-302 del BookingModal)
  const appointmentData = {
    clientEmail: 'test@example.com',
    clientName: 'Usuario de Prueba',
    planType: selectedPlan,
    topic: problemDescription,
    selectedDate: convertedDate, // Esta es la línea crítica
    selectedTime: selectedTime,   // Esta es la línea crítica
    duration: selectedPlan === '30min' ? 30 : 60,
    status: 'pending_payment',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  console.log('\n   📋 Datos finales del appointment:');
  console.log(JSON.stringify(appointmentData, null, 2));
  
  // Verificación final
  console.log('\n   🔍 Verificación final:');
  console.log('      appointmentData.selectedDate:', appointmentData.selectedDate);
  console.log('      appointmentData.selectedTime:', appointmentData.selectedTime);
  console.log('      selectedDate es undefined:', appointmentData.selectedDate === undefined);
  console.log('      selectedTime es undefined:', appointmentData.selectedTime === undefined);
  
  const isValid = (
    appointmentData.selectedDate !== null && 
    appointmentData.selectedDate !== undefined &&
    appointmentData.selectedTime !== null && 
    appointmentData.selectedTime !== undefined
  );
  
  console.log('      Datos son válidos:', isValid);
  
  return {
    selectedDate,
    selectedTime,
    convertedDate,
    appointmentData,
    isValid
  };
};

// Ejecutar todas las pruebas
console.log('🧪 INICIANDO PRUEBAS DE FLUJO DE DATOS DEL BOOKING MODAL');
console.log('='.repeat(70));

// Prueba 1: Creación de fechas del calendario
const dateResults = simulateCalendarDateCreation();

// Prueba 2: Creación de horarios
const timeResults = simulateTimeSlotCreation();

// Prueba 3: Flujo completo
const flowResult = testCompleteDataFlow();

// Resumen final
console.log('\n📊 RESUMEN DE RESULTADOS');
console.log('='.repeat(50));

console.log('\n📅 Fechas del calendario:');
dateResults.forEach(result => {
  console.log(`   Día ${result.day}: ${result.isValid ? '✅' : '❌'} (${result.convertedDate})`);
});

console.log('\n⏰ Horarios:');
timeResults.forEach(result => {
  console.log(`   ${result.time}: ${result.isValid ? '✅' : '❌'}`);
});

console.log('\n🔄 Flujo completo:');
console.log(`   Datos válidos: ${flowResult.isValid ? '✅' : '❌'}`);
console.log(`   selectedDate: ${flowResult.convertedDate}`);
console.log(`   selectedTime: ${flowResult.selectedTime}`);

if (flowResult.isValid) {
  console.log('\n🎉 CONCLUSIÓN: La lógica de datos funciona correctamente');
  console.log('   ✅ selectedDate se convierte correctamente');
  console.log('   ✅ selectedTime se mantiene correctamente');
  console.log('   ✅ Los datos llegan válidos a handleConfirmAndSubmit');
  console.log('\n💡 El problema debe estar en:');
  console.log('   - La interfaz de usuario no está llamando correctamente a setSelectedDate/setSelectedTime');
  console.log('   - Hay algún reseteo de estado no deseado');
  console.log('   - Los event handlers no se están ejecutando');
  console.log('   - Hay algún problema de timing/async');
} else {
  console.log('\n❌ CONCLUSIÓN: Hay problemas en la lógica de datos');
  console.log('   Revisar la conversión de fechas y el manejo de estados');
}

console.log('\n🔍 PRÓXIMOS PASOS RECOMENDADOS:');
console.log('   1. Verificar que los event handlers onClick se ejecuten correctamente');
console.log('   2. Añadir console.log en setSelectedDate y setSelectedTime');
console.log('   3. Verificar que no hay reseteos de estado no deseados');
console.log('   4. Probar el flujo real en el navegador con herramientas de desarrollo');