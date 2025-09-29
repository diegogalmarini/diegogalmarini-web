
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/common.tsx';
import { usePlans } from '../contexts/PlansContext.tsx';
import { db } from '../firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { IoCalendarOutline, IoPeopleOutline, IoAddCircleOutline, IoLogOutOutline, IoFileTrayStackedOutline, IoWarningOutline, IoMailOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoTrashOutline, IoTimeOutline, IoPersonAddOutline, IoSendOutline, IoDocumentTextOutline, IoChatbubbleEllipsesOutline, IoArrowUpOutline, IoArrowDownOutline, IoPauseOutline, IoPlayOutline, IoSparklesOutline, IoBugOutline, IoCardOutline } from 'react-icons/io5';
import { FirebaseConnectionTest } from '../components/FirebaseConnectionTest';

const DashboardCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode, action?: React.ReactNode, onClick?: React.MouseEventHandler<HTMLDivElement> }> = ({ icon, title, children, action, onClick }) => (
    <Card className={`flex flex-col ${onClick ? 'cursor-pointer hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 hover:border-[var(--primary-color)]' : ''}`} onClick={onClick}>
        <div className="flex items-start">
            <div className="text-3xl text-[var(--primary-color)] mr-4 flex-shrink-0 mt-1">{icon}</div>
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-[var(--text-color)]">{title}</h2>
                    {action}
                </div>
                <div className="text-[var(--text-muted)] flex-grow">{children}</div>
            </div>
        </div>
    </Card>
);

const VerificationNeeded: React.FC = () => {
    const { sendVerificationEmail } = useAuth();
    const [emailSent, setEmailSent] = React.useState(false);
    
    const handleResend = async () => {
        try {
            await sendVerificationEmail();
            setEmailSent(true);
        } catch (error) {
            console.error("Error resending verification email", error);
        }
    };

    return (
        <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-200 p-4 rounded-2xl mb-8 flex items-start space-x-4">
            <IoWarningOutline className="text-3xl text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-1" />
            <div>
                <h3 className="font-bold text-lg text-yellow-900 dark:text-white">Verifica tu dirección de correo electrónico</h3>
                <p className="text-yellow-700 dark:text-yellow-200/80">Para acceder a todas las funcionalidades, por favor, haz clic en el enlace de verificación que enviamos a tu correo. Esto asegura que tu cuenta esté protegida.</p>
                {!emailSent ? (
                    <button onClick={handleResend} className="mt-2 font-semibold text-yellow-800 dark:text-white hover:underline">
                        Reenviar correo de verificación
                    </button>
                ) : (
                    <p className="mt-2 font-semibold text-green-600 dark:text-green-400">¡Correo de verificación reenviado! Revisa tu bandeja de entrada.</p>
                )}
            </div>
        </div>
    )
}


// Tipos de datos
interface Consultation {
  id: string;
  clientName: string;
  clientEmail: string;
  subject: string;
  message: string;
  date: string;
  status: 'pending' | 'responded' | 'cancelled';
  planType: 'free'; // Solo consultas gratuitas
  createdAt?: any;
  updatedAt?: any;
  responseMessage?: string;
  respondedAt?: any;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  registrationDate: string;
  totalConsultations: number;
}

interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  date: string;
  time: string;
  duration: number;
  planType: '30min' | '60min'; // Solo citas de pago
  status: 'pending_payment' | 'paid_scheduled' | 'confirmed' | 'cancelled' | 'completed';
  topic?: string; // Tema específico que tratarán en la cita
  consultationId?: string; // Referencia a la consulta original si aplica
}

interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  type: 'available' | 'blocked' | 'unavailable';
  reason?: string;
}

interface BlockedPeriod {
  id: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  type: 'full_day' | 'time_range';
  reason: string;
  isRecurring?: boolean;
  recurringDays?: number[]; // 0=domingo, 1=lunes, etc.
}

interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'appointment_change' | 'reminder' | 'follow_up' | 'cancellation' | 'confirmation';
}

interface CommunicationLog {
  id: string;
  clientId: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  subject: string;
  content: string;
  date: string;
  status: 'sent' | 'received' | 'pending' | 'completed';
}

interface FollowUp {
  id: string;
  clientId: string;
  appointmentId?: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  type: 'call' | 'email' | 'meeting' | 'task';
}

// Utilidades para conversión segura de fechas provenientes de Firestore y otros formatos
const toLocalYYYYMMDD = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const safeToDate = (value: any): Date | null => {
    if (!value) return null;
    try {
        if (typeof value.toDate === 'function') return value.toDate();
    } catch {}
    if (value && typeof value === 'object' && 'seconds' in value && typeof (value as any).seconds === 'number') {
        return new Date((value as any).seconds * 1000);
    }
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
        // Parseo seguro: si viene en formato YYYY-MM-DD, interpretarlo como fecha local
        const m = value.match(/^\d{4}-\d{2}-\d{2}$/);
        if (m) {
            const [y, mm, dd] = value.split('-').map(Number);
            return new Date(y, (mm || 1) - 1, dd || 1);
        }
        const t = Date.parse(value);
        return isNaN(t) ? null : new Date(t);
    }
    if (typeof value === 'number') return new Date(value);
    return null;
};

const toDisplayDate = (value: any): string => {
    const dt = safeToDate(value);
    if (dt) return toLocalYYYYMMDD(dt);
    if (typeof value === 'string') return value;
    return toLocalYYYYMMDD(new Date());
};

const AdminDashboard: React.FC<{onBookCallClick: () => void}> = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const adminTabs = ['overview','consultations','calendar','availability','clients','plans','templates','diagnostics'] as const;
    const [activeTab, setActiveTab] = useState<typeof adminTabs[number]>(() => {
        const t = searchParams.get('tab') || 'overview';
        return (adminTabs as readonly string[]).includes(t || '') ? (t as typeof adminTabs[number]) : 'overview';
    });
    const { plans, updatePlan, addPlan, deletePlan, togglePlanStatus, reorderPlans } = usePlans();
    const [editingPlan, setEditingPlan] = useState<string | null>(null);
    const [editPlanForm, setEditPlanForm] = useState({
        name: '',
        price: '',
        duration: '',
        description: ''
    });
    const [showNewPlanForm, setShowNewPlanForm] = useState(false);
    const [newPlanForm, setNewPlanForm] = useState({
        name: '',
        price: '',
        duration: '',
        description: '',
        isActive: true
    });
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    
    const [clients, setClients] = useState<Client[]>([]);

    // Sincronizar estado de pestaña con URL - evitar bucle infinito
    useEffect(() => {
        const urlTab = searchParams.get('tab') || 'overview';
        const validTab = (adminTabs as readonly string[]).includes(urlTab) ? (urlTab as typeof adminTabs[number]) : 'overview';
        
        // Solo actualizar si hay una diferencia real
        if (validTab !== activeTab) {
            setActiveTab(validTab);
        }
    }, [searchParams.get('tab')]);

    // Actualizar URL solo cuando el usuario cambia la pestaña manualmente
    const handleTabChange = (newTab: typeof adminTabs[number]) => {
        if (newTab !== activeTab) {
            setActiveTab(newTab);
            const newParams = new URLSearchParams(searchParams);
            newParams.set('tab', newTab);
            newParams.delete('view');
            setSearchParams(newParams);
        }
    };

    
    // Cargar consultas desde Firestore solo cuando el usuario esté autenticado
    useEffect(() => {
        if (!user) return;
        
        const consultationsRef = collection(db, 'consultations');
        // Si es admin, obtener todas las consultas. Si es usuario normal, solo las suyas
        const isAdminUser = user.email === 'diegogalmarini@gmail.com';
        const q = isAdminUser 
            ? query(consultationsRef, orderBy('createdAt', 'desc'))
            : query(consultationsRef, where('clientEmail', '==', user.email), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const consultationsData: Consultation[] = [];
            const clientsMap = new Map<string, Client>();
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const consultation = {
                    id: doc.id,
                    clientName: data.clientName || '',
                    clientEmail: data.clientEmail || '',
                    subject: data.selectedPlan ? `Consulta - ${data.selectedPlan}` : 'Consulta general',
                    message: data.problemDescription || '',
                    date: toDisplayDate(data.selectedDate),
                    status: data.status || 'pending',
                    planType: data.selectedPlan,
                    createdAt: safeToDate(data.createdAt),
                    updatedAt: safeToDate(data.updatedAt),
                    respondedAt: safeToDate(data.respondedAt),
                    responseMessage: data.responseMessage || ''
                };
                consultationsData.push(consultation);
                
                // Generar clientes únicos
                if (consultation.clientEmail) {
                    const email = consultation.clientEmail.toLowerCase();
                    if (clientsMap.has(email)) {
                        // Cliente existente, incrementar contador
                        const existingClient = clientsMap.get(email)!;
                        existingClient.totalConsultations++;
                    } else {
                        // Nuevo cliente
                        const newClient: Client = {
                            id: email, // Usar email como ID único
                            name: consultation.clientName || consultation.clientEmail,
                            email: consultation.clientEmail,
                            phone: '', // No tenemos teléfono en las consultas
                            registrationDate: consultation.date,
                            totalConsultations: 1
                        };
                        clientsMap.set(email, newClient);
                    }
                }
            });
            
            setConsultations(consultationsData);
            setClients(Array.from(clientsMap.values()));
        }, (error) => {
            console.error('Error fetching consultations:', error);
        });
        
        return () => unsubscribe();
    }, [user]);
    
    // Cargar citas desde Firestore
    useEffect(() => {
        if (!user) return;
        
        const appointmentsRef = collection(db, 'appointments');
        // Si es admin, obtener todas las citas. Si es usuario normal, solo las suyas
        const isAdminUser = user.email === 'diegogalmarini@gmail.com';
        const q = isAdminUser 
            ? query(appointmentsRef, orderBy('selectedDate', 'desc'))
            : query(appointmentsRef, where('clientEmail', '==', user.email), orderBy('selectedDate', 'desc'));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const appointmentsData: Appointment[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                appointmentsData.push({
                    id: doc.id,
                    clientId: data.clientId || '',
                    clientName: data.clientName || '',
                    clientEmail: data.clientEmail || '',
                    date: data.selectedDate ? toDisplayDate(data.selectedDate) : '',
                    time: data.selectedTime || '',
                    duration: data.duration || 30,
                    planType: data.planType || '30min',
                    status: data.status || 'pending_payment',
                    topic: data.topic || '',
                    consultationId: data.consultationId
                });
            });
            
            setAppointments(appointmentsData);
        }, (error) => {
            console.error('Error al cargar citas del administrador:', error);
        });
        
        return () => unsubscribe();
    }, [user]);
    
    const [selectedDate, setSelectedDate] = useState(toLocalYYYYMMDD(new Date()));

    
    // Estados para funcionalidades CRM avanzadas
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [showCommunicationModal, setShowCommunicationModal] = useState(false);
    const [showAppointmentDetailsModal, setShowAppointmentDetailsModal] = useState(false);
    const [selectedUserAppointment, setSelectedUserAppointment] = useState<Appointment | null>(null);
    const [showConsultationDetailsModal, setShowConsultationDetailsModal] = useState(false);
    const [selectedUserConsultation, setSelectedUserConsultation] = useState<Consultation | null>(null);
const [sendingTemplate, setSendingTemplate] = useState(false);
    
    // Datos para plantillas de mensajes
    const [messageTemplates] = useState<MessageTemplate[]>([
        {
            id: '1',
            name: 'Cambio de Cita',
            subject: 'Cambio en tu cita programada',
            content: 'Hola {clientName},\n\nTe escribo para informarte que necesitamos cambiar tu cita del {oldDate} a las {oldTime} para el {newDate} a las {newTime}.\n\nPor favor, confirma si esta nueva fecha y hora te conviene.\n\nSaludos,\nDiego Galmarini',
            type: 'appointment_change'
        },
        {
            id: '2',
            name: 'Recordatorio de Cita',
            subject: 'Recordatorio: Tu cita es mañana',
            content: 'Hola {clientName},\n\nTe recuerdo que tienes una cita programada para mañana {date} a las {time}.\n\nEl enlace de Google Meet te llegará 15 minutos antes de la cita.\n\n¡Nos vemos mañana!\nDiego Galmarini',
            type: 'reminder'
        },
        {
            id: '3',
            name: 'Seguimiento Post-Consulta',
            subject: 'Seguimiento de nuestra consulta',
            content: 'Hola {clientName},\n\nEspero que estés bien. Quería hacer un seguimiento de nuestra consulta del {date} sobre {topic}.\n\n¿Has podido implementar alguna de las recomendaciones que discutimos? ¿Tienes alguna pregunta adicional?\n\nQuedo atento a tus comentarios.\n\nSaludos,\nDiego Galmarini',
            type: 'follow_up'
        },
        {
            id: '4',
            name: 'Confirmación de Cita',
            subject: 'Cita confirmada - {date} a las {time}',
            content: 'Hola {clientName},\n\nTu cita ha sido confirmada para el {date} a las {time}.\n\nDuración: {duration} minutos\nTipo: {planType}\n\nRecibirás el enlace de Google Meet 15 minutos antes de la cita.\n\n¡Nos vemos pronto!\nDiego Galmarini',
            type: 'confirmation'
        },
        {
            id: '5',
            name: 'Cancelación de Cita',
            subject: 'Cancelación de cita - {date}',
            content: 'Hola {clientName},\n\nLamento informarte que necesito cancelar nuestra cita del {date} a las {time} debido a {reason}.\n\n¿Te gustaría reprogramar para otra fecha? Tengo disponibilidad en las siguientes opciones:\n\n- {option1}\n- {option2}\n- {option3}\n\nPor favor, déjame saber cuál te conviene mejor.\n\nDisculpas por las molestias.\nDiego Galmarini',
            type: 'cancellation'
        }
    ]);
    
    // Datos para comunicaciones
    const [, setCommunicationLogs] = useState<CommunicationLog[]>([
        {
            id: '1',
            clientId: '1',
            type: 'email',
            subject: 'Seguimiento estrategia digital',
            content: 'Enviado seguimiento sobre implementación de estrategia digital discutida en la consulta.',
            date: toLocalYYYYMMDD(new Date(Date.now() - 86400000)),
            status: 'sent'
        },
        {
            id: '2',
            clientId: '2',
            type: 'call',
            subject: 'Llamada de seguimiento',
            content: 'Llamada de 15 minutos para revisar progreso en optimización de procesos.',
            date: toLocalYYYYMMDD(new Date(Date.now() - 172800000)),
            status: 'completed'
        }
    ]);
    
    // Datos para seguimientos
    const [, setFollowUps] = useState<FollowUp[]>([
        {
            id: '1',
            clientId: '1',
            appointmentId: '4',
            title: 'Revisar implementación de estrategia',
            description: 'Verificar si María ha implementado las recomendaciones de SEO y marketing digital.',
            dueDate: toLocalYYYYMMDD(new Date(Date.now() + 604800000)), // en 1 semana
            priority: 'high',
            status: 'pending',
            type: 'call'
        },
        {
            id: '2',
            clientId: '2',
            title: 'Enviar recursos adicionales',
            description: 'Enviar documentación sobre automatización de procesos que discutimos.',
            dueDate: toLocalYYYYMMDD(new Date(Date.now() + 259200000)), // en 3 días
            priority: 'medium',
            status: 'pending',
            type: 'email'
        }
    ]);
    
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
    const [responseMessage, setResponseMessage] = useState('');
    const [newClientForm, setNewClientForm] = useState({ name: '', email: '', phone: '' });
    const [showNewClientForm, setShowNewClientForm] = useState(false);
    const [newAppointmentForm, setNewAppointmentForm] = useState({
        clientId: '',
        date: '',
        time: '',
        planType: '30min' as 'free' | '30min' | '60min'
    });
    const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
    
    // Estados para gestión de disponibilidad
    const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
    const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);

    const [availabilityForm, setAvailabilityForm] = useState({
        date: '',
        startTime: '',
        endTime: '',
        type: 'available' as 'available' | 'blocked',
        reason: ''
    });
    const [blockForm, setBlockForm] = useState({
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        type: 'full_day' as 'full_day' | 'time_range',
        reason: '',
        isRecurring: false,
        recurringDays: [] as number[]
    });
    
    // Funciones auxiliares para el calendario
    const generateCalendarDays = (currentDate: string) => {
        const date = safeToDate(currentDate);
        if (!date) return [];
        
        const currentMonth = date.getMonth();
        const currentYear = date.getFullYear();
        const firstDay = new Date(currentYear, currentMonth, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = [];
        for (let i = 0; i < 42; i++) {
            const calendarDate = new Date(startDate);
            calendarDate.setDate(startDate.getDate() + i);
            const isCurrentMonth = calendarDate.getMonth() === currentMonth;
            days.push({
                date: isCurrentMonth ? toLocalYYYYMMDD(calendarDate) : null,
                day: calendarDate.getDate(),
                isCurrentMonth
            });
        }
        return days;
    };
    
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 18; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            if (hour < 18) {
                slots.push(`${hour.toString().padStart(2, '0')}:30`);
            }
        }
        return slots;
    };
    
    // Funciones para gestión de disponibilidad
    const isDateBlocked = (date: string) => {
        return blockedPeriods.some(period => {
            if (period.type === 'full_day') {
                if (period.isRecurring && period.recurringDays) {
                    const dayOfWeek = safeToDate(date)?.getDay();
                    return dayOfWeek !== undefined && period.recurringDays.includes(dayOfWeek);
                }
                return date >= period.startDate && date <= period.endDate;
            }
            return false;
        });
    };
    
    const isTimeSlotBlocked = (date: string, time: string) => {
        // Verificar si el día completo está bloqueado
        if (isDateBlocked(date)) return true;
        
        // Verificar bloqueos de franjas horarias específicas
        return blockedPeriods.some(period => {
            if (period.type === 'time_range' && period.startTime && period.endTime) {
                const isInDateRange = date >= period.startDate && date <= period.endDate;
                
                // Comparar correctamente los horarios usando formato numérico
                const periodStart = period.startTime.replace(':', '');
                const periodEnd = period.endTime.replace(':', '');
                const currentTime = time.replace(':', '');
                const isInTimeRange = currentTime >= periodStart && currentTime <= periodEnd;
                
                if (period.isRecurring && period.recurringDays) {
                    const dayOfWeek = safeToDate(date)?.getDay();
                    return dayOfWeek !== undefined && period.recurringDays.includes(dayOfWeek) && isInTimeRange;
                }
                
                return isInDateRange && isInTimeRange;
            }
            return false;
        });
    };
    
    const isTimeSlotOccupiedByAppointment = (date: string, time: string) => {
        // Verificar si hay una cita admin que comienza exactamente en este slot
        const directAppointment = appointments.find(apt => apt.selectedDate === date && apt.selectedTime === time);
        if (directAppointment) return true;
        
        // Verificar si hay una cita del usuario que comienza exactamente en este slot
        const directUserAppointment = appointments.find(apt => apt.date === date && apt.time === time);
        if (directUserAppointment) return true;
        
        // Verificar si hay una consulta admin en este slot
        const directConsultation = consultations.find(cons => cons.selectedDate === date && cons.selectedTime === time);
        if (directConsultation) return true;
        
        // Verificar si hay una consulta del usuario en este slot
        const directUserConsultation = consultations.find(cons => cons.selectedDate === date && cons.selectedTime === time);
        if (directUserConsultation) return true;
        
        // Verificar si este slot está ocupado por una cita de 60 minutos que comenzó en el slot anterior
        const [hour, minute] = time.split(':').map(Number);
        let previousSlotTime = '';
        
        if (minute === 30) {
            // Si es :30, el slot anterior es :00 de la misma hora
            previousSlotTime = `${hour.toString().padStart(2, '0')}:00`;
        } else if (minute === 0 && hour > 9) {
            // Si es :00, el slot anterior es :30 de la hora anterior
            previousSlotTime = `${(hour - 1).toString().padStart(2, '0')}:30`;
        }
        
        if (previousSlotTime) {
            const previousAppointment = appointments.find(apt => 
                apt.selectedDate === date && 
                apt.selectedTime === previousSlotTime && 
                apt.duration === 60
            );
            if (previousAppointment) return true;
            
            const previousUserAppointment = appointments.find(apt => 
                apt.date === date && 
                apt.time === previousSlotTime && 
                apt.duration === 60
            );
            if (previousUserAppointment) return true;
        }
        
        return false;
    };
    
    const isTimeSlotAvailable = (date: string, time: string) => {
        // Verificar si hay una cita programada en este slot o si está ocupado por una cita de 60 min
        if (isTimeSlotOccupiedByAppointment(date, time)) return false;
        
        // Verificar si está bloqueado
        if (isTimeSlotBlocked(date, time)) return false;
        
        // Verificar disponibilidad específica
        const availabilitySlot = availabilitySlots.find(slot => {
            if (slot.date !== date) return false;
            // Comparar correctamente los horarios
            const slotStart = slot.startTime.replace(':', '');
            const slotEnd = slot.endTime.replace(':', '');
            const currentTime = time.replace(':', '');
            return currentTime >= slotStart && currentTime <= slotEnd;
        });
        
        // Si hay un slot específico, usar su disponibilidad
        if (availabilitySlot) {
            return availabilitySlot.isAvailable;
        }
        
        // Por defecto, horarios de 9:00 a 18:00 están disponibles si no están bloqueados
        const hour = parseInt(time.split(':')[0]);
        return hour >= 9 && hour < 18;
    };
    
    const getBlockedReason = (date: string, time?: string) => {
        const period = blockedPeriods.find(period => {
            if (period.type === 'full_day') {
                if (period.isRecurring && period.recurringDays) {
                    const dayOfWeek = safeToDate(date)?.getDay();
                    return dayOfWeek !== undefined && period.recurringDays.includes(dayOfWeek);
                }
                return date >= period.startDate && date <= period.endDate;
            } else if (period.type === 'time_range' && time && period.startTime && period.endTime) {
                const isInDateRange = date >= period.startDate && date <= period.endDate;
                
                // Comparar correctamente los horarios usando formato numérico
                const periodStart = period.startTime.replace(':', '');
                const periodEnd = period.endTime.replace(':', '');
                const currentTime = time.replace(':', '');
                const isInTimeRange = currentTime >= periodStart && currentTime <= periodEnd;
                
                if (period.isRecurring && period.recurringDays) {
                    const dayOfWeek = safeToDate(date)?.getDay();
                    return dayOfWeek !== undefined && period.recurringDays.includes(dayOfWeek) && isInTimeRange;
                }
                
                return isInDateRange && isInTimeRange;
            }
            return false;
        });
        
        return period?.reason || 'No disponible';
    };
    
    const emailTemplates = {
        consultationFree: `Hola {clientName},

Gracias por tu consulta. He revisado tu mensaje y me complace ofrecerte una consulta gratuita de 30 minutos para ayudarte con tu consulta.

Por favor, agenda tu consulta gratuita eligiendo el día y hora que mejor te convenga en el siguiente enlace: [enlace de agendamiento]

En esta sesión podremos revisar tu consulta y definir los próximos pasos.

Saludos,
Diego Galmarini`,
        standardResponse: `Hola {clientName},

Gracias por contactarme y respecto a tu consulta XXX, mi respuesta es XXX.

🚀 **Mis servicios incluyen:**
• Desarrollo de aplicaciones web modernas (React, Next.js, Node.js)
• Consultoría en transformación digital
• Optimización de procesos y automatización
• Estrategia de producto y UX/UI
• Integración de APIs y sistemas

💡 **Tecnologías que domino:**
• Frontend: React, Next.js, TypeScript, Tailwind CSS
• Backend: Node.js, Express, Firebase, PostgreSQL
• Cloud: AWS, Google Cloud, Vercel
• Herramientas: Git, Docker, CI/CD

📅 **Próximo paso recomendado:**
Para profundizar sobre tu consulta, si lo consideras necesario, podríamos programar una consulta XXXX.

📚 **Recursos adicionales:**
• Portfolio: https://diegogalmarini.com
• LinkedIn: [Tu perfil de LinkedIn]
• Casos de éxito: [Enlaces a proyectos destacados]

Si tienes alguna pregunta adicional o necesitas aclarar algo, no dudes en responder a este email.

Saludos cordiales,
Diego Galmarini
Consultor en Desarrollo Web y Estrategia Digital`,
        consultation30min: `Hola {clientName},

Gracias por tu consulta. He revisado tu mensaje y creo que podemos resolver tu consulta en una sesión de 30 minutos.

Te he enviado un enlace de pago para agendar la consulta. Una vez completado el pago, podrás elegir el día y hora que mejor te convenga.

Saludos,
Diego Galmarini`,
        consultation60min: `Hola {clientName},

Gracias por tu consulta. Después de revisar tu mensaje, considero que necesitaremos una sesión completa de 60 minutos para abordar todos los puntos.

Te he enviado un enlace de pago para agendar la consulta. Una vez completado el pago, podrás elegir el día y hora que mejor te convenga.

Saludos,
Diego Galmarini`,
        appointmentConfirmation: `Hola {clientName},

Te confirmo que he reservado una cita para ti:

Fecha: {date}
Hora: {time}
Duración: {duration} minutos

Nos vemos entonces. Si necesitas cambiar la fecha, por favor contáctame con al menos 24 horas de anticipación.

Saludos,
Diego Galmarini`
    };
    
    const handleRespondConsultation = (consultation: Consultation, planType: 'free' | '30min' | '60min') => {
        let template;
        if (planType === 'free') {
            template = emailTemplates.consultationFree;
        } else if (planType === '30min') {
            template = emailTemplates.consultation30min;
        } else {
            template = emailTemplates.consultation60min;
        }
        const message = template.replace('{clientName}', consultation.clientName);
        setResponseMessage(message);
        setSelectedConsultation({...consultation, planType});
    };
    
    const sendResponse = async () => {
        if (selectedConsultation) {
            try {
                console.log('Enviando respuesta a:', selectedConsultation.clientEmail);
                
                // Llamar a la Cloud Function para enviar el email
                const functions = getFunctions();
                const sendConsultationResponse = httpsCallable(functions, 'sendConsultationResponse');
                
                await sendConsultationResponse({
                    consultationId: selectedConsultation.id,
                    clientEmail: selectedConsultation.clientEmail,
                    clientName: selectedConsultation.clientName,
                    planType: selectedConsultation.planType,
                    responseMessage: responseMessage
                });
                
                // Actualizar el estado local (se sincronizará automáticamente con onSnapshot)
                setConsultations(prev => prev.map(c => 
                    c.id === selectedConsultation.id 
                        ? {...c, status: 'responded', planType: selectedConsultation.planType}
                        : c
                ));
                
                setSelectedConsultation(null);
                setResponseMessage('');
                alert('Respuesta enviada correctamente por email');
            } catch (error) {
                console.error('Error al enviar respuesta:', error);
                alert('Error al enviar la respuesta. Por favor, inténtalo de nuevo.');
            }
        }
    };
    
    const addNewClient = () => {
        if (newClientForm.name && newClientForm.email) {
            const newClient: Client = {
                id: Date.now().toString(),
                name: newClientForm.name,
                email: newClientForm.email,
                phone: newClientForm.phone,
                registrationDate: toLocalYYYYMMDD(new Date()),
                totalConsultations: 0
            };
            setClients(prev => [...prev, newClient]);
            setNewClientForm({ name: '', email: '', phone: '' });
            setShowNewClientForm(false);
            alert('Cliente agregado correctamente');
        }
    };
    
    const addNewAppointment = () => {
        if (newAppointmentForm.clientId && newAppointmentForm.date && newAppointmentForm.time) {
            const client = clients.find(c => c.id === newAppointmentForm.clientId);
            if (client) {
                const newAppointment: Appointment = {
                    id: Date.now().toString(),
                    clientId: client.id,
                    clientName: client.name,
                    clientEmail: client.email,
                    date: newAppointmentForm.date,
                    time: newAppointmentForm.time,
                    duration: newAppointmentForm.planType === '30min' ? 30 : 60,
                    planType: newAppointmentForm.planType,
                    status: 'scheduled'
                };
                setAppointments(prev => [...prev, newAppointment]);
                
                // Enviar email de confirmación
                const confirmationMessage = emailTemplates.appointmentConfirmation
                    .replace('{clientName}', client.name)
                    .replace('{date}', newAppointmentForm.date)
                    .replace('{time}', newAppointmentForm.time)
                    .replace('{duration}', newAppointmentForm.planType === '30min' ? '30' : '60');
                
                console.log('Enviando confirmación a:', client.email);
                console.log('Mensaje:', confirmationMessage);
                
                setNewAppointmentForm({ clientId: '', date: '', time: '', planType: '30min' });
                setShowNewAppointmentForm(false);
                alert('Cita agendada y confirmación enviada');
            }
        }
    };
    
    const deleteConsultation = (id: string) => {
        setConsultations(prev => prev.filter(c => c.id !== id));
    };
    


    // Función para estados de citas de pago
    const getAppointmentStatusText = (status: string) => {
        switch (status) {
            case 'pending_payment': return 'Pendiente de Pago';
            case 'paid_scheduled': return 'Pagada y Programada';
            case 'confirmed': return 'Confirmada';
            case 'completed': return 'Completada';
            case 'cancelled': return 'Cancelada';
            default: return 'Pendiente de Pago';
        }
    };

    // Funciones para CRM avanzado
    const handleEditAppointment = (appointment: Appointment) => {
        console.log('handleEditAppointment called with:', appointment);
        setSelectedAppointment(appointment);
        setShowEditAppointmentModal(true);
        console.log('Modal should be visible now');
    };

    const handleShowUserAppointmentDetails = (appointment: Appointment) => {
        setSelectedUserAppointment(appointment);
        setShowAppointmentDetailsModal(true);
    };

    const handleShowUserConsultationDetails = (consultation: Consultation) => {
        setSelectedUserConsultation(consultation);
        setShowConsultationDetailsModal(true);
    };
    
    const handleEditConsultation = (consultation: Consultation) => {
        setResponseMessage(''); // Limpiar el mensaje de respuesta
        setSelectedConsultation({...consultation, planType: consultation.planType || 'free'});
    };
    
    const handleSaveAppointmentChanges = async (updatedAppointment: Appointment) => {
        const originalAppointment = appointments.find(a => a.id === updatedAppointment.id);
        if (!updatedAppointment) return;

        try {
            // Actualizar la cita en Firestore primero
            const appointmentRef = doc(db, 'appointments', updatedAppointment.id);
            await updateDoc(appointmentRef, {
                selectedDate: updatedAppointment.date,
                selectedTime: updatedAppointment.time,
                duration: updatedAppointment.duration,
                status: updatedAppointment.status,
                topic: updatedAppointment.topic || '',
                updatedAt: new Date()
            });

            // Actualizar la cita en el estado local después del éxito en Firestore
            setAppointments(prev => prev.map(apt =>
                apt.id === updatedAppointment.id ? updatedAppointment : apt
            ));
            // Mover el calendario para reflejar la nueva fecha de la cita
            setSelectedDate(updatedAppointment.date);
            setShowEditAppointmentModal(false);
            setSelectedAppointment(null);

            alert('Cita actualizada exitosamente.');

            // Enviar email automático sólo si hubo cambio real de fecha u hora
            if (
                originalAppointment &&
                (originalAppointment.date !== updatedAppointment.date || originalAppointment.time !== updatedAppointment.time)
            ) {
                try {
                    const changeTemplate = messageTemplates.find(t => t.type === 'appointment_change');
                    const client = clients.find(c => c.id === updatedAppointment.clientId);

                    if (changeTemplate) {
                        const subject = changeTemplate.subject
                            .replace(/{clientName}/g, (client?.name || updatedAppointment.clientName || 'cliente'));

                        const content = changeTemplate.content
                            .replace(/{clientName}/g, (client?.name || updatedAppointment.clientName || 'cliente'))
                            .replace(/{oldDate}/g, new Date(originalAppointment.date).toLocaleDateString('es-ES'))
                            .replace(/{oldTime}/g, originalAppointment.time)
                            .replace(/{newDate}/g, new Date(updatedAppointment.date).toLocaleDateString('es-ES'))
                            .replace(/{newTime}/g, updatedAppointment.time);

                        const functions = getFunctions();
                        const sendAppointmentEmail = httpsCallable(functions, 'sendAppointmentEmail');

                        await sendAppointmentEmail({
                            clientEmail: (client?.email || updatedAppointment.clientEmail),
                            clientName: (client?.name || updatedAppointment.clientName),
                            subject,
                            message: content,
                            appointment: {
                                date: updatedAppointment.date,
                                time: updatedAppointment.time,
                                duration: updatedAppointment.duration,
                                planType: updatedAppointment.planType
                            }
                        });

                        const newLog: CommunicationLog = {
                            id: Date.now().toString(),
                            clientId: updatedAppointment.clientId,
                            type: 'email',
                            subject,
                            content,
                            date: toLocalYYYYMMDD(new Date()),
                            status: 'sent'
                        };
                        setCommunicationLogs(prev => [newLog, ...prev]);

                        alert('Se envió el email de cambio de cita.');
                    }
                } catch (emailError) {
                    console.error('Error al enviar el email de cambio de cita:', emailError);
                    const newLog: CommunicationLog = {
                        id: Date.now().toString(),
                        clientId: updatedAppointment.clientId,
                        type: 'email',
                        subject: 'Error al enviar cambio de cita',
                        content: (emailError as any)?.message || 'Error desconocido al enviar el email de cambio de cita',
                        date: toLocalYYYYMMDD(new Date()),
                        status: 'pending'
                    };
                    setCommunicationLogs(prev => [newLog, ...prev]);
                    alert('Cita actualizada, pero no se pudo enviar el email de notificación.');
                }
            }
        } catch (error) {
            console.error('Error al actualizar la cita:', error);
            alert('Error al actualizar la cita. Por favor, intenta nuevamente.');
        }
    };
    
    const handleSendTemplateMessage = async (template: MessageTemplate, appointment: Appointment) => {
        const client = clients.find(c => c.id === appointment.clientId);
        if (!client) return;

        // Reemplazar variables en la plantilla (asunto y contenido)
        const subject = template.subject
            .replace(/{clientName}/g, client.name)
            .replace(/{date}/g, new Date(appointment.date).toLocaleDateString('es-ES'))
            .replace(/{time}/g, appointment.time)
            .replace(/{duration}/g, appointment.duration.toString())
            .replace(/{planType}/g, appointment.planType === '30min' ? 'Sesión Estratégica (30 min)' : 'Consultoría Completa (1 hora)');

        const content = template.content
            .replace(/{clientName}/g, client.name)
            .replace(/{date}/g, new Date(appointment.date).toLocaleDateString('es-ES'))
            .replace(/{time}/g, appointment.time)
            .replace(/{duration}/g, appointment.duration.toString())
            .replace(/{planType}/g, appointment.planType === '30min' ? 'Sesión Estratégica (30 min)' : 'Consultoría Completa (1 hora)');

        setSendingTemplate(true);
        try {
            const functions = getFunctions();
            const sendAppointmentEmail = httpsCallable(functions, 'sendAppointmentEmail');

            await sendAppointmentEmail({
                clientEmail: client.email || appointment.clientEmail,
                clientName: client.name || appointment.clientName,
                subject: subject,
                message: content,
                appointment: {
                    date: appointment.date,
                    time: appointment.time,
                    duration: appointment.duration,
                    planType: appointment.planType
                }
            });

            const newLog: CommunicationLog = {
                id: Date.now().toString(),
                clientId: appointment.clientId,
                type: 'email',
                subject: subject,
                content: content,
                date: new Date().toISOString().split('T')[0],
                status: 'sent'
            };
            setCommunicationLogs(prev => [newLog, ...prev]);

            alert('Mensaje enviado correctamente por email');

            setShowTemplateModal(false);
            setSelectedTemplate(null);
            setSelectedAppointment(null);
        } catch (error) {
            console.error('Error al enviar el mensaje de plantilla:', error);
            alert('Hubo un error al enviar el mensaje. Inténtalo nuevamente.');
        } finally {
            setSendingTemplate(false);
        }
    };
    
    const handleAddFollowUp = (followUp: Omit<FollowUp, 'id'>) => {
        const newFollowUp: FollowUp = {
            ...followUp,
            id: Date.now().toString()
        };
        setFollowUps(prev => [newFollowUp, ...prev]);
        setShowFollowUpModal(false);
    };
    
    const handleAddCommunicationLog = (log: Omit<CommunicationLog, 'id'>) => {
        const newLog: CommunicationLog = {
            ...log,
            id: Date.now().toString()
        };
        setCommunicationLogs(prev => [newLog, ...prev]);
        setShowCommunicationModal(false);
    };
    
    // Funciones para gestión de disponibilidad
    const handleAddAvailability = () => {
        if (!availabilityForm.date || !availabilityForm.startTime || !availabilityForm.endTime) {
            alert('Por favor completa todos los campos requeridos.');
            return;
        }
        
        const newSlot: AvailabilitySlot = {
            id: Date.now().toString(),
            date: availabilityForm.date,
            startTime: availabilityForm.startTime,
            endTime: availabilityForm.endTime,
            isAvailable: availabilityForm.type === 'available',
            type: availabilityForm.type,
            reason: availabilityForm.reason
        };
        
        setAvailabilitySlots(prev => [...prev, newSlot]);
        setShowAvailabilityModal(false);
        setAvailabilityForm({ date: '', startTime: '', endTime: '', type: 'available', reason: '' });
        alert('Disponibilidad configurada exitosamente.');
    };
    
    const handleAddBlockedPeriod = () => {
        if (!blockForm.startDate || !blockForm.reason) {
            alert('Por favor completa todos los campos requeridos.');
            return;
        }
        
        if (blockForm.type === 'time_range' && (!blockForm.startTime || !blockForm.endTime)) {
            alert('Por favor especifica el rango de horario.');
            return;
        }
        
        const newPeriod: BlockedPeriod = {
            id: Date.now().toString(),
            startDate: blockForm.startDate,
            endDate: blockForm.endDate || blockForm.startDate,
            startTime: blockForm.type === 'time_range' ? blockForm.startTime : undefined,
            endTime: blockForm.type === 'time_range' ? blockForm.endTime : undefined,
            type: blockForm.type,
            reason: blockForm.reason,
            isRecurring: blockForm.isRecurring,
            recurringDays: blockForm.isRecurring ? blockForm.recurringDays : undefined
        };
        
        setBlockedPeriods(prev => [...prev, newPeriod]);
        setShowBlockModal(false);
        setBlockForm({
            startDate: '',
            endDate: '',
            startTime: '',
            endTime: '',
            type: 'full_day',
            reason: '',
            isRecurring: false,
            recurringDays: []
        });
        alert('Período bloqueado exitosamente.');
    };
    
    const handleRemoveBlockedPeriod = (id: string) => {
        setBlockedPeriods(prev => prev.filter(period => period.id !== id));
        alert('Período desbloqueado exitosamente.');
    };
    
    const handleRemoveAvailabilitySlot = (id: string) => {
        setAvailabilitySlots(prev => prev.filter(slot => slot.id !== id));
        alert('Disponibilidad removida exitosamente.');
    };
    
    const handleQuickBlock = (date: string, time?: string) => {
        if (time) {
            // Bloquear franja horaria específica
            const endTime = (parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0') + ':00';
            setBlockForm({
                startDate: date,
                endDate: date,
                startTime: time,
                endTime: endTime,
                type: 'time_range',
                reason: 'Bloqueado manualmente',
                isRecurring: false,
                recurringDays: []
            });
        } else {
            // Bloquear día completo
            setBlockForm({
                startDate: date,
                endDate: date,
                startTime: '',
                endTime: '',
                type: 'full_day',
                reason: 'Día no disponible',
                isRecurring: false,
                recurringDays: []
            });
        }
        setShowBlockModal(true);
    };
    
    // Datos de ejemplo para demostración - solo se ejecuta una vez
    React.useEffect(() => {
        // Solo inicializar si no hay datos previos
        if (blockedPeriods.length === 0) {
            const currentMonth = new Date().toISOString().slice(0, 7);
            setBlockedPeriods([
                {
                    id: 'demo1',
                    startDate: `${currentMonth}-26`,
                    endDate: `${currentMonth}-27`,
                    type: 'full_day',
                    reason: 'Días no disponibles - Ejemplo',
                    isRecurring: false
                }
            ]);
        }
        
        // Solo inicializar slots si no hay datos previos
        if (availabilitySlots.length === 0) {
            const currentMonth = new Date().toISOString().slice(0, 7);
            setAvailabilitySlots([
                {
                    id: 'demo2',
                    date: `${currentMonth}-29`,
                    startTime: '16:00',
                    endTime: '18:30',
                    isAvailable: true,
                    type: 'available',
                    reason: 'Horario especial habilitado'
                }
            ]);
        }
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-[var(--text-color)]">Panel de Administrador</h1>
                <p className="text-lg text-[var(--text-muted)] mt-2">Gestiona tus consultas, citas, clientes y planes desde aquí.</p>
            </div>
            
            {/* Navegación por pestañas */}
            <div className="flex space-x-1 bg-[var(--input-bg)] p-1 rounded-lg">
                {[
                    { id: 'overview', label: 'Resumen', icon: <IoFileTrayStackedOutline /> },
                    { id: 'consultations', label: 'Consultas', icon: <IoChatbubbleEllipsesOutline /> },
                    { id: 'calendar', label: 'Calendario', icon: <IoCalendarOutline /> },
                    { id: 'availability', label: 'Disponibilidad', icon: <IoTimeOutline /> },
                    { id: 'clients', label: 'Clientes', icon: <IoPeopleOutline /> },
                    { id: 'plans', label: 'Planes', icon: <IoDocumentTextOutline /> },
                    { id: 'templates', label: 'Plantillas de Email', icon: <IoMailOutline /> },
                    { id: 'diagnostics', label: 'Diagnóstico', icon: <IoBugOutline /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
                            activeTab === tab.id 
                                ? 'bg-[var(--primary-color)] text-white' 
                                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
            
            {/* Contenido según la pestaña activa */}
            {activeTab === 'overview' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <DashboardCard icon={<IoChatbubbleEllipsesOutline />} title="Consultas Pendientes" onClick={() => handleTabChange('consultations')}>
                        <p className="mt-4 font-bold text-3xl text-[var(--text-color)]">
                            {consultations.filter(c => c.status === 'pending').length}
                        </p>
                        <p className="text-sm">Requieren respuesta</p>
                    </DashboardCard>
                    <DashboardCard icon={<IoCalendarOutline />} title="Próximas Citas" onClick={() => handleTabChange('calendar')}>
                        <p className="mt-4 font-bold text-3xl text-[var(--text-color)]">
                            {appointments.filter(a => a.status === 'scheduled').length}
                        </p>
                        <p className="text-sm">Citas programadas</p>
                    </DashboardCard>
                    <DashboardCard icon={<IoPeopleOutline />} title="Clientes Totales" onClick={() => handleTabChange('clients')}>
                        <p className="mt-4 font-bold text-3xl text-[var(--text-color)]">{clients.length}</p>
                        <p className="text-sm">Clientes registrados</p>
                    </DashboardCard>
                </div>
            )}
            
            {activeTab === 'availability' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-[var(--text-color)]">Gestión de Disponibilidad</h2>
                        <button
                            onClick={() => setShowBlockModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition"
                        >
                            <IoTimeOutline />
                            <span>Nuevo Bloqueo</span>
                        </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Períodos Bloqueados */}
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-[var(--text-color)] mb-4">Períodos Bloqueados</h3>
                            <div className="space-y-3">
                                {blockedPeriods.length === 0 ? (
                                    <p className="text-[var(--text-muted)] text-sm">No hay períodos bloqueados</p>
                                ) : (
                                    blockedPeriods.map(period => (
                                        <div key={period.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                                            <div>
                                                <p className="font-medium text-red-800">
                                                    {period.type === 'full_day' ? '🚫 Día completo' : '⏰ Rango horario'}
                                                </p>
                                                <p className="text-sm text-red-600">
                                                    {period.startDate === period.endDate 
                                                        ? new Date(period.startDate).toLocaleDateString('es-ES')
                                                        : `${new Date(period.startDate).toLocaleDateString('es-ES')} - ${new Date(period.endDate).toLocaleDateString('es-ES')}`
                                                    }
                                                    {period.type === 'time_range' && period.startTime && period.endTime && 
                                                        ` (${period.startTime} - ${period.endTime})`
                                                    }
                                                </p>
                                                <p className="text-xs text-red-500">{period.reason}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveBlockedPeriod(period.id)}
                                                className="text-red-600 hover:text-red-800 transition"
                                                title="Eliminar bloqueo"
                                            >
                                                <IoTrashOutline />
                                            </button>
                                        </div>
                                    ))
                                )}
                    

                            </div>
                        </Card>
                        
                        {/* Horarios Especiales */}
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-[var(--text-color)] mb-4">Horarios Especiales</h3>
                            <div className="space-y-3">
                                {availabilitySlots.length === 0 ? (
                                    <p className="text-[var(--text-muted)] text-sm">No hay horarios especiales configurados</p>
                                ) : (
                                    availabilitySlots.map(slot => (
                                        <div key={slot.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                            <div>
                                                <p className="font-medium text-green-800">
                                                    ✅ {slot.type === 'available' ? 'Disponible' : 'Bloqueado'}
                                                </p>
                                                <p className="text-sm text-green-600">
                                                    {new Date(slot.date).toLocaleDateString('es-ES')} ({slot.startTime} - {slot.endTime})
                                                </p>
                                                {slot.reason && <p className="text-xs text-green-500">{slot.reason}</p>}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveAvailabilitySlot(slot.id)}
                                                className="text-green-600 hover:text-green-800 transition"
                                                title="Eliminar horario especial"
                                            >
                                                <IoTrashOutline />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                    
                    {/* Acciones Rápidas */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-[var(--text-color)] mb-4">Acciones Rápidas</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <button
                                onClick={() => {
                                    const today = toLocalYYYYMMDD(new Date());
                                    handleQuickBlock(today);
                                }}
                                className="p-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-center"
                            >
                                <IoCloseCircleOutline className="mx-auto mb-2 text-2xl" />
                                <p className="font-medium">Bloquear Hoy</p>
                                <p className="text-xs">Día completo no disponible</p>
                            </button>
                            
                            <button
                                onClick={() => {
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    handleQuickBlock(toLocalYYYYMMDD(tomorrow));
                                }}
                                className="p-4 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition text-center"
                            >
                                <IoPauseOutline className="mx-auto mb-2 text-2xl" />
                                <p className="font-medium">Bloquear Mañana</p>
                                <p className="text-xs">Día completo no disponible</p>
                            </button>
                            
                            <button
                                onClick={() => setShowAvailabilityModal(true)}
                                className="p-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-center"
                            >
                                <IoCheckmarkCircleOutline className="mx-auto mb-2 text-2xl" />
                                <p className="font-medium">Horario Especial</p>
                                <p className="text-xs">Configurar disponibilidad</p>
                            </button>
                        </div>
                    </Card>
                </div>
            )}
            
            {activeTab === 'consultations' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-[var(--text-color)]">Gestión de Consultas</h2>
                    </div>
                    
                    <div className="grid gap-6">
                        {consultations.map(consultation => (
                            <Card key={consultation.id} className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-[var(--text-color)]">{consultation.subject}</h3>
                                        <p className="text-[var(--text-muted)]">{consultation.clientName} - {consultation.clientEmail}</p>
                                        <div className="text-sm text-[var(--text-muted)] space-y-1">
                                            <p>Fecha de consulta: {consultation.date}</p>
                                            {consultation.createdAt && consultation.createdAt instanceof Date && (
                                                <p>Creada: {safeToDate(consultation.createdAt)?.toLocaleString('es-ES') || '—'}</p>
                                            )}
                                            {consultation.respondedAt && consultation.respondedAt instanceof Date && (
                                                <p>Respondida: {safeToDate(consultation.respondedAt)?.toLocaleString('es-ES') || '—'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-3 py-1 rounded-full text-sm ${
                                            consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            consultation.status === 'responded' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {consultation.status === 'pending' ? 'Pendiente' :
                                             consultation.status === 'responded' ? 'Respondida' : 'Cancelada'}
                                        </span>
                                        {consultation.planType && (
                                            <span className={`px-3 py-1 rounded-full text-sm ${
                                                consultation.planType === 'free' ? 'bg-purple-100 text-purple-800' :
                                                consultation.planType === '30min' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {consultation.planType === 'free' ? 'Consulta Gratuita' :
                                                 consultation.planType === '30min' ? '30 min' : '60 min'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <p className="text-[var(--text-color)] mb-4">{consultation.message}</p>
                                
                                {consultation.status === 'pending' && (
                                    <div className="flex space-x-2 flex-wrap">
                                        <button
                                            onClick={() => {
                                                const message = emailTemplates.standardResponse.replace('{clientName}', consultation.clientName);
                                                setResponseMessage(message);
                                                setSelectedConsultation({...consultation, planType: 'free'});
                                            }}
                                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                                        >
                                            <IoSparklesOutline />
                                            <span>Respuesta Estándar</span>
                                        </button>
                                        <button
                                            onClick={() => handleRespondConsultation(consultation, 'free')}
                                            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                                        >
                                            <IoTimeOutline />
                                            <span>Responder consulta gratuita</span>
                                        </button>
                                        <button
                                            onClick={() => handleRespondConsultation(consultation, '30min')}
                                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                        >
                                            <IoTimeOutline />
                                            <span>Responder (30 min)</span>
                                        </button>
                                        <button
                                            onClick={() => handleRespondConsultation(consultation, '60min')}
                                            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                        >
                                            <IoTimeOutline />
                                            <span>Responder (60 min)</span>
                                        </button>
                                        <button
                                            onClick={() => deleteConsultation(consultation.id)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                        >
                                            <IoTrashOutline />
                                            <span>Eliminar</span>
                                        </button>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                    
                    {/* Modal de respuesta */}
                    {selectedConsultation && (
                        <div 
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    setSelectedConsultation(null);
                                }
                            }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
                        >
                            <div className="modal-glass-content max-w-2xl w-full transform transition-all duration-300 scale-100 opacity-100">
                                <div className="p-6 border-b border-[var(--border-color)]">
                                    <h3 className="text-xl font-bold text-[var(--text-color)] flex items-center">
                                        <IoChatbubbleEllipsesOutline className="mr-2" />
                                        Responder a {selectedConsultation.clientName}
                                    </h3>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Tu respuesta</label>
                                        <textarea
                                            value={responseMessage}
                                            onChange={(e) => setResponseMessage(e.target.value)}
                                            className="glass-input resize-none"
                                            rows={6}
                                            placeholder="Escribe tu respuesta aquí..."
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end space-x-3 p-6 border-t border-[var(--border-color)]">
                                    <button
                                        onClick={() => setSelectedConsultation(null)}
                                        className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors duration-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={sendResponse}
                                        className="btn-cta flex items-center space-x-2"
                                    >
                                        <IoSendOutline />
                                        <span>Enviar Respuesta</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Modal de plantilla de mensaje */}
                    {showTemplateModal && selectedTemplate && selectedAppointment && (
                        <div 
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    setShowTemplateModal(false);
                                    setSelectedTemplate(null);
                                }
                            }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        >
                            <div className="modal-glass-content max-w-lg w-full">
                                <div className="p-6 border-b border-[var(--border-color)]">
                                    <h3 className="text-xl font-bold text-[var(--text-color)] flex items-center">
                                        <IoMailOutline className="mr-2" />
                                        {selectedTemplate.name}
                                    </h3>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Asunto</label>
                                        <input
                                            type="text"
                                            value={selectedTemplate.subject}
                                            readOnly
                                            className="glass-input bg-[var(--input-bg)] opacity-75"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Mensaje</label>
                                        <textarea
                                            value={selectedTemplate.content
                                                .replace(/{clientName}/g, clients.find(c => c.id === selectedAppointment.clientId)?.name || '')
                                                .replace(/{date}/g, new Date(selectedAppointment.date).toLocaleDateString('es-ES'))
                                                .replace(/{time}/g, selectedAppointment.time)
                                                .replace(/{duration}/g, selectedAppointment.duration.toString())
                                                .replace(/{planType}/g, selectedAppointment.planType === '30min' ? 'Sesión Estratégica (30 min)' : 'Consultoría Completa (1 hora)')
                                            }
                                            readOnly
                                            rows={6}
                                            className="glass-input bg-[var(--input-bg)] opacity-75 resize-none"
                                        />
                                    </div>
                                </div>
                                
                                {sendingTemplate && (
                                    <div className="px-6 text-sm text-[var(--text-muted)]">Enviando correo...</div>
                                )}
                                <div className="flex justify-end space-x-3 p-6 border-t border-[var(--border-color)]">
                                    <button
                                        onClick={() => {
                                            setShowTemplateModal(false);
                                            setSelectedTemplate(null);
                                        }}
                                        className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors duration-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleSendTemplateMessage(selectedTemplate, selectedAppointment)}
                                        className={`btn-cta flex items-center space-x-2 ${sendingTemplate ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        disabled={sendingTemplate}
                                    >
                                        <IoSendOutline />
                                        <span>{sendingTemplate ? 'Enviando...' : 'Enviar Mensaje'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Modal de seguimiento */}
                    {showFollowUpModal && (
                        <div 
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    setShowFollowUpModal(false);
                                }
                            }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        >
                            <div className="modal-glass-content max-w-lg w-full">
                                <div className="p-6 border-b border-[var(--border-color)]">
                                    <h3 className="text-xl font-bold text-[var(--text-color)] flex items-center">
                                        <IoTimeOutline className="mr-2" />
                                        Crear Seguimiento
                                    </h3>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Cliente</label>
                                        <select
                                            value={selectedAppointment?.clientId || ''}
                                            onChange={(e) => setSelectedAppointment(prev => prev ? {...prev, clientId: e.target.value} : null)}
                                            className="glass-input"
                                        >
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>{client.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Título</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Llamada de seguimiento"
                                            className="glass-input"
                                            id="followup-title"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Descripción</label>
                                        <textarea
                                            placeholder="Detalles del seguimiento..."
                                            rows={3}
                                            className="glass-input resize-none"
                                            id="followup-description"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Fecha límite</label>
                                            <input
                                                type="date"
                                                className="glass-input"
                                                id="followup-date"
                                                min={toLocalYYYYMMDD(new Date())}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Prioridad</label>
                                            <select className="glass-input" id="followup-priority">
                                                <option value="low">Baja</option>
                                                <option value="medium">Media</option>
                                                <option value="high">Alta</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Tipo</label>
                                        <select className="glass-input" id="followup-type">
                                            <option value="call">Llamada</option>
                                            <option value="email">Email</option>
                                            <option value="meeting">Reunión</option>
                                            <option value="task">Tarea</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end space-x-3 p-6 border-t border-[var(--border-color)]">
                                    <button
                                        onClick={() => setShowFollowUpModal(false)}
                                        className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors duration-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => {
                                            const title = (document.getElementById('followup-title') as HTMLInputElement)?.value;
                                            const description = (document.getElementById('followup-description') as HTMLTextAreaElement)?.value;
                                            const dueDate = (document.getElementById('followup-date') as HTMLInputElement)?.value;
                                            const priority = (document.getElementById('followup-priority') as HTMLSelectElement)?.value as 'low' | 'medium' | 'high';
                                            const type = (document.getElementById('followup-type') as HTMLSelectElement)?.value as 'call' | 'email' | 'meeting' | 'task';
                                            
                                            if (title && description && dueDate && selectedAppointment) {
                                                handleAddFollowUp({
                                                    clientId: selectedAppointment.clientId,
                                                    appointmentId: selectedAppointment.id,
                                                    title,
                                                    description,
                                                    dueDate,
                                                    priority,
                                                    status: 'pending',
                                                    type
                                                });
                                            }
                                        }}
                                        className="btn-cta flex items-center space-x-2"
                                    >
                                        <IoCheckmarkCircleOutline />
                                        <span>Crear Seguimiento</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Modal de comunicación */}
                    {showCommunicationModal && (
                        <div 
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    setShowCommunicationModal(false);
                                }
                            }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        >
                            <div className="modal-glass-content max-w-lg w-full">
                                <div className="p-6 border-b border-[var(--border-color)]">
                                    <h3 className="text-xl font-bold text-[var(--text-color)] flex items-center">
                                        <IoChatbubbleEllipsesOutline className="mr-2" />
                                        Registrar Comunicación
                                    </h3>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Cliente</label>
                                        <select
                                            value={selectedAppointment?.clientId || ''}
                                            onChange={(e) => setSelectedAppointment(prev => prev ? {...prev, clientId: e.target.value} : null)}
                                            className="glass-input"
                                        >
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>{client.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Tipo</label>
                                        <select className="glass-input" id="comm-type">
                                            <option value="email">Email</option>
                                            <option value="call">Llamada</option>
                                            <option value="meeting">Reunión</option>
                                            <option value="note">Nota</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Asunto</label>
                                        <input
                                            type="text"
                                            placeholder="Asunto de la comunicación"
                                            className="glass-input"
                                            id="comm-subject"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Contenido</label>
                                        <textarea
                                            placeholder="Detalles de la comunicación..."
                                            rows={4}
                                            className="glass-input resize-none"
                                            id="comm-content"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Estado</label>
                                        <select className="glass-input" id="comm-status">
                                            <option value="sent">Enviado</option>
                                            <option value="received">Recibido</option>
                                            <option value="pending">Pendiente</option>
                                            <option value="completed">Completado</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setShowCommunicationModal(false)}
                                        className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors duration-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => {
                                            const type = (document.getElementById('comm-type') as HTMLSelectElement)?.value as 'email' | 'call' | 'meeting' | 'note';
                                            const subject = (document.getElementById('comm-subject') as HTMLInputElement)?.value;
                                            const content = (document.getElementById('comm-content') as HTMLTextAreaElement)?.value;
                                            const status = (document.getElementById('comm-status') as HTMLSelectElement)?.value as 'sent' | 'received' | 'pending' | 'completed';
                                            
                                            if (subject && content && selectedAppointment) {
                                                handleAddCommunicationLog({
                                                    clientId: selectedAppointment.clientId,
                                                    type,
                                                    subject,
                                                    content,
                                                    date: toLocalYYYYMMDD(new Date()),
                                                    status
                                                });
                                            }
                                        }}
                                        className="btn-cta flex items-center space-x-2"
                                    >
                                        <IoCheckmarkCircleOutline />
                                        <span>Registrar</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Modal de detalles de cita del usuario */}
                    {showAppointmentDetailsModal && selectedUserAppointment && (
                        <div 
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    setShowAppointmentDetailsModal(false);
                                    setSelectedUserAppointment(null);
                                }
                            }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        >
                            <div className="modal-glass-content max-w-lg w-full">
                                <div className="p-6 border-b border-[var(--border-color)]">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-[var(--text-color)] flex items-center">
                                            <IoCalendarOutline className="mr-2" />
                                            Detalles de la Cita
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setShowAppointmentDetailsModal(false);
                                                setSelectedUserAppointment(null);
                                            }}
                                            className="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--nav-inactive-hover-bg)] transition-all duration-300"
                                        >
                                            <IoClose />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Cliente</label>
                                            <p className="text-[var(--text-muted)]">{selectedUserAppointment.clientName}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Email</label>
                                            <p className="text-[var(--text-muted)]">{selectedUserAppointment.clientEmail}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Fecha</label>
                                            <p className="text-[var(--text-muted)]">{new Date(selectedUserAppointment.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Hora</label>
                                            <p className="text-[var(--text-muted)]">{selectedUserAppointment.time}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Duración</label>
                                            <p className="text-[var(--text-muted)]">{selectedUserAppointment.duration} minutos</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Tipo</label>
                                            <p className="text-[var(--text-muted)]">{selectedUserAppointment.planType === '30min' ? 'Sesión Estratégica (30 min)' : 'Consultoría Completa (1 hora)'}</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Estado</label>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                            selectedUserAppointment.status === 'paid_scheduled' ? 'bg-green-100 text-green-800' :
                                            selectedUserAppointment.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                                            selectedUserAppointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                            selectedUserAppointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {getAppointmentStatusText(selectedUserAppointment.status)}
                                        </span>
                                    </div>
                                    
                                    {selectedUserAppointment.topic && (
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Tema</label>
                                            <p className="text-[var(--text-muted)]">{selectedUserAppointment.topic}</p>
                                        </div>
                                    )}
                                </div>
                                

                            </div>
                        </div>
                    )}
                    
                    {/* Modal de detalles de consulta del usuario */}
                    {showConsultationDetailsModal && selectedUserConsultation && (
                        <div 
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    setShowConsultationDetailsModal(false);
                                    setSelectedUserConsultation(null);
                                }
                            }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        >
                            <div className="modal-glass-content max-w-lg w-full">
                                <div className="p-6 border-b border-[var(--border-color)]">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-[var(--text-color)] flex items-center">
                                            <IoChatbubbleEllipsesOutline className="mr-2" />
                                            Detalles de la Consulta
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setShowConsultationDetailsModal(false);
                                                setSelectedUserConsultation(null);
                                            }}
                                            className="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--nav-inactive-hover-bg)] transition-all duration-300"
                                        >
                                            <IoClose />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Cliente</label>
                                            <p className="text-[var(--text-muted)]">{selectedUserConsultation.clientName}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Email</label>
                                            <p className="text-[var(--text-muted)]">{selectedUserConsultation.clientEmail}</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Fecha</label>
                                        <p className="text-[var(--text-muted)]">{new Date(selectedUserConsultation.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Asunto</label>
                                        <p className="text-[var(--text-muted)]">{selectedUserConsultation.subject}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Estado</label>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                            selectedUserConsultation.status === 'responded' ? 'bg-green-100 text-green-800' :
                                            selectedUserConsultation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {getConsultationStatusText(selectedUserConsultation.status)}
                                        </span>
                                    </div>
                                    
                                    {selectedUserConsultation.topic && (
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Tema</label>
                                            <p className="text-[var(--text-muted)]">{selectedUserConsultation.topic}</p>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Mensaje</label>
                                        <div className="bg-[var(--input-bg)] p-3 rounded-lg border border-[var(--border-color)]">
                                            <p className="text-[var(--text-muted)] whitespace-pre-wrap">{selectedUserConsultation.message}</p>
                                        </div>
                                    </div>
                                    
                                    {selectedUserConsultation.responseMessage && (
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Respuesta</label>
                                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                <p className="text-blue-800 whitespace-pre-wrap">{selectedUserConsultation.responseMessage}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                

                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'calendar' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-[var(--text-color)]">Calendario CRM</h2>
                        <button
                            onClick={() => setShowNewAppointmentForm(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition"
                        >
                            <IoAddCircleOutline />
                            <span>Nueva Cita</span>
                        </button>
                    </div>
                    
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Calendario */}
                        <div className="lg:col-span-2">
                            <Card className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-[var(--text-color)]">
                                        {(() => { const [y,m,d] = selectedDate.split('-').map(Number); return new Date(y, (m||1)-1, d||1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }); })()}
                                    </h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                const [y,m,d] = selectedDate.split('-').map(Number);
                                                const newDate = new Date(y, (m||1)-1, d||1);
                                                newDate.setMonth(newDate.getMonth() - 1);
                                                const y2 = newDate.getFullYear();
                                                const m2 = String(newDate.getMonth()+1).padStart(2,'0');
                                                const d2 = String(newDate.getDate()).padStart(2,'0');
                                                setSelectedDate(`${y2}-${m2}-${d2}`);
                                            }}
                                            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-color)] transition"
                                        >
                                            ←
                                        </button>
                                        <button
                                            onClick={() => {
                                                const [y,m,d] = selectedDate.split('-').map(Number);
                                                const newDate = new Date(y, (m||1)-1, d||1);
                                                newDate.setMonth(newDate.getMonth() + 1);
                                                const y2 = newDate.getFullYear();
                                                const m2 = String(newDate.getMonth()+1).padStart(2,'0');
                                                const d2 = String(newDate.getDate()).padStart(2,'0');
                                                setSelectedDate(`${y2}-${m2}-${d2}`);
                                            }}
                                            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-color)] transition"
                                        >
                                            →
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Días de la semana */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                                        <div key={day} className="p-2 text-center text-sm font-medium text-[var(--text-muted)]">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Días del mes */}
                                <div className="grid grid-cols-7 gap-1">
                                    {generateCalendarDays(selectedDate).map((day, index) => {
                                        const dayAppointments = appointments.filter(apt => apt.date === day.date);
                                        const isSelected = day.date === selectedDate;
                                        const isToday = day.date === toLocalYYYYMMDD(new Date());
                                        const isPastDate = day.date && day.date < toLocalYYYYMMDD(new Date());
                                        const hasPastAppointments = isPastDate && dayAppointments.length > 0;
                                        
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => day.date && setSelectedDate(day.date)}
                                                disabled={!day.date}
                                                className={`p-2 h-12 text-sm relative transition-all ${
                                                    !day.date ? 'text-[var(--text-muted)] opacity-30' :
                                                    isSelected ? 'bg-[var(--primary-color)] text-white' :
                                                    isToday ? 'bg-blue-100 text-blue-800 font-bold' :
                                                    isPastDate ? (
                                                        hasPastAppointments ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                    ) :
                                                    dayAppointments.length > 0 ? 'bg-green-100 text-green-800' :
                                                    'hover:bg-[var(--nav-inactive-hover-bg)] text-[var(--text-color)]'
                                                } rounded-lg`}
                                            >
                                                {day.day}
                                                {dayAppointments.length > 0 && (
                                                    <div className={`absolute bottom-1 right-1 w-2 h-2 rounded-full opacity-60 ${
                                                        isPastDate ? 'bg-green-500' : 'bg-current'
                                                    }`}></div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </Card>
                        </div>
                        
                        {/* Panel de horarios del día seleccionado */}
                        <div>
                            <Card className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-[var(--text-color)]">
                                        {(() => {
                                            const [year, month, day] = selectedDate.split('-').map(Number);
                                            const date = new Date(year, month - 1, day);
                                            const isPastDate = selectedDate < toLocalYYYYMMDD(new Date());
                                            const dateString = date.toLocaleDateString('es-ES', { 
                                                weekday: 'long', 
                                                day: 'numeric', 
                                                month: 'long' 
                                            });
                                            return isPastDate ? `${dateString} (Histórico)` : dateString;
                                        })()}
                                    </h3>
                                    <div className="flex space-x-2">
                                        {selectedDate >= toLocalYYYYMMDD(new Date()) && (
                                            <>
                                                <button
                                                    onClick={() => handleQuickBlock(selectedDate)}
                                                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                                                    title="Bloquear día completo"
                                                >
                                                    🚫 Bloquear Día
                                                </button>
                                                <button
                                                    onClick={() => setShowAvailabilityModal(true)}
                                                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                                                    title="Configurar disponibilidad específica"
                                                >
                                                    ⚙️ Configurar
                                                </button>
                                            </>
                                        )}
                                        {selectedDate < toLocalYYYYMMDD(new Date()) && (
                            <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg">
                                📋 Historial - Citas editables
                            </span>
                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[var(--primary-color)] scrollbar-track-transparent">
                                    {generateTimeSlots().map(timeSlot => {
                                        // Buscar cita que comienza exactamente en este slot (admin)
                        const appointment = appointments.find(apt => 
                            apt.selectedDate === selectedDate && apt.selectedTime === timeSlot
                        );
                        
                        // Buscar cita del usuario que comienza exactamente en este slot
                        const userAppointment = appointments.find(apt => 
                            apt.date === selectedDate && apt.time === timeSlot
                        );
                        
                        // Buscar consulta gratuita que comienza exactamente en este slot (admin)
                        const consultation = consultations.find(cons => 
                            cons.selectedDate === selectedDate && cons.selectedTime === timeSlot
                        );
                        
                        // Buscar consulta del usuario que comienza exactamente en este slot
                        const userConsultation = consultations.find(cons => 
                            cons.date === selectedDate && cons.time === timeSlot
                        );
                                        
                                        // Buscar si este slot está ocupado por una cita de 60 min que comenzó antes
                                        const [hour, minute] = timeSlot.split(':').map(Number);
                                        let previousSlotTime = '';
                                        
                                        if (minute === 30) {
                                            previousSlotTime = `${hour.toString().padStart(2, '0')}:00`;
                                        } else if (minute === 0 && hour > 9) {
                                            previousSlotTime = `${(hour - 1).toString().padStart(2, '0')}:30`;
                                        }
                                        
                                        const extendedAppointment = previousSlotTime ? appointments.find(apt => 
                            apt.selectedDate === selectedDate && 
                            apt.selectedTime === previousSlotTime && 
                            apt.duration === 60
                        ) : null;
                        
                        const extendedUserAppointment = previousSlotTime ? appointments.find(apt => 
                            apt.date === selectedDate && 
                            apt.time === previousSlotTime && 
                            apt.duration === 60
                        ) : null;
                        
                        // Determinar qué mostrar (prioridad: cita admin > cita usuario > consulta admin > consulta usuario)
                        const currentItem = appointment || userAppointment || consultation || userConsultation;
                                        
                                        const isAvailable = isTimeSlotAvailable(selectedDate, timeSlot);
                                        const isBlocked = isTimeSlotBlocked(selectedDate, timeSlot);
                                        const blockedReason = isBlocked ? getBlockedReason(selectedDate, timeSlot) : '';
                                        const isPastDate = selectedDate < toLocalYYYYMMDD(new Date());
                                        
                                        let statusColor = '';
                                        let statusText = '';
                                        let clickable = true;
                                        
                                        if (currentItem) {
                                            if (isPastDate) {
                                                statusColor = 'border-green-400 bg-green-100 hover:bg-green-150';
                                                statusText = currentItem.status === 'completed' ? 'Completada' : 
                                                           currentItem.status === 'cancelled' ? 'Cancelada' : 
                                                           currentItem.status === 'responded' ? 'Respondida' : 'Programada';
                                            } else {
                                                statusColor = 'border-green-300 bg-green-50 hover:bg-green-100';
                                                statusText = '';
                                            }
                                        } else if (extendedAppointment) {
                                            // Slot ocupado por cita de 60 min que comenzó antes
                                            if (isPastDate) {
                                                statusColor = 'border-green-400 bg-green-100';
                                                statusText = extendedAppointment.status === 'completed' ? 'Completada (continuación)' : 
                                                           extendedAppointment.status === 'cancelled' ? 'Cancelada (continuación)' : 'Programada (continuación)';
                                            } else {
                                                statusColor = 'border-green-300 bg-green-50';
                                                statusText = '';
                                            }
                                            clickable = true; // Permitir click para ver detalles
                                        } else if (isBlocked) {
                                            statusColor = 'border-red-300 bg-red-50';
                                            statusText = 'Bloqueado';
                                            clickable = false;
                                        } else if (isAvailable && !isPastDate) {
                                            statusColor = 'border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--primary-color)]/10 hover:border-[var(--primary-color)]';
                                            statusText = 'Libre - Programar';
                                        } else if (isPastDate) {
                                            statusColor = 'border-gray-200 bg-gray-50';
                                            statusText = 'Sin actividad';
                                            clickable = false;
                                        } else {
                                            statusColor = 'border-gray-300 bg-gray-50';
                                            statusText = 'No disponible';
                                            clickable = false;
                                        }
                                        
                                        return (
                                            <div
                                                key={timeSlot}
                                                onClick={() => {
                                                    console.log('Calendar slot clicked:', { timeSlot, currentItem, extendedAppointment, clickable });
                                                    if (!clickable) return;
                                                    
                                                    if (currentItem) {
                                                        if (appointment) {
                                                            console.log('Found admin appointment, calling handleEditAppointment');
                                                            handleEditAppointment(appointment);
                                                        } else if (userAppointment) {
                                                            console.log('Found user appointment, showing details');
                                                            // Para citas del usuario, mostrar modal de detalles
                                                            handleShowUserAppointmentDetails(userAppointment);
                                                        } else if (consultation) {
                                                            console.log('Found admin consultation, calling handleEditConsultation');
                                                            handleEditConsultation(consultation);
                                                        } else if (userConsultation) {
                                                            console.log('Found user consultation, showing details');
                                                            // Para consultas del usuario, mostrar modal de detalles
                                                            handleShowUserConsultationDetails(userConsultation);
                                                        }
                                                    } else if (extendedAppointment) {
                                                        // Si es un slot ocupado por una cita extendida, mostrar la cita original
                                                        console.log('Found extended admin appointment, calling handleEditAppointment');
                                                        handleEditAppointment(extendedAppointment);
                                                    } else if (extendedUserAppointment) {
                                                        // Si es un slot ocupado por una cita extendida del usuario
                                                        console.log('Found extended user appointment, showing details');
                                                        handleShowUserAppointmentDetails(extendedUserAppointment);
                                                    } else if (isAvailable && !isPastDate) {
                                                        // Solo permitir reservar en fechas futuras
                                                        console.log('Available slot, opening new appointment form');
                                                        setNewAppointmentForm(prev => ({
                                                            ...prev,
                                                            date: selectedDate,
                                                            time: timeSlot
                                                        }));
                                                        setShowNewAppointmentForm(true);
                                                    }
                                                }}
                                                className={`p-3 rounded-lg border transition-all ${
                                                    clickable ? 'cursor-pointer' : 'cursor-not-allowed'
                                                } ${statusColor}`}
                                                title={isBlocked ? blockedReason : ''}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-[var(--text-color)]">{timeSlot}</span>
                                                    {currentItem ? (
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium text-green-700">{currentItem.clientName}</p>
                                                            <p className="text-xs text-green-600">
                                                                {currentItem.planType === 'free' ? 'Consulta Gratis' : 
                                                                 appointment ? `${appointment.duration} min` : 'Consulta Gratis'}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-right">
                                                            <span className={`text-sm transition-all ${
                                                                isBlocked ? 'text-red-600' :
                                                                isAvailable ? 'text-[var(--primary-color)] hover:font-medium' :
                                                                'text-gray-500'
                                                            }`}>{statusText}</span>
                                                            {isBlocked && (
                                                                <div className="flex items-center justify-end mt-1">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleQuickBlock(selectedDate, timeSlot);
                                                                        }}
                                                                        className="text-xs text-red-500 hover:text-red-700 underline"
                                                                        title="Editar bloqueo"
                                                                    >
                                                                        Editar
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* Botón para agendar en horario libre */}
                                <button
                                    onClick={() => {
                                        setNewAppointmentForm(prev => ({...prev, date: selectedDate}));
                                        setShowNewAppointmentForm(true);
                                    }}
                                    className="w-full mt-4 p-3 border-2 border-dashed border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition-all"
                                >
                                    + Agendar en este día
                                </button>
                            </Card>
                        </div>
                    </div>
                    
                    {/* Modal nueva cita mejorado */}
                    {showNewAppointmentForm && (
                        <div 
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    setShowNewAppointmentForm(false);
                                }
                            }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
                        >
                            <div className="modal-glass-content w-full max-w-md p-8 relative">
                                <button
                                    onClick={() => setShowNewAppointmentForm(false)}
                                    className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--nav-inactive-hover-bg)] transition-all duration-300"
                                >
                                    <IoCloseCircleOutline className="text-lg" />
                                </button>

                                <h3 className="text-3xl font-bold text-center text-[var(--text-color)] mb-2">Nueva Cita</h3>
                                <p className="text-center text-[var(--text-muted)] mb-8">Agenda una nueva cita con tu cliente.</p>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Cliente</label>
                                        <select
                                            value={newAppointmentForm.clientId}
                                            onChange={(e) => setNewAppointmentForm(prev => ({...prev, clientId: e.target.value}))}
                                            className="glass-input"
                                        >
                                            <option value="">Seleccionar cliente</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>{client.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Fecha</label>
                                        <input
                                            type="date"
                                            value={newAppointmentForm.date}
                                            onChange={(e) => setNewAppointmentForm(prev => ({...prev, date: e.target.value}))}
                                            className="glass-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Hora</label>
                                        <select
                                            value={newAppointmentForm.time}
                                            onChange={(e) => setNewAppointmentForm(prev => ({...prev, time: e.target.value}))}
                                            className="glass-input"
                                        >
                                            <option value="">Seleccionar hora</option>
                                            {generateTimeSlots().map(time => {
                                                const isOccupied = appointments.some(apt => 
                                                    apt.date === newAppointmentForm.date && apt.time === time
                                                );
                                                return (
                                                    <option key={time} value={time} disabled={isOccupied}>
                                                        {time} {isOccupied ? '(Ocupado)' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Tipo de Consulta</label>
                                        <select
                                            value={newAppointmentForm.planType}
                                            onChange={(e) => setNewAppointmentForm(prev => ({...prev, planType: e.target.value as 'free' | '30min' | '60min'}))}
                                            className="glass-input"
                                        >
                                            <option value="free">Consulta Gratuita (30 min)</option>
                                            <option value="30min">Sesión Estratégica (30 min)</option>
                                            <option value="60min">Consultoría Completa (60 min)</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end space-x-3 mt-8">
                                    <button
                                        onClick={() => setShowNewAppointmentForm(false)}
                                        className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors duration-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={addNewAppointment}
                                        className="btn-cta flex items-center space-x-2"
                                    >
                                        <IoCheckmarkCircleOutline />
                                        <span>Crear Cita</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'clients' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-[var(--text-color)]">Gestión de Clientes</h2>
                        <button
                            onClick={() => setShowNewClientForm(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition"
                        >
                            <IoPersonAddOutline />
                            <span>Nuevo Cliente</span>
                        </button>
                    </div>
                    
                    <div className="grid gap-4">
                        {clients.map(client => (
                            <Card key={client.id} className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-[var(--text-color)]">{client.name}</h3>
                                        <p className="text-[var(--text-muted)]">{client.email}</p>
                                        {client.phone && <p className="text-[var(--text-muted)]">{client.phone}</p>}
                                        <p className="text-sm text-[var(--text-muted)]">Registrado: {client.registrationDate}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-[var(--text-color)]">{client.totalConsultations}</p>
                                        <p className="text-sm text-[var(--text-muted)]">Consultas</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                    
                    {/* Modal nuevo cliente */}
                    {showNewClientForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-[var(--card-bg)] p-6 rounded-lg max-w-md w-full mx-4">
                                <h3 className="text-xl font-bold text-[var(--text-color)] mb-4">Nuevo Cliente</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            value={newClientForm.name}
                                            onChange={(e) => setNewClientForm(prev => ({...prev, name: e.target.value}))}
                                            className="w-full p-3 border border-[var(--border-color)] rounded-lg bg-[var(--input-bg)] text-[var(--text-color)]"
                                            placeholder="Nombre completo"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={newClientForm.email}
                                            onChange={(e) => setNewClientForm(prev => ({...prev, email: e.target.value}))}
                                            className="w-full p-3 border border-[var(--border-color)] rounded-lg bg-[var(--input-bg)] text-[var(--text-color)]"
                                            placeholder="email@ejemplo.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Teléfono (opcional)</label>
                                        <input
                                            type="tel"
                                            value={newClientForm.phone}
                                            onChange={(e) => setNewClientForm(prev => ({...prev, phone: e.target.value}))}
                                            className="w-full p-3 border border-[var(--border-color)] rounded-lg bg-[var(--input-bg)] text-[var(--text-color)]"
                                            placeholder="+34 600 123 456"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowNewClientForm(false)}
                                        className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-color)] transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={addNewClient}
                                        className="flex items-center space-x-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition"
                                    >
                                        <IoCheckmarkCircleOutline />
                                        <span>Agregar Cliente</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'plans' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-[var(--text-color)]">Gestión de Planes</h2>
                        <button
                            onClick={() => setShowNewPlanForm(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition"
                        >
                            <IoAddCircleOutline />
                            <span>Crear Nuevo Plan</span>
                        </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan, index) => (
                            <Card key={plan.id} className={`p-6 relative ${!plan.isActive ? 'opacity-60' : ''}`}>
                                {editingPlan === plan.id ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Nombre del Plan</label>
                                            <input
                                                type="text"
                                                value={editPlanForm.name}
                                                onChange={(e) => setEditPlanForm(prev => ({...prev, name: e.target.value}))}
                                                className="w-full p-3 border border-[var(--border-color)] rounded-lg bg-[var(--input-bg)] text-[var(--text-color)]"
                                                placeholder="Nombre del plan"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Precio</label>
                                            <input
                                                type="text"
                                                value={editPlanForm.price}
                                                onChange={(e) => setEditPlanForm(prev => ({...prev, price: e.target.value}))}
                                                className="w-full p-3 border border-[var(--border-color)] rounded-lg bg-[var(--input-bg)] text-[var(--text-color)]"
                                                placeholder="Precio"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Duración</label>
                                            <input
                                                type="text"
                                                value={editPlanForm.duration}
                                                onChange={(e) => setEditPlanForm(prev => ({...prev, duration: e.target.value}))}
                                                className="w-full p-3 border border-[var(--border-color)] rounded-lg bg-[var(--input-bg)] text-[var(--text-color)]"
                                                placeholder="Duración"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Descripción</label>
                                            <textarea
                                                value={editPlanForm.description}
                                                onChange={(e) => setEditPlanForm(prev => ({...prev, description: e.target.value}))}
                                                className="w-full p-3 border border-[var(--border-color)] rounded-lg bg-[var(--input-bg)] text-[var(--text-color)] resize-none"
                                                placeholder="Descripción del plan"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-3 mt-4">
                                            <button
                                                onClick={() => setEditingPlan(null)}
                                                className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-color)] transition"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    updatePlan(plan.id, {
                                                        name: editPlanForm.name,
                                                        price: editPlanForm.price,
                                                        duration: editPlanForm.duration,
                                                        description: editPlanForm.description
                                                    });
                                                    setEditingPlan(null);
                                                }}
                                                className="flex items-center space-x-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition"
                                            >
                                                <IoCheckmarkCircleOutline />
                                                <span>Guardar</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="absolute top-4 right-4 flex space-x-2">
                                            <button 
                                                onClick={() => {
                                                    setEditPlanForm({
                                                        name: plan.name,
                                                        price: plan.price,
                                                        duration: plan.duration,
                                                        description: plan.description
                                                    });
                                                    setEditingPlan(plan.id);
                                                }}
                                                className="text-[var(--primary-color)] hover:text-[var(--primary-color-dark)] transition"
                                                title="Editar plan"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => togglePlanStatus(plan.id)}
                                                className={`${plan.isActive ? 'text-yellow-500 hover:text-yellow-600' : 'text-green-500 hover:text-green-600'} transition`}
                                                title={plan.isActive ? 'Pausar plan' : 'Activar plan'}
                                            >
                                                {plan.isActive ? <IoPauseOutline className="h-5 w-5" /> : <IoPlayOutline className="h-5 w-5" />}
                                            </button>
                                            <button 
                                                onClick={() => deletePlan(plan.id)}
                                                className="text-red-500 hover:text-red-600 transition"
                                                title="Eliminar plan"
                                            >
                                                <IoTrashOutline className="h-5 w-5" />
                                            </button>
                                        </div>
                                        
                                        <div className="absolute top-4 left-4 flex flex-col space-y-1">
                                            {index > 0 && (
                                                <button 
                                                    onClick={() => reorderPlans(index, index - 1)}
                                                    className="text-[var(--text-muted)] hover:text-[var(--text-color)] transition"
                                                    title="Mover hacia arriba"
                                                >
                                                    <IoArrowUpOutline className="h-4 w-4" />
                                                </button>
                                            )}
                                            {index < plans.length - 1 && (
                                                <button 
                                                    onClick={() => reorderPlans(index, index + 1)}
                                                    className="text-[var(--text-muted)] hover:text-[var(--text-color)] transition"
                                                    title="Mover hacia abajo"
                                                >
                                                    <IoArrowDownOutline className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="mt-8">
                                            <h3 className="text-xl font-bold text-[var(--text-color)] mb-2">{plan.name}</h3>
                                            <p className="text-3xl font-bold text-[var(--primary-color)] mb-2">{plan.price}</p>
                                            <p className="text-sm font-medium text-[var(--text-color)] mb-4">{plan.duration}</p>
                                            <p className="text-[var(--text-muted)] leading-relaxed">{plan.description}</p>
                                            {!plan.isActive && (
                                                <div className="mt-3 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm inline-block">
                                                    Plan pausado
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </Card>
                        ))}
                    </div>
                    
                    {/* Formulario para crear nuevo plan */}
                    {showNewPlanForm && (
                        <div 
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    setShowNewPlanForm(false);
                                    setNewPlanForm({ name: '', price: '', duration: '', description: '', isActive: true });
                                }
                            }}
                            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${showNewPlanForm ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        >
                            <div className={`modal-glass-content w-full max-w-md p-8 relative transform transition-all duration-300 ${showNewPlanForm ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                                <button
                                    onClick={() => {
                                        setShowNewPlanForm(false);
                                        setNewPlanForm({ name: '', price: '', duration: '', description: '', isActive: true });
                                    }}
                                    aria-label="Cerrar modal"
                                    className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--nav-inactive-hover-bg)] transition-all duration-300 z-10"
                                >
                                    <IoCloseCircleOutline className="text-lg" />
                                </button>

                                <h3 className="text-3xl font-bold text-center text-[var(--text-color)] mb-2">Crear Nuevo Plan</h3>
                                <p className="text-center text-[var(--text-muted)] mb-8">Configura los detalles de tu nuevo plan de consultoría.</p>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Nombre del Plan</label>
                                        <input
                                            type="text"
                                            value={newPlanForm.name}
                                            onChange={(e) => setNewPlanForm(prev => ({...prev, name: e.target.value}))}
                                            className="glass-input"
                                            placeholder="Nombre del plan"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Precio</label>
                                        <input
                                            type="text"
                                            value={newPlanForm.price}
                                            onChange={(e) => setNewPlanForm(prev => ({...prev, price: e.target.value}))}
                                            className="glass-input"
                                            placeholder="€100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Duración</label>
                                        <input
                                            type="text"
                                            value={newPlanForm.duration}
                                            onChange={(e) => setNewPlanForm(prev => ({...prev, duration: e.target.value}))}
                                            className="glass-input"
                                            placeholder="30 minutos"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Descripción</label>
                                        <textarea
                                            value={newPlanForm.description}
                                            onChange={(e) => setNewPlanForm(prev => ({...prev, description: e.target.value}))}
                                            className="glass-input resize-none"
                                            placeholder="Descripción del plan"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end space-x-3 mt-8">
                                    <button
                                        onClick={() => {
                                            setShowNewPlanForm(false);
                                            setNewPlanForm({ name: '', price: '', duration: '', description: '', isActive: true });
                                        }}
                                        className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors duration-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (newPlanForm.name && newPlanForm.price && newPlanForm.duration && newPlanForm.description) {
                                                addPlan({
                                                    name: newPlanForm.name,
                                                    price: newPlanForm.price,
                                                    duration: newPlanForm.duration,
                                                    description: newPlanForm.description,
                                                    isActive: newPlanForm.isActive
                                                });
                                                setShowNewPlanForm(false);
                                                setNewPlanForm({ name: '', price: '', duration: '', description: '', isActive: true });
                                            }
                                        }}
                                        className="btn-cta flex items-center space-x-2"
                                    >
                                        <IoCheckmarkCircleOutline />
                                        <span>Crear Plan</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
             )}
             
             {activeTab === 'templates' && (
                 <div className="space-y-6">
                     <h2 className="text-2xl font-bold text-[var(--text-color)]">Plantillas de Email</h2>
                     
                     <div className="grid gap-6">
                         <Card className="p-6">
                             <h3 className="text-lg font-bold text-[var(--text-color)] mb-4">Respuesta Estándar Profesional</h3>
                             <div className="bg-[var(--input-bg)] p-4 rounded-lg">
                                 <pre className="text-sm text-[var(--text-muted)] whitespace-pre-wrap font-sans">
                                     {emailTemplates.standardResponse.replace('{clientName}', '[Nombre del Cliente]')}
                                 </pre>
                             </div>
                             <div className="mt-4 flex justify-end">
                                 <button className="flex items-center space-x-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition whitespace-nowrap overflow-hidden text-ellipsis min-w-fit">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                         <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                     </svg>
                                     <span>Editar Plantilla</span>
                                 </button>
                             </div>
                         </Card>
                         
                         <Card className="p-6">
                             <h3 className="text-lg font-bold text-[var(--text-color)] mb-4">Respuesta para consulta de 30 minutos</h3>
                             <div className="bg-[var(--input-bg)] p-4 rounded-lg">
                                 <pre className="text-sm text-[var(--text-muted)] whitespace-pre-wrap font-sans">
                                     {emailTemplates.consultation30min.replace('{clientName}', '[Nombre del Cliente]')}
                                 </pre>
                             </div>
                             <div className="mt-4 flex justify-end">
                                 <button className="flex items-center space-x-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition whitespace-nowrap overflow-hidden text-ellipsis min-w-fit">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                         <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                     </svg>
                                     <span>Editar Plantilla</span>
                                 </button>
                             </div>
                         </Card>
                         
                         <Card className="p-6">
                             <h3 className="text-lg font-bold text-[var(--text-color)] mb-4">Respuesta para consulta de 60 minutos</h3>
                             <div className="bg-[var(--input-bg)] p-4 rounded-lg">
                                 <pre className="text-sm text-[var(--text-muted)] whitespace-pre-wrap font-sans">
                                     {emailTemplates.consultation60min.replace('{clientName}', '[Nombre del Cliente]')}
                                 </pre>
                             </div>
                             <div className="mt-4 flex justify-end">
                                 <button className="flex items-center space-x-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition whitespace-nowrap overflow-hidden text-ellipsis min-w-fit">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                         <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                     </svg>
                                     <span>Editar Plantilla</span>
                                 </button>
                             </div>
                         </Card>
                         
                         <Card className="p-6">
                             <h3 className="text-lg font-bold text-[var(--text-color)] mb-4">Confirmación de cita</h3>
                             <div className="bg-[var(--input-bg)] p-4 rounded-lg">
                                 <pre className="text-sm text-[var(--text-muted)] whitespace-pre-wrap font-sans">
                                     {emailTemplates.appointmentConfirmation
                                         .replace('{clientName}', '[Nombre del Cliente]')
                                         .replace('{date}', '[Fecha]')
                                         .replace('{time}', '[Hora]')
                                         .replace('{duration}', '[Duración]')}
                                 </pre>
                             </div>
                             <div className="mt-4 flex justify-end">
                                 <button className="flex items-center space-x-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition whitespace-nowrap overflow-hidden text-ellipsis min-w-fit">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                         <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                     </svg>
                                     <span>Editar Plantilla</span>
                                 </button>
                             </div>
                         </Card>
                     </div>
                 </div>
            )}
            
            {activeTab === 'diagnostics' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-[var(--text-color)]">Diagnóstico de Conexión</h2>
                    <FirebaseConnectionTest onClose={() => {}} />
                </div>
            )}
            
            {/* Modal de Configuración de Disponibilidad */}
            {showAvailabilityModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-bold text-[var(--text-color)] mb-4">Configurar Disponibilidad</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Fecha</label>
                                <input
                                    type="date"
                                    value={availabilityForm.date}
                                    onChange={(e) => setAvailabilityForm(prev => ({...prev, date: e.target.value}))}
                                    className="glass-input"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Hora Inicio</label>
                                    <input
                                        type="time"
                                        value={availabilityForm.startTime}
                                        onChange={(e) => setAvailabilityForm(prev => ({...prev, startTime: e.target.value}))}
                                        className="glass-input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Hora Fin</label>
                                    <input
                                        type="time"
                                        value={availabilityForm.endTime}
                                        onChange={(e) => setAvailabilityForm(prev => ({...prev, endTime: e.target.value}))}
                                        className="glass-input"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Tipo</label>
                                <select
                                    value={availabilityForm.type}
                                    onChange={(e) => setAvailabilityForm(prev => ({...prev, type: e.target.value as 'available' | 'blocked'}))}
                                    className="glass-input"
                                >
                                    <option value="available">Disponible</option>
                                    <option value="blocked">Bloqueado</option>
                                </select>
                            </div>
                            
                            {availabilityForm.type === 'blocked' && (
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Motivo del Bloqueo</label>
                                    <input
                                        type="text"
                                        value={availabilityForm.reason || ''}
                                        onChange={(e) => setAvailabilityForm(prev => ({...prev, reason: e.target.value}))}
                                        placeholder="Ej: Reunión personal, Vacaciones..."
                                        className="glass-input"
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowAvailabilityModal(false)}
                                className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddAvailability}
                                className="btn-cta"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal de Bloqueo de Período */}
            {showBlockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-bold text-[var(--text-color)] mb-4">Bloquear Período</h3>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Fecha Inicio</label>
                                    <input
                                        type="date"
                                        value={blockForm.startDate}
                                        onChange={(e) => setBlockForm(prev => ({...prev, startDate: e.target.value}))}
                                        className="glass-input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Fecha Fin</label>
                                    <input
                                        type="date"
                                        value={blockForm.endDate}
                                        onChange={(e) => setBlockForm(prev => ({...prev, endDate: e.target.value}))}
                                        className="glass-input"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Tipo de Bloqueo</label>
                                <select
                                    value={blockForm.type}
                                    onChange={(e) => setBlockForm(prev => ({...prev, type: e.target.value as 'full_day' | 'time_range'}))}
                                    className="glass-input"
                                >
                                    <option value="full_day">Día Completo</option>
                                    <option value="time_range">Rango de Horas</option>
                                </select>
                            </div>
                            
                            {blockForm.type === 'time_range' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Hora Inicio</label>
                                        <input
                                            type="time"
                                            value={blockForm.startTime || ''}
                                            onChange={(e) => setBlockForm(prev => ({...prev, startTime: e.target.value}))}
                                            className="glass-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Hora Fin</label>
                                        <input
                                            type="time"
                                            value={blockForm.endTime || ''}
                                            onChange={(e) => setBlockForm(prev => ({...prev, endTime: e.target.value}))}
                                            className="glass-input"
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Motivo</label>
                                <input
                                    type="text"
                                    value={blockForm.reason}
                                    onChange={(e) => setBlockForm(prev => ({...prev, reason: e.target.value}))}
                                    placeholder="Ej: Vacaciones, Reunión importante..."
                                    className="glass-input"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowBlockModal(false)}
                                className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddBlockedPeriod}
                                className="btn-cta"
                            >
                                Bloquear
                            </button>
                        </div>
                    </div>
                </div>
            )}
        
        {/* Modal de edición de cita CRM - Fuera de las pestañas para que se muestre siempre */}
        {showEditAppointmentModal && selectedAppointment && (
            <div 
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        setShowEditAppointmentModal(false);
                        setSelectedAppointment(null);
                    }
                }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            >
                <div className="modal-glass-content max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                    <button
                        onClick={() => {
                            setShowEditAppointmentModal(false);
                            setSelectedAppointment(null);
                        }}
                        className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--nav-inactive-hover-bg)] transition-all duration-300 z-10"
                    >
                        <IoCloseCircleOutline className="text-lg" />
                    </button>
                    
                    <div className="p-6 border-b border-[var(--border-color)]">
                        <h3 className="text-xl font-bold text-[var(--text-color)] flex items-center">
                            <IoCalendarOutline className="mr-2" />
                            Gestionar Cita - {selectedAppointment.clientName}
                        </h3>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Información actual de la cita */}
                        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-lg">
                            <h4 className="font-semibold text-[var(--text-color)] mb-2">Información Actual</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-[var(--text-muted)]">Fecha:</span>
                                    <p className="font-medium">{new Date(selectedAppointment.date).toLocaleDateString('es-ES')}</p>
                                </div>
                                <div>
                                    <span className="text-[var(--text-muted)]">Hora:</span>
                                    <p className="font-medium">{selectedAppointment.time}</p>
                                </div>
                                <div>
                                    <span className="text-[var(--text-muted)]">Duración:</span>
                                    <p className="font-medium">{selectedAppointment.duration} min</p>
                                </div>
                                <div>
                                    <span className="text-[var(--text-muted)]">Estado:</span>
                                    <p className="font-medium capitalize">{selectedAppointment.status}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Formulario de edición */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-[var(--text-color)]">Modificar Cita</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Nueva Fecha</label>
                                    <input
                                        type="date"
                                        value={selectedAppointment.date}
                                        onChange={(e) => setSelectedAppointment(prev => prev ? {...prev, date: e.target.value} : null)}
                                        className="glass-input"
                                        min={toLocalYYYYMMDD(new Date())}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Nueva Hora</label>
                                    <select
                                        value={selectedAppointment.time}
                                        onChange={(e) => setSelectedAppointment(prev => prev ? {...prev, time: e.target.value} : null)}
                                        className="glass-input"
                                    >
                                        {generateTimeSlots().map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-color)] mb-2">Estado</label>
                                <select
                                    value={selectedAppointment.status}
                                    onChange={(e) => setSelectedAppointment(prev => prev ? {...prev, status: e.target.value as 'scheduled' | 'completed' | 'cancelled'} : null)}
                                    className="glass-input"
                                >
                                    <option value="scheduled">Programada</option>
                                    <option value="completed">Completada</option>
                                    <option value="cancelled">Cancelada</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Plantillas de mensajes */}
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-[var(--text-color)] mb-3">Comunicación con Cliente</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {messageTemplates.map(template => (
                                    <button
                                        key={template.id}
                                        onClick={() => {
                                            setSelectedTemplate(template);
                                            setShowTemplateModal(true);
                                        }}
                                        className="p-3 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition-all text-left"
                                    >
                                        <div className="font-medium text-sm">{template.name}</div>
                                        <div className="text-xs opacity-75">{template.subject}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Acciones rápidas */}
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-[var(--text-color)] mb-3">Acciones Rápidas</h4>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => {
                                        setShowFollowUpModal(true);
                                    }}
                                    className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                                >
                                    <IoTimeOutline />
                                    <span>Crear Seguimiento</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCommunicationModal(true);
                                    }}
                                    className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                >
                                    <IoChatbubbleEllipsesOutline />
                                    <span>Registrar Comunicación</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                        <button
                            onClick={() => {
                                setShowEditAppointmentModal(false);
                                setSelectedAppointment(null);
                            }}
                            className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors duration-200"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => handleSaveAppointmentChanges(selectedAppointment)}
                            className="btn-cta flex items-center space-x-2"
                        >
                            <IoCheckmarkCircleOutline />
                            <span>Guardar Cambios</span>
                        </button>
                    </div>
                </div>
            </div>
        )}
        

        </div>
    );
};

const UserDashboard: React.FC<{ onBookCallClick: () => void }> = ({ onBookCallClick }) => {
    const { user } = useAuth();
    const [userConsultations, setUserConsultations] = useState<Consultation[]>([]);
    const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const userViews = ['overview','consultations','appointments'] as const;
    const [currentView, setCurrentView] = useState<typeof userViews[number]>(() => {
        const v = searchParams.get('view') || 'overview';
        return (userViews as readonly string[]).includes(v) ? (v as typeof userViews[number]) : 'overview';
    });

    // Sincronizar estado de vista con URL - evitar bucle infinito
    useEffect(() => {
        const urlView = searchParams.get('view') || 'overview';
        const validView = (userViews as readonly string[]).includes(urlView) ? (urlView as typeof userViews[number]) : 'overview';
        
        // Solo actualizar si hay una diferencia real
        if (validView !== currentView) {
            setCurrentView(validView);
        }
    }, [searchParams.get('view')]);

    // Actualizar URL solo cuando el usuario cambia la vista manualmente
    const handleViewChange = (newView: typeof userViews[number]) => {
        if (newView !== currentView) {
            setCurrentView(newView);
            const newParams = new URLSearchParams(searchParams);
            newParams.set('view', newView);
            newParams.delete('tab');
            setSearchParams(newParams);
        }
    };
    
    useEffect(() => {
        if (!user?.email) return;
        
        const consultationsRef = collection(db, 'consultations');
        const q = query(
            consultationsRef, 
            where('clientEmail', '==', user.email)
        );
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const consultationsData: Consultation[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                consultationsData.push({
                    id: doc.id,
                    clientName: data.clientName || '',
                    clientEmail: data.clientEmail || '',
                    subject: 'Consulta Gratuita',
                    message: data.problemDescription || '',
                    date: data.selectedDate ? toDisplayDate(data.selectedDate) : '',
                    status: data.status || 'pending',
                    planType: data.planType || 'free',
                    responseMessage: data.responseMessage || '',
                    createdAt: safeToDate(data.createdAt),
                    updatedAt: safeToDate(data.updatedAt),
                    respondedAt: safeToDate(data.respondedAt)
                });
            });
            // Ordenar por fecha de creación si existe, sino por fecha de actualización
            consultationsData.sort((a, b) => {
                const aTime = a.createdAt?.getTime() || a.updatedAt?.getTime() || 0;
                const bTime = b.createdAt?.getTime() || b.updatedAt?.getTime() || 0;
                return bTime - aTime;
            });
            setUserConsultations(consultationsData);
        }, (error) => {
            console.error('Error al cargar consultas del usuario:', error);
        });
        
        return () => unsubscribe();
    }, [user?.email]);
    
    // Cargar citas del usuario desde Firestore
    useEffect(() => {
        if (!user?.email) return;
        
        const appointmentsRef = collection(db, 'appointments');
        const q = query(
            appointmentsRef, 
            where('clientEmail', '==', user.email),
            orderBy('selectedDate', 'desc')
        );
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const appointmentsData: Appointment[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                appointmentsData.push({
                        id: doc.id,
                        clientId: data.clientId || '',
                        clientName: data.clientName || '',
                        clientEmail: data.clientEmail || '',
                        date: data.selectedDate ? toDisplayDate(data.selectedDate) : '',
                        time: data.selectedTime || '',
                        duration: data.duration || 30,
                        planType: data.planType || '30min',
                        status: data.status || 'pending_payment',
                        topic: data.topic || '',
                        consultationId: data.consultationId
                    });
            });
            setUserAppointments(appointmentsData);
        }, (error) => {
            console.error('Error al cargar citas del usuario:', error);
        });
        
        return () => unsubscribe();
    }, [user?.email]);
    
    // Función para estados de consultas gratuitas
    const getConsultationStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'responded': return 'Respondida';
            case 'cancelled': return 'Cancelada';
            default: return 'Pendiente';
        }
    };

    const getPlanText = (planType: string) => {
        switch (planType) {
            case 'free': return 'Consulta Gratuita';
            case '30min': return 'Cita 30 min';
            case '60min': return 'Cita 60 min';
            default: return 'Consulta Gratuita';
        }
    };

    // Función para obtener el color del estado
    const getStatusColor = (status: string, isAppointment: boolean = false) => {
        if (isAppointment) {
            switch (status) {
                case 'pending_payment': return 'bg-orange-100 text-orange-800';
                case 'paid_scheduled': return 'bg-blue-100 text-blue-800';
                case 'confirmed': return 'bg-purple-100 text-purple-800';
                case 'completed': return 'bg-green-100 text-green-800';
                case 'cancelled': return 'bg-red-100 text-red-800';
                default: return 'bg-orange-100 text-orange-800';
            }
        } else {
            switch (status) {
                case 'pending': return 'bg-yellow-100 text-yellow-800';
                case 'responded': return 'bg-green-100 text-green-800';
                case 'cancelled': return 'bg-red-100 text-red-800';
                default: return 'bg-yellow-100 text-yellow-800';
            }
        }
    };
    
    // Vista principal con resumen
    const renderOverview = () => (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-[var(--text-color)]">Tu Panel de Cliente</h1>
                <p className="text-lg text-[var(--text-muted)] mt-2">Gestiona tus consultas y agenda nuevas sesiones.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                {/* Indicador de Consultas */}
                <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 hover:border-[var(--primary-color)]" onClick={() => handleViewChange('consultations')}>
                    <div className="flex items-center justify-between p-6">
                        <div>
                            <div className="flex items-center mb-2">
                                <IoChatbubbleEllipsesOutline className="text-3xl text-[var(--primary-color)] mr-3" />
                                <h3 className="text-xl font-bold text-[var(--text-color)]">Mis Consultas</h3>
                            </div>
                            <div className="text-4xl font-bold text-[var(--primary-color)] mb-2">
                                {userConsultations.length}
                            </div>
                            <div className="text-sm text-[var(--text-muted)]">
                                {userConsultations.filter(c => c.status === 'pending').length} pendientes
                                {userConsultations.filter(c => c.status === 'responded').length > 0 && 
                                    `, ${userConsultations.filter(c => c.status === 'responded').length} respondidas`
                                }
                            </div>
                        </div>
                        <div className="text-[var(--primary-color)]">
                            <IoArrowUpOutline className="text-2xl" />
                        </div>
                    </div>
                </Card>

                {/* Indicador de Citas */}
                <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 hover:border-[var(--primary-color)]" onClick={() => handleViewChange('appointments')}>
                    <div className="flex items-center justify-between p-6">
                        <div>
                            <div className="flex items-center mb-2">
                                <IoCalendarOutline className="text-3xl text-[var(--primary-color)] mr-3" />
                                <h3 className="text-xl font-bold text-[var(--text-color)]">Mis Citas</h3>
                            </div>
                            <div className="text-4xl font-bold text-[var(--primary-color)] mb-2">
                                {userAppointments.length}
                            </div>
                            <div className="text-sm text-[var(--text-muted)]">
                                {userAppointments.filter(a => a.status === 'pending').length} pendientes
                                {userAppointments.filter(a => a.status === 'confirmed').length > 0 && 
                                    `, ${userAppointments.filter(a => a.status === 'confirmed').length} confirmadas`
                                }
                                {userAppointments.filter(a => a.status === 'completed').length > 0 && 
                                    `, ${userAppointments.filter(a => a.status === 'completed').length} completadas`
                                }
                            </div>
                        </div>
                        <div className="text-[var(--primary-color)]">
                            <IoArrowUpOutline className="text-2xl" />
                        </div>
                    </div>
                </Card>

                {/* Nueva Consulta */}
                <DashboardCard icon={<IoAddCircleOutline />} title="Nueva Consulta" action={
                    <button onClick={onBookCallClick} className="btn-cta text-sm px-4 py-2">
                        Agendar Ahora
                    </button>
                }>
                    <p>¿Tienes un nuevo reto o necesitas seguimiento? Agenda una nueva sesión estratégica conmigo.</p>
                </DashboardCard>
            </div>
        </div>
    );

    // Componente de navegación reutilizable
    const NavigationBar = ({ currentSection, setCurrentView, onBookCallClick }: { 
        currentSection: string; 
        setCurrentView: (view: 'overview' | 'consultations' | 'appointments') => void;
        onBookCallClick: () => void;
    }) => (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => handleViewChange('overview')}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        currentSection === 'overview' 
                            ? 'bg-[var(--primary-color)] text-white shadow-md transform scale-105' 
                            : 'bg-[var(--input-bg)] text-[var(--text-color)] hover:bg-[var(--primary-color)] hover:text-white hover:shadow-md hover:transform hover:scale-105'
                    }`}
                >
                    <IoArrowDownOutline className="mr-2" />
                    Dashboard Principal
                </button>
                <button
                    onClick={() => handleViewChange('consultations')}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        currentSection === 'consultations' 
                            ? 'bg-[var(--primary-color)] text-white shadow-md transform scale-105' 
                            : 'bg-[var(--input-bg)] text-[var(--text-color)] hover:bg-[var(--primary-color)] hover:text-white hover:shadow-md hover:transform hover:scale-105'
                    }`}
                >
                    <IoChatbubbleEllipsesOutline className="mr-2" />
                    Mis Consultas
                </button>
                <button
                    onClick={() => handleViewChange('appointments')}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        currentSection === 'appointments' 
                            ? 'bg-[var(--primary-color)] text-white shadow-md transform scale-105' 
                            : 'bg-[var(--input-bg)] text-[var(--text-color)] hover:bg-[var(--primary-color)] hover:text-white hover:shadow-md hover:transform hover:scale-105'
                    }`}
                >
                    <IoCalendarOutline className="mr-2" />
                    Gestión de Citas
                </button>
                <button
                    onClick={onBookCallClick}
                    className="flex items-center px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg hover:transform hover:scale-105"
                >
                    <IoAddCircleOutline className="mr-2" />
                    Nueva Consulta
                </button>
            </div>
        </div>
    );

    // Vista detallada de consultas
    const renderConsultations = () => (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-[var(--text-color)]">Mis Consultas</h1>
                <p className="text-lg text-[var(--text-muted)] mt-2">Todas tus consultas y respuestas</p>
            </div>
            
            <NavigationBar currentSection="consultations" setCurrentView={setCurrentView} onBookCallClick={onBookCallClick} />
            
            {userConsultations.length === 0 ? (
                <Card className="text-center py-12">
                    <IoChatbubbleEllipsesOutline className="text-6xl text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[var(--text-color)] mb-2">No tienes consultas aún</h3>
                    <p className="text-[var(--text-muted)] mb-6">Agenda tu primera consulta gratuita para comenzar.</p>
                    <button onClick={onBookCallClick} className="btn-cta">
                        Agendar Primera Consulta
                    </button>
                </Card>
            ) : (
                <div className="space-y-6">
                    {userConsultations.map(consultation => (
                        <Card key={consultation.id} className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-[var(--text-color)] mb-2">
                                        {consultation.subject}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm text-[var(--text-muted)]">
                                        <span>{getPlanText(consultation.planType || 'free')}</span>
                                        <span>•</span>
                                        <span>Fecha: {consultation.date}</span>
                                        {consultation.createdAt && consultation.createdAt instanceof Date && (
                            <>
                                <span>•</span>
                                <span>Creada: {safeToDate(consultation.createdAt)?.toLocaleDateString('es-ES') || '—'}</span>
                            </>
                                        )}
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(consultation.status, false)}`}>
                                    {getConsultationStatusText(consultation.status)}
                                </span>
                            </div>
                            
                            <div className="border-l-4 border-blue-400 pl-4 mb-4">
                                <h4 className="font-medium text-[var(--text-color)] mb-2">Tu consulta:</h4>
                                <p className="text-[var(--text-color)] whitespace-pre-line">
                                    {consultation.message}
                                </p>
                            </div>
                            
                            {consultation.responseMessage && (
                                <div className="border-l-4 border-green-400 pl-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-r-lg">
                                    <div className="flex items-center mb-2">
                                        <IoSparklesOutline className="text-green-600 mr-2" />
                                        <h4 className="font-medium text-green-800 dark:text-green-200">Respuesta de Diego:</h4>
                                    </div>
                                    <p className="text-green-700 dark:text-green-300 whitespace-pre-line mb-3">
                                        {consultation.responseMessage}
                                    </p>
                                    {consultation.respondedAt && consultation.respondedAt instanceof Date && (
                                        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                                            <IoTimeOutline className="mr-1" />
                                            Respondida el: {safeToDate(consultation.respondedAt)?.toLocaleString('es-ES') || '—'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    // Vista detallada de citas
    const renderAppointments = () => (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-[var(--text-color)]">Mis Citas</h1>
                <p className="text-lg text-[var(--text-muted)] mt-2">Todas tus citas programadas y completadas</p>
            </div>
            
            <NavigationBar currentSection="appointments" setCurrentView={setCurrentView} onBookCallClick={onBookCallClick} />
            
            {userAppointments.length === 0 ? (
                <Card className="text-center py-12">
                    <IoCalendarOutline className="text-6xl text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[var(--text-color)] mb-2">No tienes citas programadas</h3>
                    <p className="text-[var(--text-muted)] mb-6">Las citas confirmadas aparecerán aquí.</p>
                    <button onClick={onBookCallClick} className="btn-cta">
                        Agendar Primera Cita
                    </button>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {userAppointments.map(appointment => (
                        <Card key={appointment.id} className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-[var(--text-color)] mb-2">
                                        {appointment.topic || getPlanText(appointment.planType)}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm text-[var(--text-muted)]">
                                        <span>{getPlanText(appointment.planType)}</span>
                                        <span>•</span>
                                        <span>{new Date(appointment.date).toLocaleDateString('es-ES')}</span>
                                        <span>•</span>
                                        <span>{appointment.time}</span>
                                        <span>•</span>
                                        <span>{appointment.duration} minutos</span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status, true)}`}>
                                    {getAppointmentStatusText(appointment.status)}
                                </span>
                            </div>
                            
                            {appointment.status === 'completed' && (
                                <div className="flex items-center text-green-600 mt-4">
                                    <IoCheckmarkCircleOutline className="mr-2" />
                                    <span className="text-sm font-medium">Sesión completada exitosamente</span>
                                </div>
                            )}
                            
                            {appointment.status === 'pending_payment' && (
                                <div className="flex items-center justify-between mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <div className="flex items-center text-orange-600">
                                        <IoCardOutline className="mr-2" />
                                        <span className="text-sm font-medium">Pendiente de pago</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setAppointments(prev => prev.map(apt => 
                                                apt.id === appointment.id 
                                                    ? { ...apt, status: 'paid_scheduled' as const }
                                                    : apt
                                            ));
                                        }}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Marcar como Pagada
                                    </button>
                                </div>
                            )}
                            
                            {appointment.status === 'paid_scheduled' && (
                                <div className="flex items-center text-blue-600 mt-4">
                                    <IoCheckmarkCircleOutline className="mr-2" />
                                    <span className="text-sm font-medium">Pago confirmado - Cita programada</span>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div>
            {currentView === 'overview' && renderOverview()}
            {currentView === 'consultations' && renderConsultations()}
            {currentView === 'appointments' && renderAppointments()}
        </div>
    );
};

const DashboardPage: React.FC<{onBookCallClick: () => void}> = ({onBookCallClick}) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) {
        return null; // Or a loading spinner
    }

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
    
    // For demo purposes, we can simulate an admin user.
    // In a real app, this would be based on custom claims in the JWT.
    const isAdmin = user.email === 'diegogalmarini@gmail.com';


    return (
        <div className="py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-[var(--text-color)]">Bienvenido, {user.displayName || user.email?.split('@')[0]}</h1>
                    <button onClick={handleLogout} className="flex items-center font-semibold text-red-400 hover:text-red-500 transition text-lg">
                        <IoLogOutOutline className="mr-2" />
                        Cerrar Sesión
                    </button>
                </div>
                
                {!user.emailVerified && !isAdmin && <VerificationNeeded />}

                {isAdmin ? <AdminDashboard onBookCallClick={onBookCallClick} /> : <UserDashboard onBookCallClick={onBookCallClick} />}
            </div>
        </div>
    );
};

export default DashboardPage;
