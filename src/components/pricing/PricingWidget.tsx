import React from 'react';
import { usePlans } from '../../contexts/PlansContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { IoCheckmarkCircleOutline, IoMailOutline, IoTimeOutline, IoChevronForward } from 'react-icons/io5';

interface PricingWidgetProps {
  onSelectPlan: (planId: string) => void;
}

const PricingWidget: React.FC<PricingWidgetProps> = ({ onSelectPlan }) => {
  const { plans } = usePlans();
  const { language, t } = useLanguage();

  // Mostrar solo los planes activos
  const activePlans = React.useMemo(() => {
    return plans.filter(p => p.isActive !== false);
  }, [plans]);

  return (
    <div className="py-16 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-[rgba(var(--primary-rgb),0.1)] text-[var(--primary-color)] border border-[rgba(var(--primary-rgb),0.2)] mb-4 inline-block">
            {t('pricing.title')}
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-[var(--text-color)] tracking-tight">
            {t('pricing.headline')}<span className="bg-gradient-to-r from-[var(--primary-color)] to-[#a855f7] bg-clip-text text-transparent">{t('pricing.headline.span')}</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base md:text-lg text-[var(--text-muted)] font-light leading-relaxed">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Grid de Planes */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {activePlans.map(plan => {
            const isFree = plan.price === 0;
            const isMostPopular = plan.id === 'express';
            
            const planName = language === 'en' ? (plan.nameEn || plan.name) : plan.name;
            const planDescription = language === 'en' ? (plan.descriptionEn || plan.description) : plan.description;
            const planFeatures = language === 'en' ? (plan.featuresEn || plan.features) : plan.features;

            return (
              <div 
                key={plan.id}
                className={`flex flex-col bg-[var(--card-bg)] rounded-3xl border transition-all duration-500 relative flex-grow ${
                  isMostPopular 
                    ? 'border-[var(--primary-color)] shadow-2xl scale-102 hover:scale-103 md:-translate-y-2' 
                    : 'border-[var(--border-color)] shadow-lg hover:shadow-2xl hover:border-[rgba(var(--primary-rgb),0.3)] hover:-translate-y-1'
                }`}
              >
                {/* Badge de Popular */}
                {isMostPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[var(--primary-color)] text-white shadow-lg">
                    {t('pricing.recommended')}
                  </span>
                )}

                {/* Encabezado */}
                <div className="p-8 pb-6 border-b border-[var(--border-color)]">
                  <h3 className="text-xl font-bold text-[var(--text-color)] mb-2">{planName}</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed min-h-[5.5rem] md:min-h-[6rem] lg:min-h-[5.5rem] font-light">
                    {planDescription}
                  </p>
                  
                  {/* Precio */}
                  <div className="mt-6 flex items-baseline">
                    <span className="text-4xl md:text-5xl font-black text-[var(--text-color)] tracking-tight">
                      {isFree ? (language === 'en' ? 'Free' : 'Gratis') : `${plan.price}€`}
                    </span>
                    {!isFree && (
                      <span className="text-sm font-semibold text-[var(--text-muted)] ml-2">EUR</span>
                    )}
                  </div>

                  {/* Duración */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    {plan.duration > 0 ? (
                      <>
                        <IoTimeOutline className="text-sm text-[var(--primary-color)]" />
                        <span>{plan.duration} {language === 'en' ? 'minutes virtual session' : 'minutos de sesión virtual'}</span>
                      </>
                    ) : (
                      <>
                        <IoMailOutline className="text-sm text-[var(--primary-color)]" />
                        <span>{language === 'en' ? 'Written advisory by email' : 'Asesoría escrita por email'}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Características */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <ul className="space-y-4 mb-8">
                    {planFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <IoCheckmarkCircleOutline className="text-lg text-[var(--primary-color)] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[var(--text-muted)] font-light leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Botón CTA */}
                  <button
                    onClick={() => onSelectPlan(plan.id)}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 group ${
                      isMostPopular
                        ? 'bg-[var(--primary-color)] text-white shadow-lg hover:shadow-xl hover:opacity-95'
                        : isFree
                          ? 'bg-[#F26522] text-white shadow-lg hover:shadow-xl hover:opacity-95'
                          : 'bg-gradient-to-r from-[var(--primary-color)] to-[#a855f7] text-white hover:opacity-95'
                    }`}
                  >
                    {isFree ? t('pricing.cta.free') : t('pricing.cta.paid')}
                    <IoChevronForward className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Garantía de Stripe */}
        <div className="mt-12 text-center flex items-center justify-center gap-6 text-[var(--text-muted)] text-xs">
          <span className="flex items-center gap-1.5">
            {t('pricing.stripe')}
          </span>
          <span className="h-4 w-px bg-[var(--border-color)]"></span>
          <span>
            {t('pricing.direct')}
          </span>
        </div>

      </div>
    </div>
  );
};

export default PricingWidget;
