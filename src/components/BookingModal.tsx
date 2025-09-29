'use client';

import React, { useState, useEffect } from 'react';
import { bookingPlaceholders } from '../lib/constants';
import {
  IoPersonOutline,
  IoLogoGoogle,
  IoMailOutline,
  IoLockClosedOutline,
  IoClose,
  IoCheckmark,
  IoChevronBack,
  IoChevronForward,
  IoCheckmarkDoneCircleOutline
} from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import { usePlans } from '../contexts/PlansContext';
import { useModal } from '../contexts/ModalContext';
import { submitBooking } from '@/app/actions'; // <-- IMPORTACIÓN AÑADIDA

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
      <div className="relative mb-3">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        {steps.map((s) => (
          <div key={s.num} className="flex flex-col items-center text-center">
            <p className={`text-xs font-semibold transition-colors duration-300 ${
              step >= s.num ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BookingModal: React.FC = () => {
  const { user, registerWithEmail, signInWithGoogle, loginWithEmail } = useAuth();
  const { plans } = usePlans();
  const { isModalOpen, closeModal } = useModal();

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
  const [isLoading, setIsLoading] = useState(false);
  const [submissionType, setSubmissionType] = useState<'confirm' | 'register'>('confirm');

  const minChars = 100;
  const isOpen = isModalOpen('booking');

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
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
    setIsLoading(false);
    setSubmissionType('confirm');
  };

  // Placeholder typing effect
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
  }, [authMode]);

  if (!isOpen) return null;

  const handleRegister = async () => {
    setError('');
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
      } else {
        setError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setError('');
    if (step === 2 && selectedPlan === 'free') {
      setStep(4);
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setError('');
    if (step === 4 && selectedPlan === 'free') {
      setStep(2);
      return;
    }
    setStep((s) => Math.max(s - 1, 1));
  };
  
  // --- FUNCIÓN MODIFICADA ---
  const handleConfirmAndSubmit = async () => {
    setIsLoading(true);
    setError('');

    // Prepara los datos para la Server Action
    const toLocalYYYYMMDD = (d: Date): string => {
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const day = d.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const bookingData = {
      clientEmail: user?.email || registrationData.email,
      clientName: user?.displayName || registrationData.fullName || registrationData.email,
      planType: selectedPlan!,
      problemDescription,
      selectedDate: selectedDate ? toLocalYYYYMMDD(selectedDate) : "",
      selectedTime: selectedTime || "",
    };

    try {
      // Llama a la Server Action
      const result = await submitBooking(bookingData, user?.uid || null);
      
      if (result.success) {
        setSubmissionType("confirm");
        setStep(5);
      } else {
        setError(result.error || "No se pudo guardar la consulta. Inténtalo de nuevo.");
      }
    } catch (err: any) {
      console.error('Error al guardar:', err);
      setError("Error inesperado al enviar la solicitud. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegistrationData({...registrationData, [e.target.name]: e.target.value});
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({...loginData, [e.target.name]: e.target.value});
  };

  const renderError = () => {
    if (error) {
      return <p className="text-red-500 text-sm text-center pt-2">{error}</p>;
    }
    return null;
  };

  // Simple calendar component
  const Calendar = () => {
    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today && !isToday;
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      
      days.push(
        <button
          key={day}
          onClick={() => !isPast && setSelectedDate(date)}
          disabled={isPast}
          className={`h-10 w-full text-sm rounded-lg transition-colors ${
            isPast 
              ? 'text-gray-400 cursor-not-allowed' 
              : isSelected
              ? 'bg-blue-600 text-white'
              : isToday
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <IoChevronBack />
          </button>
          <h3 className="font-semibold text-lg">
            {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <IoChevronForward />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  const TimeSlots = () => {
    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30', '18:00'
    ];

    return (
      <div className="grid grid-cols-3 gap-2">
        {timeSlots.map(time => (
          <button
            key={time}
            onClick={() => setSelectedTime(time)}
            className={`py-2 px-3 rounded-lg text-sm transition-colors ${
              selectedTime === time
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {time}
          </button>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        const isMinCharsMet = problemDescription.length >= minChars;
        return (
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Paso 1: Describe tu Proyecto en Detalle
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Para que nuestra sesión sea de máximo valor, por favor, dame todo el contexto posible. 
              Describe tu idea o problema, tus objetivos clave, el estado actual de tu proyecto y los 
              principales desafíos que enfrentas. Cuanto más completo sea tu resumen, más productiva será nuestra llamada o consulta.
            </p>
            <textarea
              rows={6}
              className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl py-3 px-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 resize-none"
              placeholder={placeholder}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              maxLength={5000}
            />
            <p className={`text-right text-xs mt-2 pr-1 ${isMinCharsMet ? 'text-gray-500' : 'text-red-500 font-semibold'}`}>
              {problemDescription.length} / 5000 (mínimo {minChars} caracteres)
            </p>
            <div className="mt-4 flex items-center">
              <input 
                type="checkbox" 
                id="terms" 
                checked={termsAccepted} 
                onChange={(e) => setTermsAccepted(e.target.checked)} 
                className="sr-only"
              />
              <label
                htmlFor="terms"
                className="flex items-center cursor-pointer text-sm text-gray-600 dark:text-gray-400"
              >
                <div className={`mr-3 w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                  termsAccepted 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {termsAccepted && <IoCheckmark className="text-white text-sm" />}
                </div>
                Acepto los{' '}
                <a href="/terms-of-service" target="_blank" className="text-blue-600 hover:underline mx-1">
                  términos de servicio
                </a>{' '}
                y la{' '}
                <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:underline mx-1">
                  política de privacidad
                </a>.
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Paso 2: Elige tu Plan
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Selecciona el plan que mejor se adapte a tus necesidades.
            </p>
            <div className="space-y-4">
              {plans.filter(plan => plan.isActive).map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id as 'free' | '30min' | '60min')}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedPlan === plan.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <span className="text-lg font-bold text-blue-600">
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {plan.duration}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {plan.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Paso 3: Selecciona Fecha y Hora
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Elige cuándo te gustaría tener la consulta.
            </p>
            
            <div className="space-y-6">
              <Calendar />
              
              {selectedDate && (
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                    Horarios disponibles para {selectedDate.toLocaleDateString('es-ES')}:
                  </h3>
                  <TimeSlots />
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        if (user) {
          return (
            <div>
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Paso 4: Confirmar Reserva
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Revisa los detalles de tu consulta antes de confirmar.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Plan:</span>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {plans.find(p => p.id === selectedPlan)?.name}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Fecha:</span>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {selectedDate?.toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Hora:</span>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {selectedTime}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Usuario:</span>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {user.displayName || user.email}
                  </span>
                </div>
              </div>
              
              {renderError()}
              
              <button
                onClick={handleConfirmAndSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? 'Procesando...' : 'Confirmar Reserva'}
              </button>
            </div>
          );
        } else {
          // Authentication step for non-logged users
          return (
            <div>
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Paso 4: Registro
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                {authMode === 'register' ? 'Crea tu cuenta para completar la reserva' : 'Inicia sesión para continuar'}
              </p>
              
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  <button
                    onClick={() => setAuthMode('register')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      authMode === 'register'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Registrarse
                  </button>
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      authMode === 'login'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Iniciar Sesión
                  </button>
                </div>
              </div>
              
              {authMode === 'register' ? (
                <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-4">
                  <div className="relative">
                    <IoPersonOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      name="fullName"
                      value={registrationData.fullName}
                      onChange={handleRegistrationChange}
                      placeholder="Nombre completo"
                      required
                      className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl py-3 px-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div className="relative">
                    <IoMailOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={registrationData.email}
                      onChange={handleRegistrationChange}
                      placeholder="Correo electrónico"
                      required
                      className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl py-3 px-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div className="relative">
                    <IoLockClosedOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      name="password"
                      value={registrationData.password}
                      onChange={handleRegistrationChange}
                      placeholder="Contraseña (mín. 6 caracteres)"
                      required
                      minLength={6}
                      className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl py-3 px-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Procesando...' : 'Crear Cuenta'}
                  </button>
                </form>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                  <div className="relative">
                    <IoMailOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="Correo electrónico"
                      required
                      className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl py-3 px-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div className="relative">
                    <IoLockClosedOutline className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Contraseña"
                      required
                      className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl py-3 px-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Procesando...' : 'Iniciar Sesión'}
                  </button>
                </form>
              )}
              
              <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">o</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              
              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-white dark:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/20 transition disabled:opacity-50"
              >
                <IoLogoGoogle className="mr-2 text-lg text-[#4285F4]" />
                {isLoading ? 'Procesando...' : `${authMode === 'register' ? 'Registrarse' : 'Iniciar sesión'} con Google`}
              </button>
              
              {renderError()}
            </div>
          );
        }

      case 5:
        return (
          <div className="text-center">
            <div className="mb-6">
              <IoCheckmarkDoneCircleOutline className="text-6xl text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {submissionType === 'register' ? '¡Cuenta creada!' : '¡Reserva confirmada!'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {submissionType === 'register' 
                  ? 'Tu cuenta ha sido creada exitosamente. Recibirás un correo de confirmación pronto.'
                  : 'Tu consulta ha sido agendada. Recibirás toda la información por correo electrónico.'
                }
              </p>
            </div>
            
            <button
              onClick={closeModal}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Cerrar
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return problemDescription.length >= minChars && termsAccepted;
      case 2:
        return selectedPlan !== null;
      case 3:
        return selectedDate !== null && selectedTime !== null;
      default:
        return true;
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative transform transition-all duration-300 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <button
          onClick={closeModal}
          aria-label="Cerrar modal"
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 z-10"
        >
          <IoClose className="text-lg" />
        </button>

        {step <= 4 && (
          <ProgressBar step={step} isLoggedIn={!!user} />
        )}

        {renderStepContent()}

        {step < 4 && (
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <IoChevronBack className="mr-1" />
                Anterior
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <IoChevronForward className="ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};