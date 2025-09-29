import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { detailedCaseStudies } from '../constants';
import { Card } from '../components/common.tsx';
import { DetailedCaseStudy } from '../types';

const categoryColors: { [key: string]: string } = {
  'Proyecto Realizado': 'bg-green-500/10 text-green-600 dark:text-green-400',
  'Concepto Estratégico': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'Idea en Desarrollo': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

const PortfolioCard: React.FC<{ study: DetailedCaseStudy }> = ({ study }) => (
  <Link to={`/portfolio/${study.id}`} className="block group">
    <Card className="flex flex-col h-full !p-0 overflow-hidden">
      <div className="overflow-hidden">
        <img src={study.imageUrl} alt={study.title} className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-3">
            <span className={`category-tag ${categoryColors[study.category]}`}>{study.category}</span>
        </div>
        <h3 className="text-xl font-bold text-[var(--text-color)] mb-3 flex-grow">{study.title}</h3>
        <p className="text-[var(--text-muted)] text-base mb-4">{study.description}</p>
        <div className="mt-auto">
          {study.tags.slice(0, 4).map(tag => (
            <span key={tag} className="inline-block bg-[var(--input-bg)] text-[var(--text-muted)] text-xs font-semibold mr-2 mb-2 px-3 py-1 rounded-full border border-transparent">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Card>
  </Link>
);


const PortfolioPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | DetailedCaseStudy['category']>('all');

  const filteredStudies = useMemo(() => {
    if (filter === 'all') return detailedCaseStudies;
    return detailedCaseStudies.filter(study => study.category === filter);
  }, [filter]);

  const filters: ('all' | DetailedCaseStudy['category'])[] = ['all', 'Proyecto Realizado', 'Concepto Estratégico', 'Idea en Desarrollo'];

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
              className={`portfolio-filter-btn ${filter === f ? 'portfolio-filter-btn-active' : ''}`}
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
};

export default PortfolioPage;