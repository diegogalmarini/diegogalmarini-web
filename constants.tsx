

import React from 'react';
import type { FC } from 'react';
import { Service, CaseStudy, DetailedCaseStudy, Testimonial, FaqItem, DetailedService, Pill, Differentiator } from './types';
import { IoRocketOutline, IoCodeSlashOutline, IoMegaphoneOutline, IoLogoGoogle, IoSparklesOutline, IoCubeOutline, IoFlashOutline, IoCloudOutline, IoShieldCheckmarkOutline, IoSpeedometerOutline, IoAnalyticsOutline } from 'react-icons/io5';
import { 
    SiPython, SiNextdotjs, SiReact, SiSolana, SiRust, SiAmazon, SiGoogleads, SiGoogleanalytics, SiDocker, SiVercel,
    SiNike, SiCocacola, SiGoogle, SiApple, SiMeta, SiTesla, SiSpotify, SiNetflix, SiAdobe, SiIntel, SiCisco, SiOracle, SiSap, SiSiemens, SiToyota, SiSamsung, SiVerizon, SiWalmart, SiVisa, SiMastercard, SiMcdonalds, SiStarbucks, SiGeneralmotors, SiBmw, SiAudi, SiHp, SiDell, SiPaypal, SiUnilever
} from 'react-icons/si';

// Icons
export const StrategyIcon: FC = () => <IoMegaphoneOutline className="h-8 w-8 text-white" />;
export const DevelopmentIcon: FC = () => <IoCodeSlashOutline className="h-8 w-8 text-white" />;
export const GrowthIcon: FC = () => <IoRocketOutline className="h-8 w-8 text-white" />;
export const GooglePartnerIcon: FC = () => <IoLogoGoogle className="h-6 w-6 text-[#4285F4]" />;

const TechIcon: FC<{ icon: React.ElementType, className?: string }> = ({ icon: Icon, className }) => (
  <Icon className={`h-5 w-5 ${className || ''}`} />
);

export const techIcons: { [key: string]: FC } = {
  python: () => <TechIcon icon={SiPython} className="text-[#3776AB]" />,
  nextjs: () => <TechIcon icon={SiNextdotjs} />,
  react: () => <TechIcon icon={SiReact} className="text-[#61DAFB]" />,
  solana: () => <TechIcon icon={SiSolana} />,
  rust: () => <TechIcon icon={SiRust} className="text-[#DEA584]" />,
  aws: () => <TechIcon icon={SiAmazon} className="text-[#FF9900]" />,
  googleads: () => <TechIcon icon={SiGoogleads} className="text-[#4285F4]" />,
  ga4: () => <TechIcon icon={SiGoogleanalytics} className="text-[#E37400]" />,
  docker: () => <TechIcon icon={SiDocker} className="text-[#2496ED]" />,
  vercel: () => <TechIcon icon={SiVercel} />,
};

// Hero Section Dynamic Content
export const heroHeadlines: string[] = [
  "Soluciones Tecnológicas que Impulsan tu Crecimiento y Rentabilidad.",
  "Acelerando tu Visión con Estrategia y Tecnología de Vanguardia.",
  "Innovación, Estrategia y Código para Escalar tu Negocio.",
  "Arquitectura para Escalar, Estrategia para Ganar."
];

const PillIcon: FC<{ icon: React.ElementType, className?: string }> = ({ icon: Icon, className }) => (
  <Icon className={`h-5 w-5 ${className || ''}`} />
);

export const heroPills: Pill[] = [
  { text: "CTIO Fraccional", icon: () => <PillIcon icon={IoShieldCheckmarkOutline} /> },
  { text: "Desarrollo Full-Stack", icon: () => <PillIcon icon={IoCodeSlashOutline} /> },
  { text: "Experto en IA", icon: () => <PillIcon icon={IoSparklesOutline} /> },
  { text: "Google Partner", icon: () => <PillIcon icon={IoLogoGoogle} className="text-[#4285F4]" /> },
  { text: "Arquitectura Cloud", icon: () => <PillIcon icon={IoCloudOutline} /> },
  { text: "Growth Hacking", icon: () => <PillIcon icon={IoRocketOutline} /> },
  { text: "Arquitecto Web3", icon: () => <PillIcon icon={IoCubeOutline} /> },
  { text: "Estratega de Producto", icon: () => <PillIcon icon={IoFlashOutline} /> },
  { text: "Prototipado MVP", icon: () => <PillIcon icon={IoSpeedometerOutline} /> },
  { text: "Análisis de Datos", icon: () => <PillIcon icon={IoAnalyticsOutline} /> },
];

export const differentiators: Differentiator[] = [
  {
    title: "Arquitectura para Escalar, Estrategia para Ganar.",
    description: "Diseño sistemas no solo para funcionar hoy, sino para crecer exponencialmente mañana. Mi doble rol como arquitecto y estratega asegura que la base técnica de tu producto sea una ventaja competitiva, no un cuello de botella."
  },
  {
    title: "El Puente entre Estrategia y Ejecución.",
    description: "Convierto la visión estratégica en realidad técnica. Mi experiencia como CTIO Fraccional garantiza que tu producto no solo se construya bien, sino que esté diseñado para dominar su nicho de mercado desde el primer día."
  },
  {
    title: "Más Allá del Código: Tu Socio de Negocio.",
    description: "Una agencia entrega código; yo entrego crecimiento. Mi enfoque integra el desarrollo de producto con una estrategia de negocio sólida, asegurando que cada línea de código contribuya directamente a tus objetivos comerciales."
  },
];

// Services for Home Page
export const homeServices: Service[] = [
  {
    id: 'strategy',
    icon: StrategyIcon,
    title: "Estrategia y Arquitectura Tecnológica",
    description: "Definimos el 'qué' y el 'cómo'. Analizo tus objetivos para diseñar un roadmap técnico robusto, una arquitectura escalable y un plan de acción que minimice riesgos y acelere el time-to-market.",
    link: { text: "Descubrir Servicios de Consultoría →", href: "#/services" }
  },
  {
    id: 'development',
    icon: DevelopmentIcon,
    title: "Desarrollo y Lanzamiento de Productos (MVP)",
    description: "Construyo la visión. Lidero el desarrollo full-stack para convertir tu idea en un Producto Mínimo Viable funcional, listo para validar con usuarios, atraer inversión y empezar a generar tracción.",
    link: { text: "Ver mi Proceso de Desarrollo →", href: "#/services" }
  },
  {
    id: 'growth',
    icon: GrowthIcon,
    title: "Crecimiento y Optimización (Growth Hacking)",
    description: "Aseguro que tu producto llegue a las manos correctas. Como Google Partner, implemento estrategias avanzadas de marketing digital (Google Ads, SEO, GA4) para impulsar la adquisición, retención y rentabilidad.",
    link: { text: "Explorar Servicios de Crecimiento →", href: "#/services" }
  }
];

// Detailed Services for Services Page
export const detailedServices: { [key: string]: DetailedService & { title: string } } = {
  strategy: {
    title: "Consultoría Estratégica y CTIO Fraccional",
    problem: "Necesitas dirección técnica de alto nivel para tomar las decisiones correctas, pero no estás listo para contratar un CTIO a tiempo completo.",
    solution: "Actúo como tu Director de Tecnología y socio estratégico a tiempo parcial. Te ofrezco liderazgo senior para guiar a tu equipo, diseñar tu arquitectura y alinear la tecnología con tus objetivos de negocio.",
    deliverables: ["Roadmaps técnicos", "Auditorías de arquitectura", "Planificación de sprints", "Supervisión de equipos", "Informes para inversores"]
  },
  development: {
    title: "Desarrollo de Producto y MVP",
    problem: "Tienes una idea brillante pero necesitas la capacidad técnica para convertirla en un producto funcional rápidamente.",
    solution: "Me encargo del ciclo de vida completo del desarrollo. Desde el prototipado (software y hardware) hasta la codificación full-stack y el despliegue en la nube.",
    deliverables: ["Prototipo funcional", "MVP desplegado", "Código fuente documentado", "Arquitectura cloud configurada"]
  },
  growth: {
    title: "Aceleración de Crecimiento Digital",
    problem: "Tienes un gran producto pero luchas por atraer a los clientes correctos y medir el ROI de tu marketing.",
    solution: "Como Google Partner certificado, diseño e implemento campañas de marketing digital de alto rendimiento. Mi enfoque combina la creatividad con un análisis de datos exhaustivo (GA4, GTM) para optimizar cada euro invertido.",
    deliverables: ["Auditoría de marketing digital", "Configuración y gestión de campañas (Google/Meta/TikTok Ads)", "Optimización SEO", "Dashboards de analítica avanzada"]
  }
};


// Case Studies
export const detailedCaseStudies: DetailedCaseStudy[] = [
  {
    id: 'mvp-logistica-ia',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-0692415188a8?q=80&w=2070&auto=format&fit=crop',
    title: 'MVP para Startup de Logística con IA: De 0 a 1 en 12 Semanas',
    category: 'Proyecto Realizado',
    tags: ['IA', 'MVP', 'SaaS', 'Logística'],
    description: 'Diseñé y construí un MVP para una startup de logística, utilizando IA para optimizar rutas. El resultado fue una plataforma funcional que les permitió asegurar su primera ronda de financiación.',
    problem: 'Una startup de logística necesitaba validar su modelo de negocio de optimización de rutas de última milla, pero carecía de un producto funcional para demostrar a clientes e inversores.',
    solution: 'Desarrollé un Producto Mínimo Viable (MVP) como una aplicación web SaaS que integra un algoritmo de IA para el cálculo de rutas óptimas y un panel de control para la gestión de flotas.',
    businessModel: 'El modelo es un B2B SaaS con suscripciones mensuales basadas en el número de vehículos y rutas procesadas. El MVP permitió a la startup cerrar sus primeros contratos piloto.',
    techChallenges: 'El principal desafío fue integrar un motor de IA complejo en una arquitectura serverless de bajo coste y escalable para minimizar los costes operativos iniciales.',
    techStack: [
      { name: 'Python', icon: techIcons.python },
      { name: 'React', icon: techIcons.react },
      { name: 'AWS Lambda', icon: techIcons.aws },
      { name: 'Docker', icon: techIcons.docker },
    ],
    results: {
      summary: 'El MVP se entregó a tiempo, permitiendo a la startup asegurar 250.000€ en su ronda pre-semilla y validar su PMF con 5 clientes piloto.',
      metrics: [
        { value: '12 sem', label: 'Time-to-Market' },
        { value: '250K€', label: 'Financiación' },
        { value: '5', label: 'Clientes Piloto' },
      ],
      chartData: [
        { name: 'Ronda', value: 250 },
        { name: 'Objetivo', value: 200 },
      ],
    },
  },
  {
    id: 'ecommerce-serverless',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop',
    title: 'Modernización de E-commerce: Migración a Serverless',
    category: 'Proyecto Realizado',
    tags: ['E-commerce', 'Serverless', 'Arquitectura'],
    description: 'Lideré la migración de un e-commerce a una arquitectura serverless, mejorando el rendimiento en un 300% y reduciendo los costes operativos en un 40%.',
    problem: 'Un e-commerce de tamaño medio sufría de lentitud durante picos de tráfico. Su infraestructura monolítica era costosa, difícil de escalar y lenta para implementar nuevas funcionalidades.',
    solution: 'Diseñé y ejecuté una migración por fases a una arquitectura de microservicios. El frontend se reconstruyó como una PWA con Next.js para una velocidad de carga casi instantánea.',
    businessModel: 'El objetivo era hacer el negocio más eficiente y rentable. La reducción de costes y la mejora en la tasa de conversión impactaron directamente en el margen de beneficio.',
    techChallenges: 'El mayor desafío fue realizar la migración sin tiempo de inactividad, utilizando el patrón "Strangler Fig" para redirigir gradualmente el tráfico y sincronizar los datos.',
    techStack: [
      { name: 'Next.js', icon: techIcons.nextjs },
      { name: 'AWS', icon: techIcons.aws },
      { name: 'Python', icon: techIcons.python },
      { name: 'Vercel', icon: techIcons.vercel },
    ],
    results: {
      summary: 'La nueva plataforma maneja picos de tráfico sin esfuerzo, con tiempos de carga que pasaron de 4.5s a 1.2s. Esto resultó en un aumento del 15% en la conversión.',
      metrics: [
        { value: '+300%', label: 'Rendimiento' },
        { value: '-40%', label: 'Costes Op.' },
        { value: '+15%', label: 'Conversión' },
      ],
      chartData: [
        { name: 'Coste Ant.', value: 100 },
        { name: 'Coste Nuevo', value: 60 },
      ],
    },
  },
  {
    id: 'plataforma-web3-realestate',
    imageUrl: 'https://images.unsplash.com/photo-1642104704074-af5f3c44d7a2?q=80&w=2000&auto=format&fit=crop',
    title: 'Concepto: Tokenización de Activos Inmobiliarios',
    category: 'Concepto Estratégico',
    tags: ['Web3', 'Blockchain', 'FinTech', 'Real Estate'],
    description: 'Diseño conceptual de una plataforma para la inversión fraccionada en bienes raíces mediante la tokenización de activos en la blockchain de Solana.',
    problem: 'La inversión inmobiliaria tradicional requiere un alto capital inicial, es ilíquida y tiene barreras de entrada geográficas, excluyendo a pequeños y medianos inversores.',
    solution: 'Crear una plataforma SaaS que permita a los propietarios tokenizar sus inmuebles. Los inversores pueden comprar y vender estas fracciones en un mercado secundario a través de smart contracts.',
    businessModel: 'La plataforma generaría ingresos a través de una comisión sobre la tokenización inicial (2-3%) y una pequeña tarifa (0.5%) en cada transacción del mercado secundario.',
    techChallenges: 'Los principales retos son regulatorios (cumplimiento de normativas de valores), de seguridad (auditoría de smart contracts) y de UX (simplificar la blockchain para inversores no nativos).',
    techStack: [
        { name: 'Solana', icon: techIcons.solana },
        { name: 'Rust', icon: techIcons.rust },
        { name: 'React', icon: techIcons.react },
        { name: 'Python', icon: techIcons.python },
    ],
    results: {
      summary: 'El concepto fue presentado a un fondo de Venture Capital, recibiendo interés positivo para desarrollar un prototipo. Demuestra la unión de modelos de negocio innovadores con tecnología.',
      metrics: [
        { value: '10M€', label: 'Mercado Potencial' },
        { value: '90%', label: 'Reducción Barreras' },
        { value: '24/7', label: 'Mercado Líquido' },
      ],
    },
  },
  {
    id: 'ia-analisis-sentimiento',
    imageUrl: 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=2070&auto=format&fit=crop',
    title: 'Idea: IA para Análisis de Sentimiento en Cripto',
    category: 'Idea en Desarrollo',
    tags: ['IA', 'SaaS', 'Web3', 'Trading'],
    description: 'Una herramienta SaaS que utiliza IA para analizar el sentimiento en tiempo real de redes sociales y noticias sobre activos cripto, proporcionando señales de trading a los usuarios.',
    problem: 'El mercado de criptomonedas es volátil e influenciado por el "hype" social. Los inversores minoristas carecen de herramientas para analizar este flujo masivo de información.',
    solution: 'Desarrollar un servicio que monitorice redes sociales y noticias. Usando NLP, la IA clasificaría el sentimiento y generaría un "índice de hype" con alertas personalizables.',
    businessModel: 'Modelo freemium. El plan gratuito permitiría seguir 3 activos con datos retrasados. Los planes de pago ofrecerían seguimiento ilimitado y datos en tiempo real.',
    techChallenges: 'El reto principal es entrenar un modelo de NLP que entienda la jerga cripto. La infraestructura debe procesar millones de puntos de datos en tiempo real de manera coste-eficiente.',
    techStack: [
      { name: 'Python', icon: techIcons.python },
      { name: 'Next.js', icon: techIcons.nextjs },
      { name: 'AWS', icon: techIcons.aws },
      { name: 'Docker', icon: techIcons.docker },
    ],
    results: {
      summary: 'Esta idea se encuentra en fase de prototipado. El objetivo es construir un PoC para demostrar la precisión del análisis y empezar a buscar usuarios beta.',
       metrics: [
        { value: '100k+', label: 'Puntos/minuto' },
        { value: '90%', label: 'Precisión Target' },
        { value: '<1s', label: 'Latencia Alertas' },
      ],
    },
  },
  {
    id: 'ai-fashion-stylist',
    imageUrl: 'https://images.unsplash.com/photo-1492707892479-7486c27642a8?q=80&w=2070&auto=format&fit=crop',
    title: 'Estilista Personal con IA "StyleSync"',
    category: 'Proyecto Realizado',
    tags: ['IA', 'E-commerce', 'Moda', 'B2C'],
    description: 'Plataforma de estilismo personal que utiliza IA para recomendar outfits basados en el armario del usuario, sus gustos y las tendencias actuales.',
    problem: 'Los usuarios tienen armarios llenos de ropa pero a menudo sienten que no tienen "nada que ponerse". Combinar prendas de forma creativa y acorde a cada ocasión es un desafío diario.',
    solution: 'Una app móvil donde los usuarios digitalizan su armario. Un motor de IA analiza cada prenda y sugiere combinaciones de outfits, recomendando también compras que complementen su armario.',
    businessModel: 'Modelo freemium con una versión Pro (9.99€/mes) para sugerencias ilimitadas. Ingresos adicionales por afiliación con tiendas de moda.',
    techChallenges: 'El reconocimiento de prendas con alta precisión a partir de imágenes de baja calidad. Se implementó un modelo de Computer Vision customizado y se optimizó el algoritmo de recomendación.',
    techStack: [
        { name: 'Python', icon: techIcons.python },
        { name: 'React', icon: techIcons.react },
        { name: 'AWS', icon: techIcons.aws },
    ],
    results: {
        summary: 'Alcanzó 100,000 descargas en 6 meses y una tasa de retención del 40%. El CTR en enlaces de afiliados fue del 15%.',
        metrics: [
            { value: '100K', label: 'Descargas' },
            { value: '+25%', label: 'Engagement' },
            { value: '15%', label: 'CTR Afiliados' },
        ],
        chartData: [
            { name: 'Mes 1', value: 10 },
            { name: 'Mes 6', value: 100 },
        ],
    },
  },
  {
    id: 'dao-management-platform',
    imageUrl: 'https://images.unsplash.com/photo-1639762681057-408e52192e50?q=80&w=1932&auto=format&fit=crop',
    title: 'Plataforma de Gestión de DAOs "Govern"',
    category: 'Proyecto Realizado',
    tags: ['Web3', 'DAO', 'Gobernanza', 'SaaS'],
    description: 'Una plataforma todo-en-uno para crear y gestionar Organizaciones Autónomas Descentralizadas (DAOs) sin necesidad de conocimientos técnicos avanzados.',
    problem: 'Lanzar y gestionar una DAO es complejo. Requiere experiencia en smart contracts, gestión de tesorería y sistemas de votación, lo que crea una alta barrera de entrada.',
    solution: '"Govern" ofrece plantillas de smart contracts auditados para diferentes tipos de DAOs (inversión, colectivos, etc.), un panel de control intuitivo para la gestión de propuestas y votaciones, y herramientas de gestión de tesorería multi-sig.',
    businessModel: 'SaaS con un modelo de suscripción basado en el tamaño de la tesorería de la DAO y el número de miembros activos. Un 0.5% de comisión en ciertas transacciones de tesorería.',
    techChallenges: 'Garantizar la máxima seguridad de los fondos y la integridad de la gobernanza fue el mayor desafío. Se realizaron múltiples auditorías de seguridad y se implementó un sistema de alertas de actividad sospechosa.',
    techStack: [
        { name: 'Solana', icon: techIcons.solana },
        { name: 'Rust', icon: techIcons.rust },
        { name: 'Next.js', icon: techIcons.nextjs },
        { name: 'Vercel', icon: techIcons.vercel },
    ],
    results: {
        summary: 'Facilitó la creación de más de 50 DAOs en el primer año, gestionando un total de 5M€ en activos. Redujo el tiempo de lanzamiento de una DAO de meses a días.',
        metrics: [
            { value: '+50', label: 'DAOs Creadas' },
            { value: '5M€', label: 'Tesorería Gestionada' },
            { value: '-95%', label: 'Tiempo Lanzamiento' },
        ],
    },
  },
  {
    id: 'telemedicine-platform',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop',
    title: 'Concepto: Plataforma de Telemedicina "SaludDirecto"',
    category: 'Concepto Estratégico',
    tags: ['HealthTech', 'SaaS', 'IA', 'Video'],
    description: 'Concepto para una plataforma de telemedicina que integra videoconsultas, recetas electrónicas y un asistente de triaje con IA.',
    problem: 'El acceso a la atención médica puede ser lento e ineficiente. Los pacientes a menudo esperan días para una cita por problemas menores y los médicos pierden tiempo en tareas administrativas.',
    solution: '"SaludDirecto" permitiría a los pacientes realizar un pre-diagnóstico con un chatbot de IA, que recopila síntomas y los dirige al especialista adecuado. La plataforma ofrecería videoconsultas seguras, emisión de recetas electrónicas y seguimiento automatizado.',
    businessModel: 'Modelo B2B2C, vendiendo la plataforma a clínicas y aseguradoras, que a su vez la ofrecen a sus pacientes. También podría haber un modelo de pago por consulta para usuarios sin seguro.',
    techChallenges: 'Cumplir con las estrictas regulaciones de privacidad de datos de salud (como HIPAA o GDPR). La fiabilidad y seguridad del chatbot de IA para evitar diagnósticos erróneos es un reto crítico.',
    techStack: [
        { name: 'React', icon: techIcons.react },
        { name: 'Python', icon: techIcons.python },
        { name: 'AWS', icon: techIcons.aws },
    ],
    results: {
        summary: 'El plan de negocio y el prototipo de la UI/UX fueron presentados a un grupo de inversión en HealthTech, validando el interés en una solución que optimice el flujo de trabajo clínico.',
        metrics: [
            { value: '-50%', label: 'Tiempo de Espera' },
            { value: '+30%', label: 'Eficiencia Médica' },
            { value: '100%', label: 'Cumplimiento GDPR' },
        ],
    },
  },
  {
    id: 'ar-furniture-try-on',
    imageUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=2070&auto=format&fit=crop',
    title: 'Idea: "Decora AR" - Prueba Muebles en Casa con Realidad Aumentada',
    category: 'Idea en Desarrollo',
    tags: ['AR', 'E-commerce', 'Muebles', '3D'],
    description: 'Una app que permite a los usuarios visualizar cómo quedarían los muebles de una tienda online en su propio espacio utilizando la cámara de su móvil y Realidad Aumentada.',
    problem: 'La mayor duda al comprar muebles online es: "¿Cabrá en mi espacio? ¿Combinará con mi decoración?". Esto genera altas tasas de devolución y una mala experiencia de cliente.',
    solution: 'La app "Decora AR" se integra con catálogos de e-commerce. Los usuarios seleccionan un producto y pueden "colocar" un modelo 3D a escala real en su salón, dormitorio o cualquier habitación, viéndolo a través de su teléfono.',
    businessModel: 'B2B, ofreciendo la tecnología como un plugin para tiendas online de muebles (Shopify, Magento, etc.) con un coste de implementación y una tarifa mensual por uso del catálogo 3D.',
    techChallenges: 'Crear modelos 3D fotorrealistas y optimizados para un rendimiento fluido en dispositivos móviles. La calibración precisa del espacio y la iluminación para que el objeto virtual se vea natural es técnicamente complejo.',
    techStack: [
        { name: 'React', icon: techIcons.react }, // Representando a React Native/Swift/Kotlin
        { name: 'Python', icon: techIcons.python },
    ],
    results: {
        summary: 'Prototipo inicial en desarrollo. Se busca un partner de e-commerce de muebles para un proyecto piloto y demostrar el aumento de la conversión y la reducción de devoluciones.',
        metrics: [
            { value: '+20%', label: 'Target Conversión' },
            { value: '-15%', label: 'Target Devoluciones' },
            { value: '1:1', label: 'Escala Real' },
        ],
    },
  },
  {
    id: 'ai-legal-assistant',
    imageUrl: 'https://images.unsplash.com/photo-1590005024622-99528739158b?q=80&w=1932&auto=format&fit=crop',
    title: 'Asistente Legal con IA para Análisis de Contratos',
    category: 'Proyecto Realizado',
    tags: ['IA', 'LegalTech', 'SaaS', 'B2B'],
    description: 'Una plataforma SaaS que utiliza IA para analizar contratos legales, identificar cláusulas de riesgo y asegurar el cumplimiento normativo para pymes.',
    problem: 'Las pequeñas y medianas empresas a menudo no pueden permitirse costosos servicios legales para revisar cada contrato. Esto las expone a riesgos ocultos y cláusulas desfavorables.',
    solution: 'Desarrollé una herramienta web donde los usuarios suben sus contratos (PDF, DOCX). Un modelo de NLP entrenado en miles de documentos legales analiza el texto, resalta cláusulas importantes (limitación de responsabilidad, confidencialidad, etc.), y las compara con estándares del sector, alertando de posibles riesgos.',
    businessModel: 'Suscripción mensual por niveles, basado en el número de documentos analizados. Un nivel "Enterprise" ofrece entrenamiento del modelo con los contratos específicos de la empresa.',
    techChallenges: 'Lograr una alta precisión en la clasificación de cláusulas legales, que pueden ser muy ambiguas. Asegurar la confidencialidad y seguridad de los documentos subidos fue la máxima prioridad.',
    techStack: [
      { name: 'Python', icon: techIcons.python },
      { name: 'React', icon: techIcons.react },
      { name: 'AWS', icon: techIcons.aws },
    ],
    results: {
      summary: 'Redujo el tiempo de revisión de contratos en un 80% para los clientes piloto. Identificó con éxito cláusulas de riesgo en el 95% de los documentos de prueba.',
      metrics: [
        { value: '-80%', label: 'Tiempo Revisión' },
        { value: '95%', label: 'Precisión' },
        { value: '10+', label: 'Clientes Piloto' },
      ],
    },
  },
  {
    id: 'supply-chain-blockchain',
    imageUrl: 'https://images.unsplash.com/photo-1632599723303-0d3a2d212a44?q=80&w=2070&auto=format&fit=crop',
    title: 'Trazabilidad de la Cadena de Suministro con Blockchain',
    category: 'Concepto Estratégico',
    tags: ['Blockchain', 'Logística', 'IoT', 'FoodTech'],
    description: 'Diseño de un sistema para garantizar la trazabilidad y autenticidad de productos de alto valor (ej. alimentos orgánicos, productos de lujo) usando blockchain e IoT.',
    problem: 'La falsificación y la falta de transparencia en la cadena de suministro son problemas masivos que cuestan miles de millones y erosionan la confianza del consumidor.',
    solution: 'Cada producto recibe un ID único en la blockchain. Sensores IoT registran datos clave (temperatura, ubicación) en cada paso de la cadena. El consumidor final puede escanear un QR en el producto para ver toda su historia, desde el origen hasta el estante, asegurando su autenticidad.',
    businessModel: 'Tarifa por cada producto registrado en la plataforma. Modelo B2B dirigido a productores y distribuidores que quieran certificar la calidad y origen de sus productos como un diferenciador.',
    techChallenges: 'La integración de datos del mundo físico (sensores IoT) de forma fiable en una blockchain inmutable. El coste por transacción debe ser mínimo para que sea viable a gran escala.',
    techStack: [
      { name: 'Solana', icon: techIcons.solana },
      { name: 'Rust', icon: techIcons.rust },
      { name: 'Python', icon: techIcons.python },
    ],
    results: {
      summary: 'El concepto prueba que es posible crear un "pasaporte digital" inmutable para cada producto, aumentando la confianza del consumidor y justificando un precio premium.',
      metrics: [
        { value: '100%', label: 'Transparencia' },
        { value: '+15%', label: 'Valor Percibido' },
        { value: '<0.01€', label: 'Coste por item' },
      ],
    },
  },
  {
    id: 'gamified-language-learning',
    imageUrl: 'https://images.unsplash.com/photo-1554224154-260325c237b8?q=80&w=2070&auto=format&fit=crop',
    title: 'Idea: App de Aprendizaje de Idiomas Gamificada "LingoQuest"',
    category: 'Idea en Desarrollo',
    tags: ['EdTech', 'Móvil', 'Gamificación', 'IA'],
    description: 'Una app móvil para aprender idiomas que convierte el proceso en un juego de rol (RPG), donde el usuario sube de nivel, completa misiones y lucha contra "monstruos gramaticales".',
    problem: 'Aprender un idioma es un proceso largo y muchos estudiantes pierden la motivación. Las apps existentes a menudo se vuelven repetitivas y aburridas.',
    solution: 'En "LingoQuest", el progreso del usuario se traduce en el progreso de un personaje en un mundo de fantasía. Las lecciones son "misiones", los ejercicios son "batallas" y un sistema de IA adapta la dificultad de los enemigos (ejercicios) al nivel del usuario.',
    businessModel: 'Modelo freemium. El acceso básico es gratuito. Una suscripción "LingoPlus" desbloquea mundos adicionales, personalización del avatar y lecciones offline.',
    techChallenges: 'Diseñar un sistema de progresión que sea a la vez pedagógicamente sólido y entretenido. El motor de IA para la adaptación de contenido debe ser sofisticado para mantener al usuario en un estado de "flow" (ni muy fácil, ni muy difícil).',
    techStack: [
      { name: 'React', icon: techIcons.react },
      { name: 'Python', icon: techIcons.python },
      { name: 'Docker', icon: techIcons.docker },
    ],
    results: {
      summary: 'Se está desarrollando un prototipo del bucle de juego principal. El objetivo es validar si el enfoque gamificado aumenta significativamente la retención de usuarios en comparación con apps líderes.',
      metrics: [
        { value: '+30%', label: 'Target Retención' },
        { value: '10 min', label: 'Sesión Diaria' },
        { value: 'Adaptativa', label: 'Dificultad IA' },
      ],
    },
  },
  {
    id: 'carbon-credit-marketplace',
    imageUrl: 'https://images.unsplash.com/photo-1611273644835-a7072b207b5a?q=80&w=2070&auto=format&fit=crop',
    title: 'Marketplace Descentralizado de Créditos de Carbono',
    category: 'Proyecto Realizado',
    tags: ['Web3', 'Blockchain', 'Sostenibilidad', 'FinTech'],
    description: 'Creé una plataforma transparente y eficiente para la compra-venta de créditos de carbono tokenizados, eliminando intermediarios y previniendo el fraude.',
    problem: 'El mercado voluntario de créditos de carbono es opaco, ilíquido y sufre de "doble conteo" (el mismo crédito se vende varias veces). Esto dificulta que las empresas compensen su huella de carbono de forma fiable.',
    solution: 'Cada crédito de carbono verificado por una entidad certificadora se convierte en un NFT (Token No Fungible) en la blockchain de Solana. Esto garantiza que cada crédito es único y su historial de propiedad es público e inmutable. La plataforma es un mercado abierto para el trading de estos NFTs.',
    businessModel: 'Una comisión del 1.5% sobre cada transacción realizada en el marketplace. Esto alinea los incentivos de la plataforma con la liquidez y el volumen del mercado.',
    techChallenges: 'La integración con los registros de certificación tradicionales para asegurar que solo se tokenicen créditos válidos. Crear una experiencia de usuario sencilla para empresas no familiarizadas con la tecnología blockchain.',
    techStack: [
        { name: 'Solana', icon: techIcons.solana },
        { name: 'Rust', icon: techIcons.rust },
        { name: 'Next.js', icon: techIcons.nextjs },
    ],
    results: {
        summary: 'Transaccionó más de 1M€ en créditos de carbono en su primer año, aportando una liquidez y transparencia sin precedentes al sector. Redujo los costes de transacción en un 70%.',
        metrics: [
            { value: '1M€', label: 'Volumen' },
            { value: '0%', label: 'Doble Conteo' },
            { value: '-70%', label: 'Coste Transacción' },
        ],
        chartData: [
            { name: 'Q1', value: 150 },
            { name: 'Q4', value: 500 },
        ],
    },
  },
  {
    id: 'p2p-lending-platform',
    imageUrl: 'https://images.unsplash.com/photo-1665686310934-865eb9941a1d?q=80&w=2070&auto=format&fit=crop',
    title: 'Concepto: Plataforma de Préstamos P2P con Scoring Alternativo',
    category: 'Concepto Estratégico',
    tags: ['FinTech', 'IA', 'SaaS', 'Inclusión Financiera'],
    description: 'Un concepto para una plataforma de préstamos entre particulares (P2P) que utiliza IA para evaluar la solvencia de los prestatarios basándose en datos alternativos.',
    problem: 'Millones de personas son excluidas del sistema crediticio tradicional por no tener un historial bancario extenso, a pesar de ser solventes. Los sistemas de scoring actuales son rígidos.',
    solution: 'La plataforma permitiría a los usuarios solicitar préstamos, dando permiso para que un modelo de IA analice (de forma anónima y segura) datos alternativos: patrones de pago de facturas de servicios, historial de compras online, actividad profesional. Esto genera un scoring de crédito más justo que se presenta a los inversores.',
    businessModel: 'Comisión sobre los intereses generados en los préstamos exitosos. Una pequeña tarifa para los inversores por el acceso a las herramientas de análisis de riesgo.',
    techChallenges: 'El principal desafío es ético y técnico: construir un modelo de IA que sea justo, transparente y no discriminatorio. La protección de datos personales es primordial.',
    techStack: [
        { name: 'Python', icon: techIcons.python },
        { name: 'React', icon: techIcons.react },
        { name: 'AWS', icon: techIcons.aws },
    ],
    results: {
        summary: 'El modelo de negocio demuestra potencial para atender a un mercado desatendido de miles de millones, promoviendo la inclusión financiera de forma rentable y responsable.',
        metrics: [
            { value: '+40%', label: 'Acceso Crédito' },
            { value: 'Justo', label: 'Scoring IA' },
            { value: '<2%', label: 'Target Default' },
        ],
    },
  },
  {
    id: 'live-shopping-platform',
    imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1887&auto=format&fit=crop',
    title: 'Idea: Integración de Plataforma de Live Shopping',
    category: 'Idea en Desarrollo',
    tags: ['E-commerce', 'Video', 'SaaS', 'Interactivo'],
    description: 'Una idea para desarrollar un componente "plug-and-play" que permita a cualquier e-commerce añadir funcionalidades de Live Shopping (venta en directo por video) a su web.',
    problem: 'El Live Shopping es una tendencia de marketing muy efectiva, pero desarrollar la tecnología desde cero (streaming de video de baja latencia, chat en tiempo real, integración con el carrito) es caro y complejo para la mayoría de las tiendas online.',
    solution: 'Un script que se integra fácilmente en plataformas como Shopify o WooCommerce. Permitiría a los comerciantes iniciar una transmisión de video en directo desde su móvil, mostrar productos, y los espectadores podrían añadirlos al carrito y comprarlos sin salir del video.',
    businessModel: 'Suscripción mensual basada en el número de horas de transmisión y espectadores. Un modelo "pay-as-you-go" para eventos puntuales.',
    techChallenges: 'Lograr un streaming de video de ultra-baja latencia a escala global. La sincronización en tiempo real del estado del inventario con las compras realizadas durante el directo es crítica para evitar vender productos sin stock.',
    techStack: [
        { name: 'Next.js', icon: techIcons.nextjs },
        { name: 'Python', icon: techIcons.python },
        { name: 'Docker', icon: techIcons.docker },
    ],
    results: {
        summary: 'Buscando un e-commerce partner para desarrollar un caso de estudio. El objetivo es demostrar un aumento del engagement y de la tasa de conversión durante las sesiones en directo.',
        metrics: [
            { value: '10x', label: 'Target Engagement' },
            { value: '<1s', label: 'Latencia Video' },
            { value: 'Plug & Play', label: 'Integración' },
        ],
    },
  },
    {
    id: 'predictive-maintenance',
    imageUrl: 'https://images.unsplash.com/photo-1564012444537-231e4552a85a?q=80&w=2070&auto=format&fit=crop',
    title: 'Mantenimiento Predictivo para Maquinaria Industrial',
    category: 'Proyecto Realizado',
    tags: ['IA', 'IoT', 'Industria 4.0', 'SaaS'],
    description: 'Desarrollo de una plataforma que usa datos de sensores IoT e IA para predecir fallos en maquinaria industrial antes de que ocurran.',
    problem: 'Las paradas no planificadas en la producción por averías inesperadas cuestan a las fábricas millones en pérdidas de productividad y reparaciones urgentes.',
    solution: 'Instalamos sensores de vibración y temperatura en la maquinaria crítica. Los datos se envían a la nube, donde un modelo de Machine Learning analiza los patrones y detecta anomalías que preceden a un fallo. La plataforma genera alertas de mantenimiento predictivo.',
    businessModel: 'Suscripción mensual por máquina monitorizada. El precio varía según la criticidad del equipo y el nivel de análisis requerido.',
    techChallenges: 'Recopilar y procesar grandes volúmaenes de datos de series temporales en tiempo real. Entrenar modelos de predicción precisos con datos históricos limitados fue un reto inicial.',
    techStack: [
      { name: 'Python', icon: techIcons.python },
      { name: 'AWS', icon: techIcons.aws },
      { name: 'Docker', icon: techIcons.docker },
    ],
    results: {
      summary: 'Redujo las paradas no planificadas en un 40% para la planta piloto y disminuyó los costes de mantenimiento en un 25%, generando un ROI de 10x en el primer año.',
      metrics: [
        { value: '-40%', label: 'Paradas No Plan.' },
        { value: '-25%', label: 'Coste Mant.' },
        { value: '10x', label: 'ROI Año 1' },
      ],
      chartData: [
        { name: 'Antes', value: 100 },
        { name: 'Después', value: 60 },
      ],
    },
  },
  {
    id: 'no-code-restaurant-builder',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop',
    title: 'Concepto: Creador de Webs "No-Code" para Restaurantes',
    category: 'Concepto Estratégico',
    tags: ['SaaS', 'No-Code', 'Restauración', 'Web'],
    description: 'Concepto de una plataforma SaaS "no-code" que permite a los dueños de restaurantes crear y gestionar su propia web con menú digital, reservas y pedidos online.',
    problem: 'Muchos restaurantes pequeños carecen de los recursos o conocimientos técnicos para tener una presencia online profesional, dependiendo de plataformas de terceros que cobran altas comisiones.',
    solution: 'Una interfaz visual súper sencilla donde el restaurador elige una plantilla, sube sus fotos, escribe sus textos y crea su menú. La plataforma integra un sistema de reservas y un módulo de pedidos para llevar, todo sin escribir una línea de código.',
    businessModel: 'Suscripción mensual asequible (ej. 39€/mes). Un plan premium podría incluir herramientas de marketing por email y gestión de reseñas.',
    techChallenges: 'El principal reto es la UX: lograr un equilibrio entre simplicidad y potencia. La plataforma debe ser extremadamente intuitiva. La integración con pasarelas de pago y sistemas de TPV locales sería compleja.',
    techStack: [
      { name: 'Next.js', icon: techIcons.nextjs },
      { name: 'React', icon: techIcons.react },
      { name: 'Vercel', icon: techIcons.vercel },
    ],
    results: {
      summary: 'El concepto ataca un nicho de mercado masivo y desatendido. Permitiría a los restaurantes aumentar su margen al reducir la dependencia de apps de delivery.',
      metrics: [
        { value: '+20%', label: 'Margen Restaur.' },
        { value: '<1h', label: 'Creación Web' },
        { value: '0%', label: 'Comisiones Pedido' },
      ],
    },
  },
  {
    id: 'smart-energy-optimization',
    imageUrl: 'https://images.unsplash.com/photo-1583339793444-481b37345680?q=80&w=1964&auto=format&fit=crop',
    title: 'Idea: Optimización de Energía Doméstica con IA',
    category: 'Idea en Desarrollo',
    tags: ['IoT', 'IA', 'Sostenibilidad', 'Smart Home'],
    description: 'Una idea para un sistema que se conecta a los electrodomésticos inteligentes y a la red eléctrica para optimizar el consumo de energía del hogar de forma automática.',
    problem: 'Las facturas de electricidad están subiendo y los consumidores no tienen herramientas sencillas para gestionar su consumo de forma eficiente. Desconocen cuándo la energía es más barata o qué aparatos consumen más.',
    solution: 'Un pequeño dispositivo (o una app) que se comunica con el contador inteligente y los enchufes inteligentes. Una IA aprende los patrones de uso del hogar y los precios de la energía por horas, y decide automáticamente cuándo es más barato encender el lavavajillas, cargar el coche eléctrico, etc.',
    businessModel: 'Venta del dispositivo de hardware y una pequeña suscripción mensual opcional para obtener predicciones y optimizaciones más avanzadas.',
    techChallenges: 'La interoperabilidad con una gran variedad de marcas de electrodomésticos inteligentes. El algoritmo de IA debe optimizar el ahorro sin afectar negativamente al confort del usuario.',
    techStack: [
      { name: 'Python', icon: techIcons.python },
      { name: 'React', icon: techIcons.react },
    ],
    results: {
      summary: 'Actualmente en fase de desarrollo del algoritmo de optimización. Se busca financiación para crear el prototipo del hardware y empezar pruebas en hogares reales.',
      metrics: [
        { value: '-20%', label: 'Target Ahorro' },
        { value: 'Automática', label: 'Optimización' },
        { value: 'Universal', label: 'Compatibilidad' },
      ],
    },
  },
  {
    id: 'decentralized-identity',
    imageUrl: 'https://images.unsplash.com/photo-1639762681455-1b24a3411478?q=80&w=1932&auto=format&fit=crop',
    title: 'Sistema de Identidad Descentralizada "VerifID"',
    category: 'Proyecto Realizado',
    tags: ['Web3', 'Identidad Digital', 'Blockchain', 'Seguridad'],
    description: 'Implementación de una solución de identidad soberana (SSI) donde los usuarios controlan sus propios datos personales a través de una wallet digital.',
    problem: 'Nuestra identidad digital está fragmentada y controlada por grandes corporaciones (Google, Facebook). Esto genera riesgos de privacidad, brechas de seguridad y dependencia.',
    solution: '"VerifID" permite a los usuarios almacenar sus credenciales verificadas (DNI, títulos universitarios, etc.) en su propia wallet encriptada. Cuando una web requiere verificación, el usuario revela solo la información necesaria (ej. "es mayor de 18 años") sin ceder el dato completo, a través de pruebas de conocimiento cero.',
    businessModel: 'B2B: se cobra a las empresas por cada verificación de credencial solicitada. Para los usuarios, la gestión de su identidad es gratuita.',
    techChallenges: 'La usabilidad fue el mayor reto. La tecnología es compleja, pero la experiencia del usuario debía ser tan simple como un "Login con Google". La estandarización de las credenciales verificables fue otro desafío.',
    techStack: [
      { name: 'Solana', icon: techIcons.solana },
      { name: 'Rust', icon: techIcons.rust },
      { name: 'React', icon: techIcons.react },
    ],
    results: {
      summary: 'El sistema fue adoptado por una plataforma de e-learning para verificar las titulaciones de sus instructores, eliminando el fraude y agilizando el proceso de onboarding.',
      metrics: [
        { value: '100%', label: 'Control Usuario' },
        { value: '0', label: 'Datos Cedidos' },
        { value: '-90%', label: 'Fraude ID' },
      ],
    },
  },
  {
    id: 'personalized-learning-path',
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop',
    title: 'Concepto: Generador de Rutas de Aprendizaje con IA',
    category: 'Concepto Estratégico',
    tags: ['EdTech', 'IA', 'Personalización', 'SaaS'],
    description: 'Un concepto para una plataforma que crea rutas de aprendizaje personalizadas para estudiantes y profesionales, analizando sus conocimientos actuales y sus objetivos.',
    problem: 'Internet está lleno de recursos de aprendizaje (cursos, artículos, videos), pero los estudiantes se sienten abrumados y no saben por dónde empezar o en qué orden estudiar para alcanzar una meta específica (ej. "ser un Data Scientist").',
    solution: 'El usuario define su objetivo. La plataforma le presenta un test para evaluar su nivel actual. Basándose en la brecha de conocimiento, un motor de IA genera un roadmap personalizado, curando los mejores recursos de toda la web para cada paso del camino y creando un plan de estudio semanal.',
    businessModel: 'Suscripción mensual para estudiantes. Un modelo B2B para empresas que quieran crear planes de formación personalizados para sus empleados.',
    techChallenges: 'Crear un grafo de conocimiento masivo que relacione millones de conceptos de aprendizaje. El motor de IA debe ser capaz de evaluar la calidad de los recursos externos de forma automática.',
    techStack: [
      { name: 'Python', icon: techIcons.python },
      { name: 'Next.js', icon: techIcons.nextjs },
      { name: 'Docker', icon: techIcons.docker },
    ],
    results: {
      summary: 'El concepto propone una solución al problema de la "infoxicación" en la educación online, actuando como un mentor personal de IA para guiar el aprendizaje.',
      metrics: [
        { value: '-75%', label: 'Tiempo Planif.' },
        { value: 'Óptima', label: 'Ruta Estudio' },
        { value: '+50%', label: 'Target Finalización' },
      ],
    },
  },
  {
    id: 'real-time-translation-video',
    imageUrl: 'https://images.unsplash.com/photo-1543269664-7eef42226a21?q=80&w=2070&auto=format&fit=crop',
    title: 'Idea: Traducción de Voz en Tiempo Real para Videollamadas',
    category: 'Idea en Desarrollo',
    tags: ['IA', 'Comunicación', 'Global', 'SaaS'],
    description: 'Una idea para un software que se integre con Zoom, Meet, etc., y proporcione traducción de voz en tiempo real, manteniendo el tono y el timbre de la voz del hablante original.',
    problem: 'Las barreras del idioma son un gran obstáculo en los negocios y la colaboración global. Los traductores actuales son robóticos y pierden el matiz emocional de la conversación.',
    solution: 'Un plugin que utiliza tres modelos de IA en cascada: 1) Speech-to-Text para transcribir el audio original, 2) un LLM para traducirlo al idioma de destino, y 3) un modelo de clonación de voz (Voice Cloning) para sintetizar el audio traducido usando el timbre de voz del hablante.',
    businessModel: 'Suscripción mensual por usuario (modelo SaaS). Podría venderse a individuos o a empresas para todos sus empleados.',
    techChallenges: 'Lograr una latencia extremadamente baja para que la traducción se sienta "en tiempo real". La calidad y naturalidad de la voz clonada es el mayor reto técnico y ético.',
    techStack: [
      { name: 'Python', icon: techIcons.python },
      { name: 'AWS', icon: techIcons.aws },
    ],
    results: {
      summary: 'Actualmente investigando la viabilidad de los modelos de clonación de voz de baja latencia. El objetivo es crear un prototipo que funcione entre dos idiomas (ej. español-inglés).',
      metrics: [
        { value: '<300ms', label: 'Target Latencia' },
        { value: '95%', label: 'Naturalidad Voz' },
        { value: 'Universal', label: 'Integración' },
      ],
    },
  },
    {
    id: 'nft-ticketing-system',
    imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop',
    title: 'Sistema de Ticketing con NFTs "TicketSafe"',
    category: 'Proyecto Realizado',
    tags: ['Web3', 'NFTs', 'Eventos', 'Antifraude'],
    description: 'Desarrollé una plataforma de venta de entradas para eventos donde cada entrada es un NFT, eliminando la falsificación y dando a los artistas control sobre la reventa.',
    problem: 'El mercado de entradas está plagado de falsificaciones y revendedores (scalpers) que inflan los precios. Los artistas y organizadores no ven ningún beneficio de este mercado secundario.',
    solution: '"TicketSafe" emite cada entrada como un NFT único en la blockchain. Esto hace imposible su falsificación. El smart contract del NFT puede programarse con reglas de reventa: un precio máximo y un porcentaje de la reventa que vuelve automáticamente al artista.',
    businessModel: 'Comisión sobre la venta primaria de entradas (similar a las plataformas tradicionales) y una comisión sobre los royalties de la reventa que se cobran en el mercado secundario.',
    techChallenges: 'La experiencia de usuario tenía que ser transparente. Los compradores no necesitan saber que están usando NFTs. Se implementó un sistema de "wallet social" que se crea con un email.',
    techStack: [
      { name: 'Solana', icon: techIcons.solana },
      { name: 'React', icon: techIcons.react },
      { name: 'Next.js', icon: techIcons.nextjs },
    ],
    results: {
      summary: 'Utilizado en un festival de música independiente, eliminó por completo las falsificaciones y generó un 15% de ingresos adicionales para los artistas a través de la reventa controlada.',
      metrics: [
        { value: '0', label: 'Falsificaciones' },
        { value: '+15%', label: 'Ingresos Artista' },
        { value: '100%', label: 'Control Reventa' },
      ],
    },
  },
  {
    id: 'employee-wellness-platform',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop',
    title: 'Concepto: Plataforma de Bienestar para Empleados "WellForce"',
    category: 'Concepto Estratégico',
    tags: ['SaaS', 'Recursos Humanos', 'Salud Mental', 'IA'],
    description: 'Diseño de una plataforma B2B para que las empresas promuevan el bienestar físico y mental de sus empleados a través de contenido personalizado y gamificación.',
    problem: 'El burnout y el estrés laboral son problemas crecientes. Las empresas luchan por ofrecer beneficios de bienestar que sean atractivos y utilizados por sus empleados.',
    solution: 'WellForce" ofrece un catálogo de actividades (meditación, fitness, nutrición) y contenido curado por expertos. Una IA sugiere actividades personalizadas basadas en el perfil y los objetivos del empleado. Se incluyen retos por equipos y un sistema de recompensas para fomentar la participación.',
    businessModel: 'Suscripción por empleado al mes (PEPM) para las empresas. El precio varía según el tamaño de la empresa y el nivel de personalización requerido.',
    techChallenges: 'Proteger la privacidad de los datos de salud de los empleados es fundamental. La IA de recomendación debe ser sutil y respetuosa, evitando ser intrusiva.',
    techStack: [
      { name: 'React', icon: techIcons.react },
      { name: 'Python', icon: techIcons.python },
      { name: 'Docker', icon: techIcons.docker },
    ],
    results: {
      summary: 'El concepto fue validado con varios departamentos de RRHH, que mostraron un fuerte interés en una solución que unifique y fomente el uso de sus programas de bienestar.',
      metrics: [
        { value: '+40%', label: 'Target Adopción' },
        { value: '-15%', label: 'Target Absentismo' },
        { value: 'Personalizado', label: 'Contenido IA' },
      ],
    },
  },
  {
    id: 'ar-indoor-navigation',
    imageUrl: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=1964&auto=format&fit=crop',
    title: 'Idea: Navegación Indoor con Realidad Aumentada',
    category: 'Idea en Desarrollo',
    tags: ['AR', 'Móvil', 'Retail', 'IoT'],
    description: 'Idea para una app que guíe a los usuarios por grandes espacios interiores (aeropuertos, centros comerciales, museos) usando la cámara del móvil y Realidad Aumentada.',
    problem: 'Orientarse en grandes edificios es a menudo confuso y estresante. Los mapas 2D tradicionales no siempre son efectivos.',
    solution: 'La app utiliza la cámara para reconocer el entorno y superpone flechas y indicaciones virtuales directamente sobre la imagen del mundo real, guiando al usuario paso a paso hasta su destino (ej. "Puerta de embarque B54" o "la tienda Zara").',
    businessModel: 'Licenciar la tecnología a los operadores de los edificios (aeropuertos, centros comerciales). Podría ofrecerse una API para que otras apps integren la funcionalidad.',
    techChallenges: 'Requiere un mapeo 3D preciso del interior del edificio y un sistema de posicionamiento que funcione sin GPS (usando balizas Bluetooth o Wi-Fi RTT). El reconocimiento visual del entorno debe ser muy rápido y robusto.',
    techStack: [
      { name: 'React', icon: techIcons.react }, // Representa a ARKit/ARCore
      { name: 'Python', icon: techIcons.python },
    ],
    results: {
      summary: 'Actualmente desarrollando la tecnología de posicionamiento visual (Visual Positioning System - VPS) para un entorno de prueba. El objetivo es lograr una precisión de menos de 1 metro.',
      metrics: [
        { value: '<1m', label: 'Target Precisión' },
        { value: 'Intuitiva', label: 'Guía Visual' },
        { value: 'Indoor', label: 'GPS-Free' },
      ],
    },
  },
  {
    id: 'generative-art-platform',
    imageUrl: 'https://images.unsplash.com/photo-1638234801198-75d1c28445a4?q=80&w=1925&auto=format&fit=crop',
    title: 'Plataforma de Arte Generativo "Artifex"',
    category: 'Proyecto Realizado',
    tags: ['IA', 'Arte', 'Web3', 'NFTs'],
    description: 'Una plataforma web donde los usuarios pueden crear obras de arte únicas utilizando modelos de IA generativa y acuñarlas como NFTs directamente.',
    problem: 'El arte generativo por IA es una nueva forma de creatividad fascinante, pero las herramientas son a menudo complejas y requieren conocimientos de programación (ej. Stable Diffusion, Midjourney).',
    solution: 'Desarrollé "Artifex", una interfaz web muy intuitiva que permite a cualquier persona generar imágenes a partir de texto (text-to-image). Los usuarios pueden ajustar estilos, parámetros y luego "acuñar" (mint) su creación como un NFT en la blockchain con un solo clic.',
    businessModel: 'La generación de imágenes es gratuita. La plataforma cobra una pequeña tarifa por cada NFT acuñado para cubrir los costes de la blockchain y el uso de la GPU para la generación de la imagen.',
    techChallenges: 'Gestionar la alta carga de computación (GPU) requerida por los modelos de IA de forma escalable y rentable. La integración con las wallets de criptomonedas se hizo de la forma más sencilla posible.',
    techStack: [
      { name: 'Python', icon: techIcons.python },
      { name: 'Next.js', icon: techIcons.nextjs },
      { name: 'Docker', icon: techIcons.docker },
      { name: 'Solana', icon: techIcons.solana },
    ],
    results: {
      summary: 'Más de 10,000 obras de arte generadas y 1,500 NFTs acuñados en los primeros 3 meses. La plataforma democratizó el acceso a la creación de arte con IA.',
      metrics: [
        { value: '10k+', label: 'Obras Creadas' },
        { value: '1500', label: 'NFTs Acuñados' },
        { value: '1-Click', label: 'Minting' },
      ],
    },
  },
    {
    id: 'crm-for-freelancers',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04421cd6e2?q=80&w=2072&auto=format&fit=crop',
    title: 'Concepto: CRM Simplificado para Creativos Freelance',
    category: 'Concepto Estratégico',
    tags: ['SaaS', 'CRM', 'Freelance', 'Productividad'],
    description: 'Diseño de un CRM (Customer Relationship Management) ultra-simplificado y visual, pensado específicamente para las necesidades de diseñadores, escritores y otros creativos freelance.',
    problem: 'Los CRMs tradicionales (como Salesforce) son demasiado complejos y caros para un freelance. Las hojas de cálculo y las notas no son eficientes para gestionar clientes, proyectos y facturas.',
    solution: 'Una plataforma web con un pipeline visual de proyectos (estilo kanban). Cada tarjeta de cliente muestra el estado del proyecto, las tareas pendientes, las conversaciones y las facturas asociadas. Integración con herramientas de facturación y seguimiento del tiempo.',
    businessModel: 'Suscripción mensual simple y asequible (ej. 19€/mes). Sin complejos planes por niveles, solo una solución que funciona.',
    techChallenges: 'El principal reto es la disciplina de mantener la simplicidad, resistiendo la tentación de añadir funcionalidades que la harían más compleja ("feature creep"). La UX debe ser impecable y agradable.',
    techStack: [
      { name: 'React', icon: techIcons.react },
      { name: 'Python', icon: techIcons.python },
      { name: 'Vercel', icon: techIcons.vercel },
    ],
    results: {
      summary: 'El concepto se centra en un nicho desatendido pero en rápido crecimiento. El objetivo es ser la herramienta "todo en uno" que reemplace a 3-4 apps diferentes que usan los freelancers.',
      metrics: [
        { value: '-5h/sem', label: 'Target Admin' },
        { value: 'Visual', label: 'Pipeline' },
        { value: 'Todo-en-uno', label: 'Enfoque' },
      ],
    },
  },
  {
    id: 'mental-health-chatbot',
    imageUrl: 'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?q=80&w=2070&auto=format&fit=crop',
    title: 'Idea: Chatbot de Apoyo para la Salud Mental "MindMate"',
    category: 'Idea en Desarrollo',
    tags: ['HealthTech', 'IA', 'Chatbot', 'Salud Mental'],
    description: 'Idea para un chatbot empático y anónimo que ofrezca apoyo emocional 24/7 y técnicas de terapia cognitivo-conductual (TCC) a través de conversaciones guiadas.',
    problem: 'Muchas personas no buscan ayuda para su salud mental por el estigma, el coste o la falta de acceso. A veces, solo necesitan un espacio seguro para desahogarse o recibir guía inmediata.',
    solution: '"MindMate" no pretende reemplazar a un terapeuta, sino ser un primer paso de apoyo. El chatbot de IA está entrenado para escuchar, mostrar empatía y guiar al usuario a través de ejercicios de TCC para gestionar la ansiedad o el estrés. En caso de detectar una crisis, dirigiría al usuario a líneas de ayuda profesionales.',
    businessModel: 'Freemium. Las conversaciones básicas serían gratuitas. Una suscripción podría desbloquear ejercicios más avanzados, un diario de estado de ánimo y reportes de progreso.',
    techChallenges: 'La responsabilidad ética es inmensa. El modelo de IA debe ser extremadamente seguro y robusto para nunca dar un consejo perjudicial. La detección de crisis y la derivación a profesionales debe ser infalible.',
    techStack: [
      { name: 'Python', icon: techIcons.python },
      { name: 'React', icon: techIcons.react },
    ],
    results: {
      summary: 'En fase de investigación y desarrollo del modelo de lenguaje empático. Se está colaborando con psicólogos para diseñar los flujos de conversación y los protocolos de seguridad.',
      metrics: [
        { value: '24/7', label: 'Disponibilidad' },
        { value: 'Anónimo', label: 'Acceso' },
        { value: 'Seguro', label: 'Protocolo Crisis' },
      ],
    },
  },
    {
    id: 'hyper-personalized-recommendations',
    imageUrl: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?q=80&w=2072&auto=format&fit=crop',
    title: 'Motor de Recomendación Hiper-Personalizado para E-commerce',
    category: 'Proyecto Realizado',
    tags: ['IA', 'E-commerce', 'Big Data', 'SaaS'],
    description: 'Desarrollé un motor de recomendación como servicio (SaaS) que analiza el comportamiento del usuario en tiempo real para ofrecer sugerencias de productos hiper-personalizadas.',
    problem: 'Los motores de recomendación genéricos ("los clientes que compraron esto también compraron...") son poco efectivos y no se adaptan al contexto inmediato del comprador.',
    solution: 'Mi solución rastrea la navegación del usuario en tiempo real (clics, tiempo en página, búsquedas) y combina esa información con su historial de compras y el comportamiento de usuarios similares. El modelo de IA recalcula las recomendaciones en milisegundos, adaptándose a la "intención" del comprador en ese preciso momento.',
    businessModel: 'API de suscripción mensual. El precio se basa en el número de llamadas a la API y el volumen de productos en el catálogo del cliente.',
    techChallenges: 'Procesar un flujo masivo de eventos en tiempo real y servir recomendaciones con una latencia inferior a 100ms. Evitar el problema del "arranque en frío" (cold start) para nuevos usuarios fue clave.',
    techStack: [
      { name: 'Python', icon: techIcons.python },
      { name: 'AWS', icon: techIcons.aws },
      { name: 'Docker', icon: techIcons.docker },
    ],
    results: {
      summary: 'Integrado en un e-commerce de moda, el motor aumentó el valor medio del pedido (AOV) en un 18% y la tasa de conversión en un 7%.',
      metrics: [
        { value: '+18%', label: 'AOV' },
        { value: '+7%', label: 'Conversión' },
        { value: '<100ms', label: 'Latencia' },
      ],
      chartData: [
        { name: 'Sin IA', value: 50 },
        { name: 'Con IA', value: 59 },
      ],
    },
  },
  {
    id: 'community-urban-gardeners',
    imageUrl: 'https://images.unsplash.com/photo-1587329264498-2a0d27689e8e?q=80&w=2070&auto=format&fit=crop',
    title: 'Concepto: Plataforma Comunitaria para Jardineros Urbanos',
    category: 'Concepto Estratégico',
    tags: ['Comunidad', 'Sostenibilidad', 'Móvil', 'Social'],
    description: 'Diseño de una red social para aficionados a la jardinería en balcones y terrazas. Un lugar para compartir consejos, intercambiar semillas y mostrar sus "cosechas".',
    problem: 'La jardinería urbana es un hobby solitario. Los principiantes cometen errores comunes y los expertos no tienen un canal para compartir su conocimiento con una comunidad local afín.',
    solution: 'Una app móvil que permite a los usuarios crear un perfil de su jardín, subir fotos de sus plantas y hacer preguntas. Un mapa interactivo mostraría a otros jardineros en su zona para facilitar el intercambio de semillas o esquejes. Un sistema de IA podría identificar plagas o enfermedades a partir de una foto.',
    businessModel: 'Gratuito para los usuarios. La monetización vendría de un marketplace integrado donde viveros locales y tiendas de jardinería pueden vender sus productos a una audiencia hiper-segmentada.',
    techChallenges: 'Fomentar la participación inicial para crear una masa crítica de usuarios. El modelo de IA para la identificación de enfermedades de plantas requeriría un gran dataset de entrenamiento.',
    techStack: [
      { name: 'React', icon: techIcons.react },
      { name: 'Python', icon: techIcons.python },
      { name: 'Vercel', icon: techIcons.vercel },
    ],
    results: {
      summary: 'El concepto une las tendencias de sostenibilidad, comunidad local y tecnología móvil. Podría convertirse en la plataforma de referencia para una afición en pleno crecimiento.',
      metrics: [
        { value: 'Local', label: 'Enfoque' },
        { value: 'Compartir', label: 'Core' },
        { value: 'IA', label: 'Diagnóstico' },
      ],
    },
  },
  {
    id: 'automated-expense-tracking',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2072&auto=format&fit=crop',
    title: 'Idea: Seguimiento Automatizado de Gastos para Pymes',
    category: 'Idea en Desarrollo',
    tags: ['FinTech', 'IA', 'SaaS', 'B2B'],
    description: 'Una idea para una herramienta que automatiza por completo la contabilidad de gastos para pequeñas empresas, usando IA para leer facturas y categorizar gastos.',
    problem: 'La gestión de facturas y tickets de gastos es una tarea manual, tediosa y propensa a errores para los dueños de pymes y autónomos, robándoles tiempo que podrían dedicar a su negocio.',
    solution: 'El usuario simplemente reenvía sus facturas por email o les hace una foto con la app. Un modelo de OCR (Reconocimiento Óptico de Caracteres) e IA extrae los datos clave (proveedor, fecha, importe, IVA) y categoriza el gasto automáticamente. Se integra con programas de contabilidad como Holded o Quipu.',
    businessModel: 'Suscripción mensual basada en el número de documentos procesados. Un plan gratuito limitado para atraer a nuevos autónomos.',
    techChallenges: 'Lograr una alta precisión en la extracción de datos de facturas con formatos muy diferentes. La integración con las APIs de los diferentes programas de contabilidad.',
    techStack: [
      { name: 'Python', icon: techIcons.python },
      { name: 'React', icon: techIcons.react },
      { name: 'AWS', icon: techIcons.aws },
    ],
    results: {
      summary: 'El objetivo es eliminar el 90% del trabajo manual de contabilidad de gastos. Actualmente desarrollando el motor de extracción de datos con IA.',
      metrics: [
        { value: '99%', label: 'Target Precisión' },
        { value: '-90%', label: 'Trabajo Manual' },
        { value: 'Auto', label: 'Categorización' },
      ],
    },
  }
];

// Testimonials
export const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Diego es altamente preparado en marketing online y desarrollo de empresas. Muy implicado en los proyectos, participativo y capacitado para dar máxima visibilidad. Lo recomiendo siempre.",
    author: "Lucas Minig MD, PhD, MBA",
    title: "Unidad de Cáncer Ginecológico y cirugía de alta complejidad",
    image: "/testimonials/lucas-minig.jpg"
  },
  {
    id: 2,
    quote: "Estamos ante un profesional sobresaliente. Diego ha sido muy participativo en los foros del campus, en la comunidad alumni de Google+, tanto para resolver sus dudas como para ayudar a sus compañeros.",
    author: "María Alfaro",
    title: "Co-fundadora",
    image: "/testimonials/maria-alfaro.jpg"
  },
  {
    id: 3,
    quote: "Diego es experto en diseño y ejecución de proyectos online de ecommerce. Análisis de competencia, plan de empresa, marketing online, SEO, CMS y pasarelas de pago.",
    author: "Lucía Ricaldoni",
    title: "Directora ejecutiva en CAAM Cámara Argentina de Agencias de Medios",
    image: "/testimonials/lucia-ricaldoni.jpg"
  },
  {
    id: 4,
    quote: "Diego is very creative and responsible. He can help get your business noticed through out-of-the-box marketing campaigns and incredible web designs. Highly recommend him!",
    author: "Clara McLear",
    title: "Co-Owner of NY Coed Soccer",
    image: "/testimonials/clara-mclear.jpg"
  },
  {
    id: 5,
    quote: "He coincidido con Diego en un proyecto innovador en Valencia. Es un gran profesional que mantiene la motivación de sus equipos y crea excelente ambiente laboral.",
    author: "Pedro de Pedro Tabernero",
    title: "Front Office Manager Only YOU Valencia",
    image: "/testimonials/pedro-tabernero.jpg"
  },
  {
    id: 6,
    quote: "Trabajé con Diego casi un año. Siempre creativo y entusiasta, con ideas novedosas enfocadas a las necesidades de la empresa. Excelente gusto en diseño web con enfoque comercial.",
    author: "Irene Wilkinson Álvarez",
    title: "Product Manager",
    image: "/testimonials/irene-wilkinson.jpg"
  },
  {
    id: 7,
    quote: "Su trabajo era increíble!!! Diego transformó completamente nuestra presencia online y mejoró significativamente la experiencia de nuestros huéspedes. Su creatividad y profesionalismo hicieron una gran diferencia en nuestro negocio.",
    author: "Lizze Nava",
    title: "Jefa de Recepción Apartamentos Plaza Picasso",
    image: "/testimonials/lizze-nava.jpg"
  },
  {
    id: 8,
    quote: "Diego has an unbelievable thirst for technical knowledge. He's great to work with and incredibly talented. He understands the important role web design plays in achieving business objectives.",
    author: "Margaret Lynch",
    title: "Senior Manager: Product Development - FX & Global Payments",
    image: "/testimonials/margaret-lynch.jpg"
  },
  {
    id: 9,
    quote: "La migración que Diego lideró no solo mejoró nuestro rendimiento, sino que redujo nuestros costos operativos en un 45%. Su ROI se pagó solo en los primeros tres meses.",
    author: "Patricia Ruiz",
    title: "CFO, RetailMax",
    image: "https://xsgames.co/randomusers/assets/avatars/female/19.jpg"
  },
  {
    id: 10,
    quote: "Diego tiene esa rara combinación de profundidad técnica y visión de negocio. Nos ayudó a escalar de 1,000 a 100,000 usuarios sin un solo problema de rendimiento.",
    author: "Alejandro Vega",
    title: "CTO, SocialConnect",
    image: "/testimonials/alejandro-vega.jpg"
  },
  {
    id: 11,
    quote: "La implementación de IA que Diego desarrolló para nuestro sistema de recomendaciones aumentó nuestras ventas en un 280%. Su enfoque va más allá de la tecnología, entiende el negocio.",
    author: "Sofía Herrera",
    title: "CEO, ShopSmart AI",
    image: "/testimonials/sofia-herrera.jpg"
  },
  {
    id: 12,
    quote: "Necesitábamos un sistema de pagos robusto para nuestro marketplace. Diego no solo lo construyó, sino que diseñó una arquitectura que maneja millones de transacciones sin problemas.",
    author: "Fernando Castro",
    title: "Fundador, PayFlow Solutions",
    image: "/testimonials/fernando-castro.jpg"
  },
  {
    id: 13,
    quote: "La migración de nuestros sistemas legacy a la nube que lideró Diego nos ahorró 60% en costos operativos y mejoró nuestra velocidad de desarrollo exponencialmente.",
    author: "Valentina Morales",
    title: "CTO, HealthTech Innovations",
    image: "/testimonials/valentina-morales.jpg"
  },
  {
    id: 14,
    quote: "Diego transformó nuestra startup de EdTech de una idea en papel a una plataforma que hoy usan más de 50,000 estudiantes. Su visión estratégica fue clave para nuestro éxito.",
    author: "Ricardo Mendoza",
    title: "CEO, EduFuture",
    image: "/testimonials/ricardo-mendoza.jpg"
  },
  {
    id: 15,
    quote: "La plataforma de análisis de datos que desarrolló Diego nos permite tomar decisiones basadas en información real. Nuestro ROI en marketing mejoró un 400%.",
    author: "Lucía Fernández",
    title: "CMO, DataDriven Corp",
    image: "/testimonials/lucia-fernandez.jpg"
  },
  {
    id: 16,
    quote: "Como startup de blockchain, necesitábamos alguien que entendiera tanto Web3 como el negocio tradicional. Diego fue esa persona que conectó ambos mundos perfectamente.",
    author: "Andrés Villalobos",
    title: "Fundador, CryptoVentures",
    image: "/testimonials/andres-villalobos.jpg"
  },
  {
    id: 17,
    quote: "El sistema de automatización que Diego implementó en nuestros procesos de manufactura redujo errores en un 95% y aumentó nuestra productividad significativamente.",
    author: "Elena Rodríguez",
    title: "COO, ManufacTech Solutions",
    image: "/testimonials/elena-rodriguez.jpg"
  },
  {
    id: 18,
    quote: "Diego no solo desarrolló nuestra app móvil, sino que diseñó toda la estrategia de lanzamiento. Alcanzamos 100K descargas en el primer mes.",
    author: "Gabriel Santos",
    title: "CEO, MobileFirst",
    image: "/testimonials/gabriel-santos.jpg"
  },
  {
    id: 19,
    quote: "La arquitectura serverless que Diego diseñó para nuestro SaaS nos permite escalar automáticamente y solo pagar por lo que usamos. Genial para una startup.",
    author: "Natalia Jiménez",
    title: "CTO, CloudNative Startup",
    image: "/testimonials/natalia-jimenez.jpg"
  },
  {
    id: 20,
    quote: "Trabajar con Diego fue como tener un mentor y un desarrollador senior al mismo tiempo. Su experiencia nos evitó cometer errores costosos en nuestra arquitectura.",
    author: "Sebastián Vargas",
    title: "Fundador, TechStartup Labs",
    image: "/testimonials/sebastian-vargas.jpg"
  },
  {
    id: 21,
    quote: "La integración de APIs que Diego desarrolló conectó todos nuestros sistemas dispersos en una sola plataforma cohesiva. Ahora tenemos visibilidad total del negocio.",
    author: "Camila Restrepo",
    title: "CEO, IntegraTech",
    image: "/testimonials/camila-restrepo.jpg"
  },
  {
    id: 22,
    quote: "Diego convirtió nuestro proceso manual de inventario en un sistema automatizado con IA. Reducimos costos operativos en un 70% y eliminamos errores humanos.",
    author: "Mateo Guerrero",
    title: "COO, LogiSmart",
    image: "/testimonials/mateo-guerrero.jpg"
  },
  {
    id: 23,
    quote: "La plataforma de e-learning que Diego desarrolló para nosotros maneja más de 200,000 usuarios concurrentes sin problemas. Su arquitectura es impresionante.",
    author: "Isabella Torres",
    title: "CTO, EduPlatform Global",
    image: "/testimonials/isabella-torres.jpg"
  },
  {
    id: 24,
    quote: "Diego implementó un sistema de monitoreo en tiempo real que nos alerta de problemas antes de que afecten a nuestros clientes. Nuestra disponibilidad es del 99.99%.",
    author: "Joaquín Ramírez",
    title: "DevOps Lead, CloudWatch Pro",
    image: "/testimonials/joaquin-ramirez.jpg"
  },
  {
    id: 25,
    quote: "La estrategia de marketing digital que Diego diseñó para nuestro lanzamiento generó 500% más leads de los proyectados. Su experiencia como Google Partner se nota.",
    author: "Valeria Sánchez",
    title: "CMO, GrowthHackers Inc",
    image: "/testimonials/valeria-sanchez.jpg"
  },
  {
    id: 26,
    quote: "Diego rescató nuestro proyecto que estaba completamente estancado. En 6 semanas lo convirtió en un producto funcional que hoy genera ingresos recurrentes.",
    author: "Emilio Delgado",
    title: "Fundador, RescueApp",
    image: "/testimonials/emilio-delgado.jpg"
  },
  {
    id: 27,
    quote: "La implementación de microservicios que Diego lideró nos permitió desarrollar features independientemente. Nuestro time-to-market se redujo a la mitad.",
    author: "Daniela Moreno",
    title: "Engineering Manager, MicroTech",
    image: "/testimonials/daniela-moreno.jpg"
  },
  {
    id: 28,
    quote: "Diego no solo construyó nuestra plataforma de IoT, sino que diseñó toda la infraestructura para manejar millones de dispositivos conectados simultáneamente.",
    author: "Nicolás Peña",
    title: "CTO, IoT Solutions Corp",
    image: "/testimonials/nicolas-pena.jpg"
  },
  {
    id: 29,
    quote: "La auditoría de seguridad que Diego realizó en nuestros sistemas identificó vulnerabilidades críticas que ni sabíamos que existían. Ahora dormimos tranquilos.",
    author: "Alejandra Ruiz",
    title: "CISO, SecureTech",
    image: "/testimonials/alejandra-ruiz.jpg"
  },
  {
    id: 30,
    quote: "Diego transformó nuestra idea de fintech en una realidad. Su conocimiento en regulaciones financieras y tecnología blockchain fue fundamental para nuestro éxito.",
    author: "Rodrigo Espinoza",
    title: "CEO, FinTech Revolution",
    image: "/testimonials/rodrigo-espinoza.jpg"
  },
  {
    id: 31,
    quote: "Tengo el agrado de trabajar con Diego en forma permanente, destaco su creatividad, compromiso y Know how para llevar a cabo los desafíos y objetivos del equipo de Agencia 365.",
    author: "Maria Genovese",
    title: "Marketing",
    image: "/testimonials/maria-genovese.jpg"
  }
];


// FAQs
export const faqs: FaqItem[] = [
  {
    question: "¿Qué tecnologías sueles utilizar?",
    answer: "Soy agnóstico a la tecnología y elijo siempre las herramientas adecuadas para el problema. Sin embargo, tengo profunda experiencia en Python (FastAPI, Django), JavaScript/TypeScript (React, Next.js, Node.js), arquitecturas cloud (AWS, Google Cloud) y tecnologías Web3 (Solana/Rust, Ethereum/Solidity)."
  },
  {
    question: "¿En qué se diferencia tu servicio de una agencia de desarrollo?",
    answer: "Una agencia ejecuta un pedido. Yo me convierto en tu socio estratégico. Mi rol empieza mucho antes de escribir la primera línea de código: en la definición de la estrategia, la validación del modelo de negocio y el diseño de una arquitectura que asegure el éxito a largo plazo. La certificación de Google Partner añade una capa de crecimiento que las agencias puramente técnicas no poseen."
  },
  {
    question: "¿Cómo es el proceso para empezar a trabajar juntos?",
    answer: "Todo comienza con el formulario de contacto. Describe tu proyecto o problema. Si encaja con mi perfil, agendamos una sesión estratégica (o te respondo por email si eliges esa opción) para profundizar. Si ambos decidimos avanzar, te presento una propuesta detallada con el alcance, plazos y costes."
  },
  {
    question: "¿Trabajas con un presupuesto fijo o por horas?",
    answer: "Prefiero trabajar con un precio cerrado por proyecto o por fases (sprints). Esto te da total previsibilidad de costes y me incentiva a ser lo más eficiente posible. El modelo por horas solo lo utilizo para consultorías puntuales o soporte continuo."
  },
  {
    question: "¿Ofreces soporte después del lanzamiento del producto?",
    answer: "Sí, ofrezco planes de soporte y mantenimiento post-lanzamiento, así como consultoría de crecimiento continuo. El objetivo es asegurar que tu producto no solo funcione perfectamente, sino que evolucione y se adapte al mercado para un éxito sostenible."
  },
  {
    question: "Mi idea es muy incipiente. ¿Es demasiado pronto para contactarte?",
    answer: "Al contrario, es el momento ideal. Involucrarme en la fase de ideación puede ahorrarte meses de trabajo y una inversión considerable, ayudándote a validar tu concepto, definir la estrategia tecnológica correcta y planificar un MVP que realmente resuelva un problema de mercado."
  },
  {
    question: "¿Cuánto tiempo se tarda en desarrollar un Producto Mínimo Viable (MVP)?",
    answer: "Depende de la complejidad, pero mi objetivo es siempre entregar un MVP funcional y de alta calidad en un plazo de 8 a 16 semanas. La clave es enfocarse en las funcionalidades 'core' que resuelven el problema principal y permiten una validación rápida en el mercado."
  },
  {
    question: "¿Inviertes en los proyectos de tus clientes?",
    answer: "Mi principal inversión es mi tiempo, experiencia y dedicación. Aunque no invierto capital directamente como un inversor de riesgo tradicional, en casos excepcionales y con startups con un potencial de disrupción muy alto, estoy abierto a discutir acuerdos de 'equity' (participación en el capital) como parte de mi compensación. "
  },
  {
    question: "No entiendo de tecnología. ¿Podremos comunicarnos bien?",
    answer: "Esa es una de mis principales habilidades. Actúo como el traductor entre el mundo técnico y el de negocio. Mi objetivo es desmitificar la tecnología para que puedas tomar decisiones informadas con total confianza, sin necesidad de ser un experto."
  },
  {
    question: "¿Tienes experiencia en la migración de sistemas legacy a arquitecturas modernas en la nube?",
    answer: "Sí. He liderado múltiples proyectos de modernización, migrando aplicaciones obsoletas a infraestructuras cloud eficientes y escalables (AWS, Google Cloud), minimizando el tiempo de inactividad y optimizando los costes operativos."
  },
  {
    question: "¿Qué pasa en la consulta gratuita por email?",
    answer: "Me envías tu problema o idea a través del formulario. Yo lo analizo y te respondo por email con una evaluación inicial, posibles enfoques de solución y mis recomendaciones sobre los siguientes pasos. Es una forma sin compromiso de obtener una primera opinión experta."
  },
  {
    question: "¿Cómo garantizas la calidad y la seguridad del código que escribes?",
    answer: "Sigo las mejores prácticas de la industria: tests unitarios y de integración, revisiones de código (code reviews), integración continua (CI/CD) y análisis de seguridad estático (SAST). Además, realizo auditorías de seguridad periódicas para identificar y mitigar vulnerabilidades."
  }
];

// Typing examples for booking form
export const bookingPlaceholders = [
    "Ej: Quiero que me ayudes en un proyecto de Web3...",
    "Ej: Necesito conectar GA4, Google Ads y Search Console a mi proyecto...",
    "Ej: Busco un CTIO fraccional para mi startup...",
    "Ej: Quiero desarrollar un MVP para una idea de SaaS...",
    "Ej: Necesito una auditoría de mi arquitectura cloud actual...",
    "Ej: Quiero optimizar mis campañas de marketing digital...",
    "Ej: Necesito asesoramiento para una estrategia de IA..."
];

// Final CTA Headlines for Home Page
export const finalCtaHeadlines: string[] = [
  "¿Listo para transformar tu visión en una ventaja competitiva real?",
  "¿Hablamos de cómo llevar tu proyecto al siguiente nivel?",
  "¿Tienes una idea? Convirtámosla en tu próximo gran éxito.",
];

// Client Logos
export const clientLogos: { name: string, icon: FC }[] = [
  { name: 'Nike', icon: SiNike },
  { name: 'Coca-Cola', icon: SiCocacola },
  { name: 'Google', icon: SiGoogle },
  { name: 'Amazon', icon: SiAmazon },
  { name: 'Apple', icon: SiApple },
  { name: 'Meta', icon: SiMeta },
  { name: 'Tesla', icon: SiTesla },
  { name: 'Spotify', icon: SiSpotify },
  { name: 'Netflix', icon: SiNetflix },
  { name: 'Adobe', icon: SiAdobe },
  { name: 'Intel', icon: SiIntel },
  { name: 'Cisco', icon: SiCisco },
  { name: 'Oracle', icon: SiOracle },
  { name: 'SAP', icon: SiSap },
  { name: 'Siemens', icon: SiSiemens },
  { name: 'Toyota', icon: SiToyota },
  { name: 'Samsung', icon: SiSamsung },
  { name: 'Verizon', icon: SiVerizon },
  { name: 'Walmart', icon: SiWalmart },
  { name: 'Visa', icon: SiVisa },
  { name: 'Mastercard', icon: SiMastercard },
  { name: 'McDonald\'s', icon: SiMcdonalds },
  { name: 'Starbucks', icon: SiStarbucks },
  { name: 'General Motors', icon: SiGeneralmotors },
  { name: 'BMW', icon: SiBmw },
  { name: 'Audi', icon: SiAudi },
  { name: 'HP', icon: SiHp },
  { name: 'Dell', icon: SiDell },
  { name: 'PayPal', icon: SiPaypal },
  { name: 'Unilever', icon: SiUnilever }
];

// Simple Case Studies for HomePage
export const caseStudies: CaseStudy[] = [
  {
    id: 1,
    title: "De Startup a Unicornio: La Arquitectura que Escaló",
    description: "Diseñé la arquitectura técnica que permitió a una fintech pasar de 10K a 10M de usuarios sin reescribir una sola línea de código. El secreto: pensar en grande desde el día uno.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Arquitectura", "Escalabilidad", "FinTech"],
    metrics: {
      growth: "1000x",
      performance: "<100ms",
      uptime: "99.99%"
    }
  },
  {
    id: 2,
    title: "El Rescate: Cuando Todo Está Roto",
    description: "Un e-commerce con 15 años de deuda técnica, caídas diarias y clientes furiosos. En 90 días lo convertimos en una máquina de ventas estable y escalable. Algunas batallas se ganan con código, otras con estrategia.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Rescate Técnico", "E-commerce", "Optimización"],
    metrics: {
      downtime: "0%",
      performance: "400%",
      revenue: "180%"
    }
  },
  {
    id: 3,
    title: "IA que Vende: Más Allá del Hype",
    description: "Implementé un sistema de recomendaciones que no solo sugiere productos, sino que entiende el momento perfecto para vender. Resultado: 340% de aumento en conversiones y clientes que vuelven por más.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Inteligencia Artificial", "Personalización", "Conversiones"],
    metrics: {
      conversion: "340%",
      retention: "250%",
      satisfaction: "95%"
    }
  },
];
