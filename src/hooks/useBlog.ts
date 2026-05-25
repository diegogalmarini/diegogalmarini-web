import { useState, useCallback, useEffect } from 'react';
import { BlogPost, ApiResponse } from '../types/crm';
import { blogService } from '../services/firestore';

export const useBlog = (includeInactive = false) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.getAll(includeInactive);
      if (response.success && response.data) {
        setPosts(response.data);
      } else {
        setError(response.error || 'Error al cargar artículos');
      }
    } catch (err: any) {
      console.error('Error fetching blog posts hook:', err);
      setError(err?.message || 'Error inesperado al cargar artículos');
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  const createPost = useCallback(async (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<BlogPost>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.create(postData);
      if (response.success && response.data) {
        setPosts(prev => [response.data!, ...prev]);
      } else {
        setError(response.error || 'Error al crear artículo');
      }
      return response;
    } catch (err: any) {
      console.error('Error creating post hook:', err);
      const errResponse = { success: false, error: err?.message || 'Error inesperado al crear artículo' };
      setError(errResponse.error);
      return errResponse;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (id: string, updates: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.update(id, updates);
      if (response.success && response.data) {
        setPosts(prev => prev.map(p => p.id === id ? response.data! : p));
      } else {
        setError(response.error || 'Error al actualizar artículo');
      }
      return response;
    } catch (err: any) {
      console.error('Error updating post hook:', err);
      const errResponse = { success: false, error: err?.message || 'Error inesperado al actualizar artículo' };
      setError(errResponse.error);
      return errResponse;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (id: string): Promise<ApiResponse<void>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.delete(id);
      if (response.success) {
        setPosts(prev => prev.filter(p => p.id !== id));
      } else {
        setError(response.error || 'Error al eliminar artículo');
      }
      return response;
    } catch (err: any) {
      console.error('Error deleting post hook:', err);
      const errResponse = { success: false, error: err?.message || 'Error inesperado al eliminar artículo' };
      setError(errResponse.error);
      return errResponse;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPostBySlug = useCallback(async (slug: string): Promise<BlogPost | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.getBySlug(slug);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Artículo no encontrado');
        return null;
      }
    } catch (err: any) {
      console.error('Error getting post by slug hook:', err);
      setError(err?.message || 'Error inesperado al obtener artículo');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    createPost,
    updatePost,
    deletePost,
    getPostBySlug
  };
};
