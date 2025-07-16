
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { IoMailOutline, IoLockClosedOutline, IoLogoGoogle } from 'react-icons/io5';

const LoginPage: React.FC = () => {
    const { loginWithEmail, signInWithGoogle, sendPasswordReset } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // Para mensajes de éxito (ej: email de reseteo enviado)
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            await loginWithEmail(email, password);
            navigate('/dashboard');
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


    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent px-4">
            <div className="w-full max-w-md">
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-8">
                    <h1 className="text-3xl font-bold text-center text-[var(--text-color)] mb-2">Acceso de Usuario</h1>
                    <p className="text-center text-[var(--text-muted)] mb-8">Inicia sesión para gestionar tus consultas.</p>
                    
                    {error && <p className="bg-red-500/10 text-red-500 text-sm font-semibold p-3 rounded-lg mb-4">{error}</p>}
                    {message && <p className="bg-green-500/10 text-green-400 text-sm font-semibold p-3 rounded-lg mb-4">{message}</p>}
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative">
                            <IoMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                required
                                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg py-3 px-12 text-[var(--text-color)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative">
                             <IoLockClosedOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña"
                                required
                                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg py-3 px-12 text-[var(--text-color)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div className="text-right">
                            <button type="button" onClick={handlePasswordReset} className="text-sm font-medium text-blue-400 hover:underline">
                                ¿Has olvidado tu contraseña?
                            </button>
                        </div>

                        <button type="submit" className="w-full btn-cta py-3 font-bold" disabled={isLoading}>
                            {isLoading ? 'Accediendo...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                     <div className="relative my-6 text-center">
                        <span className="absolute top-1/2 left-0 w-full h-px bg-[var(--border-color)]"></span>
                        <span className="relative bg-[var(--card-bg)] px-2 text-sm text-[var(--text-muted)]">o</span>
                    </div>

                    <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center bg-white text-black py-3 rounded-lg hover:bg-gray-200 font-bold disabled:opacity-50 transition-colors" disabled={isLoading}>
                        <IoLogoGoogle className="mr-3" /> Acceder con Google
                    </button>
                    
                     <p className="text-center text-sm text-[var(--text-muted)] mt-8">
                        ¿No tienes una cuenta?{' '}
                        <Link to="/" onClick={(e) => { e.preventDefault(); /* Aquí iría la lógica para abrir el modal de registro */ }} className="font-medium text-blue-400 hover:underline">
                            Regístrate
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
};

export default LoginPage;
