// Componente de lista de citas
// Gestiona la visualización y operaciones de las citas programadas

import React, { useState, useCallback, useMemo } from 'react';
import type { Appointment, AppointmentFilters } from '../../../../types/crm';
import { useAppointments, useClients } from '../../../../hooks/useCRM';
import Table from '../ui/Table';
import Button, { PrimaryButton } from '../ui/Button';
import { Input, Select } from '../ui/FormField';
import Badge, { StatusBadge } from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';
import Modal from '../ui/Modal';
import { formatDate, formatTime, formatDateTime } from '../../../../utils/dateUtils';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// Props del componente
interface AppointmentListProps {
  onCreateAppointment?: () => void;
  onEditAppointment?: (appointment: Appointment) => void;
  onViewAppointment?: (appointment: Appointment) => void;
  className?: string;
}

// Componente de estadísticas rápidas
const QuickStats: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {
  const stats = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      today: appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate.toDateString() === today.toDateString() && apt.status !== 'cancelled';
      }).length,
      upcoming: appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate > today && apt.status === 'scheduled';
      }).length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
      total: appointments.length
    };
  }, [appointments]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <CalendarIcon className="h-8 w-8 text-blue-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-blue-600">Hoy</p>
            <p className="text-2xl font-semibold text-blue-900">{stats.today}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <ClockIcon className="h-8 w-8 text-green-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-green-600">Próximas</p>
            <p className="text-2xl font-semibold text-green-900">{stats.upcoming}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center">
          <UserIcon className="h-8 w-8 text-purple-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-purple-600">Completadas</p>
            <p className="text-2xl font-semibold text-purple-900">{stats.completed}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <CalendarIcon className="h-8 w-8 text-gray-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Total</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal
export const AppointmentList: React.FC<AppointmentListProps> = ({
  onCreateAppointment,
  onEditAppointment,
  onViewAppointment,
  className = ''
}) => {
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: undefined,
    type: undefined,
    dateRange: {
      start: undefined,
      end: undefined
    },
    clientId: undefined
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Ordenamiento
  const [sortField, setSortField] = useState<keyof Appointment>('startTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Hooks
  const {
    appointments,
    loading,
    error,
    deleteAppointment,
    updateAppointmentStatus
  } = useAppointments({
    filters,
    pagination: { page: currentPage, limit: pageSize },
    sort: { field: sortField, direction: sortDirection }
  });

  const { clients } = useClients();

  // Filtrar por término de búsqueda
  const filteredAppointments = useMemo(() => {
    if (!searchTerm) return appointments;
    
    const term = searchTerm.toLowerCase();
    return appointments.filter(appointment => 
      appointment.title.toLowerCase().includes(term) ||
      appointment.clientName.toLowerCase().includes(term) ||
      appointment.clientEmail.toLowerCase().includes(term) ||
      appointment.type.toLowerCase().includes(term)
    );
  }, [appointments, searchTerm]);

  // Manejar eliminación
  const handleDelete = useCallback(async () => {
    if (!selectedAppointment) return;
    
    setIsDeleting(true);
    try {
      await deleteAppointment(selectedAppointment.id);
      setShowDeleteModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error al eliminar cita:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedAppointment, deleteAppointment]);

  // Manejar cambio de estado
  const handleStatusChange = useCallback(async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  }, [updateAppointmentStatus]);

  // Configuración de columnas de la tabla
  const columns = useMemo(() => [
    {
      key: 'title',
      label: 'Cita',
      sortable: true,
      render: (appointment: Appointment) => (
        <div>
          <div className="font-medium text-gray-900">{appointment.title}</div>
          <div className="text-sm text-gray-500">{appointment.type}</div>
        </div>
      )
    },
    {
      key: 'client',
      label: 'Cliente',
      render: (appointment: Appointment) => (
        <div>
          <div className="font-medium text-gray-900">{appointment.clientName}</div>
          <div className="text-sm text-gray-500">{appointment.clientEmail}</div>
        </div>
      )
    },
    {
      key: 'startTime',
      label: 'Fecha y hora',
      sortable: true,
      render: (appointment: Appointment) => (
        <div>
          <div className="font-medium text-gray-900">{formatDate(appointment.startTime)}</div>
          <div className="text-sm text-gray-500">
            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (appointment: Appointment) => (
        <div className="space-y-1">
          <StatusBadge status={appointment.status} />
          {appointment.status === 'scheduled' && (
            <div className="flex space-x-1">
              <button
                onClick={() => handleStatusChange(appointment.id, 'completed')}
                className="text-xs text-green-600 hover:text-green-800"
              >
                Completar
              </button>
              <span className="text-xs text-gray-300">|</span>
              <button
                onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'planType',
      label: 'Plan',
      render: (appointment: Appointment) => {
        const planLabel = planTypeOptions.find(option => option.value === appointment.planType)?.label || appointment.planType;
        return (
          <span className="text-sm text-gray-600">
            {planLabel}
          </span>
        );
      }
    },
    {
      key: 'paymentStatus',
      label: 'Pago',
      render: (appointment: Appointment) => {
        const statusColors = {
          free: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          paid: 'bg-blue-100 text-blue-800'
        };
        const statusLabel = paymentStatusOptions.find(option => option.value === appointment.paymentStatus)?.label || appointment.paymentStatus;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColors[appointment.paymentStatus as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
          }`}>
            {statusLabel}
          </span>
        );
      }
    },
    {
      key: 'duration',
      label: 'Duración',
      render: (appointment: Appointment) => (
        <span className="text-sm text-gray-600">
          {appointment.duration} min
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (appointment: Appointment) => (
        <div className="flex items-center space-x-2">
          {onViewAppointment && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewAppointment(appointment)}
              className="p-1"
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
          )}
          
          {onEditAppointment && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditAppointment(appointment)}
              className="p-1"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedAppointment(appointment);
              setShowDeleteModal(true);
            }}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ], [onViewAppointment, onEditAppointment, handleStatusChange]);

  // Opciones para filtros
  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'scheduled', label: 'Programada' },
    { value: 'completed', label: 'Completada' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'no-show', label: 'No asistió' }
  ];

  const typeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'consultation', label: 'Consulta' },
    { value: 'follow-up', label: 'Seguimiento' },
    { value: 'planning', label: 'Planificación' },
    { value: 'review', label: 'Revisión' }
  ];

  const planTypeOptions = [
    { value: '', label: 'Todos los planes' },
    { value: 'mail', label: 'Comunicación por mail' },
    { value: '30min', label: 'Consulta 30 minutos' },
    { value: '60min', label: 'Consulta 60 minutos' },
    { value: 'custom', label: 'Consulta personalizada' }
  ];

  const paymentStatusOptions = [
    { value: '', label: 'Todos los estados de pago' },
    { value: 'free', label: 'Gratis' },
    { value: 'pending', label: 'Pendiente de pago' },
    { value: 'paid', label: 'Pagado' }
  ];

  const clientOptions = useMemo(() => [
    { value: '', label: 'Todos los clientes' },
    ...clients.map(client => ({
      value: client.id,
      label: client.name
    }))
  ], [clients]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Citas</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona las citas programadas con tus clientes
          </p>
        </div>
        
        {onCreateAppointment && (
          <PrimaryButton
            onClick={onCreateAppointment}
            className="flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva cita
          </PrimaryButton>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <QuickStats appointments={appointments} />

      {/* Controles de búsqueda y filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por título, cliente, email o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Botón de filtros */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Select
                label="Estado"
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
                options={statusOptions}
              />
              
              <Select
                label="Tipo"
                value={filters.type || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value || undefined }))}
                options={typeOptions}
              />
              
              <Select
                label="Cliente"
                value={filters.clientId || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, clientId: e.target.value || undefined }))}
                options={clientOptions}
              />
              
              <Select
                label="Tipo de plan"
                value={filters.planType || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, planType: e.target.value || undefined }))}
                options={planTypeOptions}
              />
              
              <Select
                label="Estado de pago"
                value={filters.paymentStatus || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value || undefined }))}
                options={paymentStatusOptions}
              />
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      status: undefined,
                      type: undefined,
                      dateRange: { start: undefined, end: undefined },
                      clientId: undefined,
                      planType: undefined,
                      paymentStatus: undefined
                    });
                    setSearchTerm('');
                  }}
                  className="w-full"
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de citas */}
      <div className="bg-white rounded-lg border border-gray-200">
        {error && (
          <div className="p-4 border-b border-gray-200">
            <Alert type="error" title="Error" message={error} />
          </div>
        )}
        
        <Table
          data={filteredAppointments}
          columns={columns}
          loading={loading}
          emptyMessage="No se encontraron citas"
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={(field, direction) => {
            setSortField(field as keyof Appointment);
            setSortDirection(direction);
          }}
          pagination={{
            currentPage,
            pageSize,
            totalItems: filteredAppointments.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize
          }}
        />
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar cita"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que quieres eliminar la cita 
            <strong>"{selectedAppointment?.title}"</strong> 
            con {selectedAppointment?.clientName}?
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Advertencia
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Esta acción no se puede deshacer. La cita será eliminada permanentemente.
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
            
            <Button
              variant="danger"
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
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppointmentList;