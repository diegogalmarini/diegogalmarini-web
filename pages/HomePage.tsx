import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { homeServices, caseStudies, testimonials, faqs, heroHeadlines, heroPills, differentiators, detailedServices, finalCtaHeadlines } from '../constants';
import { Card, FaqItem } from '../components/common.tsx';
import { CaseStudy, Pill, Differentiator, FaqItem as FaqItemType } from '../types';
import { TestimonialSlider } from '../components/TestimonialSlider.tsx';
import { ClientLogos } from '../components/ClientLogos.tsx';
import { IoCheckmarkCircle } from 'react-icons/io5';

const CaseStudyCard: React.FC<{ caseStudy: CaseStudy }> = ({ caseStudy }) => (
    <Card className="flex flex-col group overflow-hidden">
      <div className="overflow-hidden rounded-xl mb-6">
        <img src={caseStudy.image} alt={caseStudy.title} className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="pt-2 flex flex-col flex-grow">
        <div className="mb-3">
          {caseStudy.tags.slice(0, 3).map(tag => (
            <span key={tag} className="inline-block bg-[var(--input-bg)] text-[var(--text-muted)] text-xs font-semibold mr-2 mb-2 px-3 py-1 rounded-full border border-transparent">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-bold text-[var(--text-color)] mb-3 group-hover:text-[var(--primary-color)] transition-colors duration-300">
          {caseStudy.title}
        </h3>
        <p className="text-[var(--text-muted)] mb-6 flex-grow leading-relaxed">
          {caseStudy.description}
        </p>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border-color)]">
          {Object.entries(caseStudy.metrics).slice(0, 3).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-lg font-bold text-[var(--primary-color)]">{value}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">{key}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
);

const HomePage: React.FC<{onBookCallClick: () => void}> = ({ onBookCallClick }) => {
    const [headline] = useState(() => heroHeadlines[Math.floor(Math.random() * heroHeadlines.length)]);
    const [pills] = useState<Pill[]>(() => [...heroPills].sort(() => 0.5 - Math.random()).slice(0, 3));
    const [differentiator] = useState<Differentiator>(() => differentiators[Math.floor(Math.random() * differentiators.length)]);
    const [activeService, setActiveService] = useState<'strategy' | 'development' | 'growth'>('strategy');
    const [finalCta] = useState(() => finalCtaHeadlines[Math.floor(Math.random() * finalCtaHeadlines.length)]);
    const [randomFaqs] = useState<FaqItemType[]>(() => [...faqs].sort(() => 0.5 - Math.random()).slice(0, 7));
    const [homeCaseStudies, setHomeCaseStudies] = useState<CaseStudy[]>([]);

    useEffect(() => {
      const shuffled = [...caseStudies].sort(() => 0.5 - Math.random());
      setHomeCaseStudies(shuffled.slice(0, 2));
    }, []);

    const activeServiceData = homeServices.find(s => s.id === activeService);
    const activeServiceDetails = activeServiceData ? detailedServices[activeServiceData.id] : null;

    return (
        <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-40 pb-48 text-center"> {/* Increased padding for more breathing room */}
                <div className="absolute inset-0 gradient-bg"></div>
                <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 z-10"> {/* Reduced max-width, increased padding */}
                    <h1 className="text-4xl md:text-6xl font-black text-[var(--text-color)] tracking-tight leading-tight">
                        {headline}
                    </h1>
                    <p className="mt-8 max-w-2xl mx-auto text-base md:text-lg text-[var(--text-muted)] leading-relaxed"> {/* Increased margin, reduced size */}
                        Ayudo a empresas y startups a diseñar, construir y escalar productos de alto impacto con IA, Blockchain y estrategias de crecimiento digital probadas.
                    </p>
                    <div className="mt-12"> {/* Increased margin */}
                         <button onClick={onBookCallClick} className="btn-cta px-8 py-3"> {/* Refined padding */}
                            Agendar Llamada Estratégica
                        </button>
                    </div>
                    <div className="mt-16 flex justify-center items-center flex-wrap gap-6 text-sm"> {/* Increased margins and gaps */}
                        {pills.map((pill) => (
                           <div key={pill.text} className="tech-pill-glass">
                               <pill.icon />
                               <span>{pill.text}</span>
                           </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Differentiator Section */}
            <section className="py-40"> {/* Increased padding */}
                <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center"> {/* Reduced max-width, increased padding */}
                    <div className="differentiator-card-glass">
                        <h2 className="text-3xl md:text-4xl font-black text-[var(--text-color)]">{differentiator.title}</h2>
                        <p className="mt-8 text-base md:text-lg text-[var(--text-muted)] leading-relaxed"> {/* Increased margin, reduced size */}
                            "{differentiator.description}"
                        </p>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-40"> {/* Increased padding */}
                <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12"> {/* Reduced max-width, increased padding */}
                    <h2 className="text-3xl md:text-4xl font-black text-center text-[var(--text-color)] mb-6 tracking-tight">
                        Soluciones de Ciclo Completo
                    </h2>
                    <p className="text-base md:text-lg text-[var(--text-muted)] text-center max-w-2xl mx-auto mb-20 leading-relaxed"> {/* Reduced size, reduced max-width, increased margin */}
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
                                <Card className="!p-12">
                                    <div className="grid md:grid-cols-5 gap-12 items-center">
                                        <div className="md:col-span-2">
                                            <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4">{activeServiceDetails.title}</h3>
                                            <p className="text-lg text-[var(--text-muted)] mb-6 leading-relaxed">{activeServiceDetails.solution}</p>
                                            <Link to="/services" className="text-[var(--primary-color)] font-semibold hover:underline mt-auto">
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
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Case Studies Section */}
            <section className="py-40"> {/* Increased padding */}
                <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12"> {/* Reduced max-width, increased padding */}
                    <h2 className="text-3xl md:text-4xl font-black text-center text-[var(--text-color)] mb-6 tracking-tight">
                        Innovación Probada en Proyectos Reales
                    </h2>
                     <p className="text-base md:text-lg text-[var(--text-muted)] text-center max-w-2xl mx-auto mb-20 leading-relaxed"> {/* Reduced size, reduced max-width, increased margin */}
                        Una selección de proyectos que demuestran la conversión de estrategia en valor tangible.
                    </p>
                    <div className="grid md:grid-cols-2 gap-8">
                        {homeCaseStudies.map((cs) => (
                           <CaseStudyCard key={cs.id} caseStudy={cs} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Client Logos Section */}
            <section className="py-28">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-black text-center text-[var(--text-color)] mb-4">Han Confiado en Mí</h2>
                    <p className="text-lg text-[var(--text-muted)] text-center max-w-3xl mx-auto mb-16">
                        A lo largo de mi carrera, he tenido el privilegio de colaborar con algunas de las empresas más innovadoras y líderes en sus respectivos sectores.
                    </p>
                    <ClientLogos />
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-black text-center text-[var(--text-color)] mb-4">Lo que dicen mis clientes</h2>
                    <p className="text-lg text-[var(--text-muted)] text-center max-w-3xl mx-auto mb-8">
                        Fundadores, CEOs y Directivos confían en mi visión para transformar sus negocios.
                    </p>
                    <TestimonialSlider testimonials={testimonials} />
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-28">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card>
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--text-color)] mb-8 text-center">Preguntas Frecuentes</h2>
                        <div>
                            {randomFaqs.map((faq, index) => (
                                <FaqItem key={index} question={faq.question} answer={faq.answer} />
                            ))}
                        </div>
                    </Card>
                </div>
            </section>

             {/* Final CTA Section */}
            <section className="py-40"> {/* Increased padding */}
                <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 text-center"> {/* Reduced max-width, increased padding */}
                    <div className="cta-card-glass">
                        <h2 className="text-3xl md:text-4xl font-black text-[var(--text-color)] tracking-tight">
                            {finalCta}
                        </h2>
                        <p className="mt-8 text-base md:text-lg text-[var(--text-muted)] leading-relaxed"> {/* Increased margin, reduced size */}
                            Agenda una llamada estratégica gratuita y descubre cómo podemos transformar tu idea en un producto exitoso.
                        </p>
                        <div className="mt-12"> {/* Increased margin */}
                            <button onClick={onBookCallClick} className="btn-cta px-8 py-3"> {/* Refined padding */}
                                Agendar Llamada Estratégica
                            </button>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;