'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList
} from 'recharts';
import { getConsigneeStatistics } from '@/services/statistics.service';

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
import { useTranslations } from 'next-intl';

export function TopCustomersGraph() {
  const t = useTranslations('Overview.charts.topCustomers');
  const tCommon = useTranslations('Overview.charts');
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fresh colors palette
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getConsigneeStatistics();
        // Sort by amount descending and take top 5
        const sortedData = (result.topConsignees || [])
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 5)
          .map((item, index) => ({
            name: item.consigneeName,
            amount: item.totalAmount,
            orders: item.totalOrders,
            fill: COLORS[index % COLORS.length]
          }));
        setChartData(sortedData);
      } catch (error) {
        console.error('Failed to fetch top customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartConfig = {
    amount: {
      label: t('totalAmount'),
      color: 'hsl(var(--primary))'
    }
  } satisfies ChartConfig;

  if (loading) {
    return (
      <Card className='flex h-full items-center justify-center'>
        <div className='text-muted-foreground'>{tCommon('loading')}</div>
      </Card>
    );
  }

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[300px] w-full'
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout='vertical'
            margin={{
              left: 0,
              right: 50 // Add margin for labels
            }}
          >
            <CartesianGrid horizontal={false} strokeDasharray='3 3' />
            <YAxis
              dataKey='name'
              type='category'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={100}
              tickFormatter={(value) =>
                value.length > 15 ? `${value.substring(0, 15)}...` : value
              }
            />
            <XAxis dataKey='amount' type='number' hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='line' />}
            />
            <Bar dataKey='amount' layout='vertical' radius={4}>
              <LabelList
                dataKey='amount'
                position='right'
                formatter={(value: number) =>
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact'
                  }).format(value)
                }
                className='fill-foreground'
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
