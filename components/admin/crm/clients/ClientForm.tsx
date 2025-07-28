// Componente de formulario para crear y editar clientes
// Incluye validación, manejo de errores y integración con Firestore

import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Client, ClientFormData } from '../../../../types/crm';
import { useClients } from '../../../../hooks/useCRM';
import { Input, TextArea, Select } from '../ui/FormField';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import LoadingSpinner from '../ui/LoadingSpinner';
import { FormGroup } from '../ui/FormField';

// Schema de validación
const clientSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  email: yup
    .string()
    .required('El email es obligatorio')
    .email('Debe ser un email válido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  
  phone: yup
    .string()
    .nullable()
    .matches(/^[+]?[0-9\s\-\(\)]+$/, 'Formato de teléfono inválido')
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres'),
  
  address: yup
    .string()
    .nullable()
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  
  company: yup
    .string()
    .nullable()
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres'),
  
  position: yup
    .string()
    .nullable()
    .max(100, 'El cargo no puede exceder 100 caracteres'),
  
  status: yup
    .string()
    .required('El estado es obligatorio')
    .oneOf(['active', 'inactive', 'blocked'], 'Estado inválido'),
  
  preferredContactMethod: yup
    .string()
    .required('El método de contacto preferido es obligatorio')
    .oneOf(['email', 'phone', 'both'], 'Método de contacto inválido'),
  
  timezone: yup
    .string()
    .nullable()
    .max(50, 'La zona horaria no puede exceder 50 caracteres'),
  
  language: yup
    .string()
    .nullable()
    .oneOf(['es', 'en', 'fr', 'de', 'it', 'pt'], 'Idioma inválido'),
  
  notes: yup
    .string()
    .nullable()
    .max(500, 'Las notas no pueden exceder 500 caracteres'),
  
  tags: yup
    .array()
    .of(yup.string())
    .nullable()
});

// Props del componente
interface ClientFormProps {
  client?: Client;
  onSubmit?: (data: ClientFormData) => void;
  onCancel?: () => void;
  className?: string;
}

// Opciones para selects
const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'blocked', label: 'Bloqueado' }
];

const CONTACT_METHOD_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Teléfono' },
  { value: 'both', label: 'Ambos' }
];

const LANGUAGE_OPTIONS = [
  { value: '', label: 'No especificado' },
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
  { value: 'fr', label: 'Francés' },
  { value: 'de', label: 'Alemán' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Portugués' }
];

const TIMEZONE_OPTIONS = [
  { value: '', label: 'No especificado' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
  { value: 'Europe/London', label: 'Londres (GMT/BST)' },
  { value: 'America/New_York', label: 'Nueva York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (PST/PDT)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (CST/CDT)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' }
];

// Tags predefinidos comunes
const COMMON_TAGS = [
  'VIP',
  'Nuevo',
  'Recurrente',
  'Empresa',
  'Particular',
  'Urgente',
  'Seguimiento',
  'Potencial'
];

export const ClientForm: React.FC<ClientFormProps> = ({
  client,
  onSubmit,
  onCancel,
  className = ''
}) => {
  // Estados locales
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(client?.tags || []);

  // Hooks
  const { createClient, updateClient, checkEmailExists } = useClients();

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
  } = useForm<ClientFormData>({
    resolver: yupResolver(clientSchema),
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
      company: client?.company || '',
      position: client?.position || '',
      status: client?.status || 'active',
      preferredContactMethod: client?.preferredContactMethod || 'email',
      timezone: client?.timezone || '',
      language: client?.language || '',
      notes: client?.notes || '',
      tags: client?.tags || []
    }
  });

  // Observar cambios en el email para validación
  const watchedEmail = watch('email');

  // Validar email único (solo para nuevos clientes)
  const validateEmailUnique = useCallback(async (email: string) => {
    if (!client && email && email !== client?.email) {
      try {
        const exists = await checkEmailExists(email);
        if (exists) {
          setError('email', {
            type: 'manual',
            message: 'Ya existe un cliente con este email'
          });
          return false;
        } else {
          clearErrors('email');
          return true;
        }
      } catch (error) {
        console.error('Error validando email:', error);
        return true; // En caso de error, permitir continuar
      }
    }
    return true;
  }, [client, checkEmailExists, setError, clearErrors]);

  // Manejar tags
  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      const newTags = [...selectedTags, trimmedTag];
      setSelectedTags(newTags);
      setValue('tags', newTags);
    }
    setTagInput('');
  }, [selectedTags, setValue]);

  const removeTag = useCallback((tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    setValue('tags', newTags);
  }, [selectedTags, setValue]);

  const handleTagInputKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
    }
  }, [tagInput, addTag]);

  // Manejar envío del formulario
  const onFormSubmit = useCallback(async (data: ClientFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validar email único
      const isEmailValid = await validateEmailUnique(data.email);
      if (!isEmailValid) {
        setIsSubmitting(false);
        return;
      }

      // Preparar datos
      const formData = {
        ...data,
        tags: selectedTags,
        phone: data.phone || undefined,
        address: data.address || undefined,
        company: data.company || undefined,
        position: data.position || undefined,
        timezone: data.timezone || undefined,
        language: data.language || undefined,
        notes: data.notes || undefined
      };

      let result;
      if (client) {
        // Actualizar cliente existente
        result = await updateClient(client.id, formData);
      } else {
        // Crear nuevo cliente
        result = await createClient(formData);
      }

      // Solo cerrar el modal si la operación fue exitosa
      if (result && onSubmit) {
        onSubmit(formData);
      } else if (!result) {
        setSubmitError('Error al guardar el cliente. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Error inesperado al guardar el cliente'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [client, createClient, updateClient, onSubmit, selectedTags, validateEmailUnique]);

  // Resetear formulario
  const handleReset = useCallback(() => {
    reset();
    setSelectedTags(client?.tags || []);
    setSubmitError(null);
    setTagInput('');
  }, [reset, client]);

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {client ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {client 
              ? 'Modifica la información del cliente'
              : 'Completa la información para crear un nuevo cliente'
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
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Nombre completo"
                    placeholder="Juan Pérez"
                    error={errors.name?.message}
                    required
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Email"
                    type="email"
                    placeholder="juan@email.com"
                    error={errors.email?.message}
                    required
                    onBlur={(e) => {
                      field.onBlur(e);
                      validateEmailUnique(e.target.value);
                    }}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Teléfono"
                    type="tel"
                    placeholder="+34 123 456 789"
                    error={errors.phone?.message}
                  />
                )}
              />

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
            </div>

            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Dirección"
                  placeholder="Calle Principal 123, Ciudad"
                  error={errors.address?.message}
                />
              )}
            />
          </FormGroup>

          {/* Información profesional */}
          <FormGroup title="Información profesional" description="Opcional">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Empresa"
                    placeholder="Nombre de la empresa"
                    error={errors.company?.message}
                  />
                )}
              />

              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Cargo"
                    placeholder="Director, Gerente, etc."
                    error={errors.position?.message}
                  />
                )}
              />
            </div>
          </FormGroup>

          {/* Preferencias de contacto */}
          <FormGroup title="Preferencias de contacto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="preferredContactMethod"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Método preferido"
                    options={CONTACT_METHOD_OPTIONS}
                    error={errors.preferredContactMethod?.message}
                    required
                  />
                )}
              />

              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Idioma"
                    options={LANGUAGE_OPTIONS}
                    error={errors.language?.message}
                  />
                )}
              />

              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Zona horaria"
                    options={TIMEZONE_OPTIONS}
                    error={errors.timezone?.message}
                  />
                )}
              />
            </div>
          </FormGroup>

          {/* Tags */}
          <FormGroup title="Etiquetas" description="Añade etiquetas para organizar y categorizar clientes">
            <div className="space-y-3">
              {/* Tags seleccionados */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
                      >
                        <span className="sr-only">Eliminar etiqueta</span>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Input para nuevas tags */}
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="Escribe una etiqueta y presiona Enter"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addTag(tagInput)}
                  disabled={!tagInput.trim()}
                >
                  Añadir
                </Button>
              </div>
              
              {/* Tags comunes */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500 mr-2">Etiquetas comunes:</span>
                {COMMON_TAGS.filter(tag => !selectedTags.includes(tag)).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </FormGroup>

          {/* Notas */}
          <FormGroup title="Notas adicionales">
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  label="Notas internas"
                  placeholder="Información adicional sobre el cliente, preferencias, observaciones, etc."
                  rows={4}
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
                client ? 'Actualizar' : 'Crear cliente'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;