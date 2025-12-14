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
import { Separator } from '@/components/ui/separator';
import { Area } from '@/types/area';
import { OrderPhase, OrderSchedule } from '@/types/order';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  FileText,
  Layers,
  Loader2,
  MapPin,
  Package,
  Send,
  Warehouse
} from 'lucide-react';
import { BatchGroupedByWeight, OrderInvoiceDetail } from '../types';

interface ExportTicketSummaryProps {
  selectedSchedule: OrderSchedule | null;
  selectedPhase: OrderPhase | null;
  selectedInvoiceDetail: OrderInvoiceDetail | null;
  selectedArea: Area | null;
  selectedBatchIds: string[];
  batches: BatchGroupedByWeight[];
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  onSubmit: () => void;
  onBack: () => void;
  onReset: () => void;
}

// Helper to get batch ID
const getBatchId = (batch: BatchGroupedByWeight): string => {
  return batch.importTicketId;
};

// Helper to calculate total batch count
const getTotalBatchCount = (batch: Record<string, number>): number => {
  return Object.values(batch).reduce((sum, count) => sum + count, 0);
};

// Helper to format batch sizes
const formatBatchSizes = (batch: Record<string, number>): string => {
  return Object.entries(batch)
    .map(([size, count]) => `${count}x ${size}`)
    .join(', ');
};

export function ExportTicketSummary({
  selectedSchedule,
  selectedPhase,
  selectedInvoiceDetail,
  selectedArea,
  selectedBatchIds,
  batches,
  isSubmitting,
  submitError,
  submitSuccess,
  onSubmit,
  onBack,
  onReset
}: ExportTicketSummaryProps) {
  const selectedBatches = batches.filter((b) =>
    selectedBatchIds.includes(getBatchId(b))
  );

  const totalBatchCount = selectedBatches.reduce(
    (sum, batch) => sum + getTotalBatchCount(batch.batch),
    0
  );

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Success state
  if (submitSuccess) {
    return (
      <Card className='border-green-500'>
        <CardContent className='flex flex-col items-center justify-center py-16'>
          <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
            <CheckCircle className='h-8 w-8 text-green-600' />
          </div>
          <h3 className='mb-2 text-xl font-semibold text-green-700'>
            Tạo phiếu xuất kho thành công!
          </h3>
          <p className='text-muted-foreground mb-6 text-center'>
            Phiếu xuất kho đã được tạo và lưu vào hệ thống.
          </p>
          <div className='flex gap-3'>
            <Button variant='outline' onClick={onReset}>
              Tạo phiếu mới
            </Button>
            <Button
              onClick={() =>
                (window.location.href = '/dashboard/order-sale/export')
              }
            >
              Xem danh sách
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Validation check
  const isValid =
    selectedSchedule &&
    selectedPhase &&
    selectedInvoiceDetail &&
    selectedArea &&
    selectedBatchIds.length > 0;

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold'>Xác nhận tạo phiếu xuất kho</h3>
        <p className='text-muted-foreground text-sm'>
          Vui lòng kiểm tra thông tin trước khi tạo phiếu
        </p>
      </div>

      {/* Summary cards */}
      <div className='grid gap-4 md:grid-cols-2'>
        {/* Schedule info */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Calendar className='h-4 w-4' />
              Lịch giao hàng
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Mã lịch:</span>
              <span className='font-medium'>
                {selectedSchedule?.id.slice(0, 8) || '-'}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Ngày giao:</span>
              <span className='font-medium'>
                {formatDate(selectedSchedule?.deliveryDate)}
              </span>
            </div>
            {selectedSchedule?.consignee && (
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Khách hàng:</span>
                <span className='max-w-[150px] truncate font-medium'>
                  {selectedSchedule.consignee.organizationName ||
                    selectedSchedule.consignee.representativeName ||
                    '-'}
                </span>
              </div>
            )}
            {selectedSchedule?.address && (
              <div className='flex items-start gap-2'>
                <MapPin className='text-muted-foreground mt-0.5 h-4 w-4' />
                <span className='text-muted-foreground line-clamp-2'>
                  {selectedSchedule.address}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Phase & Invoice info */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <FileText className='h-4 w-4' />
              Đợt giao hàng
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Đợt số:</span>
              <span className='font-medium'>
                {selectedPhase?.phaseNumber ||
                  selectedPhase?.id.slice(0, 6) ||
                  '-'}
              </span>
            </div>
            {selectedPhase?.orderInvoice && (
              <>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Số hóa đơn:</span>
                  <span className='font-medium'>
                    {selectedPhase.orderInvoice.invoiceNumber || '-'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Tổng tiền:</span>
                  <span className='font-medium'>
                    {formatCurrency(selectedPhase.orderInvoice.totalAmount)}
                  </span>
                </div>
              </>
            )}
            <Badge variant='secondary' className='mt-2'>
              {selectedPhase?.status || 'preparing'}
            </Badge>
          </CardContent>
        </Card>

        {/* Product info */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Package className='h-4 w-4' />
              Sản phẩm xuất kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-3'>
              {selectedInvoiceDetail?.product?.image ? (
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
                  {selectedInvoiceDetail?.product?.name || 'Sản phẩm'}
                </p>
                <p className='text-muted-foreground text-sm'>
                  Số lượng yêu cầu: {selectedInvoiceDetail?.quantity || 0}{' '}
                  {selectedInvoiceDetail?.unit || ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Area info */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Warehouse className='h-4 w-4' />
              Khu vực kho
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Tên khu vực:</span>
              <span className='font-medium'>{selectedArea?.name || '-'}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Vị trí:</span>
              <span className='max-w-[150px] truncate font-medium'>
                {selectedArea?.location || '-'}
              </span>
            </div>
            {selectedArea?.warehouse && (
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Kho:</span>
                <span className='font-medium'>
                  {selectedArea.warehouse.name || '-'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected batches */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Layers className='h-4 w-4' />
            Lô hàng xuất kho ({selectedBatches.length} phiếu nhập)
          </CardTitle>
          <CardDescription>Tổng số lô: {totalBatchCount}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {selectedBatches.map((batch, index) => (
              <div key={getBatchId(batch)}>
                <div className='flex items-center justify-between py-2'>
                  <div className='flex items-center gap-3'>
                    <Badge variant='outline'>{index + 1}</Badge>
                    {batch.product?.image ? (
                      <img
                        src={batch.product.image}
                        alt={batch.product.name || 'Product'}
                        className='h-8 w-8 rounded object-cover'
                      />
                    ) : (
                      <div className='bg-muted flex h-8 w-8 items-center justify-center rounded'>
                        <Package className='text-muted-foreground h-4 w-4' />
                      </div>
                    )}
                    <div>
                      <p className='text-sm font-medium'>{batch.batchCode}</p>
                      <p className='text-muted-foreground text-xs'>
                        {formatBatchSizes(batch.batch)}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <span className='text-muted-foreground text-sm'>
                      Nhập: {formatDate(batch.importDate)}
                    </span>
                    {batch.expiredAt && (
                      <p className='text-xs text-orange-600'>
                        HSD: {formatDate(batch.expiredAt)}
                      </p>
                    )}
                  </div>
                </div>
                {index < selectedBatches.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error message */}
      {submitError && (
        <Card className='border-destructive'>
          <CardContent className='py-4'>
            <p className='text-destructive text-sm'>{submitError}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className='flex justify-between pt-4'>
        <Button variant='outline' onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Quay lại
        </Button>
        <Button onClick={onSubmit} disabled={!isValid || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Đang xử lý...
            </>
          ) : (
            <>
              <Send className='mr-2 h-4 w-4' />
              Tạo phiếu xuất kho
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
