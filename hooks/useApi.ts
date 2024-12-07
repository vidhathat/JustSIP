import { useState, useCallback } from 'react';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiResponse<T> extends ApiResponse<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// Example usage with type:
/*
interface Wallet {
  id: string;
  address: string;
}

const {
  data: wallet,
  loading,
  error,
  execute: createNewWallet
} = useApi<Wallet>(createWallet);

// Later in your component:
await createNewWallet("0x123..."); 
*/ 