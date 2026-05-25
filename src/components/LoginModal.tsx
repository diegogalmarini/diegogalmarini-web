import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { IoLogoGoogle, IoClose } from 'react-icons/io5';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
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
        onClose();
        navigate('/admin/crm');
      } else {
        await logout();
        setError('Acceso restringido. Solo el propietario tiene permisos de administración.');
      }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setError('No se pudo iniciar sesión. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
    >
      <div className="bg-white w-full max-w-sm p-8 rounded-2xl border border-gray-100 shadow-xl relative transform transition-all duration-300 scale-100 opacity-100 text-center space-y-6">
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10 cursor-pointer"
        >
          <IoClose className="text-lg" />
        </button>

        <div className="space-y-2 pt-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Diego Galmarini
          </h2>
          <p className="text-xs text-gray-400 font-light">
            Acceso administrativo privado
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-[11px] font-light leading-relaxed border border-red-100">
            {error}
          </div>
        )}

        <div className="pt-2">
          <button 
            onClick={handleGoogleLogin} 
            disabled={loading} 
            className="w-full flex items-center justify-center bg-gray-900 hover:bg-black text-white font-medium py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50 text-sm cursor-pointer shadow-sm"
          >
            <IoLogoGoogle className="mr-2 text-lg" /> 
            {loading ? 'Accediendo...' : 'Acceder con Google'}
          </button>
        </div>

        <div className="text-[10px] text-gray-300 font-light">
          Solo autorizado para el propietario de la cuenta.
        </div>
      </div>
    </div>
  );
};