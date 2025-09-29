// Script para verificar consultas existentes en Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Configuración de Firebase (usando variables de entorno o configuración real)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDJGJJGJGJGJGJGJGJGJGJGJGJGJGJGJGJG",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "diego-galmarini-oficial-web.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "diego-galmarini-oficial-web",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "diego-galmarini-oficial-web.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdefghijklmnop"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkConsultations() {
  try {
    const querySnapshot = await getDocs(collection(db, 'consultations'));
    console.log(`Total de consultas encontradas: ${querySnapshot.size}`);
    
    querySnapshot.forEach((doc) => {
      console.log(`ID: ${doc.id}`, doc.data());
    });
  } catch (error) {
    console.error("Error al obtener consultas: ", error);
  }
}

checkConsultations();