import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';

interface ConnectionTestProps {
  onClose: () => void;
}

export const FirebaseConnectionTest: React.FC<ConnectionTestProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<{
    auth: string;
    firestore: string;
    readTest: string;
    writeTest: string;
  }>({ auth: 'Probando...', firestore: 'Probando...', readTest: 'Probando...', writeTest: 'Probando...' });

  useEffect(() => {
    runTests();
  }, [user]);

  const runTests = async () => {
    // Test 1: Autenticación
    setTestResults(prev => ({ ...prev, auth: user ? '✅ Usuario autenticado' : '❌ No autenticado' }));

    // Test 2: Conexión a Firestore
    try {
      const testCollection = collection(db, 'test');
      setTestResults(prev => ({ ...prev, firestore: '✅ Conexión establecida' }));
      
      // Test 3: Lectura
      try {
        const snapshot = await getDocs(testCollection);
        setTestResults(prev => ({ ...prev, readTest: `✅ Lectura exitosa (${snapshot.size} documentos)` }));
      } catch (readError: any) {
        setTestResults(prev => ({ ...prev, readTest: `❌ Error de lectura: ${readError.message}` }));
      }

      // Test 4: Escritura (solo si está autenticado)
      if (user) {
        try {
          await addDoc(testCollection, {
            test: true,
            timestamp: new Date(),
            userId: user.uid
          });
          setTestResults(prev => ({ ...prev, writeTest: '✅ Escritura exitosa' }));
        } catch (writeError: any) {
          setTestResults(prev => ({ ...prev, writeTest: `❌ Error de escritura: ${writeError.message}` }));
        }
      } else {
        setTestResults(prev => ({ ...prev, writeTest: '⚠️ Requiere autenticación' }));
      }
    } catch (connectionError: any) {
      setTestResults(prev => ({ 
        ...prev, 
        firestore: `❌ Error de conexión: ${connectionError.message}`,
        readTest: '❌ No se pudo probar',
        writeTest: '❌ No se pudo probar'
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          Diagnóstico de Conexión Firebase
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">Autenticación:</span>
            <span className="font-mono text-sm">{testResults.auth}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">Firestore:</span>
            <span className="font-mono text-sm">{testResults.firestore}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">Lectura:</span>
            <span className="font-mono text-sm">{testResults.readTest}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">Escritura:</span>
            <span className="font-mono text-sm">{testResults.writeTest}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={runTests}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Probar Nuevamente
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};