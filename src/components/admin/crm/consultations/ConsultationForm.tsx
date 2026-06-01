// Formulario de consultas mejorado con funcionalidades CRUD completas
import React, { useState, useEffect } from 'react';
import type { Consultation } from '../../../../types/crm';
import { Input, Select, TextArea } from '../ui/FormField';
import Button, { PrimaryButton } from '../ui/Button';
import { usePlans } from '../../../../contexts/PlansContext';

interface ConsultationFormProps {
  mode: 'create' | 'edit';
  consultation?: Consultation;
  onSave: (consultation: Partial<Consultation>) => void;
  onCancel: () => void;
}

// Helper robusto para formatear fechas al formato datetime-local (YYYY-MM-DDTHH:mm)
const formatForDatetimeLocal = (dateVal: any): string => {
  if (!dateVal) return '';
  let d: Date;
  if (dateVal instanceof Date) {
    d = dateVal;
  } else if (typeof dateVal === 'object') {
    if (typeof dateVal.toDate === 'function') {
      try {
        d = dateVal.toDate();
      } catch (e) {
        d = new Date();
      }
    } else if (dateVal.seconds !== undefined) {
      d = new Date(dateVal.seconds * 1000);
    } else if (dateVal._seconds !== undefined) {
      d = new Date(dateVal._seconds * 1000);
    } else {
      d = new Date(dateVal);
    }
  } else {
    d = new Date(dateVal);
  }
  
  if (isNaN(d.getTime())) return '';
  
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const ConsultationForm: React.FC<ConsultationFormProps> = ({
  mode,
  consultation,
  onSave,
  onCancel
}) => {
  const { plans } = usePlans();
  const [formData, setFormData] = useState({
    clientName: consultation?.clientName || '',
    clientEmail: consultation?.clientEmail || '',
    clientPhone: consultation?.clientPhone || '',
    subject: consultation?.subject || '',
    message: consultation?.message || '',
    services: consultation?.services || [],
    planType: consultation?.planType || 'mail',
    priority: consultation?.priority || 'medium',
    source: consultation?.source || 'website',
    notes: (consultation?.notes && consultation?.notes.trim() !== consultation?.message?.trim()) ? consultation.notes : '',
    startTime: consultation?.startTime ? formatForDatetimeLocal(consultation.startTime) : ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Servicios disponibles
  const availableServices = [
    'Estrategia Tecnológica',
    'Desarrollo de Productos',
    'Growth Hacking',
    'Arquitectura Cloud',
    'IA y Machine Learning',
    'Blockchain y Web3',
    'Optimización de Procesos',
    'Consultoría General'
  ];

  // Fuentes de consulta
  const sourceOptions = [
    { value: 'website', label: 'Sitio Web' },
    { value: 'referral', label: 'Referido' },
    { value: 'direct', label: 'Contacto Directo' },
    { value: 'social_media', label: 'Redes Sociales' }
  ];

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'El nombre del cliente es requerido';
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'El email del cliente es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'El email no es válido';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambio en campos
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Agregar servicio
  const addService = (service: string) => {
    if (!formData.services.includes(service)) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, service]
      }));
    }
  };

  // Remover servicio
  const removeService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service)
    }));
  };

  // Guardar consulta
  const handleSave = () => {
    if (!validateForm()) return;

    const startTimeISO = formData.startTime ? new Date(formData.startTime).toISOString() : null;
    const consultationData: Partial<Consultation> = {
      ...formData,
      startTime: startTimeISO as any,
      status: mode === 'create' ? 'pending' : consultation?.status,
      paymentStatus: formData.planType === 'mail' ? 'free' : 'pending',
      createdAt: mode === 'create' ? new Date().toISOString() : consultation?.createdAt,
      updatedAt: new Date().toISOString()
    };

    onSave(consultationData);
  };

  return (
    <div className="space-y-6">
      {/* Información del Cliente */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Cliente *
            </label>
            <Input
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              placeholder="Nombre completo del cliente"
              error={errors.clientName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email del Cliente *
            </label>
            <Input
              type="email"
              value={formData.clientEmail}
              onChange={(e) => handleInputChange('clientEmail', e.target.value)}
              placeholder="email@ejemplo.com"
              error={errors.clientEmail}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <Input
              value={formData.clientPhone}
              onChange={(e) => handleInputChange('clientPhone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuente de la Consulta
            </label>
            <Select
              value={formData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              options={sourceOptions}
            />
          </div>
        </div>
      </div>

      {/* Detalles de la Consulta */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles de la Consulta</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asunto *
            </label>
            <Input
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Resumen de la consulta"
              error={errors.subject}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje *
            </label>
            <TextArea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Describe detalladamente tu consulta o proyecto"
              rows={4}
              error={errors.message}
            />
          </div>
        </div>
      </div>

      {/* Configuración del Plan */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración del Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Plan
            </label>
            <Select
              value={formData.planType}
              onChange={(e) => handleInputChange('planType', e.target.value)}
              options={plans.map(plan => ({ value: plan.id, label: `${plan.name} - $${plan.price}` }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <Select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              options={[
                { value: 'low', label: 'Baja' },
                { value: 'medium', label: 'Media' },
                { value: 'high', label: 'Alta' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Horario de la Consulta */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preferencias de Horario</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha y Hora de la Consulta
            </label>
            <Input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Servicios Solicitados */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Servicios Solicitados</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableServices.map(service => (
              <label key={service} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.services.includes(service)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      addService(service);
                    } else {
                      removeService(service);
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{service}</span>
              </label>
            ))}
          </div>
          {formData.services.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Servicios seleccionados:</p>
              <div className="flex flex-wrap gap-2">
                {formData.services.map(service => (
                  <span
                    key={service}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => removeService(service)}
                      className="ml-1.5 text-blue-400 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notas Internas */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notas Internas</h3>
        <TextArea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Notas internas para el equipo (opcional)"
          rows={3}
        />
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button onClick={onCancel} variant="outline">
          Cancelar
        </Button>
        <PrimaryButton onClick={handleSave}>
          {mode === 'create' ? 'Crear Consulta' : 'Guardar Cambios'}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default ConsultationForm;