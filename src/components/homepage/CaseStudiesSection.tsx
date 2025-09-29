"use client";

import React, { useState, useEffect } from 'react';

// Mock data - will be replaced with constants in later phases
const caseStudies = [
  {
    id: '1',
    title: 'Plataforma FinTech B2B',
    description: 'Desarrollo de una plataforma completa de pagos digitales para empresas, con integración a múltiples gateways y dashboard analytics.',
    image: '/api/placeholder/400/240',
    tags: ['React', 'Node.js', 'Stripe', 'PostgreSQL'],
    metrics: {
      'Tiempo': '4 meses',
      'ROI': '+340%',
      'Usuarios': '12K+'
    }
  },
  {
    id: '2',
    title: 'E-commerce Multivendor',
    description: 'Marketplace completo con sistema de vendedores, pagos distribuidos, analytics avanzados y mobile app.',
    image: '/api/placeholder/400/240',
    tags: ['Next.js', 'GraphQL', 'Prisma', 'React Native'],
    metrics: {
      'Ventas': '$2.3M',
      'Vendedores': '450+',
      'Conversión': '+185%'
    }
  }
];

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  metrics: Record<string, string>;
}

const CaseStudyCard: React.FC<{ caseStudy: CaseStudy }> = ({ caseStudy }) => (
  <div className="card flex flex-col group overflow-hidden">
    <div className="overflow-hidden rounded-xl mb-6">
      <img src={caseStudy.image} alt={caseStudy.title} className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-105" />
    </div>
    <div className="pt-2 flex flex-col flex-grow">
      <div className="mb-3">
        {caseStudy.tags.slice(0, 3).map(tag => (
          <span key={tag} className="inline-block bg-[var(--input-bg)] text-[var(--text-muted)] text-xs font-semibold mr-2 mb-2 px-3 py-1 rounded-full border border-transparent">
            {tag}
          </span>
        ))}
      </div>
      <h3 className="text-xl font-bold text-[var(--text-color)] mb-3 group-hover:text-[var(--primary-color)] transition-colors duration-300">
        {caseStudy.title}
      </h3>
      <p className="text-[var(--text-muted)] mb-6 flex-grow leading-relaxed">
        {caseStudy.description}
      </p>
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border-color)]">
        {Object.entries(caseStudy.metrics).slice(0, 3).map(([key, value]) => (
          <div key={key} className="text-center">
            <div className="text-lg font-bold text-[var(--primary-color)]">{value}</div>
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">{key}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CaseStudiesSection: React.FC = () => {
  const [homeCaseStudies, setHomeCaseStudies] = useState<CaseStudy[]>([]);

  useEffect(() => {
    const shuffled = [...caseStudies].sort(() => 0.5 - Math.random());
    setHomeCaseStudies(shuffled.slice(0, 2));
  }, []);

  return (
    <section className="py-40">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <h2 className="text-3xl md:text-4xl font-black text-center text-[var(--text-color)] mb-6 tracking-tight">
          Innovación Probada en Proyectos Reales
        </h2>
        <p className="text-base md:text-lg text-[var(--text-muted)] text-center max-w-2xl mx-auto mb-20 leading-relaxed">
          Una selección de proyectos que demuestran la conversión de estrategia en valor tangible.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          {homeCaseStudies.map((cs) => (
            <CaseStudyCard key={cs.id} caseStudy={cs} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;