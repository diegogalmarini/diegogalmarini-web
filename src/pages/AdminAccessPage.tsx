import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminAccessPage: React.FC = () => {
  const { user, loading, isAdmin, loginWithEmail } = useAuth();
  const [email, setEmail] = useState('diegogalmarini@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await loginWithEmail(email, password);
      setSuccess('Login exitoso! Redirigiendo...');
      setTimeout(() => {
        navigate('/paneldecontrol');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  const handleDirectAccess = () => {
    navigate('/paneldecontrol');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Acceso de Administrador
        </h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Estado Actual:</h3>
          <p><strong>Email:</strong> {user?.email || 'No autenticado'}</p>
          <p><strong>Es Admin:</strong> {isAdmin ? '✅ Sí' : '❌ No'}</p>
          <p><strong>UID:</strong> {user?.uid || 'N/A'}</p>
        </div>

        {user && isAdmin && (
          <div className="mb-4">
            <button
              onClick={handleDirectAccess}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              🚀 Ir al Panel de Administrador
            </button>
          </div>
        )}

        {!user && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Iniciar Sesión
            </button>
          </form>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAccessPage;