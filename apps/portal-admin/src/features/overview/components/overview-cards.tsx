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
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker';

export function OverviewCards() {
  const t = useTranslations('Overview.cards');
  const [data, setData] = useState<OverviewStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getOverviewStatistics({
          startDate: date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
          endDate: date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
        });
        setData(result);
      } catch (error) {
        console.error('Failed to fetch overview statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-end'>
        <DateRangePicker date={date} onDateChange={setDate} />
      </div>
      {loading ? (
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
      ) : data ? (
        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>{t('totalRevenue')} </CardDescription>
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
              <CardDescription>{t('totalDebtReceivable')}</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {data.totalDebtReceivable.toLocaleString()}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconCurrencyDollar className='mr-1 size-4' />
                  {t('debtReceivableLabel')}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {t('debtReceivableDesc')}
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>{t('totalDebtPayable')}</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {data.totalDebtPayable.toLocaleString()}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconCurrencyDollar className='mr-1 size-4' />
                  {t('debtPayableLabel')}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {t('debtPayableDesc')}
              </div>
            </CardFooter>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
