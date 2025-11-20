import { adminDb } from "./admin-config";

/**
 * Obtiene todos los documentos de la colección 'consultations' usando Firebase Admin.
 * @returns Un array con todas las consultas.
 */
export async function getConsultations() {
  try {
    const snapshot = await adminDb.collection("consultations").get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    console.error("Error al obtener consultas:", error);
    return [];
  }
}

/**
 * Obtiene todos los documentos de la colección 'appointments' usando Firebase Admin.
 * @returns Un array con todas las citas.
 */
export async function getAppointments() {
  try {
    const snapshot = await adminDb.collection("appointments").get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    console.error("Error al obtener citas:", error);
    return [];
  }
}
