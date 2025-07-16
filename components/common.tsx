import React from 'react';
import { IoChevronDown } from 'react-icons/io5';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', id }) => {
  return (
    <div
      id={id}
      className={`bg-[var(--card-bg)] backdrop-blur-3xl border border-[var(--border-color)] rounded-[32px] shadow-2xl shadow-[var(--shadow-color)] transition-colors duration-300 ${className}`}
    >
      <div className="p-8 h-full">
        {children}
      </div>
    </div>
  );
};


interface FaqItemProps {
  question: string;
  answer: string;
}

export const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b border-[var(--border-color)] py-6 last:border-b-0 transition-colors duration-300">
      <button
        className="w-full flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-[var(--text-color)]">{question}</span>
        <span className="text-xl text-[var(--primary-color)]">
          <IoChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] mt-4' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
            <p className="text-[var(--text-muted)] text-base leading-relaxed">
              {answer}
            </p>
        </div>
      </div>
    </div>
  );
};
