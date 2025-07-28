// Componente para responder a consultas
// Permite enviar emails y registrar comunicaciones

import React, { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  PaperAirplaneIcon,
  DocumentTextIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import type { Consultation, CommunicationLog, MessageTemplate } from '../../../../types/crm';
import { useCommunicationLogs } from '../../../../hooks/useCRM';
import { Input, TextArea, Select } from '../ui/FormField';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';

// Schema de validación
const responseSchema = yup.object({
  type: yup
    .string()
    .required('El tipo de comunicación es obligatorio')
    .oneOf(['email', 'call', 'note'], 'Tipo de comunicación inválido'),
  
  subject: yup
    .string()
    .required('El asunto es obligatorio')
    .min(3, 'El asunto debe tener al menos 3 caracteres')
    .max(100, 'El asunto no puede exceder 100 caracteres'),
  
  content: yup
    .string()
    .required('El contenido es obligatorio')
    .min(10, 'El contenido debe tener al menos 10 caracteres')
    .max(5000, 'El contenido no puede exceder 5000 caracteres'),
  
  templateId: yup
    .string()
    .optional()
});

// Tipos para el formulario
interface ResponseFormData {
  type: 'email' | 'call' | 'note';
  subject: string;
  content: string;
  templateId?: string;
}

// Props del componente
interface ResponseFormProps {
  consultation: Consultation;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (communication: CommunicationLog) => void;
  className?: string;
}

// Plantillas de mensaje predefinidas
const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'initial_response',
    name: 'Respuesta inicial',
    subject: 'Re: {subject}',
    content: `Estimado/a {clientName},\n\nGracias por contactarnos. Hemos recibido su consulta y nos pondremos en contacto con usted a la brevedad.\n\nSu consulta:\n{originalMessage}\n\nSaludos cordiales,\nEquipo de Diego Galmarini`,
    type: 'custom',
    variables: ['clientName', 'subject', 'originalMessage'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0
  },
  {
    id: 'appointment_offer',
    name: 'Oferta de cita',
    subject: 'Programemos una cita - {subject}',
    content: `Estimado/a {clientName},\n\nGracias por su consulta. Me gustaría programar una cita para discutir sus necesidades en detalle.\n\n¿Le parece bien si coordinamos una reunión para la próxima semana?\n\nPor favor, hágame saber qué días y horarios le convienen mejor.\n\nSaludos cordiales,\nDiego Galmarini`,
    type: 'custom',
    variables: ['clientName', 'subject'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0
  },
  {
    id: 'more_info_request',
    name: 'Solicitud de más información',
    subject: 'Necesitamos más información - {subject}',
    content: `Estimado/a {clientName},\n\nGracias por contactarnos. Para poder brindarle la mejor asistencia, necesitaríamos algunos detalles adicionales:\n\n- [Especificar qué información necesita]\n- [Agregar más puntos según sea necesario]\n\nUna vez que tengamos esta información, podremos proporcionarle una respuesta más precisa.\n\nSaludos cordiales,\nDiego Galmarini`,
    type: 'custom',
    variables: ['clientName', 'subject'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0
  }
];

// Opciones para el tipo de comunicación
const COMMUNICATION_TYPE_OPTIONS = [
  { value: 'email', label: 'Email', icon: EnvelopeIcon },
  { value: 'call', label: 'Llamada telefónica', icon: PhoneIcon },
  { value: 'note', label: 'Nota interna', icon: ChatBubbleLeftRightIcon }
];

export const ResponseForm: React.FC<ResponseFormProps> = ({
  consultation,
  isOpen,
  onClose,
  onSuccess,
  className = ''
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [templates] = useState<MessageTemplate[]>(DEFAULT_TEMPLATES);
  
  const { createLog } = useCommunicationLogs();
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<ResponseFormData>({
    resolver: yupResolver(responseSchema),
    defaultValues: {
      type: 'email',
      subject: `Re: ${consultation.subject || 'Sin asunto'}`,
      content: '',
      templateId: ''
    }
  });
  
  const watchedType = watch('type');
  const watchedTemplateId = watch('templateId');
  
  // Aplicar plantilla seleccionada
  useEffect(() => {
    if (watchedTemplateId && templates) {
      const template = templates.find(t => t.id === watchedTemplateId);
      if (template) {
        setSelectedTemplate(template);
        
        // Reemplazar variables en la plantilla
        const variables = {
          clientName: consultation.clientName,
          subject: consultation.subject || 'Sin asunto',
          originalMessage: consultation.description || consultation.message
        };
        
        let subject = template.subject;
        let content = template.content;
        
        // Reemplazar variables
        Object.entries(variables).forEach(([key, value]) => {
          const placeholder = `{${key}}`;
          subject = subject.replace(new RegExp(placeholder, 'g'), value || '');
          content = content.replace(new RegExp(placeholder, 'g'), value || '');
        });
        
        setValue('subject', subject);
        setValue('content', content);
      }
    } else {
      setSelectedTemplate(null);
    }
  }, [watchedTemplateId, templates, consultation, setValue]);
  
  // Resetear formulario cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      reset({
        type: 'email',
        subject: `Re: ${consultation.subject || 'Sin asunto'}`,
        content: '',
        templateId: ''
      });
      setSubmitError(null);
    }
  }, [isOpen, consultation.subject, reset]);
  
  // Manejar envío del formulario
  const onFormSubmit = useCallback(async (data: ResponseFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Crear registro de comunicación
      const communicationData = {
        clientId: consultation.clientId || '', // Necesitaríamos obtener esto del cliente
        consultationId: consultation.id,
        type: data.type,
        direction: 'outbound' as const,
        subject: data.subject,
        content: data.content,
        date: new Date().toISOString(),
        status: data.type === 'email' ? 'sent' : 'delivered' as const,
        templateId: data.templateId || undefined,
        createdBy: 'current-user' // Esto debería venir del contexto de autenticación
      };
      
      const newCommunication = await createLog(communicationData);
      
      // Simular envío de email (en una implementación real, aquí se enviaría el email)
      if (data.type === 'email') {
        console.log('Enviando email a:', consultation.clientEmail);
        console.log('Asunto:', data.subject);
        console.log('Contenido:', data.content);
        
        // Aquí se integraría con un servicio de email como SendGrid, Mailgun, etc.
        // await emailService.send({
        //   to: consultation.clientEmail,
        //   subject: data.subject,
        //   content: data.content
        // });
      }
      
      if (onSuccess) {
        onSuccess(newCommunication);
      }
      
      onClose();
    } catch (error) {
      console.error('Error enviando respuesta:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Error inesperado al enviar la respuesta'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [consultation, createCommunicationLog, onSuccess, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Responder consulta"
      size="lg"
      className={className}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Información de la consulta */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Consulta original</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Cliente:</strong> {consultation.clientName} ({consultation.clientEmail})</p>
            <p><strong>Asunto:</strong> {consultation.subject || 'Sin asunto'}</p>
            <p><strong>Mensaje:</strong> {consultation.description || consultation.message}</p>
          </div>
        </div>
        
        {/* Error de envío */}
        {submitError && (
          <Alert
            type="error"
            title="Error al enviar respuesta"
            message={submitError}
          />
        )}
        
        {/* Tipo de comunicación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de comunicación
          </label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-3">
                {COMMUNICATION_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={`
                      flex flex-col items-center p-3 border rounded-lg transition-colors
                      ${field.value === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    <Icon className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            )}
          />
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>
        
        {/* Plantilla */}
        <div>
          <Controller
            name="templateId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Plantilla (opcional)"
                placeholder="Seleccionar plantilla..."
                options={[
                  { value: '', label: 'Sin plantilla' },
                  ...templates.map(template => ({
                    value: template.id,
                    label: template.name
                  }))
                ]}
              />
            )}
          />
        </div>
        
        {/* Asunto */}
        <div>
          <Controller
            name="subject"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Asunto"
                placeholder="Asunto de la respuesta"
                error={errors.subject?.message}
                disabled={watchedType === 'call'}
              />
            )}
          />
        </div>
        
        {/* Contenido */}
        <div>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                label={watchedType === 'email' ? 'Mensaje' : watchedType === 'call' ? 'Notas de la llamada' : 'Contenido de la nota'}
                placeholder={
                  watchedType === 'email' 
                    ? 'Escriba su respuesta aquí...'
                    : watchedType === 'call'
                    ? 'Resumen de la llamada, acuerdos, próximos pasos...'
                    : 'Contenido de la nota interna...'
                }
                rows={8}
                error={errors.content?.message}
              />
            )}
          />
        </div>
        
        {/* Vista previa de plantilla */}
        {selectedTemplate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Plantilla aplicada: {selectedTemplate.name}
            </h4>
            <p className="text-sm text-blue-700">
              Las variables han sido reemplazadas automáticamente con la información de la consulta.
            </p>
          </div>
        )}
        
        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                {watchedType === 'email' ? 'Enviar email' : watchedType === 'call' ? 'Registrar llamada' : 'Guardar nota'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ResponseForm;