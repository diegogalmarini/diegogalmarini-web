import React, { useState, useEffect } from 'react';
import { bookingPlaceholders } from '../constants';
import { 
  IoPersonOutline, 
  IoLogoGoogle, 
  IoMailOutline, 
  IoLockClosedOutline,
  IoClose,
  IoCheckmark,
  IoChevronBack,
  IoChevronForward,
  IoMailOpenOutline,
  IoCheckmarkDoneCircleOutline
} from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import { usePlans } from '../contexts/PlansContext';
import { FirebaseConfigError } from './FirebaseConfigError';
import { firebaseConfig, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProgressBar: React.FC<{ step: number; isLoggedIn: boolean }> = ({ step, isLoggedIn }) => {
    const anonSteps = [
        { num: 1, label: 'Problema' },
        { num: 2, label: 'Plan' },
        { num: 3, label: 'Agenda' },
        { num: 4, label: 'Registro' }
    ];
    
    const loggedInSteps = [
        { num: 1, label: 'Problema' },
        { num: 2, label: 'Plan' },
        { num: 3, label: 'Agenda' },
        { num: 4, label: 'Confirmar' }
    ];

    const steps = isLoggedIn ? loggedInSteps : anonSteps;
    const progressPercentage = ((step - 1) / (steps.length - 1)) * 100;

    return (
        <div className="mb-4 mt-4 w-full max-w-md mx-auto">
            {/* Barra de progreso */}
            <div className="relative mb-3">
                <div className="w-full h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[var(--primary-color)] rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>
            
            {/* Etiquetas de pasos */}
            <div className="flex justify-between items-center">
                {steps.map((s) => (
                    <div key={s.num} className="flex flex-col items-center text-center">
                        <p className={`text-xs font-semibold transition-colors duration-300 ${
                            step >= s.num ? 'text-[var(--primary-color)]' : 'text-[var(--text-muted)]'
                        }`}>
                            {s.label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};


const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const { user, registerWithEmail, signInWithGoogle, loginWithEmail } = useAuth();
  
  const [step, setStep] = useState(1);
  const [placeholder, setPlaceholder] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | '30min' | '60min' | null>(null);
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [registrationData, setRegistrationData] = useState({ fullName: '', email: '', password: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const [error, setError] = useState('');
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionType, setSubmissionType] = useState<'confirm' | 'register'>('confirm');

  const minChars = 100;
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const resetState = () => {
    setStep(1);
    setTermsAccepted(false);
    setSelectedPlan(null);
    setProblemDescription('');
    setSelectedDate(null);
    setSelectedTime(null);
    setCurrentMonth(new Date());
    setAuthMode('register');
    setRegistrationData({ fullName: '', email: '', password: '' });
    setLoginData({ email: '', password: '' });
    setError('');
    setAuthErrorCode(null);
    setIsLoading(false);
    setSubmissionType('confirm');
  };

  useEffect(() => {
    if (!isOpen) {
      setTimeout(resetState, 300);
      return;
    }

    if (step !== 1 || problemDescription.length > 0) {
      if (step === 1 && problemDescription.length === 0) {
        setPlaceholder(bookingPlaceholders[0]);
      }
      return;
    }

    let currentPlaceholderIndex = 0;
    let typingTimeout: ReturnType<typeof setTimeout>;

    const type = () => {
      const fullText = bookingPlaceholders[currentPlaceholderIndex];
      let i = 0;
      const typeChar = () => {
        if (problemDescription.length > 0 || step !== 1 || !isOpen) {
            clearTimeout(typingTimeout);
            return;
        }
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
  }, [isOpen, step, problemDescription]);


  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);
  
  useEffect(() => {
    setError('');
    setAuthErrorCode(null);
  }, [authMode]);

  if (!isOpen) return null;

  const handleRegister = async () => {
    setError('');
    setAuthErrorCode(null);
    const { fullName, email, password } = registrationData;
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (fullName.trim() === '' || !emailRegex.test(email) || password.length < 6) {
        setError("Por favor, completa todos los campos correctamente.");
        return;
    }

    setIsLoading(true);
    try {
      await registerWithEmail(registrationData.fullName, registrationData.email, registrationData.password);
      setSubmissionType('register');
      setStep(5);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
          setError('Este correo ya está registrado. Por favor, inicia sesión.');
      } else {
          setError('Error al registrar. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    setAuthErrorCode(null);
    const { email, password } = loginData;
     if (!email || !password) {
        setError("Por favor, introduce tu email y contraseña.");
        return;
    }

    setIsLoading(true);
    try {
        await loginWithEmail(email, password);
        setSubmissionType('confirm');
        setStep(5);
    } catch (err: any) {
        setError("Email o contraseña incorrectos.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setAuthErrorCode(null);
    setIsLoading(true);
    try {
        await signInWithGoogle();
        setSubmissionType('confirm');
        setStep(5);
    } catch (err: any) {
        console.error("Google Sign-In Error:", err);
        if (err.code === 'auth/popup-blocked') {
            setError('La ventana emergente de Google fue bloqueada por el navegador. Por favor, habilítalas.');
        } else if (err.code === 'auth/operation-not-allowed') {
            setError('El inicio de sesión con Google no está habilitado. Actívalo en tu consola de Firebase.');
        } else if (err.code === 'auth/unauthorized-domain') {
            setAuthErrorCode(err.code);
        } else {
            setError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleNext = () => {
    setError('');
    setAuthErrorCode(null);
    if (step === 2 && selectedPlan === 'free') {
      setStep(4);
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setError('');
    setAuthErrorCode(null);
    if (step === 4 && selectedPlan === 'free') {
        setStep(2);
        return;
    }
    setStep((s) => Math.max(s - 1, 1));
  };

  // Función auxiliar para convertir Date a formato YYYY-MM-DD
  const toLocalYYYYMMDD = (d: Date): string => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleConfirmAndSubmit = async () => {
    console.log('🚀 INICIANDO handleConfirmAndSubmit');
    console.log('📋 Estado actual de las variables:');
    console.log('   - selectedDate:', selectedDate);
    console.log('   - selectedDate type:', typeof selectedDate);
    console.log('   - selectedDate instanceof Date:', selectedDate instanceof Date);
    console.log('   - selectedTime:', selectedTime);
    console.log('   - selectedTime type:', typeof selectedTime);
    console.log('   - selectedPlan:', selectedPlan);
    console.log('   - problemDescription:', problemDescription);
    
    setIsLoading(true);
    setError('');
    
    try {
      if (selectedPlan === 'free') {
        // Crear consulta gratuita
        const consultationData = {
          clientEmail: user?.email || '',
          clientName: user?.displayName || user?.email || '',
          planType: selectedPlan,
          problemDescription: problemDescription,
          selectedDate: (() => {
            console.log('🔄 Procesando selectedDate para consulta gratuita:');
            console.log('   - selectedDate antes de conversión:', selectedDate);
            const converted = selectedDate ? toLocalYYYYMMDD(selectedDate) : null;
            console.log('   - selectedDate después de conversión:', converted);
            return converted;
          })(),
          selectedTime: (() => {
            console.log('⏰ Procesando selectedTime para consulta gratuita:');
            console.log('   - selectedTime:', selectedTime);
            return selectedTime;
          })(),
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Guardar en Firestore
        const docRef = await addDoc(collection(db, 'consultations'), consultationData);
        console.log('Consulta gratuita guardada con ID: ', docRef.id);
      } else {
        // Crear cita de pago (30min o 60min)
        const appointmentData = {
          clientEmail: user?.email || '',
          clientName: user?.displayName || user?.email || '',
          planType: selectedPlan,
          topic: problemDescription, // El problema se convierte en el tema de la cita
          selectedDate: (() => {
            console.log('🔄 Procesando selectedDate para cita de pago:');
            console.log('   - selectedDate antes de conversión:', selectedDate);
            const converted = selectedDate ? toLocalYYYYMMDD(selectedDate) : null;
            console.log('   - selectedDate después de conversión:', converted);
            return converted;
          })(),
          selectedTime: (() => {
            console.log('⏰ Procesando selectedTime para cita de pago:');
            console.log('   - selectedTime:', selectedTime);
            return selectedTime;
          })(),
          duration: selectedPlan === '30min' ? 30 : 60,
          status: 'pending_payment',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Guardar en Firestore
        const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
        console.log('Cita de pago guardada con ID: ', docRef.id);
      }
      
      setIsLoading(false);
      setSubmissionType('confirm');
      setStep(5);
    } catch (error) {
      console.error('Error al guardar:', error);
      setError('Error al enviar la solicitud. Por favor, inténtalo de nuevo.');
      setIsLoading(false);
    }
  };
  
  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setRegistrationData({...registrationData, [e.target.name]: e.target.value});
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLoginData({...loginData, [e.target.name]: e.target.value});
  }

  const renderAuthError = () => {
    if (authErrorCode === 'auth/unauthorized-domain') {
      return (
        <div className="pt-2">
            <FirebaseConfigError
              hostname={window.location.hostname}
              projectId={firebaseConfig.projectId}
            />
        </div>
      );
    }
    if (error) {
      return <p className="text-red-500 text-sm text-center pt-2">{error}</p>;
    }
    return null;
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        const isMinCharsMet = problemDescription.length >= minChars;
        return (
          <div>
            <h2 className="text-2xl font-bold text-center text-[var(--text-color)] mb-2">Paso 1: Describe tu Proyecto en Detalle</h2>
            <p className="text-center text-[var(--text-muted)] mb-6">Para que nuestra sesión sea de máximo valor, por favor, dame todo el contexto posible. Describe tu idea o problema, tus objetivos clave, el estado actual de tu proyecto y los principales desafíos que enfrentas. Cuanto más completo sea tu resumen, más productiva será nuestra llamada o consulta.</p>
            <textarea
              rows={6}
              className="glass-textarea"
              placeholder={placeholder}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              maxLength={5000}
            ></textarea>
            <p className={`text-right text-xs mt-2 pr-1 ${isMinCharsMet ? 'text-[var(--text-muted)]' : 'text-red-500 font-semibold'}`}>
              {problemDescription.length} / 5000 (mínimo {minChars} caracteres)
            </p>
            <div className="mt-4 flex items-center">
              <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="sr-only"/>
              <label htmlFor="terms" className="custom-checkbox-glass-container">
                <span className={`custom-checkbox-glass ${termsAccepted ? 'custom-checkbox-glass-checked' : ''}`}>
                    <IoCheckmark className={`custom-checkbox-glass-checkmark ${termsAccepted ? 'custom-checkbox-glass-checkmark-checked' : ''}`} />
                </span>
                <span className="ml-3 block text-sm text-[var(--text-muted)]">
                  Entiendo y acepto los <a href="#/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors">términos del servicio</a> y la <a href="#/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors">política de privacidad</a>.
                </span>
              </label>
            </div>
          </div>
        );
    case 2:
        // Obtener los planes del contexto
        const { plans: contextPlans } = usePlans();
        
        // Mapear los planes del contexto al formato que espera el componente
        const plans = contextPlans.map(plan => ({
            id: plan.id,
            name: plan.name,
            price: plan.price,
            duration: plan.duration,
            desc: plan.description
        }));
        return (
            <div>
                <h2 className="text-2xl font-bold text-center text-[var(--text-color)] mb-2">Elige tu Plan</h2>
                <p className="text-center text-[var(--text-muted)] mb-6">Selecciona la opción que mejor se adapte a tu necesidad actual.</p>
                <div className="space-y-4">
                    {plans.map(plan => (
                        <div key={plan.id} onClick={() => setSelectedPlan(plan.id as 'free' | '30min' | '60min')}
                            className={`plan-card-glass ${selectedPlan === plan.id ? 'plan-card-glass-selected' : ''}`}>
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg text-[var(--text-color)]">{plan.name}</h3>
                                <p className="font-bold text-lg text-[var(--primary-color)]">{plan.price}</p>
                            </div>
                            <p className="text-sm text-[var(--text-muted)]">{plan.desc}</p>
                            <p className="text-sm font-semibold text-gray-500 mt-1">{plan.duration}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    case 3:
        return (
            <div>
                <h2 className="text-2xl font-bold text-center text-[var(--text-color)] mb-2">Agenda tu Sesión</h2>
                <p className="text-center text-[var(--text-muted)] mb-6">Selecciona una fecha y hora disponibles (L-V, 9:00 - 16:00).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const handlePrevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
                        const handleNextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

                        const year = currentMonth.getFullYear();
                        const month = currentMonth.getMonth();
                        const firstDayOfMonth = new Date(year, month, 1).getDay();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        
                        const daysOfWeek = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
                        const startDayIndex = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

                        const days = Array.from({ length: startDayIndex }, (_, i) => <div key={`empty-${i}`} className="w-10 h-10"></div>);

                        for (let day = 1; day <= daysInMonth; day++) {
                            const date = new Date(year, month, day);
                            const isPast = date < today;
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                            const isDisabled = isPast || isWeekend;
                            const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
                            const isToday = date.getTime() === today.getTime();

                            days.push(
                                <button
                                    key={day}
                                    disabled={isDisabled}
                                    onClick={() => {
                                        console.log('🗓️ CLICK EN FECHA:', date);
                                        console.log('   - Date object:', date);
                                        console.log('   - toString():', date.toString());
                                        console.log('   - instanceof Date:', date instanceof Date);
                                        setSelectedDate(date);
                                        console.log('   - selectedDate después de set:', date);
                                    }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200
                                    ${isSelected ? 'bg-[var(--primary-color)] text-white shadow-lg' : ''}
                                    ${!isSelected && isToday ? 'border-2 border-[var(--primary-color)]' : ''}
                                    ${!isSelected && !isDisabled ? 'hover:bg-[var(--nav-inactive-hover-bg)]' : ''}
                                    ${isDisabled ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-[var(--text-color)]'}
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        }

                        return (
                            <div className="plan-card-glass p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-[var(--nav-inactive-hover-bg)]"><IoChevronBack /></button>
                                    <h3 className="font-bold text-lg text-center text-[var(--text-color)] capitalize">
                                        {new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentMonth)}
                                    </h3>
                                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-[var(--nav-inactive-hover-bg)]"><IoChevronForward /></button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-xs text-[var(--text-muted)] mb-2 font-bold">
                                    {daysOfWeek.map(day => <div key={day}>{day}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-y-1 place-items-center">{days}</div>
                            </div>
                        )
                   })()}
                   
                   {(() => {
                        if (!selectedDate) {
                            return (
                                <div>
                                   <h3 className="font-bold text-lg mb-2 text-center text-[var(--text-color)]">Horarios Disponibles</h3>
                                   <div className="plan-card-glass aspect-[4/3] flex items-center justify-center">
                                       <p className="text-[var(--text-muted)] text-center p-4">Selecciona una fecha en el calendario para ver los horarios.</p>
                                   </div>
                               </div>
                            )
                        }

                       const interval = selectedPlan === '60min' ? 60 : 30;
                       const slots = [];
                       const now = new Date();
                       const isToday = selectedDate.toDateString() === now.toDateString();

                       for (let hour = 9; hour < 16; hour++) {
                           for (let minute = 0; minute < 60; minute += interval) {
                               const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                               const slotTime = new Date(selectedDate);
                               slotTime.setHours(hour, minute, 0, 0);
                               const isDisabled = isToday && slotTime < now;
                               if (hour * 60 + minute < 16 * 60) {
                                   slots.push(
                                       <button
                                           key={time}
                                           disabled={isDisabled}
                                           onClick={() => {
                                               console.log('⏰ CLICK EN HORA:', time);
                                               console.log('   - Time string:', time);
                                               console.log('   - typeof:', typeof time);
                                               console.log('   - length:', time.length);
                                               setSelectedTime(time);
                                               console.log('   - selectedTime después de set:', time);
                                           }}
                                           className={`p-2 rounded-lg font-semibold text-sm transition-colors duration-200 w-full
                                           ${selectedTime === time ? 'bg-[var(--primary-color)] text-white shadow-md' : ''}
                                           ${!isDisabled && selectedTime !== time ? 'bg-[var(--input-bg)] hover:bg-[var(--nav-inactive-hover-bg)]' : ''}
                                           ${isDisabled ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : ''}
                                           `}
                                       >
                                           {time}
                                       </button>
                                   );
                               }
                           }
                       }
                       return (
                           <div>
                                <h3 className="font-bold text-lg mb-2 text-center text-[var(--text-color)] capitalize">
                                    {new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDate)}
                                </h3>
                               <div className="plan-card-glass p-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                                   {slots}
                               </div>
                           </div>
                       )
                   })()}
                </div>
            </div>
        );
    case 4:
        if (user) {
            const planDetails = { free: "Consulta por Email", "30min": "Sesión Estratégica (30 min)", "60min": "Consultoría Completa (1 hora)" };
            return (
                 <div className="text-center">
                    <h2 className="text-2xl font-bold text-center text-[var(--text-color)] mb-2">Confirma tu Consulta</h2>
                    <p className="text-center text-[var(--text-muted)] mb-6">Revisa los detalles y envía tu solicitud.</p>
                    <div className="bg-[var(--input-bg)] p-6 rounded-2xl border border-[var(--border-color)] text-left space-y-4">
                        <div>
                            <h4 className="font-semibold text-[var(--text-color)]">Usuario</h4>
                            <p className="text-[var(--text-muted)]">{user?.displayName || user?.email}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[var(--text-color)]">Plan Seleccionado</h4>
                            <p className="text-[var(--text-muted)]">{selectedPlan ? planDetails[selectedPlan] : 'No seleccionado'}</p>
                        </div>
                         {selectedDate && selectedTime && (
                             <div>
                                <h4 className="font-semibold text-[var(--text-color)]">Fecha y Hora</h4>
                                <p className="text-[var(--text-muted)] capitalize">{new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(`${selectedDate.toDateString()} ${selectedTime}`))}</p>
                            </div>
                         )}
                        <div>
                            <h4 className="font-semibold text-[var(--text-color)]">Resumen del Problema</h4>
                            <p className="text-[var(--text-muted)] max-h-24 overflow-y-auto text-sm">"{problemDescription}"</p>
                        </div>
                    </div>
                 </div>
            );
        }

        if (authMode === 'register') {
            return (
                <div className="w-full max-w-sm mx-auto">
                    <h2 className="text-2xl font-bold text-center text-[var(--text-color)] mb-2">Crea tu Cuenta para Continuar</h2>
                    <p className="text-center text-[var(--text-muted)] mb-6">El último paso. Crea tu cuenta para guardar tu selección.</p>
                    {renderAuthError()}
                    <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-4">
                        <div className="relative">
                            <IoPersonOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input type="text" placeholder="Nombre completo" name="fullName" className="glass-input" value={registrationData.fullName} onChange={handleRegistrationChange} required />
                        </div>
                        <div className="relative">
                            <IoMailOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input type="email" placeholder="Email" name="email" className="glass-input" value={registrationData.email} onChange={handleRegistrationChange} required />
                        </div>
                        <div className="relative">
                        <IoLockClosedOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input type="password" placeholder="Crea una contraseña (mín. 6 caracteres)" name="password" className="glass-input" value={registrationData.password} onChange={handleRegistrationChange} required />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full btn-cta flex-1 py-3 mt-2">
                            {isLoading ? 'Creando...' : 'Crear Cuenta y Enviar'}
                        </button>
                    </form>
                    
                    <div className="my-6 flex items-center">
                        <div className="flex-grow border-t border-[var(--border-color)]"></div>
                        <span className="flex-shrink mx-4 text-[var(--text-muted)] text-sm">o</span>
                        <div className="flex-grow border-t border-[var(--border-color)]"></div>
                    </div>
                    <button onClick={handleGoogleAuth} disabled={isLoading} className="w-full flex items-center justify-center bg-white/90 dark:bg-white/10 border border-transparent dark:border-[var(--border-color)] text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-xl hover:bg-white dark:hover:bg-white/20 transition disabled:opacity-50">
                        <IoLogoGoogle className="mr-2 text-lg text-[#4285F4]" /> {isLoading ? 'Procesando...' : 'Continuar con Google'}
                    </button>
                    <p className="text-center text-sm text-[var(--text-muted)] mt-6">
                        ¿Ya tienes una cuenta?{' '}
                        <button onClick={() => setAuthMode('login')} className="font-semibold text-[var(--primary-color)] hover:underline">Inicia sesión</button>
                    </p>
                </div>
            );
        }
        
        return (
            <div className="w-full max-w-sm mx-auto">
                <h2 className="text-2xl font-bold text-center text-[var(--text-color)] mb-2">Acceso de Usuario</h2>
                <p className="text-center text-[var(--text-muted)] mb-6">Inicia sesión para guardar tu consulta.</p>
                {renderAuthError()}
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                    <div className="relative">
                        <IoMailOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input type="email" placeholder="Email" name="email" className="glass-input" value={loginData.email} onChange={handleLoginChange} required />
                    </div>
                    <div className="relative">
                        <IoLockClosedOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input type="password" placeholder="Contraseña" name="password" className="glass-input" value={loginData.password} onChange={handleLoginChange} required />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full btn-cta flex-1 py-3 mt-2">
                        {isLoading ? 'Iniciando...' : 'Iniciar Sesión y Enviar'}
                    </button>
                </form>

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-[var(--border-color)]"></div>
                    <span className="flex-shrink mx-4 text-[var(--text-muted)] text-sm">o</span>
                    <div className="flex-grow border-t border-[var(--border-color)]"></div>
                </div>
                <button onClick={handleGoogleAuth} disabled={isLoading} className="w-full flex items-center justify-center bg-white/90 dark:bg-white/10 border border-transparent dark:border-[var(--border-color)] text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-xl hover:bg-white dark:hover:bg-white/20 transition disabled:opacity-50">
                    <IoLogoGoogle className="mr-2 text-lg text-[#4285F4]" /> {isLoading ? 'Procesando...' : 'Continuar con Google'}
                </button>
                <p className="text-center text-sm text-[var(--text-muted)] mt-6">
                    ¿No tienes una cuenta?{' '}
                    <button onClick={() => setAuthMode('register')} className="font-semibold text-[var(--primary-color)] hover:underline">Regístrate</button>
                </p>
            </div>
        );
    case 5:
        const isRegister = submissionType === 'register';
        return (
            <div className="text-center py-8">
                 {isRegister ? 
                    <IoMailOpenOutline className="w-20 h-20 text-green-500 mx-auto mb-4" /> :
                    <IoCheckmarkDoneCircleOutline className="w-20 h-20 text-green-500 mx-auto mb-4" />
                 }
                <h2 className="text-2xl font-bold text-center text-[var(--text-color)] mb-2">
                    {isRegister ? '¡Revisa tu correo!' : '¡Consulta Enviada!'}
                </h2>
                {isRegister ? (
                    <p className="text-center text-[var(--text-muted)] mb-6 max-w-md mx-auto">
                        Hemos enviado un enlace de verificación a <strong>{registrationData.email}</strong>. 
                        Por favor, haz clic en el enlace para activar tu cuenta. Podrás gestionar tu cita desde tu panel de control una vez verificado.
                    </p>
                ) : (
                     <p className="text-center text-[var(--text-muted)] mb-6 max-w-md mx-auto">
                        Tu solicitud de consulta ha sido enviada con éxito. Recibirás una confirmación y los siguientes pasos por correo electrónico.
                    </p>
                )}
            </div>
        );
      default:
        return null;
    }
  };

  const getButtonState = () => {
      switch(step) {
          case 1:
            return !termsAccepted || problemDescription.length < minChars;
          case 2: return !selectedPlan;
          case 3: 
            if (selectedPlan === 'free') return false;
            return !selectedDate || !selectedTime;
          case 4:
            if (user) return isLoading;
            return false;
          default: return false;
      }
  }

  return (
    <div 
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className={`modal-glass-content w-full max-w-3xl p-4 relative transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--nav-inactive-hover-bg)] transition-all duration-300 z-20"
        >
          <IoClose className="text-lg" />
        </button>
        { step <= 4 && <ProgressBar step={step} isLoggedIn={!!user} />}
        <div className="px-2 min-h-[300px] flex items-center justify-center">
            {renderStepContent()}
        </div>

        {step < 4 && (
             <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
                <div>
                    {step > 1 && <button onClick={handleBack} className="btn-secondary-glass">Atrás</button>}
                </div>
                <div>
                    <button onClick={handleNext} disabled={getButtonState()} className="btn-cta text-base py-3 px-6">
                        Continuar
                    </button>
                </div>
            </div>
        )}
        
        {step === 4 && user && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
                 <button onClick={handleBack} className="btn-secondary-glass">Atrás</button>
                 <button onClick={handleConfirmAndSubmit} disabled={getButtonState()} className="btn-cta text-base py-3 px-6">
                     {isLoading ? 'Enviando...' : 'Confirmar y Enviar'}
                 </button>
            </div>
        )}
        
        {step === 4 && !user && (
             <div className="flex justify-center items-center mt-4 pt-4 border-t border-[var(--border-color)]">
                 <button onClick={handleBack} className="btn-secondary-glass">Atrás</button>
            </div>
        )}


        {step === 5 && (
             <div className="flex justify-end items-center mt-4 pt-4 border-t border-[var(--border-color)]">
                <button onClick={onClose} className="btn-cta text-base py-3 px-6">
                    Entendido
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default BookingModal;