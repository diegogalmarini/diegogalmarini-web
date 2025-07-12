import React from 'react';
import { caseStudies } from '../constants';
import { Card } from '../components/common';

const PortfolioPage: React.FC = () => {
  return (
    <div className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-color)] tracking-tight">
            Innovación Probada en Proyectos Reales
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[var(--text-muted)] leading-relaxed">
            Cada proyecto es una demostración de cómo la estrategia y la tecnología se unen para crear valor tangible y resultados medibles.
          </p>
        </div>
        
        <div className="space-y-20">
          {caseStudies.map((cs) => (
            <Card key={cs.id} id={cs.id} className="scroll-mt-28">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="overflow-hidden rounded-2xl">
                  <img src={cs.imageUrl} alt={cs.title} className="w-full h-auto object-cover shadow-lg transform hover:scale-105 transition-transform duration-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-[var(--text-color)] mb-4">{cs.title}</h2>
                  <p className="text-[var(--text-muted)] text-lg mb-6 leading-relaxed">{cs.fullDescription}</p>
                  <div className="bg-[var(--input-bg)] p-6 rounded-2xl border border-[var(--border-color)] transition-colors duration-300">
                    <h3 className="text-xl font-semibold text-[var(--primary-color)] mb-3">Resultados y Valor</h3>
                    <p className="text-[var(--text-muted)]">{cs.results}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;