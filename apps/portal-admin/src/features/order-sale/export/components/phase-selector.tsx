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
import { OrderPhase } from '@/types/order';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Package,
  RefreshCw
} from 'lucide-react';

interface PhaseSelectorProps {
  phases: OrderPhase[];
  selectedPhase: OrderPhase | null;
  loading: boolean;
  error: string | null;
  onSelect: (phase: OrderPhase) => void;
  onRefresh: () => void;
  onNext: () => void;
  onBack: () => void;
}

const PHASE_STATUS_LABELS: Record<string, string> = {
  preparing: 'Đang chuẩn bị',
  delivering: 'Đang giao',
  delivered: 'Đã giao',
  completed: 'Hoàn thành',
  canceled: 'Đã hủy'
};

const PHASE_STATUS_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  preparing: 'secondary',
  delivering: 'default',
  delivered: 'default',
  completed: 'default',
  canceled: 'destructive'
};

export function PhaseSelector({
  phases,
  selectedPhase,
  loading,
  error,
  onSelect,
  onRefresh,
  onNext,
  onBack
}: PhaseSelectorProps) {
  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-9 w-24' />
        </div>
        <div className='grid gap-4 md:grid-cols-2'>
          {[1, 2].map((i) => (
            <Skeleton key={i} className='h-48 rounded-lg' />
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

  if (phases.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-10'>
          <FileText className='text-muted-foreground mb-4 h-12 w-12' />
          <p className='text-muted-foreground mb-4'>
            Không có đợt giao hàng nào
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
          <h3 className='text-lg font-semibold'>Chọn đợt giao hàng</h3>
          <p className='text-muted-foreground text-sm'>
            Chọn một đợt giao hàng có chứa sản phẩm cần xuất
          </p>
        </div>
        <Button variant='outline' size='sm' onClick={onRefresh}>
          <RefreshCw className='mr-2 h-4 w-4' />
          Tải lại
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        {phases.map((phase) => {
          const isSelected = selectedPhase?.id === phase.id;
          const invoiceDetailsCount = phase.orderInvoiceDetails?.length || 0;

          return (
            <Card
              key={phase.id}
              className={cn(
                'hover:border-primary/50 cursor-pointer transition-all hover:shadow-md',
                isSelected && 'border-primary ring-primary/20 ring-2'
              )}
              onClick={() => onSelect(phase)}
            >
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-base'>
                    Đợt {phase.phaseNumber || '#' + phase.id.slice(0, 6)}
                  </CardTitle>
                  <Badge
                    variant={PHASE_STATUS_VARIANTS[phase.status || 'preparing']}
                  >
                    {PHASE_STATUS_LABELS[phase.status || 'preparing']}
                  </Badge>
                </div>
                <CardDescription className='line-clamp-2'>
                  {phase.description || 'Không có mô tả'}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-2'>
                {phase.orderInvoice && (
                  <div className='bg-muted/50 space-y-2 rounded-lg p-2'>
                    <div className='flex items-center gap-2 text-sm'>
                      <Package className='text-muted-foreground h-4 w-4' />
                      <span className='font-medium'>
                        {invoiceDetailsCount} sản phẩm trong đợt
                      </span>
                    </div>

                    {invoiceDetailsCount > 0 && (
                      <div className='flex flex-wrap gap-1'>
                        {phase.orderInvoiceDetails
                          ?.slice(0, 3)
                          .map((detail) => (
                            <Badge
                              key={detail.id}
                              variant='outline'
                              className='text-xs'
                            >
                              {detail.product?.name || 'Sản phẩm'}
                            </Badge>
                          ))}
                        {invoiceDetailsCount > 3 && (
                          <Badge
                            variant='secondary'
                            className='bg-secondary/10 text-secondary text-xs'
                          >
                            +{invoiceDetailsCount - 3} khác
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className='text-muted-foreground text-sm'>
                      Tổng tiền:{' '}
                      {formatCurrency(phase.orderInvoice.totalAmount)}
                    </div>
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
        {selectedPhase && <Button onClick={onNext}>Tiếp tục</Button>}
      </div>
    </div>
  );
}
