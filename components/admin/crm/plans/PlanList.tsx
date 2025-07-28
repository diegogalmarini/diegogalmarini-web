// Componente para listar y gestionar planes personalizados
// Incluye funciones CRUD para crear, editar, eliminar y pausar/activar planes

import React, { useState } from 'react';
import { usePlans } from '../../../../contexts/PlansContext';
import Table from '../ui/Table';
import Button, { PrimaryButton } from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import Alert from '../ui/Alert';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

// Props del componente
interface PlanListProps {
  onPlanCreate?: () => void;
  onPlanEdit?: (planId: string) => void;
  onPlanView?: (planId: string) => void;
  className?: string;
}

const PlanList: React.FC<PlanListProps> = ({
  onPlanCreate,
  onPlanEdit,
  onPlanView,
  className = ''
}) => {
  const { plans, deletePlan, togglePlanStatus } = usePlans();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Manejar eliminación de plan
  const handleDeleteClick = (planId: string) => {
    setPlanToDelete(planId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;

    try {
      deletePlan(planToDelete);
      setAlert({ type: 'success', message: 'Plan eliminado correctamente' });
      setDeleteModalOpen(false);
      setPlanToDelete(null);
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al eliminar el plan' });
    }
  };

  // Manejar cambio de estado del plan
  const handleToggleStatus = async (planId: string) => {
    try {
      togglePlanStatus(planId);
      setAlert({ type: 'success', message: 'Estado del plan actualizado' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al actualizar el estado del plan' });
    }
  };

  // Definir columnas de la tabla
  const columns = [
    {
      key: 'name',
      label: 'Nombre del Plan',
      render: (plan: any) => (
        <div>
          <div className="font-medium text-gray-900">{plan.name}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {plan.description}
          </div>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Precio',
      render: (plan: any) => (
        <span className="font-semibold text-green-600">{plan.price}</span>
      )
    },
    {
      key: 'duration',
      label: 'Duración',
      render: (plan: any) => (
        <span className="text-gray-600">{plan.duration}</span>
      )
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (plan: any) => (
        <Badge 
          variant={plan.isActive ? 'success' : 'secondary'}
        >
          {plan.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    {
      key: 'order',
      label: 'Orden',
      render: (plan: any) => (
        <span className="text-gray-600">#{plan.order + 1}</span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (plan: any) => (
        <div className="flex items-center space-x-2">
          {onPlanView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPlanView(plan.id)}
              title="Ver detalles"
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
          )}
          
          {onPlanEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPlanEdit(plan.id)}
              title="Editar plan"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(plan.id)}
            title={plan.isActive ? 'Pausar plan' : 'Activar plan'}
          >
            {plan.isActive ? (
              <PauseIcon className="h-4 w-4 text-orange-500" />
            ) : (
              <PlayIcon className="h-4 w-4 text-green-500" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(plan.id)}
            title="Eliminar plan"
          >
            <TrashIcon className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  // Estadísticas rápidas
  const stats = {
    total: plans.length,
    active: plans.filter(p => p.isActive).length,
    inactive: plans.filter(p => !p.isActive).length
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Alerta */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Planes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona los planes de consultoría disponibles
          </p>
        </div>
        
        {onPlanCreate && (
          <PrimaryButton
            onClick={onPlanCreate}
            className="flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo plan
          </PrimaryButton>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PlusIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total de planes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <PlayIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Planes activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <PauseIcon className="h-5 w-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Planes inactivos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de planes */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={plans}
          emptyMessage="No hay planes configurados"
        />
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar eliminación"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que quieres eliminar este plan? Esta acción no se puede deshacer.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
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

export default PlanList;