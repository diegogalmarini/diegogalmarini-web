
import React, { useState, useEffect, useCallback } from 'react';
import { IoClose, IoPersonOutline, IoLockClosedOutline, IoMailOutline, IoLogoGoogle } from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import { bookingPlaceholders } from '../constants';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

// --- Tipos y Constantes ---

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const STEPS = {
  DETAILS: 1,      // Pedir email para saber si es usuario nuevo o existente
  LOGIN: 2,        // Si el usuario existe, pedir contraseña
  REGISTER: 3,     // Si es nuevo, pedir nombre y contraseña
  SERVICES: 4,     // Seleccionar servicios (para usuarios ya logueados)
  CONFIRMATION: 5, // Confirmar la selección
  SUCCESS: 6,      // Éxito
};

// --- Componente Principal ---

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, user }) => {
  const { checkIfEmailExists, registerWithEmail, loginWithEmail, signInWithGoogle } = useAuth();
  
  const [step, setStep] = useState(STEPS.DETAILS);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Efecto para resetear el estado del modal cuando se abre o cierra
  // y para saltar al paso de servicios si el usuario ya está logueado.
  useEffect(() => {
    if (isOpen) {
      setStep(user ? STEPS.SERVICES : STEPS.DETAILS);
      setEmail('');
      setName('');
      setPassword('');
      setSelectedServices([]);
      setError('');
      setIsLoading(false);
    }
  }, [isOpen, user]);

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev > STEPS.DETAILS ? prev - 1 : STEPS.DETAILS);

  // --- Lógica de Autenticación y Flujo ---

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const emailExists = await checkIfEmailExists(email);
    setStep(emailExists ? STEPS.LOGIN : STEPS.REGISTER);
    setIsLoading(false);
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await registerWithEmail(name, email, password);
      setStep(STEPS.SERVICES); // El hook de `onAuthStateChanged` actualizará el `user`
    } catch (err: any) {
      setError(err.message || "Error al registrar la cuenta.");
    }
    setIsLoading(false);
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await loginWithEmail(email, password);
       setStep(STEPS.SERVICES);
    } catch (err: any) {
      setError("Email o contraseña incorrectos.");
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
        await signInWithGoogle();
        setStep(STEPS.SERVICES);
    } catch (err: any) {
        setError("No se pudo iniciar sesión con Google.");
    }
    setIsLoading(false);
  }

  // --- Lógica de Agendamiento ---

  const toggleService = (service: string) => setSelectedServices(prev =>
    prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
  );

  const handleConfirmBooking = async () => {
    if (!user) {
      setError("Error fatal: No hay usuario al confirmar. Por favor, reinicia el proceso.");
      return;
    }
    setIsLoading(true);
    try {
      const db = getFirestore();
      await addDoc(collection(db, "consultations"), {
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        services: selectedServices,
        status: 'Pendiente',
        createdAt: serverTimestamp(),
      });
      setStep(STEPS.SUCCESS);
    } catch (err: any) {
      setError("Hubo un error al agendar tu consulta. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };


  if (!isOpen) return null;

  // --- Renderizado ---

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <IoClose size={28} />
        </button>
        
        {/* Renderizado condicional basado en el paso actual */}

        {/* --- PASO 1: PEDIR EMAIL --- */}
        {step === STEPS.DETAILS && (
          <form onSubmit={handleEmailSubmit}>
            <h2 className="text-2xl font-bold mb-1">Comencemos</h2>
            <p className="text-[var(--text-muted)] mb-6">Introduce tu email para continuar.</p>
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <div className="relative mb-4">
                <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg p-3 pl-10"/>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold" disabled={isLoading}>
              {isLoading ? 'Comprobando...' : 'Continuar'}
            </button>
            <div className="relative my-4 text-center"><span className="absolute top-1/2 left-0 w-full h-px bg-[var(--border-color)]"></span><span className="relative bg-[var(--card-bg)] px-2 text-sm text-[var(--text-muted)]">o</span></div>
            <button type="button" onClick={handleGoogleSignIn} className="w-full flex items-center justify-center bg-white text-black py-3 rounded-lg hover:bg-gray-200 font-bold" disabled={isLoading}>
                <IoLogoGoogle className="mr-2"/> Continuar con Google
            </button>
          </form>
        )}

        {/* --- PASO 2: LOGIN --- */}
        {step === STEPS.LOGIN && (
            <form onSubmit={handleLogin}>
                <h2 className="text-2xl font-bold mb-1">¡Hola de nuevo!</h2>
                <p className="text-[var(--text-muted)] mb-6">Introduce tu contraseña para acceder a tu cuenta.</p>
                {error && <p className="text-red-400 mb-4">{error}</p>}
                <div className="relative mb-4">
                    <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" required className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg p-3 pl-10"/>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold" disabled={isLoading}>
                    {isLoading ? 'Accediendo...' : 'Iniciar Sesión'}
                </button>
                <button type="button" onClick={handlePrevStep} className="mt-2 text-sm text-gray-400 hover:underline">Volver</button>
            </form>
        )}

        {/* --- PASO 3: REGISTRO --- */}
        {step === STEPS.REGISTER && (
            <form onSubmit={handleRegistration}>
                <h2 className="text-2xl font-bold mb-1">Crea tu cuenta</h2>
                <p className="text-[var(--text-muted)] mb-6">Estás a un paso de agendar tu consulta.</p>
                {error && <p className="text-red-400 mb-4">{error}</p>}
                <div className="relative mb-4">
                    <IoPersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre completo" required className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg p-3 pl-10"/>
                </div>
                <div className="relative mb-4">
                    <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Crea una contraseña (mín. 6 caracteres)" required className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg p-3 pl-10"/>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold" disabled={isLoading}>
                    {isLoading ? 'Creando cuenta...' : 'Crear Cuenta y Continuar'}
                </button>
                 <button type="button" onClick={handlePrevStep} className="mt-2 text-sm text-gray-400 hover:underline">Volver</button>
            </form>
        )}
        
        {/* Aquí irían los demás pasos: SERVICES, CONFIRMATION, SUCCESS */}

      </div>
    </div>
  );
};

export default BookingModal;
