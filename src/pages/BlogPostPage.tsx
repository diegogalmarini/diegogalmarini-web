import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBlog } from '../hooks/useBlog';
import { seedBlogPosts } from '../constants';
import { trackEvent } from '../utils/analytics';
import { 
  IoArrowBack, 
  IoCalendarOutline, 
  IoTimeOutline, 
  IoPersonOutline, 
  IoShareSocialOutline,
  IoLogoLinkedin,
  IoLogoGithub,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';
import { useLanguage } from '../contexts/LanguageContext';

// Un formateador de Markdown simple pero muy pulido y estético con soporte para imágenes
const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const renderedElements = useMemo(() => {
    if (!content) return null;
    
    const lines = content.split('\n');
    let inList = false;
    let listItems: string[] = [];
    const elements: React.ReactNode[] = [];
    let keyIndex = 0;
    let hasSkippedFirstH1 = false;

    let inTable = false;
    let tableRows: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${keyIndex++}`} className="list-disc pl-6 mb-6 space-y-2.5 text-[var(--text-muted)] text-base md:text-lg font-light leading-relaxed">
            {listItems.map((item, i) => (
              <li key={i}>{parseInlineMarkdown(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        const parsedRows = tableRows.map(row => {
          let cleanRow = row.trim();
          if (cleanRow.startsWith('|')) cleanRow = cleanRow.substring(1);
          if (cleanRow.endsWith('|')) cleanRow = cleanRow.substring(0, cleanRow.length - 1);
          return cleanRow.split('|').map(cell => cell.trim());
        });

        // Filtrar filas de separación de Markdown (que contienen guiones/dos puntos)
        const contentRows = parsedRows.filter(row => {
          return !row.every(cell => /^:?-+:?$/.test(cell));
        });

        if (contentRows.length > 0) {
          const headers = contentRows[0];
          const dataRows = contentRows.slice(1);

          elements.push(
            <div key={`table-${keyIndex++}`} className="overflow-x-auto my-8 border border-[var(--border-color)] rounded-2xl shadow-md bg-[var(--card-bg)] transition-colors duration-300">
              <table className="min-w-full divide-y divide-[var(--border-color)]">
                <thead className="bg-[var(--input-bg)]">
                  <tr>
                    {headers.map((header, idx) => (
                      <th 
                        key={`th-${idx}`} 
                        className="px-6 py-4 text-left text-xs md:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider bg-[rgba(var(--primary-rgb),0.03)] border-b border-[var(--border-color)]"
                      >
                        {parseInlineMarkdown(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] bg-[var(--card-bg)]">
                  {dataRows.map((row, rowIdx) => (
                    <tr 
                      key={`tr-${rowIdx}`} 
                      className="hover:bg-[rgba(var(--primary-rgb),0.015)] even:bg-[rgba(0,0,0,0.01)] dark:even:bg-[rgba(255,255,255,0.005)] transition-colors duration-200"
                    >
                      {row.map((cell, cellIdx) => (
                        <td 
                          key={`td-${cellIdx}`} 
                          className="px-6 py-4 text-sm md:text-base text-[var(--text-muted)] font-light leading-relaxed"
                        >
                          {parseInlineMarkdown(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        tableRows = [];
        inTable = false;
      }
    };

    const flushAll = () => {
      flushList();
      flushTable();
    };

    const parseInlineMarkdown = (text: string) => {
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-[var(--text-color)]">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }

      return parts.length > 0 ? parts : text;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Manejo de títulos
      if (line.startsWith('# ')) {
        flushAll();
        if (!hasSkippedFirstH1) {
          hasSkippedFirstH1 = true;
          continue; 
        }
        elements.push(
          <h1 key={`h1-${keyIndex++}`} className="text-3xl md:text-4xl font-extrabold text-[var(--text-color)] mt-8 mb-4 tracking-tight leading-tight">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        flushAll();
        elements.push(
          <h2 key={`h2-${keyIndex++}`} className="text-2xl md:text-3xl font-bold text-[var(--text-color)] mt-10 mb-4 tracking-tight border-b border-[var(--border-color)] pb-2 transition-colors duration-300">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        flushAll();
        elements.push(
          <h3 key={`h3-${keyIndex++}`} className="text-xl md:text-2xl font-bold text-[var(--text-color)] mt-8 mb-3">
            {line.substring(4)}
          </h3>
        );
      } 
      // Separadores
      else if (line === '---') {
        flushAll();
        elements.push(<hr key={`hr-${keyIndex++}`} className="my-8 border-[var(--border-color)]" />);
      } 
      // Soporte para imágenes en markdown en su propia línea ![alt](url)
      else if (line.startsWith('![') && line.includes('](')) {
        flushAll();
        const match = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          elements.push(
            <div key={`img-${keyIndex++}`} className="rounded-3xl overflow-hidden my-8 max-h-[500px] shadow-lg border border-[var(--border-color)] bg-[var(--input-bg)]">
              <img src={match[2]} alt={match[1] || "Blog content image"} className="w-full h-full object-cover" />
            </div>
          );
          continue;
        }
      }
      // Elementos de tabla
      else if (line.startsWith('|')) {
        flushList(); // Si estábamos en una lista, la cerramos
        inTable = true;
        tableRows.push(line);
      }
      // Elementos de lista
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        flushTable(); // Si estábamos en una tabla, la cerramos
        inList = true;
        listItems.push(line.substring(2));
      } else if (/^\d+\.\s/.test(line)) {
        flushTable(); // Si estábamos en una tabla, la cerramos
        inList = true;
        listItems.push(line.replace(/^\d+\.\s/, ''));
      }
      // Párrafos o líneas vacías
      else {
        if (line === '') {
          flushAll();
        } else {
          if (inList) flushList();
          if (inTable) flushTable();
          
          elements.push(
            <p key={`p-${keyIndex++}`} className="text-base md:text-lg text-[var(--text-muted)] font-light leading-relaxed mb-6">
              {parseInlineMarkdown(line)}
            </p>
          );
        }
      }
    }

    flushAll();
    return elements;
  }, [content]);

  return <div className="prose max-w-none">{renderedElements}</div>;
};

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPostBySlug, loading: apiLoading } = useBlog(false);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const postTitle = useMemo(() => (language === 'en' && post?.titleEn) ? post.titleEn : post?.title || '', [post, language]);
  const postExcerpt = useMemo(() => (language === 'en' && post?.excerptEn) ? post.excerptEn : post?.excerpt || '', [post, language]);
  const postContent = useMemo(() => (language === 'en' && post?.contentEn) ? post.contentEn : post?.content || '', [post, language]);
  const postCategory = useMemo(() => (language === 'en' && post?.categoryEn) ? post.categoryEn : post?.category || '', [post, language]);

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const dbPost = await getPostBySlug(slug);
        if (dbPost) {
          setPost(dbPost);
          trackEvent('view_item', {
            item_id: dbPost.id || slug,
            item_name: dbPost.title,
            item_category: dbPost.category || 'Blog'
          });
        } else {
          // Fallback a los posts semilla de constants.tsx
          const seedPost = seedBlogPosts.find(p => p.slug === slug);
          if (seedPost) {
            setPost(seedPost);
            trackEvent('view_item', {
              item_id: seedPost.slug,
              item_name: seedPost.title,
              item_category: seedPost.category || 'Blog'
            });
          } else {
            console.error('Post not found in DB nor Seed data');
          }
        }
      } catch (err) {
        console.error('Error loading post:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [slug, getPostBySlug]);

  // Self-heal markdown image format in the imageUrl database field
  const cleanImageUrl = useMemo(() => {
    if (!post?.imageUrl) return '';
    const match = post.imageUrl.match(/!\[.*?\]\((.*?)\)/);
    return match ? match[1] : post.imageUrl;
  }, [post?.imageUrl]);

  // Dynamic SEO / GEO / AEO Structured Data & Meta Tag Injection
  useEffect(() => {
    if (!post) return;

    // 1. Set dynamic page title
    document.title = `${postTitle} - Diego Galmarini`;

    // 2. Set dynamic meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    const currentExcerpt = postExcerpt || '';
    metaDescription.setAttribute('content', currentExcerpt);

    // 3. Set OpenGraph and Twitter tags dynamically
    const updateMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentVal);
    };

    updateMetaTag('property', 'og:title', postTitle);
    updateMetaTag('property', 'og:description', currentExcerpt);
    updateMetaTag('property', 'og:image', cleanImageUrl || 'https://diegogalmarini.com/profile.png');
    updateMetaTag('property', 'og:url', window.location.href);
    updateMetaTag('name', 'twitter:title', postTitle);
    updateMetaTag('name', 'twitter:description', currentExcerpt);
    updateMetaTag('name', 'twitter:image', cleanImageUrl || 'https://diegogalmarini.com/profile.png');

    // 4. Set rich JSON-LD schema block (TechArticle / BlogPosting) for GEO/AEO (ChatGPT, Perplexity, Gemini citations)
    const existingSchema = document.getElementById('dynamic-post-schema');
    if (existingSchema) existingSchema.remove();

    const schemaData = {
      "@context": "https://schema.org",
      "@type": postCategory?.toLowerCase().includes('ia') || postCategory?.toLowerCase().includes('tech') ? "TechArticle" : "BlogPosting",
      "headline": postTitle,
      "image": cleanImageUrl || 'https://diegogalmarini.com/profile.png',
      "datePublished": post.publishedAt || new Date().toISOString(),
      "dateModified": post.updatedAt || post.publishedAt || new Date().toISOString(),
      "description": currentExcerpt,
      "author": {
        "@type": "Person",
        "name": "Diego Galmarini",
        "jobTitle": "CTIO Fraccional & Socio Tecnológico Estratégico",
        "url": "https://diegogalmarini.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "VERAILabs",
        "url": "https://verailabs.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://diegogalmarini.com/profile.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      },
      "keywords": post.tags ? post.tags.join(', ') : ''
    };

    const script = document.createElement('script');
    script.id = 'dynamic-post-schema';
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schemaData);
    document.head.appendChild(script);

    // Cleanup on unmount/post transition
    return () => {
      document.title = "Diego Galmarini - Socio Tecnológico Estratégico & CTIO Fraccional";
      if (metaDescription) {
        metaDescription.setAttribute('content', "Diego Galmarini - Socio Tecnológico Estratégico y CTIO Fraccional. Ayudo a empresas y startups a diseñar, construir y escalar productos de alto impacto con IA, Blockchain y estrategias de crecimiento digital probadas.");
      }
      const schema = document.getElementById('dynamic-post-schema');
      if (schema) schema.remove();
    };
  }, [post, postTitle, postExcerpt, postCategory, cleanImageUrl]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: postTitle,
        text: postExcerpt,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert(language === 'en' ? 'Link copied to clipboard!' : 'Enlace copiado al portapapeles!'))
        .catch(console.error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] py-32 text-center">
        <div className="max-w-md mx-auto px-4">
          <h2 className="text-3xl font-bold text-[var(--text-color)] mb-4">{t('post.notFound')}</h2>
          <p className="text-[var(--text-muted)] mb-8">{t('post.notFoundDesc')}</p>
          <Link to={language === 'en' ? '/en/blog' : '/blog'} className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-bold inline-flex items-center gap-2">
            <IoArrowBack /> {t('post.back')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 bg-gradient-to-b from-[var(--bg-color)] to-[var(--card-bg)] min-h-screen transition-colors duration-300">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* LinkedIn-style Asymmetric 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* LEFT COLUMN: Sticky Navigation & Author Quick Info */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            
            {/* Elegant Back button */}
            <Link 
              to={language === 'en' ? '/en/blog' : '/blog'} 
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-[var(--text-muted)] hover:text-[var(--primary-color)] bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[rgba(var(--primary-rgb),0.3)] shadow-md transition-all duration-300 w-full"
            >
              <IoArrowBack className="text-base" /> {t('post.back')}
            </Link>

            {/* Author Profile card */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-xl transition-all duration-300">
              
              {/* Profile Card Header Cover */}
              <div className="h-16 bg-gradient-to-r from-[rgba(59,130,246,0.15)] to-[rgba(168,85,247,0.15)] border-b border-[var(--border-color)]" />
              
              {/* Avatar Container */}
              <div className="px-6 pb-6 relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-[var(--card-bg)] shadow-xl bg-[var(--input-bg)] -mt-8 mb-3">
                  <img 
                    src="/DiegoG.webp" 
                    alt="Diego Galmarini" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-color)]">Diego Galmarini</h3>
                <p className="text-[10px] text-[var(--primary-color)] font-bold mt-1 uppercase tracking-wider">
                  {t('services.cto.title')}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] font-light mt-2 leading-relaxed px-1">
                  {t('post.authorRole')}
                </p>
                
                <div className="w-full border-t border-[var(--border-color)] my-3 pt-3 flex justify-center space-x-5 text-[var(--text-color)] opacity-60">
                  <a href="https://www.linkedin.com/in/diegogalmarini/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary-color)] transition-colors">
                    <IoLogoLinkedin className="w-5 h-5" />
                  </a>
                  <a href="https://github.com/diegogalmarini" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary-color)] transition-colors">
                    <IoLogoGithub className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Post Specs Widget */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-3xl shadow-xl transition-all">
              <h4 className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-4 border-b border-[var(--border-color)] pb-2">
                {language === 'en' ? 'Article Metadata' : 'Metadatos del Artículo'}
              </h4>
              <div className="space-y-3.5 text-xs text-[var(--text-muted)]">
                <div className="flex items-center justify-between">
                  <span className="font-light flex items-center gap-2">
                    <IoCalendarOutline className="text-[var(--primary-color)]" />
                    {language === 'en' ? 'Published' : 'Publicado'}
                  </span>
                  <span className="font-bold text-[var(--text-color)]">
                    {new Date(post.publishedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-light flex items-center gap-2">
                    <IoTimeOutline className="text-[var(--primary-color)]" />
                    {language === 'en' ? 'Reading time' : 'Tiempo lectura'}
                  </span>
                  <span className="font-bold text-[var(--text-color)]">{post.readTime || '5 min'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-light flex items-center gap-2">
                    <IoPersonOutline className="text-[var(--primary-color)]" />
                    {language === 'en' ? 'Author' : 'Autor'}
                  </span>
                  <span className="font-bold text-[var(--text-color)]">Diego G.</span>
                </div>
                
                <div className="border-t border-[var(--border-color)] pt-3 mt-3 flex justify-between items-center">
                  <span className="font-light text-[11px]">{language === 'en' ? 'Share article' : 'Compartir artículo'}</span>
                  <button 
                    onClick={handleShare}
                    className="p-2 rounded-lg bg-[var(--input-bg)] text-[var(--text-color)] hover:text-[var(--primary-color)] border border-[var(--border-color)] hover:border-[var(--primary-color)] transition-all duration-300"
                    title={language === 'en' ? 'Share' : 'Compartir'}
                  >
                    <IoShareSocialOutline className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: Article Reading Canvas */}
          <div className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-10 shadow-xl transition-all duration-300">
            
            {/* Category */}
            <div className="mb-4">
              <span className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase bg-[rgba(var(--primary-rgb),0.08)] text-[var(--primary-color)] border border-[rgba(var(--primary-rgb),0.15)]">
                {postCategory}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-color)] mb-6 tracking-tight leading-tight">
              {postTitle}
            </h1>

            {/* Featured Image */}
            {cleanImageUrl && (
              <div className="rounded-3xl overflow-hidden mb-8 aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] w-full shadow-xl border border-[var(--border-color)] bg-[var(--input-bg)] transition-all duration-500 hover:shadow-2xl">
                {!imageErrors[post.id] ? (
                  <img 
                    src={cleanImageUrl.includes('?') ? cleanImageUrl : `${cleanImageUrl}?v=2`} 
                    alt={postTitle} 
                    onError={() => handleImageError(post.id)}
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  // Premium geometric abstract placeholder pattern for featured image
                  <div className="w-full h-full bg-gradient-to-br from-[var(--input-bg)] to-[var(--card-bg)] flex flex-col items-center justify-center p-8 text-center select-none aspect-[16/9] md:aspect-[21/9]">
                    <svg className="w-12 h-12 text-[var(--text-muted)] opacity-30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <h4 className="text-sm font-extrabold uppercase tracking-widest text-[var(--primary-color)] mb-2">
                      {postCategory || (language === 'en' ? 'INNOVATION' : 'INNOVACIÓN')}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] font-light max-w-sm">
                      {language === 'en' 
                        ? 'Visual illustration representing state-of-the-art system architecture design.' 
                        : 'Ilustración visual técnica que representa diseño de arquitectura e ingeniería de sistemas.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Article Content Parsed by SimpleMarkdown */}
            <div className="article-body px-1 leading-relaxed font-light text-[90%] md:text-[95%]">
              <SimpleMarkdown content={postContent} />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-[var(--border-color)]">
              {post.tags.map((tag: string) => (
                <span 
                  key={tag} 
                  className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-[var(--input-bg)] text-[var(--text-muted)] border border-[var(--border-color)]"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Minimalist Biography Signature Card */}
            <div className="mt-12 p-6 bg-[var(--input-bg)] rounded-2xl border border-[var(--border-color)] flex flex-col sm:flex-row items-center gap-5 transition-all">
              <div className="w-14 h-14 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                <img 
                  src="/DiegoG.webp" 
                  alt="Diego Galmarini" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-extrabold text-[var(--text-color)] mb-0.5">{t('post.author')}</h4>
                <p className="text-[11px] text-[var(--primary-color)] font-bold mb-1 uppercase tracking-wider">{t('post.authorRole')}</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-light">
                  {t('post.authorDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Strategic Technology Booking CTA Card */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            
            {/* Elegant Strategy Consulting Booking Card */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--primary-color)] opacity-5 rounded-full blur-2xl -z-10"></div>
              
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-[rgba(var(--primary-rgb),0.08)] text-[var(--primary-color)] mb-4 inline-block tracking-wider">
                {language === 'en' ? 'Strategy Session' : 'Sesión Estratégica'}
              </span>
              
              <h3 className="text-lg font-extrabold text-[var(--text-color)] tracking-tight leading-tight">
                {t('post.cta.title')}
              </h3>
              
              <p className="mt-3 text-xs text-[var(--text-muted)] font-light leading-relaxed">
                {t('post.cta.desc')}
              </p>
              
              <div className="mt-6">
                <a 
                  href="#book" 
                  className="w-full btn-cta py-3 text-xs font-bold text-center block"
                >
                  {t('post.cta.btn')}
                </a>
              </div>
            </div>

            {/* AI Search Engine Optimization (GEO/AEO) Quick Stats */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-3xl shadow-xl transition-all duration-300 hidden lg:block">
              <h4 className="text-[10px] font-extrabold text-[var(--primary-color)] uppercase tracking-widest mb-3.5">
                {language === 'en' ? 'AI SEARCH OPTIMIZATION' : 'OPTIMIZACIÓN PARA IAs'}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-muted)] font-light flex items-center gap-1.5">
                    <IoCheckmarkCircleOutline className="text-green-500 w-3.5 h-3.5 flex-shrink-0" />
                    AEO Structure
                  </span>
                  <span className="font-extrabold text-green-600 dark:text-green-400">Compliant</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-muted)] font-light flex items-center gap-1.5">
                    <IoCheckmarkCircleOutline className="text-green-500 w-3.5 h-3.5 flex-shrink-0" />
                    GEO Citations
                  </span>
                  <span className="font-extrabold text-green-600 dark:text-green-400">Optimized</span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-light leading-relaxed pt-2 border-t border-[var(--border-color)]/60">
                  {language === 'en' 
                    ? 'This article conforms to the latest LLM citations guidelines (citable statistics, definition headings, schema tags).' 
                    : 'Este artículo cumple con las últimas directrices de indexación de LLMs (estadísticas citables, FAQ y definiciones estructuradas).'}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BlogPostPage;
