
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { homeServices, caseStudies, testimonials, faqs, heroHeadlines, heroPills, differentiators, detailedServices, finalCtaHeadlines } from '../constants';
import { Card, FaqItem } from '../components/common';
import { CaseStudy, Pill, Differentiator, FaqItem as FaqItemType } from '../types';
import { TestimonialSlider } from '../components/TestimonialSlider';
import { IoCheckmarkCircle } from 'react-icons/io5';

const CaseStudyCard: React.FC<{ caseStudy: CaseStudy }> = ({ caseStudy }) => (
    <Card className="flex flex-col group overflow-hidden">
      <div className="overflow-hidden rounded-xl mb-6 -m-2">
        <img src={caseStudy.imageUrl} alt={caseStudy.title} className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="pt-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-[var(--text-color)] mb-3 flex-grow">{caseStudy.title}</h3>
        <p className="text-[var(--text-muted)] mb-6 flex-grow">{caseStudy.description}</p>
        <Link to={`/portfolio#${caseStudy.id}`} className="text-[var(--primary-color)] font-semibold hover:underline">
            Analizar Caso de Estudio →
        </Link>
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

    const activeServiceData = homeServices.find(s => s.id === activeService);
    const activeServiceDetails = activeServiceData ? detailedServices[activeServiceData.id] : null;

    return (
        <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-32 pb-40 text-center">
                <div className="absolute inset-0 gradient-bg"></div>
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <h1 className="text-5xl md:text-7xl font-black text-[var(--text-color)] tracking-tight">
                        {headline}
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[var(--text-muted)] leading-relaxed">
                        Ayudo a empresas y startups a diseñar, construir y escalar productos de alto impacto con IA, Blockchain y estrategias de crecimiento digital probadas.
                    </p>
                    <div className="mt-10">
                         <button onClick={onBookCallClick} className="btn-cta text-lg px-10 py-5">
                            Agendar Llamada Estratégica
                        </button>
                    </div>
                    <div className="mt-12 flex justify-center items-center flex-wrap gap-4 text-sm">
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
            <section className="py-28">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="differentiator-card-glass">
                        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-color)]">{differentiator.title}</h2>
                        <p className="mt-6 text-lg text-[var(--text-muted)] leading-relaxed">
                            "{differentiator.description}"
                        </p>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-[var(--text-color)] mb-4">Soluciones de Ciclo Completo</h2>
                    <p className="text-lg text-[var(--text-muted)] text-center max-w-3xl mx-auto mb-16">
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
            <section className="py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-[var(--text-color)] mb-16">Innovación Probada en Proyectos Reales</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {caseStudies.map((cs) => (
                           <CaseStudyCard key={cs.id} caseStudy={cs} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <h2 className="text-4xl md:text-5xl font-bold text-center text-[var(--text-color)] mb-16">Lo que dicen mis clientes</h2>
                    <TestimonialSlider testimonials={testimonials} />
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-28">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card>
                        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-color)] mb-8 text-center">Preguntas Frecuentes</h2>
                        <div>
                            {randomFaqs.map((faq, index) => (
                                <FaqItem key={index} question={faq.question} answer={faq.answer} />
                            ))}
                        </div>
                    </Card>
                </div>
            </section>

             {/* Final CTA Section */}
            <section className="py-28">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-color)]">{finalCta}</h2>
                    <div className="mt-10">
                        <button onClick={onBookCallClick} className="btn-cta text-lg px-10 py-5">
                            Agendar mi Sesión Estratégica
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;
