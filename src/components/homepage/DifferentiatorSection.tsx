"use client";

import React, { useState } from 'react';

// Mock data - will be replaced with constants in later phases
const differentiators = [
  {
    title: "No Solo Construyo, Estratego",
    description: "Mi ventaja diferencial está en combinar visión estratégica con ejecución técnica impecable. Cada línea de código tiene un propósito comercial claro."
  },
  {
    title: "Enfoque de Producto, No de Proyecto",
    description: "Pienso como un socio, no como un proveedor. Mi compromiso es con el éxito a largo plazo de tu empresa, no solo con completar tareas."
  },
  {
    title: "Experiencia Cross-Industry",
    description: "He trabajado desde startups hasta multinacionales, en sectores que van desde fintech hasta e-commerce, aportando perspectivas únicas."
  }
];

const DifferentiatorSection: React.FC = () => {
  const [differentiator] = useState(() => differentiators[Math.floor(Math.random() * differentiators.length)]);

  return (
    <section className="py-40">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <div className="differentiator-card-glass">
          <h2 className="text-3xl md:text-4xl font-black text-[var(--text-color)]">{differentiator.title}</h2>
          <p className="mt-8 text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            "{differentiator.description}"
          </p>
        </div>
      </div>
    </section>
  );
};

export default DifferentiatorSection;