'use client';

import { CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { StatusFilter } from '../../types/types';

type SearchFiltersProps = {
  searchQuery: string;
  statusFilter: StatusFilter;
  onSearchQueryChange: (query: string) => void;
  onStatusFilterChange: (filter: StatusFilter) => void;
  t: (key: string) => string;
};

export function SearchFilters({
  searchQuery,
  statusFilter,
  onSearchQueryChange,
  onStatusFilterChange,
  t
}: SearchFiltersProps) {
  return (
    <CardHeader>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-1 items-center space-x-2'>
          <div className='relative flex-1'>
            <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
            <Input
              placeholder={t('filters.searchPlaceholder')}
              className='pl-8'
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              onStatusFilterChange((v as StatusFilter) || 'ALL')
            }
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder={t('filters.statusPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>{t('filters.allStatus')}</SelectItem>
              <SelectItem value='pending'>{t('statuses.pending')}</SelectItem>
              <SelectItem value='rejected'>{t('statuses.rejected')}</SelectItem>
              <SelectItem value='approved'>{t('statuses.approved')}</SelectItem>
              <SelectItem value='processing'>
                {t('statuses.processing')}
              </SelectItem>
              <SelectItem value='completed'>
                {t('statuses.completed')}
              </SelectItem>
              <SelectItem value='canceled'>{t('statuses.canceled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardHeader>
  );
}
