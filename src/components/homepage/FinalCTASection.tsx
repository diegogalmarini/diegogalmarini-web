"use client";

import React, { useState } from 'react';
import { useModal } from '../../contexts/ModalContext';

// Mock final CTA headlines - will be replaced with constants in later phases
const finalCtaHeadlines = [
  "¿Listo para Transformar tu Idea en Realidad?",
  "Convirtamos tu Visión en un Producto Exitoso",
  "Tu Próximo Gran Producto Comienza Aquí"
];

interface FinalCTASectionProps {
  // No props needed - using modal context
}

const FinalCTASection: React.FC<FinalCTASectionProps> = () => {
  const [finalCta] = useState(() => finalCtaHeadlines[Math.floor(Math.random() * finalCtaHeadlines.length)]);
  const { openModal } = useModal();

  const handleBookCallClick = () => {
    openModal('booking');
  };

  return (
    <section className="py-40">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <div className="cta-card-glass">
          <h2 className="text-3xl md:text-4xl font-black text-[var(--text-color)] tracking-tight">
            {finalCta}
          </h2>
          <p className="mt-8 text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            Agenda una llamada estratégica gratuita y descubre cómo podemos transformar tu idea en un producto exitoso.
          </p>
          <div className="mt-12">
            <button onClick={handleBookCallClick} className="btn-cta px-8 py-3">
              Agendar Llamada Estratégica
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;