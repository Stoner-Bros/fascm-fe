'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { fetchHarvestSchedules } from '@/services/harvest-schedule.service';
import type { HarvestSchedule } from '@/types/harvest-schedule';
import { HarvestScheduleList } from '@/features/harvest/components/harvest-schedule-list';
import { Skeleton } from '@/components/ui/skeleton';

export default function HarvestPage() {
  const [harvestSchedules, setHarvestSchedules] = useState<HarvestSchedule[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHarvestSchedules() {
      try {
        setLoading(true);
        const response = await fetchHarvestSchedules({
          page: 1,
          limit: 100
        });
        setHarvestSchedules(response.data);
        setError(null);
      } catch (err: any) {
        setError(err?.message ?? 'Không thể tải danh sách lịch thu hoạch');
        console.error('Error loading harvest schedules:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHarvestSchedules();
  }, []);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Danh sách Lịch Thu Hoạch
          </h2>
        </div>

        {loading ? (
          <div className='space-y-4'>
            <Skeleton className='h-12 w-full' />
            <Skeleton className='h-12 w-full' />
            <Skeleton className='h-12 w-full' />
          </div>
        ) : error ? (
          <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'>
            <p className='font-medium'>Lỗi: {error}</p>
          </div>
        ) : (
          <HarvestScheduleList harvestSchedules={harvestSchedules} />
        )}
      </div>
    </PageContainer>
  );
}
