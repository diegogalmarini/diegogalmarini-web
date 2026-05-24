// Componente para listar y gestionar clientes
// Incluye búsqueda, filtros, paginación y acciones CRUD

import React, { useState, useCallback, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Client, ClientFilters, PaginationOptions } from '../../../../types/crm';
import { useClients } from '../../../../hooks/useCRM';
import Table from '../ui/Table';
import Button from '../ui/Button';
import { Input, Select } from '../ui/FormField';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';
import Modal from '../ui/Modal';

// Props del componente
interface ClientListProps {
  onClientSelect?: (client: Client) => void;
  onClientEdit?: (client: Client) => void;
  onClientDelete?: (clientId: string) => void;
  onClientCreate?: () => void;
  selectMode?: boolean;
  className?: string;
}

// Opciones para filtros
const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'blocked', label: 'Bloqueado' }
];

const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Nombre A-Z' },
  { value: 'name_desc', label: 'Nombre Z-A' },
  { value: 'email_asc', label: 'Email A-Z' },
  { value: 'email_desc', label: 'Email Z-A' },
  { value: 'registrationDate_desc', label: 'Más recientes' },
  { value: 'registrationDate_asc', label: 'Más antiguos' },
  { value: 'lastContactDate_desc', label: 'Último contacto' }
];

export const ClientList: React.FC<ClientListProps> = ({
  onClientSelect,
  onClientEdit,
  onClientDelete,
  onClientCreate,
  selectMode = false,
  className = ''
}) => {
  console.log('🔧 ClientList props:', { onClientSelect, onClientEdit, onClientDelete, onClientCreate });
  // Debug: verificar que las props lleguen correctamente
  console.log('ClientList props:', {
    onClientSelect: typeof onClientSelect,
    onClientEdit: typeof onClientEdit,
    onClientDelete: typeof onClientDelete,
    onClientCreate: typeof onClientCreate
  });
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Estados de filtros
  const [filters, setFilters] = useState<ClientFilters>({
    status: undefined,
    hasPhone: undefined,
    hasConsultations: undefined,
    createdAfter: undefined,
    createdBefore: undefined
  });

  // Estados de paginación
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Hook para clientes
  const {
    clients,
    loading,
    error,
    metrics,
    deleteClient,
    loadClients: refreshClients
  } = useClients({
    ...filters,
    searchTerm: searchTerm
  });

  // Manejar cambios en filtros
  const handleFilterChange = useCallback((key: string, value: any) => {
    if (key === 'status') {
      setFilters(prev => ({ ...prev, [key]: value ? [value] : undefined }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
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
    setFilters({
      status: undefined,
      hasPhone: undefined,
      hasConsultations: undefined,
      createdAfter: undefined,
      createdBefore: undefined
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Manejar acciones
  const handleView = useCallback((client: Client) => {
    console.log('Viewing client:', client);
    if (!client || !client.id) {
      console.error('Invalid client data for view:', client);
      return;
    }
    setSelectedClient(client);
    if (onClientSelect) {
      onClientSelect(client);
    }
  }, [onClientSelect]);

  const handleEdit = useCallback((client: Client) => {
    console.log('Editing client:', client);
    if (!client || !client.id) {
      console.error('Invalid client data for edit:', client);
      return;
    }
    if (onClientEdit) {
      onClientEdit(client);
    }
  }, [onClientEdit]);

  const handleDeleteClick = useCallback((clientId: string) => {
    setClientToDelete(clientId);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (clientToDelete) {
      try {
        await deleteClient(clientToDelete);
        if (onClientDelete) {
          onClientDelete(clientToDelete);
        }
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
      } finally {
        setShowDeleteModal(false);
        setClientToDelete(null);
      }
    }
  }, [clientToDelete, deleteClient, onClientDelete]);

  const handleCreate = useCallback(() => {
    if (onClientCreate) {
      onClientCreate();
    }
  }, [onClientCreate]);



  // Columnas de la tabla
  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Cliente',
      sortable: true,
      render: (value: any, client: Client) => {
        if (!client) return <span className="text-gray-400">Datos no disponibles</span>;
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">
                {client.name || 'Sin nombre'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {client.email || 'Sin email'}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'phone',
      header: 'Teléfono',
      render: (value: any, client: Client) => (
        client?.phone ? (
          <div className="flex items-center space-x-2">
            <PhoneIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">{client.phone}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">No disponible</span>
        )
      )
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      render: (value: any, client: Client) => {
        if (!client) return null;
        const statusConfig = {
          active: { label: 'Activo', variant: 'success' as const },
          inactive: { label: 'Inactivo', variant: 'secondary' as const },
          blocked: { label: 'Bloqueado', variant: 'error' as const }
        };

        const config = statusConfig[client.status] || statusConfig.active;

        return (
          <Badge variant={config.variant} size="sm">
            {config.label}
          </Badge>
        );
      }
    },
    {
      key: 'totalConsultations',
      header: 'Consultas',
      render: (value: any, client: Client) => (
        <div className="text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {client?.totalConsultations || 0}
          </span>
        </div>
      )
    },
    {
      key: 'lastContactDate',
      header: 'Último contacto',
      sortable: true,
      render: (value: any, client: Client) => (
        client?.lastContactDate ? (
          <div className="text-sm text-gray-900">
            {format(parseISO(client.lastContactDate), 'dd MMM yyyy', { locale: es })}
          </div>
        ) : (
          <span className="text-sm text-gray-400">Nunca</span>
        )
      )
    },
    {
      key: 'registrationDate',
      header: 'Registrado',
      sortable: true,
      render: (value: any, client: Client) => (
        <div className="text-sm text-gray-900">
          {client?.registrationDate ? format(parseISO(client.registrationDate), 'dd MMM yyyy', { locale: es }) : 'Sin fecha'}
        </div>
      )
    },
    {
      key: 'actions',
      header: selectMode ? 'Seleccionar' : 'Acciones',
      render: (value: any, client: Client) => (
        selectMode ? (
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClientSelect) {
                onClientSelect(client);
              }
            }}
            className="w-full"
          >
            Seleccionar
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleView(client);
              }}
              title="Ver detalles"
            >
              <EyeIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEdit(client);
              }}
              title="Editar"
              className="text-gray-600 hover:text-gray-700"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (client?.id) {
                  handleDeleteClick(client.id);
                }
              }}
              title="Eliminar"
              className="text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        )
      )
    }
  ], [handleView, handleEdit, handleDeleteClick, selectMode, onClientSelect]);

  // Calcular estadísticas rápidas
  const stats = useMemo(() => {
    if (!clients.length) return null;

    const active = clients.filter(c => c.status === 'active').length;
    const withPhone = clients.filter(c => c.phone).length;
    const withConsultations = clients.filter(c => (c.totalConsultations || 0) > 0).length;

    return { active, withPhone, withConsultations, total: clients.length };
  }, [clients]);

  if (error) {
    return (
      <Alert
        type="error"
        title="Error al cargar clientes"
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
              <UserIcon className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Activos</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <PhoneIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Con teléfono</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.withPhone}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Con consultas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.withConsultations}</p>
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
                <p className="text-2xl font-semibold text-gray-900">{metrics?.total || 0}</p>
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
              placeholder="Buscar por nombre, email o teléfono..."
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

          {/* Botones de acción */}
          <div className="flex space-x-2">
            {selectMode ? (
              <div className="text-sm text-gray-600 px-3 py-2 bg-blue-50 rounded-md">
                💡 Selecciona un cliente para crear la consulta
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={handleCreate}
                className="whitespace-nowrap"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo cliente
              </Button>
            )}
          </div>
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
                label="Tiene teléfono"
                value={filters.hasPhone === undefined ? '' : filters.hasPhone.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('hasPhone', value === '' ? undefined : value === 'true');
                }}
                options={[
                  { value: '', label: 'Todos' },
                  { value: 'true', label: 'Sí' },
                  { value: 'false', label: 'No' }
                ]}
              />

              <Select
                label="Tiene consultas"
                value={filters.hasConsultations === undefined ? '' : filters.hasConsultations.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('hasConsultations', value === '' ? undefined : value === 'true');
                }}
                options={[
                  { value: '', label: 'Todos' },
                  { value: 'true', label: 'Sí' },
                  { value: 'false', label: 'No' }
                ]}
              />

              <Input
                label="Registrado después de"
                type="date"
                value={filters.createdAfter}
                onChange={(e) => handleFilterChange('createdAfter', e.target.value)}
              />

              <Input
                label="Registrado antes de"
                type="date"
                value={filters.createdBefore}
                onChange={(e) => handleFilterChange('createdBefore', e.target.value)}
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

      {/* Tabla de clientes */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={clients}
          loading={loading}
          emptyMessage="No se encontraron clientes"
          onRowClick={onClientSelect}
          pagination={{
            currentPage: pagination.page,
            totalPages: Math.ceil((metrics?.total || 0) / pagination.limit),
            itemsPerPage: pagination.limit,
            totalItems: metrics?.total || 0,
            hasNextPage: pagination.page < Math.ceil((metrics?.total || 0) / pagination.limit),
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
            ¿Estás seguro de que deseas eliminar este cliente? Esta acción eliminará también todas sus consultas y no se puede deshacer.
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

export default ClientList;