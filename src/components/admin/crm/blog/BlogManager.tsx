import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBlog } from '../../../../hooks/useBlog';
import { seedBlogPosts } from '../../../../constants';
import { 
  DocumentPlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../ui/LoadingSpinner';
import Button from '../ui/Button';

interface BlogFormProps {
  post?: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const BlogForm: React.FC<BlogFormProps> = ({ post, onSave, onCancel }) => {
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [category, setCategory] = useState(post?.category || 'Inteligencia Artificial');
  const [tagsInput, setTagsInput] = useState(post?.tags?.join(', ') || '');
  const [readTime, setReadTime] = useState(post?.readTime || '5 min read');
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || '');
  const [isActive, setIsActive] = useState(post?.isActive !== false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generar slug a partir del título
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!post) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !excerpt || !content) {
      setError('Por favor completa todos los campos requeridos (Título, Slug, Resumen, Contenido)');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const postData = {
        title,
        slug,
        excerpt,
        content,
        category,
        tags,
        readTime,
        imageUrl,
        isActive,
        publishedAt: post?.publishedAt || new Date().toISOString(),
        author: post?.author || 'Diego Galmarini'
      };

      await onSave(postData);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el artículo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Título *</label>
          <input
            type="text"
            required
            value={title}
            onChange={handleTitleChange}
            placeholder="Título del artículo"
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (URL) *</label>
          <input
            type="text"
            required
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="slug-del-articulo"
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría *</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="Inteligencia Artificial">Inteligencia Artificial</option>
            <option value="Ciencia e IA">Ciencia e IA</option>
            <option value="Arquitectura de Software">Arquitectura de Software</option>
            <option value="Marketing de IA">Marketing de IA</option>
            <option value="Estrategia CTIO">Estrategia CTIO</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tiempo de Lectura</label>
          <input
            type="text"
            value={readTime}
            onChange={e => setReadTime(e.target.value)}
            placeholder="Ej: 5 min read"
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
          <div className="flex items-center mt-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-900 font-medium">
              Publicado y Activo
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">URL de la Imagen de Portada</label>
        <input
          type="text"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          placeholder="https://images.unsplash.com/photo-..."
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (Separados por coma)</label>
        <input
          type="text"
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
          placeholder="Anthropic, Claude, Agents, LLM"
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Extracto / Resumen Corto *</label>
        <textarea
          required
          rows={3}
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          placeholder="Un resumen corto de 2-3 frases para las listas..."
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-semibold text-gray-700">Cuerpo del Artículo (Markdown) *</label>
          <span className="text-xs text-gray-400">Soporta formateado simple de Markdown</span>
        </div>
        <textarea
          required
          rows={12}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="# Título del artículo&#10;&#10;Contenido detallado en Markdown..."
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono resize-y"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
        <Button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2"
          disabled={submitting}
        >
          {submitting ? <LoadingSpinner size="sm" /> : 'Guardar Artículo'}
        </Button>
      </div>
    </form>
  );
};

const BlogManager: React.FC = () => {
  const { posts, loading, error, createPost, updatePost, deletePost, refetch } = useBlog(true);
  const [formMode, setFormMode] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);

  const handleCreate = () => {
    setSelectedPost(null);
    setFormMode('create');
  };

  const handleEdit = (post: any) => {
    setSelectedPost(post);
    setFormMode('edit');
  };

  const handleSave = async (postData: any) => {
    if (formMode === 'create') {
      const res = await createPost(postData);
      if (res.success) {
        setFormMode('list');
      } else {
        throw new Error(res.error);
      }
    } else if (formMode === 'edit' && selectedPost) {
      const res = await updatePost(selectedPost.id, postData);
      if (res.success) {
        setFormMode('list');
      } else {
        throw new Error(res.error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este artículo permanentemente?')) {
      await deletePost(id);
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      console.log('🌱 Seeding database with seed blog posts...');
      for (const seedPost of seedBlogPosts) {
        // Verificar si ya existe un post con el mismo slug en Firestore antes de insertarlo
        const duplicate = posts.find(p => p.slug === seedPost.slug);
        if (!duplicate) {
          await createPost(seedPost);
        }
      }
      alert('Base de datos inicializada reactivamente con los artículos semilla.');
      await refetch();
    } catch (err) {
      console.error('Error seeding database:', err);
      alert('Ocurrió un error al poblar los datos.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>✍️</span> Gestor de Artículos (Blog IA)
          </h2>
          <p className="text-sm text-gray-500 mt-1">Escribe, edita y publica artículos para tu live CV y consultoría.</p>
        </div>

        {formMode === 'list' && (
          <div className="flex gap-2">
            {posts.length === 0 && (
              <button
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="inline-flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 bg-blue-50 font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors duration-300"
              >
                <ArrowPathIcon className={`h-4 w-4 ${seeding ? 'animate-spin' : ''}`} />
                {seeding ? 'Poblando...' : 'Poblar Artículos Semilla'}
              </button>
            )}
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md shadow-blue-100"
            >
              <DocumentPlusIcon className="h-5 w-5" />
              Escribir Artículo
            </button>
          </div>
        )}
      </div>

      {formMode === 'list' ? (
        loading && posts.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error && posts.length === 0 ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
            Error: {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-8">
            <p className="text-gray-500 text-base mb-6">No hay artículos cargados en tu blog de Firestore.</p>
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all duration-300"
            >
              {seeding ? 'Cargando...' : 'Cargar Artículos Semilla sobre IA'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Artículo</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Publicación</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {post.imageUrl ? (
                          <img src={post.imageUrl} alt="" className="w-10 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0">📝</div>
                        )}
                        <div className="max-w-xs md:max-w-md truncate">
                          <div className="text-sm font-bold text-gray-900 truncate">{post.title}</div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">{post.excerpt}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-800">
                        {post.category || 'Inteligencia Artificial'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.isActive !== false ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-green-50 text-green-700 border border-green-200">
                          <CheckCircleIcon className="h-4 w-4" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-50 text-gray-600 border border-gray-200">
                          <XCircleIcon className="h-4 w-4" />
                          Borrador
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link 
                          to={`/blog/${post.slug}`} 
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Vista Previa Pública"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="bg-gray-50 rounded-2xl border border-gray-150 p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            {formMode === 'create' ? 'Crear Nuevo Artículo' : 'Editar Artículo'}
          </h3>
          <BlogForm
            post={selectedPost}
            onSave={handleSave}
            onCancel={() => setFormMode('list')}
          />
        </div>
      )}
    </div>
  );
};

export default BlogManager;
