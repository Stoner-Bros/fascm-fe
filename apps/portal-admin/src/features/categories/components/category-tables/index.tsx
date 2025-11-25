'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useToast } from '@/components/ui/use-toast';
import { useDataTable } from '@/hooks/use-data-table';
import { fetchCategories } from '@/services/category.service';
import type { Category } from '@/types/product';
import { useEffect, useState } from 'react';
import { columns } from './columns';

export function CategoryTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const response = await fetchCategories({ page: 1, limit: 100 });
        setCategories(response.data);
        setTotalItems(response.data.length);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err?.message ?? 'Failed to load categories',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, [toast]);

  const { table } = useDataTable({
    data: categories,
    columns,
    pageCount: Math.ceil(totalItems / 10),
    shallow: false,
    debounceMs: 500
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
