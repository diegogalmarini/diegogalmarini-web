// Script para agregar una consulta de prueba a Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDJGJJGJGJGJGJGJGJGJGJGJGJGJGJGJGJG",
  authDomain: "diego-galmarini-oficial-web.firebaseapp.com",
  projectId: "diego-galmarini-oficial-web",
  storageBucket: "diego-galmarini-oficial-web.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addTestConsultation() {
  try {
    const consultationData = {
      clientName: "Juan Pérez",
      clientEmail: "juan.perez@email.com",
      selectedPlan: "Consulta Estratégica 30min",
      problemDescription: "Necesito ayuda para optimizar la estrategia digital de mi empresa. Tenemos problemas con el posicionamiento online y queremos mejorar nuestras ventas.",
      selectedDate: "2024-01-20",
      selectedTime: "10:00",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'consultations'), consultationData);
    console.log("Consulta de prueba agregada con ID: ", docRef.id);
  } catch (error) {
    console.error("Error agregando consulta de prueba: ", error);
  }
}

addTestConsultation();