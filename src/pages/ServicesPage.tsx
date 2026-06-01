import React from 'react';
import { Card } from '../components/common';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { useLanguage } from '../contexts/LanguageContext';

interface ServiceDetailProps {
  id: 'strategy' | 'development' | 'growth';
}

const ServiceDetailCard: React.FC<ServiceDetailProps> = ({ id }) => {
  const { t } = useLanguage();

  const deliverables = t(`services.${id}.deliv`)
    .split('|')
    .map(item => item.trim());

  return (
    <Card className="mb-16">
      <h2 className="text-3xl font-bold text-[var(--text-color)] mb-8">
        {t(`services.${id}.title`)}
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-[var(--primary-color)] mb-3">
            {t('nav.home') === 'Inicio' ? 'El Problema' : 'The Problem'}
          </h3>
          <p className="text-[var(--text-muted)] text-lg leading-relaxed">
            {t(`services.${id}.problem`)}
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[var(--primary-color)] mb-3">
            {t('nav.home') === 'Inicio' ? 'Mi Solución' : 'My Solution'}
          </h3>
          <p className="text-[var(--text-muted)] text-lg leading-relaxed">
            {t(`services.${id}.solution`)}
          </p>
        </div>
      </div>
      <div className="mt-8 border-t border-[var(--border-color)] pt-8 transition-colors duration-300">
        <h3 className="text-xl font-semibold text-[var(--primary-color)] mb-4">
          {t('nav.home') === 'Inicio' ? 'Entregables Clave' : 'Key Deliverables'}
        </h3>
        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {deliverables.map((item, index) => (
            <li key={index} className="flex items-start">
              <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-[var(--text-muted)] text-lg">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

const ServicesPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-color)] tracking-tight">
                {t('services.title')}
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[var(--text-muted)] leading-relaxed font-light">
                {t('services.subtitle')}
            </p>
        </div>
        
        <ServiceDetailCard id="strategy" />
        <ServiceDetailCard id="development" />
        <ServiceDetailCard id="growth" />

      </div>
    </div>
  );
};

export default ServicesPage;