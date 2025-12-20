'use client';

import { useEffect, useState, useCallback } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';
import { fetchDebts } from '@/services/debt.service';
import type { Debt, PartnerType } from '@/types/debt';

interface UseDebtsOptions {
  partnerType?: PartnerType;
}

export function useDebts(options?: UseDebtsOptions) {
  const { partnerType } = options || {};
  const [page, setPage] = useQueryState(
    partnerType ? `page-${partnerType}` : 'page',
    parseAsInteger.withDefault(1)
  );
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  const loadDebts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchDebts({
        page: page ?? 1,
        limit: limit ?? 10,
        partnerType
      });
      // Filter by partnerType on client side as fallback if API doesn't filter
      let filteredDebts = response.data ?? [];
      if (partnerType) {
        filteredDebts = filteredDebts.filter(
          (debt) => debt.partnerType === partnerType
        );
      }
      setDebts(filteredDebts);
      setHasNextPage(response.hasNextPage ?? false);
      setPageCount((prev) => {
        const minimalTotal = response.hasNextPage
          ? (page ?? 1) + 1
          : (page ?? 1);
        return Math.max(prev, minimalTotal);
      });
    } catch (error) {
      console.error('Failed to fetch debts:', error);
      setDebts([]);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  }, [page, limit, partnerType]);

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
    setPage
  };
}
