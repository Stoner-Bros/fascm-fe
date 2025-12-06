'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconDownload
} from '@tabler/icons-react';
import { fetchBatches } from '@/services/batch.service';
import type { Batch } from '@/types/batch';

interface AreaChartsProps {
  areaId: string;
  className?: string;
}

export default function AreaCharts({ areaId, className }: AreaChartsProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [chartType, setChartType] = useState('inbound');
  const [inboundTrendData, setInboundTrendData] = useState<
    { date: string; value: number }[]
  >([]);
  const [outboundTrendData, setOutboundTrendData] = useState<
    { date: string; value: number }[]
  >([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  const inventoryTrendData = [
    { date: '01/01', inbound: 120, outbound: 80, stock: 450 },
    { date: '02/01', inbound: 100, outbound: 90, stock: 460 },
    { date: '03/01', inbound: 150, outbound: 110, stock: 500 },
    { date: '04/01', inbound: 80, outbound: 120, stock: 460 },
    { date: '05/01', inbound: 200, outbound: 100, stock: 560 },
    { date: '06/01', inbound: 90, outbound: 140, stock: 510 },
    { date: '07/01', inbound: 110, outbound: 95, stock: 525 }
  ];

  const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '24h':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    return { startDate, endDate };
  };

  const buildInboundTrend = (batches: Batch[], targetAreaId: string) => {
    const { startDate, endDate } = getDateRange();
    const dateMap = new Map<string, number>();

    // Tạo map với tất cả các ngày trong khoảng thời gian
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = formatDate(currentDate);
      dateMap.set(dateKey, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Chỉ tính các batch thuộc area hiện tại và có importTicket (nhập kho)
    batches
      .filter((batch) => batch.area?.id === targetAreaId && batch.importTicket)
      .forEach((batch) => {
        if (batch.createdAt) {
          const batchDate = new Date(batch.createdAt);
          if (batchDate >= startDate && batchDate <= endDate) {
            const dateKey = formatDate(batchDate);
            const quantity = toNumber(batch.quantity);
            const currentValue = dateMap.get(dateKey) ?? 0;
            dateMap.set(dateKey, currentValue + quantity);
          }
        }
      });

    // Chuyển đổi map thành array và sắp xếp theo ngày
    const trend = Array.from(dateMap.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split('/').map(Number);
        const [dayB, monthB] = b.date.split('/').map(Number);
        if (monthA !== monthB) return monthA - monthB;
        return dayA - dayB;
      });

    return trend.length ? trend : [{ date: formatDate(new Date()), value: 0 }];
  };

  const buildOutboundTrend = (batches: Batch[], targetAreaId: string) => {
    const { startDate, endDate } = getDateRange();
    const dateMap = new Map<string, number>();

    // Tạo map với tất cả các ngày trong khoảng thời gian
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = formatDate(currentDate);
      dateMap.set(dateKey, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Chỉ tính các batch thuộc area hiện tại và có orderDetail (xuất kho)
    batches
      .filter((batch) => batch.area?.id === targetAreaId && batch.orderDetail)
      .forEach((batch) => {
        if (batch.createdAt) {
          const batchDate = new Date(batch.createdAt);
          if (batchDate >= startDate && batchDate <= endDate) {
            const dateKey = formatDate(batchDate);
            const quantity = toNumber(batch.quantity);
            const currentValue = dateMap.get(dateKey) ?? 0;
            dateMap.set(dateKey, currentValue + quantity);
          }
        }
      });

    // Chuyển đổi map thành array và sắp xếp theo ngày
    const trend = Array.from(dateMap.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split('/').map(Number);
        const [dayB, monthB] = b.date.split('/').map(Number);
        if (monthA !== monthB) return monthA - monthB;
        return dayA - dayB;
      });

    return trend.length ? trend : [{ date: formatDate(new Date()), value: 0 }];
  };

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const res = await fetchBatches({ areaId, limit: 200 });
        const loadedBatches = res?.data ?? [];
        // Filter chỉ lấy batches thuộc area hiện tại
        const areaBatches = loadedBatches.filter((b) => b.area?.id === areaId);
        setBatches(areaBatches);
        setInboundTrendData(buildInboundTrend(areaBatches, areaId));
        setOutboundTrendData(buildOutboundTrend(areaBatches, areaId));
      } catch (error) {
        console.error('Unable to load batches for area', error);
        setInboundTrendData([{ date: formatDate(new Date()), value: 0 }]);
        setOutboundTrendData([{ date: formatDate(new Date()), value: 0 }]);
      }
    };

    void loadBatches();
  }, [areaId, timeRange]);

  const alertsData = [
    { date: '01/01', temperature: 2, humidity: 1, inventory: 0 },
    { date: '02/01', temperature: 1, humidity: 2, inventory: 1 },
    { date: '03/01', temperature: 3, humidity: 0, inventory: 0 },
    { date: '04/01', temperature: 0, humidity: 1, inventory: 2 },
    { date: '05/01', temperature: 2, humidity: 3, inventory: 1 },
    { date: '06/01', temperature: 1, humidity: 1, inventory: 0 },
    { date: '07/01', temperature: 0, humidity: 0, inventory: 1 }
  ];

  const getCurrentData = () => {
    switch (chartType) {
      case 'inbound':
        return inboundTrendData;
      case 'outbound':
        return outboundTrendData;
      default:
        return inboundTrendData;
    }
  };

  const getChartTitle = () => {
    switch (chartType) {
      case 'inbound':
        return 'Xu hướng nhập kho';
      case 'outbound':
        return 'Xu hướng xuất kho';
      default:
        return 'Biểu đồ thống kê';
    }
  };

  const getTrendIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return <IconTrendingUp className='h-4 w-4 text-green-600' />;
    } else if (current < previous) {
      return <IconTrendingDown className='h-4 w-4 text-red-600' />;
    } else {
      return <IconMinus className='h-4 w-4 text-gray-600' />;
    }
  };

  const renderChart = () => {
    const data = getCurrentData();

    switch (chartType) {
      case 'inbound':
        return (
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type='monotone'
                dataKey='value'
                stroke='#82ca9d'
                strokeWidth={2}
                name='Số lượng nhập kho'
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'outbound':
        return (
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type='monotone'
                dataKey='value'
                stroke='#ffc658'
                strokeWidth={2}
                name='Số lượng xuất kho'
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng nhập kho</CardTitle>
            {getTrendIndicator(
              inboundTrendData.reduce((sum, item) => sum + item.value, 0),
              inboundTrendData.length > 1
                ? inboundTrendData[inboundTrendData.length - 2].value
                : 0
            )}
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {inboundTrendData.reduce((sum, item) => sum + item.value, 0)}
            </div>
            <p className='text-muted-foreground text-xs'>
              Tổng số lượng nhập kho
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng xuất kho</CardTitle>
            {getTrendIndicator(
              outboundTrendData.reduce((sum, item) => sum + item.value, 0),
              outboundTrendData.length > 1
                ? outboundTrendData[outboundTrendData.length - 2].value
                : 0
            )}
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {outboundTrendData.reduce((sum, item) => sum + item.value, 0)}
            </div>
            <p className='text-muted-foreground text-xs'>
              Tổng số lượng xuất kho
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng tồn kho</CardTitle>
            {getTrendIndicator(525, 510)}
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>525</div>
            <p className='text-muted-foreground text-xs'>
              +15 đơn vị so với hôm qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Cảnh báo</CardTitle>
            {getTrendIndicator(1, 2)}
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>1</div>
            <p className='text-muted-foreground text-xs'>-1 so với hôm qua</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>{getChartTitle()}</CardTitle>
              <CardDescription>
                Dữ liệu thời gian thực cho khu vực {areaId}
              </CardDescription>
            </div>
            <div className='flex gap-2'>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='inbound'>Nhập kho</SelectItem>
                  <SelectItem value='outbound'>Xuất kho</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='24h'>24 giờ</SelectItem>
                  <SelectItem value='7d'>7 ngày</SelectItem>
                  <SelectItem value='30d'>30 ngày</SelectItem>
                  <SelectItem value='90d'>90 ngày</SelectItem>
                </SelectContent>
              </Select>
              <Button variant='outline' size='sm'>
                <IconDownload className='mr-2 h-4 w-4' />
                Xuất
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderChart()}</CardContent>
      </Card>
    </div>
  );
}
