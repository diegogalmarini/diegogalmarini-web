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
import type { Consultation, ConsultationFilters, PaginationOptions } from '../../../../types/crm';
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
  onUpdateStatus?: (id: string, status: string) => void;
  className?: string;
}

// Opciones para filtros
const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'scheduled', label: 'Programada' },
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
  { value: 'mail', label: 'Comunicación por mail (Gratis)' },
  { value: '30min', label: 'Consulta 30 minutos' },
  { value: '60min', label: 'Consulta 60 minutos' },
  { value: 'custom', label: 'Consulta personalizada' }
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
  onUpdateStatus,
  className = ''
}) => {
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<string | null>(null);

  // Estados de filtros
  const [filters, setFilters] = useState<ConsultationFilters>({});

  // Estados locales para fechas (ya que no están directamente en ConsultationFilters)
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Estados de paginación
  const [pagination, setPagination] = useState<PaginationOptions>({
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
    totalItems,
    deleteConsultation,
    updateConsultation,
    loadConsultations
  } = useConsultations({
    ...filters,
    dateRange: dateRange.start || dateRange.end ? dateRange : undefined,
    searchTerm: searchTerm,
    ...pagination
  });

  // Manejar cambios en filtros
  const handleFilterChange = useCallback((key: string, value: string) => {
    if (key === 'status' || key === 'priority' || key === 'planType') {
      setFilters(prev => ({ ...prev, [key]: value ? [value] : undefined }));
    } else if (key === 'clientEmail') {
      setFilters(prev => ({ ...prev, clientEmail: value || undefined }));
    } else if (key === 'dateFrom') {
      setDateRange(prev => ({ ...prev, start: value }));
    } else if (key === 'dateTo') {
      setDateRange(prev => ({ ...prev, end: value }));
    }
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
    setFilters({});
    setDateRange({ start: '', end: '' });
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
      header: 'Asunto',
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
      header: 'Plan',
      render: (value: any, consultation: Consultation) => (
        <PlanTypeBadge planType={consultation?.planType} />
      )
    },
    {
      key: 'priority',
      header: 'Prioridad',
      sortable: true,
      render: (value: any, consultation: Consultation) => (
        <PriorityBadge priority={consultation?.priority} />
      )
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      render: (value: any, consultation: Consultation) => (
        <StatusBadge status={consultation?.status} />
      )
    },
    {
      key: 'createdAt',
      header: 'Fecha',
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
      header: 'Acciones',
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
    const contacted = consultations.filter(c => c.status === 'contacted').length;
    const scheduled = consultations.filter(c => c.status === 'scheduled').length;
    const completed = consultations.filter(c => c.status === 'completed').length;

    return { pending, contacted, scheduled, completed, total: totalItems };
  }, [consultations, totalItems]);

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
      {/* Header con estadísticas compactas e interactivas */}
      {stats && (
        <div className="flex flex-wrap gap-3 items-center mb-1 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Filtros Rápidos:</span>
          <button 
            onClick={() => handleFilterChange('status', filters.status?.[0] === 'pending' ? '' : 'pending')}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filters.status?.[0] === 'pending'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300 font-semibold shadow-sm'
                : 'bg-yellow-50/30 text-yellow-700 border-yellow-100/50 hover:bg-yellow-50'
            }`}
          >
            ⏳ {stats.pending} Pendientes
          </button>
          <button 
            onClick={() => handleFilterChange('status', filters.status?.[0] === 'contacted' ? '' : 'contacted')}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filters.status?.[0] === 'contacted'
                ? 'bg-blue-100 text-blue-800 border-blue-300 font-semibold shadow-sm'
                : 'bg-blue-50/30 text-blue-700 border-blue-100/50 hover:bg-blue-50'
            }`}
          >
            📞 {stats.contacted} En progreso
          </button>
          <button 
            onClick={() => handleFilterChange('status', filters.status?.[0] === 'completed' ? '' : 'completed')}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filters.status?.[0] === 'completed'
                ? 'bg-green-100 text-green-800 border-green-300 font-semibold shadow-sm'
                : 'bg-green-50/30 text-green-700 border-green-100/50 hover:bg-green-50'
            }`}
          >
            ✓ {stats.completed} Completadas
          </button>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 ml-auto">
            Total: {totalItems}
          </span>
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
                value={filters.status?.[0] || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                options={STATUS_OPTIONS}
              />

              <Select
                label="Prioridad"
                value={filters.priority?.[0] || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                options={PRIORITY_OPTIONS}
              />

              <Select
                label="Tipo de plan"
                value={filters.planType?.[0] || ''}
                onChange={(e) => handleFilterChange('planType', e.target.value)}
                options={PLAN_TYPE_OPTIONS}
              />

              <Input
                label="Email del cliente"
                type="email"
                value={filters.clientEmail || ''}
                onChange={(e) => handleFilterChange('clientEmail', e.target.value)}
                placeholder="cliente@email.com"
              />

              <Input
                label="Fecha desde"
                type="date"
                value={dateRange.start}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />

              <Input
                label="Fecha hasta"
                type="date"
                value={dateRange.end}
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
            totalPages: Math.ceil(totalItems / pagination.limit),
            itemsPerPage: pagination.limit,
            totalItems: totalItems,
            hasNextPage: pagination.page < Math.ceil(totalItems / pagination.limit),
            hasPreviousPage: pagination.page > 1
          }}
          onPageChange={handlePageChange}
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