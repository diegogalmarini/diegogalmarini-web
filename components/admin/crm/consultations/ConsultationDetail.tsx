// Componente para mostrar detalles completos de una consulta
// Incluye información del cliente, historial de comunicaciones y acciones

import React, { useState, useCallback, useMemo } from 'react';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon, 
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowUturnLeftIcon as Reply
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Consultation, CommunicationLog, FollowUp } from '../../../../types/crm';
import { useCommunicationLogs, useFollowUps } from '../../../../hooks/useCRM';
import Badge, { StatusBadge, PriorityBadge, PlanTypeBadge } from '../ui/Badge';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';
import Modal from '../ui/Modal';
// Removed Dialog import - using Modal instead
import { ResponseForm } from './ResponseForm';

// Props del componente
interface ConsultationDetailProps {
  consultation: Consultation;
  onEdit?: () => void;
  onDelete?: () => void;
  onRespond?: () => void;
  onCreateFollowUp?: () => void;
  onClose?: () => void;
  className?: string;
}

// Componente para mostrar el historial de comunicaciones
interface CommunicationHistoryProps {
  consultationId: string;
  className?: string;
}

const CommunicationHistory: React.FC<CommunicationHistoryProps> = ({
  consultationId,
  className = ''
}) => {
  const { communicationLogs, loading, error } = useCommunicationLogs({
    filters: { consultationId },
    pagination: { page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }
  });

  if (loading) {
    return (
      <div className={`flex justify-center py-4 ${className}`}>
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Error al cargar historial"
        message={error}
        className={className}
      />
    );
  }

  if (!communicationLogs.length) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No hay comunicaciones registradas</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {communicationLogs.map((log) => (
        <div key={log.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Badge 
                variant={log.type === 'email' ? 'primary' : log.type === 'phone' ? 'success' : 'secondary'}
                size="sm"
              >
                {log.type === 'email' ? 'Email' : log.type === 'phone' ? 'Teléfono' : 'Nota'}
              </Badge>
              
              <Badge 
                variant={log.direction === 'inbound' ? 'warning' : 'info'}
                size="sm"
              >
                {log.direction === 'inbound' ? 'Entrante' : 'Saliente'}
              </Badge>
            </div>
            
            <span className="text-sm text-gray-500">
              {format(parseISO(log.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
            </span>
          </div>
          
          {log.subject && (
            <h4 className="font-medium text-gray-900 mb-2">{log.subject}</h4>
          )}
          
          <p className="text-gray-700 whitespace-pre-wrap">{log.content}</p>
          
          {log.attachments && log.attachments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Adjuntos:</p>
              <div className="flex flex-wrap gap-2">
                {log.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    {attachment.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Componente para mostrar seguimientos
interface FollowUpListProps {
  consultationId: string;
  className?: string;
}

const FollowUpList: React.FC<FollowUpListProps> = ({
  consultationId,
  className = ''
}) => {
  const { followUps, loading, error } = useFollowUps({
    filters: { consultationId },
    pagination: { page: 1, limit: 20, sortBy: 'dueDate', sortOrder: 'asc' }
  });

  if (loading) {
    return (
      <div className={`flex justify-center py-4 ${className}`}>
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Error al cargar seguimientos"
        message={error}
        className={className}
      />
    );
  }

  if (!followUps.length) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No hay seguimientos programados</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {followUps.map((followUp) => {
        const isOverdue = new Date(followUp.dueDate) < new Date() && followUp.status !== 'completed';
        
        return (
          <div 
            key={followUp.id} 
            className={`border rounded-lg p-4 ${
              isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{followUp.title}</h4>
                {isOverdue && (
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                )}
              </div>
              
              <StatusBadge status={followUp.status} />
            </div>
            
            <p className="text-gray-700 mb-3">{followUp.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Vence: {format(parseISO(followUp.dueDate), 'dd MMM yyyy', { locale: es })}
              </span>
              
              {followUp.completedAt && (
                <span>
                  Completado: {format(parseISO(followUp.completedAt), 'dd MMM yyyy', { locale: es })}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Componente principal
export const ConsultationDetail: React.FC<ConsultationDetailProps> = ({
  consultation,
  onEdit,
  onDelete,
  onRespond,
  onCreateFollowUp,
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'communications' | 'followups'>('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);

  // Calcular tiempo transcurrido desde la creación
  const timeElapsed = useMemo(() => {
    const created = parseISO(consultation.createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  }, [consultation.createdAt]);

  // Manejar eliminación
  const handleDeleteClick = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteModal(false);
  }, [onDelete]);

  // Manejar respuesta
  const handleRespondClick = useCallback(() => {
    setShowResponseModal(true);
  }, []);

  const handleResponseSubmit = useCallback((responseData: any) => {
    if (onRespond) {
      onRespond();
    }
    setShowResponseModal(false);
  }, [onRespond]);

  // Determinar si se puede responder
  const canRespond = consultation.status === 'pending';

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {consultation.subject || 'Sin asunto'}
            </h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <StatusBadge status={consultation.status} />
              <PriorityBadge priority={consultation.priority} />
              <PlanTypeBadge planType={consultation.planType} />
            </div>
            
            <p className="text-gray-600">{timeElapsed}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {canRespond && (
              <Button
                variant="primary"
                onClick={handleRespondClick}
                className="whitespace-nowrap"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                Responder
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={onEdit}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </Button>
            
            <Button
              variant="danger"
              onClick={handleDeleteClick}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
            
            {onClose && (
              <Button
                variant="ghost"
                onClick={onClose}
              >
                ✕
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { key: 'details', label: 'Detalles', icon: DocumentTextIcon },
            { key: 'communications', label: 'Comunicaciones', icon: ChatBubbleLeftRightIcon },
            { key: 'followups', label: 'Seguimientos', icon: CalendarIcon }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Información del cliente */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Información del cliente
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{consultation.clientName}</p>
                    <p className="text-sm text-gray-500">Nombre</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{consultation.clientEmail}</p>
                    <p className="text-sm text-gray-500">Email</p>
                  </div>
                </div>
                
                {consultation.clientPhone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{consultation.clientPhone}</p>
                      <p className="text-sm text-gray-500">Teléfono</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Descripción</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{consultation.description}</p>
              </div>
            </div>

            {/* Preferencias de cita */}
            {(consultation.preferredDate || consultation.preferredTime) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Preferencias de cita
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {consultation.preferredDate && (
                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {format(parseISO(consultation.preferredDate), 'dd MMMM yyyy', { locale: es })}
                          </p>
                          <p className="text-sm text-gray-500">Fecha preferida</p>
                        </div>
                      </div>
                    )}
                    
                    {consultation.preferredTime && (
                      <div className="flex items-center space-x-3">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{consultation.preferredTime}</p>
                          <p className="text-sm text-gray-500">Hora preferida</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notas */}
            {consultation.notes && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Notas internas</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{consultation.notes}</p>
                </div>
              </div>
            )}

            {/* Metadatos */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Información del sistema</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">ID de consulta</p>
                  <p className="text-gray-600 font-mono">{consultation.id}</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700">Fecha de creación</p>
                  <p className="text-gray-600">
                    {format(parseISO(consultation.createdAt), 'dd MMMM yyyy HH:mm', { locale: es })}
                  </p>
                </div>
                
                {consultation.updatedAt && (
                  <div>
                    <p className="font-medium text-gray-700">Última actualización</p>
                    <p className="text-gray-600">
                      {format(parseISO(consultation.updatedAt), 'dd MMMM yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'communications' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Historial de comunicaciones</h3>
              
              {canRespond && (
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleRespondClick}
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Responder
                  </Button>
              )}
            </div>
            
            <CommunicationHistory consultationId={consultation.id} />
          </div>
        )}

        {activeTab === 'followups' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Seguimientos</h3>
              
              <Button
                variant="primary"
                size="sm"
                onClick={onCreateFollowUp}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Nuevo seguimiento
              </Button>
            </div>
            
            <FollowUpList consultationId={consultation.id} />
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar esta consulta? Esta acción no se puede deshacer.
            </p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              <strong>Consulta:</strong> {consultation.subject || 'Sin asunto'}
            </p>
            <p className="text-sm text-red-700">
              <strong>Cliente:</strong> {consultation.clientName} ({consultation.clientEmail})
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
            >
              Eliminar consulta
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de respuesta */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title="Responder consulta"
        size="2xl"
        showCloseButton
      >
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Envía una respuesta a {consultation.clientName}
          </p>
        </div>
        <ResponseForm
          consultation={consultation}
          onSubmit={handleResponseSubmit}
          onCancel={() => setShowResponseModal(false)}
        />
      </Modal>
    </div>
  );
};

export default ConsultationDetail;