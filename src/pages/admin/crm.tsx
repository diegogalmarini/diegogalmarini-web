import React, { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ClientList,
  ClientForm,
  ConsultationList,
  AppointmentList,
  AvailabilityManager,
  PlanManager,
  BlogManager,
  CRMDashboard,
  Modal,
  LoadingSpinner,
  KanbanBoard
} from '../../components/admin/crm';
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ViewColumnsIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

import ClientDetail from '../../components/admin/crm/clients/ClientDetail';
import ConsultationForm from '../../components/admin/crm/consultations/ConsultationForm';
import ConsultationDetail from '../../components/admin/crm/consultations/ConsultationDetail';
import AppointmentForm from '../../components/admin/crm/appointments/AppointmentForm';
import AppointmentDetail from '../../components/admin/crm/appointments/AppointmentDetail';
import FollowUpForm from '../../components/admin/crm/consultations/FollowUpForm';

import {
  useClients,
  useConsultations,
  useAppointments,
  useFollowUps
} from '../../hooks/useCRM';

type Tab = 'dashboard' | 'kanban' | 'clients' | 'consultations' | 'appointments' | 'availability' | 'plans' | 'blog';

type ModalState = {
  type: 'consultation' | 'client' | 'appointment' | 'followUp' | null;
  mode: 'create' | 'edit' | 'view' | null;
  data?: any;
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
        console.log('🔄 ClientFormWrapper (Page): Loading fresh client data for ID:', clientId);
        setLoading(true);
        setError(null);
        const freshClient = await getClientById(clientId);
        console.log('✅ ClientFormWrapper (Page): Fresh client data loaded:', freshClient);
        setClient(freshClient);
      } catch (err) {
        console.error('❌ ClientFormWrapper (Page): Error loading client:', err);
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

interface CRMPageProps {
  bypassAuth?: boolean;
}

const CRMPage: React.FC<CRMPageProps> = ({ bypassAuth = false }) => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // Clave de refresco para remuntar componentes y actualizar datos de Firestore
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Estado de modales unificado
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    mode: null,
    data: null
  });

  // Hooks de operaciones CRM
  const { createClient, updateClient } = useClients();
  const { createConsultation, updateConsultation, deleteConsultation } = useConsultations();
  const { createAppointment } = useAppointments();
  const { createFollowUp } = useFollowUps();

  const openModal = useCallback((type: ModalState['type'], mode: ModalState['mode'], data?: any) => {
    console.log('🔥 crm.tsx: Opening modal:', { type, mode, data });
    setModalState({ type, mode, data });
  }, []);

  const closeModal = useCallback(() => {
    console.log('🔒 crm.tsx: Closing modal');
    setModalState({ type: null, mode: null, data: null });
  }, []);

  React.useEffect(() => {
    if (bypassAuth) return;

    if (!loading && !user) {
      navigate('/login');
    } else if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, loading, navigate, bypassAuth]);

  // Usuario efectivo (mockeado si se salta la autenticación)
  const effectiveUser = bypassAuth ? { email: 'diegogalmarini@gmail.com' } : user;

  if (!bypassAuth && (loading || !user || !isAdmin)) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      );
    }
    return null;
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'kanban', name: 'Tablero Pipeline', icon: ViewColumnsIcon },
    { id: 'clients', name: 'Clientes', icon: UsersIcon },
    { id: 'consultations', name: 'Consultas', icon: ClipboardDocumentListIcon },
    { id: 'appointments', name: 'Citas', icon: CalendarIcon },
    { id: 'availability', name: 'Disponibilidad', icon: ClockIcon },
    { id: 'plans', name: 'Planes', icon: CurrencyDollarIcon },
    { id: 'blog', name: 'Blog IA', icon: DocumentTextIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CRMDashboard key={`dashboard-${refreshKey}`} onNavigate={(tab) => setActiveTab(tab as Tab)} />;
      case 'kanban':
        return (
          <KanbanBoard
            key={`kanban-${refreshKey}`}
            onConsultationSelect={(consultation) => openModal('consultation', 'view', consultation)}
            onConsultationEdit={(consultation) => openModal('consultation', 'edit', consultation)}
            onFollowUpEdit={(followUp) => openModal('followUp', 'create', { consultationId: followUp.consultationId, clientId: followUp.clientId })}
          />
        );
      case 'clients':
        return (
          <ClientList
            key={`clients-${refreshKey}`}
            onClientCreate={() => openModal('client', 'create')}
            onClientEdit={(client) => openModal('client', 'edit', client)}
            onClientSelect={(client) => openModal('client', 'view', client)}
          />
        );
      case 'consultations':
        return (
          <ConsultationList
            key={`consultations-${refreshKey}`}
            onConsultationEdit={(consultation) => openModal('consultation', 'edit', consultation)}
            onConsultationSelect={(consultation) => openModal('consultation', 'view', consultation)}
            onConsultationRespond={(consultation) => openModal('consultation', 'view', consultation)}
          />
        );
      case 'appointments':
        return (
          <AppointmentList
            key={`appointments-${refreshKey}`}
            onCreateAppointment={() => openModal('appointment', 'create')}
            onEditAppointment={(appointment) => openModal('appointment', 'edit', appointment)}
            onViewAppointment={(appointment) => openModal('appointment', 'view', appointment)}
          />
        );
      case 'availability':
        return <AvailabilityManager key={`availability-${refreshKey}`} />;
      case 'plans':
        return <PlanManager key={`plans-${refreshKey}`} />;
      case 'blog':
        return <BlogManager key={`blog-${refreshKey}`} />;
      default:
        return <CRMDashboard key={`dashboard-${refreshKey}`} onNavigate={(tab) => setActiveTab(tab as Tab)} />;
    }
  };

  const renderModal = () => {
    if (!modalState.type || !modalState.mode) return null;

    const { type, mode, data } = modalState;

    // CLIENT MODALS
    if (type === 'client') {
      if (mode === 'create') {
        return (
          <Modal isOpen={true} onClose={closeModal} title="Nuevo Cliente" size="lg">
            <ClientForm
              onSuccess={() => {
                triggerRefresh();
                closeModal();
              }}
              onCancel={closeModal}
            />
          </Modal>
        );
      }
      if (mode === 'edit' && data) {
        return (
          <Modal isOpen={true} onClose={closeModal} title="Editar Cliente" size="lg">
            <ClientFormWrapper
              clientId={data.id}
              onSubmit={async (clientData) => {
                console.log('💾 Guardando cliente desde página...');
                await updateClient(data.id, clientData);
                triggerRefresh();
                closeModal();
              }}
              onCancel={closeModal}
            />
          </Modal>
        );
      }
      if (mode === 'view' && data) {
        return (
          <Modal isOpen={true} onClose={closeModal} title="Detalle de Cliente" size="lg">
            <ClientDetail
              client={data}
              onEdit={() => openModal('client', 'edit', data)}
              onClose={closeModal}
            />
          </Modal>
        );
      }
    }

    // CONSULTATION MODALS
    if (type === 'consultation') {
      if (mode === 'create') {
        return (
          <Modal isOpen={true} onClose={closeModal} title="Nueva Consulta" size="lg">
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
                } as any);
                triggerRefresh();
                closeModal();
              }}
              onCancel={closeModal}
            />
          </Modal>
        );
      }
      if (mode === 'edit' && data) {
        return (
          <Modal isOpen={true} onClose={closeModal} title="Editar Consulta" size="lg">
            <ConsultationForm
              mode="edit"
              consultation={data}
              onSave={async (consultation) => {
                await updateConsultation(consultation.id, consultation);
                triggerRefresh();
                closeModal();
              }}
              onCancel={closeModal}
            />
          </Modal>
        );
      }
      if (mode === 'view' && data) {
        return (
          <Modal isOpen={true} onClose={closeModal} title="Detalle de Consulta" size="lg">
            <ConsultationDetail
              consultation={data}
              onEdit={() => openModal('consultation', 'edit', data)}
              onUpdateStatus={async (id, status) => {
                await updateConsultation(id, { status: status as any });
                triggerRefresh();
              }}
              onDelete={async () => {
                await deleteConsultation(data.id);
                triggerRefresh();
                closeModal();
              }}
              onRespond={() => {
                console.log('Responder consulta');
                triggerRefresh();
              }}
              onCreateFollowUp={() => {
                openModal('followUp', 'create', { consultationId: data.id, clientId: data.clientEmail });
              }}
              onClose={closeModal}
            />
          </Modal>
        );
      }
    }

    // APPOINTMENT MODALS
    if (type === 'appointment') {
      if (mode === 'create') {
        return (
          <Modal isOpen={true} onClose={closeModal} title="Nueva Cita" size="lg">
            <AppointmentForm
              onSubmit={async () => {
                triggerRefresh();
                closeModal();
              }}
              onCancel={closeModal}
            />
          </Modal>
        );
      }
      if (mode === 'edit' && data) {
        return (
          <Modal isOpen={true} onClose={closeModal} title="Editar Cita" size="lg">
            <AppointmentForm
              appointment={data}
              onSubmit={async () => {
                triggerRefresh();
                closeModal();
              }}
              onCancel={closeModal}
            />
          </Modal>
        );
      }
      if (mode === 'view' && data) {
        return (
          <Modal isOpen={true} onClose={closeModal} title="Detalle de Cita" size="lg">
            <AppointmentDetail
              appointment={data}
              onEdit={() => openModal('appointment', 'edit', data)}
              onClose={closeModal}
            />
          </Modal>
        );
      }
    }

    // FOLLOW-UP TASK MODALS (inside ConsultationDetail)
    if (type === 'followUp' && mode === 'create') {
      return (
        <Modal isOpen={true} onClose={closeModal} title="Crear Tarea de Seguimiento" size="md">
          <FollowUpForm
            consultationId={data?.consultationId || ''}
            onSave={async (followUpData) => {
              await createFollowUp({
                ...followUpData,
                consultationId: data?.consultationId || '',
                clientId: data?.clientId || '',
                status: 'pending',
                assignedTo: 'diegogalmarini@gmail.com'
              } as any);
              triggerRefresh();
              closeModal();
            }}
            onCancel={closeModal}
          />
        </Modal>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="mr-2">🛠️</span> CRM Admin
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {effectiveUser?.email}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  <Icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Modales globales del CRM */}
      {renderModal()}
    </div>
  );
};

export default CRMPage;