import { db } from "./config"; // Importa la conexión a la DB desde tu config
import { collection, addDoc, getDocs, serverTimestamp, DocumentData } from "firebase/firestore";

import { updateDoc, doc } from "firebase/firestore";

// Define la estructura de los datos de una consulta
export interface ConsultationData {
  clientEmail: string;
  clientName: string;
  planType: 'free' | '30min' | '60min';
  problemDescription: string;
  selectedDate: string;
  selectedTime: string;
}

/**
 * Crea un nuevo documento de consulta o cita en Firestore.
 * @param data Los datos de la consulta del formulario.
 * @param userId El UID del usuario que crea la consulta.
 * @returns Un objeto indicando si la operación fue exitosa o tuvo un error.
 */
export async function createConsultation(data: ConsultationData, userId: string | null) {
  try {
    // Prepara el objeto de datos a guardar, añadiendo el userId y timestamps
    const dataToSave = {
      ...data,
      userId: userId,
      status: data.planType === "free" ? "pending" : "pending_payment",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Decide en qué colección guardar basado en el tipo de plan
    const targetCollection = data.planType === "free" ? "consultations" : "appointments";
    
    await addDoc(collection(db, targetCollection), dataToSave);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error al guardar en Firestore:", error);
    return { success: false, error: error.message || "Error al guardar en Firestore" };
  }
}

/**
 * Obtiene todos los documentos de la colección 'consultations'.
 * @returns Un array con todas las consultas.
 */
export async function getConsultations(): Promise<DocumentData[]> {
  try {
    const snapshot = await getDocs(collection(db, "consultations"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    console.error("Error al obtener consultas:", error);
    return []; // Devuelve un array vacío en caso de error
  }
}

/**
 * Obtiene todos los documentos de la colección 'appointments'.
 * @returns Un array con todas las citas.
 */
export async function getAppointments(): Promise<DocumentData[]> {
  try {
    const snapshot = await getDocs(collection(db, "appointments"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    console.error("Error al obtener citas:", error);
    return []; // Devuelve un array vacío en caso de error
  }
}

/**
 * Actualiza el estado de un documento en la colección indicada.
 * @param collectionName Nombre de la colección ('consultations' o 'appointments')
 * @param docId ID del documento a actualizar
 * @param newStatus Nuevo estado a establecer
 */
export async function updateStatus(collectionName: string, docId: string, newStatus: string) {
  try {
    const ref = doc(db, collectionName, docId);
    await updateDoc(ref, { status: newStatus });
    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar estado:", error);
    return { success: false, error: error.message || "Error al actualizar el estado" };
  }
}