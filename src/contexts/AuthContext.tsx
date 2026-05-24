
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import {
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
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  checkIfEmailExists: (email: string) => Promise<boolean>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<FirebaseUser>;
  loginWithEmail: (email: string, password: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  clearAllSessions: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  googleAccessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('google_access_token');
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔍 Auth state changed:', currentUser?.email);

      // TEMPORARY: For testing purposes with open Firestore rules
      /* 
      if (!currentUser) {
        const mockUser = {
          email: 'diegogalmarini@gmail.com',
          uid: 'mock-testing-uid',
          displayName: 'Diego Galmarini (TESTING)',
          emailVerified: true
        } as FirebaseUser;
        setUser(mockUser);
        setIsAdmin(true);
        setLoading(false);
        console.log('🔧 TESTING MODE: Mock user active');
        return;
      }
      */

      setUser(currentUser);

      // Si no hay usuario (and not a mock user), limpiar token
      if (!currentUser) {
        setGoogleAccessToken(null);
        localStorage.removeItem('google_access_token');
      }

      // Lógica temporal para pruebas - incluir emails de admin de prueba
      const adminEmails = [
        'diegogalmarini@gmail.com',
        'admin@test.com',
        'test@admin.com'
      ];

      const isUserAdmin = currentUser?.email ? adminEmails.includes(currentUser.email.toLowerCase()) : false;
      console.log('🔍 Is admin check:', {
        email: currentUser?.email,
        emailLower: currentUser?.email?.toLowerCase(),
        isAdmin: isUserAdmin,
        adminEmails,
        includes: currentUser?.email ? adminEmails.includes(currentUser.email.toLowerCase()) : 'no email'
      });

      setIsAdmin(isUserAdmin);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const checkIfEmailExists = async (email: string): Promise<boolean> => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      console.error("Error checking email existence:", error);
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
    provider.addScope('https://www.googleapis.com/auth/calendar.events.readonly');

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    if (token) {
      setGoogleAccessToken(token);
      localStorage.setItem('google_access_token', token);
    }

    if (!result.user) {
      throw new Error("No se pudo iniciar sesión con Google.");
    }
    return result.user;
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    // Limpiar estado local
    setUser(null);
    setIsAdmin(false);
    setGoogleAccessToken(null);
    localStorage.removeItem('google_access_token');
  };

  // Función para limpiar todas las sesiones
  const clearAllSessions = async (): Promise<void> => {
    try {
      // Cerrar sesión actual
      await signOut(auth);
      // Limpiar estado local
      setUser(null);
      setIsAdmin(false);
      setGoogleAccessToken(null);
      // Limpiar localStorage y sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ Todas las sesiones han sido cerradas');
    } catch (error) {
      console.error('Error al cerrar sesiones:', error);
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error("No hay ningún usuario conectado para enviar un correo de verificación.");
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    loading,
    isAdmin,
    checkIfEmailExists,
    registerWithEmail,
    loginWithEmail,
    signInWithGoogle,
    logout,
    clearAllSessions,
    sendVerificationEmail,
    sendPasswordReset,
    googleAccessToken,
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-color)] z-[9999]">
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `}</style>
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
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
