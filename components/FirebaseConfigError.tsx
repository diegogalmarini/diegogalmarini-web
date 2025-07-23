import React from 'react';
import { IoWarningOutline } from 'react-icons/io5';

interface FirebaseConfigErrorProps {
    hostname: string;
    projectId: string;
}

export const FirebaseConfigError: React.FC<FirebaseConfigErrorProps> = ({ hostname, projectId }) => {
    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 p-4 rounded-2xl my-4 text-sm text-left flex items-start gap-x-3">
            <IoWarningOutline className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-red-700 dark:text-red-200">
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
            </div>
        </div>
    );
};
