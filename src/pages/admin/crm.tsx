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
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ArrowLeftOnRectangleIcon
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
  
  // Estados de la barra lateral responsive estilo Gemini / Claude / ChatGPT
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Dispositivos móviles
  const [isCollapsed, setIsCollapsed] = useState(false); // Colapso en escritorio
  
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
    { id: 'blog', name: 'Blog', icon: DocumentTextIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <CRMDashboard
            key={`dashboard-${refreshKey}`}
            onNavigate={(tab) => setActiveTab(tab as Tab)}
            openModal={openModal}
          />
        );
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
        return (
          <AvailabilityManager
            key={`availability-${refreshKey}`}
            onViewConsultation={(consultation) => openModal('consultation', 'view', consultation)}
            onViewAppointment={(appointment) => openModal('appointment', 'view', appointment)}
            onCreateConsultation={(initialDate) => openModal('consultation', 'create', initialDate ? { startTime: initialDate.toISOString() } : undefined)}
            onCreateAppointment={(initialDate) => openModal('appointment', 'create', initialDate ? { date: initialDate } : undefined)}
            onNavigate={(tab) => setActiveTab(tab as Tab)}
          />
        );
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
          <Modal key={`client-view-${data.id}`} isOpen={true} onClose={closeModal} plain={true} size="2xl">
            <ClientDetail
              client={data}
              onEdit={() => openModal('client', 'edit', data)}
              onConsultationSelect={(consultation) => {
                console.log('🔄 Abrir consulta desde detalle de cliente:', consultation);
                openModal('consultation', 'view', consultation);
              }}
              onClose={closeModal}
            />
          </Modal>
        );
      }
    }

    // CONSULTATION MODALS
    if (type === 'consultation') {
      if (mode === 'create') {
        const defaultData = data || {};
        return (
          <Modal isOpen={true} onClose={closeModal} title="Nueva Consulta" size="lg">
            <ConsultationForm
              mode="create"
              consultation={defaultData}
              onSave={async (consultation) => {
                await createConsultation({
                  status: 'pending',
                  source: 'direct',
                  paymentStatus: 'pending',
                  planType: 'mail',
                  priority: 'medium',
                  clientEmail: consultation.clientEmail || '',
                  clientName: consultation.clientName || 'Cliente',
                  subject: consultation.subject || 'Nueva Consulta',
                  message: consultation.message || '',
                  ...defaultData,
                  ...consultation,
                  consultationCode: 'CONS-' + Date.now(),
                  services: consultation.services || [],
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
          <Modal key={`consultation-view-${data.id}`} isOpen={true} onClose={closeModal} plain={true} size="2xl">
            <ConsultationDetail
              consultation={data}
              onEdit={() => openModal('consultation', 'edit', data)}
              onUpdateStatus={async (id, status) => {
                await updateConsultation(id, { status: status as any });
                setModalState(prev => {
                  if (prev.type === 'consultation' && prev.data?.id === id) {
                    return {
                      ...prev,
                      data: { ...prev.data, status }
                    };
                  }
                  return prev;
                });
                triggerRefresh();
              }}
              onUpdatePaymentStatus={async (id, paymentStatus) => {
                await updateConsultation(id, { paymentStatus });
                setModalState(prev => {
                  if (prev.type === 'consultation' && prev.data?.id === id) {
                    return {
                      ...prev,
                      data: { ...prev.data, paymentStatus }
                    };
                  }
                  return prev;
                });
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
        const preselectedDate = data instanceof Date ? data : (data?.date ? new Date(data.date) : undefined);
        const preselectedClientId = data?.clientId;
        return (
          <Modal isOpen={true} onClose={closeModal} title="Nueva Cita" size="lg">
            <AppointmentForm
              preselectedDate={preselectedDate}
              preselectedClientId={preselectedClientId}
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
    <div className="flex h-screen bg-gray-50 text-gray-800 overflow-hidden font-sans">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-gray-900">CRM Admin</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-500 hover:text-gray-800 bg-transparent border-0 cursor-pointer"
        >
          {isSidebarOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sleek Left Sidebar - Clean White/Light Theme */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 h-full bg-white text-gray-700
        border-r border-gray-200 flex flex-col shrink-0
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Header / Logo Area */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div
            className={`flex items-center gap-3 px-2 py-1 cursor-pointer hover:opacity-80 transition-all overflow-hidden ${isCollapsed ? 'md:w-0 md:p-0 md:opacity-0' : 'w-auto'}`}
            onClick={() => navigate('/')}
          >
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-bold text-sm text-gray-950 leading-none">CRM Admin</span>
              <span className="text-[10px] text-gray-550 mt-1 font-medium">Diego Galmarini</span>
            </div>
          </div>

          {/* Collapse Toggle Button (Visible only on desktop) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:flex p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 bg-transparent border-0 cursor-pointer transition-transform duration-300 ${isCollapsed ? 'rotate-180 mx-auto' : ''}`}
            title={isCollapsed ? "Expandir panel" : "Colapsar panel"}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs - ChatGPT/Claude style layout */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-none custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as Tab);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center rounded-xl text-[13px] font-semibold transition-all group relative border-0 cursor-pointer
                  ${isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } 
                  ${isCollapsed ? 'justify-center py-3' : 'px-3.5 py-2.5 gap-3'}
                `}
                title={isCollapsed ? tab.name : ''}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-450 group-hover:text-gray-600'}`} />
                <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
                  {tab.name}
                </span>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap shadow-md">
                    {tab.name}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer: User profile and Exit link - Clean & Premium */}
        <div className="p-3 border-t border-gray-200 shrink-0">
          {/* Volver a la web */}
          <button
            onClick={() => navigate('/')}
            className={`w-full flex items-center text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all border-0 cursor-pointer ${isCollapsed ? 'justify-center py-3' : 'px-3.5 py-2.5 gap-3.5'}`}
            title={isCollapsed ? 'Ir al sitio público' : ''}
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
            <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
              Volver al sitio
            </span>
          </button>

          {/* User Email Profile display */}
          <div className={`mt-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 overflow-hidden transition-all duration-350 ${isCollapsed ? 'h-0 py-0 opacity-0 border-0 mt-0' : 'h-auto opacity-100'}`}>
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0">
              {effectiveUser?.email ? effectiveUser.email.slice(0, 2) : 'DG'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold text-gray-800 truncate leading-tight">
                Diego Galmarini
              </span>
              <span className="text-[9px] text-gray-550 truncate leading-none mt-0.5">
                {effectiveUser?.email}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Full screen */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          <div className="max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Overlay for mobile drawer */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-20 md:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Modales globales del CRM */}
      {renderModal()}
    </div>
  );
};

export default CRMPage;