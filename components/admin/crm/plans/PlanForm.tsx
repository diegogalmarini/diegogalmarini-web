// Componente de formulario para crear y editar planes personalizados
// Incluye validación y manejo de estado

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { usePlans } from '../../../../contexts/PlansContext';
import { Input, TextArea, Checkbox } from '../ui/FormField';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';

// Esquema de validación
const planSchema = yup.object({
  name: yup
    .string()
    .required('El nombre del plan es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  price: yup
    .string()
    .required('El precio es obligatorio')
    .matches(/^(€\d+|Gratis|\d+€|\$\d+|\d+\$)$/, 'Formato de precio inválido (ej: €150, Gratis, $200)'),
  duration: yup
    .string()
    .required('La duración es obligatoria')
    .min(5, 'La duración debe tener al menos 5 caracteres'),
  description: yup
    .string()
    .required('La descripción es obligatoria')
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  isActive: yup.boolean().default(true)
});

// Tipos para el formulario
type PlanFormData = yup.InferType<typeof planSchema>;

// Props del componente
interface PlanFormProps {
  planId?: string; // Si se proporciona, es modo edición
  onSubmit?: (success: boolean) => void;
  onCancel?: () => void;
  className?: string;
}

const PlanForm: React.FC<PlanFormProps> = ({
  planId,
  onSubmit,
  onCancel,
  className = ''
}) => {
  const { plans, addPlan, updatePlan, getPlanById } = usePlans();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [alert, setAlert] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const isEditing = Boolean(planId);
  const existingPlan = planId ? getPlanById(planId) : null;

  // Configurar formulario
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<PlanFormData>({
    resolver: yupResolver(planSchema),
    defaultValues: {
      name: '',
      price: '',
      duration: '',
      description: '',
      isActive: true
    }
  });

  // Cargar datos del plan existente
  useEffect(() => {
    if (existingPlan) {
      reset({
        name: existingPlan.name,
        price: existingPlan.price,
        duration: existingPlan.duration,
        description: existingPlan.description,
        isActive: existingPlan.isActive
      });
    }
  }, [existingPlan, reset]);

  // Manejar envío del formulario
  const onFormSubmit = async (data: PlanFormData) => {
    setIsSubmitting(true);
    setAlert(null);

    try {
      if (isEditing && planId) {
        // Actualizar plan existente
        updatePlan(planId, data);
        setAlert({ type: 'success', message: 'Plan actualizado correctamente' });
      } else {
        // Crear nuevo plan
        addPlan(data);
        setAlert({ type: 'success', message: 'Plan creado correctamente' });
        reset(); // Limpiar formulario después de crear
      }
      
      onSubmit?.(true);
    } catch (error) {
      console.error('Error al guardar plan:', error);
      setAlert({ 
        type: 'error', 
        message: isEditing ? 'Error al actualizar el plan' : 'Error al crear el plan'
      });
      onSubmit?.(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear formulario
  const handleReset = () => {
    if (existingPlan) {
      reset({
        name: existingPlan.name,
        price: existingPlan.price,
        duration: existingPlan.duration,
        description: existingPlan.description,
        isActive: existingPlan.isActive
      });
    } else {
      reset({
        name: '',
        price: '',
        duration: '',
        description: '',
        isActive: true
      });
    }
    setAlert(null);
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Plan' : 'Crear Nuevo Plan'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {isEditing 
            ? 'Modifica los detalles del plan de consultoría'
            : 'Configura un nuevo plan de consultoría personalizado'
          }
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información básica
          </h3>
          
          <div className="space-y-4">
            {/* Nombre del plan */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Nombre del plan"
                  placeholder="ej: Consulta Premium, Sesión Intensiva..."
                  error={errors.name?.message}
                  required
                />
              )}
            />

            {/* Precio y duración */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Precio"
                    placeholder="ej: €200, Gratis, $150..."
                    error={errors.price?.message}
                    required
                    helpText="Formato: €150, Gratis, $200, etc."
                  />
                )}
              />

              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Duración"
                    placeholder="ej: 90 minutos, 2 horas, 1 día..."
                    error={errors.duration?.message}
                    required
                  />
                )}
              />
            </div>

            {/* Descripción */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  label="Descripción"
                  placeholder="Describe qué incluye este plan, para qué tipo de proyectos es ideal, qué beneficios ofrece..."
                  rows={4}
                  error={errors.description?.message}
                  required
                  helpText="Mínimo 20 caracteres, máximo 500"
                />
              )}
            />

            {/* Estado activo */}
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="Plan activo"
                  checked={field.value}
                  onChange={field.onChange}
                  helpText="Los planes inactivos no aparecerán en el formulario de reservas"
                />
              )}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          
          {isDirty && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Resetear
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center"
          >
            {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
            {isEditing ? 'Actualizar Plan' : 'Crear Plan'}
          </Button>
        </div>
      </form>

      {/* Vista previa del plan */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Vista previa
        </h3>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-lg text-gray-900">
              {control._formValues.name || 'Nombre del plan'}
            </h4>
            <span className="font-bold text-lg text-green-600">
              {control._formValues.price || 'Precio'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {control._formValues.description || 'Descripción del plan...'}
          </p>
          <p className="text-sm font-semibold text-gray-500">
            {control._formValues.duration || 'Duración'}
          </p>
          {control._formValues.isActive !== undefined && (
            <div className="mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                control._formValues.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {control._formValues.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanForm;