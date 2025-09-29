"use client";

import React, { useState } from 'react';
import { IoRocketSharp, IoSparkles, IoTrendingUp } from 'react-icons/io5';
import { useModal } from '../../contexts/ModalContext';

// Mock data - will be replaced with constants in later phases
const heroHeadlines = [
  "Transformo Ideas en Productos Exitosos",
  "De la Estrategia al Producto Desplegado",
  "Tu Socio Tecnológico Estratégico"
];

const heroPills = [
  { text: "IA Aplicada", icon: IoSparkles },
  { text: "Blockchain", icon: IoRocketSharp },
  { text: "Growth Hacking", icon: IoTrendingUp }
];

interface HeroSectionProps {
  // No props needed - using modal context
}

const HeroSection: React.FC<HeroSectionProps> = () => {
  const [headline] = useState(() => heroHeadlines[Math.floor(Math.random() * heroHeadlines.length)]);
  const [pills] = useState(() => [...heroPills].sort(() => 0.5 - Math.random()).slice(0, 3));
  const { openModal } = useModal();

  const handleBookCallClick = () => {
    openModal('booking');
  };

  return (
    <section className="relative overflow-hidden pt-40 pb-48 text-center">
      <div className="absolute inset-0 gradient-bg"></div>
      <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 z-10">
        <h1 className="text-4xl md:text-6xl font-black text-[var(--text-color)] tracking-tight leading-tight">
          {headline}
        </h1>
        <p className="mt-8 max-w-2xl mx-auto text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
          Ayudo a empresas y startups a diseñar, construir y escalar productos de alto impacto con IA, Blockchain y estrategias de crecimiento digital probadas.
        </p>
        <div className="mt-12">
          <button onClick={handleBookCallClick} className="btn-cta px-8 py-3">
            Agendar Llamada Estratégica
          </button>
        </div>
        <div className="mt-16 flex justify-center items-center flex-wrap gap-6 text-sm">
          {pills.map((pill) => (
            <div key={pill.text} className="tech-pill-glass">
              <pill.icon />
              <span>{pill.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;