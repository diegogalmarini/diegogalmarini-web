'use client';

import { useModal } from '@/contexts/ModalContext';

export default function HomePage() {
  const { openModal } = useModal();

  const handleBookCall = () => {
    openModal('booking');
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight">
            <span className="block text-[var(--dg-text)]">Soluciones Tecnológicas</span>
            <span className="block text-[var(--dg-text)]">que Impulsan tu</span>
            <span className="block text-[var(--dg-primary)]">Crecimiento y Rentabilidad.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[var(--dg-text-muted)] mb-12 max-w-4xl mx-auto leading-relaxed">
            Ayudo a empresas y startups a diseñar, construir y escalar productos de alto impacto con IA, Blockchain y estrategias de crecimiento digital probadas.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button 
              onClick={handleBookCall}
              className="btn-cta px-8 py-4 text-lg"
            >
              Agendar Llamada Estratégica
            </button>
          </div>

          {/* Services Preview */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-[var(--dg-bg-alt)] border border-[var(--dg-border)]">
              <div className="w-16 h-16 bg-[var(--dg-primary-soft)] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[var(--dg-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.4 4.4 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--dg-text)] mb-3">Arquitectura Cloud</h3>
              <p className="text-[var(--dg-text-muted)] text-center">Infraestructura escalable y segura en AWS, Google Cloud y Azure.</p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-[var(--dg-bg-alt)] border border-[var(--dg-border)]">
              <div className="w-16 h-16 bg-[var(--dg-primary-soft)] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[var(--dg-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--dg-text)] mb-3">Análisis de Datos</h3>
              <p className="text-[var(--dg-text-muted)] text-center">Business Intelligence y analytics para decisiones basadas en datos.</p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-[var(--dg-bg-alt)] border border-[var(--dg-border)]">
              <div className="w-16 h-16 bg-[var(--dg-primary-soft)] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[var(--dg-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--dg-text)] mb-3">Experto en IA</h3>
              <p className="text-[var(--dg-text-muted)] text-center">Implementación de IA generativa y machine learning en productos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-[var(--dg-bg-accent)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-[var(--dg-text)] mb-8">
            ¿Listo para transformar tu idea en un producto exitoso?
          </h2>
          <p className="text-xl text-[var(--dg-text-muted)] mb-12">
            Agenda una llamada estratégica gratuita y descubre cómo puedo ayudarte a escalar tu negocio con tecnología.
          </p>
          <button 
            onClick={handleBookCall}
            className="btn-cta px-12 py-5 text-xl"
          >
            Agendar Llamada Gratuita
          </button>
        </div>
      </section>
    </>
  )
}