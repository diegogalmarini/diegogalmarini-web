import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBlog } from '../hooks/useBlog';
import { seedBlogPosts } from '../constants';
import { IoArrowBack, IoCalendarOutline, IoTimeOutline, IoPersonOutline, IoShareSocialOutline } from 'react-icons/io5';

// Un formateador de Markdown simple pero muy pulido y estético
const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const renderedElements = useMemo(() => {
    if (!content) return null;
    
    const lines = content.split('\n');
    let inList = false;
    let listItems: string[] = [];
    const elements: React.ReactNode[] = [];
    let keyIndex = 0;

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

    const parseInlineMarkdown = (text: string) => {
      // Reemplazo simple para **negrita**
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
        flushList();
        elements.push(
          <h1 key={`h1-${keyIndex++}`} className="text-3xl md:text-4xl font-extrabold text-[var(--text-color)] mt-8 mb-4 tracking-tight leading-tight">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${keyIndex++}`} className="text-2xl md:text-3xl font-bold text-[var(--text-color)] mt-10 mb-4 tracking-tight border-b border-[var(--border-color)] pb-2 transition-colors duration-300">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${keyIndex++}`} className="text-xl md:text-2xl font-bold text-[var(--text-color)] mt-8 mb-3">
            {line.substring(4)}
          </h3>
        );
      } 
      // Separadores
      else if (line === '---') {
        flushList();
        elements.push(<hr key={`hr-${keyIndex++}`} className="my-8 border-[var(--border-color)]" />);
      } 
      // Elementos de lista
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        inList = true;
        listItems.push(line.substring(2));
      } else if (/^\d+\.\s/.test(line)) {
        inList = true;
        listItems.push(line.replace(/^\d+\.\s/, ''));
      }
      // Párrafos o líneas vacías
      else {
        if (line === '') {
          flushList();
        } else {
          if (inList) {
            // Continuación de lista o terminarla si no encaja
            flushList();
          }
          elements.push(
            <p key={`p-${keyIndex++}`} className="text-base md:text-lg text-[var(--text-muted)] font-light leading-relaxed mb-6">
              {parseInlineMarkdown(line)}
            </p>
          );
        }
      }
    }

    flushList();
    return elements;
  }, [content]);

  return <div className="prose max-w-none">{renderedElements}</div>;
};

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPostBySlug, loading: apiLoading } = useBlog(false);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const dbPost = await getPostBySlug(slug);
        if (dbPost) {
          setPost(dbPost);
        } else {
          // Fallback a los posts semilla de constants.tsx
          const seedPost = seedBlogPosts.find(p => p.slug === slug);
          if (seedPost) {
            setPost(seedPost);
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Copiar al portapapeles
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Enlace copiado al portapapeles'))
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
          <h2 className="text-3xl font-bold text-[var(--text-color)] mb-4">Artículo no encontrado</h2>
          <p className="text-[var(--text-muted)] mb-8">El enlace al artículo que estás buscando no existe o ha sido eliminado.</p>
          <Link to="/blog" className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-bold inline-flex items-center gap-2">
            <IoArrowBack /> Volver al Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 bg-[var(--bg-color)] min-h-screen transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Enlace de regreso */}
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--primary-color)] mb-10 transition-colors"
        >
          <IoArrowBack className="text-base" /> Volver a Artículos
        </Link>

        {/* Metadatos superiores */}
        <div className="mb-6">
          <span className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase bg-[rgba(var(--primary-rgb),0.1)] text-[var(--primary-color)] border border-[rgba(var(--primary-rgb),0.2)]">
            {post.category}
          </span>
        </div>

        {/* Título Principal */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-color)] mb-8 tracking-tight leading-tight">
          {post.title}
        </h1>

        {/* Autor, Fecha, Lectura y Compartir */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-[var(--border-color)] pb-8 mb-12 transition-colors duration-300">
          <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <IoPersonOutline className="text-base text-[var(--primary-color)]" />
              <span className="font-semibold">{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <IoCalendarOutline className="text-base" />
              {new Date(post.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <IoTimeOutline className="text-base" />
              {post.readTime}
            </div>
          </div>

          <button 
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-[var(--input-bg)] text-[var(--text-color)] hover:text-[var(--primary-color)] border border-[var(--border-color)] hover:border-[var(--primary-color)] transition-all duration-300"
            title="Compartir Artículo"
          >
            <IoShareSocialOutline className="text-lg" />
          </button>
        </div>

        {/* Imagen Destacada */}
        {post.imageUrl && (
          <div className="rounded-3xl overflow-hidden mb-12 max-h-[450px] shadow-2xl border border-[var(--border-color)]">
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Contenido del Artículo */}
        <div className="article-body px-1">
          <SimpleMarkdown content={post.content} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-[var(--border-color)] transition-colors duration-300">
          {post.tags.map((tag: string) => (
            <span 
              key={tag} 
              className="px-3.5 py-1 rounded-lg text-xs font-semibold bg-[var(--input-bg)] text-[var(--text-color)] border border-[var(--border-color)]"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Autor Card */}
        <div className="mt-16 p-8 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] backdrop-blur-md flex flex-col sm:flex-row items-center gap-6 transition-all duration-300">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[var(--primary-color)] to-[#a855f7] flex items-center justify-center text-4xl shadow-xl flex-shrink-0 text-white font-extrabold">
            DG
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-[var(--text-color)] mb-1">Escrito por Diego Galmarini</h3>
            <p className="text-sm text-[var(--primary-color)] font-semibold mb-2">CTIO Fraccional & Consultor de IA Estratégica</p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed font-light">
              Asesoro a fundadores de startups y ejecutivos corporativos en la implementación de software moderno, automatizaciones basadas en agentes de IA y arquitecturas tecnológicas escalables.
            </p>
          </div>
        </div>

        {/* CTA Directo a Booking en el Pie */}
        <div className="mt-20 p-8 md:p-12 bg-gradient-to-r from-[rgba(168,85,247,0.1)] to-[rgba(59,130,246,0.1)] rounded-3xl border border-[rgba(var(--primary-rgb),0.2)] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--primary-color)] opacity-5 rounded-full blur-3xl -z-10"></div>
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase bg-[rgba(var(--primary-rgb),0.1)] text-[var(--primary-color)] mb-4 inline-block tracking-wide">
              Sesión de Estrategia Tecnológica
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-color)] tracking-tight leading-tight">
              ¿Quieres evaluar cómo aplicar estos conceptos a tu producto específico?
            </h2>
            <p className="mt-4 text-[var(--text-muted)] font-light leading-relaxed">
              Discutamos tu roadmap tecnológico, resolvamos cuellos de botella en tu arquitectura de software e implementemos automatizaciones de IA prácticas que aumenten tu margen operativo.
            </p>
            <div className="mt-8">
              <a 
                href="#book" 
                className="px-8 py-3.5 bg-[var(--primary-color)] text-white font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-block hover:opacity-95"
              >
                Agendar Mi Consulta Estratégica 1-on-1
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BlogPostPage;
