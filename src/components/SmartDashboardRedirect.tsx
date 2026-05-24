import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SmartDashboardRedirect: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Redirigir según el rol del usuario
      if (isAdmin) {
        console.log('🔄 Redirigiendo administrador a /paneldecontrol');
        navigate('/paneldecontrol', { replace: true });
      } else {
        console.log('🔄 Redirigiendo cliente a /dashboard');
        navigate('/dashboard', { replace: true });
      }
    } else if (!loading && !user) {
      // Si no está autenticado, redirigir al login
      console.log('🔄 Usuario no autenticado, redirigiendo a /login');
      navigate('/login', { replace: true });
    }
  }, [user, loading, isAdmin, navigate]);

  // Mostrar loading mientras se determina la redirección
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo al dashboard apropiado...</p>
      </div>
    </div>
  );
};

export default SmartDashboardRedirect;