'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { useTranslations } from 'next-intl';
import { getDebtStatistics } from '@/services/statistics.service';
import { DebtStatisticsDto } from '@/types/statistics';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

export function DebtGraph() {
  const t = useTranslations('Overview.charts.debt');
  const tStatus = useTranslations('Payment.status');
  const tCommon = useTranslations('Overview.charts');
  const [data, setData] = React.useState<DebtStatisticsDto | null>(null);
  const [loading, setLoading] = React.useState(true);

  const STATUS_COLORS: Record<string, string> = {
    paid: '#22c55e',
    partially_paid: '#f97316',
    overdue: '#ef4444',
    unpaid: '#64748b',
    pending: '#eab308'
  };

  const chartConfig = {
    amount: {
      label: t('labelAmount'),
      color: 'hsl(var(--primary))'
    }
  } satisfies ChartConfig;

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDebtStatistics();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch debt statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className='@container/card flex h-full items-center justify-center'>
        <div className='text-muted-foreground'>{tCommon('loading')}</div>
      </Card>
    );
  }

  const chartData = (data?.debtsByStatus || []).map((item) => ({
    status: item.status,
    amount: item.totalAmount,
    fill: STATUS_COLORS[item.status] || '#94a3b8',
    label: tStatus(item.status as any)
  }));

  const overdueAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
    notation: 'compact'
  }).format(data?.totalOverdueAmount || 0);

  return (
    <Card className='@container/card flex h-full flex-col'>
      <CardHeader className='items-center pb-0 sm:flex-row sm:justify-between sm:pb-4'>
        <div className='flex flex-col gap-1'>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </div>
        {data?.overdueDebts ? (
          <div className='flex flex-col items-end'>
            <span className='text-destructive text-sm font-medium'>
              {t('overdue')}: {overdueAmount}
            </span>
            <span className='text-muted-foreground text-xs'>
              {data.overdueDebts} {t('debts')}
            </span>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className='flex-1'>
        <ChartContainer config={chartConfig} className='min-h-[200px] w-full'>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='label'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey='amount' strokeWidth={2} radius={8} maxBarSize={50} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
