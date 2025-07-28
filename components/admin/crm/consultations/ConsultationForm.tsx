// Componente de formulario para crear y editar consultas
// Incluye validación, manejo de errores y integración con Firestore

import React, { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Consultation, ConsultationFormData, Client } from '../../../../types/crm';
import { useConsultations, useClients } from '../../../../hooks/useCRM';
import { Input, TextArea, Select } from '../ui/FormField';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import LoadingSpinner from '../ui/LoadingSpinner';
import { FormGroup } from '../ui/FormField';

// Schema de validación
const consultationSchema = yup.object({
  subject: yup
    .string()
    .required('El asunto es obligatorio')
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(100, 'El asunto no puede exceder 100 caracteres'),
  
  clientEmail: yup
    .string()
    .required('El email del cliente es obligatorio')
    .email('Debe ser un email válido'),
  
  clientName: yup
    .string()
    .required('El nombre del cliente es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  
  clientPhone: yup
    .string()
    .matches(/^[+]?[0-9\s\-\(\)]+$/, 'Formato de teléfono inválido')
    .min(10, 'El teléfono debe tener al menos 10 dígitos'),
  
  description: yup
    .string()
    .required('La descripción es obligatoria')
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  
  planType: yup
    .string()
    .required('El tipo de plan es obligatorio')
    .oneOf(['consultation_30', 'consultation_60', 'follow_up', 'emergency'], 'Tipo de plan inválido'),
  
  priority: yup
    .string()
    .required('La prioridad es obligatoria')
    .oneOf(['low', 'medium', 'high', 'urgent'], 'Prioridad inválida'),
  
  status: yup
    .string()
    .required('El estado es obligatorio')
    .oneOf(['pending', 'in_progress', 'completed', 'cancelled'], 'Estado inválido'),
  
  preferredDate: yup
    .string()
    .nullable(),
  
  preferredTime: yup
    .string()
    .nullable(),
  
  notes: yup
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
});

// Props del componente
interface ConsultationFormProps {
  consultation?: Consultation;
  onSubmit?: (data: ConsultationFormData) => void;
  onCancel?: () => void;
  className?: string;
}

// Opciones para selects
const PLAN_TYPE_OPTIONS = [
  { value: 'mail', label: 'Comunicación por mail (Gratis)' },
  { value: '30min', label: 'Consulta 30 minutos' },
  { value: '60min', label: 'Consulta 60 minutos' },
  { value: 'custom', label: 'Consulta personalizada' }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'free', label: 'Gratis' },
  { value: 'pending', label: 'Pendiente de pago' },
  { value: 'paid', label: 'Pagado' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' }
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' }
];

// Generar opciones de tiempo (cada 30 minutos de 9:00 a 18:00)
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 9; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push({ value: timeString, label: timeString });
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export const ConsultationForm: React.FC<ConsultationFormProps> = ({
  consultation,
  onSubmit,
  onCancel,
  className = ''
}) => {
  // Estados locales
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [clientSuggestions, setClientSuggestions] = useState<Client[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  // Hooks
  const { createConsultation, updateConsultation } = useConsultations();
  const { searchClients } = useClients();

  // Configuración del formulario
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset
  } = useForm<ConsultationFormData>({
    resolver: yupResolver(consultationSchema),
    defaultValues: {
      subject: consultation?.subject || '',
      clientEmail: consultation?.clientEmail || '',
      clientName: consultation?.clientName || '',
      clientPhone: consultation?.clientPhone || '',
      description: consultation?.description || '',
      planType: consultation?.planType || 'mail',
      paymentStatus: consultation?.paymentStatus || 'free',
      customDuration: consultation?.customDuration || undefined,
      customPrice: consultation?.customPrice || undefined,
      priority: consultation?.priority || 'medium',
      status: consultation?.status || 'pending',
      preferredDate: consultation?.preferredDate || '',
      startTime: consultation?.startTime || '',
      endTime: consultation?.endTime || '',
      notes: consultation?.notes || ''
    }
  });

  // Observar cambios en el email para buscar clientes
  const watchedEmail = watch('clientEmail');

  // Buscar clientes cuando cambia el email
  useEffect(() => {
    const searchClientsByEmail = async () => {
      if (watchedEmail && watchedEmail.length > 2) {
        try {
          const clients = await searchClients({ email: watchedEmail });
          setClientSuggestions(clients.slice(0, 5)); // Limitar a 5 sugerencias
          setShowClientSuggestions(clients.length > 0);
        } catch (error) {
          console.error('Error buscando clientes:', error);
          setClientSuggestions([]);
          setShowClientSuggestions(false);
        }
      } else {
        setClientSuggestions([]);
        setShowClientSuggestions(false);
      }
    };

    const timeoutId = setTimeout(searchClientsByEmail, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [watchedEmail, searchClients]);

  // Seleccionar cliente de las sugerencias
  const handleClientSelect = useCallback((client: Client) => {
    setValue('clientEmail', client.email);
    setValue('clientName', client.name);
    setValue('clientPhone', client.phone || '');
    setShowClientSuggestions(false);
  }, [setValue]);

  // Manejar envío del formulario
  const onFormSubmit = useCallback(async (data: ConsultationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (consultation) {
        // Actualizar consulta existente
        await updateConsultation(consultation.id, data);
      } else {
        // Crear nueva consulta
        await createConsultation(data);
      }

      if (onSubmit) {
        onSubmit(data);
      }
    } catch (error) {
      console.error('Error al guardar consulta:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Error inesperado al guardar la consulta'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [consultation, createConsultation, updateConsultation, onSubmit]);

  // Resetear formulario
  const handleReset = useCallback(() => {
    reset();
    setSubmitError(null);
  }, [reset]);

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {consultation ? 'Editar consulta' : 'Nueva consulta'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {consultation 
              ? 'Modifica los detalles de la consulta'
              : 'Completa la información para crear una nueva consulta'
            }
          </p>
        </div>

        {submitError && (
          <Alert
            type="error"
            title="Error al guardar"
            message={submitError}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Información básica */}
          <FormGroup title="Información básica">
            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Asunto"
                  placeholder="Describe brevemente el motivo de la consulta"
                  error={errors.subject?.message}
                  required
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  label="Descripción detallada"
                  placeholder="Proporciona una descripción completa de la consulta..."
                  rows={4}
                  error={errors.description?.message}
                  required
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="planType"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Tipo de plan"
                    options={PLAN_TYPE_OPTIONS}
                    error={errors.planType?.message}
                    required
                  />
                )}
              />

              <Controller
                name="paymentStatus"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Estado de pago"
                    options={PAYMENT_STATUS_OPTIONS}
                    error={errors.paymentStatus?.message}
                    required
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Prioridad"
                    options={PRIORITY_OPTIONS}
                    error={errors.priority?.message}
                    required
                  />
                )}
              />

              {consultation && (
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Estado"
                      options={STATUS_OPTIONS}
                      error={errors.status?.message}
                      required
                    />
                  )}
                />
              )}
            </div>

            {/* Campos para consulta personalizada */}
            {watch('planType') === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <Controller
                  name="customDuration"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Duración personalizada (minutos)"
                      type="number"
                      min="15"
                      max="480"
                      placeholder="90"
                      error={errors.customDuration?.message}
                    />
                  )}
                />

                <Controller
                  name="customPrice"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Precio personalizado (€)"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="150.00"
                      error={errors.customPrice?.message}
                    />
                  )}
                />
              </div>
            )}


          </FormGroup>

          {/* Información del cliente */}
          <FormGroup title="Información del cliente">
            <div className="relative">
              <Controller
                name="clientEmail"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Email del cliente"
                    type="email"
                    placeholder="cliente@email.com"
                    error={errors.clientEmail?.message}
                    required
                  />
                )}
              />
              
              {/* Sugerencias de clientes */}
              {showClientSuggestions && clientSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  {clientSuggestions.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="font-medium text-gray-900">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="clientName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Nombre del cliente"
                    placeholder="Nombre completo"
                    error={errors.clientName?.message}
                    required
                  />
                )}
              />

              <Controller
                name="clientPhone"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Teléfono"
                    type="tel"
                    placeholder="+34 123 456 789"
                    error={errors.clientPhone?.message}
                  />
                )}
              />
            </div>
          </FormGroup>

          {/* Horarios de consulta */}
          <FormGroup title="Horarios de consulta" description="Opcional: indica cuándo prefiere el cliente la consulta">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="preferredDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Fecha preferida"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    error={errors.preferredDate?.message}
                  />
                )}
              />

              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Hora de inicio"
                    options={[{ value: '', label: 'Seleccionar hora' }, ...TIME_OPTIONS]}
                    error={errors.startTime?.message}
                  />
                )}
              />

              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Hora de fin"
                    options={[{ value: '', label: 'Seleccionar hora' }, ...TIME_OPTIONS]}
                    error={errors.endTime?.message}
                  />
                )}
              />
            </div>
          </FormGroup>

          {/* Notas adicionales */}
          <FormGroup title="Notas adicionales">
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  label="Notas internas"
                  placeholder="Información adicional, observaciones, etc."
                  rows={3}
                  error={errors.notes?.message}
                  helpText="Estas notas son solo para uso interno"
                />
              )}
            />
          </FormGroup>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            {isDirty && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Resetear
              </Button>
            )}
            
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Guardando...
                </>
              ) : (
                consultation ? 'Actualizar' : 'Crear consulta'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationForm;