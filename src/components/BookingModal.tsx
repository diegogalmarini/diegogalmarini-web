import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { usePlans } from '../contexts/PlansContext';
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
  const [step, setStep] = useState(1); // 1: Calendario, 2: Detalles
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Encontrar el plan seleccionado, por defecto usar 'express'
  const activePlan = React.useMemo(() => {
    const plan = plans.find(p => p.id === preselectedPlanId);
    if (plan) return plan;
    // Si no se pasa plan o no existe, buscar el de 'express' (Sesión Estratégica)
    return plans.find(p => p.id === 'express') || plans[0];
  }, [plans, preselectedPlanId]);

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    notas: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Horarios disponibles
  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30'
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
    return date.toLocaleDateString('es-ES', {
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
          className="h-10 w-10 mx-auto rounded-lg text-sm font-medium transition-all duration-200 text-gray-900 cursor-not-allowed flex items-center justify-center"
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
            h-10 w-10 mx-auto rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center
            ${isSelected
              ? 'bg-[var(--primary-color)] text-white shadow-lg scale-110'
              : isAvailable
                ? 'text-[var(--primary-color)] hover:bg-blue-50 font-semibold'
                : 'text-gray-900 cursor-not-allowed'
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
          className="h-10 w-10 mx-auto rounded-lg text-sm font-medium transition-all duration-200 text-gray-900 cursor-not-allowed flex items-center justify-center"
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
      return `Faltan ${MIN_CHARS - length} caracteres`;
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
      setError(`Por favor, escribe entre ${MIN_CHARS} y ${MAX_CHARS} caracteres sobre tu proyecto.`);
      return;
    }

    setIsLoading(true);

    try {
      // 1) Crear documento en Firestore para disparar el correo (Cloud Function)
      const db = getFirestore(app);
      const [h, m] = (selectedTime || '00:00').split(':').map(Number);
      const start = selectedDate ? new Date(selectedDate) : new Date();
      start.setHours(h || 0, m || 0, 0, 0);

      // Calcular hora de fin (duración del plan o 30 min por defecto)
      const durationMinutes = activePlan?.duration || 30;
      const end = new Date(start.getTime() + (durationMinutes > 0 ? durationMinutes : 30) * 60 * 1000);

      await addDoc(collection(db, 'consultations'), {
        // Campos que espera el CRM
        clientName: formData.nombre,
        clientEmail: formData.email,
        subject: activePlan ? `Sesión Estratégica: ${activePlan.name}` : 'Sesión Estratégica de Innovación',
        message: formData.notas || '',
        services: [activePlan ? activePlan.name : 'Sesión Estratégica de Innovación'],
        priority: 'medium' as const,
        planType: (activePlan?.id === 'free' ? 'mail' : activePlan?.id === 'express' ? '30min' : activePlan?.id === 'complete' ? '60min' : 'custom') as any,
        paymentStatus: (activePlan?.price === 0 ? 'free' : 'pending') as any,
        status: 'pending' as const,
        source: 'website' as const,

        // Campos adicionales para el email (compatibilidad con Cloud Function)
        userName: formData.nombre,
        userEmail: formData.email,
        notes: formData.notas || '',
        preferredDate: start.toISOString().split('T')[0],
        preferredTime: selectedTime || '',
        startTime: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
        endTime: `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`,

        // Metadatos
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        consultationCode: `CONS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
      });

      // Mostrar confirmación con estilo dentro del modal
      setSuccess(true);

    } catch (err) {
      setError('Error al programar la cita. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30">
      <div className="modal-glass-content w-full max-w-5xl max-h-[90vh] overflow-hidden border border-[var(--border-color)] rounded-2xl shadow-xl">
        <div className="flex h-full">
          {/* Panel Izquierdo - Información */}
          <div className="w-2/5 bg-[var(--card-bg)] p-8 flex flex-col border-r border-[var(--border-color)]">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-[var(--primary-color)] rounded-full flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-bold text-lg">DG</span>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-color)]">Diego Galmarini</h3>
                <p className="text-sm text-[var(--text-muted)]">Socio Tecnológico Estratégico</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[var(--text-color)] mb-4">
              {activePlan?.name || 'Sesión Estratégica de Innovación'}
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-[var(--text-color)]">
                <IoCalendarOutline className="w-5 h-5 mr-3 text-[var(--primary-color)]" />
                <span className="text-sm">
                  {activePlan?.duration > 0 ? `${activePlan.duration} minutos de sesión` : 'Formato escrito (correo)'}
                </span>
              </div>
              <div className="flex items-start text-[var(--text-color)]">
                <IoInformationCircleOutline className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-[var(--primary-color)]" />
                <span className="text-sm">
                  {activePlan?.price > 0 ? `Consultoría Premium ($${activePlan.price} USD)` : 'Asesoría Inicial Gratuita'}
                </span>
              </div>
              {selectedDate && selectedTime && (
                <div className="bg-[var(--primary-color)]/10 p-4 rounded-lg border-l-4 border-[var(--primary-color)] shadow-sm">
                  <p className="text-sm font-semibold text-[var(--text-color)]">
                    {formatDateForDisplay(selectedDate)}
                  </p>
                  <p className="text-sm text-[var(--primary-color)]">{selectedTime} - Europa Central</p>
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4">
                Esta conversación nos permitirá analizar tus desafíos actuales y identificar oportunidades
                estratégicas con IA, Web3 y Cloud Computing.
              </p>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Al final de la sesión, tendrás una visión clara de las tecnologías que pueden impulsar
                tu negocio y un roadmap preliminar para implementarlas.
              </p>
            </div>

            <div className="text-xs text-[var(--dg-text-muted)] mt-6">
              Duración: 30 minutos • Formato: Virtual
            </div>
          </div>

          {/* Panel Derecho - Acciones */}
          <div className="w-3/5 p-8 relative max-h-[80vh] overflow-y-auto">
            {/* Botón Cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IoClose className="w-6 h-6 text-gray-400" />
            </button>

            {success ? (
              // Pantalla de éxito estilizada
              <div className="flex flex-col items-center text-center py-10">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow">
                  <IoCheckmarkCircleOutline className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Cita programada!</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Te enviaremos por correo los detalles de la reunión. ¡Gracias!
                </p>
                {/* Enlaces para agregar al calendario */}
                {(() => {
                  if (!selectedDate || !selectedTime) return null;
                  const [h, m] = selectedTime.split(':').map(Number);
                  const start = new Date(selectedDate);
                  start.setHours(h, m, 0, 0);
                  const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 minutos

                  const toGoogleDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
                  const startStr = toGoogleDate(start);
                  const endStr = toGoogleDate(end);

                  const title = encodeURIComponent('Sesión Estratégica de Innovación');
                  const details = encodeURIComponent(formData.notas || 'Consulta programada');
                  const location = encodeURIComponent('Virtual (enlace por confirmar)');
                  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;

                  const formatICS = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
                  const dtstamp = formatICS(new Date());
                  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//DG//Booking//ES\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nBEGIN:VEVENT\nDTSTAMP:${dtstamp}\nDTSTART:${startStr}\nDTEND:${endStr}\nSUMMARY:Sesión Estratégica de Innovación\nDESCRIPTION:${formData.notas?.replace(/\n/g, '\\n') || 'Consulta programada'}\nLOCATION:Virtual (enlace por confirmar)\nEND:VEVENT\nEND:VCALENDAR`;
                  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;

                  return (
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                      <a
                        href={googleUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
                      >
                        Agregar a Google Calendar
                      </a>
                      <a
                        href={icsHref}
                        download={`cita-${startStr}.ics`}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-600 hover:text-blue-600 transition font-medium"
                      >
                        Descargar .ics (Apple/Outlook)
                      </a>
                    </div>
                  );
                })()}

                <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:opacity-90 transition">Cerrar</button>
              </div>
            ) : step === 1 ? (
              // Paso 1: Selección de Fecha y Hora
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Selecciona una fecha y hora
                </h3>

                {/* Calendario */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={handlePrevMonth}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <IoChevronBack className="w-5 h-5" />
                    </button>
                    <h4 className="text-lg font-medium text-gray-900">
                      {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <IoChevronForward className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map(day => (
                      <div key={day} className="h-10 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-500">{day}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>
                </div>

                {/* Horarios */}
                {selectedDate && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-3">
                      {formatDateForDisplay(selectedDate)}
                    </h5>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                      {availableTimes.map(time => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className={`
                            py-2.5 px-3 text-sm rounded-lg border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ring-offset-1
                            ${selectedTime === time
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                              : 'bg-white text-gray-900 border-gray-300 hover:border-blue-600 hover:text-blue-600'
                            }
                          `}
                          aria-pressed={selectedTime === time}
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    {selectedTime && (
                      <div className="sticky bottom-0 pt-2 pb-1 bg-gradient-to-t from-white to-transparent">
                        <button
                          onClick={handleContinueToDetails}
                          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow"
                        >
                          Continuar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Paso 2: Detalles del Usuario
              <div>
                <div className="flex items-center mb-6">
                  <button
                    onClick={handleBackToCalendar}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
                  >
                    <IoChevronBack className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Introduce los detalles
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <div className="relative">
                      <IoPersonOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo electrónico *
                    </label>
                    <div className="relative">
                      <IoMailOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuéntanos el detalle de tu consulta *
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.notas}
                        onChange={(e) => {
                          if (e.target.value.length <= MAX_CHARS) {
                            setFormData({ ...formData, notas: e.target.value });
                          }
                        }}
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Describe brevemente tu proyecto, desafíos o objetivos..."
                      />
                      <div className={`text-xs font-medium mt-1 text-right ${getCharacterCountColor()}`}>
                        {getCharacterCountText()}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="sticky bottom-0 pt-2 pb-1 bg-gradient-to-t from-white to-transparent">
                    <div className="text-xs text-gray-500 mb-2">
                      Al continuar, confirma que ha leído y está de acuerdo con las{' '}
                      <a href="#" className="text-blue-600 hover:underline">Condiciones de uso de Calendly</a>{' '}y{' '}
                      <a href="#" className="text-blue-600 hover:underline">Aviso de privacidad</a>.
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !formData.nombre || !formData.email || !isNotesValid()}
                      className={`
                        w-full py-3 rounded-lg font-semibold transition-colors shadow
                        ${isLoading || !formData.nombre || !formData.email || !isNotesValid()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }
                      `}
                    >
                      {isLoading ? 'Programando evento...' : 'Programar evento'}
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