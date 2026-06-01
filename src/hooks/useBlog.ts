import { useState, useCallback, useEffect } from 'react';
import { BlogPost, ApiResponse } from '../types/crm';
import { blogService } from '../services/firestore';
import { useFirestoreErrorHandler } from './useFirebaseErrorHandler';

export const useBlog = (includeInactive = false) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useFirestoreErrorHandler();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.getAll(includeInactive);
      if (response.success && response.data) {
        setPosts(response.data);
      } else {
        setError(response.error || 'Error al cargar artículos');
        if (response.rawError) {
          handleError(response.rawError);
        }
      }
    } catch (err: any) {
      console.error('Error fetching blog posts hook:', err);
      setError(err?.message || 'Error inesperado al cargar artículos');
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [includeInactive, handleError]);

  const createPost = useCallback(async (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<BlogPost>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.create(postData);
      if (response.success && response.data) {
        setPosts(prev => [response.data!, ...prev]);
      } else {
        setError(response.error || 'Error al crear artículo');
        if (response.rawError) {
          handleError(response.rawError);
        }
      }
      return response;
    } catch (err: any) {
      console.error('Error creating post hook:', err);
      const errResponse = { success: false, error: err?.message || 'Error inesperado al crear artículo', rawError: err };
      setError(errResponse.error);
      handleError(err);
      return errResponse;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const updatePost = useCallback(async (id: string, updates: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.update(id, updates);
      if (response.success && response.data) {
        setPosts(prev => prev.map(p => p.id === id ? response.data! : p));
      } else {
        setError(response.error || 'Error al actualizar artículo');
        if (response.rawError) {
          handleError(response.rawError);
        }
      }
      return response;
    } catch (err: any) {
      console.error('Error updating post hook:', err);
      const errResponse = { success: false, error: err?.message || 'Error inesperado al actualizar artículo', rawError: err };
      setError(errResponse.error);
      handleError(err);
      return errResponse;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const deletePost = useCallback(async (id: string): Promise<ApiResponse<void>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.delete(id);
      if (response.success) {
        setPosts(prev => prev.filter(p => p.id !== id));
      } else {
        setError(response.error || 'Error al eliminar artículo');
        if (response.rawError) {
          handleError(response.rawError);
        }
      }
      return response;
    } catch (err: any) {
      console.error('Error deleting post hook:', err);
      const errResponse = { success: false, error: err?.message || 'Error inesperado al eliminar artículo', rawError: err };
      setError(errResponse.error);
      handleError(err);
      return errResponse;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getPostBySlug = useCallback(async (slug: string): Promise<BlogPost | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.getBySlug(slug);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Artículo no encontrado');
        if (response.rawError) {
          handleError(response.rawError);
        }
        return null;
      }
    } catch (err: any) {
      console.error('Error getting post by slug hook:', err);
      setError(err?.message || 'Error inesperado al obtener artículo');
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

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
