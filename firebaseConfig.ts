
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Helper para leer variables y avisar si faltan.
function readEnv(name: string, required = true): string | undefined {
  const value = process.env[name];
  if (!value && required) {
    if (typeof window === 'undefined') {
      console.warn(`[firebaseConfig] Falta variable de entorno ${name}`);
    }
  }
    return value;
}

export const firebaseConfig = {
  apiKey: readEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: readEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
  measurementId: readEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', false),
};

let app: FirebaseApp;

// Evita la reinicialización de la app en entornos de desarrollo con HMR (Hot Module Replacement)
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Validación mínima (solo en server / build) para detectar configuración vacía
if (typeof window === 'undefined') {
  const missing = Object.entries(firebaseConfig)
    .filter(([_, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    console.warn('[firebaseConfig] Variables Firebase faltantes:', missing.join(', '));
  }
}

// Se exporta la app y los servicios inicializados
export { app, auth, db };
