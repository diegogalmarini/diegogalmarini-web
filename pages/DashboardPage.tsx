import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import CRMDashboard from '../components/admin/crm/CRMDashboard';
import { LoginModal } from '../components/LoginModal';

interface DashboardPageProps {
  onBookCallClick: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onBookCallClick }) => {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar mensaje de login
  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Requerido
            </h1>
            <p className="text-gray-600 mb-6">
              Necesitas iniciar sesión para acceder al dashboard.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
        
        {showLoginModal && (
          <LoginModal 
            isOpen={showLoginModal} 
            onClose={() => setShowLoginModal(false)} 
          />
        )}
      </>
    );
  }

  // Usuario autenticado - mostrar dashboard CRM
  return (
    <div className="min-h-screen bg-gray-50">
      <CRMDashboard className="" />
    </div>
  );
};

export default DashboardPage;