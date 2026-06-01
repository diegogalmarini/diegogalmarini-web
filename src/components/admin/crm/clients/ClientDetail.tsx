// Componente de detalle del cliente mejorado con historial completo
import React, { useState, useEffect } from 'react';
import type { Client, Consultation, Appointment, Payment, ClientHistory } from '../../../../types/crm';
import { useConsultations, useAppointments, useCommunicationLogs } from '../../../../hooks/useCRM';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { formatDate, formatDateTime } from '../../../../utils/dateUtils';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ClientDetailProps {
  client: Client;
  onEdit: () => void;
  onClose: () => void;
  onConsultationSelect?: (consultation: Consultation) => void;
  className?: string;
}

// Componente de formulario de respuesta inline
interface InlineReplyFormProps {
  consultation: Consultation;
  onSuccess: () => void;
}

const InlineReplyForm: React.FC<InlineReplyFormProps> = ({ consultation, onSuccess }) => {
  const [type, setType] = useState<'email' | 'call' | 'note'>('email');
  const [subject, setSubject] = useState(`Re: ${consultation.subject || 'Sin asunto'}`);
  const [content, setContent] = useState('');
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
    setError(null);
    setSuccess(false);
    setAiSuccess(false);
  }, [consultation]);

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
      onSuccess();
    } catch (err) {
      console.error('Error in inline response:', err);
      setError('No se pudo enviar la respuesta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-150 pt-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Responder directamente</h4>
          <button
            type="button"
            onClick={handleAIResponseSuggestion}
            disabled={isGeneratingAI}
            className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[10px] font-bold rounded-lg shadow-sm border-0 cursor-pointer transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50"
            title="Generar borrador de respuesta técnica usando tu clon digital"
          >
            <SparklesIcon className="h-3 w-3" />
            {isGeneratingAI ? 'Generando...' : 'Sugerencia Clon IA'}
          </button>
        </div>
        
        {/* Selector de Tipo */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setType('email')}
            className={`px-3 py-1 text-xs font-semibold rounded-md border-0 cursor-pointer transition-colors ${type === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 bg-transparent'}`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setType('call')}
            className={`px-3 py-1 text-xs font-semibold rounded-md border-0 cursor-pointer transition-colors ${type === 'call' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 bg-transparent'}`}
          >
            Llamada
          </button>
          <button
            type="button"
            onClick={() => setType('note')}
            className={`px-3 py-1 text-xs font-semibold rounded-md border-0 cursor-pointer transition-colors ${type === 'note' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 bg-transparent'}`}
          >
            Nota
          </button>
        </div>
      </div>

      {error && <div className="text-xs text-red-655 bg-red-50 p-2.5 rounded-xl border border-red-100">{error}</div>}
      {success && <div className="text-xs text-green-655 bg-green-50 p-2.5 rounded-xl border border-green-100">✓ ¡Respuesta enviada y registrada con éxito!</div>}
      {aiSuccess && <div className="text-xs text-blue-650 bg-blue-50 p-2.5 rounded-xl border border-blue-100">✨ Borrador autocompletado en voz de tu Clon Digital. ¡Revísalo antes de enviar!</div>}

      <div className="space-y-3.5">
        {type !== 'call' && (
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Asunto"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-gray-50"
          />
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={type === 'email' ? 'Escribe tu email aquí...' : type === 'call' ? 'Detalles de la llamada...' : 'Escribe una nota interna...'}
          rows={5}
          className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none bg-gray-50/50 hover:bg-gray-50"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50 transition-colors border-0 cursor-pointer inline-flex items-center gap-1.5"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            {isSubmitting ? 'Enviando...' : type === 'email' ? 'Enviar Email' : type === 'call' ? 'Registrar Llamada' : 'Guardar Nota'}
          </button>
        </div>
      </div>
    </form>
  );
};

const ClientDetail: React.FC<ClientDetailProps> = ({ client, onEdit, onClose, onConsultationSelect, className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'consultations' | 'appointments' | 'payments' | 'history'>('overview');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  // Obtener datos relacionados del cliente
  const { consultations } = useConsultations({
    clientEmail: client.email
  });

  const { logs: communicationLogs, loading: logsLoading, loadLogs } = useCommunicationLogs(
    undefined,
    selectedConsultation?.id || undefined
  );

  const { appointments } = useAppointments({
    initialFilters: { clientId: client.id }
  });

  // Simular pagos (en una implementación real vendrían de un hook)
  const payments: Payment[] = [];

  // Generar historial del cliente
  const clientHistory: ClientHistory[] = [
    ...consultations.map(c => ({
      id: c.id,
      clientId: client.id,
      type: 'consultation' as const,
      title: c.subject,
      description: c.message,
      date: c.createdAt,
      status: c.status
    })),
    ...appointments.map(a => ({
      id: a.id,
      clientId: client.id,
      type: 'appointment' as const,
      title: a.planType || 'Cita programada',
      description: `Cita ${a.planType} - ${a.duration}min`,
      date: a.date,
      status: a.status
    })),
    ...payments.map(p => ({
      id: p.id,
      clientId: client.id,
      type: 'payment' as const,
      title: p.description,
      description: `$${p.amount} ${p.currency}`,
      date: p.createdAt,
      status: p.status
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: UserIcon },
    { id: 'consultations', label: 'Consultas', icon: DocumentTextIcon },
    { id: 'appointments', label: 'Citas', icon: CalendarIcon },
    { id: 'payments', label: 'Pagos', icon: CreditCardIcon },
    { id: 'history', label: 'Historial', icon: ClockIcon }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'consultation': return DocumentTextIcon;
      case 'appointment': return CalendarIcon;
      case 'payment': return CreditCardIcon;
      default: return ClockIcon;
    }
  };

  const getHistoryColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'text-blue-500';
      case 'appointment': return 'text-green-500';
      case 'payment': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`bg-white border border-slate-150/85 shadow-2xl shadow-slate-900/15 rounded-3xl overflow-hidden font-sans ${className} max-h-[92vh] flex flex-col`}>
      {/* Header del cliente con diseño unificado premium */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-50 to-slate-100/50 shrink-0">
        <div className="flex items-center space-x-3.5 flex-1 min-w-0">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20 shrink-0">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                Ficha de Cliente
              </span>
              <span className="text-[10px] font-semibold text-gray-400 font-mono bg-gray-50 border border-gray-200/50 px-2 py-0.5 rounded-md">
                ID: {client.id}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 leading-snug break-words mt-1">
              {client.name}
            </h2>
            <div className="flex items-center text-[11px] text-gray-500 mt-1 font-medium truncate">
              <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400 shrink-0" />
              {client.email}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="font-bold text-xs px-3.5 py-2 hover:bg-slate-50 text-slate-600 border-gray-200 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Editar Ficha
          </Button>
          
          {onClose && (
            <>
              <div className="h-6 w-px bg-slate-200 mx-1.5 hidden md:block"></div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-200/60 rounded-full transition-all border-0 bg-transparent cursor-pointer ml-0.5"
                title="Cerrar modal"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Contenido con scroll independiente */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">

      {/* Navegación por pestañas */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Información básica */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">Nombre completo</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{client.email}</p>
                      <p className="text-sm text-gray-500">Email</p>
                    </div>
                  </div>
                  {client.phone && (
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{client.phone}</p>
                        <p className="text-sm text-gray-500">Teléfono</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Estado</p>
                    <Badge className={getStatusColor(client.status)}>
                      {client.status === 'active' ? 'Activo' :
                        client.status === 'inactive' ? 'Inactivo' : 'Prospecto'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Fecha de registro</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(client.registrationDate)}
                    </p>
                  </div>
                  {client.lastContactDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Último contacto</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(client.lastContactDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{consultations.length}</div>
                <div className="text-sm text-gray-600">Total Consultas</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-green-600">{appointments.length}</div>
                <div className="text-sm text-gray-600">Total Citas</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {consultations.filter(c => c.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Consultas Pendientes</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {payments.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Pagos Completados</div>
              </div>
            </div>

            {/* Etiquetas */}
            {client.tags && client.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag, index) => (
                    <Badge key={index} className="bg-gray-100 text-gray-800">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notas */}
            {client.notes && !consultations.some(c => c.message?.trim() === client.notes?.trim()) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notas</h3>
                <p className="text-gray-700">{client.notes}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'consultations' && (
          selectedConsultation ? (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              {/* Header / Botón volver */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <button
                  onClick={() => setSelectedConsultation(null)}
                  className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 bg-transparent border-0 cursor-pointer hover:underline gap-1"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Volver al listado
                </button>
                <Badge className={getStatusColor(selectedConsultation.status)}>
                  {selectedConsultation.status === 'pending' ? 'Pendiente' :
                    selectedConsultation.status === 'contacted' ? 'Contactado' :
                      selectedConsultation.status === 'scheduled' ? 'Programada' :
                        selectedConsultation.status === 'completed' ? 'Completada' : 'Cancelada'}
                </Badge>
              </div>

              {/* Asunto y Plan */}
              <div>
                <h3 className="text-lg font-bold text-gray-950 leading-tight">
                  {selectedConsultation.subject || 'Consulta sin asunto'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Plan: <span className="font-semibold text-blue-600 uppercase">{selectedConsultation.planType}</span> • Recibida el {formatDate(selectedConsultation.createdAt)}
                </p>
              </div>

              {/* Mensaje Original */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mensaje del cliente</h4>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedConsultation.message}</p>
              </div>

              {/* Historial de Respuestas / Comunicaciones */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Historial de respuestas</h4>
                {logsLoading ? (
                  <div className="flex items-center py-4 gap-2 text-sm text-gray-500">
                    <LoadingSpinner size="sm" />
                    Cargando respuestas...
                  </div>
                ) : communicationLogs && communicationLogs.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {communicationLogs.map((log) => (
                      <div key={log.id} className="border border-gray-150 rounded-xl p-3.5 bg-gray-50/50">
                        <div className="flex items-center justify-between text-[11px] text-gray-455 mb-1.5">
                          <span className="font-bold text-gray-700">
                            {log.direction === 'inbound' ? 'Cliente' : 'Diego Galmarini'}
                          </span>
                          <span>{formatDateTime(log.date)}</span>
                        </div>
                        <p className="text-sm text-gray-800 font-semibold mb-1">{log.subject}</p>
                        <p className="text-sm text-gray-650 whitespace-pre-wrap font-medium">{log.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No hay respuestas enviadas todavía.</p>
                )}
              </div>

              {/* Formulario de Respuesta Inline */}
              <InlineReplyForm
                consultation={selectedConsultation}
                onSuccess={() => {
                  loadLogs();
                  setSelectedConsultation(prev => prev ? {
                    ...prev,
                    status: selectedConsultation.planType === 'mail' ? 'completed' : 'contacted'
                  } : null);
                }}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Consultas del Cliente</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Consulta
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consultations.map((consultation) => (
                      <tr
                        key={consultation.id}
                        onClick={() => setSelectedConsultation(consultation)}
                        className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                        title="Haz clic para ver y responder esta consulta"
                      >
                        <td className="px-6 py-4 min-w-[240px] max-w-sm">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-950 truncate" title={consultation.subject}>
                              {consultation.subject}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5" title={consultation.message}>
                              {consultation.message}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-blue-100 text-blue-800">
                            {consultation.planType}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(consultation.status)}>
                            {consultation.status === 'pending' ? 'Pendiente' :
                              consultation.status === 'contacted' ? 'Contactado' :
                                consultation.status === 'scheduled' ? 'Programada' :
                                  consultation.status === 'completed' ? 'Completada' : 'Cancelada'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(consultation.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedConsultation(consultation);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold bg-transparent border-0 cursor-pointer inline-flex items-center gap-1 hover:underline"
                          >
                            <EyeIcon className="h-4 w-4" />
                            Responder
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {consultations.length === 0 && (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay consultas registradas</p>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Citas del Cliente</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duración
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(appointment.date)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.startTime} - {appointment.endTime}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="bg-blue-100 text-blue-800">
                          {appointment.planType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status === 'scheduled' ? 'Programada' :
                            appointment.status === 'confirmed' ? 'Confirmada' :
                              appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {appointments.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay citas programadas</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Historial de Pagos</h3>
            </div>
            <div className="p-6 text-center">
              <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">El sistema de pagos estará disponible próximamente</p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Historial Completo</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {clientHistory.map((item) => {
                const Icon = getHistoryIcon(item.type);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.type === 'consultation') {
                        const consultationObj = consultations.find(c => c.id === item.id);
                        if (consultationObj) {
                          setActiveTab('consultations');
                          setSelectedConsultation(consultationObj);
                        }
                      }
                    }}
                    className={`p-6 ${item.type === 'consultation' ? 'cursor-pointer hover:bg-blue-50/20 transition-colors' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Icon className={`h-6 w-6 ${getHistoryColor(item.type)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {item.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDateTime(item.date)}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-650 font-medium">
                          {item.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge className="bg-gray-100 text-gray-800">
                            {item.type === 'consultation' ? 'Consulta' :
                              item.type === 'appointment' ? 'Cita' :
                                item.type === 'payment' ? 'Pago' : 'Nota'}
                          </Badge>
                          {item.type === 'consultation' && (
                            <span className="text-xs text-blue-600 font-semibold hover:underline">Ver y responder</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {clientHistory.length === 0 && (
                <div className="text-center py-12">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay historial disponible</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default ClientDetail;