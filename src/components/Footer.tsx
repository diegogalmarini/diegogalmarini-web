import React from 'react';
import Link from 'next/link';
import { GooglePartnerIcon } from '@/constants';

const Footer: React.FC = () => (
  <footer className="mt-32 bg-[var(--card-bg)] border-t border-[var(--border-color)] backdrop-blur-lg transition-colors duration-300">
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="xl:grid xl:grid-cols-3 xl:gap-8">
        <div className="space-y-8 xl:col-span-1">
          <h3 className="text-xl font-black text-[var(--text-color)]">Diego Galmarini</h3>
          <p className="text-[var(--text-muted)] text-base">
            Transformando ideas en productos tecnológicos escalables, rentables y desplegados.
          </p>
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-[var(--input-bg)]">
            <GooglePartnerIcon />
            <span className="text-sm font-semibold text-[var(--text-muted)]">Google Partner Certificado</span>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
          <div className="md:grid md:grid-cols-2 md:gap-8">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-color)] tracking-wider uppercase">Navegación</h3>
              <ul className="mt-4 space-y-4">
                <li><Link href="/" className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)]">Inicio</Link></li>
                <li><Link href="/services" className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)]">Servicios</Link></li>
                <li><Link href="/portfolio" className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)]">Casos de Estudio</Link></li>
                <li><Link href="/about" className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)]">Sobre Mí</Link></li>
              </ul>
            </div>
            <div className="mt-12 md:mt-0">
               <h3 className="text-sm font-semibold text-[var(--text-color)] tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><Link href="/privacy-policy" className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)]">Política de Privacidad</Link></li>
                <li><Link href="/terms-of-service" className="text-base text-[var(--text-muted)] hover:text-[var(--text-color)]">Términos de Servicio</Link></li>
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

export default Footer;