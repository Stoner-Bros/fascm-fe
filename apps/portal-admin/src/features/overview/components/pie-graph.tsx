'use client';

import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';
import { useTranslations } from 'next-intl';
import { getProductStatistics } from '@/services/statistics.service';
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

export function PieGraph() {
  const t = useTranslations('Overview.charts.productCategories');
  const tCommon = useTranslations('Overview.charts');
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalProducts, setTotalProducts] = React.useState(0);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  });

  const COLORS = ['#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'];

  const chartConfig = {
    products: {
      label: t('labelProducts')
    }
  } satisfies ChartConfig;

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getProductStatistics({
          startDate: date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
          endDate: date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
        });
        const data = result.productsByCategory.map((item, index) => ({
          category: item.categoryName,
          products: item.count,
          fill: COLORS[index % COLORS.length]
        }));
        setChartData(data);
        setTotalProducts(result.totalProducts);
      } catch (error) {
        console.error('Failed to fetch product statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.products, 0);
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
      <CardHeader className='items-center pb-0 sm:flex-row sm:justify-between sm:pb-4'>
        <div className='flex flex-col gap-1'>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </div>
        <DateRangePicker date={date} onDateChange={setDate} />
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
              dataKey='products'
              nameKey='category'
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
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          {t('labelProducts')}
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
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium'>
          {t('footerTitle')}
        </div>
        <div className='text-muted-foreground leading-none'>
          {t('footerDesc')}
        </div>
      </CardFooter>
    </Card>
  );
}
