import React from 'react';

// Mock client logos - will be replaced with actual ClientLogos component in later phases
const ClientLogosSection: React.FC = () => {
  return (
    <section className="py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-black text-center text-[var(--text-color)] mb-4">Han Confiado en Mí</h2>
        <p className="text-lg text-[var(--text-muted)] text-center max-w-3xl mx-auto mb-16">
          A lo largo de mi carrera, he tenido el privilegio de colaborar con algunas de las empresas más innovadoras y líderes en sus respectivos sectores.
        </p>
        {/* TODO: Replace with actual ClientLogos component in later phases */}
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
          <div className="w-24 h-12 bg-[var(--input-bg)] rounded-lg flex items-center justify-center border border-[var(--border-color)]">
            <span className="text-sm text-[var(--text-muted)]">Logo 1</span>
          </div>
          <div className="w-24 h-12 bg-[var(--input-bg)] rounded-lg flex items-center justify-center border border-[var(--border-color)]">
            <span className="text-sm text-[var(--text-muted)]">Logo 2</span>
          </div>
          <div className="w-24 h-12 bg-[var(--input-bg)] rounded-lg flex items-center justify-center border border-[var(--border-color)]">
            <span className="text-sm text-[var(--text-muted)]">Logo 3</span>
          </div>
          <div className="w-24 h-12 bg-[var(--input-bg)] rounded-lg flex items-center justify-center border border-[var(--border-color)]">
            <span className="text-sm text-[var(--text-muted)]">Logo 4</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientLogosSection;