import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { detailedCaseStudies } from '../constants';
import { Card, BarChart } from '../components/common';
import { 
  IoArrowBack, 
  IoLeafOutline, 
  IoFlashOutline, 
  IoCalculatorOutline, 
  IoCalendarOutline 
} from 'react-icons/io5';
import { useLanguage } from '../contexts/LanguageContext';
import { portfolioDetailTranslations } from '../utils/portfolioTranslations';

interface PortfolioDetailPageProps {
  onBookCallClick?: (planId?: string, notes?: string) => void;
}

const CTOCalculator: React.FC<{ 
  onBook: (kwh: number, cost: number, appliances: any, annualSavings: number, co2Reduction: number) => void;
  language: string;
}> = ({ onBook, language }) => {
  const [kwh, setKwh] = useState(550);
  const [cost, setCost] = useState(0.24);
  const [appliances, setAppliances] = useState({
    heater: true,
    ac: true,
    washer: false,
    car: false
  });

  const toggleAppliance = (key: keyof typeof appliances) => {
    setAppliances(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const monthlyCost = useMemo(() => kwh * cost, [kwh, cost]);

  const savingPercentage = useMemo(() => {
    let pct = 8; // Base smart-monitoring saving
    if (appliances.heater) pct += 8;
    if (appliances.ac) pct += 10;
    if (appliances.washer) pct += 4;
    if (appliances.car) pct += 12;
    return pct;
  }, [appliances]);

  const monthlySavings = useMemo(() => (monthlyCost * savingPercentage) / 100, [monthlyCost, savingPercentage]);
  const annualSavings = useMemo(() => monthlySavings * 12, [monthlySavings]);
  const kwhSavedAnnual = useMemo(() => (kwh * savingPercentage / 100) * 12, [kwh, savingPercentage]);
  const co2Reduction = useMemo(() => kwhSavedAnnual * 0.385, [kwhSavedAnnual]); // kg of CO2 per kWh average

  return (
    <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] p-6 md:p-8 backdrop-blur-md shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[rgba(var(--primary-rgb),0.1)] text-[var(--primary-color)] rounded-2xl border border-[rgba(var(--primary-rgb),0.2)]">
          <IoCalculatorOutline className="text-2xl" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--text-color)]">
            {language === 'en' ? 'Savings Simulator: CTIO Calculator' : 'Simulador de Ahorro: Calculadora del CTIO'}
          </h3>
          <p className="text-xs text-[var(--text-muted)] font-light mt-0.5">
            {language === 'en' 
              ? 'Calculate the impact of dynamic energy optimization with real-time AI.' 
              : 'Calcula el impacto de optimización energética mediante IA en tiempo real.'}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Sliders / Checkboxes */}
        <div className="space-y-6">
          {/* Consumption Slider */}
          <div>
            <div className="flex justify-between text-sm font-semibold text-[var(--text-color)] mb-2">
              <span>{language === 'en' ? 'Monthly Electrical Consumption' : 'Consumo Eléctrico Mensual'}</span>
              <span className="text-[var(--primary-color)] font-bold">{kwh} kWh</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="20"
              value={kwh}
              onChange={e => setKwh(parseInt(e.target.value))}
              className="w-full h-2 bg-[var(--input-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1 font-light">
              <span>100 kWh ({language === 'en' ? 'Apartment' : 'Piso'})</span>
              <span>2000 kWh ({language === 'en' ? 'Large House' : 'Casa Grande'})</span>
            </div>
          </div>

          {/* Cost per kWh */}
          <div>
            <div className="flex justify-between text-sm font-semibold text-[var(--text-color)] mb-2">
              <span>{language === 'en' ? 'Cost per kWh (USD)' : 'Costo por kWh (USD)'}</span>
              <span className="text-[var(--primary-color)] font-bold">${cost.toFixed(2)} / kWh</span>
            </div>
            <input
              type="range"
              min="0.08"
              max="0.50"
              step="0.01"
              value={cost}
              onChange={e => setCost(parseFloat(e.target.value))}
              className="w-full h-2 bg-[var(--input-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1 font-light">
              <span>$0.08 ({language === 'en' ? 'Eco' : 'Económico'})</span>
              <span>$0.50 ({language === 'en' ? 'High Rate' : 'Tarifa Alta'})</span>
            </div>
          </div>

          {/* Smart Connected Appliances */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-color)] mb-3">
              {language === 'en' ? 'Smart Connected Appliances' : 'Electrodomésticos Inteligentes Conectados'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { 
                  key: 'heater', 
                  label: language === 'en' ? 'Water Heater' : 'Termoeléctrico', 
                  desc: language === 'en' ? 'Savings +8%' : 'Ahorro +8%' 
                },
                { 
                  key: 'ac', 
                  label: language === 'en' ? 'Climate / AC' : 'Climatización / AC', 
                  desc: language === 'en' ? 'Savings +10%' : 'Ahorro +10%' 
                },
                { 
                  key: 'washer', 
                  label: language === 'en' ? 'Washer / Dish' : 'Lavadora / Vajilla', 
                  desc: language === 'en' ? 'Savings +4%' : 'Ahorro +4%' 
                },
                { 
                  key: 'car', 
                  label: language === 'en' ? 'EV Charger' : 'Cargador EV', 
                  desc: language === 'en' ? 'Savings +12%' : 'Ahorro +12%' 
                }
              ].map(item => {
                const isActive = (appliances as any)[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => toggleAppliance(item.key as any)}
                    className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                      isActive
                        ? 'border-[var(--primary-color)] bg-[rgba(var(--primary-rgb),0.05)] shadow-md'
                        : 'border-[var(--border-color)] bg-[var(--input-bg)] hover:bg-[var(--border-color)]'
                    }`}
                  >
                    <p className={`text-xs font-bold ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--text-color)]'}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-light">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="p-6 bg-[var(--input-bg)] rounded-2xl border border-[var(--border-color)] flex flex-col justify-between">
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-[var(--text-color)] border-b border-[var(--border-color)] pb-2 uppercase tracking-wider">
              {language === 'en' ? 'Estimated AI Savings' : 'Ahorro Estimado con IA'}
            </h4>
            
            {/* Base vs New Spend */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--text-muted)] font-light">{language === 'en' ? 'Base Monthly Cost' : 'Gasto Mensual Base'}</p>
                <p className="text-xl font-bold text-[var(--text-color)] mt-0.5">${monthlyCost.toFixed(0)} USD</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] font-light">{language === 'en' ? 'Savings Percentage' : 'Porcentaje Ahorro (IA)'}</p>
                <p className="text-xl font-bold text-green-500 mt-0.5">-{savingPercentage}%</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
              {/* Annual Savings */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-[var(--text-color)]">
                  <IoFlashOutline className="text-green-500 text-lg" />
                  {language === 'en' ? 'Estimated Annual Savings' : 'Ahorro Anual Estimado'}
                </span>
                <span className="text-xl font-black text-green-500">${annualSavings.toFixed(0)} USD</span>
              </div>
              
              {/* CO2 Reduction */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-[var(--text-color)]">
                  <IoLeafOutline className="text-purple-500 text-lg" />
                  {language === 'en' ? 'Annual CO2 Reduction' : 'Reducción CO2 Anual'}
                </span>
                <span className="text-xl font-black text-purple-500">{co2Reduction.toFixed(0)} kg</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onBook(kwh, cost, appliances, annualSavings, co2Reduction)}
            className="w-full mt-8 py-3.5 bg-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-95 flex items-center justify-center gap-2"
          >
            <IoCalendarOutline className="text-lg" />
            {language === 'en' ? 'Book and Inject Simulation' : 'Agendar e Inyectar Simulación'}
          </button>
        </div>
      </div>

      <p className="text-[10px] text-[var(--text-muted)] text-center font-light leading-relaxed">
        {language === 'en' 
          ? '* Estimates are based on dynamic rate models by hourly slots and predictive algorithms applied to appliances with standard average consumption profiles.'
          : '* Las estimaciones se realizan en base a modelos de tarifas dinámicas por franjas horarias y algoritmos predictivos aplicados a electrodomésticos con perfiles de consumo medio estandarizados.'}
      </p>
    </div>
  );
};

const PortfolioDetailPage: React.FC<PortfolioDetailPageProps> = ({ onBookCallClick }) => {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  
  const study = useMemo(() => {
    return detailedCaseStudies.find(cs => cs.id === id);
  }, [id]);

  if (!study) {
    return (
      <div className="py-28 text-center bg-[var(--bg-color)]">
        <h1 className="text-2xl font-bold text-[var(--text-color)]">
          {language === 'en' ? 'Project not found' : 'Proyecto no encontrado'}
        </h1>
        <Link to={language === 'en' ? '/en/portfolio' : '/portfolio'} className="text-[var(--primary-color)] hover:underline mt-4 inline-block">
          {language === 'en' ? 'Back to Portfolio' : 'Volver al Portafolio'}
        </Link>
      </div>
    );
  }

  const getCategoryLabel = (cat: string) => {
    if (cat === 'Proyecto Realizado') return language === 'en' ? 'Completed Project' : 'Proyecto Realizado';
    if (cat === 'Concepto Estratégico') return language === 'en' ? 'Strategic Concept' : 'Concepto Estratégico';
    if (cat === 'Idea en Desarrollo') return language === 'en' ? 'Idea in Development' : 'Idea en Desarrollo';
    return cat;
  };

  const categoryColors: { [key: string]: string } = {
    'Proyecto Realizado': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    'Concepto Estratégico': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'Idea en Desarrollo': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  const handleSimulatedBooking = (kwh: number, cost: number, appliances: any, annualSavings: number, co2Reduction: number) => {
    if (!onBookCallClick) return;

    const deviceList = [];
    if (appliances.heater) deviceList.push(language === 'en' ? 'Water Heater' : 'Termoeléctrico');
    if (appliances.ac) deviceList.push(language === 'en' ? 'Climate / AC' : 'Climatización');
    if (appliances.washer) deviceList.push(language === 'en' ? 'Appliances' : 'Electrodomésticos');
    if (appliances.car) deviceList.push(language === 'en' ? 'EV Charger' : 'Cargador EV');

    const notes = language === 'en'
      ? `Hi Diego, I have simulated my savings using the CTIO Smart Energy Optimization Calculator. My home consumes approx ${kwh} kWh/month at an average cost of $${cost.toFixed(2)}/kWh. I selected optimization for: [${deviceList.join(', ')}]. My projected annual savings is $${annualSavings.toFixed(0)} USD and CO2 reduction is ${co2Reduction.toFixed(0)} kg. I would like to schedule a session to analyze how to structure this IoT & AI system.`
      : `Hola Diego, he simulado mis ahorros utilizando la Calculadora del CTO de Smart Energy Optimization. Mi hogar consume aprox. ${kwh} kWh/mes a un costo promedio de $${cost.toFixed(2)}/kWh. He seleccionado optimización para: [${deviceList.join(', ')}]. Mi ahorro ahorro anual proyectado es de $${annualSavings.toFixed(0)} USD y reducción de CO2 de ${co2Reduction.toFixed(0)} kg. Me gustaría agendar la sesión para analizar cómo estructurar este sistema IoT e IA.`;
    
    onBookCallClick('express', notes);
  };

  const translated = language === 'en' && study.id ? portfolioDetailTranslations[study.id] : null;

  const displayTitle = language === 'en' ? (study.titleEn || study.title) : study.title;
  const displayProblem = translated?.problemEn || study.problem;
  const displaySolution = translated?.solutionEn || study.solution;
  const displayBusinessModel = translated?.businessModelEn || study.businessModel;
  const displayTechChallenges = translated?.techChallengesEn || study.techChallenges;
  const displayResultsSummary = translated?.summaryEn || study.results.summary;

  const getMetricLabel = (label: string) => {
    if (language === 'en' && translated?.metricsEn && translated.metricsEn[label]) {
      return translated.metricsEn[label];
    }
    return label;
  };

  const getMetricValue = (value: string) => {
    if (language === 'en' && translated?.metricsEn && translated.metricsEn[value]) {
      return translated.metricsEn[value];
    }
    return value;
  };

  return (
    <div className="py-20 md:py-28 bg-[var(--bg-color)] min-h-screen transition-colors duration-300">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to={language === 'en' ? '/en/portfolio' : '/portfolio'} className="inline-flex items-center text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors">
            <IoArrowBack className="mr-2" />
            {language === 'en' ? 'Back to all projects' : 'Volver a todos los proyectos'}
          </Link>
        </div>

        <div className="relative rounded-3xl overflow-hidden mb-12 shadow-xl border border-[var(--border-color)] h-96">
          <img src={study.imageUrl} alt={displayTitle} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 z-10">
            <span className={`category-tag ${categoryColors[study.category]} !text-white !bg-black/40 backdrop-blur-sm !border-white/20 px-3 py-1 rounded-full text-xs font-bold border`}>
              {getCategoryLabel(study.category)}
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mt-3">{displayTitle}</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-color)] mb-4">
                {language === 'en' ? 'The Problem' : 'El Problema'}
              </h2>
              <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed font-light">{displayProblem}</p>
            </section>
            
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-color)] mb-4">
                {language === 'en' ? 'Proposed Solution' : 'La Solución Propuesta'}
              </h2>
              <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed font-light">{displaySolution}</p>
            </section>

            {/* Inyección de la Calculadora CTO si es Smart Energy Optimization */}
            {study.id === 'smart-energy-optimization' && (
              <section className="pt-4 border-t border-[var(--border-color)]">
                <CTOCalculator onBook={handleSimulatedBooking} language={language} />
              </section>
            )}

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-color)] mb-4">
                {language === 'en' ? 'Business Model' : 'Modelo de Negocio'}
              </h2>
              <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed font-light">{displayBusinessModel}</p>
            </section>
            
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-color)] mb-4">
                {language === 'en' ? 'Technical Challenges' : 'Retos Técnicos'}
              </h2>
              <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed font-light">{displayTechChallenges}</p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8 lg:sticky top-28 self-start">
            <Card className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-md p-6">
              <h3 className="text-lg font-bold text-[var(--text-color)] mb-4">
                {language === 'en' ? 'Key Results' : 'Resultados Clave'}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mb-6 font-light">{displayResultsSummary}</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {study.results.metrics.map(metric => (
                  <div key={metric.label} className="metric-card bg-[var(--input-bg)] border border-[var(--border-color)] p-2.5 rounded-2xl text-center">
                    <p className="text-xl font-black text-[var(--primary-color)]">{getMetricValue(metric.value)}</p>
                    <p className="text-[9px] text-[var(--text-muted)] mt-1 font-semibold uppercase tracking-wider leading-tight">{getMetricLabel(metric.label)}</p>
                  </div>
                ))}
              </div>
              {study.results.chartData && (
                <div className="flex justify-center mt-6">
                  <BarChart data={study.results.chartData} />
                </div>
              )}
            </Card>
            
            <Card className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-md p-6">
              <h3 className="text-lg font-bold text-[var(--text-color)] mb-4">
                {language === 'en' ? 'Technology Stack' : 'Pila Tecnológica'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {study.techStack.map(tech => (
                  <div key={tech.name} className="tech-stack-item bg-[var(--input-bg)] border border-[var(--border-color)] px-3 py-1.5 rounded-xl flex items-center shadow-sm">
                    <tech.icon className="text-[var(--primary-color)] text-sm" />
                    <span className="ml-2 text-xs text-[var(--text-color)] font-semibold">{tech.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetailPage;