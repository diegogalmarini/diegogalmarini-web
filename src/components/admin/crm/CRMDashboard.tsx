// Componente principal del dashboard CRM
// Integra todos los módulos y muestra métricas principales

import React, { useState, useCallback, useMemo } from 'react';
import type {
  Consultation,
  Client,
  Appointment,
  DashboardMetrics
} from '../../../types/crm';
import {
  useConsultations,
  useClients,
  useAppointments,
  useFollowUps,
  useDashboardMetrics
} from '../../../hooks/useCRM';
import Badge, { StatusBadge } from './ui/Badge';
import Button, { PrimaryButton } from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';
import Alert from './ui/Alert';
import Modal from './ui/Modal';
import SimpleModal from './ui/SimpleModal';
import Table from './ui/Table';
import { formatDate, formatDateTime, isToday, isTomorrow } from '../../../utils/dateUtils';

// Importar componentes específicos
import ConsultationForm from './consultations/ConsultationForm';
import ConsultationDetail from './consultations/ConsultationDetail';
import FollowUpForm from './consultations/FollowUpForm';
import ClientForm from './clients/ClientForm';
import ClientDetail from './clients/ClientDetail';
import AppointmentForm from './appointments/AppointmentForm';
import AppointmentDetail from './appointments/AppointmentDetail';

import {
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Props del componente
interface CRMDashboardProps {
  className?: string;
  onNavigate?: (tab: string) => void;
  openModal?: (type: 'consultation' | 'client' | 'appointment' | 'confirmation' | 'followUp' | null, mode: 'create' | 'edit' | 'view' | 'confirm' | null, data?: any) => void;
}

// Tipos para las vistas
type DashboardView =
  | 'overview'
  | 'consultations'
  | 'clients'
  | 'appointments'
  | 'plans'
  | 'calendar'
  | 'availability';

type ModalState = {
  type: 'consultation' | 'client' | 'appointment' | 'confirmation' | 'followUp' | null;
  mode: 'create' | 'edit' | 'view' | 'confirm' | null;
  data?: any;
};

// Componente de métricas interactivas
const InteractiveMetrics: React.FC<{
  metrics: DashboardMetrics;
  onNavigate: (view: DashboardView, filter?: any) => void;
}> = ({ metrics, onNavigate }) => {
  const metricCards = [
    {
      title: 'Consultas pendientes',
      value: metrics.pendingConsultations,
      icon: ExclamationTriangleIcon,
      color: 'yellow',
      description: 'Requieren atención',
      action: () => onNavigate('consultations', { status: 'pending' }),
      actionText: 'Ver consultas pendientes'
    },
    {
      title: 'Citas próximas',
      value: metrics.upcomingAppointments,
      icon: CalendarIcon,
      color: 'blue',
      description: 'Próximas 7 días',
      action: () => onNavigate('appointments', { upcoming: true }),
      actionText: 'Ver citas próximas'
    },
    {
      title: 'Clientes activos',
      value: metrics.activeClients,
      icon: UserGroupIcon,
      color: 'green',
      description: 'En la base de datos',
      action: () => onNavigate('clients', { status: 'active' }),
      actionText: 'Gestionar clientes'
    },
    {
      title: 'Tasa de conversión',
      value: `${metrics.conversionRate}%`,
      icon: ChartBarIcon,
      color: 'purple',
      description: 'Consultas → Clientes',
      action: () => onNavigate('consultations', { showConversion: true }),
      actionText: 'Ver análisis'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <button
            key={index}
            onClick={metric.action}
            className="bg-white rounded-lg border border-gray-200 p-6 text-left hover:shadow-lg hover:border-gray-300 transition-all duration-200 group cursor-pointer"
            title={metric.actionText}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg transition-transform group-hover:scale-110 ${metric.color === 'yellow' ? 'bg-yellow-100 group-hover:bg-yellow-200' :
                  metric.color === 'blue' ? 'bg-blue-100 group-hover:bg-blue-200' :
                    metric.color === 'green' ? 'bg-green-100 group-hover:bg-green-200' :
                      'bg-purple-100 group-hover:bg-purple-200'
                  }`}>
                  <Icon className={`h-6 w-6 ${metric.color === 'yellow' ? 'text-yellow-600' :
                    metric.color === 'blue' ? 'text-blue-600' :
                      metric.color === 'green' ? 'text-green-600' :
                        'text-purple-600'
                    }`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 group-hover:text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 group-hover:text-gray-700">{metric.value}</p>
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Componente de actividad reciente interactiva
const InteractiveRecentActivity: React.FC<{
  consultations: Consultation[];
  appointments: Appointment[];
  clients: Client[];
  onNavigateToItem: (type: 'consultation' | 'appointment' | 'client', item: any) => void;
  onNavigateToSection: (view: DashboardView) => void;
}> = ({ consultations, appointments, clients, onNavigateToItem, onNavigateToSection }) => {
  // Combinar y ordenar actividades recientes
  const recentActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      type: 'consultation' | 'appointment' | 'client';
      title: string;
      description: string;
      date: string;
      status?: string;
      details?: string;
      priority?: string;
      appointmentDate?: string;
      appointmentTime?: string;
    }> = [];

    // Consultas recientes
    if (consultations && consultations.length > 0) {
      consultations
        .filter(consultation => {
          if (!consultation || !consultation.createdAt) return false;
          try {
            const createdDate = new Date(consultation.createdAt);
            return !isNaN(createdDate.getTime());
          } catch (error) {
            console.warn('Invalid consultation date:', consultation.createdAt);
            return false;
          }
        })
        .sort((a, b) => {
          try {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          } catch (error) {
            console.warn('Error sorting consultation dates:', error);
            return 0;
          }
        })
        .slice(0, 5)
        .forEach(consultation => {
          if (consultation && consultation.createdAt) {
            // Determinar el estado de la consulta
            const statusText = consultation.status === 'pending' ? 'Pendiente' :
              consultation.status === 'contacted' ? 'Contactado' :
                consultation.status === 'scheduled' ? 'Programada' :
                  consultation.status === 'completed' ? 'Completada' : 'En proceso';


            // Detalles adicionales
            const details = [
              consultation.planType ? `Plan: ${consultation.planType}` : '',
              consultation.priority ? `Prioridad: ${consultation.priority}` : '',
              consultation.clientEmail ? `Email: ${consultation.clientEmail}` : ''
            ].filter(Boolean).join(' • ');

            activities.push({
              id: consultation.id,
              type: 'consultation',
              title: `Consulta actualizada: ${consultation.subject || 'Sin asunto'}`,
              description: `De: ${consultation.clientName || 'Cliente'} • Estado: ${statusText}`,
              details: details,
              date: consultation.createdAt,
              status: consultation.status,
              priority: consultation.priority
            });
          }
        });
    }

    // Citas próximas
    if (appointments && appointments.length > 0) {
      appointments
        .filter(apt => {
          if (!apt || !apt.date || !apt.startTime) return false;
          try {
            const appointmentDate = new Date(`${apt.date}T${apt.startTime}`);
            return !isNaN(appointmentDate.getTime()) && appointmentDate > new Date();
          } catch (error) {
            console.warn('Invalid appointment date/time:', apt.date, apt.startTime);
            return false;
          }
        })
        .slice(0, 5)
        .forEach(appointment => {
          if (appointment && appointment.date && appointment.startTime) {
            const appointmentDateTime = `${appointment.date}T${appointment.startTime}`;
            activities.push({
              id: appointment.id,
              type: 'appointment',
              title: `Cita: ${appointment.clientName}`,
              description: `${appointment.planType} - ${formatDate(appointment.date)} ${appointment.startTime}`,
              date: appointmentDateTime,
              status: appointment.status
            });
          }
        });
    }

    // Clientes nuevos
    if (clients && clients.length > 0) {
      clients
        .filter(client => {
          if (!client || !client.registrationDate) return false;
          try {
            const regDate = new Date(client.registrationDate);
            return !isNaN(regDate.getTime());
          } catch (error) {
            console.warn('Invalid client registration date:', client.registrationDate);
            return false;
          }
        })
        .sort((a, b) => {
          try {
            const dateA = new Date(a.registrationDate);
            const dateB = new Date(b.registrationDate);
            return dateB.getTime() - dateA.getTime();
          } catch (error) {
            console.warn('Error sorting client dates:', error);
            return 0;
          }
        })
        .slice(0, 3)
        .forEach(client => {
          if (client && client.registrationDate) {
            activities.push({
              id: client.id,
              type: 'client',
              title: `Nuevo cliente: ${client.name}`,
              description: client.email,
              date: client.registrationDate,
              status: client.status
            });
          }
        });
    }

    return activities
      .sort((a, b) => {
        try {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            return 0;
          }
          return dateB.getTime() - dateA.getTime();
        } catch (error) {
          console.warn('Error sorting activities:', error);
          return 0;
        }
      })
      .slice(0, 10);
  }, [consultations, appointments, clients]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return EnvelopeIcon;
      case 'appointment':
        return CalendarIcon;
      case 'client':
        return UserGroupIcon;
      default:
        return ClockIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'text-blue-600 bg-blue-100';
      case 'appointment':
        return 'text-green-600 bg-green-100';
      case 'client':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Actividad reciente</h3>
            <p className="text-sm text-gray-600 mt-1">Últimas actualizaciones del CRM</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateToSection('overview')}
            className="text-xs"
          >
            Ver todo
          </Button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);

            return (
              <button
                key={`${activity.type}-${activity.id}`}
                onClick={() => {
                  const item = activity.type === 'consultation'
                    ? consultations.find(c => c.id === activity.id)
                    : activity.type === 'appointment'
                      ? appointments.find(a => a.id === activity.id)
                      : clients.find(c => c.id === activity.id);
                  if (item) onNavigateToItem(activity.type, item);
                }}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        {activity.status && (
                          <StatusBadge status={activity.status} />
                        )}
                        <span className="text-xs text-gray-500">
                          {isToday(activity.date) ? 'Hoy' :
                            isTomorrow(activity.date) ? 'Mañana' :
                              formatDate(activity.date)}
                        </span>
                        <svg className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    {activity.details && (
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.details}
                      </p>
                    )}
                    {activity.appointmentDate && (
                      <div className="flex items-center mt-2 text-xs text-blue-600">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Fecha de cita: {formatDate(activity.appointmentDate)}
                        {activity.appointmentTime && ` a las ${activity.appointmentTime}`}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-6 text-center text-gray-500">
            <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay actividad reciente</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de acciones rápidas integradas
const QuickActionsPanel: React.FC<{
  onCreateConsultation: () => void;
  onCreateClient: () => void;
  onCreateAppointment: () => void;
}> = ({ onCreateConsultation, onCreateClient, onCreateAppointment }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Acciones rápidas</h3>
        <p className="text-sm text-gray-600 mt-1">Crear nuevos elementos</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={onCreateConsultation}
            variant="outline"
            className="justify-start h-auto p-4"
          >
            <EnvelopeIcon className="h-5 w-5 mr-3 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Nueva consulta</div>
              <div className="text-sm text-gray-500">Registrar consulta de cliente</div>
            </div>
          </Button>

          <Button
            onClick={onCreateClient}
            variant="outline"
            className="justify-start h-auto p-4"
          >
            <UserGroupIcon className="h-5 w-5 mr-3 text-green-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Nuevo cliente</div>
              <div className="text-sm text-gray-500">Añadir a la base de datos</div>
            </div>
          </Button>

          <Button
            onClick={onCreateAppointment}
            variant="outline"
            className="justify-start h-auto p-4"
          >
            <CalendarIcon className="h-5 w-5 mr-3 text-purple-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Nueva cita</div>
              <div className="text-sm text-gray-500">Programar con cliente</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Wrapper para ClientForm que recarga datos frescos del cliente
interface ClientFormWrapperProps {
  clientId?: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
}

const ClientFormWrapper: React.FC<ClientFormWrapperProps> = ({ clientId, onSubmit, onCancel }) => {
  const { getClientById } = useClients();
  const [client, setClient] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(!!clientId);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadClient = async () => {
      if (!clientId) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 ClientFormWrapper: Loading fresh client data for ID:', clientId);
        setLoading(true);
        setError(null);
        const freshClient = await getClientById(clientId);
        console.log('✅ ClientFormWrapper: Fresh client data loaded:', freshClient);
        setClient(freshClient);
      } catch (err) {
        console.error('❌ ClientFormWrapper: Error loading client:', err);
        setError('Error al cargar los datos del cliente');
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [clientId, getClientById]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Cargando datos del cliente...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <ClientForm
      client={client}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};

// Componente principal
export const CRMDashboard: React.FC<CRMDashboardProps> = ({
  className = '',
  onNavigate,
  openModal: propOpenModal
}) => {
  // Estados locales
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    mode: null,
    data: null
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadConsultations(),
        loadClients(),
        loadAppointments()
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error al refrescar datos:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Hooks para datos
  const { metrics, loading: metricsLoading, error: metricsError } = useDashboardMetrics();

  // useConsultations solo acepta initialFilters
  const { consultations, loadConsultations, updateConsultation, createConsultation, deleteConsultation, loading: consultationsLoading } = useConsultations();

  // useClients solo acepta initialFilters
  const { clients, loadClients, createClient, updateClient, loading: clientsLoading } = useClients();

  const { appointments, loadAppointments, loading: appointmentsLoading } = useAppointments({
    pagination: { page: 1, limit: 10 },
    sort: { field: 'startTime', direction: 'asc' }
  });

  const { createFollowUp } = useFollowUps();

  const isLoading = consultationsLoading || clientsLoading || appointmentsLoading || isRefreshing;

  // Manejadores de modales
  const openModal = useCallback((type: 'consultation' | 'client' | 'appointment' | 'confirmation' | 'followUp' | null, mode: 'create' | 'edit' | 'view' | 'confirm' | null, data?: any) => {
    console.log('🔥 Opening modal:', { type, mode, data });

    // Validación básica para evitar estados inconsistentes
    if (type && !mode) {
      console.warn('⚠️ Intentando abrir modal sin modo especificado');
      return;
    }

    if (propOpenModal) {
      propOpenModal(type as any, mode as any, data);
    } else {
      const newState = { type, mode, data };
      setModalState(newState);
    }
  }, [propOpenModal]);

  const closeModal = useCallback(() => {
    console.log('🔒 Closing modal');
    if (propOpenModal) {
      propOpenModal(null, null, null);
    } else {
      setModalState({ type: null, mode: null, data: null });
    }
  }, [propOpenModal]);

  // Manejadores de acciones rápidas
  const handleCreateConsultation = useCallback(() => {
    openModal('consultation', 'create');
  }, [openModal]);

  const handleCreateClient = useCallback(() => {
    openModal('client', 'create');
  }, [openModal]);

  const handleCreateAppointment = useCallback(() => {
    openModal('appointment', 'create');
  }, [openModal]);

  // Renderizar modal según el estado
  const renderModal = () => {
    if (propOpenModal) return null;
    if (!modalState.type || !modalState.mode) return null;

    const { type, mode, data } = modalState;

    // Renderizado de modales de CONSULTA
    if (type === 'consultation') {
      if (mode === 'create') {
        return (
          <Modal
            isOpen={true}
            onClose={closeModal}
            title="Nueva Consulta"
            size="lg"
          >
            <ConsultationForm
              mode="create"
              onSave={async (consultation) => {
                await createConsultation({
                  ...consultation,
                  status: 'pending',
                  source: 'direct',
                  paymentStatus: 'pending',
                  planType: 'mail',
                  priority: 'medium',
                  clientEmail: consultation.clientEmail || '',
                  consultationCode: 'CONS-' + Date.now(),
                  services: [],
                  clientName: consultation.clientName || 'Cliente',
                  subject: consultation.subject || 'Nueva Consulta',
                  message: consultation.message || ''
                });
                closeModal();
              }}
              onCancel={closeModal}
            />
          </Modal>
        );
      }

      if (mode === 'edit' && data) {
        return (
          <Modal
            isOpen={true}
            onClose={closeModal}
            title="Editar Consulta"
            size="lg"
          >
            <ConsultationForm
              mode="edit"
              consultation={data}
              onSave={async (consultation) => {
                await updateConsultation(consultation.id, consultation);
                closeModal();
              }}
              onCancel={closeModal}
            />
          </Modal>
        );
      }

      if (mode === 'view' && data) {
        // Usar datos frescos de la lista de consultas si es posible
        const liveConsultation = consultations.find(c => c.id === data.id) || data;

        return (
          <Modal
            isOpen={true}
            onClose={closeModal}
            title="Detalle de Consulta"
            size="lg"
          >
            <ConsultationDetail
              consultation={liveConsultation}
              onEdit={() => openModal('consultation', 'edit', liveConsultation)}
              onUpdateStatus={(id, status) => updateConsultation(id, { status: status as any })}
              onUpdatePaymentStatus={(id, paymentStatus) => updateConsultation(id, { paymentStatus })}
              onDelete={() => {
                deleteConsultation(liveConsultation.id);
                closeModal();
              }}
              onRespond={() => {
                console.log('Response sent for:', liveConsultation.id);
                loadConsultations();
              }}
              onCreateFollowUp={() => {
                console.log('Create follow up requested for:', liveConsultation.id);
                openModal('followUp', 'create', { consultationId: liveConsultation.id });
              }}
              onClose={closeModal}
            />
          </Modal>
        );
      }
    }

    // Renderizado de modales de CLIENTE
    if (type === 'client') {
      if (mode === 'create') {
        return (
          <Modal
            isOpen={true}
            onClose={closeModal}
            title="Nuevo Cliente"
            size="lg"
          >
            <ClientForm
              onSubmit={async (clientData) => {
                await createClient({
                  ...clientData,
                  source: 'direct',
                  tags: []
                });
                closeModal();
              }}
              onCancel={closeModal}
            />
          </Modal>
        );
      }

      if (mode === 'edit' && data) {
        return (
          <Modal
            isOpen={true}
            onClose={closeModal}
            title="Editar Cliente"
            size="lg"
          >
            <ClientFormWrapper
              clientId={data.id}
              onSubmit={async (clientData) => {
                console.log('💾 Guardando cliente desde modal...');
                const result = await updateClient(data.id, clientData);
                if (result) {
                  console.log('✅ Cliente actualizado exitosamente, cerrando modal');
                  closeModal();
                } else {
                  console.error('❌ Error al actualizar cliente');
                }
              }}
              onCancel={closeModal}
            />
          </Modal>
        );
      }

      if (mode === 'view' && data) {
        return (
          <Modal
            isOpen={true}
            onClose={closeModal}
            title="Detalle de Cliente"
            size="lg"
          >
            <ClientDetail
              client={data}
              onEdit={() => openModal('client', 'edit', data)}
              onClose={closeModal}
            />
          </Modal>
        );
      }
    }

    // Renderizado de modales de CITA
    if (type === 'appointment') {
      // ... (existing appointment modal logic)
    }

    // Renderizado de modales de SEGUIMIENTO
    if (type === 'followUp' && mode === 'create') {
      return (
        <Modal
          isOpen={true}
          onClose={closeModal}
          title="Nuevo Seguimiento"
          size="md"
        >
          <FollowUpForm
            consultationId={data.consultationId}
            onSave={async (followUpData) => {
              const consultation = consultations.find(c => c.id === data.consultationId);
              const client = clients.find(c => c.email === consultation?.clientEmail);

              if (!client) {
                console.error('Client not found for follow-up');
                // Could show an error toast here
                return;
              }

              await createFollowUp({
                ...followUpData,
                consultationId: data.consultationId,
                clientId: client.id,
                assignedTo: 'admin', // TODO: Use actual logged in user ID
                status: 'pending'
              });
              closeModal();
            }}
            onCancel={closeModal}
          />
        </Modal>
      );
    }

    // Renderizado de modales de CITA (original comment was here, keeping context)
    if (type === 'appointment') {
      if (mode === 'create') {
        return (
          <Modal
            isOpen={true}
            onClose={closeModal}
            title="Nueva Cita"
            size="lg"
          >
            <AppointmentForm
              preselectedDate={data?.date ? new Date(data.date) : undefined}
              onSubmit={async (appointmentData) => {
                // Lógica de creación de cita
                console.log('Crear cita:', appointmentData);
                closeModal();
                loadAppointments();
              }}
              onCancel={closeModal}
            />
          </Modal>
        );
      }

      if (mode === 'edit' && data) {
        return (
          <Modal
            isOpen={true}
            onClose={closeModal}
            title="Editar Cita"
            size="lg"
          >
            <AppointmentForm
              appointment={data}
              onSubmit={async (appointmentData) => {
                // Lógica de actualización
                console.log('Actualizar cita:', appointmentData);
                closeModal();
                loadAppointments();
              }}
              onCancel={closeModal}
            />
          </Modal>
        );
      }

      if (mode === 'view' && data) {
        return (
          <Modal
            isOpen={true}
            onClose={closeModal}
            title="Detalle de Cita"
            size="lg"
          >
            <AppointmentDetail
              appointment={data}
              onEdit={() => openModal('appointment', 'edit', data)}
              onClose={closeModal}
            />
          </Modal>
        );
      }
    }

    // Renderizado de modal de CONFIRMACIÓN
    if (type === 'confirmation' && mode === 'confirm' && data) {
      return (
        <SimpleModal
          isOpen={true}
          onClose={() => closeModal()}
          title="Confirmar acción"
        >
          <div className="space-y-4">
            <p className="text-gray-600">{data?.message || '¿Está seguro de realizar esta acción?'}</p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => closeModal()}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (data?.onConfirm) {
                    data.onConfirm();
                  }
                  closeModal();
                }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </SimpleModal>
      );
    }

    return null;
  };

  // Renderizar contenido
  const renderDashboardContent = () => (
    <div className="space-y-8">
      {/* Métricas */}
      {metricsLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : metricsError ? (
        <Alert type="error" title="Error" message={metricsError} />
      ) : metrics ? (
        <InteractiveMetrics
          metrics={metrics}
          onNavigate={(view) => {
            // Map dashboard views to CRMPage tabs
            const tabMap: Record<string, string> = {
              'consultations': 'consultations',
              'appointments': 'appointments',
              'clients': 'clients',
              'calendar': 'appointments', // Map calendar to appointments tab
              'availability': 'availability',
              'plans': 'plans'
            };
            if (onNavigate) {
              onNavigate(tabMap[view] || 'dashboard');
            }
          }}
        />
      ) : null}

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Actividad reciente */}
        <div className="lg:col-span-2">
          <InteractiveRecentActivity
            consultations={consultations}
            appointments={appointments}
            clients={clients}
            onNavigateToItem={(type, item) => {
              openModal(type, 'view', item);
            }}
            onNavigateToSection={(view) => {
              const tabMap: Record<string, string> = {
                'consultations': 'consultations',
                'appointments': 'appointments',
                'clients': 'clients',
                'calendar': 'appointments',
                'availability': 'availability',
                'plans': 'plans',
                'overview': 'dashboard'
              };
              if (onNavigate) {
                onNavigate(tabMap[view] || 'dashboard');
              }
            }}
          />
        </div>

        {/* Acciones rápidas */}
        <div>
          <QuickActionsPanel
            onCreateConsultation={handleCreateConsultation}
            onCreateClient={handleCreateClient}
            onCreateAppointment={handleCreateAppointment}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona consultas, clientes y citas desde un solo lugar
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center text-sm text-gray-500 mr-4">
              <span className="mr-2">
                Actualizado: {lastUpdated.toLocaleTimeString()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                title="Actualizar datos"
              >
                <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => onNavigate('availability')}
              className="flex items-center"
            >
              <Cog6ToothIcon className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {renderDashboardContent()}
      </div>

      {/* Modales */}
      {renderModal()}
    </div>
  );
};

export default CRMDashboard;