// Hooks personalizados para el módulo CRM
// Gestión de estado y operaciones asíncronas con React hooks

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Consultation,
  Client,
  Appointment,
  AvailabilitySlot,
  BlockedPeriod,
  MessageTemplate,
  CommunicationLog,
  FollowUp,
  ConsultationFilters,
  ClientFilters,
  AppointmentFilters,
  PaginationOptions,
  PaginatedResponse,
  ApiResponse,
  LoadingState,
  ErrorState
} from '../types/crm';
import {
  consultationService,
  clientService,
  appointmentService,
  messageTemplateService,
  communicationLogService,
  followUpService,
  availabilityService,
  metricsService
} from '../services/firestore';
import { useFirestoreErrorHandler, withFirestoreErrorHandling } from './useFirebaseErrorHandler';

// ============================================================================
// HOOK PARA GESTIÓN DE ESTADO DE CARGA Y ERRORES
// ============================================================================

export const useAsyncState = <T>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (asyncFunction: () => Promise<ApiResponse<T>>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      
      if (result.success) {
        setData(result.data!);
        return result.data;
      } else {
        setError(result.error || 'Error desconocido');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
    setError
  };
};

// ============================================================================
// HOOK PARA GESTIÓN DE CONSULTAS
// ============================================================================

export const useConsultations = (initialFilters?: ConsultationFilters) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ConsultationFilters>(initialFilters || {});
  const [pagination, setPagination] = useState<PaginationOptions>({ page: 1, limit: 20 });
  const [totalItems, setTotalItems] = useState<number>(0);
  
  const { handleError, clearError } = useFirestoreErrorHandler();

  // Cargar consultas
  const loadConsultations = useCallback(async () => {
    setLoading(true);
    setError(null);
    clearError();
    
    try {
      const result = await consultationService.getAll(filters, pagination);
      
      if (result.success) {
        setConsultations(result.data!.data);
        setTotalItems(result.data!.pagination.totalItems);
      } else {
        setError(result.error || 'Error al cargar consultas');
      }
    } catch (err) {
      handleError(err);
      setError('Error inesperado al cargar consultas');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, handleError, clearError]);

  // Crear nueva consulta
  const createConsultation = useCallback(async (consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const wrappedOperation = withFirestoreErrorHandling(
      consultationService.create.bind(consultationService),
      handleError
    );
    
    try {
      const result = await wrappedOperation(consultationData);
      if (result) {
        // Recargar la lista
        await loadConsultations();
        return result;
      }
      throw new Error('Error al crear consulta');
    } catch (err) {
      setError('Error al crear consulta');
      return null;
    }
  }, [loadConsultations, handleError]);

  // Actualizar consulta
  const updateConsultation = useCallback(async (id: string, updates: Partial<Consultation>) => {
    const wrappedOperation = withFirestoreErrorHandling(
      consultationService.update.bind(consultationService),
      handleError
    );
    
    try {
      const result = await wrappedOperation(id, updates);
      if (result) {
        // Actualizar la lista local
        setConsultations(prev => 
          prev.map(consultation => 
            consultation.id === id ? { ...consultation, ...updates } : consultation
          )
        );
        return result;
      }
      throw new Error('Error al actualizar consulta');
    } catch (err) {
      setError('Error al actualizar consulta');
      return null;
    }
  }, [handleError]);

  // Eliminar consulta
  const deleteConsultation = useCallback(async (id: string) => {
    const wrappedOperation = withFirestoreErrorHandling(
      consultationService.delete.bind(consultationService),
      handleError
    );
    
    try {
      await wrappedOperation(id);
      setConsultations(prev => prev.filter(consultation => consultation.id !== id));
      return true;
    } catch (err) {
      setError('Error al eliminar consulta');
      return false;
    }
  }, [handleError]);

  // Aplicar filtros
  const applyFilters = useCallback((newFilters: ConsultationFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset a la primera página
  }, []);

  // Cambiar página
  const changePage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Cargar consultas al montar el componente o cambiar filtros/paginación
  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

  // Métricas calculadas
  const metrics = useMemo(() => {
    const total = consultations.length;
    const pending = consultations.filter(c => c.status === 'pending').length;
    const inProgress = consultations.filter(c => c.status === 'in_progress').length;
    const scheduled = consultations.filter(c => c.status === 'scheduled').length;
    const completed = consultations.filter(c => c.status === 'completed').length;
    
    return {
      total,
      pending,
      inProgress,
      scheduled,
      completed,
      conversionRate: total > 0 ? Math.round((scheduled / total) * 100) : 0
    };
  }, [consultations]);

  return {
    consultations,
    loading,
    error,
    filters,
    pagination,
    totalItems,
    metrics,
    loadConsultations,
    createConsultation,
    updateConsultation,
    deleteConsultation,
    applyFilters,
    changePage,
    setError
  };
};

// ============================================================================
// HOOK PARA GESTIÓN DE CLIENTES
// ============================================================================

export const useClients = (initialFilters?: ClientFilters) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ClientFilters>(initialFilters || {});
  const [pagination, setPagination] = useState<PaginationOptions>({ page: 1, limit: 20 });

  // Cargar clientes
  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await clientService.getAll(filters, pagination);
      
      if (result.success) {
        setClients(result.data!.data);
      } else {
        setError(result.error || 'Error al cargar clientes');
      }
    } catch (err) {
      setError('Error inesperado al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  // Crear nuevo cliente
  const createClient = useCallback(async (clientData: Omit<Client, 'id' | 'registrationDate' | 'totalConsultations' | 'totalAppointments'>) => {
    const result = await clientService.create(clientData);
    
    if (result.success) {
      await loadClients();
      return result.data;
    } else {
      setError(result.error || 'Error al crear cliente');
      return null;
    }
  }, [loadClients]);

  // Actualizar cliente
  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    const result = await clientService.update(id, updates);
    
    if (result.success) {
      setClients(prev => 
        prev.map(client => 
          client.id === id ? { ...client, ...updates } : client
        )
      );
      return result.data;
    } else {
      setError(result.error || 'Error al actualizar cliente');
      return null;
    }
  }, []);

  // Eliminar cliente
  const deleteClient = useCallback(async (id: string) => {
    const result = await clientService.delete(id);
    
    if (result.success) {
      setClients(prev => prev.filter(client => client.id !== id));
      return true;
    } else {
      setError(result.error || 'Error al eliminar cliente');
      return false;
    }
  }, []);

  // Buscar cliente por email
  const findClientByEmail = useCallback(async (email: string) => {
    const result = await clientService.getByEmail(email);
    return result.success ? result.data : null;
  }, []);

  // Verificar si existe un cliente con el email
  const checkEmailExists = useCallback(async (email: string) => {
    const result = await clientService.getByEmail(email);
    return result.success;
  }, []);

  // Obtener cliente por ID
  const getClientById = useCallback(async (id: string) => {
    const result = await clientService.getById(id);
    return result.success ? result.data : null;
  }, []);

  // Aplicar filtros
  const applyFilters = useCallback((newFilters: ClientFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Métricas de clientes
  const metrics = useMemo(() => {
    const total = clients.length;
    const active = clients.filter(c => c.status === 'active').length;
    const inactive = clients.filter(c => c.status === 'inactive').length;
    const blocked = clients.filter(c => c.status === 'blocked').length;
    
    return {
      total,
      active,
      inactive,
      blocked,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
    };
  }, [clients]);

  return {
    clients,
    loading,
    error,
    filters,
    pagination,
    metrics,
    loadClients,
    createClient,
    updateClient,
    deleteClient,
    findClientByEmail,
    checkEmailExists,
    getClientById,
    applyFilters,
    setError
  };
};

// ============================================================================
// HOOK PARA GESTIÓN DE CITAS
// ============================================================================

export const useAppointments = (initialFilters?: AppointmentFilters) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AppointmentFilters>(initialFilters || {});

  // Cargar citas
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await appointmentService.getAll(filters);
      
      if (result.success) {
        setAppointments(result.data!.data);
      } else {
        setError(result.error || 'Error al cargar citas');
      }
    } catch (err) {
      setError('Error inesperado al cargar citas');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Crear nueva cita
  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'reminderSent' | 'followUpRequired'>) => {
    // Verificar disponibilidad primero
    const availabilityResult = await appointmentService.checkAvailability(
      appointmentData.date,
      appointmentData.time,
      appointmentData.duration
    );
    
    if (!availabilityResult.success || !availabilityResult.data) {
      setError('El horario seleccionado no está disponible');
      return null;
    }
    
    const result = await appointmentService.create(appointmentData);
    
    if (result.success) {
      await loadAppointments();
      return result.data;
    } else {
      setError(result.error || 'Error al crear cita');
      return null;
    }
  }, [loadAppointments]);

  // Actualizar cita
  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
    // Si se está cambiando la fecha/hora, verificar disponibilidad
    if (updates.date || updates.time || updates.duration) {
      const currentAppointment = appointments.find(apt => apt.id === id);
      if (currentAppointment) {
        const date = updates.date || currentAppointment.date;
        const time = updates.time || currentAppointment.time;
        const duration = updates.duration || currentAppointment.duration;
        
        const availabilityResult = await appointmentService.checkAvailability(
          date,
          time,
          duration,
          id // Excluir la cita actual de la verificación
        );
        
        if (!availabilityResult.success || !availabilityResult.data) {
          setError('El nuevo horario no está disponible');
          return null;
        }
      }
    }
    
    const result = await appointmentService.update(id, updates);
    
    if (result.success) {
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id ? { ...appointment, ...updates } : appointment
        )
      );
      return result.data;
    } else {
      setError(result.error || 'Error al actualizar cita');
      return null;
    }
  }, [appointments]);

  // Eliminar cita
  const deleteAppointment = useCallback(async (id: string) => {
    const result = await appointmentService.delete(id);
    
    if (result.success) {
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      return true;
    } else {
      setError(result.error || 'Error al eliminar cita');
      return false;
    }
  }, []);

  // Obtener citas por fecha
  const getAppointmentsByDate = useCallback(async (date: string) => {
    const result = await appointmentService.getByDate(date);
    return result.success ? result.data : [];
  }, []);

  // Verificar disponibilidad
  const checkAvailability = useCallback(async (date: string, time: string, duration: number, excludeId?: string) => {
    const result = await appointmentService.checkAvailability(date, time, duration, excludeId);
    return result.success ? result.data : false;
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Métricas de citas
  const metrics = useMemo(() => {
    const total = appointments.length;
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    
    // Citas próximas (próximos 7 días)
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcoming = appointments.filter(a => {
      const appointmentDate = new Date(a.date);
      return appointmentDate >= today && appointmentDate <= nextWeek && 
             (a.status === 'scheduled' || a.status === 'confirmed');
    }).length;
    
    return {
      total,
      scheduled,
      confirmed,
      completed,
      cancelled,
      upcoming,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [appointments]);

  return {
    appointments,
    loading,
    error,
    filters,
    metrics,
    loadAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    checkAvailability,
    setError
  };
};

// ============================================================================
// HOOK PARA GESTIÓN DE PLANTILLAS DE MENSAJES
// ============================================================================

export const useMessageTemplates = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar plantillas
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await messageTemplateService.getAll();
      
      if (result.success) {
        setTemplates(result.data!);
      } else {
        setError(result.error || 'Error al cargar plantillas');
      }
    } catch (err) {
      setError('Error inesperado al cargar plantillas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva plantilla
  const createTemplate = useCallback(async (templateData: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsed'>) => {
    const result = await messageTemplateService.create(templateData);
    
    if (result.success) {
      await loadTemplates();
      return result.data;
    } else {
      setError(result.error || 'Error al crear plantilla');
      return null;
    }
  }, [loadTemplates]);

  // Actualizar plantilla
  const updateTemplate = useCallback(async (id: string, updates: Partial<MessageTemplate>) => {
    const result = await messageTemplateService.update(id, updates);
    
    if (result.success) {
      setTemplates(prev => 
        prev.map(template => 
          template.id === id ? { ...template, ...updates } : template
        )
      );
      return result.data;
    } else {
      setError(result.error || 'Error al actualizar plantilla');
      return null;
    }
  }, []);

  // Eliminar plantilla
  const deleteTemplate = useCallback(async (id: string) => {
    const result = await messageTemplateService.delete(id);
    
    if (result.success) {
      setTemplates(prev => prev.filter(template => template.id !== id));
      return true;
    } else {
      setError(result.error || 'Error al eliminar plantilla');
      return false;
    }
  }, []);

  // Obtener plantillas por tipo
  const getTemplatesByType = useCallback((type: MessageTemplate['type']) => {
    return templates.filter(template => template.type === type && template.isActive);
  }, [templates]);

  // Incrementar uso de plantilla
  const incrementTemplateUsage = useCallback(async (id: string) => {
    const result = await messageTemplateService.incrementUsage(id);
    
    if (result.success) {
      // Actualizar el contador local
      setTemplates(prev => 
        prev.map(template => 
          template.id === id 
            ? { ...template, usageCount: template.usageCount + 1, lastUsed: new Date().toISOString() }
            : template
        )
      );
    }
    
    return result.success;
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    loading,
    error,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByType,
    incrementTemplateUsage,
    setError
  };
};

// ============================================================================
// HOOK PARA GESTIÓN DE DISPONIBILIDAD
// ============================================================================

export const useAvailability = () => {
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar períodos bloqueados
  const loadBlockedPeriods = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await availabilityService.getBlockedPeriods();
      
      if (result.success) {
        setBlockedPeriods(result.data!);
      } else {
        setError(result.error || 'Error al cargar períodos bloqueados');
      }
    } catch (err) {
      setError('Error inesperado al cargar períodos bloqueados');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear período bloqueado
  const createBlockedPeriod = useCallback(async (periodData: Omit<BlockedPeriod, 'id' | 'createdAt'>) => {
    const result = await availabilityService.createBlockedPeriod(periodData);
    
    if (result.success) {
      await loadBlockedPeriods();
      return result.data;
    } else {
      setError(result.error || 'Error al crear período bloqueado');
      return null;
    }
  }, [loadBlockedPeriods]);

  // Eliminar período bloqueado
  const deleteBlockedPeriod = useCallback(async (id: string) => {
    const result = await availabilityService.deleteBlockedPeriod(id);
    
    if (result.success) {
      setBlockedPeriods(prev => prev.filter(period => period.id !== id));
      return true;
    } else {
      setError(result.error || 'Error al eliminar período bloqueado');
      return false;
    }
  }, []);

  // Crear slot de disponibilidad
  const createAvailabilitySlot = useCallback(async (slotData: Omit<AvailabilitySlot, 'id'>) => {
    const result = await availabilityService.createSlot(slotData);
    
    if (result.success) {
      setAvailabilitySlots(prev => [...prev, result.data!]);
      return result.data;
    } else {
      setError(result.error || 'Error al crear slot de disponibilidad');
      return null;
    }
  }, []);

  // Eliminar slot de disponibilidad
  const deleteAvailabilitySlot = useCallback(async (id: string) => {
    const result = await availabilityService.deleteAvailabilitySlot(id);
    
    if (result.success) {
      setAvailabilitySlots(prev => prev.filter(slot => slot.id !== id));
      return true;
    } else {
      setError(result.error || 'Error al eliminar slot de disponibilidad');
      return false;
    }
  }, []);

  // Obtener disponibilidad por fecha
  const getAvailabilityByDate = useCallback(async (date: string) => {
    const result = await availabilityService.getByDate(date);
    return result.success ? result.data : [];
  }, []);

  // Verificar si una fecha está bloqueada
  const isDateBlocked = useCallback((date: string) => {
    return blockedPeriods.some(period => {
      const blockStart = new Date(period.startDate);
      const blockEnd = new Date(period.endDate);
      const checkDate = new Date(date);
      
      return checkDate >= blockStart && checkDate <= blockEnd;
    });
  }, [blockedPeriods]);

  useEffect(() => {
    loadBlockedPeriods();
  }, [loadBlockedPeriods]);

  return {
    availabilitySlots,
    blockedPeriods,
    loading,
    error,
    loadBlockedPeriods,
    createBlockedPeriod,
    deleteBlockedPeriod,
    createAvailabilitySlot,
    deleteAvailabilitySlot,
    getAvailabilityByDate,
    isDateBlocked,
    setError
  };
};

// ============================================================================
// HOOK PARA MÉTRICAS DEL DASHBOARD
// ============================================================================

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await metricsService.getDashboardMetrics();
      
      if (result.success) {
        setMetrics(result.data);
      } else {
        setError(result.error || 'Error al cargar métricas');
      }
    } catch (err) {
      setError('Error inesperado al cargar métricas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    loading,
    error,
    loadMetrics,
    setError
  };
};

// ============================================================================
// HOOK PARA GESTIÓN DE SEGUIMIENTOS
// ============================================================================

export const useFollowUps = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar seguimientos pendientes
  const loadPendingFollowUps = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await followUpService.getPending();
      
      if (result.success) {
        setFollowUps(result.data!);
      } else {
        setError(result.error || 'Error al cargar seguimientos');
      }
    } catch (err) {
      setError('Error inesperado al cargar seguimientos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo seguimiento
  const createFollowUp = useCallback(async (followUpData: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = await followUpService.create(followUpData);
    
    if (result.success) {
      await loadPendingFollowUps();
      return result.data;
    } else {
      setError(result.error || 'Error al crear seguimiento');
      return null;
    }
  }, [loadPendingFollowUps]);

  // Marcar seguimiento como completado
  const completeFollowUp = useCallback(async (id: string, notes?: string) => {
    const result = await followUpService.markCompleted(id, notes);
    
    if (result.success) {
      setFollowUps(prev => prev.filter(followUp => followUp.id !== id));
      return result.data;
    } else {
      setError(result.error || 'Error al completar seguimiento');
      return null;
    }
  }, []);

  useEffect(() => {
    loadPendingFollowUps();
  }, [loadPendingFollowUps]);

  return {
    followUps,
    loading,
    error,
    loadPendingFollowUps,
    createFollowUp,
    completeFollowUp,
    setError
  };
};

// ============================================================================
// HOOK PARA LOGS DE COMUNICACIÓN
// ============================================================================

export const useCommunicationLogs = (clientId?: string) => {
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar logs de comunicación
  const loadLogs = useCallback(async () => {
    if (!clientId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await communicationLogService.getByClient(clientId);
      
      if (result.success) {
        setLogs(result.data!);
      } else {
        setError(result.error || 'Error al cargar logs de comunicación');
      }
    } catch (err) {
      setError('Error inesperado al cargar logs de comunicación');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Crear nuevo log
  const createLog = useCallback(async (logData: Omit<CommunicationLog, 'id' | 'date'>) => {
    const result = await communicationLogService.create(logData);
    
    if (result.success) {
      setLogs(prev => [result.data!, ...prev]);
      return result.data;
    } else {
      setError(result.error || 'Error al crear log de comunicación');
      return null;
    }
  }, []);

  useEffect(() => {
    if (clientId) {
      loadLogs();
    }
  }, [loadLogs, clientId]);

  return {
    logs,
    loading,
    error,
    loadLogs,
    createLog,
    setError
  };
};