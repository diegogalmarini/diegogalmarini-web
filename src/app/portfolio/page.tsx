"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

// Mock portfolio data - will be replaced with constants in later phases
const detailedCaseStudies = [
  {
    id: 'tokenwatch-app',
    title: 'TokenWatch - Analytics de Criptomonedas',
    description: 'Plataforma completa de tracking y analytics para inversores crypto con alertas inteligentes y análisis técnico automatizado.',
    imageUrl: '/api/placeholder/400/300',
    category: 'Proyecto Realizado' as const,
    tags: ['React', 'FastAPI', 'PostgreSQL', 'Crypto APIs', 'Real-time Data']
  },
  {
    id: 'mintonaire-platform',
    title: 'Mintonaire - Plataforma NFT',
    description: 'Marketplace completo para NFTs en Solana con sistema de subastas, regalías automáticas y analytics de mercado.',
    imageUrl: '/api/placeholder/400/300',
    category: 'Proyecto Realizado' as const,
    tags: ['Solana', 'Rust', 'React', 'Web3', 'Smart Contracts']
  },
  {
    id: 'mikit-ai-tool',
    title: 'Mikit.ai - Generador de Contenido IA',
    description: 'Herramienta de IA para automatizar la creación de contenido de marketing con templates personalizables.',
    imageUrl: '/api/placeholder/400/300',
    category: 'Proyecto Realizado' as const,
    tags: ['OpenAI GPT', 'Python', 'FastAPI', 'React', 'Machine Learning']
  },
  {
    id: 'fintech-b2b-concept',
    title: 'Plataforma FinTech B2B',
    description: 'Concepto estratégico para plataforma de pagos empresariales con integración multi-gateway y dashboard analytics.',
    imageUrl: '/api/placeholder/400/300',
    category: 'Concepto Estratégico' as const,
    tags: ['Strategy', 'FinTech', 'API Design', 'Enterprise']
  },
  {
    id: 'ecommerce-multivendor',
    title: 'E-commerce Multivendor Concept',
    description: 'Marketplace escalable con sistema de vendedores, pagos distribuidos y analytics avanzados.',
    imageUrl: '/api/placeholder/400/300',
    category: 'Concepto Estratégico' as const,
    tags: ['E-commerce', 'Marketplace', 'Multi-tenant', 'Analytics']
  },
  {
    id: 'ai-automation-saas',
    title: 'SaaS de Automatización con IA',
    description: 'Plataforma en desarrollo para automatizar procesos empresariales usando IA y machine learning.',
    imageUrl: '/api/placeholder/400/300',
    category: 'Idea en Desarrollo' as const,
    tags: ['AI/ML', 'Automation', 'SaaS', 'Enterprise', 'In Progress']
  }
];

type CaseStudyCategory = 'Proyecto Realizado' | 'Concepto Estratégico' | 'Idea en Desarrollo';

const categoryColors: { [key in CaseStudyCategory]: string } = {
  'Proyecto Realizado': 'bg-green-500/10 text-green-600 dark:text-green-400',
  'Concepto Estratégico': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'Idea en Desarrollo': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

interface PortfolioCardProps {
  study: typeof detailedCaseStudies[0];
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ study }) => (
  <Link href={`/portfolio/${study.id}`} className="block group">
    <div className="card flex flex-col h-full !p-0 overflow-hidden">
      <div className="overflow-hidden">
        <img 
          src={study.imageUrl} 
          alt={study.title} 
          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105" 
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-3">
          <span className={`category-tag px-3 py-1 rounded-full text-xs font-medium ${categoryColors[study.category]}`}>
            {study.category}
          </span>
        </div>
        <h3 className="text-xl font-bold text-[var(--text-color)] mb-3 flex-grow">{study.title}</h3>
        <p className="text-[var(--text-muted)] text-base mb-4">{study.description}</p>
        <div className="mt-auto">
          {study.tags.slice(0, 4).map(tag => (
            <span 
              key={tag} 
              className="inline-block bg-[var(--input-bg)] text-[var(--text-muted)] text-xs font-semibold mr-2 mb-2 px-3 py-1 rounded-full border border-transparent"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  </Link>
);

export default function PortfolioPage() {
  const [filter, setFilter] = useState<'all' | CaseStudyCategory>('all');

  const filteredStudies = useMemo(() => {
    if (filter === 'all') return detailedCaseStudies;
    return detailedCaseStudies.filter(study => study.category === filter);
  }, [filter]);

  const filters: ('all' | CaseStudyCategory)[] = ['all', 'Proyecto Realizado', 'Concepto Estratégico', 'Idea en Desarrollo'];

  return (
    <div className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-color)] tracking-tight">
            Portafolio de Proyectos
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[var(--text-muted)] leading-relaxed">
            Explora una selección de proyectos, desde MVPs lanzados hasta conceptos estratégicos, que demuestran mi enfoque integral para la innovación.
          </p>
        </div>

        <div className="flex justify-center flex-wrap gap-4 mb-16">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`portfolio-filter-btn px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filter === f 
                  ? 'portfolio-filter-btn-active bg-[var(--primary-color)] text-white' 
                  : 'bg-[var(--input-bg)] text-[var(--text-color)] hover:bg-[var(--primary-color)]/10'
              }`}
            >
              {f === 'all' ? 'Todos' : f}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStudies.map((cs) => (
            <PortfolioCard key={cs.id} study={cs} />
          ))}
        </div>
      </div>
    </div>
  );
}