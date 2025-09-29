"use client";

import React, { useState } from 'react';
import { IoChevronDown } from 'react-icons/io5';

// Mock FAQ data - will be replaced with constants in later phases
const faqs = [
  {
    question: "¿Cuál es tu enfoque principal como Socio Tecnológico?",
    answer: "Mi enfoque se centra en combinar estrategia de negocio con excelencia técnica. No solo construyo productos, sino que ayudo a definir la visión completa del producto, desde la concepción hasta el escalado."
  },
  {
    question: "¿En qué tecnologías te especializas?",
    answer: "Me especializo en el stack moderno de JavaScript (React, Next.js, Node.js), bases de datos (PostgreSQL, MongoDB), cloud computing (AWS, Vercel), y tecnologías emergentes como IA y Blockchain."
  },
  {
    question: "¿Cómo estructuras un proyecto típico?",
    answer: "Sigo un enfoque de fases: Análisis y Estrategia → MVP → Iteración basada en datos → Escalado. Cada fase incluye entregables claros y métricas de éxito definidas."
  },
  {
    question: "¿Trabajas con startups o también con empresas establecidas?",
    answer: "Trabajo con ambos. Con startups, me enfoco en validación de producto y crecimiento rápido. Con empresas establecidas, en modernización tecnológica y transformación digital."
  },
  {
    question: "¿Qué incluye el proceso de consultoría inicial?",
    answer: "Una auditoría completa de tu situación actual, análisis del mercado y competencia, definición de objetivos claros, y una propuesta detallada con timeline y presupuesto."
  },
  {
    question: "¿Cómo mides el éxito de un proyecto?",
    answer: "Defino KPIs específicos desde el inicio: métricas de producto (retención, conversión), técnicas (performance, escalabilidad) y de negocio (ROI, time-to-market)."
  },
  {
    question: "¿Ofreces soporte post-lanzamiento?",
    answer: "Sí, incluyo soporte y mantenimiento durante los primeros meses. También ofrezco servicios de optimización continua y nuevas funcionalidades según la evolución del negocio."
  }
];

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-[var(--border-color)] last:border-b-0">
      <button
        onClick={onClick}
        className="w-full py-6 px-2 text-left flex justify-between items-center hover:bg-[var(--input-bg)] transition-colors duration-200 rounded-lg"
      >
        <span className="text-lg font-semibold text-[var(--text-color)] pr-4">{question}</span>
        <IoChevronDown 
          className={`w-5 h-5 text-[var(--text-muted)] transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-6' : 'max-h-0'
        }`}
      >
        <div className="px-2 text-[var(--text-muted)] leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
};

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [randomFaqs] = useState(() => [...faqs].sort(() => 0.5 - Math.random()).slice(0, 7));

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <h2 className="text-4xl md:text-5xl font-black text-[var(--text-color)] mb-8 text-center">
            Preguntas Frecuentes
          </h2>
          <div>
            {randomFaqs.map((faq, index) => (
              <FaqItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => toggleFaq(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;