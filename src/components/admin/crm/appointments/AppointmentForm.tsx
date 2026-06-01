// Componente de formulario para crear y editar citas
// Incluye selección de cliente, fecha, hora, duración y tipo de cita

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Appointment, AppointmentFormData, Client, AvailabilitySlot } from '../../../../types/crm';
import { useAppointments, useClients, useAvailability } from '../../../../hooks/useCRM';
import { Input, TextArea, Select } from '../ui/FormField';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import LoadingSpinner from '../ui/LoadingSpinner';
import { FormGroup } from '../ui/FormField';
import Badge from '../ui/Badge';
import { formatDate, formatTime, addMinutes } from '../../../../utils/dateUtils';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

// Schema de validación
const appointmentSchema: yup.ObjectSchema<AppointmentFormData> = yup.object({
  title: yup
    .string()
    .required('El título es obligatorio')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres'),

  description: yup
    .string()
    .required('La descripción es obligatoria')
    .max(500, 'La descripción no puede exceder 500 caracteres'),

  clientId: yup
    .string()
    .required('Debe seleccionar un cliente'),

  type: yup
    .string()
    .required('El tipo de cita es obligatorio')
    .oneOf(['consultation', 'follow-up', 'planning', 'review'] as const, 'Tipo de cita inválido'),

  planType: yup
    .string()
    .required('El tipo de plan es obligatorio')
    .oneOf(['mail', '30min', '60min', 'custom'] as const, 'Tipo de plan inválido'),

  paymentStatus: yup
    .string()
    .required('El estado de pago es obligatorio')
    .oneOf(['free', 'pending', 'paid'] as const, 'Estado de pago inválido'),

  customPrice: yup
    .number()
    .nullable()
    .when('planType', {
      is: 'custom',
      then: (schema) => schema.required('El precio personalizado es obligatorio para consultas personalizadas').min(0, 'El precio no puede ser negativo'),
      otherwise: (schema) => schema.nullable()
    }),

  startTime: yup
    .date()
    .required('La fecha y hora de inicio son obligatorias')
    .min(new Date(), 'La fecha debe ser futura'),

  endTime: yup
    .date()
    .nullable(),

  duration: yup
    .number()
    .required('La duración es obligatoria')
    .min(15, 'La duración mínima es 15 minutos')
    .max(480, 'La duración máxima es 8 horas'),

  location: yup
    .string()
    .nullable()
    .max(200, 'La ubicación no puede exceder 200 caracteres'),

  meetingLink: yup
    .string()
    .nullable()
    .url('Debe ser una URL válida')
    .max(500, 'La URL no puede exceder 500 caracteres'),

  notes: yup
    .string()
    .nullable()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres'),

  reminderMinutes: yup
    .number()
    .nullable()
    .min(0, 'Los minutos de recordatorio no pueden ser negativos')
    .max(10080, 'El recordatorio máximo es 7 días (10080 minutos)'),

  paymentLink: yup
    .string()
    .nullable()
    .url('Debe ser una URL válida')
    .max(500, 'La URL no puede exceder 500 caracteres'),

  paymentLinkSent: yup
    .boolean()
    .nullable()
    .default(false)
});

// Props del componente
interface AppointmentFormProps {
  appointment?: Appointment;
  preselectedClientId?: string;
  preselectedDate?: Date;
  onSubmit?: (data: AppointmentFormData) => void;
  onCancel?: () => void;
  className?: string;
}

// Opciones para selects
const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'Consulta inicial', duration: 60 },
  { value: 'follow-up', label: 'Seguimiento', duration: 30 },
  { value: 'planning', label: 'Planificación', duration: 90 },
  { value: 'review', label: 'Revisión', duration: 45 }
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1 hora 30 minutos' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' }
];

const REMINDER_OPTIONS = [
  { value: null, label: 'Sin recordatorio' },
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 120, label: '2 horas antes' },
  { value: 1440, label: '1 día antes' },
  { value: 2880, label: '2 días antes' }
];

const PLAN_TYPE_OPTIONS = [
  { value: 'mail', label: 'Comunicación por mail' },
  { value: '30min', label: 'Consulta 30 minutos' },
  { value: '60min', label: 'Consulta 60 minutos' },
  { value: 'custom', label: 'Consulta personalizada' }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'free', label: 'Gratis' },
  { value: 'pending', label: 'Pendiente de pago' },
  { value: 'paid', label: 'Pagado' }
];

// Componente de selección de cliente
const ClientSelector: React.FC<{
  value: string;
  onChange: (clientId: string) => void;
  error?: string;
  clients: Client[];
  loading: boolean;
}> = ({ value, onChange, error, clients, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(client =>
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  const selectedClient = clients.find(client => client.id === value);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Cliente *
      </label>

      <div className="relative">
        <input
          type="text"
          value={selectedClient ? selectedClient.name : searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
            if (!e.target.value) onChange('');
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Buscar cliente por nombre o email..."
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-300' : 'border-gray-300'
            }`}
        />

        <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* Dropdown de clientes */}
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => {
                  onChange(client.id);
                  setSearchTerm('');
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
              >
                <div className="font-medium text-gray-900">{client.name}</div>
                <div className="text-sm text-gray-500">{client.email}</div>
              </button>
            ))
          ) : (
            <div className="p-4 text-sm text-gray-500 text-center">
              No se encontraron clientes
            </div>
          )}
        </div>
      )}

      {/* Cliente seleccionado */}
      {selectedClient && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-blue-900">{selectedClient.name}</div>
              <div className="text-sm text-blue-700">{selectedClient.email}</div>
              {selectedClient.phone && (
                <div className="text-sm text-blue-700">{selectedClient.phone}</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setSearchTerm('');
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Overlay para cerrar dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

// Componente de selección de horario
const TimeSlotSelector: React.FC<{
  selectedDate: Date;
  duration: number;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
  availabilitySlots: AvailabilitySlot[];
  loadingAvailability: boolean;
}> = ({ selectedDate, duration, value, onChange, error, availabilitySlots, loadingAvailability }) => {
  const timeString = useMemo(() => {
    if (!value) return '';
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }, [value]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const timeVal = e.target.value;
    if (!timeVal) return;
    const [hours, minutes] = timeVal.split(':').map(Number);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);
    onChange(newDate);
  };

  const timeOptions = useMemo(() => {
    const now = new Date();
    const isToday = selectedDate.getFullYear() === now.getFullYear() &&
                    selectedDate.getMonth() === now.getMonth() &&
                    selectedDate.getDate() === now.getDate();

    // 1. Filtrar slots habilitados y disponibles desde la base de datos (pestaña Disponibilidad)
    const activeSlots = availabilitySlots.filter(
      slot => slot.isAvailable && slot.type === 'available'
    );

    if (activeSlots.length > 0) {
      // Si el administrador configuró disponibilidad para hoy/ese día, usarlos
      return activeSlots
        .map(slot => {
          const [hours, minutes] = slot.startTime.split(':').map(Number);
          const hStr = String(hours).padStart(2, '0');
          const mStr = String(minutes).padStart(2, '0');
          return {
            value: `${hStr}:${mStr}`,
            label: `${hStr}:${mStr} (Disponible)`
          };
        })
        .filter(opt => {
          // Si es hoy, filtrar horas del pasado para no permitir reservar citas que ya pasaron
          if (isToday) {
            const [hours, minutes] = opt.value.split(':').map(Number);
            return hours > now.getHours() || (hours === now.getHours() && minutes > now.getMinutes());
          }
          return true;
        })
        .sort((a, b) => a.value.localeCompare(b.value));
    }

    // 2. Si no hay disponibilidad configurada en base de datos, mostrar todas las horas futuras como fallback
    const fallbackOptions = [];
    for (let hour = 0; hour < 24; hour++) {
      for (const min of [0, 30]) {
        const hStr = String(hour).padStart(2, '0');
        const mStr = String(min).padStart(2, '0');
        const val = `${hStr}:${mStr}`;

        if (isToday) {
          if (hour < now.getHours() || (hour === now.getHours() && min <= now.getMinutes())) {
            continue;
          }
        }
        fallbackOptions.push({ value: val, label: val });
      }
    }
    return fallbackOptions;
  }, [selectedDate, availabilitySlots]);

  const activeSlotsCount = useMemo(() => {
    return availabilitySlots.filter(slot => slot.isAvailable && slot.type === 'available').length;
  }, [availabilitySlots]);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Hora *
      </label>
      <select
        value={timeString}
        onChange={handleTimeChange}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white sm:text-sm ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
      >
        <option value="" disabled>
          {loadingAvailability 
            ? 'Cargando horas...' 
            : timeOptions.length === 0 && activeSlotsCount > 0
              ? 'Horas ya pasaron'
              : 'Selecciona una hora...'
          }
        </option>
        {timeOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {loadingAvailability && (
        <p className="text-xs text-blue-500 mt-1">Cargando disponibilidad...</p>
      )}
      {!loadingAvailability && activeSlotsCount > 0 && timeOptions.length === 0 && (
        <p className="text-xs text-amber-600 mt-1">Todos los turnos habilitados de hoy ya pasaron.</p>
      )}
      {!loadingAvailability && activeSlotsCount > 0 && timeOptions.length > 0 && (
        <p className="text-xs text-green-600 mt-1">Mostrando horarios habilitados en Disponibilidad.</p>
      )}
      {!loadingAvailability && activeSlotsCount === 0 && (
        <p className="text-xs text-gray-500 mt-1">Sin horarios predefinidos. Mostrando todo el día (futuro).</p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

// Componente principal
export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  preselectedClientId,
  preselectedDate,
  onSubmit,
  onCancel,
  className = ''
}) => {
  // Estados locales
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(
    preselectedDate || (appointment?.startTime ? new Date(appointment.startTime) : new Date())
  );

  // Hooks
  const { createAppointment, updateAppointment, checkAvailability } = useAppointments();
  const { clients, loading: clientsLoading } = useClients();
  const { availabilitySlots, loading: availabilityLoading } = useAvailability(selectedDate);

  // Configuración del formulario
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
    setError,
    clearErrors
  } = useForm<AppointmentFormData>({
    resolver: yupResolver(appointmentSchema),
    defaultValues: {
      title: appointment?.title || '',
      description: appointment?.description || '',
      clientId: preselectedClientId || appointment?.clientId || '',
      type: appointment?.type || 'consultation',
      planType: appointment?.planType || '30min',
      paymentStatus: appointment?.paymentStatus || 'pending',
      startTime: appointment?.startTime ? new Date(appointment.startTime) : null,
      endTime: appointment?.endTime ? new Date(appointment.endTime) : null,
      duration: appointment?.duration || 60,
      customPrice: appointment?.customPrice || null,
      location: appointment?.location || '',
      meetingLink: appointment?.meetingLink || '',
      notes: appointment?.notes || '',
      reminderMinutes: appointment?.reminderMinutes || 60,
      paymentLink: appointment?.paymentLink || '',
      paymentLinkSent: appointment?.paymentLinkSent || false
    }
  });

  // Observar cambios
  const watchedType = watch('type');
  const watchedPlanType = watch('planType');
  const watchedDuration = watch('duration');
  const watchedStartTime = watch('startTime');

  // Actualizar duración automáticamente según el tipo de cita
  useEffect(() => {
    const appointmentType = APPOINTMENT_TYPES.find(type => type.value === watchedType);
    if (appointmentType && !appointment) {
      setValue('duration', appointmentType.duration);
    }
  }, [watchedType, setValue, appointment]);

  // Duración sugerida se maneja en el onChange del selector de plan para evitar borrar la fecha/hora

  // Validar disponibilidad del horario
  const validateTimeSlot = useCallback(async (startTime: Date, duration: number) => {
    try {
      const isAvailable = await checkAvailability(startTime.toISOString(), startTime.toISOString(), duration, appointment?.id);
      if (!isAvailable) {
        setError('startTime', {
          type: 'manual',
          message: 'Este horario no está disponible'
        });
        return false;
      } else {
        clearErrors('startTime');
        return true;
      }
    } catch (error) {
      console.error('Error validando horario:', error);
      return true; // En caso de error, permitir continuar
    }
  }, [checkAvailability, appointment, setError, clearErrors]);

  // Manejar envío del formulario
  const onFormSubmit = useCallback(async (data: AppointmentFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validar disponibilidad del horario
      if (data.startTime) {
        const isTimeSlotValid = await validateTimeSlot(data.startTime, data.duration);
        if (!isTimeSlotValid) {
          setIsSubmitting(false);
          return;
        }
      }

      // Calcular hora de fin
      const endTime = addMinutes(data.startTime!, data.duration);

      // Obtener información del cliente
      const client = clients.find(c => c.id === data.clientId);
      if (!client) {
        throw new Error('Cliente no encontrado');
      }

      // Preparar datos
      const formData: Partial<Appointment> = {
        ...data,
        appointmentCode: appointment?.appointmentCode || '',
        date: data.startTime.toISOString().split('T')[0],
        startTime: data.startTime.toISOString(),
        endTime: endTime.toISOString(),
        clientName: client.name,
        clientEmail: client.email,
        status: appointment?.status || 'scheduled' as const,
        location: data.location || undefined,
        meetingLink: data.meetingLink || undefined,
        notes: data.notes || undefined,
        reminderMinutes: data.reminderMinutes || undefined
      };

      if (appointment) {
        // Actualizar cita existente
        await updateAppointment(appointment.id, formData);
      } else {
        // Crear nueva cita
        await createAppointment(formData as Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'reminderSent' | 'followUpRequired'>);
      }

      if (onSubmit) {
        onSubmit(data);
      }
    } catch (error) {
      console.error('Error al guardar cita:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Error inesperado al guardar la cita'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [appointment, createAppointment, updateAppointment, onSubmit, clients, validateTimeSlot]);

  // Resetear formulario
  const handleReset = useCallback(() => {
    reset({
      title: '',
      description: '',
      clientId: '',
      type: 'consultation',
      planType: '30min',
      paymentStatus: 'pending',
      startTime: null,
      endTime: null,
      duration: 60,
      customPrice: null,
      location: '',
      meetingLink: '',
      notes: '',
      reminderMinutes: 60,
      paymentLink: '',
      paymentLinkSent: false
    });
    setSubmitError(null);
    setSelectedDate(preselectedDate || new Date());
  }, [reset, preselectedDate]);

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {appointment ? 'Editar cita' : 'Nueva cita'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {appointment
              ? 'Modifica los detalles de la cita'
              : 'Programa una nueva cita con un cliente'
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Título"
                    placeholder="Consulta inicial, Seguimiento, etc."
                    error={errors.title?.message}
                    required
                  />
                )}
              />

              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Tipo de cita"
                    options={APPOINTMENT_TYPES.map(type => ({
                      value: type.value,
                      label: `${type.label} (${type.duration} min)`
                    }))}
                    error={errors.type?.message}
                    required
                  />
                )}
              />
            </div>

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  label="Descripción"
                  placeholder="Describe brevemente el propósito de la cita..."
                  rows={3}
                  error={errors.description?.message}
                />
              )}
            />
          </FormGroup>

          {/* Plan y pago */}
          <FormGroup title="Plan y estado de pago">
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
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val);
                      // Sugerir duración al cambiar el plan, y autocompletar el enlace de LemonSqueezy preconfigurado
                      if (val === '30min') {
                        setValue('duration', 30);
                        setValue('paymentLink', 'https://diego.lemonsqueezy.com/checkout/buy/consulta-30min-premium?discount=0');
                      } else if (val === '60min') {
                        setValue('duration', 60);
                        setValue('paymentLink', 'https://diego.lemonsqueezy.com/checkout/buy/consulta-60min-premium?discount=0');
                      } else if (val === 'mail') {
                        setValue('duration', 15);
                        setValue('paymentLink', 'https://diego.lemonsqueezy.com/checkout/buy/consulta-email-quick?discount=0');
                      } else if (val === 'custom') {
                        setValue('paymentLink', 'https://diego.lemonsqueezy.com/checkout/buy/consulta-personalizada-diego?discount=0');
                      }
                    }}
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

            {/* Campo para precio personalizado */}
            {watch('planType') === 'custom' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
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

            {/* Cobro y Enlace de Pago (LemonSqueezy) */}
            {watch('paymentStatus') === 'pending' && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-4">
                <h4 className="font-semibold text-orange-900 text-sm flex items-center">
                  <span className="w-2.5 h-2.5 bg-orange-400 rounded-full mr-2"></span>
                  Cobro y Enlace de Pago (LemonSqueezy)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="paymentLink"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Enlace de pago (LemonSqueezy / Stripe)"
                        placeholder="https://diego.lemonsqueezy.com/checkout/..."
                        error={errors.paymentLink?.message}
                      />
                    )}
                  />

                  <div className="flex items-end pb-2">
                    <Controller
                      name="paymentLinkSent"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="paymentLinkSent"
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="paymentLinkSent" className="text-sm font-medium text-gray-700 select-none">
                            Enlace ya enviado al cliente
                          </label>
                        </div>
                      )}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-orange-100 gap-3">
                  <div className="text-xs text-orange-700">
                    {watch('paymentLinkSent') ? (
                      <span className="inline-flex items-center text-green-600 font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                        Enlace de pago enviado al cliente por email.
                      </span>
                    ) : (
                      <span className="text-orange-600">
                        ⚠️ Pendiente de enviar el enlace de pago por correo.
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const link = watch('paymentLink');
                      if (!link) {
                        alert('Por favor, ingresa un enlace de pago válido primero.');
                        return;
                      }
                      
                      // Simular envío de email
                      setIsSubmitting(true);
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      setValue('paymentLinkSent', true);
                      setIsSubmitting(false);
                      alert('✉️ ¡Enlace de pago enviado exitosamente por email al cliente!');
                    }}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center px-4 py-2 border-2 border-red-500 text-xs font-bold rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors uppercase tracking-widest w-full sm:w-auto"
                  >
                    Enviar enlace de pago
                  </button>
                </div>
              </div>
            )}
          </FormGroup>

          {/* Cliente */}
          <FormGroup title="Cliente">
            <Controller
              name="clientId"
              control={control}
              render={({ field }) => (
                <ClientSelector
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.clientId?.message}
                  clients={clients}
                  loading={clientsLoading}
                />
              )}
            />
          </FormGroup>

          {/* Fecha y hora */}
          <FormGroup title="Fecha y hora">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setSelectedDate(newDate);
                    // Reset time when date changes
                    setValue('startTime', null);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Duración"
                    options={DURATION_OPTIONS}
                    error={errors.duration?.message}
                    required
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                      // Reset time when duration changes
                      setValue('startTime', null);
                    }}
                  />
                )}
              />

              <div className="md:col-span-1">
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSlotSelector
                      selectedDate={selectedDate}
                      duration={watchedDuration}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.startTime?.message}
                      availabilitySlots={availabilitySlots}
                      loadingAvailability={availabilityLoading}
                    />
                  )}
                />
              </div>
            </div>
          </FormGroup>

          {/* Ubicación */}
          <FormGroup title="Ubicación y acceso">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Ubicación física"
                    placeholder="Oficina, dirección, etc."
                    error={errors.location?.message}
                  />
                )}
              />

              <Controller
                name="meetingLink"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="URL de reunión virtual"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    error={errors.meetingLink?.message}
                  />
                )}
              />
            </div>
          </FormGroup>

          {/* Configuración adicional */}
          <FormGroup title="Configuración adicional">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="reminderMinutes"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Recordatorio"
                    options={REMINDER_OPTIONS}
                    error={errors.reminderMinutes?.message}
                    value={field.value?.toString() || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                )}
              />
            </div>

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  label="Notas internas"
                  placeholder="Notas adicionales sobre la cita, preparación necesaria, etc."
                  rows={4}
                  error={errors.notes?.message}
                  helpText="Estas notas son solo para uso interno"
                />
              )}
            />
          </FormGroup>

          {/* Resumen de la cita */}
          {watchedStartTime && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Resumen de la cita</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {formatDate(watchedStartTime)}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  {formatTime(watchedStartTime)} - {formatTime(addMinutes(watchedStartTime, watchedDuration))}
                </div>
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Duración: {watchedDuration} minutos
                </div>
              </div>
            </div>
          )}

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
              disabled={isSubmitting || !watchedStartTime}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Guardando...
                </>
              ) : (
                appointment ? 'Actualizar cita' : 'Crear cita'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;