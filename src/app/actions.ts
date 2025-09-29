"use server";

import { createConsultation, ConsultationData, updateStatus } from "@/lib/firebase/firestore-service";

// La acción ahora acepta un userId 
export async function submitBooking(data: ConsultationData, userId: string | null) {
  try {
    // Pasamos el userId a la función de creación
    const result = await createConsultation(data, userId);
    
    if (result.success) {
      return { success: true };
    } else {
      return { success: false, error: result.error || "Error desconocido al crear la consulta" };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Error inesperado en el servidor" };
  }
}

// Nueva Server Action para actualizar el estado de un documento
export async function updateDocumentStatus(collectionName: string, docId: string, newStatus: string) {
  try {
    const result = await updateStatus(collectionName, docId, newStatus);
    if (result.success) {
      return { success: true };
    } else {
      return { success: false, error: result.error || "Error desconocido" };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Error en el servidor" };
  }
}