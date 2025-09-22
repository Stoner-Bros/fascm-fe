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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
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
  IconChevronDown,
  IconChevronUp,
  IconBarcode,
  IconScale,
  IconClock,
  IconUser,
  IconPhone,
  IconMail,
  IconStar,
  IconTemperature,
  IconDroplet
} from '@tabler/icons-react';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Product, Batch, Supplier, Area } from '@/types/inventory';

interface ProductDetailCardProps {
  product: Product;
  className?: string;
}

export function ProductDetailCard({
  product,
  className
}: ProductDetailCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Tính toán thống kê
  const stockPercentage = (product.currentStock / product.maxStockLevel) * 100;
  const availablePercentage =
    (product.availableStock / product.currentStock) * 100;

  // Lọc và sắp xếp batches theo ngày hết hạn
  const sortedBatches = [...product.batches].sort(
    (a, b) =>
      new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  const expiringSoonBatches = sortedBatches.filter((batch) => {
    const daysToExpiry = differenceInDays(
      new Date(batch.expiryDate),
      new Date()
    );
    return daysToExpiry <= 7 && daysToExpiry >= 0 && batch.status === 'active';
  });

  const expiredBatches = sortedBatches.filter(
    (batch) =>
      isBefore(new Date(batch.expiryDate), new Date()) &&
      batch.status === 'active'
  );

  // Xác định trạng thái tồn kho
  const getStockStatus = () => {
    if (product.currentStock === 0)
      return { status: 'out', color: 'destructive', text: 'Hết hàng' };
    if (product.currentStock <= product.minStockLevel)
      return { status: 'low', color: 'destructive', text: 'Sắp hết' };
    if (product.currentStock >= product.maxStockLevel * 0.8)
      return { status: 'high', color: 'default', text: 'Dư thừa' };
    return { status: 'normal', color: 'secondary', text: 'Bình thường' };
  };

  const stockStatus = getStockStatus();

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
      return { color: 'destructive', text: 'Hết hạn', icon: IconAlertTriangle };
    }
    if (daysToExpiry <= 3) {
      return {
        color: 'destructive',
        text: `${daysToExpiry} ngày`,
        icon: IconClock
      };
    }
    if (daysToExpiry <= 7) {
      return {
        color: 'secondary',
        text: `${daysToExpiry} ngày`,
        icon: IconClock
      };
    }
    return { color: 'outline', text: `${daysToExpiry} ngày`, icon: IconClock };
  };

  return (
    <TooltipProvider>
      <Card className={cn('w-full', className)}>
        <CardHeader className='pb-3'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <IconPackage className='text-muted-foreground h-5 w-5' />
                {product.name}
              </CardTitle>
              <CardDescription className='flex items-center gap-4'>
                <span className='flex items-center gap-1'>
                  <IconBarcode className='h-4 w-4' />
                  SKU: {product.sku}
                </span>
                <span>•</span>
                <span>{product.category.name}</span>
              </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant={stockStatus.color as any}>
                {stockStatus.text}
              </Badge>
              {expiredBatches.length > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant='destructive' className='gap-1'>
                      <IconAlertTriangle className='h-3 w-3' />
                      {expiredBatches.length}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{expiredBatches.length} lô hàng đã hết hạn</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {expiringSoonBatches.length > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant='secondary' className='gap-1'>
                      <IconClock className='h-3 w-3' />
                      {expiringSoonBatches.length}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{expiringSoonBatches.length} lô hàng sắp hết hạn</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Thông tin tồn kho */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Tồn kho hiện tại</span>
                <span className='font-medium'>
                  {product.currentStock} {product.unit}
                </span>
              </div>
              <Progress value={stockPercentage} className='h-2' />
              <div className='text-muted-foreground flex justify-between text-xs'>
                <span>Min: {product.minStockLevel}</span>
                <span>Max: {product.maxStockLevel}</span>
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Có thể sử dụng</span>
                <span className='font-medium text-green-600'>
                  {product.availableStock} {product.unit}
                </span>
              </div>
              <Progress value={availablePercentage} className='h-2' />
              {/* <div className='text-muted-foreground text-xs'>
                Đã đặt trước: {product.reservedStock} {product.unit}
              </div> */}
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm'>
                <IconUser className='text-muted-foreground h-4 w-4' />
                <span className='text-muted-foreground'>Nhà cung cấp</span>
              </div>
              <div className='space-y-1'>
                <p className='font-medium'>{product.supplier.name}</p>
                <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                  <div className='flex items-center gap-1'>
                    <IconStar className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                    <span>{product.supplier.rating}/5</span>
                  </div>
                  <span>•</span>
                  <span>{product.supplier.contactPerson}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Yêu cầu bảo quản */}
          <div className='space-y-2'>
            <h4 className='flex items-center gap-2 text-sm font-medium'>
              <IconTemperature className='h-4 w-4' />
              Yêu cầu bảo quản
            </h4>
            <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
              <div className='flex items-center gap-2'>
                <IconTemperature className='h-4 w-4 text-blue-500' />
                <span className='text-muted-foreground'>Nhiệt độ:</span>
                <span>
                  {product.storageRequirements.minTemperature}°C -{' '}
                  {product.storageRequirements.maxTemperature}°C
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <IconDroplet className='h-4 w-4 text-blue-500' />
                <span className='text-muted-foreground'>Độ ẩm:</span>
                <span>
                  {product.storageRequirements.minHumidity}% -{' '}
                  {product.storageRequirements.maxHumidity}%
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <IconClock className='h-4 w-4 text-orange-500' />
                <span className='text-muted-foreground'>Hạn sử dụng:</span>
                <span>{product.category.shelfLife} ngày</span>
              </div>
              <div className='flex items-center gap-2'>
                <IconPackage className='h-4 w-4 text-green-500' />
                <span className='text-muted-foreground'>Loại lưu trữ:</span>
                <span className='capitalize'>
                  {product.category.storageType}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Danh sách lô hàng */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant='ghost'
                className='h-auto w-full justify-between p-0'
              >
                <h4 className='flex items-center gap-2 text-sm font-medium'>
                  <IconScale className='h-4 w-4' />
                  Danh sách lô hàng ({product.batches.length})
                </h4>
                {isExpanded ? (
                  <IconChevronUp className='h-4 w-4' />
                ) : (
                  <IconChevronDown className='h-4 w-4' />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className='mt-3 space-y-3'>
              {sortedBatches.length === 0 ? (
                <p className='text-muted-foreground py-4 text-center text-sm'>
                  Chưa có lô hàng nào
                </p>
              ) : (
                <div className='space-y-2'>
                  {sortedBatches.map((batch) => {
                    const batchStatus = getBatchStatus(batch);
                    const StatusIcon = batchStatus.icon;

                    return (
                      <Card key={batch.id} className='p-3'>
                        <div className='flex items-center justify-between'>
                          <div className='space-y-1'>
                            <div className='flex items-center gap-2'>
                              <span className='text-sm font-medium'>
                                {batch.batchNumber}
                              </span>
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
                            <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                              <span className='flex items-center gap-1'>
                                <IconScale className='h-3 w-3' />
                                {batch.remainingQuantity}/{batch.quantity}{' '}
                                {batch.unit}
                              </span>
                              <span className='flex items-center gap-1'>
                                <IconMapPin className='h-3 w-3' />
                                {batch.origin}
                              </span>
                              <span className='flex items-center gap-1'>
                                <IconCalendar className='h-3 w-3' />
                                HSD:{' '}
                                {format(
                                  new Date(batch.expiryDate),
                                  'dd/MM/yyyy',
                                  { locale: vi }
                                )}
                              </span>
                            </div>
                          </div>
                          <div className='text-right'>
                            <div className='text-muted-foreground text-xs'>
                              Nhập:{' '}
                              {format(
                                new Date(batch.receivedDate),
                                'dd/MM/yyyy',
                                { locale: vi }
                              )}
                            </div>
                          </div>
                        </div>
                        {batch.notes && (
                          <div className='mt-2 border-t pt-2'>
                            <p className='text-muted-foreground text-xs'>
                              {batch.notes}
                            </p>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
