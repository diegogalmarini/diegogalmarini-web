// Componente de notificación para errores de Firestore
// Muestra errores de conectividad de manera amigable al usuario

import React from 'react';
import { AlertTriangle, Wifi, WifiOff, RefreshCw, X } from 'lucide-react';
import { useFirestoreErrorHandler } from '../../hooks/useFirebaseErrorHandler';

interface FirestoreErrorNotificationProps {
  className?: string;
}

export const FirestoreErrorNotification: React.FC<FirestoreErrorNotificationProps> = ({ 
  className = '' 
}) => {
  const { hasError, error, isOnline, clearError, retryConnection } = useFirestoreErrorHandler();
  const [isRetrying, setIsRetrying] = React.useState(false);

  if (!error) return null;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryConnection();
      clearError();
    } catch (err) {
      console.error('Error al reintentar conexión:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getErrorColor = () => {
    switch (error.type) {
      case 'network':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'auth':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'firestore':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md ${className}`}>
      <div className={`rounded-lg border p-4 shadow-lg ${getErrorColor()}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getErrorIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium mb-1">
              {error.message}
            </h3>
            
            {error.code && (
              <p className="text-xs opacity-75 mb-2">
                Código: {error.code}
              </p>
            )}
            
            <div className="text-xs space-y-1">
              <p className="font-medium">Sugerencias:</p>
              <ul className="list-disc list-inside space-y-0.5 opacity-90">
                {error.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
            
            {!isOnline && (
              <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                <div className="flex items-center space-x-1">
                  <WifiOff className="w-3 h-3" />
                  <span>Sin conexión a Internet</span>
                </div>
              </div>
            )}
            
            {error.isRetryable && (
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-current hover:bg-current hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Reintentando...' : 'Reintentar'}
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-current hover:bg-current hover:text-white transition-colors"
                >
                  Recargar página
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={clearError}
            className="flex-shrink-0 p-1 hover:bg-current hover:bg-opacity-20 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirestoreErrorNotification;