# Código Fuente Principal del Proyecto

## 📋 Componentes Principales

Este documento contiene el código fuente de los componentes más importantes del proyecto.

## 🏠 App.tsx - Componente Principal

```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PlansProvider } from './contexts/PlansContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import PortfolioPage from './pages/PortfolioPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PortfolioDetailPage from './pages/PortfolioDetailPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import BookingModal from './components/BookingModal';
import { useState } from 'react';

function App() {
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleBookCallClick = () => {
    setShowBookingModal(true);
  };

  return (
    <AuthProvider>
      <PlansProvider>
        <Router>
          <Layout onBookCallClick={handleBookCallClick}>
            <Routes>
              <Route path="/" element={<HomePage onBookCallClick={handleBookCallClick} />} />
              <Route path="/servicios" element={<ServicesPage onBookCallClick={handleBookCallClick} />} />
              <Route path="/portafolio" element={<PortfolioPage />} />
              <Route path="/portafolio/:id" element={<PortfolioDetailPage />} />
              <Route path="/acerca-de" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage onBookCallClick={handleBookCallClick} />} />
              <Route path="/privacidad" element={<PrivacyPolicyPage />} />
              <Route path="/terminos" element={<TermsOfServicePage />} />
            </Routes>
          </Layout>
          {showBookingModal && (
            <BookingModal onClose={() => setShowBookingModal(false)} />
          )}
        </Router>
      </PlansProvider>
    </AuthProvider>
  );
}

export default App;
```

## 🔐 AuthContext.tsx - Contexto de Autenticación

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAdmin(user?.email === 'diego@diegogalmarini.com');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    login,
    register,
    logout,
    resetPassword,
    loading,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

## 🎨 Layout.tsx - Layout Principal

```typescript
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import { IoMenuOutline, IoCloseOutline, IoLogOutOutline } from 'react-icons/io5';

interface LayoutProps {
  children: React.ReactNode;
  onBookCallClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onBookCallClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const navItems = [
    { path: '/', label: 'Inicio' },
    { path: '/servicios', label: 'Servicios' },
    { path: '/portafolio', label: 'Portafolio' },
    { path: '/acerca-de', label: 'Acerca de' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      {/* Navigation */}
      <nav className="bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--border-color)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-[var(--primary-color)]">Diego Galmarini</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'text-[var(--primary-color)] font-medium'
                      : 'text-[var(--nav-text)] hover:text-[var(--primary-color)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  {isAdmin && (
                    <Link
                      to="/dashboard"
                      className="text-[var(--nav-text)] hover:text-[var(--primary-color)] transition-colors duration-200"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-[var(--nav-text)] hover:text-[var(--primary-color)] transition-colors duration-200"
                  >
                    <IoLogOutOutline />
                    <span>Salir</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-[var(--nav-text)] hover:text-[var(--primary-color)] transition-colors duration-200"
                  >
                    Iniciar Sesión
                  </Link>
                  <button
                    onClick={onBookCallClick}
                    className="btn-cta"
                  >
                    Agendar Llamada
                  </button>
                </div>
              )}
              
              <ThemeSwitcher />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeSwitcher />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[var(--nav-text)] hover:text-[var(--primary-color)] transition-colors duration-200"
              >
                {isMenuOpen ? <IoCloseOutline size={24} /> : <IoMenuOutline size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-[var(--nav-bg)] border-t border-[var(--border-color)]">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'text-[var(--primary-color)] bg-[var(--nav-active-bg)]'
                      : 'text-[var(--nav-text)] hover:text-[var(--primary-color)] hover:bg-[var(--nav-inactive-hover-bg)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {currentUser ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-[var(--nav-text)] hover:text-[var(--primary-color)] hover:bg-[var(--nav-inactive-hover-bg)] transition-colors duration-200"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-[var(--nav-text)] hover:text-[var(--primary-color)] hover:bg-[var(--nav-inactive-hover-bg)] transition-colors duration-200"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-[var(--nav-text)] hover:text-[var(--primary-color)] hover:bg-[var(--nav-inactive-hover-bg)] transition-colors duration-200"
                  >
                    Iniciar Sesión
                  </Link>
                  <button
                    onClick={() => {
                      onBookCallClick();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-[var(--primary-color)] text-white hover:opacity-90 transition-opacity duration-200"
                  >
                    Agendar Llamada
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--card-bg)] border-t border-[var(--border-color)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-[var(--text-color)] mb-4">Diego Galmarini</h3>
              <p className="text-[var(--text-muted)] mb-4">
                Socio Tecnológico Estratégico especializado en transformación digital y optimización de procesos empresariales.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[var(--text-color)] mb-4">Enlaces</h4>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-[var(--text-color)] mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/privacidad"
                    className="text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors duration-200"
                  >
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terminos"
                    className="text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors duration-200"
                  >
                    Términos de Servicio
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[var(--border-color)] mt-8 pt-8 text-center">
            <p className="text-[var(--text-muted)]">
              © 2024 Diego Galmarini. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
```

## 🎨 Estilos CSS Principales (index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Variables CSS para temas */
:root {
  /* Colores principales */
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --secondary-color: #64748b;
  
  /* Colores de texto */
  --text-color: #1f2937;
  --text-muted: #6b7280;
  --text-light: #9ca3af;
  
  /* Colores de fondo */
  --bg-color: #ffffff;
  --card-bg: #f9fafb;
  --input-bg: #ffffff;
  
  /* Navegación */
  --nav-bg: rgba(255, 255, 255, 0.8);
  --nav-text: #374151;
  --nav-active-bg: #eff6ff;
  --nav-inactive-hover-bg: #f3f4f6;
  
  /* Bordes */
  --border-color: #e5e7eb;
  --border-light: #f3f4f6;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Tema oscuro */
[data-theme="dark"] {
  --primary-color: #60a5fa;
  --primary-hover: #3b82f6;
  --secondary-color: #94a3b8;
  
  --text-color: #f9fafb;
  --text-muted: #d1d5db;
  --text-light: #9ca3af;
  
  --bg-color: #111827;
  --card-bg: #1f2937;
  --input-bg: #374151;
  
  --nav-bg: rgba(31, 41, 55, 0.8);
  --nav-text: #d1d5db;
  --nav-active-bg: #374151;
  --nav-inactive-hover-bg: #374151;
  
  --border-color: #374151;
  --border-light: #4b5563;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
}

/* Componentes personalizados */
@layer components {
  .btn-cta {
    @apply bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-all duration-300 shadow-md hover:shadow-lg;
  }
  
  .btn-secondary {
    @apply border border-[var(--border-color)] text-[var(--text-color)] px-6 py-2 rounded-lg font-medium hover:bg-[var(--card-bg)] transition-all duration-300;
  }
  
  .glass-card {
    @apply bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--border-color)] rounded-xl shadow-lg;
  }
  
  .glass-input {
    @apply w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--input-bg)] text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all duration-300;
  }
  
  .modal-glass-overlay {
    @apply fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50;
  }
  
  .modal-glass-content {
    @apply bg-[var(--card-bg)] backdrop-blur-md border border-[var(--border-color)] rounded-2xl shadow-2xl;
  }
  
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  
  .scrollbar-thumb-primary {
    scrollbar-color: var(--primary-color) transparent;
  }
  
  .scrollbar-track-transparent {
    scrollbar-track-color: transparent;
  }
}

/* Webkit scrollbar para navegadores basados en Chromium */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: var(--primary-color);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: var(--primary-hover);
}

/* Animaciones personalizadas */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

/* Efectos de hover mejorados */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Gradientes personalizados */
.gradient-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Responsive utilities */
@media (max-width: 768px) {
  .mobile-padding {
    @apply px-4;
  }
  
  .mobile-text {
    @apply text-sm;
  }
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
}
```

## 🔧 Configuración Firebase (firebaseConfig.ts)

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Verificar que todas las variables de entorno estén definidas
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing Firebase environment variables:', missingEnvVars);
  throw new Error(`Missing Firebase configuration: ${missingEnvVars.join(', ')}`);
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

## ⚙️ Configuración Vite (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './components'),
      '@pages': resolve(__dirname, './pages'),
      '@contexts': resolve(__dirname, './contexts'),
      '@utils': resolve(__dirname, './utils'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          router: ['react-router-dom'],
          icons: ['react-icons/io5'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
});
```

## 📦 Package.json - Dependencias

```json
{
  "name": "socio-tecnologico-diego",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "deploy": "npm run build && firebase deploy"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.1",
    "firebase": "^9.17.2",
    "react-icons": "^4.7.1"
  },
  "devDependencies": {
    "@types/react": "^18.0.27",
    "@types/react-dom": "^18.0.10",
    "@typescript-eslint/eslint-plugin": "^5.54.0",
    "@typescript-eslint/parser": "^5.54.0",
    "@vitejs/plugin-react": "^3.1.0",
    "autoprefixer": "^10.4.13",
    "eslint": "^8.35.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.3.4",
    "postcss": "^8.4.21",
    "tailwindcss": "^3.2.6",
    "typescript": "^4.9.4",
    "vite": "^4.1.0"
  }
}
```

---

**Nota**: Este documento contiene el código fuente principal del proyecto. Para ver la implementación completa del sistema CRM y todas las funcionalidades, consulta el archivo `DashboardPage.tsx` en el directorio `pages/`.

**Desarrollado por**: Diego Galmarini  
**Versión**: 1.0.0  
**Fecha**: Enero 2025