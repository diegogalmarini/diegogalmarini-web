import { IoLogoReact, IoLogoNodejs, IoLogoPython, IoCodeSlash, IoRocketOutline, IoExtensionPuzzleOutline, IoAnalytics, IoGitBranchOutline, IoCloudOutline, IoShieldCheckmarkOutline, IoPeopleOutline, IoScaleOutline } from 'react-icons/io5';
import { FaAws, FaGoogle } from 'react-icons/fa';
import { SiFastapi, SiNextdotjs, SiSolidity, SiSolana } from 'react-icons/si';

import { CaseStudy, Pill, Differentiator, FaqItem, HomeService, DetailedService, Testimonial, ServicesHeadline } from './types';

export const bookingPlaceholders = [
    "Ej: Necesito conectar GA4, Google Ads y Search Console a mi pro...",
    "Ej: Quiero crear un MVP para una app de logística con IA, pero...",
    "Ej: Mi sistema legacy es lento, costoso y difícil de mantener....",
    "Ej: Tengo una idea para un proyecto Web3 y no sé por dónde em...",
    "Ej: Quiero optimizar mis costes en AWS y mejorar la seguridad...",
    "Ej: Busco un socio tecnológico para definir mi roadmap de pro..."
];

export const heroHeadlines = [
    "De la Idea al Mercado: Tu Socio en Desarrollo y Estrategia Digital.",
    "Soluciones Tecnológicas que Impulsan tu Crecimiento y Rentabilidad.",
    "Tu Aliado Tecnológico para Convertir Ideas en Productos de Impacto.",
    "Innovación, Estrategia y Código para Escalar tu Negocio.",
    "Tu Socio Estratégico para la Innovación y el Crecimiento Tecnológico."
];

export const heroPills: Pill[] = [
    { text: 'Estratega de Producto', icon: IoExtensionPuzzleOutline },
    { text: 'Arquitectura Cloud', icon: IoCloudOutline },
    { text: 'Google Partner', icon: FaGoogle },
    { text: 'CTIO Fraccional', icon: IoPeopleOutline },
    { text: 'Desarrollo Full-Stack', icon: IoCodeSlash },
    { text: 'Experto en IA', icon: IoAnalytics },
    { text: 'Arquitecto Web3', icon: SiSolana },
    { text: 'Growth Hacking', icon: IoRocketOutline },
    { text: 'Análisis de Datos', icon: IoAnalytics }
];

export const differentiators: Differentiator[] = [
    {
        title: "La Visión de un CTIO, la Agilidad de una Startup.",
        description: "Te ofrezco la dirección estratégica de un Director de Tecnología experimentado, pero con la flexibilidad y el enfoque práctico que tu negocio necesita para moverse rápido y adaptarse al mercado."
    },
    {
        title: "El Puente entre Estrategia y Ejecución.",
        description: "Convierto la visión estratégica en realidad técnica. Mi experiencia como CTIO Fraccional garantiza que tu producto no solo se construya bien, sino que esté diseñado para dominar su nicho de mercado desde el primer día."
    },
    {
        title: "Arquitectura para Escalar, Estrategia para Ganar.",
        description: "Diseño sistemas no solo para funcionar hoy, sino para crecer exponencialmente mañana. Mi doble rol como arquitecto y estratega asegura que la base técnica de tu producto sea una ventaja competitiva, no un cuello de botella."
    },
    {
        title: "El Atajo del Fundador Inteligente.",
        description: "Evita los errores costosos que frenan a la mayoría de las startups. Mi experiencia te permite tomar el camino más directo desde la idea hasta el 'product-market fit', ahorrando tiempo y dinero."
    }
];

export const homeServices: HomeService[] = [
    {
      id: 'strategy',
      title: 'Estrategia de Producto & IA',
      icon: IoExtensionPuzzleOutline,
    },
    {
      id: 'development',
      title: 'Arquitectura y Desarrollo',
      icon: IoCodeSlash,
    },
    {
      id: 'growth',
      title: 'Crecimiento y Optimización',
      icon: IoRocketOutline,
    },
];

export const detailedServices: Record<string, DetailedService> = {
    strategy: {
        title: 'Consultoría Estratégica y CTIO Fraccional',
        solution: 'Actúo como tu Director de Tecnología y socio estratégico a tiempo parcial. Te ofrezco liderazgo senior para guiar a tu equipo, diseñar tu arquitectura y alinear la tecnología con tus objetivos de negocio.',
        deliverables: [
            'Roadmaps técnicos y de producto',
            'Auditorías de arquitectura y seguridad',
            'Planificación de sprints y gestión de equipos',
            'Informes para inversores y stakeholders',
            'Implementación de estrategias de IA'
        ]
    },
    development: {
        title: 'Desarrollo de MVP y Productos Escalables',
        solution: 'Construyo la primera versión de tu producto (MVP) o evoluciono uno existente. Me especializo en arquitecturas robustas en la nube (AWS/Google Cloud) y tecnologías modernas como React, Python y Web3.',
        deliverables: [
            'Desarrollo de MVP funcional en semanas',
            'Migración y modernización de sistemas legacy',
            'Arquitecturas serverless y basadas en microservicios',
            'Integración de APIs y servicios de terceros',
            'Soluciones Web3 y contratos inteligentes'
        ]
    },
    growth: {
        title: 'Growth Hacking y Optimización de Funnels',
        solution: 'Como Google Partner, aplico estrategias de growth hacking basadas en datos para optimizar tu producto, mejorar la adquisición de usuarios y aumentar la retención, convirtiendo tu plataforma en un motor de crecimiento.',
        deliverables: [
            'Optimización de la tasa de conversión (CRO)',
            'Análisis de cohortes y funnels de usuario',
            'Implementación de A/B testing',
            'Estrategias de SEO técnico y marketing de contenidos',
            'Automatización de marketing y ventas'
        ]
    }
};

export const caseStudies: CaseStudy[] = [
    {
        id: 'caso-1',
        title: "MVP para Startup de Logística con IA: De 0 a 1 en 12 Semanas",
        description: "Diseñé y construí un MVP para una startup de logística, utilizando IA para optimizar rutas. El resultado fue una plataforma funcional que les permitió asegurar su primera ronda de financiación.",
        imageUrl: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        problem: "Una startup de logística tenía una idea innovadora para optimizar rutas de entrega con IA, pero carecía del equipo técnico para construir un Producto Mínimo Viable (MVP) y validar su hipótesis en el mercado. Necesitaban una plataforma funcional rápidamente para presentar a inversores y conseguir sus primeros clientes.",
        solution: "Actuando como CTIO fraccional y líder técnico, definí la arquitectura cloud en AWS, seleccioné el stack tecnológico (React, Python/FastAPI) y lideré el desarrollo del MVP. Implementé un algoritmo de IA para la optimización de rutas y diseñé una interfaz intuitiva para los usuarios finales. El desarrollo se gestionó con sprints ágiles de dos semanas.",
        results: [
            "MVP funcional entregado en 12 semanas, cumpliendo con el presupuesto.",
            "La plataforma fue clave para asegurar una ronda de financiación semilla de 500.000 €.",
            "Reducción del 25% en los tiempos de planificación de rutas para sus primeros clientes piloto.",
            "Arquitectura escalable que ha soportado un crecimiento de 10x en usuarios sin necesidad de rediseño."
        ],
        technologies: [
            { name: "React", icon: IoLogoReact },
            { name: "Python (FastAPI)", icon: IoLogoPython },
            { name: "AWS (Lambda, S3)", icon: FaAws },
            { name: "PostgreSQL", icon: IoGitBranchOutline },
        ]
    },
    {
        id: 'caso-2',
        title: "Modernización de E-commerce: Migración a Arquitectura Serverless",
        description: "Lideré la migración de un e-commerce con un sistema legacy a una arquitectura moderna y serverless, mejorando el rendimiento en un 300% y reduciendo los costes operativos en un 40%.",
        imageUrl: "https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        problem: "Un e-commerce establecido sufría de un rendimiento lento, altos costes de mantenimiento y dificultades para implementar nuevas funcionalidades debido a su anticuada arquitectura monolítica. Las caídas del sitio durante picos de tráfico (como Black Friday) eran frecuentes y costosas.",
        solution: "Propuse y ejecuté una estrategia de modernización completa. Migré la plataforma a una arquitectura de microservicios serverless en Google Cloud. Rediseñé el frontend con Next.js para mejorar la velocidad y el SEO (SSR), y construí los microservicios del backend con Node.js y Python, comunicados a través de APIs.",
        results: [
            "Aumento del 300% en la velocidad de carga de la página (medido con Google PageSpeed).",
            "Reducción del 40% en los costes de infraestructura y mantenimiento.",
            "Cero caídas durante la campaña de Black Friday, soportando un 500% más de tráfico que el año anterior.",
            "El tiempo para desarrollar e implementar nuevas funcionalidades se redujo de semanas a días."
        ],
        technologies: [
            { name: "Next.js", icon: SiNextdotjs },
            { name: "Node.js", icon: IoLogoNodejs },
            { name: "Google Cloud (Functions, Run)", icon: FaGoogle },
            { name: "TypeScript", icon: IoCodeSlash },
        ]
    }
];

export const testimonials: Testimonial[] = [
    // Originales
      {
        id: 1,
        quote: "Trabajar con Diego fue un punto de inflexión. No es solo un desarrollador, es un verdadero socio estratégico. Su visión para la arquitectura del producto nos ahorró meses de trabajo y nos posicionó para escalar desde el día uno.",
        author: "Carlos Méndez",
        title: "CEO, LogiTech Solutions",
        image: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      {
        id: 2,
        quote: "Veníamos de una mala experiencia con una agencia que no entendía nuestro negocio. Diego fue todo lo contrario. Se sumergió en nuestro problema, propuso una solución que nunca habíamos considerado y la ejecutó a la perfección.",
        author: "Laura Giménez",
        title: "Fundadora, InnovaHealth",
        image: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      {
        id: 3,
        quote: "La migración de nuestro sistema legacy era un monstruo que nadie quería tocar. Diego no solo lo domó, sino que lo transformó en una ventaja competitiva. Ahora somos más rápidos, más eficientes y, lo más importante, podemos innovar.",
        author: "Javier Navarro",
        title: "Director de Operaciones, RetailNow",
        image: "https://randomuser.me/api/portraits/men/46.jpg"
      },
      {
        id: 4,
        quote: "Como Google Partner, Diego nos aportó una visión de crecimiento que iba más allá de la tecnología. Nos ayudó a optimizar nuestro funnel de conversión y a entender nuestros datos. Los resultados hablan por sí solos: aumentamos la retención de usuarios en un 40%.",
        author: "Sofía Castillo",
        title: "CMO, GrowthMetrics",
        image: "https://randomuser.me/api/portraits/women/39.jpg"
      },
    // Nuevos
      {
        id: 5,
        quote: "Su profundo conocimiento en arquitecturas cloud fue decisivo para reducir nuestros costes en AWS en más de un 50%, sin sacrificar el rendimiento. Un experto total.",
        author: "Andrés Rojas",
        title: "CTO, Cloud-Native Inc.",
        image: "https://randomuser.me/api/portraits/men/51.jpg"
      },
      {
        id: 6,
        quote: "Lanzamos nuestro MVP en solo 10 semanas gracias a la eficiencia y el enfoque de Diego. Su capacidad para priorizar y ejecutar es asombrosa.",
        author: "Elena Vidal",
        title: "Product Manager, QuickMVP",
        image: "https://randomuser.me/api/portraits/women/52.jpg"
      },
      {
        id: 7,
        quote: "La implementación de IA que Diego propuso para nuestro sistema de recomendaciones ha incrementado el engagement en un 60%. Un cambio de juego.",
        author: "Marcos Herrero",
        title: "Jefe de Producto, ConnectApp",
        image: "https://randomuser.me/api/portraits/men/53.jpg"
      },
      {
        id: 8,
        quote: "La seguridad era nuestra máxima prioridad. Diego realizó una auditoría exhaustiva y fortaleció toda nuestra infraestructura. Ahora dormimos tranquilos.",
        author: "Isabel Torres",
        title: "CISO, SecureBank",
        image: "https://randomuser.me/api/portraits/women/54.jpg"
      },
      {
        id: 9,
        quote: "El roadmap de producto que definimos juntos nos ha dado una claridad que no teníamos. Sabemos exactamente qué construir, cuándo y por qué.",
        author: "David Alonso",
        title: "Fundador, Visionary SaaS",
        image: "https://randomuser.me/api/portraits/men/55.jpg"
      },
      {
        id: 10,
        quote: "Necesitábamos a alguien que entendiera tanto de negocio como de tecnología. Diego es ese perfil. Su rol como CTIO Fraccional ha sido la mejor inversión que hemos hecho.",
        author: "Patricia Sanz",
        title: "Directora General, BizTech",
        image: "https://randomuser.me/api/portraits/women/56.jpg"
      },
      {
        id: 11,
        quote: "Gracias a su experiencia en Web3, pudimos lanzar nuestro proyecto de NFTs sobre Solana de forma segura y escalable. Un verdadero experto en el ecosistema.",
        author: "Adrián Campos",
        title: "CEO, NFT-Worlds",
        image: "https://randomuser.me/api/portraits/men/57.jpg"
      },
      {
        id: 12,
        quote: "La automatización de nuestros procesos de marketing, guiada por Diego, nos ha liberado incontables horas y ha mejorado la cualificación de nuestros leads.",
        author: "Verónica Morales",
        title: "Directora de Marketing, LeadGenius",
        image: "https://randomuser.me/api/portraits/women/58.jpg"
      },
      {
        id: 13,
        quote: "Su enfoque en el análisis de datos nos abrió los ojos. Tomamos decisiones basadas en evidencia, no en intuiciones, y el impacto en el negocio ha sido inmediato.",
        author: "Ricardo Soler",
        title: "Jefe de Analítica, DataDriven Corp.",
        image: "https://randomuser.me/api/portraits/men/59.jpg"
      },
      {
        id: 14,
        quote: "Pasamos de una idea en una servilleta a un producto funcional que está generando ingresos. Diego fue el catalizador que lo hizo posible.",
        author: "Marta Rubio",
        title: "Co-Fundadora, AppFactory",
        image: "https://randomuser.me/api/portraits/women/60.jpg"
      },
      {
        id: 15,
        quote: "Lo que más valoro es su honestidad. Si una idea no es viable, te lo dice. Te ahorra tiempo, dinero y frustraciones. Un socio en quien puedes confiar.",
        author: "Francisco Peña",
        title: "Inversor Ángel",
        image: "https://randomuser.me/api/portraits/men/61.jpg"
      },
      {
        id: 16,
        quote: "El rediseño del funnel de conversión que lideró aumentó nuestras ventas en un 35% en dos meses. Impresionante.",
        author: "Beatriz Naranjo",
        title: "E-commerce Manager, ModaGlobal",
        image: "https://randomuser.me/api/portraits/women/62.jpg"
      },
      {
        id: 17,
        quote: "La capacidad de Diego para gestionar equipos y planificar sprints es excepcional. Nuestro equipo de desarrollo nunca había sido tan productivo.",
        author: "Sergio Pascual",
        title: "Lead Engineer, DevTeam",
        image: "https://randomuser.me/api/portraits/men/63.jpg"
      },
      {
        id: 18,
        quote: "Entiende perfectamente el 'product-market fit'. Nos ayudó a pivotar nuestro producto hacia un nicho mucho más rentable que no habíamos visto.",
        author: "Lorena Flores",
        title: "Fundadora, Pivotly",
        image: "https://randomuser.me/api/portraits/women/64.jpg"
      },
      {
        id: 19,
        quote: "Nos ayudó a preparar toda la documentación técnica para nuestra ronda de inversión. Los inversores quedaron impresionados con la solidez de la arquitectura.",
        author: "Óscar Vega",
        title: "CEO, InvestReady",
        image: "https://randomuser.me/api/portraits/men/65.jpg"
      },
      {
        id: 20,
        quote: "Nuestra plataforma de e-learning es ahora mucho más robusta y escalable gracias a la nueva arquitectura serverless que implementó Diego. Un trabajo impecable.",
        author: "Clara Domínguez",
        title: "Directora de Producto, LearnFast",
        image: "https://randomuser.me/api/portraits/women/66.jpg"
      },
      {
        id: 21,
        quote: "El SEO técnico era nuestro talón de Aquiles. Diego lo auditó y corrigió, y nuestro tráfico orgánico ha crecido un 150% en seis meses.",
        author: "Raúl Ibáñez",
        title: "Head of SEO, RankHigh",
        image: "https://randomuser.me/api/portraits/men/67.jpg"
      },
      {
        id: 22,
        quote: "La integración con múltiples APIs de terceros que realizó fue compleja, pero la ejecutó sin problemas, abriendo nuevas vías de negocio para nosotros.",
        author: "Marina Acosta",
        title: "Business Development Manager, ConnectAll",
        image: "https://randomuser.me/api/portraits/women/68.jpg"
      },
      {
        id: 23,
        quote: "Su visión estratégica es lo que le diferencia. No solo te da el pescado, te enseña a pescar. Nos ha hecho un equipo mucho más autónomo.",
        author: "Jorge Crespo",
        title: "CTO, EmpowerTech",
        image: "https://randomuser.me/api/portraits/men/69.jpg"
      },
      {
        id: 24,
        quote: "Creíamos que la IA era demasiado compleja para nosotros. Diego la desmitificó y nos ayudó a implementar una solución que ha mejorado nuestra eficiencia operativa un 200%.",
        author: "Eva Bravo",
        title: "COO, EfficientOps",
        image: "https://randomuser.me/api/portraits/women/70.jpg"
      },
      {
        id: 25,
        quote: "La mejor decisión que tomamos fue contratarlo como CTIO Fraccional. Tenemos dirección técnica de alto nivel sin el coste de un C-level a tiempo completo.",
        author: "Samuel Ríos",
        title: "CEO, LeanStartup",
        image: "https://randomuser.me/api/portraits/men/71.jpg"
      },
      {
        id: 26,
        quote: "Diego tiene una habilidad única para detectar 'cuellos de botella' técnicos y de producto. Su auditoría nos dio un plan de acción claro para optimizar nuestro sistema.",
        author: "Rocío Gallardo",
        title: "Product Owner, FlowPerfect",
        image: "https://randomuser.me/api/portraits/women/72.jpg"
      },
      {
        id: 27,
        quote: "El paso de una arquitectura monolítica a microservicios parecía una odisea, pero con su guía, el proceso fue fluido y los beneficios en agilidad han sido enormes.",
        author: "Fernando Vicente",
        title: "Arquitecto de Software, ModernSys",
        image: "https://randomuser.me/api/portraits/men/73.jpg"
      },
      {
        id: 28,
        quote: "Lo que más me gusta es su enfoque práctico. No se pierde en teorías, va directo a la solución que aporta más valor al negocio en el menor tiempo posible.",
        author: "Noelia Cano",
        title: "Fundadora, PragmaticApp",
        image: "https://randomuser.me/api/portraits/women/74.jpg"
      },
      {
        id: 29,
        quote: "Su dominio de Python y FastAPI es impresionante. El backend que construyó para nosotros es increíblemente rápido y eficiente.",
        author: "Hugo Ramos",
        title: "Backend Lead, Fast-API-Services",
        image: "https://randomuser.me/api/portraits/men/75.jpg"
      },
      {
        id: 30,
        quote: "Nos ayudó a definir y testear nuestra propuesta de valor con un MVP. Fallamos rápido, aprendimos más rápido y ahora estamos construyendo un producto que los usuarios aman.",
        author: "Daniela Ortiz",
        title: "CEO, Learn-Iterate",
        image: "https://randomuser.me/api/portraits/women/76.jpg"
      }
];

export const servicesHeadlines: ServicesHeadline[] = [
    {
        title: "Soluciones de Ciclo Completo",
        description: "Mi enfoque integral cubre todo el ciclo de vida del producto, garantizando que cada fase esté alineada con una visión estratégica unificada para maximizar el éxito y la rentabilidad."
    },
    {
        title: "De la Estrategia a la Realidad Técnica",
        description: "Transformo tus objetivos de negocio en productos digitales robustos y escalables. No solo construyo, creo las bases para tu crecimiento futuro."
    },
    {
        title: "Tecnología Centrada en Resultados",
        description: "Mi metodología se enfoca en entregar valor real. Cada línea de código y cada decisión de arquitectura están orientadas a resolver tus problemas y alcanzar tus metas."
    }
];

export const finalCtaHeadlines: string[] = [
    "¿Listo para transformar tu visión en una ventaja competitiva real?",
    "¿Hablamos de cómo llevar tu proyecto al siguiente nivel?",
    "Agenda una llamada y descubre el potencial oculto de tu proyecto.",
    "¿Tu proyecto está estancado? Hablemos de cómo desbloquearlo.",
    "De la idea a la facturación. ¿Estás listo para el viaje?"
];

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
