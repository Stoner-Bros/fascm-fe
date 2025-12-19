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
import { getSupplierStatistics } from '@/services/statistics.service';

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
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

export function SupplierGraph() {
  const t = useTranslations('Overview.charts.topSuppliers');
  const tCommon = useTranslations('Overview.charts');
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  });

  // Fresh colors palette (Teal/Emerald theme)
  const COLORS = ['#10b981', '#14b8a6', '#0ea5e9', '#06b6d4', '#22c55e'];

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getSupplierStatistics({
          startDate: date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
          endDate: date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
        });
        // Sort by amount descending and take top 5
        const sortedData = (result.topSuppliers || [])
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 5)
          .map((item, index) => ({
            name: item.supplierName,
            amount: item.totalAmount,
            orders: item.totalOrders,
            fill: COLORS[index % COLORS.length]
          }));
        setChartData(sortedData);
      } catch (error) {
        console.error('Failed to fetch top suppliers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

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
      <CardHeader className='items-center pb-0 sm:flex-row sm:justify-between sm:pb-4'>
        <div className='flex flex-col gap-1'>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </div>
        <DateRangePicker date={date} onDateChange={setDate} />
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
            <Bar dataKey='amount' layout='vertical' radius={4} barSize={32}>
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
