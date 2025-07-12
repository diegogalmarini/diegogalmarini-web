import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common';
import { IoMailOutline, IoLockClosedOutline, IoLogoGoogle } from 'react-icons/io5';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (email && password) {
      setLoading(true);
      try {
        await loginWithEmail(email, password);
        navigate('/dashboard');
      } catch (err: any) {
        // More specific error messages for better UX
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            setError('Email o contraseña incorrectos.');
        } else {
            setError('Error al iniciar sesión. Inténtalo de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
        await signInWithGoogle();
        navigate('/dashboard');
    } catch (err: any) {
        console.error("Google Sign-In Error:", err);
        if (err.code === 'auth/popup-blocked') {
            setError('La ventana emergente de Google fue bloqueada por el navegador. Por favor, habilítalas.');
        } else if (err.code === 'auth/operation-not-allowed') {
            setError('El inicio de sesión con Google no está habilitado. Actívalo en tu consola de Firebase.');
        } else if (err.code === 'auth/unauthorized-domain') {
             setError('Este dominio no está autorizado para la autenticación. Añádelo en la consola de Firebase.');
        } else {
            setError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
        }
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="py-28">
      <div className="max-w-md mx-auto px-4">
        <Card>
          <h1 className="text-3xl font-bold text-center text-[var(--text-color)] mb-2">Acceso de Usuario</h1>
          <p className="text-center text-[var(--text-muted)] mb-8">Inicia sesión para gestionar tus consultas.</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
                <IoMailOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
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
                <IoLockClosedOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  required
                  className="glass-input"
                />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full btn-cta py-3" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
           <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-[var(--border-color)]"></div>
                <span className="flex-shrink mx-4 text-[var(--text-muted)] text-sm">o</span>
                <div className="flex-grow border-t border-[var(--border-color)]"></div>
            </div>
             <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center bg-white/90 dark:bg-white/10 border border-transparent dark:border-[var(--border-color)] text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-xl hover:bg-white dark:hover:bg-white/20 transition disabled:opacity-50">
                <IoLogoGoogle className="mr-2 text-lg text-[#4285F4]" /> {loading ? 'Procesando...' : 'Continuar con Google'}
            </button>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;