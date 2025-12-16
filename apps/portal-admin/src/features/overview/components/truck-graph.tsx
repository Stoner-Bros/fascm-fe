'use client';

import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';
import { useTranslations } from 'next-intl';
import { getTruckStatistics } from '@/services/statistics.service';
import { TruckStatisticsDto } from '@/types/statistics';

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

export function TruckGraph() {
  const t = useTranslations('Overview.charts.truck');
  const tCommon = useTranslations('Overview.charts');
  const [data, setData] = React.useState<TruckStatisticsDto | null>(null);
  const [loading, setLoading] = React.useState(true);

  const chartConfig = {
    trucks: {
      label: t('labelTrucks')
    },
    available: {
      label: 'Available',
      color: '#10b981'
    },
    in_use: {
      label: 'In Use',
      color: '#3b82f6'
    },
    maintenance: {
      label: 'Maintenance',
      color: '#ef4444'
    }
  } satisfies ChartConfig;

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getTruckStatistics();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch truck statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = React.useMemo(() => {
    if (!data) return [];

    const getCount = (status: string) => {
      const item = data.trucksByStatus.find((s) => s.status === status);
      return item ? item.count : 0;
    };

    return [
      {
        status: 'available',
        trucks: getCount('available'),
        fill: 'var(--color-available)'
      },
      {
        status: 'in_use',
        trucks: getCount('in_use'),
        fill: 'var(--color-in_use)'
      },
      {
        status: 'maintenance',
        trucks: getCount('maintenance'),
        fill: 'var(--color-maintenance)'
      }
    ];
  }, [data]);

  const totalTrucks = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.trucks, 0);
  }, [chartData]);

  if (loading) {
    return (
      <Card className='@container/card flex h-full items-center justify-center'>
        <div className='text-muted-foreground'>{tCommon('loading')}</div>
      </Card>
    );
  }

  return (
    <Card className='@container/card flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description', { count: totalTrucks })}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey='trucks'
              nameKey='status'
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalTrucks.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          {t('centerLabel')}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
