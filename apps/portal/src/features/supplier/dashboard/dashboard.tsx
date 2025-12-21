'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { fetchMyHarvestSchedules } from '@/services/harvest-schedule.service';
import type { HarvestSchedule } from '@/types/harvest-schedule';
import {
  IconCheck,
  IconClock,
  IconPackage,
  IconTruck,
  IconX
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

const normalizeStatus = (status?: string | null): string => {
  if (!status || status.trim() === '') return 'pending';
  return status.toLowerCase().trim();
};

export default function SupplierDashboardFeature() {
  const t = useTranslations('SupplierDashboard');
  const [schedules, setSchedules] = useState<HarvestSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    | 'ALL'
    | 'pending'
    | 'rejected'
    | 'approved'
    | 'processing'
    | 'completed'
    | 'canceled'
  >('ALL');

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch schedules using /mine endpoint
        const schedulesRes = await fetchMyHarvestSchedules({
          page: 1,
          limit: 100,
          status:
            statusFilter === 'ALL'
              ? undefined
              : (statusFilter.toUpperCase() as any),
          sort: 'desc'
        });

        if (cancelled) return;

        setSchedules(schedulesRes.data ?? []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = schedules.length;
    const pending = schedules.filter(
      (s) => normalizeStatus(s.status) === 'pending'
    ).length;
    const approved = schedules.filter(
      (s) => normalizeStatus(s.status) === 'approved'
    ).length;
    const processing = schedules.filter(
      (s) => normalizeStatus(s.status) === 'processing'
    ).length;
    const completed = schedules.filter(
      (s) => normalizeStatus(s.status) === 'completed'
    ).length;
    const rejected = schedules.filter(
      (s) => normalizeStatus(s.status) === 'rejected'
    ).length;
    const canceled = schedules.filter(
      (s) => normalizeStatus(s.status) === 'canceled'
    ).length;

    return {
      total,
      pending,
      approved,
      processing,
      completed,
      rejected,
      canceled
    };
  }, [schedules]);

  // Get recent batches (sorted by date, latest first)
  const recentBatches = useMemo(() => {
    return [...schedules]
      .sort((a, b) => {
        const dateA = a.harvestDate
          ? new Date(a.harvestDate as unknown as string).getTime()
          : 0;
        const dateB = b.harvestDate
          ? new Date(b.harvestDate as unknown as string).getTime()
          : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [schedules]);

  const getStatusBadge = (status: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case 'pending':
        return (
          <Badge variant='outline' className='bg-yellow-50'>
            <IconClock className='mr-1 h-3 w-3' />
            {t('status.pending')}
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant='default' className='bg-blue-50 text-blue-700'>
            <IconCheck className='mr-1 h-3 w-3' />
            {t('status.approved')}
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant='secondary' className='bg-blue-50'>
            <IconTruck className='mr-1 h-3 w-3' />
            {t('status.processing')}
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant='default' className='bg-green-50 text-green-700'>
            <IconCheck className='mr-1 h-3 w-3' />
            {t('status.completed')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant='destructive'>
            <IconX className='mr-1 h-3 w-3' />
            {t('status.rejected')}
          </Badge>
        );
      case 'canceled':
        return (
          <Badge variant='destructive'>
            <IconX className='mr-1 h-3 w-3' />
            {t('status.canceled')}
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  return (
    <PageContainer>
      <div className='flex w-full flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              {t('welcome')}
            </h2>
            <p className='text-muted-foreground mt-1'>{t('subtitle')}</p>
          </div>
        </div>

        {/* Stats Cards with gradient backgrounds */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card className='relative overflow-hidden border-2 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10'>
            <CardHeader>
              <CardDescription className='text-blue-700 dark:text-blue-400'>
                {t('stats.totalBatches')}
              </CardDescription>
              <CardTitle className='text-3xl font-bold text-blue-900 tabular-nums dark:text-blue-100'>
                {loading ? (
                  <div className='h-8 w-16 animate-pulse rounded bg-blue-200 dark:bg-blue-800' />
                ) : (
                  stats.total
                )}
              </CardTitle>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1 text-sm'>
              <div className='text-muted-foreground'>
                {t('stats.totalBatchesDescription')}
              </div>
            </CardFooter>
            <div className='absolute -top-4 -right-4 h-24 w-24 rounded-full bg-blue-200/30 dark:bg-blue-800/20' />
          </Card>

          <Card className='relative overflow-hidden border-2 bg-gradient-to-br from-yellow-50 to-amber-100/50 dark:from-yellow-950/20 dark:to-amber-900/10'>
            <CardHeader>
              <CardDescription className='text-yellow-700 dark:text-yellow-400'>
                {t('stats.pendingApproval')}
              </CardDescription>
              <CardTitle className='text-3xl font-bold text-yellow-900 tabular-nums dark:text-yellow-100'>
                {loading ? (
                  <div className='h-8 w-16 animate-pulse rounded bg-yellow-200 dark:bg-yellow-800' />
                ) : (
                  stats.pending
                )}
              </CardTitle>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1 text-sm'>
              <div className='text-muted-foreground'>
                {t('stats.pendingApprovalDescription')}
              </div>
            </CardFooter>
            <div className='absolute -top-4 -right-4 h-24 w-24 rounded-full bg-yellow-200/30 dark:bg-yellow-800/20' />
          </Card>

          <Card className='relative overflow-hidden border-2 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/20 dark:to-indigo-900/10'>
            <CardHeader>
              <CardDescription className='text-indigo-700 dark:text-indigo-400'>
                {t('stats.processing')}
              </CardDescription>
              <CardTitle className='text-3xl font-bold text-indigo-900 tabular-nums dark:text-indigo-100'>
                {loading ? (
                  <div className='h-8 w-16 animate-pulse rounded bg-indigo-200 dark:bg-indigo-800' />
                ) : (
                  stats.processing
                )}
              </CardTitle>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1 text-sm'>
              <div className='text-muted-foreground'>
                {t('stats.processingDescription')}
              </div>
            </CardFooter>
            <div className='absolute -top-4 -right-4 h-24 w-24 rounded-full bg-indigo-200/30 dark:bg-indigo-800/20' />
          </Card>

          <Card className='relative overflow-hidden border-2 bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-950/20 dark:to-emerald-900/10'>
            <CardHeader>
              <CardDescription className='text-green-700 dark:text-green-400'>
                {t('stats.completed')}
              </CardDescription>
              <CardTitle className='text-3xl font-bold text-green-900 tabular-nums dark:text-green-100'>
                {loading ? (
                  <div className='h-8 w-16 animate-pulse rounded bg-green-200 dark:bg-green-800' />
                ) : (
                  stats.completed
                )}
              </CardTitle>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1 text-sm'>
              <div className='text-muted-foreground'>
                {t('stats.completedDescription')}
              </div>
            </CardFooter>
            <div className='absolute -top-4 -right-4 h-24 w-24 rounded-full bg-green-200/30 dark:bg-green-800/20' />
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <Card className='lg:col-span-2'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>{t('recentBatches.title')}</CardTitle>
                  <CardDescription>
                    {t('recentBatches.description')}
                  </CardDescription>
                </div>
                <Link href='/supplier/harvest-batches'>
                  <Button variant='ghost' size='sm'>
                    {t('recentBatches.viewAll')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='space-y-4'>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className='flex items-center justify-between rounded-lg border p-4'
                    >
                      <div className='flex-1 space-y-2'>
                        <div className='bg-muted h-4 w-24 animate-pulse rounded' />
                        <div className='bg-muted h-3 w-32 animate-pulse rounded' />
                        <div className='bg-muted h-3 w-20 animate-pulse rounded' />
                      </div>
                      <div className='space-y-2'>
                        <div className='bg-muted h-4 w-16 animate-pulse rounded' />
                        <div className='bg-muted h-6 w-20 animate-pulse rounded' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentBatches.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12'>
                  <IconPackage className='text-muted-foreground mb-4 h-12 w-12' />
                  <p className='text-muted-foreground'>
                    {t('recentBatches.noBatches')}
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {recentBatches.map((schedule) => {
                    const harvestDate = schedule.harvestDate
                      ? new Date(
                          schedule.harvestDate as unknown as string
                        ).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : '—';

                    return (
                      <Link
                        key={schedule.id}
                        href={`/supplier/harvest-batches/${schedule.id}`}
                        className='block'
                      >
                        <div className='group hover:border-primary flex items-center justify-between rounded-lg border p-4 transition-all hover:shadow-md'>
                          <div className='flex-1 space-y-1'>
                            <div className='flex items-center gap-2'>
                              <p className='text-sm font-semibold'>
                                {schedule.id}
                              </p>
                              {getStatusBadge(schedule.status ?? 'pending')}
                            </div>
                            <p className='text-muted-foreground text-sm'>
                              {t('recentBatches.harvestDate')}: {harvestDate}
                            </p>
                          </div>
                          <div className='text-right'>
                            <IconPackage className='text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors' />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href='/supplier/harvest-batches' className='w-full'>
                <Button variant='outline' className='w-full'>
                  {t('recentBatches.viewAllBatches')}
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className='lg:col-span-1'>
            <CardHeader>
              <CardTitle>{t('quickActions.title')}</CardTitle>
              <CardDescription>{t('quickActions.description')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Link href='/supplier/harvest-batches/new'>
                <Button
                  variant='outline'
                  className='hover:bg-primary hover:text-primary-foreground w-full justify-start'
                >
                  <IconPackage className='mr-2 h-4 w-4' />
                  {t('quickActions.createNewBatch')}
                </Button>
              </Link>
              {/* <Link href='/supplier/harvest-batches?status=pending'>
                <Button
                  variant='outline'
                  className='w-full justify-start hover:bg-primary hover:text-primary-foreground'
                >
                  <IconClock className='mr-2 h-4 w-4' />
                  View Pending
                </Button>
              </Link> */}
              {/* <Link href='/supplier/harvest-batches?status=approved'>
                <Button
                  variant='outline'
                  className='w-full justify-start hover:bg-primary hover:text-primary-foreground'
                >
                  <IconCheck className='mr-2 h-4 w-4' />
                  View Approved
                </Button>
              </Link> */}
              <Link href='/supplier/profile'>
                <Button
                  variant='outline'
                  className='hover:bg-primary hover:text-primary-foreground w-full justify-start'
                >
                  <IconTruck className='mr-2 h-4 w-4' />
                  {t('quickActions.viewProfile')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
