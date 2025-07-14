
import React, { useState, useEffect } from 'react';
import { bookingPlaceholders } from '../constants';
import { 
  IoPersonOutline, 
  IoCalendarOutline, 
  IoCardOutline, 
  IoCheckmarkCircleOutline, 
  IoClose,
  IoCheckmark,
  IoChevronBack,
  IoChevronForward,
  IoMailOutline,
} from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- Types & Interfaces ---
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- ProgressBar Component ---
const ProgressBar: React.FC<{ step: number }> = ({ step }) => {
    const steps = [
        { num: 1, icon: <IoPersonOutline />, label: 'Problema' },
        { num: 2, icon: <IoCardOutline />, label: 'Plan' },
        { num: 3, icon: <IoCalendarOutline />, label: 'Agenda' },
        { num: 4, icon: <IoCheckmarkCircleOutline />, label: 'Confirmar' }
    ];

    return (
        <div className="flex justify-between items-center mb-8 mt-4 px-4 md:px-8">
            {steps.map((s, index) => (
                <React.Fragment key={s.num}>
                    <div className="flex flex-col items-center z-10">
                        <div className={`progress-step-icon ${step >= s.num ? 'progress-step-icon-active' : ''}`}>
                            {s.icon}
                        </div>
                        <p className={`text-xs mt-2 font-semibold ${step >= s.num ? 'text-[var(--primary-color)]' : 'text-[var(--text-muted)]'}`}>{s.label}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`progress-step-track ${step > s.num ? 'progress-step-track-active' : ''}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

// --- Main Modal Component ---
const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [placeholder, setPlaceholder] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [contactInfo, setContactInfo] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const minChars = 100;

  // --- State and Effect Management ---
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };
  
  const resetState = () => {
    setStep(1);
    setTermsAccepted(false);
    setSelectedPlan(null);
    setProblemDescription('');
    setSelectedDate(null);
    setSelectedTime(null);
    setCurrentMonth(new Date());
    setError('');
    setIsLoading(false);
    setContactInfo({ name: user?.displayName || '', email: user?.email || '' });
  };

  useEffect(() => {
    if (isOpen) {
      resetState();
    } else {
      setTimeout(resetState, 300);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) return;
    let currentPlaceholderIndex = 0;
    let typingTimeout: ReturnType<typeof setTimeout>;
    const type = () => {
      const fullText = bookingPlaceholders[currentPlaceholderIndex];
      if (!fullText) return;
      let i = 0;
      const typeChar = () => {
        if (i < fullText.length) {
          setPlaceholder(fullText.substring(0, i + 1));
          i++;
          typingTimeout = setTimeout(typeChar, 50);
        } else {
          typingTimeout = setTimeout(() => {
             currentPlaceholderIndex = (currentPlaceholderIndex + 1) % bookingPlaceholders.length;
             type();
          }, 3000);
        }
      };
      typeChar();
    };
    type();
    return () => clearTimeout(typingTimeout);
  }, [isOpen]);
  
  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);

  // --- Navigation & Submission ---
  const handleNext = () => {
    if (step === 2 && selectedPlan === 'free') {
      setStep(4);
    } else {
      setStep(s => s + 1);
    }
  };
  const handleBack = () => {
     if (step === 4 && selectedPlan === 'free') {
      setStep(2);
    } else {
      setStep(s => s - 1);
    }
  };
  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const db = getFirestore();
      await addDoc(collection(db, "consultations"), {
        userId: user ? user.uid : null,
        userName: contactInfo.name,
        userEmail: contactInfo.email,
        description: problemDescription,
        plan: selectedPlan,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        status: 'Pendiente',
        createdAt: serverTimestamp(),
      });
      setStep(5);
    } catch (err) {
      setError("No se pudo enviar la consulta. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step Content Rendering ---
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-center text-[var(--text-color)] mb-2">Paso 1: Describe tu Proyecto en Detalle</h2>
            <p className="text-center text-[var(--text-muted)] mb-6">Dame todo el contexto posible para que nuestra sesión sea de máximo valor.</p>
            <textarea rows={6} className="glass-textarea" placeholder={placeholder} value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)} maxLength={5000}></textarea>
            <p className={`text-right text-xs mt-2 pr-1 ${problemDescription.length >= minChars ? 'text-green-500' : 'text-yellow-500 font-semibold'}`}>
              {problemDescription.length} / 5000 (mínimo {minChars} caracteres)
            </p>
            <div className="mt-4 flex items-center">
              <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="sr-only"/>
              <label htmlFor="terms" className="custom-checkbox-glass-container">
                <span className={`custom-checkbox-glass ${termsAccepted ? 'custom-checkbox-glass-checked' : ''}`}><IoCheckmark className={`custom-checkbox-glass-checkmark ${termsAccepted ? 'custom-checkbox-glass-checkmark-checked' : ''}`} /></span>
                <span className="ml-3 block text-sm text-[var(--text-muted)]">Acepto los <a href="#/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline text-[var(--text-color)] hover:text-[var(--primary-color)]">términos</a> y la <a href="#/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-[var(--text-color)] hover:text-[var(--primary-color)]">política de privacidad</a>.</span>
              </label>
            </div>
          </div>
        );
      case 2:
        const plans = [
            { id: 'free', name: 'Consulta Inicial Gratuita', price: '0€', duration: 'Por Email', desc: 'Evaluación inicial de tu proyecto. Recibirás una respuesta detallada por email.'},
            { id: '30min', name: 'Sesión Estratégica', price: '150€', duration: '30 min', desc: 'Análisis profundo de un problema específico y plan de acción.' },
            { id: '60min', name: 'Consultoría Completa', price: '250€', duration: '1 hora', desc: 'Para retos complejos, arquitectura, o roadmaps estratégicos.' },
        ];
        return (
            <div>
                <h2 className="text-2xl font-bold text-center text-[var(--text-color)] mb-2">Paso 2: Elige tu Plan</h2>
                <p className="text-center text-[var(--text-muted)] mb-6">Selecciona la opción que mejor se adapte a tu necesidad.</p>
                <div className="space-y-4">{plans.map(plan => (<div key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`plan-card-glass ${selectedPlan === plan.id ? 'plan-card-glass-selected' : ''}`}><div className="flex justify-between items-center"><h3 className="font-bold text-lg text-[var(--text-color)]">{plan.name}</h3><p className="font-bold text-lg text-[var(--primary-color)]">{plan.price}</p></div><p className="text-sm text-[var(--text-muted)]">{plan.desc}</p><p className="text-sm font-semibold text-gray-500 mt-1">{plan.duration}</p></div>))}</div>
            </div>
        );
      case 3:
        const Calendar = () => {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const handlePrevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
            const handleNextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
            const year = currentMonth.getFullYear(); const month = currentMonth.getMonth();
            const firstDayOfMonth = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysOfWeek = ['L', 'M', 'X', 'J', 'V', 'S', 'D']; const startDayIndex = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
            const days = Array.from({length: startDayIndex}, (_, i) => <div key={`empty-${i}`} className="w-10 h-10"></div>);
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const isPast = date < today; const isWeekend = date.getDay() === 0 || date.getDay() === 6; const isDisabled = isPast || isWeekend;
                const isSelected = selectedDate && date.getTime() === selectedDate.getTime(); const isToday = date.getTime() === today.getTime();
                days.push(<button key={day} disabled={isDisabled} onClick={() => setSelectedDate(date)} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200 ${isSelected ? 'bg-[var(--primary-color)] text-white shadow-lg' : ''} ${!isSelected && isToday ? 'border-2 border-[var(--primary-color)]' : ''} ${!isSelected && !isDisabled ? 'hover:bg-[var(--nav-inactive-hover-bg)]' : ''} ${isDisabled ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-[var(--text-color)]'}`}>{day}</button>);
            }
            return (<div className="plan-card-glass p-4"><div className="flex items-center justify-between mb-4"><button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-[var(--nav-inactive-hover-bg)]"><IoChevronBack /></button><h3 className="font-bold text-lg text-center text-[var(--text-color)] capitalize">{new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentMonth)}</h3><button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-[var(--nav-inactive-hover-bg)]"><IoChevronForward /></button></div><div className="grid grid-cols-7 gap-1 text-center text-xs text-[var(--text-muted)] mb-2 font-bold">{daysOfWeek.map(day => <div key={day}>{day}</div>)}</div><div className="grid grid-cols-7 gap-y-1 place-items-center">{days}</div></div>);
        };
        const TimeSlots = () => {
             if (!selectedDate) return (<div><h3 className="font-bold text-lg mb-2 text-center text-[var(--text-color)]">Horarios Disponibles</h3><div className="plan-card-glass aspect-[4/3] flex items-center justify-center"><p className="text-[var(--text-muted)] text-center p-4">Selecciona una fecha para ver los horarios.</p></div></div>);
            const interval = selectedPlan === '60min' ? 60 : 30; const slots = []; const now = new Date(); const isToday = selectedDate.toDateString() === now.toDateString();
            for (let hour = 9; hour < 16; hour++) {
                for (let minute = 0; minute < 60; minute += interval) {
                    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    const slotTime = new Date(selectedDate); slotTime.setHours(hour, minute, 0, 0); const isDisabled = isToday && slotTime < now;
                    if (hour * 60 + minute < 16 * 60) slots.push(<button key={time} disabled={isDisabled} onClick={() => setSelectedTime(time)} className={`p-2 rounded-lg font-semibold text-sm transition-colors duration-200 w-full ${selectedTime === time ? 'bg-[var(--primary-color)] text-white shadow-md' : ''} ${!isDisabled && selectedTime !== time ? 'bg-[var(--input-bg)] hover:bg-[var(--nav-inactive-hover-bg)]' : ''} ${isDisabled ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : ''}`}>{time}</button>);
                }
            }
            return (<div><h3 className="font-bold text-lg mb-2 text-center text-[var(--text-color)] capitalize">{new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDate)}</h3><div className="plan-card-glass p-4 grid grid-cols-3 sm:grid-cols-4 gap-2">{slots}</div></div>);
        };
        return (<div><h2 className="text-2xl font-bold text-center text-[var(--text-color)] mb-2">Paso 3: Agenda tu Sesión</h2><p className="text-center text-[var(--text-muted)] mb-6">Selecciona una fecha y hora disponibles (L-V, 9:00 - 16:00).</p><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><Calendar /><TimeSlots /></div></div>);
      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold text-center text-[var(--text-color)] mb-2">Paso 4: Confirma tu Solicitud</h2>
            <p className="text-center text-[var(--text-muted)] mb-6">Introduce tus datos de contacto para finalizar.</p>
            <div className="space-y-4">
                <div className="relative"><IoPersonOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--text-muted)]" /><input type="text" placeholder="Nombre completo" name="fullName" className="glass-input" value={contactInfo.name} onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})} required /></div>
                <div className="relative"><IoMailOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--text-muted)]" /><input type="email" placeholder="Email" name="email" className="glass-input" value={contactInfo.email} onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})} required /></div>
            </div>
             {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
          </div>
        );
      case 5:
        return (<div className="text-center py-8"><IoCheckmarkCircleOutline className="w-20 h-20 text-green-500 mx-auto mb-4" /><h2 className="text-2xl font-bold text-center text-[var(--text-color)] mb-2">¡Solicitud Enviada!</h2><p className="text-center text-[var(--text-muted)] mb-6 max-w-md mx-auto">Gracias, {contactInfo.name}. He recibido tu solicitud y te responderé en un plazo de 24-48 horas.</p></div>);
      default: return null;
    }
  };
  
  const getButtonState = () => {
      if (isLoading) return true;
      switch(step) {
          case 1: return !termsAccepted || problemDescription.length < minChars;
          case 2: return !selectedPlan;
          case 3: return !selectedDate || !selectedTime;
          case 4: return contactInfo.name.trim() === '' || !/^\S+@\S+\.\S+$/.test(contactInfo.email);
          default: return false;
      }
  }

  const getButtonText = () => {
      if (isLoading) return "Enviando...";
      if (step === 4) return "Confirmar y Enviar Solicitud";
      return "Continuar";
  }

  return (
    <div onClick={handleBackdropClick} className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`modal-glass-content w-full max-w-3xl lg:max-w-4xl p-6 md:p-8 relative transform transition-all duration-300 flex flex-col ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <button onClick={onClose} aria-label="Cerrar modal" className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--nav-inactive-hover-bg)] transition-all duration-300 z-20"><IoClose className="text-lg" /></button>
        
        {/* Header: Progress Bar (fixed at the top) */}
        <div className="shrink-0">
          { step <= 4 && <ProgressBar step={step} />}
        </div>
        
        {/* Content: This is the scrollable area */}
        <div className="px-4 flex-grow overflow-y-auto min-h-[350px]">
          {renderStepContent()}
        </div>
        
        {/* Footer: Buttons (fixed at the bottom) */}
        { step < 5 && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-[var(--border-color)] shrink-0">
                <div>{step > 1 && <button onClick={handleBack} className="btn-secondary-glass">Atrás</button>}</div>
                <button onClick={step === 4 ? handleSubmit : handleNext} disabled={getButtonState()} className="btn-cta text-base py-3 px-6">{getButtonText()}</button>
            </div>
        )}
        { step === 5 && (
             <div className="flex justify-center mt-8 pt-6 border-t border-[var(--border-color)] shrink-0">
                 <button onClick={onClose} className="btn-cta text-base py-3 px-6">Entendido</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
