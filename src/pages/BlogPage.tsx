import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBlog } from '../hooks/useBlog';
import { seedBlogPosts } from '../constants';
import { IoCalendarOutline, IoTimeOutline, IoArrowForward, IoSearchOutline } from 'react-icons/io5';

const BlogPage: React.FC = () => {
  const { posts: dbPosts, loading } = useBlog(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Combinar posts de base de datos y posts semilla si no hay posts en la BD
  const posts = useMemo(() => {
    if (dbPosts && dbPosts.length > 0) {
      return dbPosts;
    }
    // Si no hay posts en Firestore todavía, usar los datos semilla
    return seedBlogPosts.map((post, index) => ({
      id: `seed-${index}`,
      ...post,
      createdAt: post.publishedAt,
      updatedAt: post.publishedAt
    }));
  }, [dbPosts]);

  // Extraer categorías únicas
  const categories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach(post => {
      if (post.category) cats.add(post.category);
    });
    return ['All', ...Array.from(cats)];
  }, [posts]);

  // Filtrar artículos
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, selectedCategory]);

  return (
    <div className="py-24 bg-gradient-to-b from-[var(--bg-color)] to-[var(--card-bg)] min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[var(--primary-color)] opacity-10 rounded-full blur-3xl -z-10"></div>
          <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-[rgba(var(--primary-rgb),0.1)] text-[var(--primary-color)] border border-[rgba(var(--primary-rgb),0.2)] mb-4 inline-block">
            Pensamiento Estratégico e IA
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-[var(--text-color)] tracking-tight leading-tight">
            Blog de <span className="bg-gradient-to-r from-[var(--primary-color)] to-[#a855f7] bg-clip-text text-transparent">Tecnología & IA</span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[var(--text-muted)] leading-relaxed font-light">
            Estrategias de IA Aplicada, LLMs, Agentes Inteligentes, Alphafold y el Futuro de la Ingeniería de Software para CTIOs y Líderes de Negocio.
          </p>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="mb-12 flex flex-col md:flex-row gap-6 items-center justify-between bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] backdrop-blur-md shadow-xl transition-colors duration-300">
          {/* Categorías (Pills) */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-[var(--primary-color)] text-white shadow-lg shadow-[rgba(var(--primary-rgb),0.3)]'
                    : 'bg-[var(--input-bg)] text-[var(--text-color)] hover:bg-[var(--border-color)]'
                }`}
              >
                {cat === 'All' ? 'Todos' : cat}
              </button>
            ))}
          </div>

          {/* Búsqueda */}
          <div className="relative w-full md:w-80">
            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Buscar artículos o tags..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-color)] transition-colors duration-300"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] p-8">
            <p className="text-[var(--text-muted)] text-xl mb-4">No se encontraron artículos que coincidan con la búsqueda.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="px-6 py-2.5 bg-[var(--primary-color)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Resetear Filtros
            </button>
          </div>
        ) : (
          /* Grid de Artículos */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <article 
                key={post.id}
                className="group flex flex-col bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-lg hover:shadow-2xl hover:border-[rgba(var(--primary-rgb),0.4)] transition-all duration-500 hover:-translate-y-2 flex-grow"
              >
                {/* Imagen del Post */}
                <div className="relative h-56 w-full overflow-hidden bg-[var(--input-bg)]">
                  {post.imageUrl ? (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--primary-color)] to-[#a855f7] opacity-80 flex items-center justify-center">
                      <span className="text-4xl">💡</span>
                    </div>
                  )}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-lg text-xs font-bold bg-[var(--bg-color)] text-[var(--primary-color)] border border-[var(--border-color)] backdrop-blur-md">
                    {post.category || 'Tecnología'}
                  </span>
                </div>

                {/* Contenido de la Card */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Fecha y Tiempo de Lectura */}
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-4">
                    <span className="flex items-center gap-1">
                      <IoCalendarOutline className="text-sm" />
                      {new Date(post.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <IoTimeOutline className="text-sm" />
                      {post.readTime || '5 min read'}
                    </span>
                  </div>

                  {/* Título */}
                  <h3 className="text-xl font-bold text-[var(--text-color)] mb-3 line-clamp-2 group-hover:text-[var(--primary-color)] transition-colors duration-300">
                    {post.title}
                  </h3>

                  {/* Extracto */}
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6 line-clamp-3 font-light">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6 mt-auto">
                    {post.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag} 
                        className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--input-bg)] text-[var(--text-color)] border border-[var(--border-color)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Leer más link */}
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-[var(--primary-color)] font-bold text-sm group/btn"
                  >
                    Leer Artículo Completo
                    <IoArrowForward className="group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* CTA Banner de Consultoría */}
        <div className="mt-24 p-8 md:p-12 bg-gradient-to-r from-[rgba(59,130,246,0.1)] to-[rgba(168,85,247,0.1)] rounded-3xl border border-[rgba(var(--primary-rgb),0.2)] relative overflow-hidden shadow-2xl">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-[var(--primary-color)] opacity-5 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-3xl">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[rgba(var(--primary-rgb),0.15)] text-[var(--primary-color)] border border-[rgba(var(--primary-rgb),0.3)] mb-4 inline-block">
              Asesoría Tecnológica
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-color)] tracking-tight">
              ¿Listo para implementar estas tecnologías de IA en tu empresa?
            </h2>
            <p className="mt-4 text-base md:text-lg text-[var(--text-muted)] leading-relaxed font-light">
              No dejes que tu negocio se quede atrás en la era de los Agentes Autónomos y los LLMs corporativos. Agenda una sesión estratégica y tracemos juntos una arquitectura de IA a tu medida.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a 
                href="#book" 
                className="px-8 py-3.5 bg-[var(--primary-color)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center hover:opacity-95"
              >
                Reservar Sesión Estratégica
              </a>
              <Link 
                to="/services" 
                className="px-8 py-3.5 bg-[var(--input-bg)] text-[var(--text-color)] font-semibold rounded-xl border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors duration-300 text-center"
              >
                Explorar Servicios
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BlogPage;
