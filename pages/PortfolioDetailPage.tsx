import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { detailedCaseStudies } from '../constants';
import { Card, BarChart } from '../components/common.tsx';
import { IoArrowBack } from 'react-icons/io5';

const PortfolioDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const study = detailedCaseStudies.find(cs => cs.id === id);

  if (!study) {
    return (
      <div className="py-28 text-center">
        <h1 className="text-2xl font-bold">Proyecto no encontrado</h1>
        <Link to="/portfolio" className="text-[var(--primary-color)] hover:underline mt-4 inline-block">
          Volver al Portafolio
        </Link>
      </div>
    );
  }

  const categoryColors: { [key: string]: string } = {
    'Proyecto Realizado': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    'Concepto Estratégico': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'Idea en Desarrollo': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  return (
    <div className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/portfolio" className="inline-flex items-center text-base font-semibold text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors">
            <IoArrowBack className="mr-2" />
            Volver a todos los proyectos
          </Link>
        </div>

        <div className="relative rounded-3xl overflow-hidden mb-12">
            <img src={study.imageUrl} alt={study.title} className="w-full h-96 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8">
                <span className={`category-tag ${categoryColors[study.category]} !text-white !bg-black/30 backdrop-blur-sm !border-white/20`}>{study.category}</span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mt-2">{study.title}</h1>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-[var(--text-color)] mb-4">El Problema</h2>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed">{study.problem}</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[var(--text-color)] mb-4">La Solución Propuesta</h2>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed">{study.solution}</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[var(--text-color)] mb-4">Modelo de Negocio</h2>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed">{study.businessModel}</p>
            </section>
             <section>
              <h2 className="text-2xl font-bold text-[var(--text-color)] mb-4">Retos Técnicos</h2>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed">{study.techChallenges}</p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8 lg:sticky top-28 self-start">
            <Card>
                <h3 className="text-xl font-bold text-[var(--text-color)] mb-4">Resultados Clave</h3>
                <p className="text-base text-[var(--text-muted)] mb-6">{study.results.summary}</p>
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {study.results.metrics.map(metric => (
                        <div key={metric.label} className="metric-card">
                            <p className="text-2xl font-bold text-[var(--primary-color)]">{metric.value}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">{metric.label}</p>
                        </div>
                    ))}
                </div>
                {study.results.chartData && (
                  <div className="flex justify-center">
                    <BarChart data={study.results.chartData} />
                  </div>
                )}
            </Card>
             <Card>
                <h3 className="text-xl font-bold text-[var(--text-color)] mb-4">Pila Tecnológica</h3>
                 <div className="flex flex-wrap gap-3">
                    {study.techStack.map(tech => (
                        <div key={tech.name} className="tech-stack-item">
                            <tech.icon/>
                            <span className="ml-2 text-sm">{tech.name}</span>
                        </div>
                    ))}
                </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetailPage;