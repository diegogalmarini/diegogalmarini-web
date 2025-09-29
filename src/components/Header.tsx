"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoMenu, IoClose } from 'react-icons/io5';
import { GooglePartnerIcon } from '@/constants';
import ThemeSwitcher from './ThemeSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';

const NavItem: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void }> = ({ href, children, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`nav-link-base text-base text-center block w-full sm:w-auto ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}
    >
      {children}
    </Link>
  );
};

interface HeaderProps {
  // Props are no longer needed as we use the modal context
}

const Header: React.FC<HeaderProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { openModal } = useModal();
  const closeMenu = () => setIsOpen(false);

  const handleBookCallClick = () => {
    openModal('booking');
  };

  const handleLoginClick = () => {
    openModal('login');
  };

  return (
    <header className="header-glass sticky top-0 z-40 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 px-4">
          <Link href="/" className="flex items-center">
            <span className="text-3xl font-black tracking-tight text-[var(--text-color)]">Diego Galmarini</span>
          </Link>
          <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex items-center space-x-1 bg-[var(--input-bg)] p-1 rounded-full border border-[var(--border-color)]">
              <NavItem href="/">Inicio</NavItem>
              <NavItem href="/services">Servicios</NavItem>
              <NavItem href="/portfolio">Casos de Estudio</NavItem>
              <NavItem href="/about">Sobre Mí</NavItem>
              {user ? (
                <NavItem href="/dashboard">Dashboard</NavItem>
              ) : (
                <button onClick={handleLoginClick} className="nav-link-base text-base nav-link-inactive">
                  Acceso
                </button>
              )}
            </nav>
          </div>
          <div className="hidden md:flex items-center justify-end space-x-6">
            <button onClick={handleBookCallClick} className="btn-cta px-6 py-2">
              Agendar Llamada
            </button>
            <ThemeSwitcher />
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
            <NavItem href="/" onClick={closeMenu}>Inicio</NavItem>
            <NavItem href="/services" onClick={closeMenu}>Servicios</NavItem>
            <NavItem href="/portfolio" onClick={closeMenu}>Casos de Estudio</NavItem>
            <NavItem href="/about" onClick={closeMenu}>Sobre Mí</NavItem>
            {user ? (
              <NavItem href="/dashboard" onClick={closeMenu}>Dashboard</NavItem>
            ) : (
              <button onClick={() => { handleLoginClick(); closeMenu(); }} className="nav-link-base text-base text-center block w-full sm:w-auto nav-link-inactive">
                Acceso
              </button>
            )}
            <button onClick={() => { handleBookCallClick(); closeMenu(); }} className="btn-cta mt-4 w-full text-sm py-3 px-6">
              Agendar Llamada
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

export default Header;