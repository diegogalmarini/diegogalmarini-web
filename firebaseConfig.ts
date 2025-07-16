
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

/**
 * Configuración de Firebase para la aplicación.
 *
 * NOTA: Es crucial que el `authDomain` esté configurado con tu dominio personalizado
 * para evitar que los pop-ups de autenticación muestren la URL de Firebase.
 *
 * @see https://firebase.google.com/docs/auth/web/custom-auth-domain
 */
const firebaseConfig = {
  apiKey: "AIzaSyBrJ_xfZeEVRXe0Fcw2XdDKVdCSRYHqaGA",
  // Cambiado para usar el dominio personalizado en los flujos de autenticación.
  authDomain: "diegogalmarini.com",
  projectId: "diego-galmarini-oficial-web",
  storageBucket: "diego-galmarini-oficial-web.appspot.com",
  messagingSenderId: "668819276616",
  appId: "1:668819276616:web:5ca12fddfa9fd5fcc2697d",
  measurementId: "G-91HFCBNTBY"
};

// Se inicializa la app de Firebase.
const app: FirebaseApp = initializeApp(firebaseConfig);

// Se exporta la instancia del servicio de autenticación para ser usada en la aplicación.
export const auth: Auth = getAuth(app);
