// Archivo principal de exportación del módulo CRM
// Facilita las importaciones de todos los componentes y utilidades

// Componente principal
export { default as CRMDashboard } from './CRMDashboard';

// Componentes de consultas
export { default as ConsultationList } from './consultations/ConsultationList';
export { default as ConsultationForm } from './consultations/ConsultationForm';
export { default as ConsultationDetail } from './consultations/ConsultationDetail';

// Componentes de clientes
export { default as ClientList } from './clients/ClientList';
export { default as ClientForm } from './clients/ClientForm';
export { default as ClientDetail } from './clients/ClientDetail';

// Componentes de citas
export { default as AppointmentList } from './appointments/AppointmentList';
export { default as AppointmentForm } from './appointments/AppointmentForm';

// Componentes de disponibilidad
export { default as AvailabilityManager } from './availability/AvailabilityManager';

// Componentes de planes
export { default as PlanManager } from './plans/PlanManager';
export { default as PlanList } from './plans/PlanList';
export { default as PlanForm } from './plans/PlanForm';

// Componentes UI reutilizables
export { default as LoadingSpinner } from './ui/LoadingSpinner';
export { default as Alert } from './ui/Alert';
export { default as Modal } from './ui/Modal';
export { default as Badge, StatusBadge, PriorityBadge, PlanTypeBadge } from './ui/Badge';
export { default as Button, PrimaryButton, SecondaryButton, DangerButton, SuccessButton, OutlineButton, GhostButton, ButtonGroup } from './ui/Button';
export { default as Table, TablePagination } from './ui/Table';
export { 
  Input, 
  TextArea, 
  Select, 
  Checkbox, 
  RadioGroup, 
  FormGroup 
} from './ui/FormField';
export { Calendar, DaySchedule, CalendarLegend } from './ui/Calendar';

// Hooks
export {
  useAsyncState,
  useConsultations,
  useClients,
  useAppointments,
  useMessageTemplates,
  useAvailability,
  useDashboardMetrics,
  useFollowUps,
  useCommunicationLogs
} from '../../../hooks/useCRM';

// Servicios
export * from '../../../services/firestore';

// Tipos
export type {
  Consultation,
  ConsultationStatus,
  ConsultationPriority,
  PlanType,
  Client,
  ClientStatus,
  ContactMethod,
  Appointment,
  AppointmentStatus,
  AppointmentType,
  MessageTemplate,
  CommunicationLog,
  CommunicationChannel,
  FollowUp,
  FollowUpStatus,
  AvailabilitySlot,
  BlockedPeriod,
  DashboardMetrics,
  ConsultationFilters,
  ClientFilters,
  AppointmentFilters,
  PaginationOptions,
  SortOptions
} from '../../../types/crm';

// Utilidades
export {
  formatDate,
  formatDateTime,
  formatTime,
  isToday,
  isTomorrow,
  isYesterday,
  isThisWeek,
  isThisMonth,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  diffInDays,
  diffInHours,
  diffInMinutes,
  formatForInput,
  formatForDateTimeInput,
  formatForTimeInput,
  getDayName,
  getMonthName,
  isValidDate,
  parseDate,
  getToday,
  getTomorrow,
  getYesterday,
  formatDuration,
  getDateRange
} from '../../../utils/dateUtils';