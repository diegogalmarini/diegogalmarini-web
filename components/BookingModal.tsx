
import React, { useState, useEffect } from 'react';
import { IoClose, IoPersonOutline, IoLockClosedOutline, IoMailOutline, IoLogoGoogle } from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import { bookingPlaceholders } from '../constants';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

// --- Types and Constants ---
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}
const STEPS = {
  DETAILS: 1, LOGIN: 2, REGISTER: 3, SERVICES: 4, CONFIRMATION: 5, SUCCESS: 6,
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

  useEffect(() => {
    if (isOpen) {
      const initialStep = user ? STEPS.SERVICES : STEPS.DETAILS;
      setStep(initialStep);
      setEmail('');
      setName('');
      setPassword('');
      setSelectedServices([]);
      setError('');
      setIsLoading(false);
    }
  }, [isOpen, user]);

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError('');
    try {
      const emailExists = await checkIfEmailExists(email);
      setStep(emailExists ? STEPS.LOGIN : STEPS.REGISTER);
    } catch (err) {
      setError("Ocurrió un error. Inténtalo de nuevo.");
    }
    setIsLoading(false);
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await registerWithEmail(name, email, password);
      setStep(STEPS.SERVICES);
    } catch (err: any) {
      setError(err.code === 'auth/email-already-in-use' ? 'Este email ya está registrado.' : 'Error al crear la cuenta.');
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
    } catch (err: any)      {
      setError("Email o contraseña incorrectos. Por favor, verifica tus datos.");
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
        console.error(err);
        setError("No se pudo iniciar sesión con Google. Revisa que el dominio esté autorizado en Firebase.");
    }
    setIsLoading(false);
  }

  const toggleService = (service: string) => setSelectedServices(prev =>
    prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
  );

  const handleConfirmBooking = async () => {
    if (!user) {
      setError("Error: Debes estar conectado para confirmar.");
      return;
    }
    setIsLoading(true);
    try {
      const db = getFirestore();
      await addDoc(collection(db, "consultations"), {
        userId: user.uid, userName: user.displayName, userEmail: user.email,
        services: selectedServices, status: 'Pendiente', createdAt: serverTimestamp(),
      });
      setStep(STEPS.SUCCESS);
    } catch (err) {
      setError("No se pudo guardar tu consulta. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative text-white border border-slate-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <IoClose size={28} />
        </button>

        {step === STEPS.DETAILS && (
          <form onSubmit={handleEmailSubmit}>
            <h2 className="text-2xl font-bold mb-1 text-white">Comencemos</h2>
            <p className="text-slate-400 mb-6">Introduce tu email para continuar.</p>
            {error && <p className="text-red-500 mb-4 text-sm font-medium">{error}</p>}
            <div className="relative mb-4">
              <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 pl-10 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 transition-colors" disabled={isLoading || !email}>
              {isLoading ? 'Comprobando...' : 'Continuar'}
            </button>
            <div className="relative my-4 text-center"><span className="absolute top-1/2 left-0 w-full h-px bg-slate-700"></span><span className="relative bg-slate-900 px-2 text-sm text-slate-400">o</span></div>
            <button type="button" onClick={handleGoogleSignIn} className="w-full flex items-center justify-center bg-white text-black py-3 rounded-lg hover:bg-gray-200 font-bold disabled:opacity-50 transition-colors" disabled={isLoading}>
              <IoLogoGoogle className="mr-3" /> Continuar con Google
            </button>
          </form>
        )}

        {step === STEPS.LOGIN && (
          <form onSubmit={handleLogin}>
            <h2 className="text-2xl font-bold mb-1 text-white">¡Hola de nuevo!</h2>
            <p className="text-slate-400 mb-6">El email <strong className="text-white">{email}</strong> ya está registrado.</p>
            {error && <p className="text-red-500 mb-4 text-sm font-medium">{error}</p>}
            <div className="relative mb-4">
              <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" required className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 pl-10 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 transition-colors" disabled={isLoading}>
              {isLoading ? 'Accediendo...' : 'Iniciar Sesión'}
            </button>
            <button type="button" onClick={() => setStep(STEPS.DETAILS)} className="mt-3 text-sm text-slate-400 hover:underline w-full">Usar otro email</button>
          </form>
        )}
        
        {step === STEPS.REGISTER && (
           <form onSubmit={handleRegistration}>
                <h2 className="text-2xl font-bold mb-1 text-white">Crea tu cuenta</h2>
                <p className="text-slate-400 mb-6">Estás a un paso. Completa tus datos.</p>
                {error && <p className="text-red-500 mb-4 text-sm font-medium">{error}</p>}
                <div className="relative mb-4">
                    <IoPersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre completo" required className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 pl-10 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div className="relative mb-4">
                    <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Crea una contraseña (mín. 6 caracteres)" required className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 pl-10 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 transition-colors" disabled={isLoading}>
                    {isLoading ? 'Creando cuenta...' : 'Crear Cuenta y Continuar'}
                </button>
                 <button type="button" onClick={() => setStep(STEPS.DETAILS)} className="mt-3 text-sm text-slate-400 hover:underline w-full">Volver</button>
            </form>
        )}

        {step === STEPS.SERVICES && (
          <div>
            <h2 className="text-2xl font-bold mb-1 text-white">Elige los Servicios</h2>
            <p className="text-slate-400 mb-6">Selecciona uno o más servicios de tu interés.</p>
            {bookingPlaceholders && bookingPlaceholders.services ? (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {bookingPlaceholders.services.map(service => (
                  <button key={service} onClick={() => toggleService(service)} className={`p-4 rounded-lg border-2 text-center font-semibold transition-all duration-200 ${selectedServices.includes(service) ? 'bg-blue-600 text-white border-blue-500 scale-105' : 'bg-slate-800 border-slate-700 hover:border-blue-500'}`}>
                    {service}
                  </button>
                ))}
              </div>
            ) : <p className="text-red-500">Error: No se pudieron cargar los servicios.</p>}
            <button onClick={handleNextStep} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50" disabled={selectedServices.length === 0}>
              Siguiente
            </button>
          </div>
        )}

        {step === STEPS.CONFIRMATION && (
          <div>
            <h2 className="text-2xl font-bold mb-1 text-white">Confirma tu Consulta</h2>
            <p className="text-slate-400 mb-6">Revisa los detalles y agenda tu sesión.</p>
            <div className="bg-slate-800 p-4 rounded-lg mb-6">
              <h3 className="font-bold text-lg mb-2 text-white">Servicios Seleccionados:</h3>
              <ul className="list-disc list-inside text-slate-300">
                {selectedServices.map(s => <li key={s}>{s}</li>)}
              </ul>
            </div>
            <div className="flex justify-between items-center gap-4">
              <button onClick={handlePrevStep} className="w-full bg-slate-600 text-white py-3 rounded-lg hover:bg-slate-700 font-semibold transition-colors">
                Anterior
              </button>
              <button onClick={handleConfirmBooking} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold transition-colors" disabled={isLoading}>
                {isLoading ? 'Agendando...' : 'Confirmar y Agendar'}
              </button>
            </div>
          </div>
        )}
        
        {step === STEPS.SUCCESS && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-400 mb-2">¡Consulta Agendada!</h2>
            <p className="text-slate-300 mb-6">Gracias. He recibido tu solicitud y me pondré en contacto contigo muy pronto para coordinar los próximos pasos.</p>
            <button onClick={onClose} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold">
              Cerrar
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookingModal;
