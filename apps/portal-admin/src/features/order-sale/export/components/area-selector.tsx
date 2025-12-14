'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Area } from '@/types/area';
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Package,
  RefreshCw,
  Warehouse
} from 'lucide-react';
import { OrderInvoiceDetail } from '../types';

interface AreaSelectorProps {
  areas: Area[];
  selectedArea: Area | null;
  selectedInvoiceDetail: OrderInvoiceDetail | null;
  loading: boolean;
  error: string | null;
  onSelect: (area: Area) => void;
  onRefresh: () => void;
  onNext: () => void;
  onBack: () => void;
}

export function AreaSelector({
  areas,
  selectedArea,
  selectedInvoiceDetail,
  loading,
  error,
  onSelect,
  onRefresh,
  onNext,
  onBack
}: AreaSelectorProps) {
  if (loading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-9 w-24' />
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className='h-36 rounded-lg' />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className='border-destructive'>
        <CardContent className='flex flex-col items-center justify-center py-10'>
          <p className='text-destructive mb-4'>{error}</p>
          <Button variant='outline' onClick={onRefresh}>
            <RefreshCw className='mr-2 h-4 w-4' />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (areas.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-10'>
          <Warehouse className='text-muted-foreground mb-4 h-12 w-12' />
          <p className='text-muted-foreground mb-4'>Không có khu vực kho nào</p>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={onBack}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Quay lại
            </Button>
            <Button variant='outline' onClick={onRefresh}>
              <RefreshCw className='mr-2 h-4 w-4' />
              Tải lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>Chọn khu vực kho</h3>
          <p className='text-muted-foreground text-sm'>
            Chọn khu vực kho chứa lô hàng của sản phẩm{' '}
            <span className='text-foreground font-medium'>
              {selectedInvoiceDetail?.product?.name || ''}
            </span>
          </p>
        </div>
        <Button variant='outline' size='sm' onClick={onRefresh}>
          <RefreshCw className='mr-2 h-4 w-4' />
          Tải lại
        </Button>
      </div>

      {/* Selected product info */}
      {selectedInvoiceDetail && (
        <Card className='bg-muted/50'>
          <CardContent className='flex items-center gap-4 py-4'>
            {selectedInvoiceDetail.product?.image ? (
              <img
                src={selectedInvoiceDetail.product.image}
                alt={selectedInvoiceDetail.product.name || 'Product'}
                className='h-12 w-12 rounded-lg object-cover'
              />
            ) : (
              <div className='bg-muted flex h-12 w-12 items-center justify-center rounded-lg'>
                <Package className='text-muted-foreground h-6 w-6' />
              </div>
            )}
            <div>
              <p className='font-medium'>
                {selectedInvoiceDetail.product?.name || 'Sản phẩm'}
              </p>
              <p className='text-muted-foreground text-sm'>
                Số lượng: {selectedInvoiceDetail.quantity || 0}{' '}
                {selectedInvoiceDetail.unit || ''}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {areas.map((area) => {
          const isSelected = selectedArea?.id === area.id;
          const usedCapacity =
            area.capacity - (area.availableCapacity || area.capacity);
          const usagePercent = area.capacity
            ? Math.round((usedCapacity / area.capacity) * 100)
            : 0;

          return (
            <Card
              key={area.id}
              className={cn(
                'hover:border-primary/50 cursor-pointer transition-all hover:shadow-md',
                isSelected && 'border-primary ring-primary/20 ring-2'
              )}
              onClick={() => onSelect(area)}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-base'>{area.name}</CardTitle>
                    <CardDescription className='line-clamp-1'>
                      {area.description || 'Không có mô tả'}
                    </CardDescription>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className='text-primary h-5 w-5' />
                  )}
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center gap-2 text-sm'>
                  <MapPin className='text-muted-foreground h-4 w-4' />
                  <span className='line-clamp-1'>{area.location}</span>
                </div>

                {area.warehouse && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Warehouse className='text-muted-foreground h-4 w-4' />
                    <span>{area.warehouse.name || 'Kho'}</span>
                  </div>
                )}

                {/* Capacity bar */}
                <div className='space-y-1'>
                  <div className='text-muted-foreground flex justify-between text-xs'>
                    <span>Sức chứa</span>
                    <span>{usagePercent}% đã sử dụng</span>
                  </div>
                  <div className='bg-muted h-2 overflow-hidden rounded-full'>
                    <div
                      className={cn(
                        'h-full transition-all',
                        usagePercent < 50 && 'bg-green-500',
                        usagePercent >= 50 &&
                          usagePercent < 80 &&
                          'bg-yellow-500',
                        usagePercent >= 80 && 'bg-red-500'
                      )}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  <div className='flex justify-between text-xs'>
                    <span>
                      {area.availableCapacity || area.capacity} kg còn trống
                    </span>
                    <span>{area.capacity} kg tổng</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className='flex justify-between pt-4'>
        <Button variant='outline' onClick={onBack}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Quay lại
        </Button>
        {selectedArea && <Button onClick={onNext}>Tiếp tục</Button>}
      </div>
    </div>
  );
}
