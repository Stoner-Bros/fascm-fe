'use client';

import { IconTrendingUp } from '@tabler/icons-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getRevenueTrend } from '@/services/statistics.service';
import { RevenueTrendDto } from '@/types/statistics';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export function AreaGraph() {
  const t = useTranslations('Overview.charts.revenueTrend');
  const tCommon = useTranslations('Overview.charts');
  const [data, setData] = useState<RevenueTrendDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  });
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>(
    'month'
  );

  const chartConfig = {
    revenue: {
      label: t('labelRevenue'),
      color: '#10b981'
    },
    cost: {
      label: t('labelCost'),
      color: '#ef4444'
    },
    profit: {
      label: t('labelProfit'),
      color: '#3b82f6'
    }
  } satisfies ChartConfig;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getRevenueTrend({
          startDate: date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
          endDate: date?.to ? format(date.to, 'yyyy-MM-dd') : undefined,
          period
        });
        setData(result);
      } catch (error) {
        console.error('Failed to fetch revenue trend:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, period]);

  if (loading) {
    return (
      <Card className='@container/card flex h-full items-center justify-center'>
        <div className='text-muted-foreground'>{tCommon('loading')}</div>
      </Card>
    );
  }

  return (
    <Card className='@container/card'>
      <CardHeader>
        <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
          <div className='grid gap-1'>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            <Select
              value={period}
              onValueChange={(value: 'day' | 'week' | 'month' | 'year') =>
                setPeriod(value)
              }
            >
              <SelectTrigger className='w-[120px]'>
                <SelectValue placeholder='Select period' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='day'>Day</SelectItem>
                <SelectItem value='week'>Week</SelectItem>
                <SelectItem value='month'>Month</SelectItem>
                <SelectItem value='year'>Year</SelectItem>
              </SelectContent>
            </Select>
            <DateRangePicker date={date} onDateChange={setDate} />
          </div>
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart
            data={data}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillRevenue' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-revenue)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-revenue)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillCost' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-cost)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-cost)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillProfit' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-profit)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-profit)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='period'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dot' />}
            />
            <Area
              dataKey='cost'
              type='natural'
              fill='url(#fillCost)'
              stroke='var(--color-cost)'
              stackId='a'
            />
            <Area
              dataKey='profit'
              type='natural'
              fill='url(#fillProfit)'
              stroke='var(--color-profit)'
              stackId='a'
            />
            <Area
              dataKey='revenue'
              type='natural'
              fill='url(#fillRevenue)'
              stroke='var(--color-revenue)'
              stackId='a'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 leading-none font-medium'>
              {t('footerTitle')} <IconTrendingUp className='h-4 w-4' />
            </div>
            <div className='text-muted-foreground flex items-center gap-2 leading-none'>
              {t('footerDesc')}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
