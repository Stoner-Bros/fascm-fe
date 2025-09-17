'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  IconPackage,
  IconCalendar,
  IconMapPin,
  IconTruck,
  IconAlertTriangle,
  IconBarcode,
  IconScale,
  IconClock,
  IconUser,
  IconPhone,
  IconMail,
  IconStar,
  IconTemperature,
  IconDroplet,
  IconEdit,
  IconTrash,
  IconEye,
  IconQrcode,
  IconPrinter,
  IconDownload
} from '@tabler/icons-react';
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Batch, Product } from '@/types/inventory';

interface BatchManagementCardProps {
  batches: Batch[];
  product?: Product;
  className?: string;
  onBatchUpdate?: (batch: Batch) => void;
  onBatchDelete?: (batchId: string) => void;
}

export function BatchManagementCard({
  batches,
  product,
  className,
  onBatchUpdate,
  onBatchDelete
}: BatchManagementCardProps) {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'expiring' | 'expired'
  >('all');

  // Lọc và sắp xếp batches
  const filteredBatches = batches
    .filter((batch) => {
      const daysToExpiry = differenceInDays(
        new Date(batch.expiryDate),
        new Date()
      );

      switch (filterStatus) {
        case 'active':
          return batch.status === 'active' && daysToExpiry > 7;
        case 'expiring':
          return (
            batch.status === 'active' && daysToExpiry <= 7 && daysToExpiry >= 0
          );
        case 'expired':
          return batch.status === 'expired' || daysToExpiry < 0;
        default:
          return true;
      }
    })
    .sort(
      (a, b) =>
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );

  // Thống kê batches
  const stats = {
    total: batches.length,
    active: batches.filter((b) => b.status === 'active').length,
    expiring: batches.filter((b) => {
      const days = differenceInDays(new Date(b.expiryDate), new Date());
      return b.status === 'active' && days <= 7 && days >= 0;
    }).length,
    expired: batches.filter((b) => {
      const days = differenceInDays(new Date(b.expiryDate), new Date());
      return b.status === 'expired' || days < 0;
    }).length,
    totalQuantity: batches.reduce((sum, b) => sum + b.remainingQuantity, 0),
    totalValue: batches.reduce(
      (sum, b) => sum + b.remainingQuantity * b.sellingPrice,
      0
    )
  };

  // Xác định chất lượng batch
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'A':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Xác định trạng thái batch
  const getBatchStatus = (batch: Batch) => {
    const daysToExpiry = differenceInDays(
      new Date(batch.expiryDate),
      new Date()
    );

    if (batch.status === 'expired' || daysToExpiry < 0) {
      return {
        color: 'destructive',
        text: 'Hết hạn',
        icon: IconAlertTriangle,
        bgColor: 'bg-red-50 border-red-200'
      };
    }
    if (daysToExpiry <= 1) {
      return {
        color: 'destructive',
        text: daysToExpiry === 0 ? 'Hôm nay' : '1 ngày',
        icon: IconClock,
        bgColor: 'bg-red-50 border-red-200'
      };
    }
    if (daysToExpiry <= 3) {
      return {
        color: 'destructive',
        text: `${daysToExpiry} ngày`,
        icon: IconClock,
        bgColor: 'bg-orange-50 border-orange-200'
      };
    }
    if (daysToExpiry <= 7) {
      return {
        color: 'secondary',
        text: `${daysToExpiry} ngày`,
        icon: IconClock,
        bgColor: 'bg-yellow-50 border-yellow-200'
      };
    }
    return {
      color: 'outline',
      text: `${daysToExpiry} ngày`,
      icon: IconClock,
      bgColor: 'bg-green-50 border-green-200'
    };
  };

  const getUsagePercentage = (batch: Batch) => {
    return ((batch.quantity - batch.remainingQuantity) / batch.quantity) * 100;
  };

  return (
    <TooltipProvider>
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <IconPackage className='h-5 w-5' />
                Quản lý lô hàng
                {product && (
                  <span className='text-muted-foreground'>
                    - {product.name}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Theo dõi chi tiết từng lô hàng và ngày hết hạn
              </CardDescription>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm'>
                <IconDownload className='mr-2 h-4 w-4' />
                Xuất báo cáo
              </Button>
              <Button variant='outline' size='sm'>
                <IconPrinter className='mr-2 h-4 w-4' />
                In nhãn
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Thống kê tổng quan */}
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <Card className='p-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-muted-foreground text-sm'>Tổng lô hàng</p>
                  <p className='text-2xl font-bold'>{stats.total}</p>
                </div>
                <IconPackage className='h-8 w-8 text-blue-500' />
              </div>
            </Card>

            <Card className='p-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-muted-foreground text-sm'>Sắp hết hạn</p>
                  <p className='text-2xl font-bold text-orange-600'>
                    {stats.expiring}
                  </p>
                </div>
                <IconClock className='h-8 w-8 text-orange-500' />
              </div>
            </Card>

            <Card className='p-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-muted-foreground text-sm'>Đã hết hạn</p>
                  <p className='text-2xl font-bold text-red-600'>
                    {stats.expired}
                  </p>
                </div>
                <IconAlertTriangle className='h-8 w-8 text-red-500' />
              </div>
            </Card>

            <Card className='p-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-muted-foreground text-sm'>Tổng giá trị</p>
                  <p className='text-lg font-bold text-green-600'>
                    {stats.totalValue.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <IconScale className='h-8 w-8 text-green-500' />
              </div>
            </Card>
          </div>

          {/* Bộ lọc */}
          <div className='flex gap-2'>
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setFilterStatus('all')}
            >
              Tất cả ({stats.total})
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setFilterStatus('active')}
            >
              Hoạt động ({stats.active})
            </Button>
            <Button
              variant={filterStatus === 'expiring' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setFilterStatus('expiring')}
            >
              Sắp hết hạn ({stats.expiring})
            </Button>
            <Button
              variant={filterStatus === 'expired' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setFilterStatus('expired')}
            >
              Hết hạn ({stats.expired})
            </Button>
          </div>

          <Separator />

          {/* Danh sách lô hàng */}
          <div className='space-y-3'>
            {filteredBatches.length === 0 ? (
              <div className='py-8 text-center'>
                <IconPackage className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
                <p className='text-muted-foreground'>
                  Không có lô hàng nào phù hợp
                </p>
              </div>
            ) : (
              filteredBatches.map((batch) => {
                const batchStatus = getBatchStatus(batch);
                const StatusIcon = batchStatus.icon;
                const usagePercentage = getUsagePercentage(batch);

                return (
                  <Card
                    key={batch.id}
                    className={cn('p-4', batchStatus.bgColor)}
                  >
                    <div className='space-y-3'>
                      {/* Header */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div>
                            <div className='flex items-center gap-2'>
                              <h4 className='font-semibold'>
                                {batch.batchNumber}
                              </h4>
                              <Badge
                                className={getQualityColor(batch.quality)}
                                variant='outline'
                              >
                                Loại {batch.quality}
                              </Badge>
                              <Badge
                                variant={batchStatus.color as any}
                                className='gap-1'
                              >
                                <StatusIcon className='h-3 w-3' />
                                {batchStatus.text}
                              </Badge>
                            </div>
                            <div className='text-muted-foreground mt-1 flex items-center gap-4 text-sm'>
                              <span className='flex items-center gap-1'>
                                <IconMapPin className='h-3 w-3' />
                                {batch.origin}
                              </span>
                              <span className='flex items-center gap-1'>
                                <IconUser className='h-3 w-3' />
                                {batch.supplier.name}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center gap-2'>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => setSelectedBatch(batch)}
                              >
                                <IconEye className='h-4 w-4' />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='max-w-2xl'>
                              <DialogHeader>
                                <DialogTitle>
                                  Chi tiết lô hàng {batch.batchNumber}
                                </DialogTitle>
                                <DialogDescription>
                                  Thông tin chi tiết về lô hàng và lịch sử giao
                                  dịch
                                </DialogDescription>
                              </DialogHeader>
                              {selectedBatch && (
                                <div className='space-y-4'>
                                  <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                      <h5 className='font-medium'>
                                        Thông tin cơ bản
                                      </h5>
                                      <div className='space-y-1 text-sm'>
                                        <div className='flex justify-between'>
                                          <span className='text-muted-foreground'>
                                            Mã lô:
                                          </span>
                                          <span>
                                            {selectedBatch.batchNumber}
                                          </span>
                                        </div>
                                        <div className='flex justify-between'>
                                          <span className='text-muted-foreground'>
                                            Số lượng ban đầu:
                                          </span>
                                          <span>
                                            {selectedBatch.quantity}{' '}
                                            {selectedBatch.unit}
                                          </span>
                                        </div>
                                        <div className='flex justify-between'>
                                          <span className='text-muted-foreground'>
                                            Còn lại:
                                          </span>
                                          <span>
                                            {selectedBatch.remainingQuantity}{' '}
                                            {selectedBatch.unit}
                                          </span>
                                        </div>
                                        <div className='flex justify-between'>
                                          <span className='text-muted-foreground'>
                                            Chất lượng:
                                          </span>
                                          <Badge
                                            className={getQualityColor(
                                              selectedBatch.quality
                                            )}
                                            variant='outline'
                                          >
                                            Loại {selectedBatch.quality}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>

                                    <div className='space-y-2'>
                                      <h5 className='font-medium'>
                                        Thông tin ngày tháng
                                      </h5>
                                      <div className='space-y-1 text-sm'>
                                        <div className='flex justify-between'>
                                          <span className='text-muted-foreground'>
                                            Ngày sản xuất:
                                          </span>
                                          <span>
                                            {format(
                                              new Date(
                                                selectedBatch.manufacturingDate
                                              ),
                                              'dd/MM/yyyy',
                                              { locale: vi }
                                            )}
                                          </span>
                                        </div>
                                        <div className='flex justify-between'>
                                          <span className='text-muted-foreground'>
                                            Ngày nhập kho:
                                          </span>
                                          <span>
                                            {format(
                                              new Date(
                                                selectedBatch.receivedDate
                                              ),
                                              'dd/MM/yyyy',
                                              { locale: vi }
                                            )}
                                          </span>
                                        </div>
                                        <div className='flex justify-between'>
                                          <span className='text-muted-foreground'>
                                            Ngày hết hạn:
                                          </span>
                                          <span
                                            className={cn(
                                              differenceInDays(
                                                new Date(
                                                  selectedBatch.expiryDate
                                                ),
                                                new Date()
                                              ) <= 7
                                                ? 'font-medium text-red-600'
                                                : ''
                                            )}
                                          >
                                            {format(
                                              new Date(
                                                selectedBatch.expiryDate
                                              ),
                                              'dd/MM/yyyy',
                                              { locale: vi }
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <Separator />

                                  <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                      <h5 className='font-medium'>
                                        Thông tin giá cả
                                      </h5>
                                      <div className='space-y-1 text-sm'>
                                        <div className='flex justify-between'>
                                          <span className='text-muted-foreground'>
                                            Giá nhập:
                                          </span>
                                          <span>
                                            {selectedBatch.purchasePrice.toLocaleString(
                                              'vi-VN'
                                            )}
                                            đ/{selectedBatch.unit}
                                          </span>
                                        </div>
                                        <div className='flex justify-between'>
                                          <span className='text-muted-foreground'>
                                            Giá bán:
                                          </span>
                                          <span>
                                            {selectedBatch.sellingPrice.toLocaleString(
                                              'vi-VN'
                                            )}
                                            đ/{selectedBatch.unit}
                                          </span>
                                        </div>
                                        <div className='flex justify-between'>
                                          <span className='text-muted-foreground'>
                                            Tổng giá trị:
                                          </span>
                                          <span className='font-medium'>
                                            {(
                                              selectedBatch.remainingQuantity *
                                              selectedBatch.sellingPrice
                                            ).toLocaleString('vi-VN')}
                                            đ
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className='space-y-2'>
                                      <h5 className='font-medium'>
                                        Nhà cung cấp
                                      </h5>
                                      <div className='space-y-1 text-sm'>
                                        <div className='flex justify-between'>
                                          <span className='text-muted-foreground'>
                                            Tên:
                                          </span>
                                          <span>
                                            {selectedBatch.supplier.name}
                                          </span>
                                        </div>
                                        <div className='flex justify-between'>
                                          <span className='text-muted-foreground'>
                                            Người liên hệ:
                                          </span>
                                          <span>
                                            {
                                              selectedBatch.supplier
                                                .contactPerson
                                            }
                                          </span>
                                        </div>
                                        <div className='flex justify-between'>
                                          <span className='text-muted-foreground'>
                                            Đánh giá:
                                          </span>
                                          <div className='flex items-center gap-1'>
                                            <IconStar className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                                            <span>
                                              {selectedBatch.supplier.rating}/5
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {selectedBatch.notes && (
                                    <>
                                      <Separator />
                                      <div>
                                        <h5 className='mb-2 font-medium'>
                                          Ghi chú
                                        </h5>
                                        <p className='text-muted-foreground text-sm'>
                                          {selectedBatch.notes}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant='ghost' size='sm'>
                                <IconQrcode className='h-4 w-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Xem mã QR</p>
                            </TooltipContent>
                          </Tooltip>

                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => onBatchUpdate?.(batch)}
                          >
                            <IconEdit className='h-4 w-4' />
                          </Button>

                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => onBatchDelete?.(batch.id)}
                            className='text-red-600 hover:text-red-700'
                          >
                            <IconTrash className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>

                      {/* Thông tin chi tiết */}
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between text-sm'>
                            <span className='text-muted-foreground'>
                              Đã sử dụng
                            </span>
                            <span>
                              {batch.quantity - batch.remainingQuantity}/
                              {batch.quantity} {batch.unit}
                            </span>
                          </div>
                          <Progress value={usagePercentage} className='h-2' />
                        </div>

                        <div className='space-y-1'>
                          <div className='flex items-center gap-2 text-sm'>
                            <IconCalendar className='text-muted-foreground h-4 w-4' />
                            <span className='text-muted-foreground'>HSD:</span>
                            <span
                              className={cn(
                                differenceInDays(
                                  new Date(batch.expiryDate),
                                  new Date()
                                ) <= 7
                                  ? 'font-medium text-red-600'
                                  : ''
                              )}
                            >
                              {format(
                                new Date(batch.expiryDate),
                                'dd/MM/yyyy',
                                { locale: vi }
                              )}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-sm'>
                            <IconTruck className='text-muted-foreground h-4 w-4' />
                            <span className='text-muted-foreground'>Nhập:</span>
                            <span>
                              {format(
                                new Date(batch.receivedDate),
                                'dd/MM/yyyy',
                                { locale: vi }
                              )}
                            </span>
                          </div>
                        </div>

                        <div className='text-right'>
                          <div className='text-lg font-semibold'>
                            {batch.sellingPrice.toLocaleString('vi-VN')}đ/
                            {batch.unit}
                          </div>
                          <div className='text-muted-foreground text-sm'>
                            Tổng:{' '}
                            {(
                              batch.remainingQuantity * batch.sellingPrice
                            ).toLocaleString('vi-VN')}
                            đ
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
