'use client';

import { useEffect, useState } from 'react';
import { fetchMyDebts } from '@/services/debt.service';
import type { Debt } from '@/types/debt';
import { useToast } from '@/hooks/use-toast';

export function useMyDebt() {
  const [debt, setDebt] = useState<Debt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    async function loadDebt() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchMyDebts();
        if (isMounted) {
          setDebt(data);
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to load debt');
        if (isMounted) {
          setError(error);
          toast({
            title: 'Error',
            description: 'Failed to load debt information',
            variant: 'destructive'
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDebt();

    return () => {
      isMounted = false;
    };
  }, []);

  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchMyDebts();
      setDebt(data);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to refetch debt');
      setError(error);
      toast({
        title: 'Error',
        description: 'Failed to refresh debt information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    debt,
    isLoading,
    error,
    refetch
  };
}
