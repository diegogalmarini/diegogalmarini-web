import React from 'react';
import { IoChevronDown } from 'react-icons/io5';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  tabIndex?: number;
  role?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  ariaLabel?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', id, onClick, tabIndex, role, onKeyDown, ariaLabel, title }) => {
  const isInteractive = Boolean(onClick);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    // Allow consumer handler first
    if (onKeyDown) {
      onKeyDown(e);
    }
    if (!e.defaultPrevented && isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      // Trigger native click so any onClick handler fires consistently
      (e.currentTarget as HTMLDivElement).click();
    }
  };

  const effectiveTabIndex = typeof tabIndex === 'number' ? tabIndex : (isInteractive ? 0 : undefined);
  const effectiveRole = role ?? (isInteractive ? 'button' : undefined);
  const effectiveAriaLabel = ariaLabel ?? title;

  return (
    <div
      id={id}
      className={`bg-[var(--card-bg)] backdrop-blur-3xl border border-[var(--border-color)] rounded-[32px] shadow-2xl shadow-[var(--shadow-color)] transition-colors duration-300 ${(onClick || typeof effectiveTabIndex === 'number') ? 'focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2' : ''} ${className}`}
      onClick={onClick}
      tabIndex={effectiveTabIndex as any}
      role={effectiveRole as any}
      onKeyDown={handleKeyDown}
      aria-label={effectiveAriaLabel}
      title={title}
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

interface BarChartProps {
  data: { name: string; value: number }[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const chartHeight = 150;
  const barWidth = 40;
  const barMargin = 20;
  const chartWidth = data.length * (barWidth + barMargin);

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} aria-label="Gráfico de resultados">
      {data.map((d, i) => {
        const barHeight = (d.value / maxValue) * chartHeight;
        const x = i * (barWidth + barMargin);
        const y = chartHeight - barHeight;
        const strokeDasharray = `${barHeight}, ${barHeight}`;
        const strokeDashoffset = barHeight;

        return (
          <g key={d.name}>
            <text x={x + barWidth / 2} y={chartHeight + 20} textAnchor="middle" fontSize="12" fill="var(--text-muted)">
              {d.name}
            </text>
            <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--text-color)">
              {d.value}
            </text>
            <line
              className="bar-chart-bar"
              x1={x + barWidth / 2}
              y1={chartHeight}
              x2={x + barWidth / 2}
              y2={y}
              stroke="var(--primary-color)"
              strokeWidth={barWidth}
              style={{ strokeDasharray, strokeDashoffset }}
            />
          </g>
        );
      })}
    </svg>
  );
};