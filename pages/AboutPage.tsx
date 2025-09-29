
import React from 'react';
import { IoPersonCircleOutline, IoLogoLinkedin, IoLogoGithub, IoLogoTwitter, IoLogoInstagram } from 'react-icons/io5';

const TechPill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-block bg-[var(--input-bg)] text-[var(--primary-color)] text-sm font-medium mr-2 mb-2 px-4 py-1.5 rounded-full border border-[var(--border-color)] transition-colors duration-300 hover:border-[var(--primary-color)]/50">
        {children}
    </span>
);

const socialLinks = [
  { href: 'https://www.linkedin.com/in/diegogalmarini/', icon: IoLogoLinkedin, label: 'LinkedIn' },
  { href: 'https://github.com/diegogalmarini', icon: IoLogoGithub, label: 'GitHub' },
  { href: 'https://x.com/diegogalmarini', icon: IoLogoTwitter, label: 'Twitter (X)' },
  { href: 'https://www.instagram.com/diegogalmarini/', icon: IoLogoInstagram, label: 'Instagram' },
];


const AboutPage: React.FC = () => {
  return (
    <div className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-16 items-start">
          <div className="lg:col-span-2 sticky top-28 space-y-8">
            <div className="group rounded-3xl shadow-2xl shadow-black/20 w-full aspect-square overflow-hidden bg-[var(--input-bg)]">
                <img
                    src="/profile.webp"
                    alt="Foto de perfil de Diego Galmarini"
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                />
            </div>
             <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-3xl shadow-2xl shadow-[var(--shadow-color)] p-6 flex items-center space-x-4 transition-colors duration-300">
                <IoPersonCircleOutline className="text-5xl text-[var(--primary-color)]" />
                <div className="text-left">
                    <p className="font-bold text-lg text-[var(--text-color)]">CTIO Fraccional</p>
                    <p className="text-base text-[var(--text-muted)]">Liderazgo tecnológico a tu alcance.</p>
                </div>
            </div>
            <div className="flex justify-around pt-2">
                {socialLinks.map(link => (
                    <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Perfil de Diego Galmarini en ${link.label}`}
                        className="social-link-glass"
                    >
                        <link.icon className="w-7 h-7" />
                    </a>
                ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-color)] mb-4">
              Diego Galmarini
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-[var(--primary-color)] mb-12">
                Socio Estratégico de Tecnología e Innovación
            </h2>

            <div className="space-y-12 text-lg text-[var(--text-muted)] leading-relaxed">
              <section>
                <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4 border-b border-[var(--border-color)] pb-3 transition-colors duration-300">Quién soy</h3>
                <p>
                  Soy un profesional con más de 20 años de trayectoria, especializado en liderar la innovación tecnológica, la transformación digital y el desarrollo estratégico en empresas que buscan un crecimiento escalable. Mi enfoque se basa en la aplicación inteligente de tecnologías emergentes (Blockchain, Inteligencia Artificial, Automatización) para resolver desafíos complejos y generar ventajas competitivas medibles.
                </p>
                <p className="mt-4">
                  Actúo como partner estratégico para CEOs y equipos directivos, con capacidad demostrada para alinear claramente la tecnología y la innovación con objetivos de negocio.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4 border-b border-[var(--border-color)] pb-3 transition-colors duration-300">Mi Core Expertise</h3>
                <ul className="space-y-4">
                  <li><strong className="font-semibold text-[var(--text-color)]">Liderazgo Estratégico y Transformación Digital:</strong> Gestión de proyectos complejos, y transformación integral mediante automatización.</li>
                  <li><strong className="font-semibold text-[var(--text-color)]">Blockchain, Web3 & NFTs:</strong> Desarrollo de soluciones blockchain, smart contracts (Solana, Ethereum), y plataformas como Mintonaire.io.</li>
                  <li><strong className="font-semibold text-[var(--text-color)]">Inteligencia Artificial (AI) & Automatización:</strong> Implementación de IA para optimizar procesos y generación de contenido (Mikit.ai, TokenWatcher).</li>
                  <li><strong className="font-semibold text-[var(--text-color)]">Desarrollo Full-Stack y Arquitectura Cloud:</strong> Dominio de React, Next.js, Python (FastAPI), y arquitectura en AWS y Render.</li>
                  <li><strong className="font-semibold text-[var(--text-color)]">E-commerce y Marketing Estratégico:</strong> Certificado Google Partner, con experiencia en SEO, Growth Hacking y analítica avanzada (GA4).</li>
                  <li><strong className="font-semibold text-[var(--text-color)]">Diseño y Desarrollo de Producto (Hardware & Software):</strong> Prototipado 3D y desarrollo de tecnologías patentadas (Cloen Cordless Technology).</li>
                </ul>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4 border-b border-[var(--border-color)] pb-3 transition-colors duration-300">Proyectos Clave</h3>
                 <div className="space-y-4">
                    <p>Mis proyectos (TokenWatcher.app, Mintonaire.io, Mikit.ai) demuestran no solo mis habilidades técnicas avanzadas, sino también mi capacidad de liderazgo y ejecución estratégica en el entorno Web3, Blockchain e IA.</p>
                    <p>He trabajado también en el crecimiento y estrategia de sitios como <strong className="font-semibold text-[var(--text-color)]">Bercce.com</strong>, <strong className="font-semibold text-[var(--text-color)]">Broncesval.com</strong>, <strong className="font-semibold text-[var(--text-color)]">Storecloen.com</strong>, y <strong className="font-semibold text-[var(--text-color)]">BeCordless.com</strong>.</p>
                 </div>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4 border-b border-[var(--border-color)] pb-3 transition-colors duration-300">Tecnologías que Domino</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-[var(--text-color)] mb-2">Lenguajes & Frameworks:</h4>
                        <p><TechPill>Python</TechPill> <TechPill>FastAPI</TechPill> <TechPill>JavaScript</TechPill> <TechPill>React</TechPill> <TechPill>Next.js</TechPill> <TechPill>Tailwind CSS</TechPill></p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-[var(--text-color)] mb-2">Blockchain & Web3:</h4>
                        <p><TechPill>Solana</TechPill> <TechPill>Ethereum</TechPill> <TechPill>Smart Contracts</TechPill> <TechPill>Anchor</TechPill> <TechPill>Metaplex</TechPill></p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-[var(--text-color)] mb-2">Cloud & DevOps:</h4>
                        <p><TechPill>AWS</TechPill> <TechPill>Render</TechPill> <TechPill>Docker</TechPill> <TechPill>GitHub CI/CD</TechPill></p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-[var(--text-color)] mb-2">Marketing & Analytics:</h4>
                        <p><TechPill>Google Ads</TechPill> <TechPill>Meta Ads</TechPill> <TechPill>GA4</TechPill> <TechPill>Google Tag Manager</TechPill> <TechPill>SEO</TechPill></p>
                    </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;