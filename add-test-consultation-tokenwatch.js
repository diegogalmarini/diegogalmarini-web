// Script para agregar una consulta de prueba para tokenwatcherapp@gmail.com
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBrJ_xfZeEVRXe0Fcw2XdDKVdCSRYHqaGA",
  authDomain: "diego-galmarini-oficial-web.firebaseapp.com",
  projectId: "diego-galmarini-oficial-web",
  storageBucket: "diego-galmarini-oficial-web.appspot.com",
  messagingSenderId: "668819276616",
  appId: "1:668819276616:web:5ca12fddfa9fd5fcc2697d",
  measurementId: "G-91HFCBNTBY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addTestConsultationForTokenWatch() {
  try {
    const consultationData = {
      clientName: "Token Watcher",
      clientEmail: "tokenwatcherapp@gmail.com",
      selectedPlan: "Consulta Estratégica 30min",
      problemDescription: "Necesito ayuda para optimizar la estrategia digital de mi aplicación Token Watcher. Queremos mejorar la experiencia del usuario y aumentar la retención.",
      selectedDate: "2024-01-25",
      selectedTime: "14:00",
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'consultations'), consultationData);
    console.log("✅ Consulta de prueba agregada para tokenwatcherapp@gmail.com con ID: ", docRef.id);
    
    // Agregar una segunda consulta respondida
    const consultationData2 = {
      clientName: "Token Watcher",
      clientEmail: "tokenwatcherapp@gmail.com",
      selectedPlan: "Consulta Estratégica 60min",
      problemDescription: "Seguimiento de la consulta anterior. Necesito implementar las recomendaciones y revisar el progreso.",
      selectedDate: "2024-01-20",
      selectedTime: "10:00",
      status: "responded",
      responseMessage: "Hola! Gracias por tu consulta. He revisado tu aplicación Token Watcher y tengo varias recomendaciones para mejorar la experiencia del usuario. Te sugiero implementar un sistema de notificaciones push más inteligente y optimizar la interfaz de seguimiento de tokens. ¿Te parece si agendamos una sesión de 60 minutos para revisar estos puntos en detalle?",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      respondedAt: serverTimestamp()
    };

    const docRef2 = await addDoc(collection(db, 'consultations'), consultationData2);
    console.log("✅ Segunda consulta (respondida) agregada para tokenwatcherapp@gmail.com con ID: ", docRef2.id);
    
  } catch (error) {
    console.error("❌ Error agregando consultas de prueba: ", error);
  }
}

addTestConsultationForTokenWatch();