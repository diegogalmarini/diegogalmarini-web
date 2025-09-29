"use client";

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
import { auth } from '@/lib/firebase/config';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  checkIfEmailExists: (email: string) => Promise<boolean>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<FirebaseUser>;
  loginWithEmail: (email: string, password: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Loading component
const LoadingScreen: React.FC = () => (
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run on client side and when auth is available
    if (typeof window === 'undefined' || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkIfEmailExists = async (email: string): Promise<boolean> => {
    if (!auth) {
      console.error("Auth not available");
      return false;
    }
    
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false;
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string): Promise<FirebaseUser> => {
    if (!auth) {
      throw new Error("Auth not available");
    }

    try {
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
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
    if (!auth) {
      throw new Error("Auth not available");
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user) {
        throw new Error("No se pudo iniciar sesión.");
      }
      return userCredential.user;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<FirebaseUser> => {
    if (!auth) {
      throw new Error("Auth not available");
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (!result.user) {
        throw new Error("No se pudo iniciar sesión con Google.");
      }
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    if (!auth) {
      throw new Error("Auth not available");
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };
  
  const sendVerificationEmail = async (): Promise<void> => {
    if (!auth) {
      throw new Error("Auth not available");
    }

    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (error) {
        console.error("Error sending verification email:", error);
        throw error;
      }
    } else {
      throw new Error("No hay ningún usuario conectado para enviar un correo de verificación.");
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    if (!auth) {
      throw new Error("Auth not available");
    }

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset:", error);
      throw error;
    }
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
    sendPasswordReset,
  };

  // Show loading screen while Firebase initializes
  if (loading) {
    return <LoadingScreen />;
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