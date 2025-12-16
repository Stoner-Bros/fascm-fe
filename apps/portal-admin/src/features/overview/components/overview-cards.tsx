'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconCurrencyDollar,
  IconShoppingCart,
  IconTruck,
  IconChartBar
} from '@tabler/icons-react';
import { getOverviewStatistics } from '@/services/statistics.service';
import { OverviewStatisticsDto } from '@/types/statistics';
import { useTranslations } from 'next-intl';

export function OverviewCards() {
  const t = useTranslations('Overview.cards');
  const [data, setData] = useState<OverviewStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getOverviewStatistics();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch overview statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='@container/card animate-pulse'>
            <CardHeader>
              <div className='bg-muted h-4 w-24 rounded'></div>
              <div className='bg-muted mt-2 h-8 w-32 rounded'></div>
            </CardHeader>
            <CardFooter>
              <div className='bg-muted h-4 w-40 rounded'></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>{t('totalRevenue')} (VND)</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {data.totalRevenue.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>{t('revenueLabel')}</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            {t('revenueDesc')}
          </div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>{t('totalOrders')}</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {data.totalOrders.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconShoppingCart className='mr-1 size-4' />
              {t('ordersLabel')}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            {t('ordersDesc')}
          </div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>{t('totalDeliveries')}</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {data.totalDeliveries.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTruck className='mr-1 size-4' />
              {t('deliveriesLabel')}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            {t('deliveriesDesc')}
          </div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>{t('grossProfit')} (VND)</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {data.grossProfit.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconChartBar className='mr-1 size-4' />
              {t('profitLabel')}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            {t('profitDesc')}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
