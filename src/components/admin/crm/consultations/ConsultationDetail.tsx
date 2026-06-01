// Componente para mostrar detalles completos de una consulta
// Incluye información del cliente, historial de comunicaciones, seguimientos y respuesta INLINE con IA
// Diseñado para actuar de manera idéntica desde cualquier sección del CRM

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowUturnLeftIcon as Reply,
  CheckCircleIcon,
  SparklesIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Consultation, CommunicationLog, FollowUp, MessageTemplate } from '../../../../types/crm';
import { useCommunicationLogs, useFollowUps, useConsultations } from '../../../../hooks/useCRM';
import Badge, { StatusBadge, PriorityBadge, PlanTypeBadge, PaymentStatusBadge } from '../ui/Badge';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';
import Modal from '../ui/Modal';

// Helper robusto para parsear fechas de Firestore y strings ISO sin lanzar RangeError
const safeParseDate = (dateVal: any): Date => {
  if (!dateVal) return new Date();
  
  let result: Date | null = null;
  
  if (dateVal instanceof Date) {
    result = dateVal;
  } else if (typeof dateVal === 'object') {
    if (typeof dateVal.toDate === 'function') {
      try {
        result = dateVal.toDate();
      } catch (e) {}
    } else if (dateVal.seconds !== undefined) {
      result = new Date(dateVal.seconds * 1000);
    } else if (dateVal._seconds !== undefined) {
      result = new Date(dateVal._seconds * 1000);
    }
  } else if (typeof dateVal === 'string') {
    if (!dateVal.trim()) return new Date();
    try {
      const parsed = parseISO(dateVal);
      if (!isNaN(parsed.getTime())) result = parsed;
    } catch (e) {}
    
    if (!result) {
      const nativeParsed = new Date(dateVal);
      if (!isNaN(nativeParsed.getTime())) result = nativeParsed;
    }
  }
  
  if (!result) {
    result = new Date(dateVal);
  }
  
  if (!result || isNaN(result.getTime())) {
    return new Date(); // Safe fallback
  }
  
  return result;
};

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

// Props del componente principal
interface ConsultationDetailProps {
  consultation: Consultation;
  onEdit?: () => void;
  onDelete?: () => void;
  onRespond?: () => void;
  onCreateFollowUp?: () => void;
  onUpdateStatus?: (id: string, status: string) => void;
  onUpdatePaymentStatus?: (id: string, paymentStatus: 'paid' | 'pending' | 'free') => void;
  onClose?: () => void;
  className?: string;
}

// Componente de Formulario de Respuesta Inline
interface InlineReplyFormProps {
  consultation: Consultation;
  onSuccess: () => void;
}

const InlineReplyForm: React.FC<InlineReplyFormProps> = ({ consultation, onSuccess }) => {
  const [type, setType] = useState<'email' | 'call' | 'note'>('email');
  const [subject, setSubject] = useState(`Re: ${consultation.subject || 'Sin asunto'}`);
  const [content, setContent] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);

  const { createLog } = useCommunicationLogs();
  const { updateConsultation } = useConsultations();

  useEffect(() => {
    setSubject(`Re: ${consultation.subject || 'Sin asunto'}`);
    setContent('');
    setTemplateId('');
    setError(null);
    setSuccess(false);
    setAiSuccess(false);
  }, [consultation.id]);

  // Aplicar plantilla seleccionada
  useEffect(() => {
    if (templateId) {
      const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
      if (template) {
        const variables = {
          clientName: consultation.clientName,
          subject: consultation.subject || 'Sin asunto',
          originalMessage: consultation.message
        };

        let sub = template.subject;
        let body = template.content;

        Object.entries(variables).forEach(([key, value]) => {
          const placeholder = `{${key}}`;
          sub = sub.replace(new RegExp(placeholder, 'g'), value || '');
          body = body.replace(new RegExp(placeholder, 'g'), value || '');
        });

        setSubject(sub);
        setContent(body);
      }
    }
  }, [templateId, consultation]);

  const handleAIResponseSuggestion = () => {
    setIsGeneratingAI(true);
    setError(null);
    setSuccess(false);
    setAiSuccess(false);

    setTimeout(() => {
      const query = (consultation.message || '').toLowerCase();
      const clientName = consultation.clientName || 'Fundador';
      
      let aiSubject = '';
      let aiBody = '';

      if (query.includes('ia') || query.includes('agente') || query.includes('llm') || query.includes('clon') || query.includes('inteligencia')) {
        aiSubject = 'Re: Consulta sobre integración de IA y Automatización Operativa';
        aiBody = `Hola ${clientName},\n\nQué gusto saludarte. He leído tu consulta acerca de la integración de inteligencia artificial y agentes autónomos.\n\nComo habrás visto en la conversación con mi clon digital, la implementación de modelos de lenguaje (LLMs) y arquitecturas avanzadas como RAG (para bases de conocimiento) o flujos automatizados de datos en servidores dedicados permite optimizar de forma drástica las operaciones cotidianas y reducir los costos de infraestructura.\n\nPara poder ofrecerte un mapa de ruta técnico adaptado a tu modelo de negocio, me encantaría coordinar una llamada estratégica de 30 minutos sin costo para auditar tu caso.\n\n¿Te vendría bien agendar una videollamada esta semana? Puedes revisar mi agenda de disponibilidad en cualquier momento.\n\nUn cordial saludo,\nDiego Galmarini\nFractional CTIO`;
      } else if (query.includes('arquitectura') || query.includes('software') || query.includes('escalar') || query.includes('serverless') || query.includes('desarrollo') || query.includes('código') || query.includes('monolito')) {
        aiSubject = 'Re: Consulta sobre Arquitectura de Software y Escalabilidad de Infraestructura';
        aiBody = `Hola ${clientName},\n\nGracias por escribirme. He analizado tu consulta sobre arquitectura de software y escalabilidad.\n\nDiseñar una infraestructura limpia y modular (ya sea Serverless o microservicios optimizados para contenedores) es un paso crucial para recortar costos de nube (a menudo hasta en un 40%) y evitar costosas y dolorosas refactorizaciones en fases de growth.\n\nMe gustaría realizar una auditoría rápida sin cargo de tu arquitectura actual o de la idea de tu MVP para darte una recomendación técnica sólida y precisa.\n\n¿Qué te parece si coordinamos una sesión de 30 minutos esta semana?\n\nUn abrazo,\nDiego Galmarini\nFractional CTIO`;
      } else if (query.includes('cto') || query.includes('ctio') || query.includes('fraccional') || query.includes('asesoría') || query.includes('consultoría') || query.includes('mentor') || query.includes('liderazgo')) {
        aiSubject = 'Re: Asesoría Estratégica de Liderazgo Tecnológico (CTIO Fraccional)';
        aiBody = `Hola ${clientName},\n\nUn placer saludarte. He leído con mucho interés tu consulta sobre mis servicios de CTIO Fraccional.\n\nEste modelo está diseñado precisamente para proporcionar liderazgo tecnológico estratégico de alto nivel (como definir stacks sostenibles, liderar auditorías DevOps, planificar la integración de IA o estructurar equipos de ingeniería de alto rendimiento) sin incurrir en el costo financiero de contratar un perfil ejecutivo a tiempo completo.\n\nCreo que lo ideal para tu caso es que tengamos una breve videollamada introductoria de 30 minutos para alinear metas y ver si puedo aportarte valor de forma inmediata.\n\n¿Tienes disponibilidad esta semana para reunirnos?\n\nSaludos cordiales,\nDiego Galmarini\nFractional CTIO`;
      } else if (query.includes('ads') || query.includes('analytics') || query.includes('console') || query.includes('marketing') || query.includes('lead') || query.includes('tracking') || query.includes('growth')) {
        aiSubject = 'Re: Optimización de Tracking Avanzado e Integración de Analytics/CRM';
        aiBody = `Hola ${clientName},\n\nQué tal. He revisado tu consulta sobre analítica, tracking de conversiones y Search Console.\n\nLa base absoluta de una buena estrategia de captación es contar con una infraestructura de tracking técnico de alta precisión. No solo se trata de configurar Google Ads y Analytics 4, sino de automatizar y sincronizar cada evento y conversión directamente con tu base de datos y tu CRM en tiempo real.\n\nPara profundizar en tu infraestructura de growth y asegurarnos de que estás midiendo tu ROI técnico al 100%, te propongo agendar una sesión Meet estratégica de 30 minutos.\n\n¿Coordinamos una videollamada para esta semana?\n\nUn saludo,\nDiego Galmarini\nFractional CTIO`;
      } else {
        aiSubject = 'Re: Asunto: Consulta Técnica sobre tu Proyecto';
        aiBody = `Hola ${clientName},\n\nUn gusto saludarte. He leído atentamente tu consulta técnica.\n\nEste tipo de desafíos técnicos en integraciones de sistemas, optimización de flujos de base de datos o automatización de procesos son precisamente los retos que me encanta auditar y resolver en mis sesiones estratégicas y mentorías bajo demanda.\n\nPara darte una respuesta 100% precisa y trazar la mejor estrategia para tu modelo de negocio, me gustaría invitarte a agendar una videollamada corta de 30 minutos.\n\n¿Tienes disponibilidad esta semana? Puedes revisar mis horarios disponibles en la agenda.\n\nUn cordial saludo,\nDiego Galmarini\nFractional CTIO`;
      }

      setSubject(aiSubject);
      setContent(aiBody);
      setIsGeneratingAI(false);
      setAiSuccess(true);
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('El mensaje no puede estar vacío');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setAiSuccess(false);

    try {
      const logData = {
        clientId: consultation.clientEmail,
        consultationId: consultation.id,
        type,
        direction: 'outbound' as const,
        subject,
        content,
        date: new Date().toISOString(),
        status: (type === 'email' ? 'sent' : 'delivered') as 'sent' | 'delivered',
        createdBy: 'Diego Galmarini'
      };

      await createLog(logData);

      let newStatus: Consultation['status'] = 'contacted';
      let newPaymentStatus = consultation.paymentStatus;

      if (consultation.planType === 'mail') {
        newStatus = 'completed';
        newPaymentStatus = 'free';
      }

      await updateConsultation(consultation.id, {
        status: newStatus,
        paymentStatus: newPaymentStatus,
        updatedAt: new Date().toISOString(),
        notes: consultation.notes ?
          `${consultation.notes}\n\n[${new Date().toLocaleString('es-ES')}] Respuesta inline: ${subject}` :
          `[${new Date().toLocaleString('es-ES')}] Respuesta inline: ${subject}`
      });

      setSuccess(true);
      setContent('');
      setTemplateId('');
      onSuccess();
    } catch (err) {
      console.error('Error in inline response:', err);
      setError('No se pudo enviar la respuesta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Responder directamente</h4>
          <button
            type="button"
            onClick={handleAIResponseSuggestion}
            disabled={isGeneratingAI}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-700 text-white text-[11px] font-extrabold rounded-xl shadow-md shadow-indigo-500/10 border-0 cursor-pointer transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50"
            title="Generar borrador de respuesta técnica usando tu clon digital"
          >
            <SparklesIcon className="h-4 w-4 mr-0.5 animate-pulse text-yellow-200" />
            {isGeneratingAI ? 'Redactando...' : 'Sugerencia Clon IA'}
          </button>
        </div>
        
        {/* Selector de Tipo y Plantilla */}
        <div className="flex flex-wrap items-center gap-2.5">
          {type === 'email' && (
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium cursor-pointer shadow-sm text-slate-700"
            >
              <option value="">Sin plantilla</option>
              {DEFAULT_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          <div className="flex bg-slate-100/80 rounded-xl p-0.5 border border-slate-200/50 shadow-inner">
            <button
              type="button"
              onClick={() => setType('email')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border-0 cursor-pointer transition-all ${type === 'email' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'}`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setType('call')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border-0 cursor-pointer transition-all ${type === 'call' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'}`}
            >
              Llamada
            </button>
            <button
              type="button"
              onClick={() => setType('note')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border-0 cursor-pointer transition-all ${type === 'note' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'}`}
            >
              Nota
            </button>
          </div>
        </div>
      </div>

      {error && <div className="text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-100 font-medium">{error}</div>}
      {success && <div className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100 font-bold">✓ ¡Respuesta enviada y registrada con éxito!</div>}
      {aiSuccess && <div className="text-xs text-indigo-700 bg-indigo-50 p-3 rounded-xl border border-indigo-100/50 font-semibold shadow-sm animate-fade-in-up">✨ Borrador autocompletado en voz de tu Clon Digital. ¡Revísalo antes de enviar!</div>}

      <div className="space-y-4 font-sans">
        {type !== 'call' && (
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Asunto del correo"
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/30 hover:bg-slate-50 font-semibold text-slate-800 transition-colors"
          />
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={type === 'email' ? 'Escribe tu correo aquí...' : type === 'call' ? 'Detalles de la llamada...' : 'Escribe una nota interna para ti...'}
          rows={6}
          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none bg-slate-50/30 hover:bg-slate-50 leading-relaxed font-semibold text-slate-700 transition-colors"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-500/10 border-0 cursor-pointer transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95"
          >
            {isSubmitting ? 'Procesando...' : type === 'email' ? 'Enviar Respuesta' : type === 'call' ? 'Registrar Llamada' : 'Guardar Nota'}
          </button>
        </div>
      </div>
    </form>
  );
};

// Componente para mostrar el historial de comunicaciones
interface CommunicationHistoryProps {
  logs: CommunicationLog[];
  loading: boolean;
  error: string | null;
  className?: string;
}

const CommunicationHistory: React.FC<CommunicationHistoryProps> = ({
  logs,
  loading,
  error,
  className = ''
}) => {
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [logs]);

  if (loading) {
    return (
      <div className={`flex justify-center py-4 ${className}`}>
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Error al cargar historial"
        message={error}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-3.5 ${className}`}>
      <h4 className="font-bold text-gray-400 mb-2 flex items-center text-xs uppercase tracking-wider">
        <ChatBubbleLeftRightIcon className="h-5 w-5 mr-1.5 text-gray-400" />
        Historial de Comunicaciones ({sortedLogs.length})
      </h4>

      {sortedLogs.length > 0 ? (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {sortedLogs.map((log, index) => {
            const logDate = safeParseDate(log.date);
            const isToday = format(logDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const isYesterday = format(logDate, 'yyyy-MM-dd') === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

            let dateLabel = '';
            if (isToday) {
              dateLabel = 'Hoy';
            } else if (isYesterday) {
              dateLabel = 'Ayer';
            } else {
              dateLabel = format(logDate, 'dd/MM/yyyy', { locale: es });
            }

            return (
              <div key={log.id} className="border border-gray-150 rounded-xl overflow-hidden bg-gray-50/30 hover:shadow-sm transition-shadow">
                {/* Header */}
                <div className="bg-gray-50/60 px-3.5 py-2.5 border-b border-gray-150 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">
                      {log.direction === 'inbound' ? 'Cliente' : 'Diego Galmarini'}
                    </span>
                    <Badge
                      variant={log.type === 'email' ? 'info' : log.type === 'call' ? 'success' : 'secondary'}
                      size="sm"
                    >
                      {log.type === 'email' ? 'Email' : log.type === 'call' ? 'Llamada' : 'Nota'}
                    </Badge>
                  </div>
                  <span className="text-gray-400 font-medium">
                    {dateLabel} a las {format(logDate, 'HH:mm')}
                  </span>
                </div>
                {/* Body */}
                <div className="p-3.5">
                  <h5 className="font-bold text-gray-900 text-sm mb-1">{log.subject}</h5>
                  <p className="text-xs text-gray-650 whitespace-pre-wrap leading-relaxed font-medium">{log.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400 bg-gray-50/40 rounded-xl border border-dashed border-gray-200">
          <ChatBubbleLeftRightIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-xs font-medium">No hay respuestas enviadas todavía.</p>
        </div>
      )}
    </div>
  );
};

// Componente para mostrar seguimientos
interface FollowUpListProps {
  consultationId: string;
  className?: string;
}

const FollowUpList: React.FC<FollowUpListProps> = ({
  consultationId,
  className = ''
}) => {
  const {
    followUps,
    loading,
    error,
    completeFollowUp
  } = useFollowUps();

  // Filtrar seguimientos específicos de esta consulta (Llamado arriba de retornos tempranos para evitar React error #300)
  const currentFollowUps = useMemo(() => {
    return (followUps || []).filter(f => f.consultationId === consultationId);
  }, [followUps, consultationId]);

  if (loading) {
    return (
      <div className={`flex justify-center py-4 ${className}`}>
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Error al cargar seguimientos"
        message={error}
        className={className}
      />
    );
  }

  if (!currentFollowUps.length) {
    return (
      <p className="text-xs text-gray-400 italic">No hay tareas de seguimiento programadas.</p>
    );
  }

  return (
    <div className={`space-y-2.5 max-h-[220px] overflow-y-auto pr-1 ${className}`}>
      {currentFollowUps.map((followUp) => {
        const isOverdue = new Date(followUp.dueDate) < new Date() && followUp.status !== 'completed';

        return (
          <div
            key={followUp.id}
            className={`border rounded-xl p-3 text-xs bg-white ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-150'}`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-800">{followUp.title}</span>
                {isOverdue && <ExclamationTriangleIcon className="h-3.5 w-3.5 text-red-500" />}
              </div>

              <div className="flex items-center gap-1">
                {followUp.status !== 'completed' && (
                  <button
                    onClick={() => completeFollowUp(followUp.id)}
                    className="p-0.5 hover:bg-green-50 rounded-full transition-colors text-gray-450 hover:text-green-600 bg-transparent border-0 cursor-pointer"
                    title="Completar tarea"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                  </button>
                )}
                <StatusBadge status={followUp.status} />
              </div>
            </div>

            <p className="text-gray-600 mb-2 leading-relaxed font-medium">{followUp.description}</p>

            <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold pt-1.5 border-t border-gray-100">
              <span>
                Vence: {followUp.dueDate ? format(safeParseDate(followUp.dueDate), 'dd MMM yyyy', { locale: es }) : 'Sin fecha'}
              </span>
              {followUp.completedAt && (
                <span className="text-green-600">
                  Completada
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Componente principal
export const ConsultationDetail: React.FC<ConsultationDetailProps> = ({
  consultation,
  onEdit,
  onDelete,
  onRespond,
  onCreateFollowUp,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onClose,
  className = ''
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { updateConsultation } = useConsultations();

  // Hook para logs de comunicación
  const { logs: communicationLogs, loading: logsLoading, error: logsError, loadLogs } = useCommunicationLogs(undefined, consultation.id);

  // Calcular tiempo transcurrido desde la creación
  const timeElapsed = useMemo(() => {
    if (!consultation.createdAt) return 'Sin fecha';
    const created = safeParseDate(consultation.createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  }, [consultation.createdAt]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteModal(false);
  }, [onDelete]);

  // Manejar cambio de estado de la consulta
  const handleStatusChange = useCallback((newStatus: string) => {
    if (onUpdateStatus && consultation.id) {
      onUpdateStatus(consultation.id, newStatus);
    }
  }, [onUpdateStatus, consultation.id]);

  // Manejar cambio manual del estado de pago
  const handlePaymentStatusChange = useCallback(async (newPaymentStatus: 'paid' | 'pending' | 'free') => {
    if (!consultation.id) return;
    try {
      if (onUpdatePaymentStatus) {
        onUpdatePaymentStatus(consultation.id, newPaymentStatus);
      } else {
        await updateConsultation(consultation.id, { 
          paymentStatus: newPaymentStatus,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error al actualizar el estado de pago:', err);
    }
  }, [onUpdatePaymentStatus, consultation.id, updateConsultation]);

  // Obtener visualización del precio
  const getPriceDisplay = () => {
    if (consultation.customPrice !== undefined && consultation.customPrice !== null) {
      return `${consultation.customPrice}€`;
    }
    switch (consultation.planType) {
      case '30min':
        return '150€';
      case '60min':
        return '250€';
      case 'mail':
        return '0€ (Gratuito)';
      default:
        return 'Consultar';
    }
  };

  // Determinar qué botones de estado mostrar
  const canConfirm = consultation.status === 'pending';
  const canComplete = ['pending', 'contacted', 'scheduled'].includes(consultation.status);

  // Obtener iniciales para el avatar premium
  const clientInitials = useMemo(() => {
    if (!consultation.clientName) return 'U';
    return consultation.clientName
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [consultation.clientName]);

  return (
    <div className={`bg-white border border-slate-150/85 shadow-2xl shadow-slate-900/15 rounded-3xl overflow-hidden font-sans ${className} max-h-[92vh] flex flex-col`}>
      {/* Header / Barra de Acciones con diseño premium */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-50 to-slate-100/50 shrink-0">
        <div className="flex items-start space-x-3.5 flex-1 min-w-0">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shrink-0 shadow-md shadow-blue-500/10">
            <EnvelopeIcon className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                Consulta Técnica
              </span>
              <span className="text-[10px] font-semibold text-gray-400 font-mono bg-gray-50 border border-gray-200/50 px-2 py-0.5 rounded-md">
                ID: {consultation.id}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 leading-snug break-words mt-1" title={consultation.subject}>
              {consultation.subject || 'Consulta sin asunto'}
            </h2>
            <div className="flex items-center text-[11px] text-gray-500 mt-1.5 font-medium">
              <ClockIcon className="h-3.5 w-3.5 mr-1 text-gray-400 shrink-0" />
              Recibida {timeElapsed}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          {canConfirm && (
            <Button
              variant="success"
              size="sm"
              onClick={() => handleStatusChange('confirmed')}
              className="shadow-sm shadow-emerald-500/10 font-bold text-xs px-3.5 py-2 cursor-pointer transition-all hover:scale-[1.03]"
            >
              <CheckCircleIcon className="h-4 w-4 mr-1.5" />
              Confirmar Cita
            </Button>
          )}

          {canComplete && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStatusChange('completed')}
              className="shadow-sm shadow-blue-500/10 font-bold text-xs px-3.5 py-2 cursor-pointer transition-all hover:scale-[1.03]"
            >
              <CheckCircleIcon className="h-4 w-4 mr-1.5" />
              Completar Gestión
            </Button>
          )}

          <div className="h-6 w-px bg-slate-200 mx-1.5 hidden md:block"></div>

          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              title="Editar consulta"
              className="p-2 border-gray-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteClick}
              title="Eliminar consulta"
              className="p-2 cursor-pointer animate-fade-in"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}

          {onClose && (
            <>
              <div className="h-6 w-px bg-slate-200 mx-1.5 hidden md:block"></div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-all border-0 bg-transparent cursor-pointer ml-0.5"
                title="Cerrar modal"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid Principal con Scroll Interno Unificado */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Información de Cliente, Plan/Pago, Horarios y Tareas (5/12 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Cabecera de Estados con badges premium */}
            <div className="flex items-center gap-2">
              <StatusBadge status={consultation.status} className="px-3 py-1 font-bold text-[11px]" />
              <PriorityBadge priority={consultation.priority} className="px-3 py-1 font-bold text-[11px]" />
            </div>

            {/* 1. Tarjeta Premium de Cliente */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3.5">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20 shrink-0">
                  {clientInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Información del Cliente</h4>
                  <p className="text-base font-bold text-slate-800 mt-0.5 truncate">{consultation.clientName}</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-center text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors break-all">
                  <EnvelopeIcon className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                  {consultation.clientEmail}
                </div>
                {consultation.clientPhone && (
                  <div className="flex items-center text-xs font-medium text-slate-600 break-all">
                    <PhoneIcon className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                    {consultation.clientPhone}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Tarjeta Detalle de Plan e Integración de Pago (Novedad Crítica) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-50">
                <div className="flex items-center space-x-2">
                  <CreditCardIcon className="h-5 w-5 text-indigo-500" />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detalles del Plan y Pago</h4>
                </div>
                <PlanTypeBadge planType={consultation.planType} className="font-bold text-[10px]" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold py-1">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Precio de Lista</span>
                  <span className="text-slate-800 text-sm font-extrabold">{getPriceDisplay()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Estado de Pago</span>
                  <PaymentStatusBadge paymentStatus={consultation.paymentStatus} className="mt-0.5 font-bold text-[10px]" />
                </div>
              </div>

              {/* Botones de acción manual del Pago */}
              {consultation.planType !== 'mail' && (
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  {consultation.paymentStatus !== 'paid' ? (
                    <button
                      type="button"
                      onClick={() => handlePaymentStatusChange('paid')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-xs font-bold rounded-xl shadow-sm border-0 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                      title="Marcar manualmente esta consulta como pagada"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Marcar como Pagado
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePaymentStatusChange('pending')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                      title="Revertir el estado a Pendiente de pago"
                    >
                      <Reply className="h-4 w-4 rotate-180" />
                      Marcar como Pendiente
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3. Tarjeta de Horarios */}
            {consultation.planType !== 'mail' && (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-1.5 text-indigo-500" />
                  Preferencia de Horario
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Fecha Solicitada</span>
                    <span className="text-slate-800 text-xs font-bold block truncate">
                      {consultation.startTime ? format(safeParseDate(consultation.startTime), 'dd MMM yyyy', { locale: es }) : 'No especificada'}
                    </span>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Hora</span>
                    <span className="text-slate-800 text-xs font-bold block">
                      {consultation.startTime ? format(safeParseDate(consultation.startTime), 'HH:mm', { locale: es }) : 'No especificada'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Tarjeta del Mensaje del Cliente (Mejorado para Lectura) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3.5 hover:shadow-md transition-shadow">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mensaje del cliente</h4>
              <div className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50/40 to-indigo-50/10 p-4 rounded-r-xl">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                  "{consultation.message}"
                </p>
              </div>
            </div>

            {/* 5. Notas Internas Administrativas */}
            {consultation.notes && consultation.notes.trim() !== consultation.message?.trim() && (
              <div className="bg-amber-50/30 rounded-2xl p-5 border border-amber-100/50 shadow-sm space-y-2 hover:shadow-md transition-shadow">
                <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-1.5 text-amber-500" />
                  Notas Internas
                </h4>
                <p className="text-xs text-amber-800 whitespace-pre-wrap leading-relaxed font-semibold">
                  {consultation.notes}
                </p>
              </div>
            )}

            {/* 6. Tareas de Seguimiento */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tareas de Seguimiento</h4>
                <button
                  type="button"
                  onClick={onCreateFollowUp}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer hover:underline transition-colors"
                >
                  + Agregar
                </button>
              </div>
              <FollowUpList consultationId={consultation.id} />
            </div>

          </div>

          {/* Columna Derecha: Historial de Comunicaciones e Hilo de Respuestas (7/12 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow space-y-8">
            
            {/* Historial de Respuestas */}
            <CommunicationHistory
              logs={communicationLogs}
              loading={logsLoading}
              error={logsError}
            />

            {/* Formulario de Respuesta Inline */}
            <InlineReplyForm
              consultation={consultation}
              onSuccess={async () => {
                await loadLogs();
                if (onRespond) {
                  onRespond();
                }
              }}
            />

          </div>

        </div>
      </div>

      {/* Modal de Eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 font-medium" />
            <p className="text-gray-600 text-sm">
              ¿Estás seguro de que deseas eliminar esta consulta? Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              <strong>Consulta:</strong> {consultation.subject || 'Sin asunto'}
            </p>
            <p className="text-sm text-red-700">
              <strong>Cliente:</strong> {consultation.clientName} ({consultation.clientEmail})
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteConfirm}
            >
              Eliminar consulta
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConsultationDetail;