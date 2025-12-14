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
import { cn } from '@/lib/utils';
import { OrderPhase } from '@/types/order';
import { ArrowLeft, CheckCircle2, Package } from 'lucide-react';
import { OrderInvoiceDetail } from '../types';

interface InvoiceDetailSelectorProps {
  phase: OrderPhase | null;
  selectedInvoiceDetail: OrderInvoiceDetail | null;
  onSelect: (invoiceDetail: OrderInvoiceDetail) => void;
  onNext: () => void;
  onBack: () => void;
}

export function InvoiceDetailSelector({
  phase,
  selectedInvoiceDetail,
  onSelect,
  onNext,
  onBack
}: InvoiceDetailSelectorProps) {
  const invoiceDetails = (phase?.orderInvoiceDetails ||
    []) as OrderInvoiceDetail[];

  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (!phase) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-10'>
          <Package className='text-muted-foreground mb-4 h-12 w-12' />
          <p className='text-muted-foreground mb-4'>
            Vui lòng chọn đợt giao hàng trước
          </p>
          <Button variant='outline' onClick={onBack}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Quay lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (invoiceDetails.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-10'>
          <Package className='text-muted-foreground mb-4 h-12 w-12' />
          <p className='text-muted-foreground mb-4'>
            Đợt giao hàng này không có sản phẩm nào
          </p>
          <Button variant='outline' onClick={onBack}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Quay lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-lg font-semibold'>Chọn sản phẩm cần xuất</h3>
        <p className='text-muted-foreground text-sm'>
          Chọn một sản phẩm từ hóa đơn để tạo phiếu xuất kho
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {invoiceDetails.map((detail) => {
          const isSelected = selectedInvoiceDetail?.id === detail.id;

          return (
            <Card
              key={detail.id}
              className={cn(
                'hover:border-primary/50 cursor-pointer transition-all hover:shadow-md',
                isSelected && 'border-primary ring-primary/20 ring-2'
              )}
              onClick={() => onSelect(detail)}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    {detail.product?.image ? (
                      <img
                        src={detail.product.image}
                        alt={detail.product.name || 'Product'}
                        className='h-12 w-12 rounded-lg object-cover'
                      />
                    ) : (
                      <div className='bg-muted flex h-12 w-12 items-center justify-center rounded-lg'>
                        <Package className='text-muted-foreground h-6 w-6' />
                      </div>
                    )}
                    <div>
                      <CardTitle className='text-base'>
                        {detail.product?.name || 'Sản phẩm'}
                      </CardTitle>
                      <CardDescription>
                        ID: {detail.id.slice(0, 8)}
                      </CardDescription>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className='text-primary h-5 w-5 shrink-0' />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div>
                    <span className='text-muted-foreground'>Số lượng:</span>
                    <p className='font-medium'>
                      {detail.quantity || 0} {detail.unit || ''}
                    </p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Đơn giá:</span>
                    <p className='font-medium'>
                      {formatCurrency(detail.unitPrice)}
                    </p>
                  </div>
                </div>
                {detail.product?.id && (
                  <Badge variant='outline' className='mt-3'>
                    Product ID: {detail.product.id.slice(0, 8)}
                  </Badge>
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
        {selectedInvoiceDetail && <Button onClick={onNext}>Tiếp tục</Button>}
      </div>
    </div>
  );
}
