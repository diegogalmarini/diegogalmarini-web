// Tipos TypeScript para el módulo CRM
// Siguiendo las especificaciones técnicas del documento

// Tipo para días de la semana
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Consultation {
  id: string;
  consultationCode: string; // Código único de la consulta (ej: CONS-2024-001)
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  subject: string;
  message: string;
  services: string[]; // Servicios solicitados
  status: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  paymentStatus: 'free' | 'pending' | 'paid'; // Estado de pago
  priority: 'low' | 'medium' | 'high';
  planType: 'mail' | '30min' | '60min' | 'custom'; // Tipo de plan incluyendo comunicación por mail
  customDuration?: number; // Duración personalizada en minutos
  customPrice?: number; // Precio personalizado
  startTime?: string; // Hora de inicio (HH:MM)
  endTime?: string; // Hora de fin (HH:MM)
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  assignedTo?: string; // ID del administrador asignado
  notes?: string; // Notas internas del administrador
  source: 'website' | 'referral' | 'direct' | 'social_media'; // Fuente de la consulta
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  registrationDate: string; // ISO string
  lastContactDate?: string; // ISO string
  totalConsultations: number;
  totalAppointments: number;
  status: 'active' | 'inactive' | 'blocked';
  tags: string[]; // Etiquetas para categorización
  notes?: string; // Notas sobre el cliente
  preferredContactMethod: 'email' | 'phone' | 'whatsapp';
  timezone?: string;
  source: 'website' | 'referral' | 'direct' | 'social_media';
}

export interface Appointment {
  id: string;
  appointmentCode: string; // Código único de la cita (ej: APPT-2024-001)
  clientId: string;
  clientName: string;
  clientEmail: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM - Hora de inicio
  endTime: string; // HH:MM - Hora de fin
  duration: number; // en minutos
  planType: 'mail' | '30min' | '60min' | 'custom';
  paymentStatus: 'free' | 'pending' | 'paid'; // Estado de pago
  customPrice?: number; // Precio personalizado para citas custom
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  meetingLink?: string; // Google Meet, Zoom, etc.
  notes?: string; // Notas de la cita
  reminderSent: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  cancelReason?: string; // Razón de cancelación
  outcome?: string; // Resultado de la cita
  followUpRequired: boolean;
  nextSteps?: string; // Próximos pasos acordados
}

export interface AvailabilitySlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isAvailable: boolean;
  type: 'available' | 'blocked' | 'unavailable';
  reason?: string; // Razón del bloqueo o disponibilidad especial
  isRecurring?: boolean;
  dayOfWeek?: DayOfWeek; // Para horarios semanales recurrentes
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number; // cada X días/semanas/meses
    daysOfWeek?: number[]; // 0=domingo, 1=lunes, etc.
    endDate?: string; // fecha fin de la recurrencia
  };
}

export interface BlockedPeriod {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM (opcional para bloqueos de día completo)
  endTime?: string; // HH:MM (opcional para bloqueos de día completo)
  type: 'full_day' | 'time_range';
  reason: string;
  isRecurring?: boolean;
  recurringDays?: number[]; // 0=domingo, 1=lunes, etc.
  createdAt: string; // ISO string
  createdBy: string; // ID del usuario que creó el bloqueo
}

export interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'appointment_confirmation' | 'appointment_reminder' | 'appointment_change' | 'follow_up' | 'cancellation' | 'welcome' | 'custom';
  variables: string[]; // Variables disponibles como {clientName}, {date}, etc.
  isActive: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  usageCount: number; // Número de veces que se ha usado
  lastUsed?: string; // Última vez que se usó
}

export interface CommunicationLog {
  id: string;
  clientId: string;
  appointmentId?: string; // Opcional, si está relacionado con una cita
  consultationId?: string; // Opcional, si está relacionado con una consulta
  type: 'email' | 'call' | 'meeting' | 'note' | 'sms' | 'whatsapp';
  direction: 'inbound' | 'outbound'; // Entrante o saliente
  subject: string;
  content: string;
  date: string; // ISO string
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  templateId?: string; // Si se usó una plantilla
  attachments?: string[]; // URLs de archivos adjuntos
  createdBy: string; // ID del usuario que creó la comunicación
}

export interface FollowUp {
  id: string;
  clientId: string;
  appointmentId?: string;
  consultationId?: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  type: 'call' | 'email' | 'meeting' | 'task' | 'proposal' | 'contract';
  assignedTo: string; // ID del usuario asignado
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  completedAt?: string; // ISO string
  notes?: string;
  reminderDate?: string; // ISO string para recordatorio
}

// Tipos para estadísticas y métricas del dashboard
export interface DashboardMetrics {
  totalConsultations: number;
  pendingConsultations: number;
  totalAppointments: number;
  upcomingAppointments: number;
  totalClients: number;
  activeClients: number;
  conversionRate: number; // Porcentaje de consultas que se convierten en citas
  averageResponseTime: number; // Tiempo promedio de respuesta en horas
  monthlyRevenue?: number;
  appointmentCompletionRate: number; // Porcentaje de citas completadas vs programadas
}

// Tipos para filtros y búsquedas
export interface ConsultationFilters {
  status?: Consultation['status'][];
  paymentStatus?: Consultation['paymentStatus'][];
  planType?: Consultation['planType'][];
  priority?: Consultation['priority'][];
  dateRange?: {
    start: string;
    end: string;
  };
  source?: Consultation['source'][];
  searchTerm?: string;
}

export interface ClientFilters {
  status?: Client['status'][];
  tags?: string[];
  registrationDateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
}

export interface AppointmentFilters {
  status?: Appointment['status'][];
  paymentStatus?: Appointment['paymentStatus'][];
  planType?: Appointment['planType'][];
  dateRange?: {
    start: string;
    end: string;
  };
  clientId?: string;
  searchTerm?: string;
}

// Tipos para formularios
export interface NewConsultationForm {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  subject: string;
  message: string;
  services: string[];
  priority: Consultation['priority'];
  source: Consultation['source'];
}

export interface ConsultationFormData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  subject: string;
  description: string;
  planType: 'mail' | '30min' | '60min' | 'custom';
  paymentStatus: 'free' | 'pending' | 'paid';
  customDuration?: number;
  customPrice?: number;
  priority: Consultation['priority'];
  status: Consultation['status'];
  preferredDate?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface CommunicationFormData {
  clientId: string;
  consultationId?: string;
  appointmentId?: string;
  type: CommunicationLog['type'];
  direction: CommunicationLog['direction'];
  subject: string;
  content: string;
  status: CommunicationLog['status'];
  templateId?: string;
  attachments?: string[];
  createdBy: string;
}

export interface NewClientForm {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  preferredContactMethod: Client['preferredContactMethod'];
  tags: string[];
  notes?: string;
  source: Client['source'];
}

export interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  position?: string;
  status: Client['status'];
  preferredContactMethod: Client['preferredContactMethod'];
  timezone?: string;
  language?: string;
  notes?: string;
  tags?: string[];
}

export interface NewAppointmentForm {
  clientId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  planType: Appointment['planType'];
  paymentStatus: 'free' | 'pending' | 'paid';
  customPrice?: number;
  notes?: string;
  meetingLink?: string;
}

export interface AvailabilityForm {
  date: string;
  startTime: string;
  endTime: string;
  type: AvailabilitySlot['type'];
  reason?: string;
  isRecurring?: boolean;
  recurringPattern?: AvailabilitySlot['recurringPattern'];
}

export interface BlockPeriodForm {
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  type: BlockedPeriod['type'];
  reason: string;
  isRecurring?: boolean;
  recurringDays?: number[];
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos para paginación
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Tipos para notificaciones
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

// Tipos para configuración del CRM
export interface CrmSettings {
  businessHours: {
    [key: string]: { // 'monday', 'tuesday', etc.
      enabled: boolean;
      startTime: string; // HH:MM
      endTime: string; // HH:MM
    };
  };
  defaultAppointmentDuration: number; // en minutos
  bufferTime: number; // tiempo entre citas en minutos
  maxAdvanceBooking: number; // días máximos para agendar con anticipación
  reminderSettings: {
    email: {
      enabled: boolean;
      hoursBeforeAppointment: number;
    };
    sms: {
      enabled: boolean;
      hoursBeforeAppointment: number;
    };
  };
  autoResponseEnabled: boolean;
  autoResponseTemplate?: string;
  timezone: string;
}