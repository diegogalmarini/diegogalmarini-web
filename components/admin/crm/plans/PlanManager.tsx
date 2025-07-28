// Componente principal para gestionar planes personalizados
// Combina la lista de planes con el formulario de creación/edición

import React, { useState } from 'react';
import PlanList from './PlanList';
import PlanForm from './PlanForm';
import Modal from '../ui/Modal';
import { usePlans } from '../../../../contexts/PlansContext';

// Props del componente
interface PlanManagerProps {
  className?: string;
}

type ViewMode = 'list' | 'create' | 'edit' | 'view';

const PlanManager: React.FC<PlanManagerProps> = ({ className = '' }) => {
  const { getPlanById } = usePlans();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Manejar creación de plan
  const handleCreatePlan = () => {
    setSelectedPlanId(null);
    setViewMode('create');
    setModalOpen(true);
  };

  // Manejar edición de plan
  const handleEditPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setViewMode('edit');
    setModalOpen(true);
  };

  // Manejar vista de plan
  const handleViewPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setViewMode('view');
    setModalOpen(true);
  };

  // Manejar cierre de modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPlanId(null);
    setViewMode('list');
  };

  // Manejar envío exitoso del formulario
  const handleFormSubmit = (success: boolean) => {
    if (success) {
      // Cerrar modal después de un breve delay para mostrar el mensaje de éxito
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    }
  };

  // Obtener título del modal
  const getModalTitle = () => {
    switch (viewMode) {
      case 'create':
        return 'Crear Nuevo Plan';
      case 'edit':
        return 'Editar Plan';
      case 'view':
        return 'Detalles del Plan';
      default:
        return '';
    }
  };

  // Renderizar contenido del modal
  const renderModalContent = () => {
    if (viewMode === 'view' && selectedPlanId) {
      const plan = getPlanById(selectedPlanId);
      if (!plan) return null;

      return (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <span className="text-xl font-bold text-green-600">{plan.price}</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración
                </label>
                <p className="text-gray-900">{plan.duration}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <p className="text-gray-900">{plan.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  plan.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orden de visualización
                </label>
                <p className="text-gray-900">#{plan.order + 1}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => handleEditPlan(plan.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Editar Plan
            </button>
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      );
    }

    if (viewMode === 'create' || viewMode === 'edit') {
      return (
        <PlanForm
          planId={selectedPlanId || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
        />
      );
    }

    return null;
  };

  return (
    <div className={className}>
      {/* Lista de planes */}
      <PlanList
        onPlanCreate={handleCreatePlan}
        onPlanEdit={handleEditPlan}
        onPlanView={handleViewPlan}
      />

      {/* Modal para formulario o vista de detalles */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={getModalTitle()}
        size={viewMode === 'view' ? 'md' : 'lg'}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default PlanManager;