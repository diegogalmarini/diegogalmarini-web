import React, { createContext, useContext, ReactNode } from 'react';
import { useFirestoreErrorHandler } from '../hooks/useFirebaseErrorHandler';

interface FirestoreErrorContextType {
  hasError: boolean;
  error: any;
  isOnline: boolean;
  clearError: () => void;
  retryConnection: () => void;
}

const FirestoreErrorContext = createContext<FirestoreErrorContextType | undefined>(undefined);

export const useFirestoreError = () => {
  const context = useContext(FirestoreErrorContext);
  if (context === undefined) {
    throw new Error('useFirestoreError must be used within a FirestoreErrorProvider');
  }
  return context;
};

interface FirestoreErrorProviderProps {
  children: ReactNode;
}

export const FirestoreErrorProvider: React.FC<FirestoreErrorProviderProps> = ({ children }) => {
  const errorHandler = useFirestoreErrorHandler();

  return (
    <FirestoreErrorContext.Provider value={errorHandler}>
      {children}
      {/* Componente de notificación integrado temporalmente */}
      {errorHandler.hasError && errorHandler.error && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="rounded-lg border p-4 shadow-lg bg-red-50 border-red-200 text-red-800">
            <div className="flex items-start space-x-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium mb-1">
                  {errorHandler.error.message}
                </h3>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => {
                      errorHandler.retryConnection();
                      errorHandler.clearError();
                    }}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-current hover:bg-current hover:text-white transition-colors"
                  >
                    Reintentar
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-current hover:bg-current hover:text-white transition-colors"
                  >
                    Recargar página
                  </button>
                </div>
              </div>
              <button
                onClick={errorHandler.clearError}
                className="flex-shrink-0 p-1 hover:bg-current hover:bg-opacity-20 rounded transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </FirestoreErrorContext.Provider>
  );
};