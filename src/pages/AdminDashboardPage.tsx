import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';

interface Consultation {
  id: string;
  userName: string;
  userEmail: string;
  services: string[];
  notes: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  createdAt: any;
  source: string;
}

const AdminDashboardPage: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const db = getFirestore(app);
    const consultationsRef = collection(db, 'consultations');
    const q = query(consultationsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Consultation[];
      setConsultations(data);
      setLoadingData(false);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  const handleStatusChange = async (consultationId: string, newStatus: string) => {
    const db = getFirestore(app);
    const consultationRef = doc(db, 'consultations', consultationId);
    await updateDoc(consultationRef, { status: newStatus });
  };

  const handleDelete = async (consultationId: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta consulta?')) return;
    const db = getFirestore(app);
    const consultationRef = doc(db, 'consultations', consultationId);
    await deleteDoc(consultationRef);
  };

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h1>
          <p className="text-gray-600 mb-6">Necesitas iniciar sesión como administrador</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'not-interested': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending': return '⏳ Pendiente';
      case 'contacted': return '📞 Contactado';
      case 'completed': return '✅ Completado';
      case 'not-interested': return '❌ No interesa';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Control CRM</h1>
              <p className="text-gray-600 mt-1">Gestión de Consultas</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✅ {user.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Consultas</div>
            <div className="text-3xl font-bold text-gray-900">{consultations.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Pendientes</div>
            <div className="text-3xl font-bold text-yellow-600">
              {consultations.filter(c => c.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Contactados</div>
            <div className="text-3xl font-bold text-blue-600">
              {consultations.filter(c => c.status === 'contacted').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Completados</div>
            <div className="text-3xl font-bold text-green-600">
              {consultations.filter(c => c.status === 'completed').length}
            </div>
          </div>
        </div>

        {/* Consultations List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Consultas Recibidas</h2>
          </div>
          
          {loadingData ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando consultas...</p>
            </div>
          ) : consultations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-medium">No hay consultas aún</p>
              <p className="text-gray-500 text-sm mt-2">Las nuevas consultas aparecerán aquí automáticamente</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {consultations.map((consultation) => (
                <div key={consultation.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{consultation.userName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                          {getStatusLabel(consultation.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <p>📧 {consultation.userEmail}</p>
                        <p>📅 {consultation.preferredDate} • {consultation.preferredTime}</p>
                        <p>📝 {consultation.services?.join(', ')}</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{consultation.notes}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <select
                          value={consultation.status}
                          onChange={(e) => handleStatusChange(consultation.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">⏳ Pendiente</option>
                          <option value="contacted">📞 Contactado</option>
                          <option value="completed">✅ Completado</option>
                          <option value="not-interested">❌ No interesa</option>
                        </select>
                        
                        <button
                          onClick={() => setSelectedConsultation(consultation)}
                          className="text-sm bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors"
                        >
                          Ver Detalle
                        </button>
                        
                        <button
                          onClick={() => handleDelete(consultation.id)}
                          className="text-sm bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalle */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedConsultation(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Detalle de Consulta</h2>
              <button onClick={() => setSelectedConsultation(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Cliente</label>
                <p className="text-lg">{selectedConsultation.userName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-lg">{selectedConsultation.userEmail}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha Preferida</label>
                  <p>{selectedConsultation.preferredDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Hora</label>
                  <p>{selectedConsultation.preferredTime}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Servicios</label>
                <p>{selectedConsultation.services?.join(', ')}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Detalle de la Consulta</label>
                <div className="bg-gray-50 rounded-lg p-4 mt-2">
                  <p className="whitespace-pre-wrap">{selectedConsultation.notes}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <select
                  value={selectedConsultation.status}
                  onChange={(e) => {
                    handleStatusChange(selectedConsultation.id, e.target.value);
                    setSelectedConsultation({...selectedConsultation, status: e.target.value});
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">⏳ Pendiente</option>
                  <option value="contacted">📞 Contactado</option>
                  <option value="completed">✅ Completado</option>
                  <option value="not-interested">❌ No interesa</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedConsultation(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              <a
                href={`mailto:${selectedConsultation.userEmail}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;