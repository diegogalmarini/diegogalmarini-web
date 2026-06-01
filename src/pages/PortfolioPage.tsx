import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { detailedCaseStudies, tagTranslations } from '../constants';
import { Card } from '../components/common';
import { DetailedCaseStudy } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const categoryColors: { [key: string]: string } = {
  'Proyecto Realizado': 'bg-green-500/10 text-green-600 dark:text-green-400',
  'Concepto Estratégico': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'Idea en Desarrollo': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

const PortfolioCard: React.FC<{ study: DetailedCaseStudy; getCategoryLabel: (cat: string) => string }> = ({ study, getCategoryLabel }) => {
  const { language } = useLanguage();

  const displayTitle = language === 'en' ? (study.titleEn || study.title) : study.title;
  const displayDescription = language === 'en' ? (study.descriptionEn || study.description) : study.description;
  return (
    <Link to={language === 'en' ? `/en/portfolio/${study.id}` : `/portfolio/${study.id}`} className="block group">
      <Card className="flex flex-col h-full !p-0 overflow-hidden border border-[var(--border-color)] bg-[var(--card-bg)] shadow-md hover:shadow-xl hover:border-[rgba(var(--primary-rgb),0.3)] transition-all duration-300 rounded-3xl">
        <div className="overflow-hidden bg-[var(--input-bg)]">
          <img src={study.imageUrl} alt={displayTitle} className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-102" />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-3">
            <span className={`category-tag text-xs font-bold px-3 py-1 rounded-lg ${categoryColors[study.category] || 'bg-gray-500/10 text-gray-600'}`}>
              {getCategoryLabel(study.category)}
            </span>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-color)] mb-3 flex-grow">{displayTitle}</h3>
          <p className="text-[var(--text-muted)] text-sm mb-4 leading-relaxed font-light">{displayDescription}</p>
          <div className="mt-auto flex flex-wrap gap-1.5">
            {study.tags.slice(0, 4).map(tag => {
              const displayTag = language === 'en' ? (tagTranslations[tag] || tag) : tag;
              return (
                <span key={tag} className="inline-block bg-[var(--input-bg)] text-[var(--text-muted)] text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border border-[var(--border-color)]">
                  #{displayTag}
                </span>
              );
            })}
          </div>
        </div>
      </Card>
    </Link>
  );
};


const PortfolioPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | DetailedCaseStudy['category']>('all');
  const { t, language } = useLanguage();

  const getCategoryLabel = (cat: string) => {
    if (cat === 'all') return t('portfolio.tag.all') || 'Todos';
    if (cat === 'Proyecto Realizado') return language === 'en' ? 'Completed Project' : 'Proyecto Realizado';
    if (cat === 'Concepto Estratégico') return language === 'en' ? 'Strategic Concept' : 'Concepto Estratégico';
    if (cat === 'Idea en Desarrollo') return language === 'en' ? 'Idea in Development' : 'Idea en Desarrollo';
    return cat;
  };

  const filteredStudies = useMemo(() => {
    if (filter === 'all') return detailedCaseStudies;
    return detailedCaseStudies.filter(study => study.category === filter);
  }, [filter]);

  const filters: ('all' | DetailedCaseStudy['category'])[] = ['all', 'Proyecto Realizado', 'Concepto Estratégico', 'Idea en Desarrollo'];

  return (
    <div className="py-28 bg-[var(--bg-color)] min-h-screen transition-colors duration-300">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--primary-color)] opacity-5 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--text-color)] tracking-tight">
            {t('portfolio.title')}
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-base md:text-lg text-[var(--text-muted)] leading-relaxed font-light">
            {t('portfolio.subtitle')}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex justify-center flex-wrap gap-3 mb-16">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                filter === f 
                  ? 'bg-[rgba(var(--primary-rgb),0.08)] text-[var(--primary-color)] border-[rgba(var(--primary-rgb),0.2)] shadow-sm' 
                  : 'bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[rgba(var(--primary-rgb),0.2)]'
              }`}
            >
              {getCategoryLabel(f)}
            </button>
          ))}
        </div>
        
        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStudies.map((cs) => (
            <PortfolioCard key={cs.id} study={cs} getCategoryLabel={getCategoryLabel} />
          ))}
        </div>

        {/* CTA section */}
        <div className="mt-20 p-8 md:p-12 bg-gradient-to-r from-[rgba(168,85,247,0.05)] to-[rgba(59,130,246,0.05)] rounded-3xl border border-[var(--border-color)] shadow-xl relative overflow-hidden text-center max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[var(--text-color)] tracking-tight">
            {t('portfolio.cta.title')}
          </h2>
          <p className="mt-4 text-sm text-[var(--text-muted)] font-light max-w-2xl mx-auto leading-relaxed">
            {t('portfolio.cta.desc')}
          </p>
          <div className="mt-8">
            <a 
              href="#book" 
              className="btn-cta px-8 py-3.5 text-xs font-extrabold shadow-lg inline-block"
            >
              {t('portfolio.cta.btn')}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PortfolioPage;