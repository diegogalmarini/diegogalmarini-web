import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { homeServices, caseStudies, testimonials, faqs, heroPills, detailedServices, finalCtaHeadlines, finalCtaHeadlinesEn, tagTranslations } from '../constants';
import { Card, FaqItem } from '../components/common';
import { CaseStudy, Pill, FaqItem as FaqItemType } from '../types';
import { TestimonialSlider } from '../components/TestimonialSlider';
import { ClientLogos } from '../components/ClientLogos';
import { IoCheckmarkCircle, IoArrowBack, IoArrowForward } from 'react-icons/io5';
import PricingWidget from '../components/pricing/PricingWidget';
import { useLanguage } from '../contexts/LanguageContext';
import { ShinyText } from '../components/ui/ShinyText';
import { WorldClocks } from '../components/ui/WorldClocks';

const metricsLabelsEn: Record<string, string> = {
  'latencia': 'Latency',
  'retencion': 'Retention',
  'ahorro': 'Savings',
  'precision': 'Precision',
  'estado': 'Status',
  'analisis': 'Analysis',
  'mvp': 'MVP',
  'menus': 'Menus',
  'infra': 'Infra',
  'cierre': 'Closing',
  'crm': 'CRM',
  'cables': 'Cables',
  'eficiencia': 'Efficiency',
  'margen': 'Margin',
  'sincro': 'Sync',
  'marca': 'Brand',
  'posicion': 'Position',
  'buyer': 'Buyer',
  'leads': 'Leads',
  'alertas': 'Alerts',
  'redes': 'Networks',
  'optimizacion': 'Optimization',
  'presencia': 'Presence',
  'carga': 'Load'
};

const metricsValuesEn: Record<string, string> = {
  'Aprobada': 'Approved',
  '8 semanas': '8 weeks',
  '0€/mes': '0€/mo',
  'Automático': 'Automatic',
  '0 Cables': '0 Cables',
  'Patentado': 'Patented',
  '0ms Overbook': '0ms Overbooking',
  'Multi-marca': 'Multi-brand',
  'Rank #1': 'Rank #1',
  '100% Focus': '100% Focus',
  '100% Live': '100% Live',
  'Real-Time': 'Real-Time',
  'AEO Listo': 'AEO Ready',
  '0 a 100': '0 to 100'
};

const CaseStudyCard: React.FC<{ caseStudy: CaseStudy }> = ({ caseStudy }) => {
  const { language } = useLanguage();
  
  const title = language === 'en' && caseStudy.titleEn ? caseStudy.titleEn : caseStudy.title;
  const description = language === 'en' && caseStudy.descriptionEn ? caseStudy.descriptionEn : caseStudy.description;
  const metricsEntries = Object.entries(caseStudy.metrics || {});

  return (
    <Card className="flex flex-col group overflow-hidden case-study-glass-card border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md rounded-2xl h-[440px] w-full transition-premium">
        <div className="overflow-hidden rounded-t-2xl h-40 relative">
            <img src={caseStudy.image} alt={title} className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-103" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] to-transparent opacity-20"></div>
        </div>
        <div className="p-6 flex flex-col flex-grow justify-between">
            <div>
                <div className="mb-3 flex flex-wrap gap-1">
                    {caseStudy.tags.slice(0, 3).map(tag => {
                        const displayTag = language === 'en' ? tagTranslations[tag] || tag : tag;
                        return (
                            <span key={tag} className="inline-block bg-[rgba(0,122,255,0.06)] text-[var(--primary-color)] text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-[rgba(0,122,255,0.1)]">
                                {displayTag}
                            </span>
                        );
                    })}
                </div>
                <h3 className="text-base font-black text-[var(--text-color)] mb-2 group-hover:text-[var(--primary-color)] transition-colors duration-300 line-clamp-1">
                    {title}
                </h3>
                <p className="text-[var(--text-muted)] text-xs leading-relaxed font-light line-clamp-3">
                    {description}
                </p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[var(--border-color)]">
                {metricsEntries.slice(0, 3).map(([key, value]) => {
                  let displayKey = key;
                  let displayValue = value;
                  if (language === 'en') {
                    const lowercaseKey = key.toLowerCase();
                    if (metricsLabelsEn[lowercaseKey]) {
                      displayKey = metricsLabelsEn[lowercaseKey];
                    } else {
                      displayKey = key.charAt(0).toUpperCase() + key.slice(1);
                    }
                    
                    if (metricsValuesEn[value]) {
                      displayValue = metricsValuesEn[value];
                    }
                  } else {
                    displayKey = key.charAt(0).toUpperCase() + key.slice(1);
                  }
                  return (
                    <div key={key} className="text-center">
                        <div className="text-base font-black text-[var(--primary-color)]">{displayValue}</div>
                        <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">{displayKey}</div>
                    </div>
                  );
                })}
            </div>
        </div>
    </Card>
  );
};

const heroPillTranslations: Record<string, string> = {
  "CTIO Fraccional": "Fractional CTIO",
  "Desarrollo Full-Stack": "Full-Stack Development",
  "Experto en IA": "AI Expert",
  "Google Partner": "Google Partner",
  "Arquitectura Cloud": "Cloud Architecture",
  "Growth Hacking": "Growth Hacking",
  "Arquitecto Web3": "Web3 Architect",
  "Estratega de Producto": "Product Strategist",
  "Prototipado MVP": "MVP Prototyping",
  "Análisis de Datos": "Data Analytics",
  "An├ílisis de Datos": "Data Analytics"
};

const HomePage: React.FC<{ onBookCallClick: (planId?: string, notes?: string) => void }> = ({ onBookCallClick }) => {
    const { t, language } = useLanguage();
    const [pills] = useState<Pill[]>(() => [...heroPills].sort(() => 0.5 - Math.random()).slice(0, 3));
    const [activeService, setActiveService] = useState<'strategy' | 'development' | 'growth'>('strategy');
    const [finalCtaIndex] = useState(() => Math.floor(Math.random() * finalCtaHeadlines.length));
    const [randomFaqs] = useState<FaqItemType[]>(() => [...faqs].sort(() => 0.5 - Math.random()).slice(0, 7));
    const [homeCaseStudies, setHomeCaseStudies] = useState<CaseStudy[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        setHomeCaseStudies(caseStudies);
    }, []);

    // Dynamic Bilingual SEO & GEO Metadata Updater
    useEffect(() => {
        const titleVal = language === 'en'
            ? "Diego Galmarini - Strategic Tech Partner & Fractional CTIO"
            : "Diego Galmarini - Socio Tecnológico Estratégico & CTIO Fraccional";
        document.title = titleVal;

        const descVal = language === 'en'
            ? "Diego Galmarini - Strategic Tech Partner and Fractional CTIO. I help companies and startups design, build, and scale high-impact products with AI, Blockchain, and proven digital growth strategies."
            : "Diego Galmarini - Socio Tecnológico Estratégico y CTIO Fraccional. Ayudo a empresas y startups a diseñar, construir y escalar productos de alto impacto con IA, Blockchain y estrategias de crecimiento digital probadas.";

        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', descVal);

        const updateMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
          let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
          if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attrName, attrVal);
            document.head.appendChild(el);
          }
          el.setAttribute('content', contentVal);
        };

        updateMetaTag('property', 'og:title', titleVal);
        updateMetaTag('property', 'og:description', descVal);
        updateMetaTag('property', 'og:url', window.location.href);
        updateMetaTag('name', 'twitter:title', titleVal);
        updateMetaTag('name', 'twitter:description', descVal);
    }, [language]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % homeCaseStudies.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + homeCaseStudies.length) % homeCaseStudies.length);
    };

    const visibleCases = React.useMemo(() => {
        if (homeCaseStudies.length === 0) return [];
        const result = [];
        for (let i = 0; i < 3; i++) {
            const index = (currentIndex + i) % homeCaseStudies.length;
            result.push(homeCaseStudies[index]);
        }
        return result;
    }, [currentIndex, homeCaseStudies]);

    const activeServiceData = homeServices.find(s => s.id === activeService);
    const activeServiceDetails = activeServiceData ? detailedServices[activeServiceData.id] : null;

    // Translation maps for dynamic details
    const activeDetails = React.useMemo(() => {
      if (!activeServiceDetails) return null;
      return {
        title: t(`services.${activeService}.title`),
        solution: t(`services.${activeService}.solution`),
        deliverables: t(`services.${activeService}.deliv`).split('|').map(i => i.trim())
      };
    }, [activeService, activeServiceDetails, t]);

    return (
        <div className="bg-[var(--bg-color)] text-[var(--text-color)] min-h-screen transition-colors duration-300">
            
            {/* HERO SECTION (Adaptive Light/Dark full-screen loop) */}
            <section className="relative min-h-[920px] sm:min-h-0 sm:h-screen w-full overflow-hidden flex flex-col justify-between py-6 sm:py-0">
                
                {/* Loop Video Background with gradient-bg mesh */}
                <div className="absolute inset-0 gradient-bg z-0"></div>
                <video 
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none opacity-15 dark:opacity-40 mix-blend-luminosity dark:mix-blend-overlay"
                />
                
                {/* Smooth blend transition layer */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-color)]/30 to-[var(--bg-color)] z-20 pointer-events-none" />

                {/* Vertical offset padding replacing status bar */}
                <div className="pt-16 sm:pt-20"></div>

                {/* Hero Center Content */}
                <div className="relative z-30 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 w-full flex-grow flex flex-col justify-center text-center">
                    
                    <h1 className="text-5xl md:text-8xl xl:text-9xl font-black text-[var(--text-color)] tracking-tighter leading-[0.85] flex flex-col items-center">
                        <span className="block font-medium opacity-90">{language === 'en' ? 'Become' : 'Diseño'}</span>
                        <ShinyText 
                          text={language === 'en' ? 'Product Leader.' : 'Código & Estrategia.'}
                          className="font-black mt-2 tracking-tighter"
                        />
                    </h1>
                    
                    <p className="mt-6 sm:mt-8 max-w-2xl mx-auto text-sm md:text-base text-[var(--text-muted)] leading-relaxed font-light">
                        {t('hero.subtitle')}
                    </p>

                    {/* Dual Action premium button layout */}
                    <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 px-4 sm:px-0 w-full">
                        <button 
                            onClick={() => onBookCallClick('express')} 
                            className="group relative overflow-hidden bg-[var(--primary-color)] text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-premium flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] w-full max-w-xs sm:w-auto sm:max-w-none"
                        >
                            <div className="relative h-[16px] overflow-hidden flex flex-col justify-start">
                              <span className="block transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-full">
                                {t('hero.cta.book')}
                              </span>
                              <span className="absolute left-0 top-full block transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-full">
                                {t('hero.cta.book')}
                              </span>
                            </div>
                            
                            <div className="w-5 h-5 rounded-full bg-white text-[var(--primary-color)] flex items-center justify-center transition-transform duration-500 group-hover:rotate-45">
                                <IoArrowForward className="text-[10px]" />
                            </div>
                        </button>

                        <button 
                            onClick={() => onBookCallClick('free')} 
                            className="group relative overflow-hidden bg-[#F26522] text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-premium flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] w-full max-w-xs sm:w-auto sm:max-w-none"
                        >
                            <div className="relative h-[16px] overflow-hidden flex flex-col justify-start">
                              <span className="block transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-full">
                                {t('hero.cta.free')}
                              </span>
                              <span className="absolute left-0 top-full block transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-full">
                                {t('hero.cta.free')}
                              </span>
                            </div>
                            
                            <div className="w-5 h-5 rounded-full bg-white text-[#F26522] flex items-center justify-center transition-transform duration-500 group-hover:rotate-45">
                                <IoArrowForward className="text-[10px]" />
                            </div>
                        </button>
                    </div>

                    <div className="mt-10 sm:mt-16 flex justify-center items-center flex-wrap gap-3 sm:gap-5 text-xs">
                        {pills.map((pill) => {
                          const label = language === 'en' ? heroPillTranslations[pill.text] || pill.text : pill.text;
                          return (
                            <div key={pill.text} className="tech-pill-glass border border-[var(--border-color)]">
                                <pill.icon className="text-[var(--primary-color)]" />
                                <span className="font-semibold text-[var(--text-color)]">{label}</span>
                            </div>
                          );
                        })}
                    </div>
                </div>

                {/* Hero Bottom Bar */}
                <div className="relative z-30 bg-[#f1f1f4] dark:bg-zinc-900/80 py-6 border-t border-[var(--border-color)]/30">
                    <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        <div className="lg:col-span-7">
                            <p className="text-[var(--text-muted)] text-xs sm:text-sm font-light leading-relaxed">
                              {language === 'en' 
                                ? 'We design systems to not only operate today, but to scale exponentially tomorrow. Our tactical technical consulting ensures your ultimate product advantage.'
                                : 'Diseño sistemas no solo para funcionar hoy, sino para crecer exponencialmente mañana. Mi doble rol como arquitecto y estratega asegura tu ventaja competitiva.'
                              }
                            </p>
                        </div>
                        
                        <a 
                          href="https://www.google.com/maps/contrib/112961622654310200849/photos/@39.5263076,-0.4673697,12z/data=!3m1!4b1!4m3!8m2!3m1!1e1?entry=ttu&g_ep=EgoyMDI2MDUyNS4wIKXMDSoASAFQAw%3D%3D"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="lg:col-span-5 group flex items-center justify-between p-3.5 px-4 bg-white/80 dark:bg-zinc-950/20 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-zinc-800 hover:border-orange-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(244,81,30,0.05)] transition-all duration-300 cursor-pointer"
                        >
                            <div className="flex items-center gap-3.5">
                                {/* Circular profile with Local Guide star badge overlay */}
                                <div className="relative w-12 h-12 flex-shrink-0">
                                    <img 
                                      src="/profile.webp" 
                                      alt="Diego Raul Galmarini" 
                                      className="w-full h-full object-cover rounded-full border border-gray-150 dark:border-zinc-850"
                                    />
                                    {/* Google Local Guide Level 9 Star Badge */}
                                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#F4511E] border-2 border-white dark:border-zinc-900 flex items-center justify-center shadow-md">
                                        <svg className="w-4 h-4 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            {/* 12-pointed star path */}
                                            <path d="M50 10 L55.5 32 L77.5 20.5 L67.5 41.5 L90 41.5 L70 55 L82.5 74 L60 64 L50 85 L40 64 L17.5 74 L30 55 L10 41.5 L32.5 41.5 L22.5 20.5 L44.5 32 Z" fill="currentColor"/>
                                            {/* Inner Orange Circle */}
                                            <circle cx="50" cy="50" r="17" fill="#F4511E"/>
                                            {/* Inner White Circle */}
                                            <circle cx="50" cy="50" r="8" fill="white"/>
                                        </svg>
                                    </div>
                                </div>

                                <div className="text-left">
                                    <div className="font-extrabold text-sm sm:text-base tracking-tight text-gray-900 dark:text-white leading-tight">
                                        Diego Raul Galmarini
                                    </div>
                                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5 leading-none">
                                        Local Guide Nivel 9
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="font-black text-lg sm:text-xl text-[#F4511E] dark:text-[#FF6D00] tracking-tight leading-none group-hover:scale-102 transition-transform duration-300">
                                        +103M
                                    </div>
                                    <div className="text-[8px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-extrabold mt-1 leading-none">
                                        {language === 'en' ? 'PHOTO VIEWS' : 'VISTAS DE FOTOS'}
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 flex items-center justify-center text-[#F4511E] dark:text-[#FF6D00] group-hover:bg-[#F4511E] group-hover:text-white group-hover:border-[#F4511E] transition-all duration-300 flex-shrink-0">
                                    <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            {/* SECTION 2: ABOUT / INTRODUCING DIEGO (Light background) */}
            <section className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-150 py-32 sm:py-40 transition-colors duration-300">
                <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
                    
                    {/* Badge Row */}
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-7 h-7 rounded-full bg-[var(--primary-color)] text-white font-bold text-xs flex items-center justify-center">
                            1
                        </div>
                        <span className="text-xs font-extrabold uppercase tracking-wider border border-[var(--border-color)] rounded-full px-4 py-1.5 bg-[var(--bg-color)] text-[var(--text-color)]">
                            {language === 'en' ? 'Introducing Diego' : 'Presentando a Diego'}
                        </span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-zinc-950 dark:text-white tracking-tighter leading-[1.08] mb-20 max-w-4xl">
                        {language === 'en' 
                          ? 'Strategy-led creatives, delivering results in digital and beyond.'
                          : 'Creador impulsado por la estrategia, entregando resultados exponenciales en el entorno digital.'}
                    </h2>

                    {/* Content layout asymmetrically grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end">
                        {/* Small Image */}
                        <div className="lg:col-span-3">
                            <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-zinc-100 shadow-lg border border-[var(--border-color)]">
                                <img 
                                  src="/profile-desk.jpg" 
                                  alt="Diego Galmarini" 
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
                                />
                            </div>
                        </div>

                        {/* Mid Paragraph & Button */}
                        <div className="lg:col-span-4 flex flex-col justify-between h-full py-2">
                            <p className="text-zinc-800 dark:text-zinc-300 text-sm md:text-base leading-[1.65] font-medium max-w-sm mb-8">
                               {language === 'en'
                                 ? 'Through research, creative thinking and iteration we help growing brands realize their digital full potential.'
                                 : 'A través de la investigación profunda y la dirección estratégica modular, ayudo a marcas y startups tecnológicas a dominar su categoría online.'
                               }
                            </p>
                            
                            {/* Orange button */}
                            <Link 
                                to={language === 'en' ? "/en/about" : "/about"}
                                className="group relative overflow-hidden bg-[#F26522] text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-premium flex items-center gap-3 cursor-pointer w-fit shadow-md hover:shadow-lg hover:scale-[1.02]"
                            >
                                <div className="relative h-[16px] overflow-hidden flex flex-col justify-start">
                                  <span className="block transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-full">
                                    {language === 'en' ? 'About our studio' : 'Acerca de mí'}
                                  </span>
                                  <span className="absolute left-0 top-full block transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-full">
                                    {language === 'en' ? 'About our studio' : 'Acerca de mí'}
                                  </span>
                                </div>
                                <div className="w-5 h-5 rounded-full bg-white text-[#F26522] flex items-center justify-center transition-transform duration-500 group-hover:rotate-45">
                                    <IoArrowForward className="text-[10px]" />
                                </div>
                            </Link>
                        </div>

                        {/* Large Image */}
                        <div className="lg:col-span-5">
                            <div className="rounded-3xl overflow-hidden aspect-[3/2] bg-zinc-100 shadow-xl border border-[var(--border-color)]">
                                <img 
                                  src="/profile-whiteboard.jpg" 
                                  alt="Software and design integration" 
                                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* WorldClocks replacing Choice Grid */}
            <WorldClocks />

            {/* SERVICES SECTION ("Soluciones de Ciclo Completo") */}
            <section className="py-24 relative overflow-hidden bg-[var(--bg-color)]">
                <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
                    
                    {/* Header */}
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(0,122,255,0.05)] border border-[rgba(0,122,255,0.1)] text-[var(--primary-color)] text-xs font-semibold uppercase tracking-wider mb-4">
                            {language === 'en' ? 'E2E TECHNICAL CONSULTING' : 'Consultoría de Extremo a Extremo'}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--text-color)] tracking-tight mb-6">
                            {language === 'en' ? 'Full Lifecycle Business Solutions' : 'Soluciones de Ciclo Completo'}
                        </h2>
                        <p className="text-base md:text-lg text-[var(--text-muted)] font-light leading-relaxed">
                            {language === 'en' 
                              ? 'My comprehensive approach spans the entire product lifecycle, aligning engineering with strategic direction to maximize efficiency and ROI.' 
                              : 'Mi enfoque integral cubre todo el ciclo de vida del producto, garantizando que cada fase esté alineada con una visión estratégica unificada para maximizar el éxito y la rentabilidad.'}
                        </p>
                    </div>

                    {/* Tab Navigation Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
                        {homeServices.map((service) => {
                          const isActive = activeService === service.id;
                          let title = service.title;
                          if (language === 'en') {
                            if (service.id === 'strategy') title = 'Strategy & Architecture';
                            if (service.id === 'development') title = 'MVP & SaaS Development';
                            if (service.id === 'growth') title = 'Growth & Analytics';
                          }
                          return (
                            <button
                                key={service.id}
                                onClick={() => setActiveService(service.id as any)}
                                className={`p-6 rounded-2xl border transition-premium text-left w-full cursor-pointer flex flex-col justify-between h-36 hover:shadow-lg ${
                                  isActive 
                                    ? 'border-[var(--primary-color)] bg-[var(--card-bg)] shadow-md' 
                                    : 'border-[var(--border-color)] bg-[var(--card-bg)] opacity-60 hover:opacity-100'
                                }`}
                            >
                                <span className={`font-extrabold text-[10px] tracking-widest uppercase ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--text-muted)]'}`}>
                                  {service.id}
                                </span>
                                <span className="font-black text-lg text-[var(--text-color)] tracking-tight">{title}</span>
                            </button>
                          );
                        })}
                    </div>

                    {/* Tab Panel Content Display */}
                    <div className="service-content-container relative">
                        {activeDetails && (
                            <div key={activeService} className="transition-premium">
                                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 sm:p-12 rounded-3xl backdrop-blur-md shadow-xl">
                                    <div className="grid md:grid-cols-5 gap-12 items-center">
                                        <div className="md:col-span-2">
                                            <h3 className="text-2xl font-black text-[var(--text-color)] mb-4">{activeDetails.title}</h3>
                                            <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed font-light">{activeDetails.solution}</p>
                                            <Link to={language === 'en' ? "/en/services" : "/services"} className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary-color)] hover:underline uppercase tracking-wider">
                                                {language === 'en' ? 'View all services →' : 'Ver todos los servicios →'}
                                            </Link>
                                        </div>
                                        <div className="md:col-span-3 bg-[var(--card-bg)] p-8 rounded-2xl border border-[var(--border-color)]">
                                            <h4 className="text-xs font-black text-[var(--text-color)] uppercase tracking-widest mb-6 opacity-60">
                                              {language === 'en' ? 'Key Deliverables' : 'Entregables Clave'}
                                            </h4>
                                            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                                                {activeDetails.deliverables.map((item, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <IoCheckmarkCircle className="w-5 h-5 text-[var(--primary-color)] mr-3 mt-0.5 flex-shrink-0" />
                                                        <span className="text-[var(--text-muted)] text-sm font-light leading-snug">{item}</span>
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

            {/* SECTION 3: CASE STUDIES (Restored original carousel layout with premium styling) */}
            <section className="py-24 relative overflow-hidden bg-[var(--bg-color)]">
                <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(0,122,255,0.05)] border border-[rgba(0,122,255,0.1)] text-[var(--primary-color)] text-xs font-semibold mb-6">
                          <span className="w-2 h-2 rounded-full bg-[var(--primary-color)] animate-pulse"></span>
                          {language === 'en' ? 'SELECTED WORK' : 'PROYECTOS Y DESARROLLOS'}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--text-color)] mb-4 tracking-tight">
                            {language === 'en' ? 'SaaS & Software Architecture' : 'Proyectos e Innovaciones'}
                        </h2>
                        <p className="text-base md:text-lg text-[var(--text-muted)] max-w-2xl leading-relaxed font-light">
                            {language === 'en' 
                              ? 'A curated selection of real-world SaaS products and scalable software architectures built for modern startups and enterprises.' 
                              : 'Una selección exclusiva de productos SaaS reales y arquitecturas de software escalables creadas para startups y empresas.'}
                        </p>
                    </div>
                    
                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3 self-center md:self-end">
                      <button 
                        onClick={handlePrev} 
                        className="p-3.5 rounded-full border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] hover:bg-[var(--primary-color)] hover:text-white hover:border-[var(--primary-color)] transition-premium cursor-pointer flex items-center justify-center shadow-sm"
                        aria-label="Previous Slide"
                      >
                        <IoArrowBack className="text-lg" />
                      </button>
                      <button 
                        onClick={handleNext} 
                        className="p-3.5 rounded-full border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] hover:bg-[var(--primary-color)] hover:text-white hover:border-[var(--primary-color)] transition-premium cursor-pointer flex items-center justify-center shadow-sm"
                        aria-label="Next Slide"
                      >
                        <IoArrowForward className="text-lg" />
                      </button>
                    </div>
                </div>

                <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {visibleCases.map((cs, idx) => (
                            <div 
                              key={`${cs.id}-${idx}`} 
                              className={`w-full transition-premium ${
                                idx === 1 ? 'hidden md:block' : idx === 2 ? 'hidden lg:block' : 'block'
                              }`}
                            >
                                <CaseStudyCard caseStudy={cs} />
                            </div>
                        ))}
                    </div>

                    {/* Indicators */}
                    <div className="flex justify-center gap-2 mt-12">
                      {homeCaseStudies.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-premium cursor-pointer ${
                            currentIndex === idx ? 'bg-[var(--primary-color)] w-5' : 'bg-[var(--border-color)] hover:bg-[var(--text-muted)]'
                          }`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                </div>
            </section>

            {/* Pricing consulting Plans Section */}
            <section className="py-28 gradient-bg">
                <PricingWidget onSelectPlan={onBookCallClick} />
            </section>

            {/* Client Logos section */}
            <section className="py-28 bg-white dark:bg-zinc-950 transition-colors duration-300">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-black text-center text-[var(--text-color)] mb-4">
                      {language === 'en' ? 'Trusted My Leadership' : 'Han Confiado en Mí'}
                    </h2>
                    <p className="text-base text-[var(--text-muted)] text-center max-w-3xl mx-auto mb-16 font-light">
                        {language === 'en' 
                          ? 'Throughout my career, I have had the privilege to lead software architectures and launch products with leaders in their respective sectors.' 
                          : 'A lo largo de mi carrera, he tenido el privilegio de colaborar con algunas de las empresas más innovadoras y líderes en sus respectivos sectores.'}
                    </p>
                    <ClientLogos />
                </div>
            </section>

            {/* Testimonials section */}
            <section className="py-28 bg-[var(--bg-color)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-black text-center text-[var(--text-color)] mb-4">
                      {language === 'en' ? 'What My Clients Say' : 'Lo que dicen mis clientes'}
                    </h2>
                    <p className="text-base text-[var(--text-muted)] text-center max-w-3xl mx-auto mb-8 font-light">
                        {language === 'en' 
                          ? 'Startups founders, CEOs, and Directors trust my fractional leadership to transform their platforms.' 
                          : 'Fundadores, CEOs y Directivos confían en mi visión para transformar sus negocios.'}
                    </p>
                    <TestimonialSlider testimonials={testimonials} />
                </div>
            </section>

            {/* FAQs section */}
            <section id="faq" className="py-28 bg-white dark:bg-zinc-950 transition-colors duration-300">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="bg-[var(--card-bg)] border border-[var(--border-color)] shadow-lg">
                        <h2 className="text-4xl font-black text-[var(--text-color)] mb-8 text-center">
                          {language === 'en' ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}
                        </h2>
                        <div>
                            {randomFaqs.map((faq, index) => {
                              const q = language === 'en' && faq.questionEn ? faq.questionEn : faq.question;
                              const a = language === 'en' && faq.answerEn ? faq.answerEn : faq.answer;
                              return (
                                <FaqItem key={index} question={q} answer={a} />
                              );
                            })}
                        </div>
                    </Card>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-40 relative overflow-hidden">
                <div className="absolute inset-0 gradient-bg z-0"></div>
                <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
                    <div className="cta-card-glass">
                        <h2 className="text-3xl md:text-5xl font-black text-[var(--text-color)] tracking-tight">
                            {language === 'en' ? finalCtaHeadlinesEn[finalCtaIndex] : finalCtaHeadlines[finalCtaIndex]}
                        </h2>
                        <p className="mt-8 text-sm md:text-base text-[var(--text-muted)] leading-relaxed font-light">
                            {language === 'en' 
                              ? 'Book a free strategy session to audit your software design, AI agent setups, and scale margins.' 
                              : 'Agenda una llamada estratégica gratuita y descubre cómo podemos transformar tu idea en un producto exitoso.'}
                        </p>
                        
                        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 px-4 sm:px-0 w-full">
                            <button 
                                onClick={() => onBookCallClick('express')} 
                                className="group relative overflow-hidden bg-[var(--primary-color)] text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-premium flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] w-full max-w-xs sm:w-auto sm:max-w-none"
                            >
                                <div className="relative h-[16px] overflow-hidden flex flex-col justify-start">
                                  <span className="block transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-full">
                                    {t('hero.cta.book')}
                                  </span>
                                  <span className="absolute left-0 top-full block transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-full">
                                    {t('hero.cta.book')}
                                  </span>
                                </div>
                                <div className="w-5 h-5 rounded-full bg-white text-[var(--primary-color)] flex items-center justify-center transition-transform duration-500 group-hover:rotate-45">
                                    <IoArrowForward className="text-[10px]" />
                                </div>
                            </button>
                            
                            <button 
                                onClick={() => onBookCallClick('free')} 
                                className="group relative overflow-hidden bg-[#F26522] text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-premium flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] w-full max-w-xs sm:w-auto sm:max-w-none"
                            >
                                <div className="relative h-[16px] overflow-hidden flex flex-col justify-start">
                                  <span className="block transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-full">
                                    {t('hero.cta.free')}
                                  </span>
                                  <span className="absolute left-0 top-full block transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-full">
                                    {t('hero.cta.free')}
                                  </span>
                                </div>
                                
                                <div className="w-5 h-5 rounded-full bg-white text-[#F26522] flex items-center justify-center transition-transform duration-500 group-hover:rotate-45">
                                    <IoArrowForward className="text-[10px]" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;