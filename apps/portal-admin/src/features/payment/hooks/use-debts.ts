'use client';

import { useEffect, useState, useCallback } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';
import { fetchDebts } from '@/services/debt.service';
import type { Debt, PartnerType } from '@/types/debt';

interface UseDebtsOptions {
  partnerType?: PartnerType;
  enabled?: boolean;
}

export function useDebts(options?: UseDebtsOptions) {
  const { partnerType, enabled = true } = options || {};
  const [page, setPage] = useQueryState(
    partnerType ? `page-${partnerType}` : 'page',
    parseAsInteger.withDefault(1)
  );
  const [limit, setLimit] = useQueryState(
    partnerType ? `limit-${partnerType}` : 'limit',
    parseAsInteger.withDefault(10)
  );
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  const loadDebts = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const response = await fetchDebts({
        page: page ?? 1,
        limit: limit ?? 10,
        partnerType
      });

      setDebts(response.data ?? []);
      setHasNextPage(response.hasNextPage ?? false);
      setPageCount((prev) => {
        if (response.hasNextPage) {
          return Math.max(prev, (page ?? 1) + 1);
        }
        return page ?? 1;
      });
    } catch (error) {
      console.error('Failed to fetch debts:', error);
      setDebts([]);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  }, [page, limit, partnerType, enabled]);

  useEffect(() => {
    loadDebts();
  }, [loadDebts]);

  return {
    debts,
    loading,
    hasNextPage,
    pageCount,
    page: page ?? 1,
    limit: limit ?? 10,
    setPage,
    setLimit
  };
}
