// Test script para verificar el sistema de emails con SendGrid
// Este script prueba las Cloud Functions desplegadas

const admin = require('firebase-admin');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  initializeApp();
}

const db = getFirestore();

// Función para crear una consulta de prueba
async function createTestConsultation() {
  try {
    console.log('🧪 Creando consulta de prueba...');
    
    const testConsultation = {
      clientEmail: 'test@example.com',
      clientName: 'Usuario de Prueba',
      message: 'Esta es una consulta de prueba para verificar el sistema de emails.',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    };

    const docRef = await db.collection('consultations').add(testConsultation);
    console.log('✅ Consulta de prueba creada con ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creando consulta de prueba:', error);
    throw error;
  }
}

// Función para probar el envío de respuesta
async function testEmailResponse(consultationId) {
  try {
    console.log('📧 Probando envío de respuesta...');
    
    // Simular una respuesta del administrador
    const response = {
      message: 'Gracias por tu consulta. Esta es una respuesta de prueba del sistema automatizado.',
      respondedAt: admin.firestore.FieldValue.serverTimestamp(),
      respondedBy: 'admin@diegogalmarini.com'
    };

    await db.collection('consultations').doc(consultationId).update({
      response: response.message,
      respondedAt: response.respondedAt,
      respondedBy: response.respondedBy,
      status: 'responded'
    });

    console.log('✅ Respuesta guardada en Firestore');
    console.log('📬 La Cloud Function onConsultationCreated debería haber enviado el email automáticamente');
    
  } catch (error) {
    console.error('❌ Error enviando respuesta:', error);
    throw error;
  }
}

// Función para verificar el estado de la consulta
async function checkConsultationStatus(consultationId) {
  try {
    console.log('🔍 Verificando estado de la consulta...');
    
    const doc = await db.collection('consultations').doc(consultationId).get();
    
    if (doc.exists) {
      const data = doc.data();
      console.log('📋 Estado actual de la consulta:');
      console.log('  - ID:', consultationId);
      console.log('  - Cliente:', data.clientEmail);
      console.log('  - Estado:', data.status);
      console.log('  - Respuesta:', data.response || 'Sin respuesta');
      console.log('  - Respondido en:', data.respondedAt ? data.respondedAt.toDate() : 'No respondido');
      
      return data;
    } else {
      console.log('❌ Consulta no encontrada');
      return null;
    }
  } catch (error) {
    console.error('❌ Error verificando consulta:', error);
    throw error;
  }
}

// Función principal de prueba
async function runEmailSystemTest() {
  console.log('🚀 Iniciando prueba del sistema de emails...');
  console.log('=' .repeat(50));
  
  try {
    // Paso 1: Crear consulta de prueba
    const consultationId = await createTestConsultation();
    
    // Esperar un momento para que se procese
    console.log('⏳ Esperando 3 segundos para que se procese...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Paso 2: Verificar estado inicial
    await checkConsultationStatus(consultationId);
    
    // Paso 3: Enviar respuesta (esto debería triggear el email)
    await testEmailResponse(consultationId);
    
    // Esperar un momento para que se procese
    console.log('⏳ Esperando 5 segundos para que se envíe el email...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Paso 4: Verificar estado final
    await checkConsultationStatus(consultationId);
    
    console.log('=' .repeat(50));
    console.log('✅ Prueba completada!');
    console.log('📧 Verifica tu bandeja de entrada en test@example.com');
    console.log('🔍 También puedes verificar los logs en Firebase Console:');
    console.log('   https://console.firebase.google.com/project/diego-galmarini-oficial-web/functions/logs');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar la prueba
if (require.main === module) {
  runEmailSystemTest()
    .then(() => {
      console.log('🏁 Script de prueba finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = {
  createTestConsultation,
  testEmailResponse,
  checkConsultationStatus,
  runEmailSystemTest
};