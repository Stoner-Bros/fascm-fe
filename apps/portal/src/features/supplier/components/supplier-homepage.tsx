'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HarvestBatch,
  statusLabels,
  statusColors,
  mockHarvestBatches
} from '@/types/harvest';
import {
  IconPlus,
  IconEye,
  IconTruck,
  IconPackage,
  IconCheck,
  IconAlertTriangle
} from '@tabler/icons-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <Card>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-muted-foreground text-sm font-medium'>{title}</p>
            <p className='text-2xl font-bold'>{value}</p>
          </div>
          <div className={`rounded-lg p-3 ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentBatchCardProps {
  batch: HarvestBatch;
}

function RecentBatchCard({ batch }: RecentBatchCardProps) {
  return (
    <Card className='transition-shadow hover:shadow-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>{batch.productName}</CardTitle>
          <Badge variant='secondary' className={statusColors[batch.status]}>
            {statusLabels[batch.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Số lượng:</span>
            <span className='font-medium'>
              {batch.quantity} {batch.unit}
            </span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Ngày thu hoạch:</span>
            <span className='font-medium'>
              {format(batch.harvestDate, 'dd/MM/yyyy', { locale: vi })}
            </span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Giá ước tính:</span>
            <span className='font-medium'>
              {batch.estimatedPrice?.toLocaleString('vi-VN')} ₫
            </span>
          </div>
          {batch.description && (
            <p className='text-muted-foreground mt-2 line-clamp-2 text-sm'>
              {batch.description}
            </p>
          )}
        </div>
        <div className='mt-4 flex gap-2'>
          <Button variant='outline' size='sm' asChild className='flex-1'>
            <Link href={`/supplier/harvest-batches/tracking?batch=${batch.id}`}>
              <IconEye className='mr-1 h-4 w-4' />
              Xem chi tiết
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface AlertCardProps {
  title: string;
  message: string;
  type: 'warning' | 'info';
  action?: {
    label: string;
    href: string;
  };
}

function AlertCard({ title, message, type, action }: AlertCardProps) {
  const bgColor =
    type === 'warning'
      ? 'bg-yellow-50 border-yellow-200'
      : 'bg-blue-50 border-blue-200';
  const iconColor = type === 'warning' ? 'text-yellow-600' : 'text-blue-600';

  return (
    <Card className={`${bgColor} border-l-4`}>
      <CardContent className='p-4'>
        <div className='flex items-start space-x-3'>
          <IconAlertTriangle className={`mt-0.5 h-5 w-5 ${iconColor}`} />
          <div className='flex-1'>
            <h4 className='text-sm font-semibold'>{title}</h4>
            <p className='text-muted-foreground mt-1 text-sm'>{message}</p>
            {action && (
              <Button
                variant='link'
                size='sm'
                className='mt-2 h-auto p-0'
                asChild
              >
                <Link href={action.href}>{action.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SupplierHomepage() {
  // Mock data - in real app, this would come from API
  const batches = mockHarvestBatches;

  // Calculate statistics
  const totalBatches = batches.length;
  const pendingPickup = batches.filter(
    (b) => b.status === 'pending_pickup'
  ).length;
  const inTransit = batches.filter((b) => b.status === 'picking_up').length;
  const delivered = batches.filter((b) => b.status === 'delivered').length;

  // Get recent batches (last 5)
  const recentBatches = batches
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  // Generate alerts
  const alerts: AlertCardProps[] = [];

  if (pendingPickup > 0) {
    alerts.push({
      title: 'Đợt thu hoạch chờ lấy hàng',
      message: `Bạn có ${pendingPickup} đợt thu hoạch đang chờ được lấy hàng.`,
      type: 'warning',
      action: {
        label: 'Xem chi tiết',
        href: '/supplier/harvest-batches/tracking'
      }
    });
  }

  if (delivered > 0) {
    alerts.push({
      title: 'Đợt thu hoạch đã giao',
      message: `Bạn có ${delivered} đợt thu hoạch đã được giao, cần xác nhận thanh toán.`,
      type: 'info',
      action: {
        label: 'Xác nhận thanh toán',
        href: '/supplier/payment-confirmation'
      }
    });
  }

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Trang chủ nhà cung cấp</h1>
          <p className='text-muted-foreground'>
            Quản lý các đợt thu hoạch và theo dõi trạng thái giao hàng
          </p>
        </div>
        <Button asChild>
          <Link href='/supplier/harvest-batches/create'>
            <IconPlus className='mr-2 h-4 w-4' />
            Tạo đợt thu hoạch
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatsCard
          title='Tổng đợt thu hoạch'
          value={totalBatches}
          icon={<IconPackage className='h-6 w-6 text-white' />}
          color='bg-blue-500'
        />
        <StatsCard
          title='Chờ lấy hàng'
          value={pendingPickup}
          icon={<IconTruck className='h-6 w-6 text-white' />}
          color='bg-yellow-500'
        />
        <StatsCard
          title='Đang vận chuyển'
          value={inTransit}
          icon={<IconTruck className='h-6 w-6 text-white' />}
          color='bg-orange-500'
        />
        <StatsCard
          title='Đã giao'
          value={delivered}
          icon={<IconCheck className='h-6 w-6 text-white' />}
          color='bg-green-500'
        />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className='space-y-3'>
          <h2 className='text-lg font-semibold'>Cảnh báo</h2>
          <div className='grid gap-3'>
            {alerts.map((alert, index) => (
              <AlertCard key={index} {...alert} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Harvest Batches */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Đợt thu hoạch gần đây</h2>
          <Button variant='outline' asChild>
            <Link href='/supplier/harvest-batches/tracking'>Xem tất cả</Link>
          </Button>
        </div>

        {recentBatches.length > 0 ? (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {recentBatches.map((batch) => (
              <RecentBatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className='p-8 text-center'>
              <IconPackage className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
              <h3 className='mb-2 text-lg font-semibold'>
                Chưa có đợt thu hoạch nào
              </h3>
              <p className='text-muted-foreground mb-4'>
                Bắt đầu bằng cách tạo đợt thu hoạch đầu tiên của bạn
              </p>
              <Button asChild>
                <Link href='/supplier/harvest-batches/create'>
                  <IconPlus className='mr-2 h-4 w-4' />
                  Tạo đợt thu hoạch
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
