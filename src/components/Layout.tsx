import React from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { GooglePartnerIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { IoMenu, IoClose, IoLockClosedOutline } from 'react-icons/io5';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useLanguage } from '../contexts/LanguageContext';

const getLocalizedPath = (path: string, lang: 'es' | 'en') => {
  if (lang === 'en') {
    return path === '/' ? '/en' : `/en${path}`;
  }
  return path;
};

const NavItem: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `nav-link-base text-sm font-medium text-center block w-full sm:w-auto tracking-wide transition-all ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
    }
  >
    {children}
  </NavLink>
);

const Header: React.FC<{ onBookCallClick: (planId?: string, notes?: string) => void; onLoginClick: () => void; }> = ({ onBookCallClick, onLoginClick }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const closeMenu = () => setIsOpen(false);

  const getPath = (path: string) => getLocalizedPath(path, language);

  const handleLanguageChange = (targetLang: 'es' | 'en') => {
    if (targetLang === language) return;
    setLanguage(targetLang);
    
    const currentPath = location.pathname;
    if (targetLang === 'en') {
      if (currentPath === '/') {
        navigate('/en');
      } else if (!currentPath.startsWith('/en/')) {
        navigate(`/en${currentPath}`);
      }
    } else {
      if (currentPath === '/en') {
        navigate('/');
      } else if (currentPath.startsWith('/en/')) {
        navigate(currentPath.substring(3) || '/');
      }
    }
  };

  return (
    <header className="header-glass sticky top-0 z-40 w-full transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-24 px-2 sm:px-4">
          <Link to={getPath('/')} className="flex items-center gap-3.5 group">
            <img src="/logo.svg" alt="Diego Galmarini Logo" className="h-9 w-9 logo-light-theme transition-transform duration-300 group-hover:scale-105" />
            <img src="/logob.svg" alt="Diego Galmarini Logo" className="h-9 w-9 logo-dark-theme transition-transform duration-300 group-hover:scale-105" />
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-color)] group-hover:opacity-90 transition-opacity">Diego Galmarini</span>
          </Link>
          <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 xl:space-x-10">
              <NavItem to={getPath('/')}>{t('nav.home')}</NavItem>
              <NavItem to={getPath('/services')}>{t('nav.services')}</NavItem>
              <NavItem to={getPath('/portfolio')}>{t('nav.portfolio')}</NavItem>
              <NavItem to={getPath('/about')}>{t('nav.about')}</NavItem>
              <NavItem to={getPath('/blog')}>{t('nav.blog')}</NavItem>
            </nav>
          </div>
          <div className="hidden md:flex items-center justify-end gap-5">
            <button onClick={() => onBookCallClick()} className="btn-cta px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-[1.03] shadow-sm cursor-pointer">
              {t('nav.bookCall')}
            </button>
            
            {/* Selector de Idioma Minimalista */}
            <div className="flex items-center space-x-0.5 border border-[var(--border-color)] rounded-full p-0.5 bg-[var(--input-bg)] transition-colors duration-300">
              <button 
                onClick={() => handleLanguageChange('es')} 
                className={`px-3.5 py-1 text-[10px] font-extrabold rounded-full transition-all duration-300 cursor-pointer ${language === 'es' ? 'bg-[var(--primary-color)] text-white shadow-sm' : 'text-[var(--text-color)] opacity-60 hover:opacity-100'}`}
              >
                ES
              </button>
              <button 
                onClick={() => handleLanguageChange('en')} 
                className={`px-3.5 py-1 text-[10px] font-extrabold rounded-full transition-all duration-300 cursor-pointer ${language === 'en' ? 'bg-[var(--primary-color)] text-white shadow-sm' : 'text-[var(--text-color)] opacity-60 hover:opacity-100'}`}
              >
                EN
              </button>
            </div>

            <ThemeSwitcher />
            
            <button 
              onClick={onLoginClick} 
              aria-label="Acceso" 
              className="text-[var(--text-color)] opacity-40 hover:opacity-90 transition-opacity p-2 hover:bg-[var(--nav-inactive-hover-bg)] rounded-full cursor-pointer flex items-center justify-center"
            >
              <IoLockClosedOutline className="text-lg" />
            </button>
          </div>
          
          <div className="md:hidden flex items-center space-x-2">
            {/* Selector de Idioma Móvil */}
            <div className="flex items-center space-x-0.5 border border-[var(--border-color)] rounded-xl p-0.5 bg-[var(--input-bg)]">
              <button 
                onClick={() => handleLanguageChange('es')} 
                className={`px-2 py-0.5 text-[9px] font-extrabold rounded-lg transition-all ${language === 'es' ? 'bg-[var(--primary-color)] text-white' : 'text-[var(--text-color)] opacity-60'}`}
              >
                ES
              </button>
              <button 
                onClick={() => handleLanguageChange('en')} 
                className={`px-2 py-0.5 text-[9px] font-extrabold rounded-lg transition-all ${language === 'en' ? 'bg-[var(--primary-color)] text-white' : 'text-[var(--text-color)] opacity-60'}`}
              >
                EN
              </button>
            </div>

            <button 
              onClick={onLoginClick} 
              aria-label="Acceso" 
              className="text-[var(--text-color)] opacity-40 p-2 hover:bg-[var(--nav-inactive-hover-bg)] rounded-lg flex items-center justify-center"
            >
              <IoLockClosedOutline className="text-xl" />
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-[var(--text-color)] text-3xl z-50">
              {isOpen ? <IoClose /> : <IoMenu />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
         <div className="md:hidden pb-4">
          <nav className="px-4 pt-2 pb-3 space-y-2 flex flex-col items-center">
            <NavItem to={getPath('/')} onClick={closeMenu}>{t('nav.home')}</NavItem>
            <NavItem to={getPath('/services')} onClick={closeMenu}>{t('nav.services')}</NavItem>
            <NavItem to={getPath('/portfolio')} onClick={closeMenu}>{t('nav.portfolio')}</NavItem>
            <NavItem to={getPath('/about')} onClick={closeMenu}>{t('nav.about')}</NavItem>
            <NavItem to={getPath('/blog')} onClick={closeMenu}>{t('nav.blog')}</NavItem>
            <button onClick={() => { onBookCallClick(); closeMenu(); }} className="btn-cta mt-4 w-full text-sm py-3 px-6">
              {t('nav.bookCall')}
            </button>
            <div className="mt-4">
              <ThemeSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const getPath = (path: string) => getLocalizedPath(path, language);

  return (
    <footer className="mt-0 bg-[var(--card-bg)] border-t border-[var(--border-color)] backdrop-blur-lg transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto py-24 px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-16 xl:gap-24">
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center gap-3.5 group">
              <img src="/logo.svg" alt="Diego Galmarini Logo" className="h-8 w-8 logo-light-theme transition-transform duration-300 group-hover:scale-105" />
              <img src="/logob.svg" alt="Diego Galmarini Logo" className="h-8 w-8 logo-dark-theme transition-transform duration-300 group-hover:scale-105" />
              <h3 className="text-xl font-bold tracking-tight text-[var(--text-color)]">Diego Galmarini</h3>
            </div>
            <p className="text-[var(--text-muted)] text-base leading-relaxed max-w-sm">
              {t('footer.desc')}
            </p>
            <div className="inline-flex items-center space-x-3 p-3 px-4 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)]">
              <GooglePartnerIcon />
              <span className="text-xs font-semibold text-[var(--text-muted)]">{t('footer.partner')}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-12 xl:col-span-2 xl:pl-16">
            <div className="grid grid-cols-2 gap-12 sm:gap-20">
              <div>
                <h3 className="text-xs font-bold text-[var(--text-color)] tracking-widest uppercase opacity-60">{t('footer.nav')}</h3>
                <ul className="mt-6 space-y-4">
                  <li><Link to={getPath('/')} className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors duration-200">{t('nav.home')}</Link></li>
                  <li><Link to={getPath('/services')} className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors duration-200">{t('nav.services')}</Link></li>
                  <li><Link to={getPath('/portfolio')} className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors duration-200">{t('nav.portfolio')}</Link></li>
                  <li><Link to={getPath('/about')} className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors duration-200">{t('nav.about')}</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[var(--text-color)] tracking-widest uppercase opacity-60">{t('footer.legal')}</h3>
                <ul className="mt-6 space-y-4">
                  <li><Link to={getPath('/privacy-policy')} className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors duration-200">{t('footer.privacy')}</Link></li>
                  <li><Link to={getPath('/terms-of-service')} className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors duration-200">{t('footer.terms')}</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-20 border-t border-[var(--border-color)] pt-8">
          <p className="text-sm text-[var(--text-muted)] xl:text-center">&copy; {new Date().getFullYear()} Diego Galmarini. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode; onBookCallClick: (planId?: string, notes?: string) => void; onLoginClick: () => void }> = ({ children, onBookCallClick, onLoginClick }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header onBookCallClick={onBookCallClick} onLoginClick={onLoginClick} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};