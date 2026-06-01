import React from 'react';
import { IoPersonCircleOutline, IoLogoLinkedin, IoLogoGithub, IoLogoTwitter, IoLogoInstagram } from 'react-icons/io5';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t, language } = useLanguage();

  return (
    <div className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-16 items-start">
          <div className="lg:col-span-2 sticky top-28 space-y-8">
            <div className="group rounded-3xl shadow-2xl shadow-black/20 w-full aspect-square overflow-hidden bg-[var(--input-bg)]">
                <img
                    src="/Diego-Galmarini-OS.webp"
                    alt={language === 'en' ? 'Profile picture of Diego Galmarini' : 'Foto de perfil de Diego Galmarini'}
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                />
            </div>
             <div className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-3xl shadow-2xl shadow-[var(--shadow-color)] p-6 flex items-center space-x-4 transition-colors duration-300">
                <IoPersonCircleOutline className="text-5xl text-[var(--primary-color)]" />
                <div className="text-left">
                    <p className="font-bold text-lg text-[var(--text-color)]">{t('services.cto.title')}</p>
                    <p className="text-base text-[var(--text-muted)]">{t('post.authorRole')}</p>
                </div>
            </div>
            <div className="flex justify-around pt-2">
                {socialLinks.map(link => (
                    <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={language === 'en' ? `Diego Galmarini's profile on ${link.label}` : `Perfil de Diego Galmarini en ${link.label}`}
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
                {t('about.headline')}
            </h2>

            <div className="space-y-12 text-lg text-[var(--text-muted)] leading-relaxed">
              <section>
                <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4 border-b border-[var(--border-color)] pb-3 transition-colors duration-300">
                  {t('about.title')}
                </h3>
                <p>
                  {t('about.bio1')}
                </p>
                <p className="mt-4">
                  {t('about.bio2')}
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4 border-b border-[var(--border-color)] pb-3 transition-colors duration-300">
                  {t('about.expertise.title')}
                </h3>
                <ul className="space-y-4">
                  <li><strong className="font-semibold text-[var(--text-color)]">{t('about.expertise.1').split(':')[0]}:</strong>{t('about.expertise.1').split(':')[1]}</li>
                  <li><strong className="font-semibold text-[var(--text-color)]">{t('about.expertise.2').split(':')[0]}:</strong>{t('about.expertise.2').split(':')[1]}</li>
                  <li><strong className="font-semibold text-[var(--text-color)]">{t('about.expertise.3').split(':')[0]}:</strong>{t('about.expertise.3').split(':')[1]}</li>
                  <li><strong className="font-semibold text-[var(--text-color)]">{t('about.expertise.4').split(':')[0]}:</strong>{t('about.expertise.4').split(':')[1]}</li>
                </ul>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4 border-b border-[var(--border-color)] pb-3 transition-colors duration-300">
                  {t('about.projects.title')}
                </h3>
                 <div className="space-y-4">
                    <p>{t('about.projects.desc')}</p>
                 </div>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4 border-b border-[var(--border-color)] pb-3 transition-colors duration-300">
                  {t('about.tech.title')}
                </h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-[var(--text-color)] mb-2">
                          {language === 'en' ? 'Languages & Frameworks:' : 'Lenguajes & Frameworks:'}
                        </h4>
                        <p><TechPill>Python</TechPill> <TechPill>FastAPI</TechPill> <TechPill>JavaScript</TechPill> <TechPill>React</TechPill> <TechPill>Next.js</TechPill> <TechPill>Tailwind CSS</TechPill></p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-[var(--text-color)] mb-2 font-bold">
                          {language === 'en' ? 'Blockchain & Web3:' : 'Blockchain & Web3:'}
                        </h4>
                        <p><TechPill>Solana</TechPill> <TechPill>Ethereum</TechPill> <TechPill>Smart Contracts</TechPill> <TechPill>Anchor</TechPill> <TechPill>Metaplex</TechPill></p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-[var(--text-color)] mb-2 font-bold">
                          {language === 'en' ? 'Cloud & DevOps:' : 'Cloud & DevOps:'}
                        </h4>
                        <p><TechPill>AWS</TechPill> <TechPill>Render</TechPill> <TechPill>Docker</TechPill> <TechPill>GitHub CI/CD</TechPill></p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-[var(--text-color)] mb-2 font-bold">
                          {language === 'en' ? 'Marketing & Analytics:' : 'Marketing & Analytics:'}
                        </h4>
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