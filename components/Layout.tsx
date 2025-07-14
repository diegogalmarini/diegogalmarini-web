
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { IoMenu, IoClose, IoLogOutOutline } from 'react-icons/io5';

// --- Sub-Components ---

const NavItem: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => (
  <NavLink to={to} onClick={onClick} className={({ isActive }) => `nav-link-base text-base text-center block w-full sm:w-auto ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}>
    {children}
  </NavLink>
);

const UserProfile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = React.useState(false);
    
    if(!user) return null;

    const handleLogout = async () => {
        await logout();
        navigate('/');
    }

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2">
                <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=0284c7&color=fff&rounded=true`} 
                    alt="Perfil" 
                    className="w-8 h-8 rounded-full"
                />
                 <span className="text-sm font-semibold text-[var(--text-color)] hidden md:block">{user.displayName || user.email?.split('@')[0]}</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg shadow-lg py-1 z-50">
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-[var(--text-color)] hover:bg-[var(--input-bg)]">Mi Cuenta</Link>
                    <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-[var(--input-bg)]">
                        <IoLogOutOutline className="mr-2"/> Cerrar Sesión
                    </button>
                </div>
            )}
        </div>
    )
}

// --- Header ---

const Header: React.FC<{ onBookCallClick: () => void }> = ({ onBookCallClick }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user } = useAuth();
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="header-glass sticky top-0 z-40 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <Link to="/" className="flex items-center">
            <span className="text-4xl font-black tracking-tighter text-[var(--text-color)]">Diego Galmarini</span>
          </Link>
          <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex items-center space-x-2 bg-[var(--input-bg)] p-1.5 rounded-full border border-[var(--border-color)]">
              <NavItem to="/">Inicio</NavItem>
              <NavItem to="/services">Servicios</NavItem>
              <NavItem to="/portfolio">Casos de Estudio</NavItem>
              <NavItem to="/about">Sobre Mí</NavItem>
              {!user && <NavItem to="/login">Acceso</NavItem>}
            </nav>
          </div>
          <div className="hidden md:flex items-center justify-end space-x-4">
             {user ? <UserProfile/> : (
                <button onClick={onBookCallClick} className="btn-cta text-sm px-5 py-2.5">
                    Agendar Llamada
                </button>
             )}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[var(--text-color)] text-3xl z-50">
              {isOpen ? <IoClose /> : <IoMenu />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden pb-4">
          <nav className="px-4 pt-2 pb-3 space-y-2 flex flex-col items-center">
            <NavItem to="/" onClick={closeMenu}>Inicio</NavItem>
            <NavItem to="/services" onClick={closeMenu}>Servicios</NavItem>
            <NavItem to="/portfolio" onClick={closeMenu}>Casos de Estudio</NavItem>
            <NavItem to="/about" onClick={closeMenu}>Sobre Mí</NavItem>
            <NavItem to={user ? "/dashboard" : "/login"} onClick={closeMenu}>
              {user ? "Mi Cuenta" : "Acceso"}
            </NavItem>
            <button onClick={() => { onBookCallClick(); closeMenu(); }} className="btn-cta mt-4 w-full text-sm py-3">
                Agendar Llamada
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

// --- Footer & Layout ---

const Footer: React.FC = () => (
  <footer className="mt-32 bg-[var(--card-bg)] border-t border-[var(--border-color)] backdrop-blur-lg transition-colors duration-300">
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="xl:grid xl:grid-cols-3 xl:gap-8">
        <div className="space-y-8 xl:col-span-1">
          <h3 className="text-xl font-bold text-[var(--text-color)]">Diego Galmarini</h3>
          <p className="text-[var(--text-muted)] text-base">
            Transformando ideas en productos tecnológicos escalables.
          </p>
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-[var(--input-bg)]">
            <FaGoogle />
            <span className="text-sm font-semibold text-[var(--text-muted)]">Google Partner Certificado</span>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
          <div className="md:grid md:grid-cols-2 md:gap-8">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-color)] tracking-wider uppercase">Navegación</h3>
              <ul className="mt-4 space-y-4">
                <li><Link to="/" className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)]">Inicio</Link></li>
                <li><Link to="/services" className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)]">Servicios</Link></li>
                <li><Link to="/portfolio" className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)]">Casos de Estudio</Link></li>
                <li><Link to="/about" className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)]">Sobre Mí</Link></li>
              </ul>
            </div>
            <div className="mt-12 md:mt-0">
               <h3 className="text-sm font-semibold text-[var(--text-color)] tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><Link to="/privacy-policy" className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)]">Política de Privacidad</Link></li>
                <li><Link to="/terms-of-service" className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)]">Términos de Servicio</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 border-t border-[var(--border-color)] pt-8">
        <p className="text-base text-[var(--text-muted)] xl:text-center">&copy; {new Date().getFullYear()} Diego Galmarini. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
);

export const Layout: React.FC<{children: React.ReactNode; onBookCallClick: () => void}> = ({ children, onBookCallClick }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header onBookCallClick={onBookCallClick} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};
