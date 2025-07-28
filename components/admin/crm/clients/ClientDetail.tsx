// Componente de detalle de cliente
// Muestra información completa del cliente, historial de consultas y comunicaciones

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { Client, Consultation, CommunicationLog } from '../../../../types/crm';
import { useClients, useConsultations, useCommunicationLogs } from '../../../../hooks/useCRM';
import Badge, { StatusBadge } from '../ui/Badge';
import Button, { DangerButton } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';
import Modal from '../ui/Modal';
import Table from '../ui/Table';
import { formatDate, formatDateTime } from '../../../../utils/dateUtils';
import { PencilIcon, TrashIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import ConsultationDetail from '../consultations/ConsultationDetail';

// Props del componente
interface ClientDetailProps {
  clientId: string;
  onEdit?: (client: Client) => void;
  onDelete?: (clientId: string) => void;
  onClose?: () => void;
  className?: string;
}

// Componente de información básica del cliente
const ClientInfo: React.FC<{ client: Client }> = ({ client }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
          <p className="text-sm text-gray-600">{client.email}</p>
        </div>
        <StatusBadge status={client.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información de contacto */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Información de contacto</h4>
          
          {client.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <PhoneIcon className="h-4 w-4 mr-2" />
              <span>{client.phone}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            <span>{client.email}</span>
          </div>
          
          {client.address && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-2" />
              <span>{client.address}</span>
            </div>
          )}
        </div>

        {/* Información profesional */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Información profesional</h4>
          
          {client.company && (
            <div className="flex items-center text-sm text-gray-600">
              <BuildingOfficeIcon className="h-4 w-4 mr-2" />
              <span>{client.company}</span>
            </div>
          )}
          
          {client.position && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Cargo:</span> {client.position}
            </div>
          )}
        </div>
      </div>

      {/* Preferencias */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Preferencias</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Contacto preferido:</span>
            <div className="mt-1">
              <Badge variant={client.preferredContactMethod === 'email' ? 'blue' : client.preferredContactMethod === 'phone' ? 'green' : 'purple'}>
                {client.preferredContactMethod === 'email' ? 'Email' : 
                 client.preferredContactMethod === 'phone' ? 'Teléfono' : 'Ambos'}
              </Badge>
            </div>
          </div>
          
          {client.language && (
            <div>
              <span className="font-medium text-gray-700">Idioma:</span>
              <div className="mt-1 text-gray-600">
                {client.language === 'es' ? 'Español' :
                 client.language === 'en' ? 'Inglés' :
                 client.language === 'fr' ? 'Francés' :
                 client.language === 'de' ? 'Alemán' :
                 client.language === 'it' ? 'Italiano' :
                 client.language === 'pt' ? 'Portugués' : client.language}
              </div>
            </div>
          )}
          
          {client.timezone && (
            <div>
              <span className="font-medium text-gray-700">Zona horaria:</span>
              <div className="mt-1 text-gray-600">{client.timezone}</div>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {client.tags && client.tags.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Etiquetas</h4>
          <div className="flex flex-wrap gap-2">
            {client.tags.map((tag) => (
              <Badge key={tag} variant="gray">{tag}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Notas */}
      {client.notes && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Notas</h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{client.notes}</p>
        </div>
      )}

      {/* Metadatos */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>Cliente desde: {formatDate(client.createdAt)}</div>
          <div>Última actualización: {formatDate(client.updatedAt)}</div>
        </div>
      </div>
    </div>
  );
};

// Componente de historial de consultas
const ConsultationHistory: React.FC<{ 
  clientId: string; 
  clientEmail?: string;
  onConsultationSelect?: (consultation: Consultation) => void;
}> = ({ clientId, clientEmail, onConsultationSelect }) => {
  const { consultations, loading, error } = useConsultations({
    filters: { clientEmail: clientEmail || '' }, // Filtrar por email del cliente
    pagination: { page: 1, limit: 10 }
  });

  const consultationColumns = useMemo(() => [
    {
      key: 'subject',
      label: 'Asunto',
      render: (consultation: Consultation) => (
        <button
          onClick={() => onConsultationSelect?.(consultation)}
          className="text-left hover:bg-gray-50 w-full p-2 rounded transition-colors"
        >
          <div className="font-medium text-gray-900 hover:text-blue-600">{consultation?.subject || 'Sin asunto'}</div>
          <div className="text-sm text-gray-500">{consultation?.planType || 'Sin plan'}</div>
        </button>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (consultation: Consultation) => (
        <StatusBadge status={consultation?.status || 'pending'} />
      )
    },
    {
      key: 'priority',
      label: 'Prioridad',
      render: (consultation: Consultation) => (
        <Badge 
          variant={consultation?.priority === 'high' ? 'red' : 
                  consultation?.priority === 'medium' ? 'yellow' : 'gray'}
        >
          {consultation?.priority === 'high' ? 'Alta' :
           consultation?.priority === 'medium' ? 'Media' : 'Baja'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      render: (consultation: Consultation) => formatDate(consultation?.createdAt || new Date())
    }
  ], [onConsultationSelect]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Alert type="error" title="Error" message={error} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Historial de consultas</h3>
        <p className="text-sm text-gray-600 mt-1">
          {consultations.length} consulta{consultations.length !== 1 ? 's' : ''} registrada{consultations.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      {consultations.length > 0 ? (
        <Table
          data={consultations}
          columns={consultationColumns}
          loading={false}
          emptyMessage="No hay consultas registradas"
        />
      ) : (
        <div className="p-6 text-center text-gray-500">
          <p>Este cliente no tiene consultas registradas</p>
        </div>
      )}
    </div>
  );
};

// Componente de historial de comunicaciones
const CommunicationHistory: React.FC<{ clientId: string }> = ({ clientId }) => {
  const { logs: communicationLogs, loading, error } = useCommunicationLogs(clientId);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Alert type="error" title="Error" message={error} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Historial de comunicaciones</h3>
        <p className="text-sm text-gray-600 mt-1">
          {communicationLogs.length} comunicación{communicationLogs.length !== 1 ? 'es' : ''} registrada{communicationLogs.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      {communicationLogs.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {communicationLogs.map((log) => (
            <div key={log.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge 
                      variant={log.type === 'email' ? 'blue' : 
                              log.type === 'call' ? 'green' : 
                              log.type === 'meeting' ? 'purple' : 'gray'}
                    >
                      {log.type === 'email' ? 'Email' :
                       log.type === 'call' ? 'Teléfono' :
                       log.type === 'meeting' ? 'Reunión' : log.type}
                    </Badge>
                    <Badge 
                      variant={log.direction === 'inbound' ? 'green' : 'blue'}
                    >
                      {log.direction === 'inbound' ? 'Entrante' : 'Saliente'}
                    </Badge>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">{log.subject}</h4>
                  
                  {log.content && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                      {log.content}
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    {formatDateTime(log.date)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          <p>No hay comunicaciones registradas</p>
        </div>
      )}
    </div>
  );
};

// Componente principal
export const ClientDetail: React.FC<ClientDetailProps> = ({
  clientId,
  onEdit,
  onDelete,
  onClose,
  className = ''
}) => {
  // Estados locales
  const [activeTab, setActiveTab] = useState<'info' | 'consultations' | 'communications'>('info');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showConsultationDetail, setShowConsultationDetail] = useState(false);

  // Estados para el cliente específico
  const [client, setClient] = useState<Client | null>(null);
  const [clientLoading, setClientLoading] = useState(true);
  const [clientError, setClientError] = useState<string | null>(null);

  // Hooks
  const { deleteClient, getClientById } = useClients();

  // Cargar cliente por ID
  useEffect(() => {
    const loadClient = async () => {
      if (!clientId) {
        setClientError('ID de cliente no proporcionado');
        setClientLoading(false);
        return;
      }

      setClientLoading(true);
      setClientError(null);
      
      try {
        const clientData = await getClientById(clientId);
        if (clientData) {
          setClient(clientData);
        } else {
          setClientError('Cliente no encontrado');
        }
      } catch (error) {
        console.error('Error al cargar cliente:', error);
        setClientError('Error al cargar el cliente');
      } finally {
        setClientLoading(false);
      }
    };

    loadClient();
  }, [clientId, getClientById]);

  // Manejar eliminación
  const handleDelete = useCallback(async () => {
    if (!client) return;
    
    setIsDeleting(true);
    try {
      await deleteClient(client.id);
      setShowDeleteModal(false);
      if (onDelete) {
        onDelete(client.id);
      }
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [client, deleteClient, onDelete]);

  // Pestañas
  const tabs = [
    { id: 'info', label: 'Información', count: null },
    { id: 'consultations', label: 'Consultas', count: null },
    { id: 'communications', label: 'Comunicaciones', count: null }
  ] as const;

  if (clientLoading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (clientError || !client) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <Alert 
          type="error" 
          title="Error" 
          message={clientError || 'Cliente no encontrado'} 
        />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Detalle del cliente</h2>
            <p className="text-sm text-gray-600 mt-1">
              Información completa y historial de {client.name}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {onEdit && (
              <Button
                variant="outline"
                onClick={() => onEdit(client)}
                className="flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            
            {onDelete && (
              <DangerButton
                variant="outline"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Eliminar
              </DangerButton>
            )}
            
            {onClose && (
              <Button
                variant="ghost"
                onClick={onClose}
              >
                Cerrar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="p-6">
        {activeTab === 'info' && <ClientInfo client={client} />}
        {activeTab === 'consultations' && (
          <ConsultationHistory 
            clientId={client.id} 
            clientEmail={client.email}
            onConsultationSelect={(consultation) => {
              setSelectedConsultation(consultation);
              setShowConsultationDetail(true);
            }}
          />
        )}
        {activeTab === 'communications' && <CommunicationHistory clientId={client.id} />}
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar cliente"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que quieres eliminar a <strong>{client.name}</strong>?
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Advertencia
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Esta acción no se puede deshacer. Se eliminarán todos los datos 
                    asociados al cliente, incluyendo consultas y comunicaciones.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            
            <DangerButton
              onClick={handleDelete}
              disabled={isDeleting}
              className="min-w-[100px]"
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </DangerButton>
          </div>
        </div>
      </Modal>

      {/* Modal de detalle de consulta */}
      <Modal
        isOpen={showConsultationDetail}
        onClose={() => {
          setShowConsultationDetail(false);
          setSelectedConsultation(null);
        }}
        title="Detalle de consulta"
        size="xl"
      >
        {selectedConsultation && (
          <ConsultationDetail
            consultationId={selectedConsultation.id}
            onClose={() => {
              setShowConsultationDetail(false);
              setSelectedConsultation(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default ClientDetail;