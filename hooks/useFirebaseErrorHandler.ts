// Hook personalizado para manejar errores de Firebase
// Proporciona diagnósticos automáticos y manejo de errores de conectividad

import { useState, useEffect, useCallback } from 'react';
import { FirebaseError } from 'firebase/app';

type ErrorType = 'auth' | 'firestore' | 'network' | 'unknown';

interface FirebaseErrorInfo {
  type: ErrorType;
  message: string;
  code?: string;
  isRetryable: boolean;
  suggestions: string[];
}

interface UseFirebaseErrorHandlerReturn {
  error: FirebaseErrorInfo | null;
  isOnline: boolean;
  clearError: () => void;
  handleError: (error: any) => void;
  retryConnection: () => Promise<boolean>;
}

export const useFirebaseErrorHandler = (): UseFirebaseErrorHandlerReturn => {
  const [error, setError] = useState<FirebaseErrorInfo | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const classifyError = (error: any): FirebaseErrorInfo => {
    // Error de Firebase específico
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/network-request-failed':
        case 'firestore/unavailable':
        case 'firestore/deadline-exceeded':
          return {
            type: 'network',
            message: 'Error de conectividad de red',
            code: error.code,
            isRetryable: true,
            suggestions: [
              'Verifica tu conexión a Internet',
              'Intenta recargar la página',
              'Comprueba si hay restricciones de firewall',
              'Contacta al soporte si el problema persiste'
            ]
          };

        case 'auth/unauthorized-domain':
          return {
            type: 'auth',
            message: 'Dominio no autorizado para Firebase Auth',
            code: error.code,
            isRetryable: false,
            suggestions: [
              'Añade el dominio a los dominios autorizados en Firebase Console',
              'Ve a Authentication > Settings > Authorized domains',
              'Añade el dominio actual a la lista'
            ]
          };

        case 'firestore/permission-denied':
          return {
            type: 'firestore',
            message: 'Permisos insuficientes para acceder a Firestore',
            code: error.code,
            isRetryable: false,
            suggestions: [
              'Verifica las reglas de seguridad de Firestore',
              'Asegúrate de estar autenticado correctamente',
              'Revisa los permisos del usuario'
            ]
          };

        case 'firestore/failed-precondition':
          return {
            type: 'firestore',
            message: 'Error de precondición en Firestore',
            code: error.code,
            isRetryable: true,
            suggestions: [
              'Verifica que los índices estén creados',
              'Comprueba la estructura de los documentos',
              'Revisa las consultas complejas'
            ]
          };

        default:
          return {
            type: 'firestore',
            message: error.message || 'Error de Firebase',
            code: error.code,
            isRetryable: true,
            suggestions: [
              'Intenta recargar la página',
              'Verifica la configuración de Firebase',
              'Consulta la documentación de Firebase'
            ]
          };
      }
    }

    // Error de red general
    if (error.message?.includes('net::ERR_ABORTED') || 
        error.message?.includes('net::ERR_NETWORK_CHANGED') ||
        error.message?.includes('net::ERR_INTERNET_DISCONNECTED')) {
      return {
        type: 'network',
        message: 'Error de conexión de red',
        isRetryable: true,
        suggestions: [
          'Verifica tu conexión a Internet',
          'Comprueba la estabilidad de la red',
          'Intenta cambiar de red si es posible',
          'Espera unos momentos y vuelve a intentar'
        ]
      };
    }

    // Error desconocido
    return {
      type: 'unknown',
      message: error.message || 'Error desconocido',
      isRetryable: true,
      suggestions: [
        'Intenta recargar la página',
        'Verifica la consola del navegador para más detalles',
        'Contacta al soporte técnico si el problema persiste'
      ]
    };
  };

  const handleError = useCallback((error: any) => {
    console.error('Firebase Error:', error);
    const errorInfo = classifyError(error);
    setError(errorInfo);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Intentar una operación simple para verificar la conectividad
      const response = await fetch('https://firestore.googleapis.com/', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      clearError();
      return true;
    } catch (error) {
      console.error('Retry failed:', error);
      return false;
    }
  }, [clearError]);

  return {
    error,
    isOnline,
    clearError,
    handleError,
    retryConnection
  };
};

// Hook específico para errores de Firestore
export const useFirestoreErrorHandler = () => {
  const { error, isOnline, clearError, handleError, retryConnection } = useFirebaseErrorHandler();

  const handleFirestoreError = useCallback((error: any) => {
    // Filtrar solo errores relacionados con Firestore
    if (error?.code?.startsWith('firestore/') || 
        error?.message?.includes('firestore') ||
        error?.message?.includes('Firestore')) {
      handleError(error);
    }
  }, [handleError]);

  const firestoreError = error?.type === 'firestore' || error?.type === 'network' ? error : null;
  
  return {
    hasError: !!firestoreError,
    error: firestoreError,
    isOnline,
    clearError,
    handleError: handleFirestoreError,
    retryConnection
  };
};

// Utilidad para envolver operaciones de Firestore con manejo de errores
export const withFirestoreErrorHandling = <T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  errorHandler: (error: any) => void
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await operation(...args);
    } catch (error) {
      errorHandler(error);
      return null;
    }
  };
};