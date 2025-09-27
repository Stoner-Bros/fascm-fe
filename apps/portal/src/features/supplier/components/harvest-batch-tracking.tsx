'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  HarvestBatch,
  HarvestBatchStatus,
  statusLabels,
  statusColors,
  mockHarvestBatches
} from '@/types/harvest';
import {
  IconSearch,
  IconEye,
  IconCheck,
  IconPlus,
  IconFilter,
  IconClock,
  IconTruck
} from '@tabler/icons-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

interface BatchCardProps {
  batch: HarvestBatch;
  onStatusUpdate: (batchId: string, newStatus: HarvestBatchStatus) => void;
}

function BatchCard({ batch, onStatusUpdate }: BatchCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleConfirmDelivery = async () => {
    if (batch.status !== 'picking_up') return;

    try {
      setIsUpdating(true);
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onStatusUpdate(batch.id, 'delivered');
      toast.success('Đã xác nhận giao hàng thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xác nhận giao hàng');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: HarvestBatchStatus) => {
    switch (status) {
      case 'pending_pickup':
        return <IconClock className='h-4 w-4' />;
      case 'picking_up':
        return <IconTruck className='h-4 w-4' />;
      case 'delivered':
        return <IconCheck className='h-4 w-4' />;
      case 'completed':
        return <IconCheck className='h-4 w-4' />;
      default:
        return <IconClock className='h-4 w-4' />;
    }
  };

  return (
    <Card className='transition-shadow hover:shadow-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <CardTitle className='text-lg'>{batch.productName}</CardTitle>
            <p className='text-muted-foreground text-sm'>ID: {batch.id}</p>
          </div>
          <Badge
            variant='secondary'
            className={`${statusColors[batch.status]} flex items-center gap-1`}
          >
            {getStatusIcon(batch.status)}
            {statusLabels[batch.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Basic Info */}
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='text-muted-foreground'>Số lượng:</span>
            <p className='font-medium'>
              {batch.quantity} {batch.unit}
            </p>
          </div>
          <div>
            <span className='text-muted-foreground'>Chất lượng:</span>
            <p className='font-medium capitalize'>{batch.expectedQuality}</p>
          </div>
          <div>
            <span className='text-muted-foreground'>Ngày thu hoạch:</span>
            <p className='font-medium'>
              {format(batch.harvestDate, 'dd/MM/yyyy', { locale: vi })}
            </p>
          </div>
          <div>
            <span className='text-muted-foreground'>Giá ước tính:</span>
            <p className='font-medium text-green-600'>
              {batch.estimatedPrice?.toLocaleString('vi-VN')} ₫
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className='space-y-2'>
          <Label className='text-sm font-medium'>Tiến trình:</Label>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2 text-sm'>
              <div className='h-2 w-2 rounded-full bg-green-500'></div>
              <span>
                Đã tạo:{' '}
                {format(batch.createdAt, 'dd/MM/yyyy HH:mm', { locale: vi })}
              </span>
            </div>

            {batch.pickupDate && (
              <div className='flex items-center space-x-2 text-sm'>
                <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                <span>
                  Bắt đầu lấy hàng:{' '}
                  {format(batch.pickupDate, 'dd/MM/yyyy HH:mm', { locale: vi })}
                </span>
              </div>
            )}

            {batch.deliveryDate && (
              <div className='flex items-center space-x-2 text-sm'>
                <div className='h-2 w-2 rounded-full bg-orange-500'></div>
                <span>
                  Đã giao:{' '}
                  {format(batch.deliveryDate, 'dd/MM/yyyy HH:mm', {
                    locale: vi
                  })}
                </span>
              </div>
            )}

            {batch.completionDate && (
              <div className='flex items-center space-x-2 text-sm'>
                <div className='h-2 w-2 rounded-full bg-gray-500'></div>
                <span>
                  Hoàn tất:{' '}
                  {format(batch.completionDate, 'dd/MM/yyyy HH:mm', {
                    locale: vi
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {batch.description && (
          <div>
            <Label className='text-sm font-medium'>Mô tả:</Label>
            <p className='text-muted-foreground mt-1 text-sm'>
              {batch.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className='flex gap-2 pt-2'>
          <Button variant='outline' size='sm' className='flex-1'>
            <IconEye className='mr-1 h-4 w-4' />
            Chi tiết
          </Button>

          {batch.status === 'picking_up' && (
            <Button
              size='sm'
              className='flex-1'
              onClick={handleConfirmDelivery}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <div className='mr-1 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
              ) : (
                <IconCheck className='mr-1 h-4 w-4' />
              )}
              Xác nhận đã giao
            </Button>
          )}

          {batch.status === 'delivered' && (
            <Button size='sm' className='flex-1' asChild>
              <Link href='/supplier/payment-confirmation'>
                <IconCheck className='mr-1 h-4 w-4' />
                Xác nhận thanh toán
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: HarvestBatchStatus | 'all';
  onStatusFilterChange: (value: HarvestBatchStatus | 'all') => void;
}

function FilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}: FilterBarProps) {
  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex flex-col gap-4 md:flex-row'>
          <div className='flex-1'>
            <Label htmlFor='search' className='sr-only'>
              Tìm kiếm
            </Label>
            <div className='relative'>
              <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
              <Input
                id='search'
                placeholder='Tìm kiếm theo tên sản phẩm, ID...'
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>

          <div className='w-full md:w-48'>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                onStatusFilterChange(value as HarvestBatchStatus | 'all')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Lọc theo trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                <SelectItem value='pending_pickup'>Chờ lấy hàng</SelectItem>
                <SelectItem value='picking_up'>Đang lấy</SelectItem>
                <SelectItem value='delivered'>Đã giao</SelectItem>
                <SelectItem value='completed'>Hoàn tất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HarvestBatchTracking() {
  const [batches, setBatches] = useState<HarvestBatch[]>(mockHarvestBatches);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<HarvestBatchStatus | 'all'>(
    'all'
  );

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const matchesSearch =
        batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || batch.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [batches, searchTerm, statusFilter]);

  const handleStatusUpdate = (
    batchId: string,
    newStatus: HarvestBatchStatus
  ) => {
    setBatches((prevBatches) =>
      prevBatches.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              status: newStatus,
              deliveryDate:
                newStatus === 'delivered' ? new Date() : batch.deliveryDate,
              updatedAt: new Date()
            }
          : batch
      )
    );
  };

  // Get statistics
  const totalBatches = batches.length;
  const pendingCount = batches.filter(
    (b) => b.status === 'pending_pickup'
  ).length;
  const pickingCount = batches.filter((b) => b.status === 'picking_up').length;
  const deliveredCount = batches.filter((b) => b.status === 'delivered').length;

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Theo dõi đợt thu hoạch</h1>
          <p className='text-muted-foreground'>
            Quản lý và theo dõi trạng thái các đợt thu hoạch của bạn
          </p>
        </div>
        <Button asChild>
          <Link href='/supplier/harvest-batches/create'>
            <IconPlus className='mr-2 h-4 w-4' />
            Tạo đợt mới
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold'>{totalBatches}</div>
            <div className='text-muted-foreground text-sm'>Tổng cộng</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-yellow-600'>
              {pendingCount}
            </div>
            <div className='text-muted-foreground text-sm'>Chờ lấy hàng</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-blue-600'>
              {pickingCount}
            </div>
            <div className='text-muted-foreground text-sm'>Đang lấy</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {deliveredCount}
            </div>
            <div className='text-muted-foreground text-sm'>Đã giao</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Batch List */}
      {filteredBatches.length > 0 ? (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3'>
          {filteredBatches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className='p-8 text-center'>
            <IconFilter className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
            <h3 className='mb-2 text-lg font-semibold'>
              {searchTerm || statusFilter !== 'all'
                ? 'Không tìm thấy đợt thu hoạch nào'
                : 'Chưa có đợt thu hoạch nào'}
            </h3>
            <p className='text-muted-foreground mb-4'>
              {searchTerm || statusFilter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Bắt đầu bằng cách tạo đợt thu hoạch đầu tiên của bạn'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button asChild>
                <Link href='/supplier/harvest-batches/create'>
                  <IconPlus className='mr-2 h-4 w-4' />
                  Tạo đợt thu hoạch
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
