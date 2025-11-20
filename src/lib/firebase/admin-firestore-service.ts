import { adminDb } from "./admin-config";

/**
 * Obtiene todos los documentos de la colección 'consultations' usando Firebase Admin.
 * @returns Un array con todas las consultas.
 */
export async function getConsultations() {
  try {
    const snapshot = await adminDb.collection("consultations").get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to ISO strings for serialization
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });
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
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to ISO strings for serialization
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });
  } catch (error: any) {
    console.error("Error al obtener citas:", error);
    return [];
  }
}
