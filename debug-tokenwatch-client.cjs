const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHGjmFQgkwvuBF8QNKvURKKRV5YdkJYdA",
  authDomain: "diegogalmarini-web.firebaseapp.com",
  projectId: "diegogalmarini-web",
  storageBucket: "diegogalmarini-web.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890abcdef"
};

async function debugTokenWatchClient() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('🔍 Investigando problema con tokenwatcherapp@gmail.com...\n');

    // Get all consultations
    const consultationsRef = collection(db, 'consultations');
    const allConsultationsSnapshot = await getDocs(consultationsRef);
    
    console.log(`📊 Total de consultas en la base de datos: ${allConsultationsSnapshot.size}\n`);

    // Filter consultations for tokenwatcherapp@gmail.com
    const tokenWatchConsultations = [];
    allConsultationsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email && data.email.toLowerCase() === 'tokenwatcherapp@gmail.com') {
        tokenWatchConsultations.push({
          id: doc.id,
          ...data
        });
      }
    });

    console.log(`🎯 Consultas de tokenwatcherapp@gmail.com encontradas: ${tokenWatchConsultations.length}\n`);

    if (tokenWatchConsultations.length > 0) {
      console.log('📋 Detalles de las consultas:');
      tokenWatchConsultations.forEach((consultation, index) => {
        console.log(`\n--- Consulta ${index + 1} ---`);
        console.log(`ID: ${consultation.id}`);
        console.log(`Email: ${consultation.email}`);
        console.log(`Nombre: ${consultation.name || 'No especificado'}`);
        console.log(`Estado: ${consultation.status || 'No especificado'}`);
        console.log(`Tipo de plan: ${consultation.planType || 'No especificado'}`);
        console.log(`Fecha de creación: ${consultation.createdAt ? new Date(consultation.createdAt.seconds * 1000).toLocaleString() : 'No especificada'}`);
        console.log(`Fecha de actualización: ${consultation.updatedAt ? new Date(consultation.updatedAt.seconds * 1000).toLocaleString() : 'No especificada'}`);
        console.log(`Mensaje de respuesta: ${consultation.responseMessage || 'No hay respuesta'}`);
        console.log(`Respondido en: ${consultation.respondedAt ? new Date(consultation.respondedAt.seconds * 1000).toLocaleString() : 'No respondido'}`);
        console.log(`Mensaje original: ${consultation.message ? consultation.message.substring(0, 100) + '...' : 'No especificado'}`);
      });
    } else {
      console.log('❌ No se encontraron consultas para tokenwatcherapp@gmail.com');
    }

    // Check for similar emails (case variations, typos)
    console.log('\n🔍 Buscando emails similares...');
    const similarEmails = [];
    allConsultationsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email && data.email.toLowerCase().includes('tokenwatch')) {
        similarEmails.push({
          id: doc.id,
          email: data.email,
          name: data.name,
          status: data.status
        });
      }
    });

    if (similarEmails.length > 0) {
      console.log(`📧 Emails similares encontrados: ${similarEmails.length}`);
      similarEmails.forEach((item, index) => {
        console.log(`${index + 1}. ${item.email} (${item.name || 'Sin nombre'}) - Estado: ${item.status || 'Sin estado'}`);
      });
    } else {
      console.log('❌ No se encontraron emails similares');
    }

    // Get unique clients from all consultations
    console.log('\n👥 Análisis de clientes únicos:');
    const uniqueClients = new Map();
    allConsultationsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email) {
        const email = data.email.toLowerCase();
        if (!uniqueClients.has(email)) {
          uniqueClients.set(email, {
            email: data.email,
            name: data.name,
            consultationsCount: 1,
            statuses: [data.status || 'unknown']
          });
        } else {
          const client = uniqueClients.get(email);
          client.consultationsCount++;
          if (!client.statuses.includes(data.status)) {
            client.statuses.push(data.status || 'unknown');
          }
        }
      }
    });

    console.log(`📊 Total de clientes únicos: ${uniqueClients.size}`);
    
    // Check if tokenwatcherapp@gmail.com is in the unique clients
    const tokenWatchClient = uniqueClients.get('tokenwatcherapp@gmail.com');
    if (tokenWatchClient) {
      console.log('✅ tokenwatcherapp@gmail.com SÍ está en la lista de clientes únicos:');
      console.log(`   - Nombre: ${tokenWatchClient.name || 'No especificado'}`);
      console.log(`   - Consultas: ${tokenWatchClient.consultationsCount}`);
      console.log(`   - Estados: ${tokenWatchClient.statuses.join(', ')}`);
    } else {
      console.log('❌ tokenwatcherapp@gmail.com NO está en la lista de clientes únicos');
    }

    console.log('\n📋 Lista completa de clientes:');
    Array.from(uniqueClients.values()).forEach((client, index) => {
      console.log(`${index + 1}. ${client.email} (${client.name || 'Sin nombre'}) - ${client.consultationsCount} consulta(s)`);
    });

  } catch (error) {
    console.error('❌ Error al investigar:', error);
  }
}

debugTokenWatchClient();