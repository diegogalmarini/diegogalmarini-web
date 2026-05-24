// Gestor de planes mejorado con funcionalidades CRUD completas
import React, { useState, useEffect } from 'react';
import { usePlans } from '../../../../contexts/PlansContext';
import type { Plan } from '../../../../types/crm';
import Badge from '../ui/Badge';
import Button, { PrimaryButton, DangerButton } from '../ui/Button';
import Modal from '../ui/Modal';
import { Input, Select, TextArea } from '../ui/FormField';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PauseIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface PlanFormData {
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
  maxConsultations: number;
  supportLevel: 'basic' | 'standard' | 'premium';
}

const PlanManager: React.FC = () => {
  const { plans, addPlan, updatePlan, deletePlan, togglePlanStatus } = usePlans();
  const loading = false; // Contexto local no tiene loading
  const error = null; // Contexto local no tiene error
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    features: [],
    isActive: true,
    maxConsultations: 1,
    supportLevel: 'basic'
  });

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      features: [],
      isActive: true,
      maxConsultations: 1,
      supportLevel: 'basic'
    });
  };

  // Abrir modal para crear plan
  const handleCreatePlan = () => {
    setModalMode('create');
    resetForm();
    setSelectedPlan(null);
    setShowModal(true);
  };

  // Abrir modal para editar plan
  const handleEditPlan = (plan: Plan) => {
    setModalMode('edit');
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      features: plan.features || [],
      isActive: plan.isActive,
      maxConsultations: plan.maxConsultations || 1,
      supportLevel: plan.supportLevel || 'basic'
    });
    setShowModal(true);
  };

  // Abrir modal para ver plan
  const handleViewPlan = (plan: Plan) => {
    setModalMode('view');
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      features: plan.features || [],
      isActive: plan.isActive,
      maxConsultations: plan.maxConsultations || 1,
      supportLevel: plan.supportLevel || 'basic'
    });
    setShowModal(true);
  };

  // Manejar cambio en formulario
  const handleInputChange = (field: keyof PlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Agregar característica
  const addFeature = () => {
    const newFeature = prompt('Ingresa una nueva característica:');
    if (newFeature && newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
    }
  };

  // Remover característica
  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Guardar plan
  const handleSave = async () => {
    try {
      if (modalMode === 'create') {
        await addPlan({
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else if (modalMode === 'edit' && selectedPlan) {
        await updatePlan(selectedPlan.id, {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error al guardar plan:', error);
    }
  };

  // Eliminar plan
  const handleDelete = async (planId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este plan?')) {
      try {
        await deletePlan(planId);
      } catch (error) {
        console.error('Error al eliminar plan:', error);
      }
    }
  };

  // Cambiar estado del plan
  const handleToggleStatus = async (planId: string, currentStatus: boolean) => {
    try {
      await togglePlanStatus(planId);
    } catch (error) {
      console.error('Error al cambiar estado del plan:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Planes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Crea, edita y gestiona los planes de consultoría disponibles
          </p>
        </div>
        <PrimaryButton onClick={handleCreatePlan} className="flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Plan
        </PrimaryButton>
      </div>

      {/* Lista de Planes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {plan.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      ${plan.price}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {plan.duration} min
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {plan.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleViewPlan(plan)}
                        className="text-xs px-2 py-1"
                        variant="outline"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleEditPlan(plan)}
                        className="text-xs px-2 py-1"
                        variant="outline"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleToggleStatus(plan.id, plan.isActive)}
                        className={`text-xs px-2 py-1 ${plan.isActive ? 'text-yellow-600' : 'text-green-600'
                          }`}
                        variant="outline"
                      >
                        {plan.isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                      </Button>
                      <DangerButton
                        onClick={() => handleDelete(plan.id)}
                        className="text-xs px-2 py-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </DangerButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {plans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay planes configurados</p>
            <p className="text-sm text-gray-400 mt-1">
              Crea tu primer plan para empezar
            </p>
          </div>
        )}
      </div>

      {/* Modal de Plan */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalMode === 'create' ? 'Nuevo Plan' :
            modalMode === 'edit' ? 'Editar Plan' : 'Ver Plan'
        }
        size="lg"
      >
        <div className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Plan
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: Consulta Estratégica 30min"
              disabled={modalMode === 'view'}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe los beneficios y alcance del plan"
              rows={3}
              disabled={modalMode === 'view'}
            />
          </div>

          {/* Precio y Duración */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio (USD)
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                disabled={modalMode === 'view'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración (minutos)
              </label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 30)}
                placeholder="30"
                disabled={modalMode === 'view'}
              />
            </div>
          </div>

          {/* Características */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Características
            </label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...formData.features];
                      newFeatures[index] = e.target.value;
                      handleInputChange('features', newFeatures);
                    }}
                    placeholder="Característica del plan"
                    disabled={modalMode === 'view'}
                  />
                  {modalMode !== 'view' && (
                    <Button
                      onClick={() => removeFeature(index)}
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {modalMode !== 'view' && (
                <Button
                  onClick={addFeature}
                  variant="outline"
                  className="w-full"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Agregar Característica
                </Button>
              )}
            </div>
          </div>

          {/* Configuración adicional */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo de Consultas
              </label>
              <Input
                type="number"
                value={formData.maxConsultations}
                onChange={(e) => handleInputChange('maxConsultations', parseInt(e.target.value) || 1)}
                placeholder="1"
                disabled={modalMode === 'view'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Soporte
              </label>
              <Select
                label="Nivel de Soporte"
                value={formData.supportLevel}
                onChange={(e) => handleInputChange('supportLevel', e.target.value)}
                disabled={modalMode === 'view'}
                options={[
                  { value: 'basic', label: 'Básico' },
                  { value: 'standard', label: 'Estándar' },
                  { value: 'premium', label: 'Premium' }
                ]}
              />
            </div>
          </div>

          {/* Estado */}
          {modalMode !== 'view' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Plan activo
              </label>
            </div>
          )}

          {/* Botones de acción */}
          {modalMode !== 'view' && (
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
              >
                Cancelar
              </Button>
              <PrimaryButton onClick={handleSave}>
                {modalMode === 'create' ? 'Crear Plan' : 'Guardar Cambios'}
              </PrimaryButton>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PlanManager;