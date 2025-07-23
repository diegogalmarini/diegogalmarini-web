
import React from 'react';
import { detailedServices } from '../constants.tsx';
import { Card } from '../components/common.tsx';
import { IoCheckmarkCircle } from 'react-icons/io5';

const ServiceDetailCard: React.FC<{ service: typeof detailedServices[string] }> = ({ service }) => (
  <Card className="mb-16">
    <h2 className="text-3xl font-bold text-[var(--text-color)] mb-8">{service.title}</h2>
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-xl font-semibold text-[var(--primary-color)] mb-3">El Problema</h3>
        <p className="text-[var(--text-muted)] text-lg leading-relaxed">{service.problem}</p>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-[var(--primary-color)] mb-3">Mi Solución</h3>
        <p className="text-[var(--text-muted)] text-lg leading-relaxed">{service.solution}</p>
      </div>
    </div>
    <div className="mt-8 border-t border-[var(--border-color)] pt-8 transition-colors duration-300">
      <h3 className="text-xl font-semibold text-[var(--primary-color)] mb-4">Entregables Clave</h3>
      <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
        {service.deliverables.map((item, index) => (
          <li key={index} className="flex items-start">
            <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
            <span className="text-[var(--text-muted)] text-lg">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </Card>
);

const ServicesPage: React.FC = () => {
  return (
    <div className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-color)] tracking-tight">
                Servicios Diseñados para el Éxito
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[var(--text-muted)] leading-relaxed">
                Desde la estrategia inicial hasta el crecimiento sostenido, ofrezco soluciones integrales para cada etapa del ciclo de vida de tu producto.
            </p>
        </div>
        
        <ServiceDetailCard service={detailedServices.strategy} />
        <ServiceDetailCard service={detailedServices.development} />
        <ServiceDetailCard service={detailedServices.growth} />

      </div>
    </div>
  );
};

export default ServicesPage;