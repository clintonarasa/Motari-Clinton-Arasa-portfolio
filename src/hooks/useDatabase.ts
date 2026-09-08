import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/neon/client';
type User = { id: string; email?: string };

/**
 * Hook to get current authenticated user
 */
export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include' })
      .then((response) => response.json())
      .then((result) => setUser(result.data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}

/**
 * Hook to fetch database data
 * @param table - Table name
 * @param filters - Optional filters
 */
export function useDatabase<T = any>(
  table: string,
  filters?: Record<string, any>
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        let query = supabase.from(table).select('*');

        // Apply filters
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        const { data: result, error: err } = await query;

        if (err) throw err;
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [table, JSON.stringify(filters)]);

  return { data, loading, error };
}

/**
 * Hook for mutations (insert, update, delete)
 */
export function useDatabaseMutation(table: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const insert = async (record: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from(table)
        .insert([record])
        .select();
      if (err) throw err;
      return data[0];
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, updates: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select();
      if (err) throw err;
      return data[0];
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const delete_ = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (err) throw err;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { insert, update, delete: delete_, loading, error };
}
