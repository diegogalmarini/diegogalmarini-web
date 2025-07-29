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
import ConsultationList from './consultations/ConsultationList';
import ConsultationForm from './consultations/ConsultationForm';
import ConsultationDetail from './consultations/ConsultationDetail';
import ClientList from './clients/ClientList';
import ClientForm from './clients/ClientForm';
import ClientDetail from './clients/ClientDetail';
import AppointmentList from './appointments/AppointmentList';
import AppointmentForm from './appointments/AppointmentForm';
import AppointmentDetail from './appointments/AppointmentDetail';
import AvailabilityManager from './availability/AvailabilityManager';
import PlanManager from './plans/PlanManager';
import { Calendar } from './ui/Calendar';

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
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

// Props del componente
interface CRMDashboardProps {
  className?: string;
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
  type: 'consultation' | 'client' | 'appointment' | 'confirmation' | null;
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
                <div className={`p-3 rounded-lg transition-transform group-hover:scale-110 ${
                  metric.color === 'yellow' ? 'bg-yellow-100 group-hover:bg-yellow-200' :
                  metric.color === 'blue' ? 'bg-blue-100 group-hover:bg-blue-200' :
                  metric.color === 'green' ? 'bg-green-100 group-hover:bg-green-200' :
                  'bg-purple-100 group-hover:bg-purple-200'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    metric.color === 'yellow' ? 'text-yellow-600' :
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
            activities.push({
              id: consultation.id,
              type: 'consultation',
              title: `Nueva consulta: ${consultation.subject}`,
              description: `De ${consultation.clientName}`,
              date: consultation.createdAt,
              status: consultation.status
            });
          }
        });
    }

    // Citas próximas
    if (appointments && appointments.length > 0) {
      appointments
        .filter(apt => {
          if (!apt || !apt.date || !apt.time) return false;
          try {
            const appointmentDate = new Date(`${apt.date}T${apt.time}`);
            return !isNaN(appointmentDate.getTime()) && appointmentDate > new Date();
          } catch (error) {
            console.warn('Invalid appointment date/time:', apt.date, apt.time);
            return false;
          }
        })
        .slice(0, 5)
        .forEach(appointment => {
          if (appointment && appointment.date && appointment.time) {
            const appointmentDateTime = `${appointment.date}T${appointment.time}`;
            activities.push({
              id: appointment.id,
              type: 'appointment',
              title: `Cita: ${appointment.clientName}`,
              description: `${appointment.planType} - ${formatDate(appointment.date)} ${appointment.time}`,
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
                          <StatusBadge status={activity.status} size="sm" />
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

// Componente principal
export const CRMDashboard: React.FC<CRMDashboardProps> = ({
  className = ''
}) => {
  // Estados locales
  const [currentView, setCurrentView] = useState<DashboardView>('clients');
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    mode: null,
    data: null
  });

  // Hooks para datos
  const { metrics, loading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { consultations } = useConsultations({ 
    pagination: { page: 1, limit: 10 },
    sort: { field: 'createdAt', direction: 'desc' }
  });
  const { clients, loadClients } = useClients({
    pagination: { page: 1, limit: 10 },
    sort: { field: 'registrationDate', direction: 'desc' }
  });
  const { appointments } = useAppointments({
    pagination: { page: 1, limit: 10 },
    sort: { field: 'startTime', direction: 'asc' }
  });

  // Navegación
  const navigationItems = [
    { id: 'overview', label: 'Resumen', icon: ChartBarIcon },
    { id: 'consultations', label: 'Consultas', icon: EnvelopeIcon },
    { id: 'clients', label: 'Clientes', icon: UserGroupIcon },
    { id: 'appointments', label: 'Citas', icon: CalendarIcon },
    { id: 'plans', label: 'Planes', icon: CurrencyDollarIcon },
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
    { id: 'availability', label: 'Disponibilidad', icon: ClockIcon }
  ] as const;

  // Manejadores de modales
  const openModal = useCallback((type: ModalState['type'], mode: ModalState['mode'], data?: any) => {
    console.log('🔥 Opening modal:', { type, mode, data });
    console.log('🔥 Modal state before:', modalState);
    const newState = { type, mode, data };
    setModalState(newState);
    console.log('🔥 Modal state after setModalState called:', newState);
    
    // Verificar después de un pequeño delay que el estado se actualizó
    setTimeout(() => {
      console.log('🔥 Modal state verification after timeout:', modalState);
    }, 100);
  }, []);

  const closeModal = useCallback(() => {
    console.log('Closing modal');
    setModalState({ type: null, mode: null, data: null });
  }, []);

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

  // Renderizar contenido según la vista actual
  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
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
                onNavigate={(view, filter) => {
                  setCurrentView(view);
                  // Aquí se podría aplicar el filtro si es necesario
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
                    setCurrentView(view);
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

      case 'consultations':
        return (
          <ConsultationList
            onConsultationSelect={(consultation) => openModal('consultation', 'view', consultation)}
            onConsultationEdit={(consultation) => openModal('consultation', 'edit', consultation)}
            onConsultationDelete={(consultationId) => {
              console.log('Consulta eliminada:', consultationId);
            }}
            onConsultationRespond={(consultation) => {
              // Manejar respuesta a consulta
              console.log('Responder a consulta:', consultation);
            }}
          />
        );

      case 'clients':
        return (
          <ClientList
            onClientCreate={() => openModal('client', 'create')}
            onClientEdit={(client) => openModal('client', 'edit', client)}
            onClientSelect={(client) => openModal('client', 'view', client)}
            onClientDelete={(clientId) => {
              // La eliminación se maneja internamente en ClientList
              console.log('Cliente eliminado:', clientId);
            }}
          />
        );

      case 'appointments':
        return (
          <AppointmentList
            onCreateAppointment={() => openModal('appointment', 'create')}
            onEditAppointment={(appointment) => openModal('appointment', 'edit', appointment)}
            onViewAppointment={(appointment) => openModal('appointment', 'view', appointment)}
          />
        );

      case 'plans':
        return <PlanManager />;

      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Calendario de Citas</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Vista general de todas las citas programadas
                </p>
              </div>
              <PrimaryButton
                onClick={() => openModal('appointment', 'create')}
                className="flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nueva cita
              </PrimaryButton>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <Calendar
                appointments={appointments}
                onEventClick={(event, date) => {
                  if (event.type === 'appointment') {
                    const appointment = appointments.find(apt => apt.id === event.id);
                    if (appointment) {
                      openModal('appointment', 'view', appointment);
                    }
                  }
                }}
                onDateSelect={(date) => {
                  // Abrir modal de nueva cita con fecha preseleccionada
                  openModal('appointment', 'create', { date: date.toISOString().split('T')[0] });
                }}
                className="p-6"
              />
            </div>
          </div>
        );

      case 'availability':
        return <AvailabilityManager />;

      default:
        return null;
    }
  };

  // Renderizar modal según el estado
  const renderModal = () => {
    console.log('🎭 renderModal called with state:', modalState);
    console.log('🎭 modalState.type:', modalState.type, 'modalState.mode:', modalState.mode);
    
    if (!modalState.type || !modalState.mode) {
      console.log('🎭 Modal state invalid - not rendering:', modalState);
      return null;
    }

    const modalProps = {
      isOpen: true,
      onClose: closeModal,
      size: 'xl' as const
    };

    console.log('🎭 About to render modal with props:', modalProps);
    console.log('🎭 Modal state for rendering:', modalState);

    const getModalTitle = () => {
      const { type, mode, data } = modalState;
      
      if (type === 'consultation') {
        const title = mode === 'create' ? 'Nueva Consulta' : 
                     mode === 'edit' ? 'Editar Consulta' : 
                     'Ver Consulta';
        
        if (mode === 'view' && !data) {
          console.error('No data provided for consultation view mode');
          return 'Ver Consulta - Sin datos';
        }
        
        return title;
      }
      
      if (type === 'client') {
        const title = mode === 'create' ? 'Nuevo Cliente' : 
                     mode === 'edit' ? 'Editar Cliente' : 
                     'Ver Cliente';
        
        if ((mode === 'view' || mode === 'edit') && !data) {
          console.error('No data provided for client mode:', mode);
          return title + ' - Sin datos';
        }
        
        return title;
      }
      
      if (type === 'appointment') {
        const title = mode === 'create' ? 'Nueva Cita' : 
                     mode === 'edit' ? 'Editar Cita' : 
                     'Ver Cita';
        
        if ((mode === 'view' || mode === 'edit') && !data) {
          console.error('No data provided for appointment mode:', mode);
          return title + ' - Sin datos';
        }
        
        return title;
      }
      
      if (type === 'confirmation') {
        return data?.title || 'Confirmar acción';
      }
      
      return 'Modal';
    };

    switch (modalState.type) {
      case 'consultation':
        console.log('🎭 Rendering consultation modal, mode:', modalState.mode);
        if (modalState.mode === 'view') {
          if (!modalState.data) {
            console.error('No consultation data for view mode');
            return null;
          }
          console.log('🎭 Returning consultation detail modal');
          return (
          <SimpleModal {...modalProps} title={getModalTitle()}>
            <ConsultationDetail
              consultation={modalState.data}
              onEdit={(consultation) => openModal('consultation', 'edit', consultation)}
              onClose={closeModal}
            />
          </SimpleModal>
        );
        }
        
        console.log('🎭 Returning consultation form modal');
        return (
          <SimpleModal {...modalProps} title={getModalTitle()}>
            <ConsultationForm
              consultation={modalState.mode === 'edit' ? modalState.data : undefined}
              onSubmit={(data) => {
                console.log('Consultation form submitted:', data);
                closeModal();
              }}
              onCancel={closeModal}
            />
          </SimpleModal>
        );

      case 'client':
        console.log('🎭 Rendering client modal, mode:', modalState.mode, 'data:', modalState.data);
        if (modalState.mode === 'view') {
          console.log('🎭 Returning client detail modal');
          return (
            <SimpleModal {...modalProps} title={getModalTitle()}>
              <ClientDetail
                clientId={modalState.data?.id}
                onEdit={(client) => openModal('client', 'edit', client)}
                onClose={closeModal}
              />
            </SimpleModal>
          );
        }
        console.log('🎭 Returning client form modal');
        return (
          <SimpleModal {...modalProps} title={getModalTitle()}>
            <ClientForm
              client={modalState.mode === 'edit' ? modalState.data : undefined}
              onSubmit={async (data) => {
                console.log('Client form submitted:', data);
                // Recargar la lista de clientes después de crear/editar
                await loadClients();
                closeModal();
              }}
              onCancel={closeModal}
            />
          </SimpleModal>
        );

      case 'appointment':
        console.log('🎭 Rendering appointment modal, mode:', modalState.mode);
        if (modalState.mode === 'view') {
          console.log('🎭 Returning appointment detail modal');
          return (
            <SimpleModal {...modalProps} title={getModalTitle()}>
              <AppointmentDetail
                appointment={modalState.data}
                onEdit={(appointment) => openModal('appointment', 'edit', appointment)}
                onClose={closeModal}
              />
            </SimpleModal>
          );
        }
        console.log('🎭 Returning appointment form modal');
        return (
          <SimpleModal {...modalProps} title={getModalTitle()}>
            <AppointmentForm
              appointment={modalState.mode === 'edit' ? modalState.data : undefined}
              onSubmit={closeModal}
              onCancel={closeModal}
            />
          </SimpleModal>
        );

      case 'confirmation':
        console.log('🎭 Returning confirmation modal');
        return (
          <SimpleModal {...modalProps} title={getModalTitle()}>
            <div className="text-center">
              <p className="text-gray-600 mb-6">{modalState.data?.message}</p>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={closeModal}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    modalState.data?.onConfirm();
                    closeModal();
                  }}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </SimpleModal>
        );

      default:
        console.log('🎭 Default case reached - unknown modal type:', modalState.type);
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona consultas, clientes y citas desde un solo lugar
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setCurrentView('availability')}
                className="flex items-center"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>
        </div>
        
        {/* Navegación */}
        <nav className="px-6">
          <div className="flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    currentView === item.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {renderContent()}
      </div>

      {/* Modales */}
      {renderModal()}
    </div>
  );
};

export default CRMDashboard;