'use client';

import React, { useState, useEffect } from 'react';
import { 
  IoClose, 
  IoMailOutline, 
  IoLockClosedOutline, 
  IoLogoGoogle,
  IoArrowBack
} from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { firebaseConfig } from '../lib/firebase/config';

const FirebaseConfigError: React.FC<{ hostname: string; projectId: string }> = ({ 
  hostname, 
  projectId 
}) => (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
    <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error de Configuración de Firebase</h3>
    <p className="text-red-700 dark:text-red-300 text-sm mb-2">
      El dominio <code className="bg-red-100 dark:bg-red-800 px-1 py-0.5 rounded text-xs">{hostname}</code> no está autorizado para este proyecto de Firebase.
    </p>
    <p className="text-red-600 dark:text-red-400 text-xs">
      Agrega este dominio a la lista de dominios autorizados en la consola de Firebase: 
      <br />
      <strong>Authentication → Settings → Authorized domains</strong>
      <br />
      Proyecto: {projectId}
    </p>
  </div>
);

export const LoginModal: React.FC = () => {
  const { isModalOpen, closeModal, openModal } = useModal();
  const { loginWithEmail, signInWithGoogle, sendPasswordReset } = useAuth();
  
  const [view, setView] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);

  const isOpen = isModalOpen('login');

  const clearMessages = () => {
    setError('');
    setResetMessage('');
    setAuthErrorCode(null);
  };

  const resetFormState = () => {
    setView('login');
    setEmail('');
    setPassword('');
    setResetEmail('');
    setLoading(false);
    clearMessages();
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setTimeout(resetFormState, 300);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    clearMessages();
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      closeModal();
      resetFormState();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este correo electrónico.');
      } else if (err.code === 'auth/wrong-password') {
        setError('La contraseña es incorrecta.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido.');
      } else if (err.code === 'auth/user-disabled') {
        setError('Esta cuenta ha sido deshabilitada.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Inténtalo más tarde.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setAuthErrorCode(err.code);
      } else {
        setError('Error al iniciar sesión. Verifica tus credenciales.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !resetEmail) return;

    clearMessages();
    setLoading(true);

    try {
      await sendPasswordReset(resetEmail);
      setResetMessage('Se ha enviado un enlace de restauración a tu correo electrónico.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este correo electrónico.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido.');
      } else {
        setError('Error al enviar el correo. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;

    clearMessages();
    setLoading(true);

    try {
      await signInWithGoogle();
      closeModal();
      resetFormState();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('La ventana emergente de Google fue bloqueada por el navegador. Por favor, habilítalas.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('El inicio de sesión con Google no está habilitado. Actívalo en tu consola de Firebase.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setAuthErrorCode(err.code);
      } else {
        setError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoToBooking = () => {
    closeModal();
    openModal('booking');
  };

  const renderError = () => {
    if (authErrorCode === 'auth/unauthorized-domain') {
      return (
        <FirebaseConfigError
          hostname={window.location.hostname}
          projectId={firebaseConfig.projectId || 'unknown'}
        />
      );
    }
    if (error) {
      return <p className="text-red-500 text-sm text-center py-2">{error}</p>;
    }
    if (resetMessage) {
      return <p className="text-green-500 text-sm text-center py-2">{resetMessage}</p>;
    }
    return null;
  };
  
  const handleViewChange = (newView: 'login' | 'reset') => {
    clearMessages();
    setView(newView);
  };
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/20 rounded-2xl w-full max-w-md p-8 relative transform transition-all duration-300 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <button
          onClick={closeModal}
          aria-label="Cerrar modal"
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 z-10"
        >
          <IoClose className="text-lg" />
        </button>

        {view === 'login' ? (
          <>
            <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Acceso de Usuario
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              Inicia sesión para gestionar tus consultas.
            </p>
            {renderError()}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <IoMailOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Introduce tu email"
                  required
                  className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl py-3 px-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div className="relative">
                <IoLockClosedOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  required
                  className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl py-3 px-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div className="text-right">
                <button 
                  type="button" 
                  onClick={() => handleViewChange('reset')} 
                  className="text-sm font-medium text-blue-600 hover:underline focus:outline-none"
                >
                  ¿Has olvidado tu contraseña?
                </button>
              </div>
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">o</span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            </div>

            <button 
              onClick={handleGoogleLogin} 
              disabled={loading} 
              className="w-full flex items-center justify-center bg-white dark:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/20 transition disabled:opacity-50"
            >
              <IoLogoGoogle className="mr-2 text-lg text-[#4285F4]" /> 
              {loading ? 'Procesando...' : 'Acceder con Google'}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              Para crear una cuenta, por favor, inicia una consulta{' '}
              <button 
                onClick={handleGoToBooking} 
                className="font-semibold text-blue-600 hover:underline"
              >
                agendando una llamada
              </button>.
            </p>
          </>
        ) : (
          <>
            <button 
              onClick={() => handleViewChange('login')} 
              className="absolute top-6 left-6 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center"
            >
              <IoArrowBack className="mr-1"/> Volver
            </button>
            <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2 pt-8">
              Restaurar Contraseña
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              Introduce tu email para recibir un enlace de restauración.
            </p>
            {renderError()}
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="relative">
                <IoMailOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Introduce tu email"
                  required
                  className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl py-3 px-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Enlace de Restauración'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};