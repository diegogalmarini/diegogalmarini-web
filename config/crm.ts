// Configuración del módulo CRM
// Contiene todas las configuraciones y constantes del sistema

// Configuración de Firebase/Firestore
export const FIRESTORE_COLLECTIONS = {
  CONSULTATIONS: 'consultations',
  CLIENTS: 'clients',
  APPOINTMENTS: 'appointments',
  MESSAGE_TEMPLATES: 'messageTemplates',
  COMMUNICATION_LOGS: 'communicationLogs',
  FOLLOW_UPS: 'followUps',
  AVAILABILITY: 'availability',
  BLOCKED_PERIODS: 'blockedPeriods'
} as const;

// Estados de consultas
export const CONSULTATION_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

// Prioridades de consultas
export const CONSULTATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

// Tipos de planes
export const PLAN_TYPES = {
  BASIC: 'basic',
  STANDARD: 'standard',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
} as const;

// Estados de clientes
export const CLIENT_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PROSPECT: 'prospect'
} as const;

// Métodos de contacto
export const CONTACT_METHODS = {
  EMAIL: 'email',
  PHONE: 'phone',
  WHATSAPP: 'whatsapp'
} as const;

// Estados de citas
export const APPOINTMENT_STATUSES = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
} as const;

// Tipos de citas
export const APPOINTMENT_TYPES = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow_up',
  MEETING: 'meeting',
  CALL: 'call'
} as const;

// Canales de comunicación
export const COMMUNICATION_CHANNELS = {
  EMAIL: 'email',
  PHONE: 'phone',
  WHATSAPP: 'whatsapp',
  IN_PERSON: 'in_person',
  VIDEO_CALL: 'video_call'
} as const;

// Estados de seguimientos
export const FOLLOW_UP_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100]
} as const;

// Configuración de fechas
export const DATE_CONFIG = {
  DEFAULT_TIMEZONE: 'America/Mexico_City',
  DATE_FORMAT: 'dd/MM/yyyy',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
  TIME_FORMAT: 'HH:mm'
} as const;

// Configuración de disponibilidad
export const AVAILABILITY_CONFIG = {
  DEFAULT_SLOT_DURATION: 60, // minutos
  MIN_SLOT_DURATION: 15,
  MAX_SLOT_DURATION: 480,
  SLOT_DURATION_OPTIONS: [15, 30, 45, 60, 90, 120],
  DEFAULT_WORKING_HOURS: {
    start: '09:00',
    end: '17:00'
  },
  DAYS_OF_WEEK: [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' }
  ]
} as const;

// Horarios predefinidos
export const PREDEFINED_SCHEDULES = [
  {
    name: 'Horario estándar (9-17)',
    schedule: {
      1: [{ start: '09:00', end: '17:00' }], // Lunes
      2: [{ start: '09:00', end: '17:00' }], // Martes
      3: [{ start: '09:00', end: '17:00' }], // Miércoles
      4: [{ start: '09:00', end: '17:00' }], // Jueves
      5: [{ start: '09:00', end: '17:00' }]  // Viernes
    }
  },
  {
    name: 'Horario extendido (8-18)',
    schedule: {
      1: [{ start: '08:00', end: '18:00' }],
      2: [{ start: '08:00', end: '18:00' }],
      3: [{ start: '08:00', end: '18:00' }],
      4: [{ start: '08:00', end: '18:00' }],
      5: [{ start: '08:00', end: '18:00' }]
    }
  },
  {
    name: 'Horario flexible (10-18)',
    schedule: {
      1: [{ start: '10:00', end: '18:00' }],
      2: [{ start: '10:00', end: '18:00' }],
      3: [{ start: '10:00', end: '18:00' }],
      4: [{ start: '10:00', end: '18:00' }],
      5: [{ start: '10:00', end: '18:00' }]
    }
  },
  {
    name: 'Incluye sábados (9-17)',
    schedule: {
      1: [{ start: '09:00', end: '17:00' }],
      2: [{ start: '09:00', end: '17:00' }],
      3: [{ start: '09:00', end: '17:00' }],
      4: [{ start: '09:00', end: '17:00' }],
      5: [{ start: '09:00', end: '17:00' }],
      6: [{ start: '09:00', end: '14:00' }]  // Sábado medio día
    }
  }
] as const;

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  DEFAULT_REMINDERS: [24 * 60, 60, 15], // 24h, 1h, 15min antes (en minutos)
  REMINDER_OPTIONS: [
    { value: 15, label: '15 minutos antes' },
    { value: 30, label: '30 minutos antes' },
    { value: 60, label: '1 hora antes' },
    { value: 120, label: '2 horas antes' },
    { value: 24 * 60, label: '1 día antes' },
    { value: 48 * 60, label: '2 días antes' },
    { value: 7 * 24 * 60, label: '1 semana antes' }
  ]
} as const;

// Configuración de validación
export const VALIDATION_CONFIG = {
  CLIENT_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  },
  CLIENT_EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  CLIENT_PHONE: {
    PATTERN: /^[\+]?[1-9][\d]{0,14}$/
  },
  CONSULTATION_SUBJECT: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 200
  },
  CONSULTATION_DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 2000
  },
  APPOINTMENT_TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100
  },
  INTERNAL_NOTES: {
    MAX_LENGTH: 1000
  }
} as const;

// Configuración de UI
export const UI_CONFIG = {
  COLORS: {
    PRIMARY: 'blue',
    SUCCESS: 'green',
    WARNING: 'yellow',
    DANGER: 'red',
    INFO: 'blue',
    GRAY: 'gray'
  },
  SIZES: {
    XS: 'xs',
    SM: 'sm',
    MD: 'md',
    LG: 'lg',
    XL: 'xl'
  },
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300
} as const;

// Configuración de exportación
export const EXPORT_CONFIG = {
  FORMATS: ['csv', 'xlsx', 'pdf'],
  MAX_RECORDS: 10000,
  FILENAME_PREFIX: 'crm_export'
} as const;

// Configuración de búsqueda
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_RESULTS: 50,
  DEBOUNCE_DELAY: 300
} as const;

// Configuración de cache
export const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutos
  MAX_SIZE: 100
} as const;

// Mensajes del sistema
export const SYSTEM_MESSAGES = {
  SUCCESS: {
    CONSULTATION_CREATED: 'Consulta creada exitosamente',
    CONSULTATION_UPDATED: 'Consulta actualizada exitosamente',
    CONSULTATION_DELETED: 'Consulta eliminada exitosamente',
    CLIENT_CREATED: 'Cliente creado exitosamente',
    CLIENT_UPDATED: 'Cliente actualizado exitosamente',
    CLIENT_DELETED: 'Cliente eliminado exitosamente',
    APPOINTMENT_CREATED: 'Cita creada exitosamente',
    APPOINTMENT_UPDATED: 'Cita actualizada exitosamente',
    APPOINTMENT_DELETED: 'Cita eliminada exitosamente',
    AVAILABILITY_UPDATED: 'Disponibilidad actualizada exitosamente'
  },
  ERROR: {
    GENERIC: 'Ha ocurrido un error inesperado',
    NETWORK: 'Error de conexión. Verifica tu conexión a internet',
    VALIDATION: 'Por favor, corrige los errores en el formulario',
    PERMISSION: 'No tienes permisos para realizar esta acción',
    NOT_FOUND: 'El recurso solicitado no fue encontrado',
    DUPLICATE_EMAIL: 'Ya existe un cliente con este email',
    INVALID_DATE: 'La fecha seleccionada no es válida',
    SLOT_NOT_AVAILABLE: 'El horario seleccionado no está disponible'
  },
  CONFIRMATION: {
    DELETE_CONSULTATION: '¿Estás seguro de que deseas eliminar esta consulta?',
    DELETE_CLIENT: '¿Estás seguro de que deseas eliminar este cliente?',
    DELETE_APPOINTMENT: '¿Estás seguro de que deseas eliminar esta cita?',
    CANCEL_APPOINTMENT: '¿Estás seguro de que deseas cancelar esta cita?'
  }
} as const;

// Configuración de roles y permisos
export const PERMISSIONS = {
  CONSULTATIONS: {
    VIEW: 'consultations:view',
    CREATE: 'consultations:create',
    UPDATE: 'consultations:update',
    DELETE: 'consultations:delete'
  },
  CLIENTS: {
    VIEW: 'clients:view',
    CREATE: 'clients:create',
    UPDATE: 'clients:update',
    DELETE: 'clients:delete'
  },
  APPOINTMENTS: {
    VIEW: 'appointments:view',
    CREATE: 'appointments:create',
    UPDATE: 'appointments:update',
    DELETE: 'appointments:delete'
  },
  AVAILABILITY: {
    VIEW: 'availability:view',
    UPDATE: 'availability:update'
  },
  ANALYTICS: {
    VIEW: 'analytics:view'
  }
} as const;

// Configuración de integración
export const INTEGRATION_CONFIG = {
  GOOGLE_CALENDAR: {
    ENABLED: false,
    SCOPES: ['https://www.googleapis.com/auth/calendar']
  },
  EMAIL_SERVICE: {
    ENABLED: false,
    PROVIDER: 'sendgrid' // 'sendgrid', 'mailgun', 'ses'
  },
  SMS_SERVICE: {
    ENABLED: false,
    PROVIDER: 'twilio' // 'twilio', 'nexmo'
  },
  WHATSAPP: {
    ENABLED: false,
    PROVIDER: 'twilio'
  }
} as const;

// Configuración de desarrollo
export const DEV_CONFIG = {
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  MOCK_DATA: process.env.NODE_ENV === 'development',
  DEBUG_MODE: process.env.NODE_ENV === 'development'
} as const;

// Exportar toda la configuración
export const CRM_CONFIG = {
  FIRESTORE_COLLECTIONS,
  CONSULTATION_STATUSES,
  CONSULTATION_PRIORITIES,
  PLAN_TYPES,
  CLIENT_STATUSES,
  CONTACT_METHODS,
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  COMMUNICATION_CHANNELS,
  FOLLOW_UP_STATUSES,
  PAGINATION_CONFIG,
  DATE_CONFIG,
  AVAILABILITY_CONFIG,
  PREDEFINED_SCHEDULES,
  NOTIFICATION_CONFIG,
  VALIDATION_CONFIG,
  UI_CONFIG,
  EXPORT_CONFIG,
  SEARCH_CONFIG,
  CACHE_CONFIG,
  SYSTEM_MESSAGES,
  PERMISSIONS,
  INTEGRATION_CONFIG,
  DEV_CONFIG
} as const;

export default CRM_CONFIG;