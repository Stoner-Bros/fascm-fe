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
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Area } from '@/types/area';
import { ArrowLeft, Calendar, Package, RefreshCw, Layers } from 'lucide-react';
import { BatchGroupedByWeight, OrderInvoiceDetail } from '../types';

interface BatchSelectorProps {
  batches: BatchGroupedByWeight[];
  selectedBatchIds: string[];
  selectedArea: Area | null;
  selectedInvoiceDetail: OrderInvoiceDetail | null;
  loading: boolean;
  error: string | null;
  onToggle: (batchId: string) => void;
  onRefresh: () => void;
  onNext: () => void;
  onBack: () => void;
}

// Helper to get batch ID (using importTicketId as the unique identifier)
const getBatchId = (batch: BatchGroupedByWeight): string => {
  return batch.importTicketId;
};

// Helper to calculate total batch count from batch object
const getTotalBatchCount = (batch: Record<string, number>): number => {
  return Object.values(batch).reduce((sum, count) => sum + count, 0);
};

// Helper to format batch sizes
const formatBatchSizes = (batch: Record<string, number>): string => {
  return Object.entries(batch)
    .map(([size, count]) => `${count}x ${size}`)
    .join(', ');
};

export function BatchSelector({
  batches,
  selectedBatchIds,
  selectedArea,
  selectedInvoiceDetail,
  loading,
  error,
  onToggle,
  onRefresh,
  onNext,
  onBack
}: BatchSelectorProps) {
  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate total selected batches
  const totalSelectedBatches = batches
    .filter((batch) => selectedBatchIds.includes(getBatchId(batch)))
    .reduce((sum, batch) => sum + getTotalBatchCount(batch.batch), 0);

  if (loading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-9 w-24' />
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className='h-32 rounded-lg' />
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

  if (batches.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-10'>
          <Layers className='text-muted-foreground mb-4 h-12 w-12' />
          <p className='text-muted-foreground mb-2'>
            Không có lô hàng nào trong khu vực này
          </p>
          <p className='text-muted-foreground mb-4 text-sm'>
            Khu vực: {selectedArea?.name || '-'} | Sản phẩm:{' '}
            {selectedInvoiceDetail?.product?.name || '-'}
          </p>
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
          <h3 className='text-lg font-semibold'>Chọn lô hàng</h3>
          <p className='text-muted-foreground text-sm'>
            Chọn một hoặc nhiều lô hàng để xuất kho
          </p>
        </div>
        <Button variant='outline' size='sm' onClick={onRefresh}>
          <RefreshCw className='mr-2 h-4 w-4' />
          Tải lại
        </Button>
      </div>

      {/* Selection summary */}
      <Card className='bg-muted/50'>
        <CardContent className='py-4'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                <Package className='text-primary h-5 w-5' />
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>Đã chọn</p>
                <p className='font-semibold'>
                  {selectedBatchIds.length} phiếu nhập
                </p>
              </div>
            </div>
            <div className='flex gap-6'>
              <div className='text-right'>
                <p className='text-muted-foreground text-sm'>Tổng số lô</p>
                <p className='font-semibold'>{totalSelectedBatches}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {batches.map((batch) => {
          const batchId = getBatchId(batch);
          const isSelected = selectedBatchIds.includes(batchId);
          const batchCount = getTotalBatchCount(batch.batch);

          return (
            <Card
              key={batchId}
              className={cn(
                'hover:border-primary/50 cursor-pointer transition-all hover:shadow-md',
                isSelected && 'border-primary ring-primary/20 ring-2'
              )}
              onClick={() => onToggle(batchId)}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    {batch.product?.image ? (
                      <img
                        src={batch.product.image}
                        alt={batch.product.name || 'Product'}
                        className='h-10 w-10 rounded-lg object-cover'
                      />
                    ) : (
                      <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-lg'>
                        <Package className='text-muted-foreground h-5 w-5' />
                      </div>
                    )}
                    <div>
                      <CardTitle className='text-sm'>
                        {batch.batchCode}
                      </CardTitle>
                      <CardDescription className='text-xs'>
                        {batch.product?.name || 'Sản phẩm'}
                      </CardDescription>
                    </div>
                  </div>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggle(batchId)}
                    className='mt-0.5'
                  />
                </div>
              </CardHeader>
              <CardContent className='space-y-2'>
                {/* Batch sizes */}
                <div className='text-sm'>
                  <span className='text-muted-foreground'>Số lô:</span>
                  <p className='font-medium'>
                    {formatBatchSizes(batch.batch)} ({batchCount} lô)
                  </p>
                </div>

                {/* Dates */}
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  {batch.importDate && (
                    <div className='text-muted-foreground flex items-center gap-1'>
                      <Calendar className='h-3 w-3' />
                      <span className='text-xs'>
                        Nhập: {formatDate(batch.importDate)}
                      </span>
                    </div>
                  )}
                  {batch.expiredAt && (
                    <div className='flex items-center gap-1 text-orange-600'>
                      <Calendar className='h-3 w-3' />
                      <span className='text-xs'>
                        HSD: {formatDate(batch.expiredAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Prices */}
                {batch.prices && Object.keys(batch.prices).length > 0 && (
                  <div className='flex flex-wrap gap-1'>
                    {Object.entries(batch.prices)
                      .slice(0, 2)
                      .map(([size, price]) => (
                        <Badge key={size} variant='outline' className='text-xs'>
                          {size}: {new Intl.NumberFormat('vi-VN').format(price)}
                          đ
                        </Badge>
                      ))}
                  </div>
                )}
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
        <Button onClick={onNext} disabled={selectedBatchIds.length === 0}>
          Tiếp tục ({selectedBatchIds.length} phiếu)
        </Button>
      </div>
    </div>
  );
}
