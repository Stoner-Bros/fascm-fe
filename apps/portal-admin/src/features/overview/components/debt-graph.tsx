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
  const tCommon = useTranslations('Overview.charts');
  const [data, setData] = React.useState<DebtStatisticsDto | null>(null);
  const [loading, setLoading] = React.useState(true);

  const chartConfig = {
    amount: {
      label: t('labelAmount'),
      color: 'hsl(var(--primary))'
    },
    receivable: {
      label: t('receivable'),
      color: '#22c55e'
    },
    payable: {
      label: t('payable'),
      color: '#ef4444'
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

  const chartData = [
    {
      type: 'receivable',
      amount: data?.totalDebtReceivable || 0,
      fill: 'var(--color-receivable)',
      label: t('receivable')
    },
    {
      type: 'payable',
      amount: data?.totalDebtPayable || 0,
      fill: 'var(--color-payable)',
      label: t('payable')
    }
  ];

  return (
    <Card className='@container/card'>
      <CardHeader className='items-center pb-0 sm:flex-row sm:justify-between sm:pb-4'>
        <div className='flex flex-col gap-1'>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('receivableVsPayable')}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
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
