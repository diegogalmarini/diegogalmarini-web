import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { IoMailOutline, IoLockClosedOutline, IoLogoGoogle, IoClose } from 'react-icons/io5';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookCallClick: () => void; // Para abrir el modal de registro/consulta
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onBookCallClick }) => {
    const { loginWithEmail, signInWithGoogle, sendPasswordReset } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            await loginWithEmail(email, password);
            navigate('/dashboard');
            onClose(); // Cierra el modal al iniciar sesión
        } catch (error) {
            setError('Email o contraseña incorrectos. Por favor, inténtalo de nuevo.');
        }
        setIsLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            await signInWithGoogle();
            navigate('/dashboard');
            onClose(); // Cierra el modal al iniciar sesión
        } catch (error) {
            setError('No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
        }
        setIsLoading(false);
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setError('Por favor, introduce tu email para resetear la contraseña.');
            return;
        }
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            await sendPasswordReset(email);
            setMessage('¡Hecho! Se ha enviado un enlace para resetear tu contraseña a tu correo.');
        } catch (error) {
            setError('No se pudo enviar el correo de reseteo. Verifica que el email sea correcto.');
        }
        setIsLoading(false);
    };
    
    const handleRegisterClick = () => {
        onClose(); // Cierra el modal de login
        onBookCallClick(); // Abre el modal de agendamiento (que contiene el registro)
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            onClick={handleBackdropClick} 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div className={`modal-glass-content w-full max-w-md p-8 relative transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <button onClick={onClose} aria-label="Cerrar modal" className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--nav-inactive-hover-bg)] transition-all duration-300 z-20"><IoClose className="text-lg" /></button>
                
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-[var(--text-color)] mb-2">Acceso de Cliente</h1>
                    <p className="text-[var(--text-muted)] mb-8">Inicia sesión para gestionar tus consultas.</p>
                </div>
                
                {error && <p className="bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-sm font-semibold p-3 rounded-lg mb-4 text-center">{error}</p>}
                {message && <p className="bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 text-sm font-semibold p-3 rounded-lg mb-4 text-center">{message}</p>}
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <IoMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required className="glass-input !rounded-lg" />
                    </div>
                    <div className="relative">
                         <IoLockClosedOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required className="glass-input !rounded-lg" />
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={handlePasswordReset} className="text-sm font-medium text-[var(--primary-color)] hover:underline">¿Has olvidado tu contraseña?</button>
                    </div>
                    <button type="submit" className="w-full btn-cta py-3 font-bold" disabled={isLoading}>{isLoading ? 'Accediendo...' : 'Iniciar Sesión'}</button>
                </form>

                <div className="relative my-6 text-center">
                    <span className="absolute top-1/2 left-0 w-full h-px bg-[var(--border-color)]"></span>
                    <span className="relative bg-[var(--card-bg)] px-2 text-sm text-[var(--text-muted)]">o</span>
                </div>

                <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center bg-gray-100 dark:bg-white text-black py-3 rounded-lg hover:bg-gray-200 font-bold disabled:opacity-50 transition-colors shadow-sm border border-gray-200 dark:border-transparent" disabled={isLoading}>
                    <IoLogoGoogle className="mr-3 text-lg" /> Acceder con Google
                </button>
                
                <p className="text-center text-sm text-[var(--text-muted)] mt-8">
                    ¿No tienes una cuenta?{' '}
                    <button onClick={handleRegisterClick} className="font-medium text-[var(--primary-color)] hover:underline">Regístrate aquí</button>
                </p>
            </div>
        </div>
    );
};

export default AuthModal;