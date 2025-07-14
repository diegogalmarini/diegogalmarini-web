
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
  Auth, 
  User as FirebaseUser,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  updateProfile,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail // Importar la función para resetear contraseña
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Interfaz para definir la forma del contexto de autenticación.
interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  checkIfEmailExists: (email: string) => Promise<boolean>;
  registerWithEmail: (name:string, email: string, password: string) => Promise<FirebaseUser>;
  loginWithEmail: (email: string, password: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>; // Nueva función
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const checkIfEmailExists = async (email: string): Promise<boolean> => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      return false;
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    await userCredential.user.reload();
    const updatedUser = auth.currentUser;
    if (updatedUser) {
       setUser(updatedUser);
       await sendEmailVerification(updatedUser);
    }
    if (!userCredential.user) {
        throw new Error("No se pudo crear el usuario.");
    }
    return userCredential.user;
  };

  const loginWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user) {
        throw new Error("No se pudo iniciar sesión.");
    }
    return userCredential.user;
  };

  const signInWithGoogle = async (): Promise<FirebaseUser> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (!result.user) {
        throw new Error("No se pudo iniciar sesión con Google.");
    }
    return result.user;
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };
  
  const sendVerificationEmail = async (): Promise<void> => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error("No hay ningún usuario conectado para enviar un correo de verificación.");
    }
  };

  // Nueva función para enviar el correo de reseteo de contraseña.
  const sendPasswordReset = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    loading,
    checkIfEmailExists,
    registerWithEmail,
    loginWithEmail,
    signInWithGoogle,
    logout,
    sendVerificationEmail,
    sendPasswordReset, // Exponemos la nueva función
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
