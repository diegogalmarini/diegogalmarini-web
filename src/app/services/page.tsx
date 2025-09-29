import { IoCheckmarkCircle } from 'react-icons/io5';

// Mock services data - will be replaced with constants in later phases
const detailedServices = {
  strategy: {
    title: "Estrategia Tecnológica",
    problem: "La mayoría de empresas inician proyectos tecnológicos sin una hoja de ruta clara, lo que resulta en costes descontrolados, tecnologías mal alineadas con el negocio, y productos que no resuelven problemas reales del mercado.",
    solution: "Analizo tu mercado, competencia y recursos para diseñar una hoja de ruta tecnológica que maximice el ROI y minimice el riesgo. Mi enfoque combina análisis de negocio con arquitectura técnica para asegurar que cada decisión tecnológica esté alineada con tus objetivos comerciales.",
    deliverables: [
      "Auditoría tecnológica completa de tu situación actual",
      "Análisis de mercado y competencia con benchmarking",
      "Arquitectura de solución escalable y roadmap técnico",
      "Definición de métricas de éxito y KPIs de producto",
      "Plan de implementación por fases con timeline realista",
      "Análisis de ROI y proyección financiera a 12-24 meses"
    ]
  },
  development: {
    title: "Desarrollo de Producto",
    problem: "Muchos proyectos fallan por mala planificación técnica, arquitectura no escalable, o desarrollo sin validación de mercado. El resultado son productos técnicamente sólidos pero comercialmente irrelevantes.",
    solution: "Construyo productos robustos y escalables usando las mejores prácticas de la industria. Mi proceso incluye validación temprana, arquitectura escalable, y desarrollo iterativo basado en feedback real de usuarios.",
    deliverables: [
      "MVP funcional y testeable en producción",
      "Código limpio, documentado y mantenible",
      "Tests automatizados con >90% de cobertura",
      "CI/CD pipeline y deployment automatizado",
      "Documentación técnica y de usuario completa",
      "Plan de escalado y optimización de performance"
    ]
  },
  growth: {
    title: "Crecimiento & Escalado",
    problem: "Tener un producto excelente no garantiza el éxito comercial. Muchas empresas luchan con la adquisición de usuarios, retención, y monetización efectiva de su tecnología.",
    solution: "Implemento estrategias de growth hacking probadas y sistemas de analytics avanzados para impulsar el crecimiento sostenible. Mi enfoque combina marketing digital, optimización de conversión, y análisis de datos para maximizar el LTV y minimizar el CAC.",
    deliverables: [
      "Funnel de conversión optimizado con A/B testing",
      "Implementación de analytics y tracking avanzado (GA4, mixpanel)",
      "Estrategias de adquisición multicanal (SEO, SEM, Social)",
      "Sistema de retención y aumentar LTV del cliente",
      "Automatizaciones de marketing y nurturing",
      "Dashboard de métricas clave y reportes automatizados"
    ]
  }
};

interface ServiceDetailCardProps {
  service: typeof detailedServices[keyof typeof detailedServices];
}

const ServiceDetailCard: React.FC<ServiceDetailCardProps> = ({ service }) => (
  <div className="card mb-16">
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
  </div>
);

export default function ServicesPage() {
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
}