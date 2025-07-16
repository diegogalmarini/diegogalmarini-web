
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common';
import { IoCalendarOutline, IoPeopleOutline, IoAddCircleOutline, IoLogOutOutline, IoFileTrayStackedOutline, IoWarningOutline } from 'react-icons/io5';
import { getFirestore, collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';

// --- Helper Components ---

const DashboardCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode, action?: React.ReactNode }> = ({ icon, title, children, action }) => (
    <Card className="flex flex-col">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
                <div className="text-3xl text-[var(--primary-color)] mr-4">{icon}</div>
                <h2 className="text-xl font-bold text-[var(--text-color)]">{title}</h2>
            </div>
            {action}
        </div>
        <div className="text-[var(--text-muted)] flex-grow pl-12">{children}</div>
    </Card>
);

const VerificationNeeded: React.FC = () => {
    // Componente para el aviso de verificación de email (sin cambios)
    const { sendVerificationEmail } = useAuth();
    const [emailSent, setEmailSent] = React.useState(false);
    
    const handleResend = async () => {
        try {
            await sendVerificationEmail();
            setEmailSent(true);
        } catch (error) {
            console.error("Error resending verification email", error);
        }
    };

    return (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 p-4 rounded-2xl mb-8 flex items-start space-x-4">
            <IoWarningOutline className="text-3xl text-yellow-400 flex-shrink-0 mt-1" />
            <div>
                <h3 className="font-bold text-lg text-white">Verifica tu dirección de correo electrónico</h3>
                <p className="text-yellow-200/80">Para acceder a todas las funcionalidades, por favor, haz clic en el enlace de verificación que enviamos a tu correo.</p>
                {!emailSent ? (
                    <button onClick={handleResend} className="mt-2 font-semibold text-white hover:underline">Reenviar correo de verificación</button>
                ) : (
                    <p className="mt-2 font-semibold text-green-400">¡Correo de verificación reenviado!</p>
                )}
            </div>
        </div>
    )
}

// --- Dashboards ---

const AdminDashboard: React.FC<{ onBookCallClick: () => void }> = ({ onBookCallClick }) => (
    // Panel de Administrador (sin cambios)
    <div className="space-y-8">
        <div>
            <h1 className="text-4xl font-bold">Panel de Administrador</h1>
            <p className="text-lg text-[var(--text-muted)] mt-2">Gestiona citas, clientes y planes.</p>
        </div>
        {/* ... contenido del admin ... */}
    </div>
);

// Tipo para definir la estructura de una consulta
interface Consultation {
  id: string;
  services: string[];
  status: 'Pendiente' | 'Confirmada' | 'Completada';
  createdAt: Timestamp;
}

const UserDashboard: React.FC<{ onBookCallClick: () => void }> = ({ onBookCallClick }) => {
    const { user } = useAuth();
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // useEffect para obtener las consultas del usuario en tiempo real.
    useEffect(() => {
        if (!user) return;

        const db = getFirestore();
        const consultationsRef = collection(db, 'consultations');
        const q = query(consultationsRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userConsultations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Consultation));
            setConsultations(userConsultations);
            setIsLoading(false);
        });

        return () => unsubscribe(); // Limpiar el listener al desmontar el componente.
    }, [user]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">Mi Cuenta</h1>
                <p className="text-lg text-[var(--text-muted)] mt-2">Gestiona tus datos, citas y consultas desde este panel.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <DashboardCard icon={<IoCalendarOutline />} title="Mis Consultas">
                    {isLoading ? (
                        <p>Cargando tus consultas...</p>
                    ) : consultations.length > 0 ? (
                        <ul className="space-y-3 mt-2">
                            {consultations.map(consult => (
                                <li key={consult.id} className="p-3 bg-[var(--input-bg)] rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-white">{consult.services.join(', ')}</span>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${consult.status === 'Pendiente' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>
                                            {consult.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--text-muted)] mt-1">
                                        Agendada el: {new Date(consult.createdAt?.toDate()).toLocaleDateString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-2">No tienes ninguna consulta agendada. ¡Anímate a crear la primera!</p>
                    )}
                </DashboardCard>
                <DashboardCard icon={<IoAddCircleOutline />} title="Nueva Consulta" action={
                    <button onClick={onBookCallClick} className="btn-cta text-sm px-4 py-2">Agendar Ahora</button>
                }>
                    <p className="mt-2">¿Tienes un nuevo reto o necesitas seguimiento? Agenda una nueva sesión estratégica.</p>
                </DashboardCard>
            </div>
        </div>
    );
};


// --- Página Principal del Dashboard ---

const DashboardPage: React.FC<{ onBookCallClick: () => void }> = ({ onBookCallClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    if (!user) return null;

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const isAdmin = user.email === 'diegogalmarini@gmail.com';

    return (
        <div className="py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-4">
                        <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=0284c7&color=fff`} alt="Tu perfil" className="w-16 h-16 rounded-full"/>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Bienvenido, {user.displayName || user.email?.split('@')[0]}</h1>
                            <p className="text-sky-300">{isAdmin ? "Rol: Administrador" : "Rol: Cliente"}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center font-semibold text-red-400 hover:text-red-500 transition text-lg">
                        <IoLogOutOutline className="mr-2" />
                        Cerrar Sesión
                    </button>
                </div>
                
                {!user.emailVerified && !isAdmin && <VerificationNeeded />}
                
                {isAdmin ? <AdminDashboard onBookCallClick={onBookCallClick} /> : <UserDashboard onBookCallClick={onBookCallClick} />}
            </div>
        </div>
    );
};

export default DashboardPage;
