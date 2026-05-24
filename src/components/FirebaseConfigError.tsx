import React, { useState, useEffect } from 'react';
import { IoWarningOutline, IoRefreshOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';

interface FirebaseConfigErrorProps {
    hostname?: string;
    projectId?: string;
    errorType?: 'auth' | 'firestore' | 'network';
    errorMessage?: string;
}

export const FirebaseConfigError: React.FC<FirebaseConfigErrorProps> = ({ 
    hostname, 
    projectId, 
    errorType = 'auth',
    errorMessage 
}) => {
    const [isRetrying, setIsRetrying] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    useEffect(() => {
        const checkConnection = () => {
            setConnectionStatus(navigator.onLine ? 'online' : 'offline');
        };

        checkConnection();
        window.addEventListener('online', checkConnection);
        window.addEventListener('offline', checkConnection);

        return () => {
            window.removeEventListener('online', checkConnection);
            window.removeEventListener('offline', checkConnection);
        };
    }, []);

    const handleRetry = () => {
        setIsRetrying(true);
        setTimeout(() => {
            setIsRetrying(false);
            window.location.reload();
        }, 1000);
    };

    const renderAuthError = () => (
        <>
            <h4 className="font-bold text-red-800 dark:text-red-100 mb-1">Error de Configuración de Firebase</h4>
            <p className="mb-2">El dominio <strong className="font-semibold">{hostname}</strong> no está autorizado para usar el inicio de sesión.</p>
            <p className="font-semibold text-red-800 dark:text-red-100">Para solucionarlo:</p>
            <ol className="list-decimal list-inside space-y-1 mt-1">
                <li>
                    Abre la{' '}
                    <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-red-900 dark:hover:text-red-100 transition-colors">
                        Consola de Firebase
                    </a>.
                </li>
                <li>Ve a tu proyecto: <strong className="font-semibold">{projectId}</strong>.</li>
                <li>Navega a <strong className="font-semibold">Authentication</strong> &gt; <strong className="font-semibold">Settings</strong> &gt; <strong className="font-semibold">Authorized domains</strong>.</li>
                <li>Haz clic en <strong className="font-semibold">Add domain</strong> y añade <strong className="font-semibold">{hostname}</strong>.</li>
            </ol>
            <p className="mt-3">Después de guardar, intenta iniciar sesión de nuevo.</p>
        </>
    );

    const renderFirestoreError = () => (
        <>
            <h4 className="font-bold text-red-800 dark:text-red-100 mb-1">Error de Conexión con Firestore</h4>
            <p className="mb-2">No se pudo establecer conexión con la base de datos.</p>
            <div className="mb-3">
                <p className="font-semibold text-red-800 dark:text-red-100">Estado de conexión:</p>
                <div className="flex items-center gap-2 mt-1">
                    {connectionStatus === 'online' ? (
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                    ) : (
                        <IoWarningOutline className="w-4 h-4 text-red-500" />
                    )}
                    <span className={connectionStatus === 'online' ? 'text-green-600' : 'text-red-600'}>
                        {connectionStatus === 'online' ? 'Conectado a Internet' : 'Sin conexión a Internet'}
                    </span>
                </div>
            </div>
            <p className="font-semibold text-red-800 dark:text-red-100">Posibles soluciones:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Verifica tu conexión a Internet</li>
                <li>Comprueba que las reglas de Firestore permitan el acceso</li>
                <li>Revisa la configuración del proyecto en Firebase Console</li>
                <li>Intenta recargar la página</li>
            </ul>
            {errorMessage && (
                <div className="mt-3 p-2 bg-red-100 dark:bg-red-800/30 rounded border">
                    <p className="text-xs font-mono">{errorMessage}</p>
                </div>
            )}
        </>
    );

    const renderNetworkError = () => (
        <>
            <h4 className="font-bold text-red-800 dark:text-red-100 mb-1">Error de Red</h4>
            <p className="mb-2">Problema de conectividad detectado.</p>
            <p className="font-semibold text-red-800 dark:text-red-100">Recomendaciones:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Verifica tu conexión a Internet</li>
                <li>Comprueba si hay restricciones de firewall</li>
                <li>Intenta usar una red diferente</li>
                <li>Contacta a tu administrador de red si el problema persiste</li>
            </ul>
        </>
    );

    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 p-4 rounded-2xl my-4 text-sm text-left">
            <div className="flex items-start gap-x-3">
                <IoWarningOutline className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-red-700 dark:text-red-200 flex-1">
                    {errorType === 'auth' && renderAuthError()}
                    {errorType === 'firestore' && renderFirestoreError()}
                    {errorType === 'network' && renderNetworkError()}
                </div>
            </div>
            
            {(errorType === 'firestore' || errorType === 'network') && (
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                        <IoRefreshOutline className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                        {isRetrying ? 'Reintentando...' : 'Reintentar'}
                    </button>
                </div>
            )}
        </div>
    );
};
