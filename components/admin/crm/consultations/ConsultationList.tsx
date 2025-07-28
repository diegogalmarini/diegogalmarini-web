// Componente para listar y gestionar consultas
// Incluye filtros, búsqueda, paginación y acciones CRUD

import React, { useState, useCallback, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Consultation, ConsultationFilters, PaginationParams } from '../../../../types/crm';
import { useConsultations } from '../../../../hooks/useCRM';
import Table from '../ui/Table';
import Button from '../ui/Button';
import { Input, Select } from '../ui/FormField';
import Badge, { StatusBadge, PriorityBadge, PlanTypeBadge } from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';
import Modal from '../ui/Modal';

// Props del componente
interface ConsultationListProps {
  onConsultationSelect?: (consultation: Consultation) => void;
  onConsultationEdit?: (consultation: Consultation) => void;
  onConsultationDelete?: (consultationId: string) => void;
  onConsultationRespond?: (consultation: Consultation) => void;
  className?: string;
}

// Opciones para filtros
const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' }
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'Todas las prioridades' },
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' }
];

const PLAN_TYPE_OPTIONS = [
  { value: '', label: 'Todos los planes' },
  { value: 'consultation_30', label: 'Consulta 30 min' },
  { value: 'consultation_60', label: 'Consulta 60 min' },
  { value: 'follow_up', label: 'Seguimiento' },
  { value: 'emergency', label: 'Emergencia' }
];

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Más recientes' },
  { value: 'createdAt_asc', label: 'Más antiguos' },
  { value: 'subject_asc', label: 'Asunto A-Z' },
  { value: 'subject_desc', label: 'Asunto Z-A' },
  { value: 'priority_desc', label: 'Prioridad alta' },
  { value: 'status_asc', label: 'Estado' }
];

export const ConsultationList: React.FC<ConsultationListProps> = ({
  onConsultationSelect,
  onConsultationEdit,
  onConsultationDelete,
  onConsultationRespond,
  className = ''
}) => {
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<string | null>(null);
  
  // Estados de filtros
  const [filters, setFilters] = useState<ConsultationFilters>({
    status: '',
    priority: '',
    planType: '',
    dateFrom: '',
    dateTo: '',
    clientEmail: ''
  });
  
  // Estados de paginación
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Hook para consultas
  const {
    consultations,
    loading,
    error,
    totalCount,
    deleteConsultation,
    refreshConsultations
  } = useConsultations({
    filters: {
      ...filters,
      search: searchTerm
    },
    pagination
  });

  // Manejar cambios en filtros
  const handleFilterChange = useCallback((key: keyof ConsultationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset a primera página
  }, []);

  // Manejar cambios en ordenamiento
  const handleSortChange = useCallback((value: string) => {
    const [sortBy, sortOrder] = value.split('_');
    setPagination(prev => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder: sortOrder as 'asc' | 'desc',
      page: 1
    }));
  }, []);

  // Manejar cambios en paginación
  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      status: '',
      priority: '',
      planType: '',
      dateFrom: '',
      dateTo: '',
      clientEmail: ''
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Manejar acciones
  const handleView = useCallback((consultation: Consultation) => {
    setSelectedConsultation(consultation);
    if (onConsultationSelect) {
      onConsultationSelect(consultation);
    }
  }, [onConsultationSelect]);

  const handleEdit = useCallback((consultation: Consultation) => {
    if (onConsultationEdit) {
      onConsultationEdit(consultation);
    }
  }, [onConsultationEdit]);

  const handleDeleteClick = useCallback((consultationId: string) => {
    setConsultationToDelete(consultationId);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (consultationToDelete) {
      try {
        await deleteConsultation(consultationToDelete);
        if (onConsultationDelete) {
          onConsultationDelete(consultationToDelete);
        }
      } catch (error) {
        console.error('Error al eliminar consulta:', error);
      } finally {
        setShowDeleteModal(false);
        setConsultationToDelete(null);
      }
    }
  }, [consultationToDelete, deleteConsultation, onConsultationDelete]);

  const handleRespond = useCallback((consultation: Consultation) => {
    if (onConsultationRespond) {
      onConsultationRespond(consultation);
    }
  }, [onConsultationRespond]);

  // Columnas de la tabla
  const columns = useMemo(() => [
    {
      key: 'subject',
      label: 'Asunto',
      sortable: true,
      render: (value: any, consultation: Consultation) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">{consultation?.subject || 'Sin asunto'}</p>
          <p className="text-sm text-gray-500 truncate">{consultation?.clientEmail || ''}</p>
        </div>
      )
    },
    {
      key: 'planType',
      label: 'Plan',
      render: (value: any, consultation: Consultation) => (
        <PlanTypeBadge planType={consultation?.planType} />
      )
    },
    {
      key: 'priority',
      label: 'Prioridad',
      sortable: true,
      render: (value: any, consultation: Consultation) => (
        <PriorityBadge priority={consultation?.priority} />
      )
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (value: any, consultation: Consultation) => (
        <StatusBadge status={consultation?.status} />
      )
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      sortable: true,
      render: (value: any, consultation: Consultation) => (
        <div className="text-sm text-gray-900">
          {consultation?.createdAt ? format(parseISO(consultation.createdAt), 'dd MMM yyyy', { locale: es }) : '-'}
          <br />
          <span className="text-gray-500">
            {consultation?.createdAt ? format(parseISO(consultation.createdAt), 'HH:mm') : '-'}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (value: any, consultation: Consultation) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => consultation && handleView(consultation)}
            title="Ver detalles"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          
          {consultation?.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => consultation && handleRespond(consultation)}
              title="Responder"
              className="text-blue-600 hover:text-blue-700"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => consultation && handleEdit(consultation)}
            title="Editar"
            className="text-gray-600 hover:text-gray-700"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => consultation?.id && handleDeleteClick(consultation.id)}
            title="Eliminar"
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ], [handleView, handleEdit, handleDeleteClick, handleRespond]);

  // Calcular estadísticas rápidas
  const stats = useMemo(() => {
    if (!consultations.length) return null;
    
    const pending = consultations.filter(c => c.status === 'pending').length;
    const inProgress = consultations.filter(c => c.status === 'in_progress').length;
    const completed = consultations.filter(c => c.status === 'completed').length;
    
    return { pending, inProgress, completed, total: consultations.length };
  }, [consultations]);

  if (error) {
    return (
      <Alert
        type="error"
        title="Error al cargar consultas"
        message={error}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">En progreso</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Completadas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">#</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{totalCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controles de búsqueda y filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <Input
              placeholder="Buscar por asunto, email o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
            />
          </div>
          
          {/* Ordenamiento */}
          <div className="w-full sm:w-48">
            <Select
              value={`${pagination.sortBy}_${pagination.sortOrder}`}
              onChange={(e) => handleSortChange(e.target.value)}
              options={SORT_OPTIONS}
            />
          </div>
          
          {/* Botón de filtros */}
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="whitespace-nowrap"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select
                label="Estado"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                options={STATUS_OPTIONS}
              />
              
              <Select
                label="Prioridad"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                options={PRIORITY_OPTIONS}
              />
              
              <Select
                label="Tipo de plan"
                value={filters.planType}
                onChange={(e) => handleFilterChange('planType', e.target.value)}
                options={PLAN_TYPE_OPTIONS}
              />
              
              <Input
                label="Email del cliente"
                type="email"
                value={filters.clientEmail}
                onChange={(e) => handleFilterChange('clientEmail', e.target.value)}
                placeholder="cliente@email.com"
              />
              
              <Input
                label="Fecha desde"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
              
              <Input
                label="Fecha hasta"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
            
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={clearFilters}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de consultas */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={consultations}
          loading={loading}
          emptyMessage="No se encontraron consultas"
          pagination={{
            currentPage: pagination.page,
            totalPages: Math.ceil(totalCount / pagination.limit),
            pageSize: pagination.limit,
            totalItems: totalCount,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange
          }}
        />
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar esta consulta? Esta acción no se puede deshacer.
          </p>
          
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
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConsultationList;