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
  ArrowUturnLeftIcon as Reply,
  CheckCircleIcon
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
  onUpdateStatus?: (id: string, status: string) => void;
  onClose?: () => void;
  className?: string;
}

// Componente para mostrar el historial de comunicaciones
interface CommunicationHistoryProps {
  logs: CommunicationLog[];
  loading: boolean;
  error: string | null;
  className?: string;
}

const CommunicationHistory: React.FC<CommunicationHistoryProps> = ({
  logs,
  loading,
  error,
  className = ''
}) => {
  // Ordenar logs por fecha (más recientes primero)
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [logs]);

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

  if (!sortedLogs || !sortedLogs.length) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No hay comunicaciones registradas para esta consulta</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="font-medium text-gray-900 mb-4 flex items-center">
        <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
        Historial de Comunicaciones ({sortedLogs.length})
      </h4>

      {sortedLogs.map((log, index) => {
        const logDate = parseISO(log.date);
        const isToday = format(logDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
        const isYesterday = format(logDate, 'yyyy-MM-dd') === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

        let dateLabel = '';
        if (isToday) {
          dateLabel = 'Hoy';
        } else if (isYesterday) {
          dateLabel = 'Ayer';
        } else {
          dateLabel = format(logDate, 'dd/MM/yyyy', { locale: es });
        }

        return (
          <div key={log.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
            {/* Header estilo Gmail */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.direction === 'inbound'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-green-100 text-green-600'
                    }`}>
                    {log.direction === 'inbound' ? (
                      <EnvelopeIcon className="h-4 w-4" />
                    ) : (
                      <Reply className="h-4 w-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {log.direction === 'inbound' ? 'Cliente' : 'Diego Galmarini'}
                      </span>
                      <Badge
                        variant={log.type === 'email' ? 'info' : log.type === 'call' ? 'success' : 'secondary'}
                        size="sm"
                      >
                        {log.type === 'email' ? 'Email' : log.type === 'call' ? 'Llamada' : 'Nota'}
                      </Badge>

                      <Badge
                        variant={log.status === 'sent' ? 'success' : log.status === 'delivered' ? 'info' : 'warning'}
                        size="sm"
                      >
                        {log.status === 'sent' ? 'Enviado' :
                          log.status === 'delivered' ? 'Entregado' :
                            log.status === 'read' ? 'Leído' : 'Pendiente'}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-500 mt-1">
                      {dateLabel} a las {format(logDate, 'HH:mm', { locale: es })}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  #{index + 1}
                </div>
              </div>
            </div>

            {/* Contenido del mensaje */}
            <div className="p-4">
              <div className="mb-3">
                <h5 className="font-medium text-gray-900 mb-1">{log.subject}</h5>
              </div>

              <div className="prose prose-sm max-w-none text-gray-700">
                <div className="whitespace-pre-wrap">{log.content}</div>
              </div>

              {log.templateId && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="inline-flex items-center text-xs text-gray-500">
                    <DocumentTextIcon className="h-3 w-3 mr-1" />
                    Plantilla utilizada
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
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
  // TODO: Implementar filtrado por consultationId cuando esté disponible
  // Por ahora, useFollowUps solo carga seguimientos pendientes
  const { followUps, loading, error, completeFollowUp } = useFollowUps();

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

  if (!followUps || !followUps.length) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No hay seguimientos programados</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {followUps && followUps.map((followUp) => {
        const isOverdue = new Date(followUp.dueDate) < new Date() && followUp.status !== 'completed';

        return (
          <div
            key={followUp.id}
            className={`border rounded-lg p-4 ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
              }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{followUp.title}</h4>
                {isOverdue && (
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                )}
              </div>

              <div className="flex items-center space-x-2">
                {followUp.status !== 'completed' && (
                  <button
                    onClick={() => completeFollowUp(followUp.id)}
                    className="p-1 hover:bg-green-100 rounded-full transition-colors text-gray-400 hover:text-green-600"
                    title="Marcar como completado"
                  >
                    <CheckCircleIcon className="h-6 w-6" />
                  </button>
                )}
                <StatusBadge status={followUp.status} />
              </div>
            </div>

            <p className="text-gray-700 mb-3">{followUp.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Vence: {followUp.dueDate ? format(parseISO(followUp.dueDate), 'dd MMM yyyy', { locale: es }) : 'Sin fecha'}
              </span>

              {followUp.completedAt && (
                <span>
                  Completado: {followUp.completedAt ? format(parseISO(followUp.completedAt), 'dd MMM yyyy', { locale: es }) : 'Sin fecha'}
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
  onUpdateStatus,
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'communications' | 'followups'>('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);

  // Hook para logs de comunicación (elevado)
  const { logs: communicationLogs, loading: logsLoading, error: logsError, loadLogs } = useCommunicationLogs(undefined, consultation.id);

  // Calcular tiempo transcurrido desde la creación
  const timeElapsed = useMemo(() => {
    if (!consultation.createdAt) return 'Sin fecha';
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

  const handleResponseSubmit = useCallback(async (responseData: any) => {
    if (onRespond) {
      onRespond();
    }
    // Recargar logs
    await loadLogs();
    setShowResponseModal(false);
  }, [onRespond, loadLogs]);

  // Manejar cambio de estado
  const handleStatusChange = useCallback((newStatus: string) => {
    if (onUpdateStatus && consultation.id) {
      onUpdateStatus(consultation.id, newStatus);
    }
  }, [onUpdateStatus, consultation.id]);

  // Determinar si se puede responder
  const canRespond = consultation.status === 'pending';

  // Determinar qué botones de estado mostrar
  const canConfirm = consultation.status === 'pending';
  const canComplete = ['pending', 'contacted', 'scheduled'].includes(consultation.status);

  // ... (rest of the component)

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <EnvelopeIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {consultation.subject || 'Consulta sin asunto'}
            </h2>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>Creada {timeElapsed}</span>
              <span className="mx-2">•</span>
              <span>ID: {consultation.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {canConfirm && (
            <Button
              variant="success"
              size="sm"
              onClick={() => handleStatusChange('confirmed')}
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Confirmar
            </Button>
          )}

          {canComplete && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStatusChange('completed')}
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Completar
            </Button>
          )}

          <div className="h-6 w-px bg-gray-300 mx-2"></div>

          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              title="Editar consulta"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteClick}
              title="Eliminar consulta"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px px-6 space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Detalles
          </button>

          <button
            onClick={() => setActiveTab('communications')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === 'communications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
            Comunicaciones
            {communicationLogs.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {communicationLogs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('followups')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === 'followups'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Seguimientos
          </button>
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="p-6">
        {activeTab === 'details' && (
          // ... (Details tab content remains unchanged)
          <div className="space-y-6">
            {/* Información del cliente */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <StatusBadge status={consultation.status} />
                <Badge variant="info" size="sm">
                  {consultation.priority}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Cliente</h4>
                  <p className="mt-1 text-base text-gray-900">{consultation.clientName}</p>
                  <p className="text-sm text-gray-500">{consultation.clientEmail}</p>
                  {consultation.clientPhone && (
                    <p className="text-sm text-gray-500">{consultation.clientPhone}</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Detalles del Plan</h4>
                  <div className="mt-1 flex items-center space-x-2">
                    <PlanTypeBadge planType={consultation.planType} />
                    {consultation.customDuration && (
                      <span className="text-sm text-gray-500">
                        {consultation.customDuration} min
                      </span>
                    )}
                  </div>
                  {consultation.customPrice && (
                    <p className="mt-1 text-sm text-gray-900 font-medium">
                      ${consultation.customPrice}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Mensaje */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Mensaje</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">{consultation.message}</p>
              </div>
            </div>

            {/* Preferencias de Horario */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Preferencias de Horario</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Fecha Solicitada</p>
                  <p className="text-sm text-gray-900">
                    {consultation.startTime ? format(parseISO(consultation.startTime), 'dd MMMM yyyy', { locale: es }) : 'No especificada'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Hora</p>
                  <p className="text-sm text-gray-900">
                    {consultation.startTime ? format(parseISO(consultation.startTime), 'HH:mm', { locale: es }) : 'No especificada'}
                  </p>
                </div>
              </div>
            </div>

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
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Información del sistema</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">ID de consulta</p>
                  <p className="text-gray-600 font-mono">{consultation.id}</p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Fecha de creación</p>
                  <p className="text-gray-600">
                    {consultation.createdAt ? format(parseISO(consultation.createdAt), 'dd MMMM yyyy HH:mm', { locale: es }) : 'Sin fecha'}
                  </p>
                </div>

                {consultation.updatedAt && (
                  <div>
                    <p className="font-medium text-gray-700">Última actualización</p>
                    <p className="text-gray-600">
                      {consultation.updatedAt ? format(parseISO(consultation.updatedAt), 'dd MMMM yyyy HH:mm', { locale: es }) : 'Sin fecha'}
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

            <CommunicationHistory
              logs={communicationLogs}
              loading={logsLoading}
              error={logsError}
            />
          </div>
        )}

        {activeTab === 'followups' && (
          // ... (Followups tab content remains unchanged)
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

      {/* ... (Modals remain unchanged) */}
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

      <ResponseForm
        consultation={consultation}
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        onSuccess={handleResponseSubmit}
      />
    </div>
  );
};

export default ConsultationDetail;