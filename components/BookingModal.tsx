
import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import { bookingPlaceholders } from '../constants';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

// Definimos los tipos para las props del componente.
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null; // El usuario puede ser nulo si no ha iniciado sesión.
}

// Pasos del modal.
const STEPS = {
  SERVICES: 1,
  DETAILS: 2,
  CONFIRMATION: 3,
  SUCCESS: 4,
};

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, user }) => {
  // Estado para controlar el paso actual del modal.
  // Si el usuario ya está logueado, empezamos en el paso de servicios.
  const [step, setStep] = useState(user ? STEPS.SERVICES : STEPS.DETAILS);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reiniciar el estado del modal cuando se abre o cierra.
  useEffect(() => {
    if (isOpen) {
      setStep(user ? STEPS.SERVICES : STEPS.DETAILS);
      setSelectedServices([]);
      setIsLoading(false);
    }
  }, [isOpen, user]);

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  // Función para guardar la consulta en Firestore.
  const handleConfirmBooking = async () => {
    if (!user) {
      alert("Error: Debes estar registrado para poder agendar una consulta.");
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
    } catch (error) {
      console.error("Error al guardar la consulta: ", error);
      alert("Hubo un error al agendar tu consulta. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <IoClose size={28} />
        </button>

        {/* Lógica condicional para mostrar el contenido de cada paso */}
        
        {step === STEPS.SERVICES && (
          <div>
            <h2 className="text-2xl font-bold mb-1">Elige los Servicios</h2>
            <p className="text-[var(--text-muted)] mb-6">Selecciona uno o más servicios que te interesen.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {bookingPlaceholders.services.map(service => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`p-4 rounded-lg border-2 text-center font-semibold transition-all duration-200 ${selectedServices.includes(service) ? 'bg-blue-600 text-white border-blue-600 scale-105' : 'bg-transparent border-[var(--border-color)] hover:border-[var(--primary-color)]'}`}
                >
                  {service}
                </button>
              ))}
            </div>
            <button 
              onClick={handleNextStep} 
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all font-bold disabled:opacity-50"
              disabled={selectedServices.length === 0}
            >
              Siguiente
            </button>
          </div>
        )}
        
        {/* Aquí iría el paso de DETALLES si el usuario no está logueado */}

        {step === STEPS.CONFIRMATION && (
          <div>
            <h2 className="text-2xl font-bold mb-1">Confirma tu Consulta</h2>
            <p className="text-[var(--text-muted)] mb-6">Revisa los detalles y agenda tu sesión.</p>
            <div className="bg-[var(--input-bg)] p-4 rounded-lg mb-6">
              <h3 className="font-bold text-lg mb-2">Servicios Seleccionados:</h3>
              <ul className="list-disc list-inside text-[var(--text-color)]">
                {selectedServices.map(s => <li key={s}>{s}</li>)}
              </ul>
            </div>
            <div className="flex justify-between items-center">
              <button onClick={handlePrevStep} className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-semibold">
                Anterior
              </button>
              <button onClick={handleConfirmBooking} className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-bold" disabled={isLoading}>
                {isLoading ? 'Agendando...' : 'Confirmar y Agendar'}
              </button>
            </div>
          </div>
        )}
        
        {step === STEPS.SUCCESS && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-400 mb-2">¡Consulta Agendada!</h2>
            <p className="text-[var(--text-muted)] mb-6">Gracias. He recibido tu solicitud y me pondré en contacto contigo muy pronto para coordinar los próximos pasos.</p>
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
