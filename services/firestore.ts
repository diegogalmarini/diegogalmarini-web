// Servicios de Firestore para el módulo CRM
// Implementación de operaciones CRUD con Firebase v9+

import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  onSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { app } from '../firebaseConfig';
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
  ApiResponse
} from '../types/crm';

const db = getFirestore(app);

// Nombres de las colecciones
export const COLLECTIONS = {
  CONSULTATIONS: 'consultations',
  CLIENTS: 'clients', 
  APPOINTMENTS: 'appointments',
  AVAILABILITY: 'availability',
  BLOCKED_PERIODS: 'blockedPeriods',
  MESSAGE_TEMPLATES: 'messageTemplates',
  COMMUNICATION_LOGS: 'communicationLogs',
  FOLLOW_UPS: 'followUps',
  USERS: 'users'
} as const;

// Utilidades para conversión de datos
const convertTimestampToString = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return timestamp || new Date().toISOString();
};

const convertStringToTimestamp = (dateString: string): Timestamp => {
  return Timestamp.fromDate(new Date(dateString));
};

// Función para generar códigos únicos
const generateUniqueCode = (prefix: string): string => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${year}-${timestamp}${random}`;
};

// Función para determinar el estado de pago basado en el tipo de plan
const getPaymentStatusFromPlanType = (planType: string): 'free' | 'pending' | 'paid' => {
  if (planType === 'mail') return 'free';
  return 'pending'; // Por defecto las consultas de pago quedan pendientes
};

// ============================================================================
// SERVICIOS PARA CONSULTAS (CONSULTATIONS)
// ============================================================================

export const consultationService = {
  // Crear nueva consulta
  async create(consultation: Omit<Consultation, 'id' | 'consultationCode' | 'createdAt' | 'updatedAt' | 'paymentStatus'>): Promise<ApiResponse<Consultation>> {
    try {
      const now = new Date().toISOString();
      const consultationCode = generateUniqueCode('CONS');
      const paymentStatus = getPaymentStatusFromPlanType(consultation.planType);
      
      const consultationData = {
        ...consultation,
        consultationCode,
        paymentStatus,
        createdAt: convertStringToTimestamp(now),
        updatedAt: convertStringToTimestamp(now)
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.CONSULTATIONS), consultationData);
      const newConsultation: Consultation = {
        ...consultation,
        id: docRef.id,
        consultationCode,
        paymentStatus,
        createdAt: now,
        updatedAt: now
      };
      
      return { success: true, data: newConsultation };
    } catch (error) {
      console.error('Error creating consultation:', error);
      return { success: false, error: 'Error al crear la consulta' };
    }
  },

  // Obtener consulta por ID
  async getById(id: string): Promise<ApiResponse<Consultation>> {
    try {
      const docRef = doc(db, COLLECTIONS.CONSULTATIONS, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Consulta no encontrada' };
      }
      
      const data = docSnap.data();
      const consultation: Consultation = {
        id: docSnap.id,
        ...data,
        createdAt: convertTimestampToString(data.createdAt),
        updatedAt: convertTimestampToString(data.updatedAt)
      } as Consultation;
      
      return { success: true, data: consultation };
    } catch (error) {
      console.error('Error getting consultation:', error);
      return { success: false, error: 'Error al obtener la consulta' };
    }
  },

  // Obtener consultas con filtros y paginación
  async getAll(filters?: ConsultationFilters, pagination?: PaginationOptions): Promise<ApiResponse<PaginatedResponse<Consultation>>> {
    try {
      const constraints: QueryConstraint[] = [];
      
      // Aplicar filtros
      if (filters?.status && filters.status.length > 0) {
        constraints.push(where('status', 'in', filters.status));
      }
      if (filters?.priority && filters.priority.length > 0) {
        constraints.push(where('priority', 'in', filters.priority));
      }
      if (filters?.source && filters.source.length > 0) {
        constraints.push(where('source', 'in', filters.source));
      }
      if (filters?.paymentStatus && filters.paymentStatus.length > 0) {
        constraints.push(where('paymentStatus', 'in', filters.paymentStatus));
      }
      if (filters?.planType && filters.planType.length > 0) {
        constraints.push(where('planType', 'in', filters.planType));
      }
      if (filters?.dateRange) {
        constraints.push(
          where('createdAt', '>=', convertStringToTimestamp(filters.dateRange.start)),
          where('createdAt', '<=', convertStringToTimestamp(filters.dateRange.end))
        );
      }
      
      // Ordenamiento
      const sortBy = pagination?.sortBy || 'createdAt';
      const sortOrder = pagination?.sortOrder || 'desc';
      constraints.push(orderBy(sortBy, sortOrder));
      
      // Paginación
      if (pagination?.limit) {
        constraints.push(limit(pagination.limit));
      }
      
      const q = query(collection(db, COLLECTIONS.CONSULTATIONS), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const consultations: Consultation[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToString(data.createdAt),
          updatedAt: convertTimestampToString(data.updatedAt)
        } as Consultation;
      });
      
      // Filtro de búsqueda por texto (se hace en el cliente por limitaciones de Firestore)
      let filteredConsultations = consultations;
      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredConsultations = consultations.filter(consultation => 
          consultation?.clientName?.toLowerCase().includes(searchTerm) ||
          consultation?.clientEmail?.toLowerCase().includes(searchTerm) ||
          (consultation?.subject || '').toLowerCase().includes(searchTerm) ||
          consultation?.message?.toLowerCase().includes(searchTerm)
        );
      }
      
      const paginatedResponse: PaginatedResponse<Consultation> = {
        data: filteredConsultations,
        pagination: {
          currentPage: pagination?.page || 1,
          totalPages: 1, // Simplificado por ahora
          totalItems: filteredConsultations.length,
          itemsPerPage: pagination?.limit || filteredConsultations.length,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
      
      return { success: true, data: paginatedResponse };
    } catch (error) {
      console.error('Error getting consultations:', error);
      return { success: false, error: 'Error al obtener las consultas' };
    }
  },

  // Actualizar consulta
  async update(id: string, updates: Partial<Consultation>): Promise<ApiResponse<Consultation>> {
    try {
      const docRef = doc(db, COLLECTIONS.CONSULTATIONS, id);
      const updateData = {
        ...updates,
        updatedAt: convertStringToTimestamp(new Date().toISOString())
      };
      
      // Remover campos que no deben actualizarse
      delete updateData.id;
      delete updateData.createdAt;
      
      await updateDoc(docRef, updateData);
      
      // Obtener el documento actualizado
      const updatedDoc = await this.getById(id);
      return updatedDoc;
    } catch (error) {
      console.error('Error updating consultation:', error);
      return { success: false, error: 'Error al actualizar la consulta' };
    }
  },

  // Eliminar consulta
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, COLLECTIONS.CONSULTATIONS, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting consultation:', error);
      return { success: false, error: 'Error al eliminar la consulta' };
    }
  },

  // Suscribirse a cambios en tiempo real
  subscribe(callback: (consultations: Consultation[]) => void, filters?: ConsultationFilters) {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    
    if (filters?.status && filters.status.length > 0) {
      constraints.push(where('status', 'in', filters.status));
    }
    if (filters?.paymentStatus && filters.paymentStatus.length > 0) {
      constraints.push(where('paymentStatus', 'in', filters.paymentStatus));
    }
    if (filters?.planType && filters.planType.length > 0) {
      constraints.push(where('planType', 'in', filters.planType));
    }
    
    const q = query(collection(db, COLLECTIONS.CONSULTATIONS), ...constraints);
    
    return onSnapshot(q, (querySnapshot) => {
      const consultations: Consultation[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToString(data.createdAt),
          updatedAt: convertTimestampToString(data.updatedAt)
        } as Consultation;
      });
      
      callback(consultations);
    });
  }
};

// ============================================================================
// SERVICIOS PARA CLIENTES (CLIENTS)
// ============================================================================

export const clientService = {
  // Crear nuevo cliente
  async create(client: Omit<Client, 'id' | 'registrationDate' | 'totalConsultations' | 'totalAppointments'>): Promise<ApiResponse<Client>> {
    try {
      const now = new Date().toISOString();
      const clientData = {
        ...client,
        registrationDate: convertStringToTimestamp(now),
        totalConsultations: 0,
        totalAppointments: 0
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.CLIENTS), clientData);
      const newClient: Client = {
        ...client,
        id: docRef.id,
        registrationDate: now,
        totalConsultations: 0,
        totalAppointments: 0
      };
      
      return { success: true, data: newClient };
    } catch (error) {
      console.error('Error creating client:', error);
      return { success: false, error: 'Error al crear el cliente' };
    }
  },

  // Obtener cliente por ID
  async getById(id: string): Promise<ApiResponse<Client>> {
    try {
      const docRef = doc(db, COLLECTIONS.CLIENTS, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Cliente no encontrado' };
      }
      
      const data = docSnap.data();
      const client: Client = {
        id: docSnap.id,
        ...data,
        registrationDate: convertTimestampToString(data.registrationDate),
        lastContactDate: data.lastContactDate ? convertTimestampToString(data.lastContactDate) : undefined
      } as Client;
      
      return { success: true, data: client };
    } catch (error) {
      console.error('Error getting client:', error);
      return { success: false, error: 'Error al obtener el cliente' };
    }
  },

  // Obtener cliente por email
  async getByEmail(email: string): Promise<ApiResponse<Client>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.CLIENTS),
        where('email', '==', email),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { success: false, error: 'Cliente no encontrado' };
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const client: Client = {
        id: doc.id,
        ...data,
        registrationDate: convertTimestampToString(data.registrationDate),
        lastContactDate: data.lastContactDate ? convertTimestampToString(data.lastContactDate) : undefined
      } as Client;
      
      return { success: true, data: client };
    } catch (error) {
      console.error('Error getting client by email:', error);
      return { success: false, error: 'Error al obtener el cliente' };
    }
  },

  // Obtener todos los clientes con filtros
  async getAll(filters?: ClientFilters, pagination?: PaginationOptions): Promise<ApiResponse<PaginatedResponse<Client>>> {
    try {
      const constraints: QueryConstraint[] = [orderBy('registrationDate', 'desc')];
      
      // Aplicar filtros
      if (filters?.status && filters.status.length > 0) {
        constraints.push(where('status', 'in', filters.status));
      }
      
      if (pagination?.limit) {
        constraints.push(limit(pagination.limit));
      }
      
      const q = query(collection(db, COLLECTIONS.CLIENTS), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const clients: Client[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          registrationDate: convertTimestampToString(data.registrationDate),
          lastContactDate: data.lastContactDate ? convertTimestampToString(data.lastContactDate) : undefined
        } as Client;
      });
      
      // Filtros adicionales en el cliente
      let filteredClients = clients;
      
      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredClients = clients.filter(client => 
          client.name.toLowerCase().includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm) ||
          (client.company && client.company.toLowerCase().includes(searchTerm))
        );
      }
      
      if (filters?.tags && filters.tags.length > 0) {
        filteredClients = filteredClients.filter(client => 
          filters.tags!.some(tag => client.tags.includes(tag))
        );
      }
      
      const paginatedResponse: PaginatedResponse<Client> = {
        data: filteredClients,
        pagination: {
          currentPage: pagination?.page || 1,
          totalPages: 1,
          totalItems: filteredClients.length,
          itemsPerPage: pagination?.limit || filteredClients.length,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
      
      return { success: true, data: paginatedResponse };
    } catch (error) {
      console.error('Error getting clients:', error);
      return { success: false, error: 'Error al obtener los clientes' };
    }
  },

  // Actualizar cliente
  async update(id: string, updates: Partial<Client>): Promise<ApiResponse<Client>> {
    try {
      const docRef = doc(db, COLLECTIONS.CLIENTS, id);
      const updateData = { ...updates };
      
      // Remover campos que no deben actualizarse
      delete updateData.id;
      delete updateData.registrationDate;
      delete updateData.totalConsultations;
      delete updateData.totalAppointments;
      
      // Convertir fechas si es necesario
      if (updateData.lastContactDate) {
        updateData.lastContactDate = convertStringToTimestamp(updateData.lastContactDate as string) as any;
      }
      
      await updateDoc(docRef, updateData);
      
      const updatedDoc = await this.getById(id);
      return updatedDoc;
    } catch (error) {
      console.error('Error updating client:', error);
      return { success: false, error: 'Error al actualizar el cliente' };
    }
  },

  // Eliminar cliente
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, COLLECTIONS.CLIENTS, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting client:', error);
      return { success: false, error: 'Error al eliminar el cliente' };
    }
  },

  // Incrementar contador de consultas
  async incrementConsultations(clientId: string): Promise<ApiResponse<void>> {
    try {
      const clientDoc = await this.getById(clientId);
      if (!clientDoc.success || !clientDoc.data) {
        return { success: false, error: 'Cliente no encontrado' };
      }
      
      const docRef = doc(db, COLLECTIONS.CLIENTS, clientId);
      await updateDoc(docRef, {
        totalConsultations: clientDoc.data.totalConsultations + 1,
        lastContactDate: convertStringToTimestamp(new Date().toISOString())
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error incrementing consultations:', error);
      return { success: false, error: 'Error al actualizar el contador de consultas' };
    }
  },

  // Incrementar contador de citas
  async incrementAppointments(clientId: string): Promise<ApiResponse<void>> {
    try {
      const clientDoc = await this.getById(clientId);
      if (!clientDoc.success || !clientDoc.data) {
        return { success: false, error: 'Cliente no encontrado' };
      }
      
      const docRef = doc(db, COLLECTIONS.CLIENTS, clientId);
      await updateDoc(docRef, {
        totalAppointments: clientDoc.data.totalAppointments + 1,
        lastContactDate: convertStringToTimestamp(new Date().toISOString())
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error incrementing appointments:', error);
      return { success: false, error: 'Error al actualizar el contador de citas' };
    }
  }
};

// ============================================================================
// SERVICIOS PARA CITAS (APPOINTMENTS)
// ============================================================================

export const appointmentService = {
  // Crear nueva cita
  async create(appointment: Omit<Appointment, 'id' | 'appointmentCode' | 'createdAt' | 'updatedAt' | 'reminderSent' | 'followUpRequired' | 'paymentStatus'>): Promise<ApiResponse<Appointment>> {
    try {
      const now = new Date().toISOString();
      const appointmentCode = generateUniqueCode('APPT');
      const paymentStatus = getPaymentStatusFromPlanType(appointment.planType);
      
      const appointmentData = {
        ...appointment,
        appointmentCode,
        paymentStatus,
        createdAt: convertStringToTimestamp(now),
        updatedAt: convertStringToTimestamp(now),
        reminderSent: false,
        followUpRequired: false
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), appointmentData);
      const newAppointment: Appointment = {
        ...appointment,
        id: docRef.id,
        appointmentCode,
        paymentStatus,
        createdAt: now,
        updatedAt: now,
        reminderSent: false,
        followUpRequired: false
      };
      
      // Incrementar contador de citas del cliente
      await clientService.incrementAppointments(appointment.clientId);
      
      return { success: true, data: newAppointment };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { success: false, error: 'Error al crear la cita' };
    }
  },

  // Obtener cita por ID
  async getById(id: string): Promise<ApiResponse<Appointment>> {
    try {
      const docRef = doc(db, COLLECTIONS.APPOINTMENTS, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Cita no encontrada' };
      }
      
      const data = docSnap.data();
      const appointment: Appointment = {
        id: docSnap.id,
        ...data,
        createdAt: convertTimestampToString(data.createdAt),
        updatedAt: convertTimestampToString(data.updatedAt)
      } as Appointment;
      
      return { success: true, data: appointment };
    } catch (error) {
      console.error('Error getting appointment:', error);
      return { success: false, error: 'Error al obtener la cita' };
    }
  },

  // Obtener citas con filtros
  async getAll(filters?: AppointmentFilters, pagination?: PaginationOptions): Promise<ApiResponse<PaginatedResponse<Appointment>>> {
    try {
      const constraints: QueryConstraint[] = [orderBy('date', 'desc'), orderBy('time', 'desc')];
      
      // Aplicar filtros
      if (filters?.status && filters.status.length > 0) {
        constraints.push(where('status', 'in', filters.status));
      }
      if (filters?.planType && filters.planType.length > 0) {
        constraints.push(where('planType', 'in', filters.planType));
      }
      if (filters?.paymentStatus && filters.paymentStatus.length > 0) {
        constraints.push(where('paymentStatus', 'in', filters.paymentStatus));
      }
      if (filters?.clientId) {
        constraints.push(where('clientId', '==', filters.clientId));
      }
      if (filters?.dateRange) {
        constraints.push(
          where('date', '>=', filters.dateRange.start),
          where('date', '<=', filters.dateRange.end)
        );
      }
      
      if (pagination?.limit) {
        constraints.push(limit(pagination.limit));
      }
      
      const q = query(collection(db, COLLECTIONS.APPOINTMENTS), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const appointments: Appointment[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToString(data.createdAt),
          updatedAt: convertTimestampToString(data.updatedAt)
        } as Appointment;
      });
      
      // Filtro de búsqueda por texto
      let filteredAppointments = appointments;
      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredAppointments = appointments.filter(appointment => 
          appointment.clientName.toLowerCase().includes(searchTerm) ||
          appointment.clientEmail.toLowerCase().includes(searchTerm) ||
          (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm))
        );
      }
      
      const paginatedResponse: PaginatedResponse<Appointment> = {
        data: filteredAppointments,
        pagination: {
          currentPage: pagination?.page || 1,
          totalPages: 1,
          totalItems: filteredAppointments.length,
          itemsPerPage: pagination?.limit || filteredAppointments.length,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
      
      return { success: true, data: paginatedResponse };
    } catch (error) {
      console.error('Error getting appointments:', error);
      return { success: false, error: 'Error al obtener las citas' };
    }
  },

  // Obtener citas por fecha
  async getByDate(date: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.APPOINTMENTS),
        where('date', '==', date),
        orderBy('time', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const appointments: Appointment[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToString(data.createdAt),
          updatedAt: convertTimestampToString(data.updatedAt)
        } as Appointment;
      });
      
      return { success: true, data: appointments };
    } catch (error) {
      console.error('Error getting appointments by date:', error);
      return { success: false, error: 'Error al obtener las citas por fecha' };
    }
  },

  // Actualizar cita
  async update(id: string, updates: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    try {
      const docRef = doc(db, COLLECTIONS.APPOINTMENTS, id);
      const updateData = {
        ...updates,
        updatedAt: convertStringToTimestamp(new Date().toISOString())
      };
      
      // Remover campos que no deben actualizarse
      delete updateData.id;
      delete updateData.createdAt;
      
      await updateDoc(docRef, updateData);
      
      const updatedDoc = await this.getById(id);
      return updatedDoc;
    } catch (error) {
      console.error('Error updating appointment:', error);
      return { success: false, error: 'Error al actualizar la cita' };
    }
  },

  // Eliminar cita
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, COLLECTIONS.APPOINTMENTS, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return { success: false, error: 'Error al eliminar la cita' };
    }
  },

  // Verificar disponibilidad de horario
  async checkAvailability(date: string, time: string, duration: number, excludeId?: string): Promise<ApiResponse<boolean>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.APPOINTMENTS),
        where('date', '==', date),
        where('status', 'in', ['scheduled', 'confirmed'])
      );
      
      const querySnapshot = await getDocs(q);
      const existingAppointments = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Appointment))
        .filter(apt => excludeId ? apt.id !== excludeId : true);
      
      // Verificar conflictos de horario
      const [requestHour, requestMinute] = time.split(':').map(Number);
      const requestStart = requestHour * 60 + requestMinute;
      const requestEnd = requestStart + duration;
      
      const hasConflict = existingAppointments.some(apt => {
        const [aptHour, aptMinute] = apt.time.split(':').map(Number);
        const aptStart = aptHour * 60 + aptMinute;
        const aptEnd = aptStart + apt.duration;
        
        // Verificar solapamiento
        return (requestStart < aptEnd && requestEnd > aptStart);
      });
      
      return { success: true, data: !hasConflict };
    } catch (error) {
      console.error('Error checking availability:', error);
      return { success: false, error: 'Error al verificar disponibilidad' };
    }
  }
};

// ============================================================================
// SERVICIOS PARA PLANTILLAS DE MENSAJES (MESSAGE TEMPLATES)
// ============================================================================

export const messageTemplateService = {
  // Crear nueva plantilla
  async create(template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsed'>): Promise<ApiResponse<MessageTemplate>> {
    try {
      const now = new Date().toISOString();
      const templateData = {
        ...template,
        createdAt: convertStringToTimestamp(now),
        updatedAt: convertStringToTimestamp(now),
        usageCount: 0
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.MESSAGE_TEMPLATES), templateData);
      const newTemplate: MessageTemplate = {
        ...template,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
        usageCount: 0
      };
      
      return { success: true, data: newTemplate };
    } catch (error) {
      console.error('Error creating message template:', error);
      return { success: false, error: 'Error al crear la plantilla' };
    }
  },

  // Obtener todas las plantillas activas
  async getAll(): Promise<ApiResponse<MessageTemplate[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.MESSAGE_TEMPLATES),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const templates: MessageTemplate[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToString(data.createdAt),
          updatedAt: convertTimestampToString(data.updatedAt),
          lastUsed: data.lastUsed ? convertTimestampToString(data.lastUsed) : undefined
        } as MessageTemplate;
      });
      
      return { success: true, data: templates };
    } catch (error) {
      console.error('Error getting message templates:', error);
      return { success: false, error: 'Error al obtener las plantillas' };
    }
  },

  // Obtener plantillas por tipo
  async getByType(type: MessageTemplate['type']): Promise<ApiResponse<MessageTemplate[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.MESSAGE_TEMPLATES),
        where('type', '==', type),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const templates: MessageTemplate[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToString(data.createdAt),
          updatedAt: convertTimestampToString(data.updatedAt),
          lastUsed: data.lastUsed ? convertTimestampToString(data.lastUsed) : undefined
        } as MessageTemplate;
      });
      
      return { success: true, data: templates };
    } catch (error) {
      console.error('Error getting message templates by type:', error);
      return { success: false, error: 'Error al obtener las plantillas por tipo' };
    }
  },

  // Actualizar plantilla
  async update(id: string, updates: Partial<MessageTemplate>): Promise<ApiResponse<MessageTemplate>> {
    try {
      const docRef = doc(db, COLLECTIONS.MESSAGE_TEMPLATES, id);
      const updateData = {
        ...updates,
        updatedAt: convertStringToTimestamp(new Date().toISOString())
      };
      
      // Remover campos que no deben actualizarse
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.usageCount;
      delete updateData.lastUsed;
      
      await updateDoc(docRef, updateData);
      
      const updatedDoc = await this.getById(id);
      return updatedDoc;
    } catch (error) {
      console.error('Error updating message template:', error);
      return { success: false, error: 'Error al actualizar la plantilla' };
    }
  },

  // Obtener plantilla por ID
  async getById(id: string): Promise<ApiResponse<MessageTemplate>> {
    try {
      const docRef = doc(db, COLLECTIONS.MESSAGE_TEMPLATES, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Plantilla no encontrada' };
      }
      
      const data = docSnap.data();
      const template: MessageTemplate = {
        id: docSnap.id,
        ...data,
        createdAt: convertTimestampToString(data.createdAt),
        updatedAt: convertTimestampToString(data.updatedAt),
        lastUsed: data.lastUsed ? convertTimestampToString(data.lastUsed) : undefined
      } as MessageTemplate;
      
      return { success: true, data: template };
    } catch (error) {
      console.error('Error getting message template:', error);
      return { success: false, error: 'Error al obtener la plantilla' };
    }
  },

  // Incrementar contador de uso
  async incrementUsage(id: string): Promise<ApiResponse<void>> {
    try {
      const templateDoc = await this.getById(id);
      if (!templateDoc.success || !templateDoc.data) {
        return { success: false, error: 'Plantilla no encontrada' };
      }
      
      const docRef = doc(db, COLLECTIONS.MESSAGE_TEMPLATES, id);
      await updateDoc(docRef, {
        usageCount: templateDoc.data.usageCount + 1,
        lastUsed: convertStringToTimestamp(new Date().toISOString())
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error incrementing template usage:', error);
      return { success: false, error: 'Error al actualizar el contador de uso' };
    }
  },

  // Eliminar plantilla
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, COLLECTIONS.MESSAGE_TEMPLATES, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting message template:', error);
      return { success: false, error: 'Error al eliminar la plantilla' };
    }
  }
};

// ============================================================================
// SERVICIOS PARA LOGS DE COMUNICACIÓN (COMMUNICATION LOGS)
// ============================================================================

export const communicationLogService = {
  // Crear nuevo log de comunicación
  async create(log: Omit<CommunicationLog, 'id' | 'date'>): Promise<ApiResponse<CommunicationLog>> {
    try {
      const now = new Date().toISOString();
      const logData = {
        ...log,
        date: convertStringToTimestamp(now)
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.COMMUNICATION_LOGS), logData);
      const newLog: CommunicationLog = {
        ...log,
        id: docRef.id,
        date: now
      };
      
      return { success: true, data: newLog };
    } catch (error) {
      console.error('Error creating communication log:', error);
      return { success: false, error: 'Error al crear el log de comunicación' };
    }
  },

  // Obtener logs por cliente
  async getByClient(clientId: string): Promise<ApiResponse<CommunicationLog[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.COMMUNICATION_LOGS),
        where('clientId', '==', clientId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const logs: CommunicationLog[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: convertTimestampToString(data.date)
        } as CommunicationLog;
      });
      
      return { success: true, data: logs };
    } catch (error) {
      console.error('Error getting communication logs by client:', error);
      return { success: false, error: 'Error al obtener los logs de comunicación' };
    }
  }
};

// ============================================================================
// SERVICIOS PARA SEGUIMIENTOS (FOLLOW UPS)
// ============================================================================

export const followUpService = {
  // Crear nuevo seguimiento
  async create(followUp: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<FollowUp>> {
    try {
      const now = new Date().toISOString();
      const followUpData = {
        ...followUp,
        createdAt: convertStringToTimestamp(now),
        updatedAt: convertStringToTimestamp(now)
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.FOLLOW_UPS), followUpData);
      const newFollowUp: FollowUp = {
        ...followUp,
        id: docRef.id,
        createdAt: now,
        updatedAt: now
      };
      
      return { success: true, data: newFollowUp };
    } catch (error) {
      console.error('Error creating follow up:', error);
      return { success: false, error: 'Error al crear el seguimiento' };
    }
  },

  // Obtener seguimientos pendientes
  async getPending(): Promise<ApiResponse<FollowUp[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.FOLLOW_UPS),
        where('status', '==', 'pending'),
        orderBy('dueDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const followUps: FollowUp[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToString(data.createdAt),
          updatedAt: convertTimestampToString(data.updatedAt),
          completedAt: data.completedAt ? convertTimestampToString(data.completedAt) : undefined
        } as FollowUp;
      });
      
      return { success: true, data: followUps };
    } catch (error) {
      console.error('Error getting pending follow ups:', error);
      return { success: false, error: 'Error al obtener los seguimientos pendientes' };
    }
  },

  // Marcar seguimiento como completado
  async markCompleted(id: string, notes?: string): Promise<ApiResponse<FollowUp>> {
    try {
      const docRef = doc(db, COLLECTIONS.FOLLOW_UPS, id);
      const updateData = {
        status: 'completed',
        completedAt: convertStringToTimestamp(new Date().toISOString()),
        updatedAt: convertStringToTimestamp(new Date().toISOString()),
        ...(notes && { notes })
      };
      
      await updateDoc(docRef, updateData);
      
      const updatedDoc = await this.getById(id);
      return updatedDoc;
    } catch (error) {
      console.error('Error marking follow up as completed:', error);
      return { success: false, error: 'Error al marcar el seguimiento como completado' };
    }
  },

  // Obtener seguimiento por ID
  async getById(id: string): Promise<ApiResponse<FollowUp>> {
    try {
      const docRef = doc(db, COLLECTIONS.FOLLOW_UPS, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Seguimiento no encontrado' };
      }
      
      const data = docSnap.data();
      const followUp: FollowUp = {
        id: docSnap.id,
        ...data,
        createdAt: convertTimestampToString(data.createdAt),
        updatedAt: convertTimestampToString(data.updatedAt),
        completedAt: data.completedAt ? convertTimestampToString(data.completedAt) : undefined
      } as FollowUp;
      
      return { success: true, data: followUp };
    } catch (error) {
      console.error('Error getting follow up:', error);
      return { success: false, error: 'Error al obtener el seguimiento' };
    }
  }
};

// ============================================================================
// SERVICIOS PARA DISPONIBILIDAD Y BLOQUEOS
// ============================================================================

export const availabilityService = {
  // Crear slot de disponibilidad
  async createSlot(slot: Omit<AvailabilitySlot, 'id'>): Promise<ApiResponse<AvailabilitySlot>> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.AVAILABILITY), slot);
      const newSlot: AvailabilitySlot = {
        ...slot,
        id: docRef.id
      };
      
      return { success: true, data: newSlot };
    } catch (error) {
      console.error('Error creating availability slot:', error);
      return { success: false, error: 'Error al crear el slot de disponibilidad' };
    }
  },

  // Crear período bloqueado
  async createBlockedPeriod(period: Omit<BlockedPeriod, 'id' | 'createdAt'>): Promise<ApiResponse<BlockedPeriod>> {
    try {
      const now = new Date().toISOString();
      const periodData = {
        ...period,
        createdAt: convertStringToTimestamp(now)
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.BLOCKED_PERIODS), periodData);
      const newPeriod: BlockedPeriod = {
        ...period,
        id: docRef.id,
        createdAt: now
      };
      
      return { success: true, data: newPeriod };
    } catch (error) {
      console.error('Error creating blocked period:', error);
      return { success: false, error: 'Error al crear el período bloqueado' };
    }
  },

  // Obtener disponibilidad por fecha
  async getByDate(date: string): Promise<ApiResponse<AvailabilitySlot[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.AVAILABILITY),
        where('date', '==', date)
      );
      
      const querySnapshot = await getDocs(q);
      const slots: AvailabilitySlot[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AvailabilitySlot));
      
      return { success: true, data: slots };
    } catch (error) {
      console.error('Error getting availability by date:', error);
      return { success: false, error: 'Error al obtener la disponibilidad por fecha' };
    }
  },

  // Obtener períodos bloqueados
  async getBlockedPeriods(): Promise<ApiResponse<BlockedPeriod[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.BLOCKED_PERIODS),
        orderBy('startDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const periods: BlockedPeriod[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestampToString(data.createdAt)
        } as BlockedPeriod;
      });
      
      return { success: true, data: periods };
    } catch (error) {
      console.error('Error getting blocked periods:', error);
      return { success: false, error: 'Error al obtener los períodos bloqueados' };
    }
  },

  // Eliminar período bloqueado
  async deleteBlockedPeriod(id: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, COLLECTIONS.BLOCKED_PERIODS, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting blocked period:', error);
      return { success: false, error: 'Error al eliminar el período bloqueado' };
    }
  },

  // Eliminar slot de disponibilidad
  async deleteAvailabilitySlot(id: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, COLLECTIONS.AVAILABILITY, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting availability slot:', error);
      return { success: false, error: 'Error al eliminar el slot de disponibilidad' };
    }
  }
};

// ============================================================================
// SERVICIOS PARA MÉTRICAS Y ESTADÍSTICAS
// ============================================================================

export const metricsService = {
  // Obtener métricas del dashboard
  async getDashboardMetrics(): Promise<ApiResponse<any>> {
    try {
      // Obtener consultas
      const consultationsResult = await consultationService.getAll();
      const consultations = consultationsResult.success ? consultationsResult.data!.data : [];
      
      // Obtener citas
      const appointmentsResult = await appointmentService.getAll();
      const appointments = appointmentsResult.success ? appointmentsResult.data!.data : [];
      
      // Obtener clientes
      const clientsResult = await clientService.getAll();
      const clients = clientsResult.success ? clientsResult.data!.data : [];
      
      // Calcular métricas
      const totalConsultations = consultations.length;
      const pendingConsultations = consultations.filter(c => c.status === 'pending').length;
      const totalAppointments = appointments.length;
      const upcomingAppointments = appointments.filter(a => 
        a.status === 'scheduled' && a.date >= new Date().toISOString().split('T')[0]
      ).length;
      const totalClients = clients.length;
      const activeClients = clients.filter(c => c.status === 'active').length;
      
      // Calcular tasa de conversión
      const scheduledConsultations = consultations.filter(c => c.status === 'scheduled').length;
      const conversionRate = totalConsultations > 0 ? (scheduledConsultations / totalConsultations) * 100 : 0;
      
      // Calcular tasa de completación de citas
      const completedAppointments = appointments.filter(a => a.status === 'completed').length;
      const appointmentCompletionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
      
      const metrics = {
        totalConsultations,
        pendingConsultations,
        totalAppointments,
        upcomingAppointments,
        totalClients,
        activeClients,
        conversionRate: Math.round(conversionRate * 100) / 100,
        appointmentCompletionRate: Math.round(appointmentCompletionRate * 100) / 100,
        averageResponseTime: 24 // Placeholder - se puede calcular basado en timestamps
      };
      
      return { success: true, data: metrics };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      return { success: false, error: 'Error al obtener las métricas del dashboard' };
    }
  }
};