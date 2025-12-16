'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { useTranslations } from 'next-intl';
import { getOrderStatistics } from '@/services/statistics.service';

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

export const description = 'Order Status Distribution';

export function BarGraph() {
  const t = useTranslations('Overview.charts.orderStatus');
  const tCommon = useTranslations('Overview.charts');
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const COLORS = ['#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'];

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getOrderStatistics();
        const data = result.ordersByStatus.map((item, index) => ({
          status: item.status,
          count: item.count,
          fill: COLORS[index % COLORS.length]
        }));
        setChartData(data);
      } catch (error) {
        console.error('Failed to fetch order statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartConfig = {
    count: {
      label: t('labelOrders'),
      color: 'hsl(var(--primary))'
    }
  } satisfies ChartConfig;

  if (loading) {
    return (
      <Card className='@container/card flex h-full items-center justify-center !pt-3'>
        <div className='text-muted-foreground'>{tCommon('loading')}</div>
      </Card>
    );
  }

  return (
    <Card className='@container/card !pt-3'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-4 sm:py-6'>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='status'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent className='w-[150px]' nameKey='count' />
              }
            />
            <Bar dataKey='count' fill={`var(--color-count)`} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
