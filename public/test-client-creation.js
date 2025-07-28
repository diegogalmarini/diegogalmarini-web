// Script de diagnóstico para el CRM
console.log('🔧 Script de diagnóstico del CRM cargado');

// Función para verificar Firebase
window.testFirebase = async function() {
  try {
    console.log('🔥 Verificando Firebase...');
    const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
    const { getFirestore, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
    
    console.log('✅ Firebase SDK cargado correctamente');
    console.log('📱 Apps inicializadas:', getApps().length);
    return true;
  } catch (error) {
    console.error('❌ Error con Firebase:', error);
    return false;
  }
};

// Función para crear cliente directamente
window.createTestClient = async function() {
  try {
    console.log('👤 Creando cliente de prueba...');
    
    // Importar Firebase directamente
    const { getFirestore, collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
    const { getApps } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
    
    if (getApps().length === 0) {
      console.error('❌ Firebase no está inicializado');
      return null;
    }
    
    const db = getFirestore();
    const clientData = {
      name: `Cliente Prueba ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      phone: '+1234567890',
      company: 'Empresa Test',
      status: 'active',
      notes: 'Cliente creado para diagnóstico',
      registrationDate: serverTimestamp(),
      totalConsultations: 0,
      totalAppointments: 0
    };
    
    const docRef = await addDoc(collection(db, 'clients'), clientData);
    console.log('✅ Cliente creado con ID:', docRef.id);
    
    return { id: docRef.id, ...clientData };
  } catch (error) {
    console.error('❌ Error creando cliente:', error);
    return null;
  }
};

// Función para listar clientes
window.listClients = async function() {
  try {
    console.log('📋 Obteniendo clientes...');
    
    const { getFirestore, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
    const { getApps } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
    
    if (getApps().length === 0) {
      console.error('❌ Firebase no está inicializado');
      return [];
    }
    
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, 'clients'));
    
    const clients = [];
    querySnapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`📊 Total de clientes: ${clients.length}`);
    console.table(clients);
    
    return clients;
  } catch (error) {
    console.error('❌ Error obteniendo clientes:', error);
    return [];
  }
};

// Función para verificar el estado del hook useClients
window.checkCRMState = function() {
  try {
    console.log('🔍 Verificando estado del CRM...');
    
    // Buscar el componente CRM en el DOM
    const crmElement = document.querySelector('[data-testid="crm-dashboard"]') || 
                      document.querySelector('.crm-dashboard') ||
                      document.querySelector('#crm-dashboard');
    
    if (crmElement) {
      console.log('✅ Componente CRM encontrado en el DOM');
    } else {
      console.log('⚠️ Componente CRM no encontrado en el DOM');
    }
    
    // Verificar si React DevTools está disponible
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('✅ React DevTools disponible');
    } else {
      console.log('⚠️ React DevTools no disponible');
    }
    
    return { crmElement: !!crmElement, reactDevTools: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__ };
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
    return null;
  }
};

console.log('🚀 Funciones de diagnóstico disponibles:');
console.log('- testFirebase(): Verificar conexión Firebase');
console.log('- createTestClient(): Crear cliente de prueba');
console.log('- listClients(): Listar todos los clientes');
console.log('- checkCRMState(): Verificar estado del CRM');
console.log('\n💡 Ejecuta estas funciones en orden para diagnosticar el problema');