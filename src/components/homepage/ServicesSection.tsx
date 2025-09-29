"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { IoRocketSharp, IoCode, IoTrendingUp, IoCheckmarkCircle } from 'react-icons/io5';

// Mock data - will be replaced with constants in later phases
const homeServices = [
  {
    id: 'strategy' as const,
    title: 'Estrategia Tecnológica',
    icon: IoRocketSharp
  },
  {
    id: 'development' as const,
    title: 'Desarrollo de Producto',
    icon: IoCode
  },
  {
    id: 'growth' as const,
    title: 'Crecimiento & Escalado',
    icon: IoTrendingUp
  }
];

const detailedServices = {
  strategy: {
    title: "Estrategia Tecnológica",
    solution: "Analizo tu mercado, competencia y recursos para diseñar una hoja de ruta tecnológica que maximice el ROI y minimice el riesgo.",
    deliverables: [
      "Auditoría tecnológica completa",
      "Arquitectura de solución escalable",
      "Roadmap de implementación por fases",
      "Análisis de ROI y métricas clave"
    ]
  },
  development: {
    title: "Desarrollo de Producto",
    solution: "Construyo productos robustos y escalables usando las mejores prácticas de la industria y tecnologías de vanguardia.",
    deliverables: [
      "MVP funcional y testeable",
      "Código limpio y documentado",
      "Tests automatizados (>90% cobertura)",
      "Deployment automático y CI/CD"
    ]
  },
  growth: {
    title: "Crecimiento & Escalado",
    solution: "Implemento estrategias de growth hacking y optimización que impulsan la adquisición, retención y monetización.",
    deliverables: [
      "Funnel de conversión optimizado",
      "Analytics y tracking avanzado",
      "A/B testing systematic framework",
      "Estrategia de retención y LTV"
    ]
  }
};

const ServicesSection: React.FC = () => {
  const [activeService, setActiveService] = useState<'strategy' | 'development' | 'growth'>('strategy');

  const activeServiceData = homeServices.find(s => s.id === activeService);
  const activeServiceDetails = activeServiceData ? detailedServices[activeServiceData.id] : null;

  return (
    <section className="py-40">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <h2 className="text-3xl md:text-4xl font-black text-center text-[var(--text-color)] mb-6 tracking-tight">
          Soluciones de Ciclo Completo
        </h2>
        <p className="text-base md:text-lg text-[var(--text-muted)] text-center max-w-2xl mx-auto mb-20 leading-relaxed">
          Mi enfoque integral cubre todo el ciclo de vida del producto, garantizando que cada fase esté alineada con una visión estratégica unificada para maximizar el éxito y la rentabilidad.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {homeServices.map((service) => (
            <button
              key={service.id}
              onClick={() => setActiveService(service.id)}
              className={`service-tab ${activeService === service.id ? 'service-tab-active' : ''}`}
            >
              <div className="flex items-center">
                <div className={`service-icon-container-sm ${service.id}`}>
                  <service.icon />
                </div>
                <span className="font-bold text-lg">{service.title.split(' ')[0]}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="service-content-container">
          {activeServiceDetails && (
            <div key={activeService} className="service-content-panel-animated">
              <div className="card !p-12">
                <div className="grid md:grid-cols-5 gap-12 items-center">
                  <div className="md:col-span-2">
                    <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4">{activeServiceDetails.title}</h3>
                    <p className="text-lg text-[var(--text-muted)] mb-6 leading-relaxed">{activeServiceDetails.solution}</p>
                    <Link href="/services" className="text-[var(--primary-color)] font-semibold hover:underline mt-auto">
                      Ver todos los servicios →
                    </Link>
                  </div>
                  <div className="md:col-span-3 bg-[var(--input-bg)] p-8 rounded-2xl border border-[var(--border-color)]">
                    <h4 className="text-xl font-semibold text-[var(--text-color)] mb-4">Entregables Clave</h4>
                    <ul className="space-y-3">
                      {activeServiceDetails.deliverables.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <IoCheckmarkCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-[var(--text-muted)] text-base">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;