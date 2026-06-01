import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { trackEvent } from '../utils/analytics';
import { usePlans } from '../contexts/PlansContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  IoCalendarOutline,
  IoClose,
  IoChevronBack,
  IoChevronForward,
  IoPersonOutline,
  IoMailOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPlanId?: string;
  prefilledNotes?: string;
}

const SimpleBookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, preselectedPlanId, prefilledNotes }) => {
  const { plans } = usePlans();
  const { language } = useLanguage();
  const [step, setStep] = useState(1); // 1: Calendario, 2: Detalles
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentPlanId, setCurrentPlanId] = useState<string>('express');
  const [createdConsultationId, setCreatedConsultationId] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  const expressPlan = React.useMemo(() => plans.find(p => p.id === 'express'), [plans]);
  const completePlan = React.useMemo(() => plans.find(p => p.id === 'complete'), [plans]);

  // Encontrar el plan seleccionado, por defecto usar 'express'
  const activePlan = React.useMemo(() => {
    return plans.find(p => p.id === currentPlanId) || plans.find(p => p.id === 'express') || plans[0];
  }, [plans, currentPlanId]);

  // Manejar el éxito del pago desde el SDK de Lemon Squeezy
  const handlePaymentSuccess = async (consultationId: string | null) => {
    const idToUpdate = consultationId || createdConsultationId;
    if (!idToUpdate) {
      console.log('⚠️ No hay ID de consulta creado para actualizar pago automáticamente');
      return;
    }
    try {
      console.log('🍋 Actualizando automáticamente el pago en Firestore para ID:', idToUpdate);
      const { doc, updateDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const consultationRef = doc(db, 'consultations', idToUpdate);
      await updateDoc(consultationRef, {
        paymentStatus: 'paid',
        status: 'confirmed', // Confirmar la cita automáticamente al pagar
        updatedAt: Timestamp.fromDate(new Date())
      });
      setIsPaid(true);
      console.log('✅ Consulta marcada automáticamente como Pagada y Confirmada');
    } catch (err) {
      console.error('❌ Error al actualizar el estado de pago automáticamente:', err);
    }
  };

  // Cargar SDK de Lemon Squeezy dinámicamente
  useEffect(() => {
    if (isOpen) {
      setIsPaid(false);
      // Asegurarse de que el script de Lemon Squeezy esté en el documento
      if (!document.getElementById('lemonsqueezy-sdk')) {
        const script = document.createElement('script');
        script.id = 'lemonsqueezy-sdk';
        script.src = 'https://assets.lemonsqueezy.com/lemon.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log('🍋 Lemon Squeezy SDK cargado e inicializando callbacks...');
          if ((window as any).LemonSqueezy) {
            (window as any).LemonSqueezy.Setup({
              eventHandler: (event: any) => {
                console.log('🍋 Lemon Squeezy Evento Recibido:', event);
                if (event.event === 'Checkout.Success') {
                  console.log('🍋 Checkout exitoso detectado!');
                  const storedId = window.localStorage.getItem('last_consultation_id');
                  handlePaymentSuccess(storedId);
                }
              }
            });
          }
        };
        document.body.appendChild(script);
      } else {
        console.log('🍋 Lemon Squeezy SDK ya estaba presente, reinicializando callbacks...');
        if ((window as any).LemonSqueezy) {
          (window as any).LemonSqueezy.Setup({
            eventHandler: (event: any) => {
              console.log('🍋 Lemon Squeezy Evento Recibido (existente):', event);
              if (event.event === 'Checkout.Success') {
                console.log('🍋 Checkout exitoso detectado!');
                const storedId = window.localStorage.getItem('last_consultation_id');
                handlePaymentSuccess(storedId);
              }
            }
          });
        }
      }
    }
  }, [isOpen]);

  // Sincronizar el plan preseleccionado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      if (preselectedPlanId) {
        setCurrentPlanId(preselectedPlanId);
      } else {
        setCurrentPlanId('express');
      }
      trackEvent('begin_checkout', {
        item_id: preselectedPlanId || 'express',
        item_name: preselectedPlanId === 'free' ? 'Consulta Gratis (Email)' : (preselectedPlanId === 'complete' ? 'Sesión de 60 minutos' : 'Sesión de 30 minutos'),
        currency: 'EUR'
      });
    }
  }, [preselectedPlanId, isOpen]);

  // Si el plan es gratuito, saltarse el calendario directamente al paso de los detalles
  useEffect(() => {
    if (currentPlanId === 'free') {
      setStep(2);
      setSelectedDate(null);
      setSelectedTime(null);
    } else if (step === 2 && currentPlanId !== 'free' && (!selectedDate || !selectedTime)) {
      setStep(1);
    }
  }, [currentPlanId]);

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    notas: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Horarios disponibles (12 slots para 2 filas de 6 columnas)
  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  // Reset al abrir/cerrar
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedDate(null);
      setSelectedTime(null);
      setFormData({ nombre: '', email: '', notas: '' });
      setError('');
      setSuccess(false);
      setCreatedConsultationId(null);
      setIsPaid(false);
      setCurrentPlanId('express');
    } else if (prefilledNotes) {
      setFormData(prev => ({ ...prev, notas: prefilledNotes }));
    }
  }, [isOpen, prefilledNotes]);

  if (!isOpen) return null;

  // Utilidades de calendario
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today && date.getDay() !== 0 && date.getDay() !== 6; // No domingos ni sábados
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Días del mes anterior para completar la primera semana
    const prevMonth = new Date(year, month - 1, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);

      days.push(
        <button
          key={`prev-${day}`}
          onClick={() => setSelectedDate(date)}
          className="h-9 w-9 mx-auto rounded-xl text-sm font-medium transition-all duration-200 text-gray-400 dark:text-gray-600 cursor-not-allowed flex items-center justify-center opacity-40"
          disabled
        >
          {day}
        </button>
      );
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isAvailable = isDateAvailable(date);
      const isSelected = selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => isAvailable && setSelectedDate(date)}
          className={`
            h-9 w-9 mx-auto rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center
            ${isSelected
              ? 'bg-[var(--primary-color)] text-white shadow-md scale-105'
              : isAvailable
                ? 'text-[var(--primary-color)] hover:bg-blue-50/80 dark:hover:bg-blue-900/20 font-bold hover:scale-105'
                : 'text-gray-900 dark:text-gray-400 opacity-30 cursor-not-allowed'
            }
          `}
          disabled={!isAvailable}
        >
          {day}
        </button>
      );
    }

    // Días del mes siguiente para completar el calendario
    const remainingCells = 42 - days.length; // 6 filas × 7 días
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);

      days.push(
        <button
          key={`next-${day}`}
          onClick={() => setSelectedDate(date)}
          className="h-9 w-9 mx-auto rounded-xl text-sm font-medium transition-all duration-200 text-gray-400 dark:text-gray-600 cursor-not-allowed flex items-center justify-center opacity-40"
          disabled
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinueToDetails = () => {
    if (selectedDate && selectedTime) {
      setStep(2);
    }
  };

  const handleBackToCalendar = () => {
    setStep(1);
  };

  const MIN_CHARS = 200;
  const MAX_CHARS = 2000;

  const getCharacterCountColor = () => {
    const length = formData.notas.length;
    if (length === 0) return 'text-gray-400';
    if (length < MIN_CHARS) return 'text-red-500';
    return 'text-gray-400';
  };

  const getCharacterCountText = () => {
    const length = formData.notas.length;
    if (length < MIN_CHARS) {
      return language === 'en'
        ? `${MIN_CHARS - length} more characters required`
        : `Faltan ${MIN_CHARS - length} caracteres`;
    }
    return `${length} / ${MAX_CHARS}`;
  };

  const isNotesValid = () => {
    const length = formData.notas.length;
    return length >= MIN_CHARS && length <= MAX_CHARS;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isNotesValid()) {
      setError(language === 'en'
        ? `Please write between ${MIN_CHARS} and ${MAX_CHARS} characters about your project.`
        : `Por favor, escribe entre ${MIN_CHARS} y ${MAX_CHARS} caracteres sobre tu proyecto.`);
      return;
    }

    setIsLoading(true);

    try {
      // 1) Crear documento en Firestore para disparar el correo (Cloud Function)
      const db = getFirestore(app);
      const isFree = currentPlanId === 'free';
      const [h, m] = isFree ? [0, 0] : (selectedTime || '00:00').split(':').map(Number);
      const start = (selectedDate && !isFree) ? new Date(selectedDate) : new Date();
      if (!isFree) {
        start.setHours(h || 0, m || 0, 0, 0);
      }

      // Calcular hora de fin (duración del plan o 30 min por defecto)
      const durationMinutes = activePlan?.duration || 30;
      const end = new Date(start.getTime() + (durationMinutes > 0 ? durationMinutes : 30) * 60 * 1000);

      const docRef = await addDoc(collection(db, 'consultations'), {
        // Campos que espera el CRM
        clientName: formData.nombre,
        clientEmail: formData.email,
        subject: activePlan ? `${isFree ? 'Consulta por Email' : 'Sesión Estratégica'}: ${activePlan.name}` : 'Sesión Estratégica de Innovación',
        message: formData.notas || '',
        services: [activePlan ? activePlan.name : 'Sesión Estratégica de Innovación'],
        priority: 'medium' as const,
        planType: isFree ? 'mail' : (activePlan?.id === 'express' ? '30min' : activePlan?.id === 'complete' ? '60min' : 'custom') as any,
        paymentStatus: isFree ? 'free' : 'pending' as any,
        status: 'pending' as const,
        source: 'website' as const,

        // Campos adicionales para el email (compatibilidad con Cloud Function)
        userName: formData.nombre,
        userEmail: formData.email,
        notes: '', // Notas internas en blanco para el CRM (para evitar duplicaciones)
        preferredDate: isFree ? 'N/A' : start.toISOString().split('T')[0],
        preferredTime: isFree ? 'N/A' : selectedTime || '',
        startTime: isFree ? 'N/A' : `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
        endTime: isFree ? 'N/A' : `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`,

        // Metadatos
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        consultationCode: `CONS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
      });

      // Guardar el ID de la consulta creada para Lemon Squeezy
      setCreatedConsultationId(docRef.id);
      window.localStorage.setItem('last_consultation_id', docRef.id);

      // Mostrar confirmación con estilo dentro del modal
      setSuccess(true);

      trackEvent('generate_lead', {
        item_id: currentPlanId,
        item_name: activePlan?.name || 'Sesión Estratégica',
        value: activePlan?.price || 0,
        currency: 'EUR',
        client_name: formData.nombre,
        client_email: formData.email
      });

    } catch (err) {
      setError(language === 'en'
        ? 'Error registering your consultation. Please try again.'
        : 'Error al registrar tu consulta. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="modal-glass-content w-full max-w-5xl h-[680px] max-h-[90vh] overflow-hidden border border-[var(--border-color)] rounded-2xl shadow-xl flex flex-col">
        <div className="flex h-full overflow-hidden">
          {/* Panel Izquierdo - Información (Scrollable para acomodar múltiples planes sin desbordamiento) */}
          <div className="w-2/5 h-full bg-gray-50 dark:bg-zinc-800/30 p-5 md:p-6 flex flex-col border-r border-[var(--border-color)] overflow-y-auto custom-scrollbar">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-bold text-base">DG</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[var(--text-color)]">Diego Galmarini</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {language === 'en' ? 'Strategic Tech Partner' : 'Socio Tecnológico Estratégico'}
                </p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-[var(--text-color)] mb-2">
              {(language === 'en' ? activePlan?.nameEn : activePlan?.name) || (language === 'en' ? 'Strategic Innovation Session' : 'Sesión Estratégica de Innovación')}
            </h2>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-[var(--text-color)]">
                <IoCalendarOutline className="w-4 h-4 mr-2.5 text-[var(--primary-color)]" />
                <span className="text-xs">
                  {activePlan?.duration > 0 
                    ? (language === 'en' ? `${activePlan.duration}-minute session` : `${activePlan.duration} minutos de sesión`) 
                    : (language === 'en' ? 'Written format (email)' : 'Formato escrito (correo)')}
                </span>
              </div>
              <div className="flex items-start text-[var(--text-color)]">
                <IoInformationCircleOutline className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-[var(--primary-color)]" />
                <span className="text-xs">
                  {activePlan?.price > 0 
                    ? (language === 'en' ? `Premium Consulting (${activePlan.price}€ EUR)` : `Consultoría Premium (${activePlan.price}€ EUR)`) 
                    : (language === 'en' ? 'Free Initial Consultation' : 'Asesoría Inicial Gratuita')}
                </span>
              </div>
              {selectedDate && selectedTime && (
                <div className="bg-[var(--primary-color)]/10 p-3 rounded-lg border-l-4 border-[var(--primary-color)] shadow-sm">
                  <p className="text-xs font-semibold text-[var(--text-color)]">
                    {formatDateForDisplay(selectedDate)}
                  </p>
                  <p className="text-xs text-[var(--primary-color)]">
                    {selectedTime} - {language === 'en' ? 'Central Europe Time' : 'Europa Central'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-[var(--text-muted)] text-xs leading-relaxed mb-3">
                {(language === 'en' ? activePlan?.descriptionEn : activePlan?.description) || 
                  (language === 'en' 
                    ? 'This conversation will allow us to analyze your current challenges and identify strategic opportunities.' 
                    : 'Esta conversación nos permitirá analizar tus desafíos actuales e identificar oportunidades estratégicas.')}
              </p>
            </div>

            {/* Plan Selector Buttons/Toggles (Sleek design matching theme) */}
            <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
              <p className="text-xs font-semibold text-[var(--text-color)] mb-2">
                {language === 'en' ? 'Select consultation type:' : 'Selecciona el tipo de consulta:'}
              </p>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPlanId('free')}
                  className={`flex flex-col p-2.5 px-3 rounded-xl border text-left transition-all ${
                    currentPlanId === 'free'
                      ? 'border-blue-500 bg-blue-50/10 shadow-sm'
                      : 'border-[var(--border-color)] bg-transparent hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-semibold text-xs text-[var(--text-color)]">
                      {language === 'en' ? 'Free Email Consultation' : 'Consulta Gratis por Email'}
                    </span>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                      {language === 'en' ? 'Free' : 'Gratis'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    {language === 'en' ? 'Response in less than 24 business hours without a call.' : 'Respuesta en menos de 24h hábiles sin llamada.'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPlanId('express')}
                  className={`flex flex-col p-2.5 px-3 rounded-xl border text-left transition-all ${
                    currentPlanId === 'express'
                      ? 'border-blue-500 bg-blue-50/10 shadow-sm'
                      : 'border-[var(--border-color)] bg-transparent hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-semibold text-xs text-[var(--text-color)]">
                      {language === 'en' ? 'Strategy Session (Meet)' : 'Sesión Estratégica (Meet)'}
                    </span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                      {expressPlan ? `${expressPlan.price}€` : '150€'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    {language === 'en' ? '30-min video call and action plan.' : 'Videollamada de 30 min y plan de acción.'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPlanId('complete')}
                  className={`flex flex-col p-2.5 px-3 rounded-xl border text-left transition-all ${
                    currentPlanId === 'complete'
                      ? 'border-blue-500 bg-blue-50/10 shadow-sm'
                      : 'border-[var(--border-color)] bg-transparent hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-semibold text-xs text-[var(--text-color)]">
                      {language === 'en' ? 'Full Consultation (Meet)' : 'Consultoría Completa (Meet)'}
                    </span>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full">
                      {completePlan ? `${completePlan.price}€` : '250€'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    {language === 'en' ? '60-min video call, audit, and PDF.' : 'Videollamada de 60 min, auditoría y PDF.'}
                  </p>
                </button>
              </div>
            </div>

            <div className="text-[10px] text-[var(--dg-text-muted)] mt-4 opacity-75 flex-shrink-0">
              {language === 'en' ? 'Duration' : 'Duración'}: {activePlan?.duration > 0 ? (language === 'en' ? `${activePlan.duration} minutes` : `${activePlan.duration} minutos`) : (language === 'en' ? 'Written format' : 'Formato escrito')} • {language === 'en' ? 'Format' : 'Formato'}: {activePlan?.duration > 0 ? 'Virtual (Meet)' : 'Email'}
            </div>
          </div>

          {/* Panel Derecho - Acciones */}
          <div className="w-3/5 p-5 md:p-6 relative h-full flex flex-col overflow-y-auto custom-scrollbar">
            {/* Botón Cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors z-10"
            >
              <IoClose className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </button>

            {success ? (
              // Pantalla de éxito estilizada
              <div className="flex flex-col items-center text-center py-10">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow">
                  <IoCheckmarkCircleOutline className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentPlanId === 'free' 
                    ? (language === 'en' ? 'Query received!' : '¡Consulta recibida!') 
                    : (language === 'en' ? 'Appointment scheduled!' : '¡Cita programada!')}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md text-sm">
                  {currentPlanId === 'free'
                    ? (language === 'en'
                        ? `We have received your technical query. Diego will review it personally and respond to your email at ${formData.email} within 24 business hours.`
                        : `Hemos recibido tu consulta técnica. Diego la revisará personalmente y te responderá al correo ${formData.email} en menos de 24 horas hábiles.`)
                    : (language === 'en'
                        ? 'We have sent you the meeting details and confirmation by email. Thank you!'
                        : 'Te enviaremos por correo los detalles de la reunión y la confirmación. ¡Gracias!')
                  }
                </p>
                {/* Botón de Pago Lemonsqueezy */}
                {currentPlanId !== 'free' && activePlan?.paymentLink && (
                  <div className="w-full max-w-md mb-6 hover:scale-101 transition-all">
                    {isPaid ? (
                      <div className="w-full py-3.5 px-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md flex items-center justify-center gap-2 transition-all">
                        <span className="text-sm font-extrabold uppercase tracking-wider">
                          ✓ {language === 'en' ? 'Payment Verified & Confirmed!' : '¡Pago Verificado y Confirmado!'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <a
                          href={activePlan.paymentLink + (activePlan.paymentLink.includes('?') ? '&embed=1' : '?embed=1')}
                          className="lemonsqueezy-button w-full py-3.5 px-4 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                          onClick={() => {
                            trackEvent('begin_payment', {
                              item_id: currentPlanId,
                              item_name: activePlan?.name || 'Sesión Estratégica',
                              value: activePlan?.price || 0,
                              currency: 'EUR'
                            });
                          }}
                        >
                          <span className="text-sm font-extrabold uppercase tracking-wider">
                            {language === 'en' ? `Complete Payment (${activePlan.price}€)` : `Completar Pago (${activePlan.price}€)`}
                          </span>
                          <IoChevronForward className="w-4 h-4 animate-pulse" />
                        </a>
                        <p className="text-[10px] text-gray-500 mt-2 italic">
                          {language === 'en' ? 'Complete payment on Lemon Squeezy to confirm your scheduled slot.' : 'Completa el pago en Lemon Squeezy para confirmar tu reserva.'}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Enlaces para agregar al calendario (solo si no es consulta gratis) */}
                {currentPlanId !== 'free' && (() => {
                  if (!selectedDate || !selectedTime) return null;
                  const [h, m] = selectedTime.split(':').map(Number);
                  const start = new Date(selectedDate);
                  start.setHours(h, m, 0, 0);
                  const durationMinutes = activePlan?.duration || 30;
                  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

                  const toGoogleDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
                  const startStr = toGoogleDate(start);
                  const endStr = toGoogleDate(end);

                  const activePlanName = activePlan ? (language === 'en' ? activePlan.nameEn || activePlan.name : activePlan.name) : (language === 'en' ? 'Strategic Innovation Session' : 'Sesión Estratégica de Innovación');
                  const title = encodeURIComponent(language === 'en' ? `Session: ${activePlanName}` : `Sesión: ${activePlanName}`);
                  const details = encodeURIComponent(formData.notas || (language === 'en' ? 'Scheduled consultation' : 'Consulta programada'));
                  const location = encodeURIComponent(language === 'en' ? 'Virtual (link to be confirmed)' : 'Virtual (enlace por confirmar)');
                  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;

                  const formatICS = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
                  const dtstamp = formatICS(new Date());
                  const prodId = language === 'en' ? '-//DG//Booking//EN' : '-//DG//Booking//ES';
                  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:${prodId}\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nBEGIN:VEVENT\nDTSTAMP:${dtstamp}\nDTSTART:${startStr}\nDTEND:${endStr}\nSUMMARY:${activePlanName}\nDESCRIPTION:${formData.notas?.replace(/\n/g, '\\n') || (language === 'en' ? 'Scheduled consultation' : 'Consulta programada')}\nLOCATION:${language === 'en' ? 'Virtual (link to be confirmed)' : 'Virtual (enlace por confirmar)'}\nEND:VEVENT\nEND:VCALENDAR`;
                  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;

                  return (
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                      <a
                        href={googleUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium text-sm text-center"
                      >
                        {language === 'en' ? 'Add to Google Calendar' : 'Agregar a Google Calendar'}
                      </a>
                      <a
                        href={icsHref}
                        download={`appointment-${startStr}.ics`}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-600 hover:text-blue-600 transition font-medium text-sm text-center"
                      >
                        {language === 'en' ? 'Download .ics (Apple/Outlook)' : 'Descargar .ics (Apple/Outlook)'}
                      </a>
                    </div>
                  );
                })()}

                <button onClick={onClose} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium text-sm shadow-sm">
                  {language === 'en' ? 'Close' : 'Cerrar'}
                </button>
              </div>
            ) : step === 1 ? (
              // Paso 1: Selección de Fecha y Hora
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {language === 'en' ? 'Select a date and time' : 'Selecciona una fecha y hora'}
                  </h3>

                  {/* Calendario */}
                  <div className="mb-3 bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-[var(--border-color)]/60 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                      >
                        <IoChevronBack className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white capitalize">
                        {currentMonth.toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { month: 'long', year: 'numeric' })}
                      </h4>
                      <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                      >
                        <IoChevronForward className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 md:gap-1.5 mb-1.5">
                      {(language === 'en' ? ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] : ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']).map(day => (
                        <div key={day} className="h-8 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{day}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 md:gap-1.5">
                      {renderCalendar()}
                    </div>
                  </div>

                  {/* Horarios */}
                  {selectedDate && (
                    <div className="mt-2 animate-fadeIn">
                      <h5 className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                        {formatDateForDisplay(selectedDate)}
                      </h5>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-2">
                        {availableTimes.map(time => (
                          <button
                            key={time}
                            onClick={() => handleTimeSelect(time)}
                            className={`
                              py-1.5 px-1 text-xs font-bold rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ring-offset-1
                              ${selectedTime === time
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105'
                                : 'bg-white dark:bg-zinc-900/50 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-zinc-700 hover:border-blue-600 hover:text-blue-600'
                              }
                            `}
                            aria-pressed={selectedTime === time}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {selectedDate && selectedTime && (
                  <div className="mt-3">
                    <button
                      onClick={handleContinueToDetails}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{language === 'en' ? 'Continue' : 'Continuar'}</span>
                      <IoChevronForward className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Paso 2: Detalles del Usuario
              <div>
                <div className="flex items-center mb-4">
                  {currentPlanId !== 'free' && (
                    <button
                      onClick={handleBackToCalendar}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3 cursor-pointer"
                    >
                      <IoChevronBack className="w-5 h-5" />
                    </button>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {language === 'en' ? 'Enter details' : 'Introduce los detalles'}
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'en' ? 'Name *' : 'Nombre *'}
                    </label>
                    <div className="relative">
                      <IoPersonOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm dark:text-white placeholder-gray-400 font-medium bg-white"
                        placeholder={language === 'en' ? 'Your full name' : 'Tu nombre completo'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'en' ? 'Email *' : 'Correo electrónico *'}
                    </label>
                    <div className="relative">
                      <IoMailOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm dark:text-white placeholder-gray-400 font-medium bg-white"
                        placeholder={language === 'en' ? 'you@email.com' : 'tu@email.com'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'en' ? 'Tell us the details of your query *' : 'Cuéntanos el detalle de tu consulta *'}
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.notas}
                        onChange={(e) => {
                          if (e.target.value.length <= MAX_CHARS) {
                            setFormData({ ...formData, notas: e.target.value });
                          }
                        }}
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm dark:text-white placeholder-gray-400 font-medium bg-white"
                        placeholder={language === 'en' 
                          ? 'Describe briefly your project, challenges, or goals...' 
                          : 'Describe brevemente tu proyecto, desafíos o objetivos...'}
                      />
                      <div className={`text-[10px] font-medium mt-0.5 text-right ${getCharacterCountColor()}`}>
                        {getCharacterCountText()}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-2.5">
                      <p className="text-red-700 dark:text-red-400 text-xs">{error}</p>
                    </div>
                  )}

                  <div className="mt-4 pt-1">
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                      {language === 'en' ? (
                        <>
                          By continuing, you confirm that you have read and agree to the{' '}
                          <a href="#" className="text-blue-600 hover:underline">Calendly Terms of Use</a> and{' '}
                          <a href="#" className="text-blue-600 hover:underline">Privacy Notice</a>.
                        </>
                      ) : (
                        <>
                          Al continuar, confirma que ha leído y está de acuerdo con las{' '}
                          <a href="#" className="text-blue-600 hover:underline">Condiciones de uso de Calendly</a> y{' '}
                          <a href="#" className="text-blue-600 hover:underline">Aviso de privacidad</a>.
                        </>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !formData.nombre || !formData.email || !isNotesValid()}
                      className={`
                        w-full py-2.5 rounded-lg font-semibold transition-colors shadow cursor-pointer
                        ${isLoading || !formData.nombre || !formData.email || !isNotesValid()
                          ? 'bg-gray-300 dark:bg-zinc-800 text-gray-500 dark:text-zinc-600 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }
                      `}
                    >
                      {isLoading 
                        ? (language === 'en' ? 'Scheduling event...' : 'Programando evento...') 
                        : (language === 'en' ? 'Schedule event' : 'Programar evento')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleBookingModal;