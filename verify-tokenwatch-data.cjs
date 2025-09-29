const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy } = require('firebase/firestore');

// Configuración de Firebase (usando la misma que en la aplicación)
const firebaseConfig = {
  apiKey: "AIzaSyBrJ_xfZeEVRXe0Fcw2XdDKVdCSRYHqaGA",
  authDomain: "diego-galmarini-oficial-web.firebaseapp.com",
  projectId: "diego-galmarini-oficial-web",
  storageBucket: "diego-galmarini-oficial-web.appspot.com",
  messagingSenderId: "668819276616",
  appId: "1:668819276616:web:5ca12fddfa9fd5fcc2697d"
};

async function verifyTokenWatchData() {
  try {
    console.log('🔍 Verificando datos de tokenwatcherapp@gmail.com...');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Obtener todas las consultas
    console.log('📊 Obteniendo todas las consultas...');
    const consultationsRef = collection(db, 'consultations');
    const allConsultationsQuery = query(consultationsRef, orderBy('createdAt', 'desc'));
    const allConsultationsSnapshot = await getDocs(allConsultationsQuery);
    
    console.log(`📈 Total de consultas encontradas: ${allConsultationsSnapshot.size}`);
    
    if (allConsultationsSnapshot.size === 0) {
      console.log('⚠️  No se encontraron consultas en la base de datos.');
      return;
    }

    // Buscar consultas específicas de tokenwatcherapp@gmail.com
    console.log('\n🎯 Buscando consultas de tokenwatcherapp@gmail.com...');
    const tokenWatchQuery = query(
      consultationsRef, 
      where('clientEmail', '==', 'tokenwatcherapp@gmail.com')
    );
    const tokenWatchSnapshot = await getDocs(tokenWatchQuery);
    
    console.log(`📋 Consultas de tokenwatcherapp@gmail.com: ${tokenWatchSnapshot.size}`);
    
    if (tokenWatchSnapshot.size > 0) {
      console.log('\n✅ Consultas encontradas:');
      tokenWatchSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n--- Consulta ${index + 1} ---`);
        console.log(`ID: ${doc.id}`);
        console.log(`Email: ${data.clientEmail}`);
        console.log(`Nombre: ${data.clientName || 'No especificado'}`);
        console.log(`Plan: ${data.selectedPlan || 'No especificado'}`);
        console.log(`Estado: ${data.status || 'No especificado'}`);
        console.log(`Fecha: ${data.selectedDate || 'No especificado'}`);
        console.log(`Descripción: ${data.problemDescription || 'No especificado'}`);
        console.log(`Creado: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : 'No especificado'}`);
      });
    } else {
      console.log('❌ No se encontraron consultas para tokenwatcherapp@gmail.com');
    }

    // Generar lista de clientes únicos (como lo hace la aplicación)
    console.log('\n👥 Generando lista de clientes únicos...');
    const clientsMap = new Map();
    
    allConsultationsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.clientEmail) {
        const email = data.clientEmail.toLowerCase();
        if (clientsMap.has(email)) {
          const existingClient = clientsMap.get(email);
          existingClient.totalConsultations++;
        } else {
          const newClient = {
            id: email,
            name: data.clientName || data.clientEmail,
            email: data.clientEmail,
            registrationDate: data.selectedDate || 'No especificado',
            totalConsultations: 1
          };
          clientsMap.set(email, newClient);
        }
      }
    });
    
    console.log(`📊 Total de clientes únicos: ${clientsMap.size}`);
    
    // Verificar si tokenwatcherapp@gmail.com está en la lista
    const tokenWatchClient = clientsMap.get('tokenwatcherapp@gmail.com');
    if (tokenWatchClient) {
      console.log('\n✅ tokenwatcherapp@gmail.com SÍ aparece como cliente:');
      console.log(`   - Nombre: ${tokenWatchClient.name}`);
      console.log(`   - Email: ${tokenWatchClient.email}`);
      console.log(`   - Consultas: ${tokenWatchClient.totalConsultations}`);
      console.log(`   - Registro: ${tokenWatchClient.registrationDate}`);
    } else {
      console.log('\n❌ tokenwatcherapp@gmail.com NO aparece como cliente');
    }
    
    // Mostrar todos los clientes
    console.log('\n📋 Lista completa de clientes:');
    if (clientsMap.size > 0) {
      Array.from(clientsMap.values()).forEach((client, index) => {
        console.log(`${index + 1}. ${client.email} (${client.name}) - ${client.totalConsultations} consulta(s)`);
      });
    } else {
      console.log('❌ No hay clientes registrados');
    }

  } catch (error) {
    console.error('❌ Error al verificar datos:', error);
    if (error.code) {
      console.error(`Código de error: ${error.code}`);
    }
    if (error.message) {
      console.error(`Mensaje: ${error.message}`);
    }
  }
}

verifyTokenWatchData();