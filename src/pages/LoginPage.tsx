import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { IoLogoGoogle } from 'react-icons/io5';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signInWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await signInWithGoogle();
      if (user && user.email?.toLowerCase() === 'diegogalmarini@gmail.com') {
        navigate('/admin/crm');
      } else {
        await logout();
        setError('Acceso restringido. Solo el propietario de esta cuenta tiene permisos de administrador.');
      }
    } catch (err: any) {
      console.error('Error durante el inicio de sesión con Google:', err);
      setError('No se pudo completar la autenticación. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Diego Galmarini
          </h1>
          <p className="text-sm text-gray-400 font-light">
            Panel de Control Privado
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 text-xs font-light leading-relaxed border border-red-100 animate-fade-in">
            {error}
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center bg-gray-900 hover:bg-black text-white font-medium py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50 cursor-pointer shadow-sm text-sm"
          >
            <IoLogoGoogle className="mr-2.5 text-lg" />
            {loading ? 'Accediendo...' : 'Iniciar Sesión con Google'}
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-[11px] text-gray-300 font-light">
            © {new Date().getFullYear()} Diego Galmarini. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
