
import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common.tsx';
import { IoCalendarOutline, IoPeopleOutline, IoAddCircleOutline, IoLogOutOutline, IoFileTrayStackedOutline, IoWarningOutline } from 'react-icons/io5';

const DashboardCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode, action?: React.ReactNode }> = ({ icon, title, children, action }) => (
    <Card className="flex flex-col">
        <div className="flex items-start">
            <div className="text-3xl text-[var(--primary-color)] mr-4 flex-shrink-0 mt-1">{icon}</div>
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-[var(--text-color)]">{title}</h2>
                    {action}
                </div>
                <div className="text-[var(--text-muted)] flex-grow">{children}</div>
            </div>
        </div>
    </Card>
);

const VerificationNeeded: React.FC = () => {
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
        <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-200 p-4 rounded-2xl mb-8 flex items-start space-x-4">
            <IoWarningOutline className="text-3xl text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-1" />
            <div>
                <h3 className="font-bold text-lg text-yellow-900 dark:text-white">Verifica tu dirección de correo electrónico</h3>
                <p className="text-yellow-700 dark:text-yellow-200/80">Para acceder a todas las funcionalidades, por favor, haz clic en el enlace de verificación que enviamos a tu correo. Esto asegura que tu cuenta esté protegida.</p>
                {!emailSent ? (
                    <button onClick={handleResend} className="mt-2 font-semibold text-yellow-800 dark:text-white hover:underline">
                        Reenviar correo de verificación
                    </button>
                ) : (
                    <p className="mt-2 font-semibold text-green-600 dark:text-green-400">¡Correo de verificación reenviado! Revisa tu bandeja de entrada.</p>
                )}
            </div>
        </div>
    )
}


const AdminDashboard: React.FC<{onBookCallClick: () => void}> = ({onBookCallClick}) => (
    <div className="space-y-8">
        <div>
            <h1 className="text-4xl font-bold text-[var(--text-color)]">Panel de Administrador</h1>
            <p className="text-lg text-[var(--text-muted)] mt-2">Gestiona tus citas, clientes y planes desde aquí.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <DashboardCard icon={<IoCalendarOutline />} title="Próximas Citas">
                <ul className="space-y-3 mt-2 text-[var(--text-color)]">
                    <li className="p-3 bg-[var(--input-bg)] rounded-lg"><strong>Hoy 10:00:</strong> Cliente A - Sesión Estratégica</li>
                    <li className="p-3 bg-[var(--input-bg)] rounded-lg"><strong>Mañana 14:30:</strong> Cliente B - Consulta Completa</li>
                </ul>
            </DashboardCard>
            <DashboardCard icon={<IoPeopleOutline />} title="Clientes">
                <p>Resumen de clientes registrados y activos.</p>
                <p className="mt-4 font-bold text-3xl text-[var(--text-color)]">124</p>
                 <p className="text-sm">Clientes activos</p>
            </DashboardCard>
            <DashboardCard icon={<IoFileTrayStackedOutline />} title="Gestión de Planes">
                <p>Crea, edita o elimina los planes de consultoría.</p>
                <button className="mt-4 text-[var(--primary-color)] font-semibold flex items-center hover:underline"><IoAddCircleOutline className="mr-2 text-xl"/> Añadir Nuevo Plan</button>
            </DashboardCard>
        </div>
    </div>
);

const UserDashboard: React.FC<{ onBookCallClick: () => void }> = ({ onBookCallClick }) => (
    <div className="space-y-8">
        <div>
            <h1 className="text-4xl font-bold text-[var(--text-color)]">Tu Panel de Cliente</h1>
            <p className="text-lg text-[var(--text-muted)] mt-2">Gestiona tus consultas y agenda nuevas sesiones.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            <DashboardCard icon={<IoCalendarOutline />} title="Mis Citas">
                <p>Aquí aparecerán tus citas confirmadas. Por ahora no tienes ninguna.</p>
                 <p className="mt-2 text-sm">Una vez que completes el pago de una sesión agendada, la verás aquí.</p>
            </DashboardCard>
            <DashboardCard icon={<IoAddCircleOutline />} title="Nueva Consulta" action={
                <button onClick={onBookCallClick} className="btn-cta text-sm px-4 py-2">
                    Agendar Ahora
                </button>
            }>
                <p>¿Tienes un nuevo reto o necesitas seguimiento? Agenda una nueva sesión estratégica conmigo.</p>
            </DashboardCard>
        </div>
    </div>
);

const DashboardPage: React.FC<{onBookCallClick: () => void}> = ({onBookCallClick}) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) {
        return null; // Or a loading spinner
    }

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
    
    // For demo purposes, we can simulate an admin user.
    // In a real app, this would be based on custom claims in the JWT.
    const isAdmin = user.email === 'diegogalmarini@gmail.com';


    return (
        <div className="py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-[var(--text-color)]">Bienvenido, {user.displayName || user.email?.split('@')[0]}</h1>
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
