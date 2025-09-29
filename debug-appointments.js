// Script para debuggear el problema de citas
// Este script simula el comportamiento de la aplicación web

console.log('🔍 Iniciando debug de citas...');

// Simular el comportamiento del navegador
const mockUser = {
  email: 'tokenwatcherapp@gmail.com',
  uid: 'mock-user-id',
  displayName: 'Test User'
};

console.log('👤 Usuario simulado:', mockUser);

// Simular la lógica de carga de citas del DashboardPage
const simulateAppointmentLoading = () => {
  console.log('\n📅 Simulando carga de citas...');
  
  // Datos de prueba que deberían existir
  const mockAppointments = [
    {
      id: 'test-1',
      clientEmail: 'tokenwatcherapp@gmail.com',
      clientName: 'Test User',
      selectedDate: '2025-08-25',
      selectedTime: '10:00',
      status: 'pending',
      planType: 'Consulta Estratégica 30 min',
      duration: 30,
      createdAt: new Date().toISOString()
    },
    {
      id: 'test-2', 
      clientEmail: 'tokenwatcherapp@gmail.com',
      clientName: 'Test User',
      selectedDate: '2025-08-26',
      selectedTime: '14:30',
      status: 'confirmed',
      planType: 'Consulta Estratégica 60 min',
      duration: 60,
      createdAt: new Date().toISOString()
    }
  ];
  
  console.log('📊 Citas simuladas encontradas:', mockAppointments.length);
  
  mockAppointments.forEach((appointment, index) => {
    console.log(`\n📅 Cita ${index + 1}:`);
    console.log(`   ID: ${appointment.id}`);
    console.log(`   Cliente: ${appointment.clientName} (${appointment.clientEmail})`);
    console.log(`   Fecha: ${appointment.selectedDate}`);
    console.log(`   Hora: ${appointment.selectedTime}`);
    console.log(`   Estado: ${appointment.status}`);
    console.log(`   Tipo: ${appointment.planType}`);
    console.log(`   Duración: ${appointment.duration} min`);
  });
  
  // Simular el filtrado por estado
  const pendingAppointments = mockAppointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = mockAppointments.filter(apt => apt.status === 'confirmed');
  const completedAppointments = mockAppointments.filter(apt => apt.status === 'completed');
  
  console.log('\n📈 Resumen por estado:');
  console.log(`   Pendientes: ${pendingAppointments.length}`);
  console.log(`   Confirmadas: ${confirmedAppointments.length}`);
  console.log(`   Completadas: ${completedAppointments.length}`);
  console.log(`   Total: ${mockAppointments.length}`);
  
  return mockAppointments;
};

// Simular la función toDisplayDate
const toDisplayDate = (dateValue) => {
  console.log(`\n🔄 Convirtiendo fecha: ${dateValue} (tipo: ${typeof dateValue})`);
  
  let date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  } else if (dateValue && typeof dateValue.toDate === 'function') {
    // Firestore Timestamp
    date = dateValue.toDate();
  } else {
    console.log('❌ Tipo de fecha no reconocido');
    return 'Invalid Date';
  }
  
  if (isNaN(date.getTime())) {
    console.log('❌ Fecha inválida');
    return 'Invalid Date';
  }
  
  const formatted = date.toISOString().split('T')[0]; // YYYY-MM-DD
  console.log(`✅ Fecha formateada: ${formatted}`);
  return formatted;
};

// Ejecutar simulaciones
const appointments = simulateAppointmentLoading();

console.log('\n🧪 Probando conversión de fechas...');
appointments.forEach(apt => {
  const displayDate = toDisplayDate(apt.selectedDate);
  console.log(`Cita ${apt.id}: ${apt.selectedDate} → ${displayDate}`);
});

console.log('\n✅ Debug completado');
console.log('\n💡 Posibles problemas a verificar:');
console.log('   1. ¿Está el usuario autenticado correctamente?');
console.log('   2. ¿Las reglas de Firestore permiten el acceso?');
console.log('   3. ¿Los datos existen en la base de datos?');
console.log('   4. ¿La consulta de Firestore es correcta?');
console.log('   5. ¿Hay errores en la conversión de fechas?');