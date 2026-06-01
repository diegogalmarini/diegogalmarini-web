import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBlog } from '../hooks/useBlog';
import { seedBlogPosts } from '../constants';
import { IoCalendarOutline, IoTimeOutline, IoArrowForward, IoSearchOutline, IoLogoLinkedin, IoLogoGithub, IoCheckmarkCircleOutline, IoReaderOutline } from 'react-icons/io5';
import { useLanguage } from '../contexts/LanguageContext';

const BlogPage: React.FC = () => {
  const { posts: dbPosts, loading } = useBlog(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { t, language } = useLanguage();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // Dynamic SEO / GEO Meta Tag & Schema Injection for the Blog home page
  useEffect(() => {
    // 1. Title
    const titleVal = language === 'en' 
      ? "Strategic Technology & AI Insights Blog - Diego Galmarini"
      : "Blog de Tecnología Estratégica, IA y CTIO Fraccional - Diego Galmarini";
    document.title = titleVal;

    // 2. Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    const descVal = language === 'en'
      ? "Explore in-depth articles, case studies, and engineering guides on Artificial Intelligence, SaaS architecture, fractional tech leadership, and agile growth by Diego Galmarini."
      : "Explora artículos detallados, estudios de caso y guías de ingeniería sobre Inteligencia Artificial, arquitectura SaaS, liderazgo tecnológico fraccional y crecimiento ágil por Diego Galmarini.";
    metaDescription.setAttribute('content', descVal);

    // 3. OpenGraph / Twitter
    const updateMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentVal);
    };

    updateMetaTag('property', 'og:title', titleVal);
    updateMetaTag('property', 'og:description', descVal);
    updateMetaTag('property', 'og:image', 'https://diegogalmarini.com/profile.png');
    updateMetaTag('property', 'og:url', window.location.href);
    updateMetaTag('name', 'twitter:title', titleVal);
    updateMetaTag('name', 'twitter:description', descVal);
    updateMetaTag('name', 'twitter:image', 'https://diegogalmarini.com/profile.png');

    // 4. JSON-LD CollectionPage Schema for SEO/GEO
    const existingSchema = document.getElementById('dynamic-blog-schema');
    if (existingSchema) existingSchema.remove();

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": titleVal,
      "description": descVal,
      "url": window.location.href,
      "about": {
        "@type": "Person",
        "name": "Diego Galmarini",
        "jobTitle": "CTIO Fraccional & Socio Tecnológico Estratégico",
        "url": "https://diegogalmarini.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "VERAILabs",
        "url": "https://verailabs.com"
      }
    };

    const script = document.createElement('script');
    script.id = 'dynamic-blog-schema';
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      document.title = "Diego Galmarini - Socio Tecnológico Estratégico & CTIO Fraccional";
      if (metaDescription) {
        metaDescription.setAttribute('content', "Diego Galmarini - Socio Tecnológico Estratégico y CTIO Fraccional. Ayudo a empresas y startups a diseñar, construir y escalar productos de alto impacto con IA, Blockchain y estrategias de crecimiento digital probadas.");
      }
      const schema = document.getElementById('dynamic-blog-schema');
      if (schema) schema.remove();
    };
  }, [language]);

  // Combine database posts and seed posts
  const posts = useMemo(() => {
    if (dbPosts && dbPosts.length > 0) {
      return dbPosts;
    }
    return seedBlogPosts.map((post, index) => ({
      id: `seed-${index}`,
      ...post,
      createdAt: post.publishedAt,
      updatedAt: post.publishedAt
    }));
  }, [dbPosts]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach(post => {
      const cat = (language === 'en' && post.categoryEn) ? post.categoryEn : post.category;
      if (cat) cats.add(cat);
    });
    return ['All', ...Array.from(cats)];
  }, [posts, language]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const displayTitle = (language === 'en' && post.titleEn) ? post.titleEn : post.title;
      const displayExcerpt = (language === 'en' && post.excerptEn) ? post.excerptEn : post.excerpt;
      const displayCategory = (language === 'en' && post.categoryEn) ? post.categoryEn : post.category;

      const matchesSearch = 
        displayTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        displayExcerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || displayCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, selectedCategory, language]);

  return (
    <div className="pt-20 pb-8 bg-gradient-to-b from-[var(--bg-color)] to-[var(--card-bg)] transition-colors duration-300">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[var(--primary-color)] opacity-5 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--text-color)] tracking-tight leading-tight">
            {language === 'en' ? 'Strategic Technology & ' : 'Blog de '}<span className="bg-gradient-to-r from-[var(--primary-color)] to-[#a855f7] bg-clip-text text-transparent">{language === 'en' ? 'AI Insights' : 'Tecnología & IA'}</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-base md:text-lg text-[var(--text-muted)] leading-relaxed font-light">
            {t('blog.subtitle')}
          </p>
        </div>

        {/* LinkedIn-style Asymmetric 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* LEFT COLUMN: Diego's LinkedIn-like Profile Card */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-xl transition-all duration-300">
              
              {/* Profile Card Header / Cover */}
              <div className="h-20 bg-gradient-to-r from-[rgba(59,130,246,0.15)] to-[rgba(168,85,247,0.15)] border-b border-[var(--border-color)] relative" />
              
              {/* Avatar Container */}
              <div className="px-6 pb-6 relative flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-[var(--card-bg)] shadow-xl bg-[var(--input-bg)] -mt-10 mb-4">
                  <img 
                    src="/DiegoG.webp" 
                    alt="Diego Galmarini" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h3 className="font-extrabold text-lg text-[var(--text-color)]">Diego Galmarini</h3>
                <p className="text-xs text-[var(--primary-color)] font-bold mt-1 uppercase tracking-wider">
                  {t('services.cto.title')}
                </p>
                <p className="text-xs text-[var(--text-muted)] font-light mt-2 leading-relaxed px-1">
                  {t('post.authorRole')}
                </p>
                
                <div className="w-full border-t border-[var(--border-color)] my-4 pt-4 flex justify-center space-x-6 text-[var(--text-color)] opacity-60">
                  <a href="https://www.linkedin.com/in/diegogalmarini/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary-color)] transition-colors">
                    <IoLogoLinkedin className="w-6 h-6" />
                  </a>
                  <a href="https://github.com/diegogalmarini" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary-color)] transition-colors">
                    <IoLogoGithub className="w-6 h-6" />
                  </a>
                </div>

                <div className="w-full border-t border-[var(--border-color)] pt-4">
                  <a 
                    href="#book" 
                    className="w-full btn-cta py-2.5 text-xs font-bold text-center block"
                  >
                    {t('nav.bookCall')}
                  </a>
                </div>
              </div>
            </div>
            
            {/* Quick Contact Info */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl text-center hidden lg:block">
              <span className="text-xs text-[var(--text-muted)] font-light uppercase tracking-wider block">Contacto Directo</span>
              <p className="text-sm font-bold text-[var(--text-color)] mt-2">diegogalmarini@gmail.com</p>
            </div>
          </div>

          {/* MIDDLE COLUMN: Feed / Articles List */}
          <div className="lg:col-span-2 space-y-8">
            
            {loading ? (
              <div className="flex justify-center items-center py-20 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] shadow-xl">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] p-8 shadow-xl">
                <p className="text-[var(--text-muted)] text-xl mb-4">{t('blog.search.noResults')}</p>
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                  className="px-6 py-2.5 bg-[var(--primary-color)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  {t('blog.search.reset')}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map(post => {
                  // Self-heal markdown image links in image URL field
                  let postImage = post.imageUrl;
                  if (postImage) {
                    const match = postImage.match(/!\[.*?\]\((.*?)\)/);
                    if (match) postImage = match[1];
                  }
                  const displayTitle = (language === 'en' && post.titleEn) ? post.titleEn : post.title;
                  const displayExcerpt = (language === 'en' && post.excerptEn) ? post.excerptEn : post.excerpt;
                  const displayCategory = (language === 'en' && post.categoryEn) ? post.categoryEn : post.category;

                  return (
                    <article 
                      key={post.id}
                      className="group flex flex-col md:flex-row bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-xl hover:shadow-2xl hover:border-[rgba(var(--primary-rgb),0.3)] transition-all duration-400"
                    >
                      {/* Post Cover image */}
                      <div className="relative w-full md:w-56 h-48 md:h-auto min-h-[200px] overflow-hidden bg-[var(--input-bg)] flex-shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-color)]">
                        {postImage && !imageErrors[post.id] ? (
                          <img 
                            src={postImage.includes('?') ? postImage : `${postImage}?v=2`} 
                            alt={displayTitle} 
                            onError={() => handleImageError(post.id)}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                          />
                        ) : (
                          // Premium geometric abstract blueprint pattern placeholder
                          <div className="w-full h-full bg-gradient-to-br from-[var(--input-bg)] to-[var(--card-bg)] flex flex-col items-center justify-center p-6 text-center select-none">
                            <svg className="w-10 h-10 text-[var(--text-muted)] opacity-30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--primary-color)] opacity-80">
                              {displayCategory || (language === 'en' ? 'INNOVATION' : 'INNOVACIÓN')}
                            </span>
                          </div>
                        )}
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-[var(--bg-color)] text-[var(--primary-color)] border border-[var(--border-color)] backdrop-blur-md">
                          {displayCategory || (language === 'en' ? 'AI' : 'IA')}
                        </span>
                      </div>
 
                      {/* Card Content */}
                      <div className="p-6 flex flex-col flex-grow justify-between">
                        <div>
                          {/* Meta */}
                          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-3 font-light">
                            <span className="flex items-center gap-1">
                              <IoCalendarOutline />
                              {new Date(post.publishedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <IoTimeOutline />
                              {post.readTime || '5 min'}
                            </span>
                          </div>
 
                          {/* Title */}
                          <h3 className="text-xl font-bold text-[var(--text-color)] mb-3 group-hover:text-[var(--primary-color)] transition-colors duration-300 line-clamp-2">
                            {displayTitle}
                          </h3>
 
                          {/* Excerpt */}
                          <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4 line-clamp-3 font-light">
                            {displayExcerpt}
                          </p>
                        </div>
 
                        {/* Read Link */}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border-color)]/60">
                          <Link 
                            to={language === 'en' ? `/en/blog/${post.slug}` : `/blog/${post.slug}`}
                            className="inline-flex items-center gap-2 text-[var(--primary-color)] font-extrabold text-sm group/btn"
                          >
                            {t('blog.card.readMore')}
                            <IoArrowForward className="group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                          </Link>
                          
                          <div className="flex gap-1">
                            {post.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-[var(--input-bg)] text-[var(--text-muted)] border border-[var(--border-color)] font-light">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Search, Categories & AI Search Visibility Widget */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            
            {/* Search widget */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-3xl shadow-xl transition-colors duration-300">
              <h4 className="text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider mb-4">Buscar</h4>
              <div className="relative w-full">
                <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder={t('blog.search.placeholder')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--primary-color)] transition-colors duration-300"
                />
              </div>
            </div>

            {/* Categories list */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-3xl shadow-xl">
              <h4 className="text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider mb-4">Categorías</h4>
              <div className="flex flex-col gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-[rgba(var(--primary-rgb),0.1)] text-[var(--primary-color)] border border-[rgba(var(--primary-rgb),0.2)]'
                        : 'hover:bg-[var(--input-bg)] text-[var(--text-muted)]'
                    }`}
                  >
                    {cat === 'All' ? 'Todos los artículos' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* AI SEO / GEO / AEO Visibility Status Card */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-3xl shadow-xl">
              <h4 className="text-xs font-extrabold text-[var(--primary-color)] uppercase tracking-widest mb-4 block">AI Search Audit (AEO / GEO)</h4>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-light flex items-center gap-1.5">
                    <IoCheckmarkCircleOutline className="text-green-500 w-4 h-4 flex-shrink-0" />
                    ChatGPT Search
                  </span>
                  <span className="font-extrabold text-green-600 dark:text-green-400">Cited</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-light flex items-center gap-1.5">
                    <IoCheckmarkCircleOutline className="text-green-500 w-4 h-4 flex-shrink-0" />
                    Perplexity AI
                  </span>
                  <span className="font-extrabold text-green-600 dark:text-green-400">100% index</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-light flex items-center gap-1.5">
                    <IoCheckmarkCircleOutline className="text-green-500 w-4 h-4 flex-shrink-0" />
                    Google AI Overviews
                  </span>
                  <span className="font-extrabold text-green-600 dark:text-green-400">Citable</span>
                </div>
                
                <div className="border-t border-[var(--border-color)]/60 my-3 pt-3 space-y-2">
                  <a 
                    href="/llms.txt" 
                    target="_blank" 
                    className="flex items-center justify-between text-[11px] text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <IoReaderOutline />
                      llms.txt map
                    </span>
                    <span className="font-extrabold text-green-600">Active</span>
                  </a>
                  <a 
                    href="/robots.txt" 
                    target="_blank" 
                    className="flex items-center justify-between text-[11px] text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <IoReaderOutline />
                      AI Crawlers (robots.txt)
                    </span>
                    <span className="font-extrabold text-green-600">Allowed</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BlogPage;
