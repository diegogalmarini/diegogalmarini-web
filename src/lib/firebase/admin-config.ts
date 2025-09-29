import { initializeApp, cert, getApps, getApp, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Las credenciales leídas desde las variables de entorno del servidor.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // La clave privada necesita este reemplazo para interpretar los saltos de línea correctamente.
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// El "Guardia de Puerta" para el servidor:
// Si no hay ninguna app inicializada, la inicializa.
// Si ya existe, simplemente la obtiene.
const app: App = !getApps().length
  ? initializeApp({ credential: cert(serviceAccount) })
  : getApps()[0];

export const adminAuth = getAuth(app);