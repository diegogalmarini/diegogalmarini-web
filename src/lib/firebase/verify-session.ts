import { adminAuth } from "./admin-config";

export async function verifyIdToken(sessionCookie: string) {
  try {
    // Verifica la cookie de sesión de Firebase (puedes ajustar el parámetro de expiración si lo necesitas)
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims; // contiene uid, email, etc.
  } catch (error) {
    throw new Error("Sesión inválida o expirada");
  }
}
