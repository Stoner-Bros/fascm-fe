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
import { useTranslations } from 'next-intl';
import { getInventoryStatistics } from '@/services/statistics.service';
import { InventoryStatisticsDto } from '@/types/statistics';

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

export function InventoryGraph() {
  const t = useTranslations('Overview.charts.inventory');
  const tCommon = useTranslations('Overview.charts');
  const [data, setData] = React.useState<InventoryStatisticsDto | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Fresh colors palette
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  const chartConfig = {
    quantity: {
      label: t('labelQuantity'),
      color: 'hsl(var(--primary))'
    }
  } satisfies ChartConfig;

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getInventoryStatistics();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch inventory statistics:', error);
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

  const chartData = (data?.batchesByProduct || [])
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5)
    .map((item, index) => ({
      name: item.productName,
      quantity: item.totalQuantity,
      value: item.totalValue,
      fill: COLORS[index % COLORS.length]
    }));

  const totalValue = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(data?.totalInventoryValue || 0);

  return (
    <Card className='h-full'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <div className='flex flex-col gap-1'>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </div>
        <div className='flex flex-col items-end gap-1'>
          <span className='text-xl font-bold'>{totalValue}</span>
          {data?.expiringSoonBatches ? (
            <div className='bg-destructive/10 text-destructive flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium'>
              <span>{data.expiringSoonBatches}</span>
              <span>{t('expiringSoon')}</span>
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout='vertical'
            margin={{
              left: 0,
              right: 50
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
            <XAxis dataKey='quantity' type='number' hide />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className='bg-background rounded-lg border p-2 shadow-sm'>
                      <div className='grid grid-cols-2 gap-2'>
                        <div className='flex flex-col'>
                          <span className='text-muted-foreground text-[0.70rem] uppercase'>
                            {t('labelQuantity')}
                          </span>
                          <span className='text-muted-foreground font-bold'>
                            {data.quantity}
                          </span>
                        </div>
                        <div className='flex flex-col'>
                          <span className='text-muted-foreground text-[0.70rem] uppercase'>
                            {t('labelValue')}
                          </span>
                          <span className='font-bold'>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                              notation: 'compact',
                              maximumFractionDigits: 1
                            }).format(data.value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey='quantity' layout='vertical' radius={4} barSize={32}>
              <LabelList
                dataKey='quantity'
                position='right'
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
