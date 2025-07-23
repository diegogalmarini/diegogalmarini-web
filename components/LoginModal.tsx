import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import { IoMailOutline, IoLockClosedOutline, IoLogoGoogle, IoArrowBack, IoClose } from 'react-icons/io5';
import { FirebaseConfigError } from './FirebaseConfigError.tsx';
import { firebaseConfig } from '../firebaseConfig.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { loginWithEmail, signInWithGoogle, sendPasswordReset } = useAuth();
  const navigate = useNavigate();

  const clearMessages = () => {
    setError('');
    setAuthErrorCode(null);
    setResetMessage('');
  };
  
  const resetState = () => {
    setView('login');
    setEmail('');
    setPassword('');
    setResetEmail('');
    clearMessages();
    setLoading(false);
  }

  useEffect(() => {
    if(!isOpen) {
        setTimeout(resetState, 300);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();
    try {
      await loginWithEmail(email, password);
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setAuthErrorCode(err.code);
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos.');
      } else {
        setError('Error al iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    clearMessages();
    setLoading(true);
    try {
        await signInWithGoogle();
        onClose();
    } catch (err: any) {
        console.error("Google Sign-In Error:", err);
        if (err.code === 'auth/popup-blocked') {
            setError('La ventana emergente de Google fue bloqueada por el navegador. Por favor, habilítalas.');
        } else if (err.code === 'auth/unauthorized-domain') {
            setAuthErrorCode(err.code);
        } else {
            setError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
        }
    } finally {
        setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!resetEmail) {
      setError('Por favor, introduce tu dirección de email.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(resetEmail);
      setResetMessage('Si existe una cuenta con este email, recibirás un enlace para restaurar tu contraseña en breve.');
    } catch (err: any) {
       console.error("Password Reset Error:", err);
       setError('Error al enviar el email de restauración. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }
  
  const handleGoToBooking = () => {
    onClose();
    navigate('/#book');
  };

  const renderError = () => {
    if (authErrorCode === 'auth/unauthorized-domain') {
      return (
        <FirebaseConfigError
          hostname={window.location.hostname}
          projectId={firebaseConfig.projectId}
        />
      );
    }
    if (error) {
      return <p className="text-red-500 text-sm text-center py-2">{error}</p>;
    }
    if(resetMessage) {
        return <p className="text-green-500 text-sm text-center py-2">{resetMessage}</p>;
    }
    return null;
  };
  
  const handleViewChange = (newView: 'login' | 'reset') => {
    clearMessages();
    setView(newView);
  }
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className={`modal-glass-content w-full max-w-md p-8 relative transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--nav-inactive-hover-bg)] transition-all duration-300 z-10"
        >
          <IoClose className="text-lg" />
        </button>

        {view === 'login' ? (
            <>
              <h1 className="text-3xl font-bold text-center text-[var(--text-color)] mb-2">
                Acceso de Usuario
              </h1>
              <p className="text-center text-[var(--text-muted)] mb-8">
                Inicia sesión para gestionar tus consultas.
              </p>
              {renderError()}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <IoMailOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Introduce tu email"
                      required
                      className="glass-input"
                    />
                </div>
                <div className="relative">
                    <IoLockClosedOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Contraseña"
                      required
                      className="glass-input"
                    />
                </div>
                <div className="text-right">
                    <button type="button" onClick={() => handleViewChange('reset')} className="text-sm font-medium text-[var(--primary-color)] hover:underline focus:outline-none">
                        ¿Has olvidado tu contraseña?
                    </button>
                </div>
                <button type="submit" className="w-full btn-cta py-3" disabled={loading}>
                  {loading ? 'Procesando...' : 'Iniciar Sesión'}
                </button>
              </form>

              <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-[var(--border-color)]"></div>
                <span className="flex-shrink mx-4 text-[var(--text-muted)] text-sm">o</span>
                <div className="flex-grow border-t border-[var(--border-color)]"></div>
              </div>

              <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center bg-white/90 dark:bg-white/10 border border-transparent dark:border-[var(--border-color)] text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-xl hover:bg-white dark:hover:bg-white/20 transition disabled:opacity-50">
                <IoLogoGoogle className="mr-2 text-lg text-[#4285F4]" /> {loading ? 'Procesando...' : 'Acceder con Google'}
              </button>

              <p className="text-center text-sm text-[var(--text-muted)] mt-6">
                Para crear una cuenta, por favor, inicia una consulta{' '}
                <button onClick={handleGoToBooking} className="font-semibold text-[var(--primary-color)] hover:underline">
                    agendando una llamada
                </button>.
              </p>
            </>
          ) : (
             <>
                <button onClick={() => handleViewChange('login')} className="absolute top-6 left-6 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-color)] flex items-center">
                    <IoArrowBack className="mr-1"/> Volver
                </button>
                <h1 className="text-3xl font-bold text-center text-[var(--text-color)] mb-2 pt-8">
                    Restaurar Contraseña
                </h1>
                <p className="text-center text-[var(--text-muted)] mb-8">
                    Introduce tu email para recibir un enlace de restauración.
                </p>
                {renderError()}
                 <form onSubmit={handlePasswordReset} className="space-y-6">
                    <div className="relative">
                        <IoMailOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Introduce tu email"
                        required
                        className="glass-input"
                        />
                    </div>
                    <button type="submit" className="w-full btn-cta py-3" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Enlace de Restauración'}
                    </button>
                 </form>
             </>
          )}
      </div>
    </div>
  );
};