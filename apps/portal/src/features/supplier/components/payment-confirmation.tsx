'use client';

import { FormFileUpload } from '@/components/forms/form-file-upload';
import { FormTextarea } from '@/components/forms/form-textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormProvider } from 'react-hook-form';
import {
  HarvestBatch,
  mockHarvestBatches,
  statusColors,
  statusLabels
} from '@/types/harvest';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconCheck,
  IconCurrency,
  IconFileText,
  IconUpload,
  IconX
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const paymentConfirmationSchema = z.object({
  batchId: z.string().min(1, 'Vui lòng chọn đợt thu hoạch'),
  paymentProofs: z
    .array(z.any())
    .min(1, 'Vui lòng tải lên ít nhất một bằng chứng thanh toán'),
  notes: z.string().optional()
});

type PaymentConfirmationFormData = z.infer<typeof paymentConfirmationSchema>;

interface PaymentBatchCardProps {
  batch: HarvestBatch;
  isSelected: boolean;
  onSelect: (batchId: string) => void;
}

function PaymentBatchCard({
  batch,
  isSelected,
  onSelect
}: PaymentBatchCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected
          ? 'ring-primary border-primary ring-2'
          : 'border-border hover:shadow-md'
      }`}
      onClick={() => onSelect(batch.id)}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <CardTitle className='text-lg'>{batch.productName}</CardTitle>
            <p className='text-muted-foreground text-sm'>ID: {batch.id}</p>
          </div>
          <div className='flex flex-col items-end gap-2'>
            <Badge variant='secondary' className={statusColors[batch.status]}>
              {statusLabels[batch.status]}
            </Badge>
            {isSelected && <IconCheck className='text-primary h-5 w-5' />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='text-muted-foreground'>Số lượng:</span>
            <p className='font-medium'>
              {batch.quantity} {batch.unit}
            </p>
          </div>
          <div>
            <span className='text-muted-foreground'>Ngày giao:</span>
            <p className='font-medium'>
              {batch.deliveryDate
                ? format(batch.deliveryDate, 'dd/MM/yyyy', { locale: vi })
                : 'Chưa giao'}
            </p>
          </div>
          <div className='col-span-2'>
            <span className='text-muted-foreground'>Giá cuối cùng:</span>
            <p className='text-lg font-medium text-green-600'>
              {batch.finalPrice?.toLocaleString('vi-VN') ||
                batch.estimatedPrice?.toLocaleString('vi-VN')}{' '}
              ₫
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentConfirmation() {
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get only delivered batches that haven't been confirmed for payment
  const deliveredBatches = useMemo(() => {
    return mockHarvestBatches.filter(
      (batch) => batch.status === 'delivered' && !batch.paymentConfirmed
    );
  }, []);

  const selectedBatch = deliveredBatches.find(
    (batch) => batch.id === selectedBatchId
  );

  const form = useForm<PaymentConfirmationFormData>({
    resolver: zodResolver(paymentConfirmationSchema),
    defaultValues: {
      batchId: selectedBatchId,
      paymentProofs: [],
      notes: ''
    }
  });

  // Update form when batch selection changes
  React.useEffect(() => {
    form.setValue('batchId', selectedBatchId);
  }, [selectedBatchId, form]);

  const onSubmit = async (data: PaymentConfirmationFormData) => {
    if (!selectedBatch) {
      toast.error('Vui lòng chọn đợt thu hoạch');
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: Replace with actual API call
      // In production, send data to API
      void data; // Use data parameter to avoid linting warning
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('Đã xác nhận thanh toán thành công!');

      // Reset form
      form.reset();
      setSelectedBatchId('');
    } catch (error) {
      // Error handling
      toast.error('Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='mx-auto max-w-6xl space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold'>Xác nhận thanh toán</h1>
        <p className='text-muted-foreground'>
          Upload bằng chứng thanh toán cho các đợt thu hoạch đã được giao
        </p>
      </div>

      {deliveredBatches.length === 0 ? (
        <Card>
          <CardContent className='p-8 text-center'>
            <IconCurrency className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
            <h3 className='mb-2 text-lg font-semibold'>
              Không có đợt thu hoạch nào cần xác nhận thanh toán
            </h3>
            <p className='text-muted-foreground'>
              Khi có đợt thu hoạch được giao thành công, bạn có thể xác nhận
              thanh toán tại đây
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Batch Selection */}
          <div className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconFileText className='h-5 w-5' />
                  Chọn đợt thu hoạch ({deliveredBatches.length})
                </CardTitle>
              </CardHeader>
              <CardContent className='max-h-96 space-y-3 overflow-y-auto'>
                {deliveredBatches.map((batch) => (
                  <PaymentBatchCard
                    key={batch.id}
                    batch={batch}
                    isSelected={selectedBatchId === batch.id}
                    onSelect={setSelectedBatchId}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconUpload className='h-5 w-5' />
                  Tải lên bằng chứng thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedBatch ? (
                  <div className='py-8 text-center'>
                    <IconX className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
                    <p className='text-muted-foreground'>
                      Vui lòng chọn đợt thu hoạch để tiếp tục
                    </p>
                  </div>
                ) : (
                  <FormProvider {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className='space-y-6'
                    >
                      {/* Selected Batch Summary */}
                      <div className='bg-muted rounded-lg p-4'>
                        <h4 className='mb-2 font-medium'>
                          Đợt thu hoạch đã chọn:
                        </h4>
                        <div className='space-y-1 text-sm'>
                          <p>
                            <strong>Sản phẩm:</strong>{' '}
                            {selectedBatch.productName}
                          </p>
                          <p>
                            <strong>Số lượng:</strong> {selectedBatch.quantity}{' '}
                            {selectedBatch.unit}
                          </p>
                          <p>
                            <strong>Ngày giao:</strong>{' '}
                            {selectedBatch.deliveryDate
                              ? format(
                                  selectedBatch.deliveryDate,
                                  'dd/MM/yyyy HH:mm',
                                  { locale: vi }
                                )
                              : 'Chưa giao'}
                          </p>
                          <p>
                            <strong>Số tiền:</strong>
                            <span className='font-medium text-green-600'>
                              {' '}
                              {(
                                selectedBatch.finalPrice ||
                                selectedBatch.estimatedPrice
                              )?.toLocaleString('vi-VN')}{' '}
                              ₫
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* File Upload */}
                      <FormFileUpload
                        control={form.control}
                        name='paymentProofs'
                        label='Bằng chứng thanh toán'
                        description='Tải lên ảnh chụp biên lai, ảnh chuyển khoản, hoặc các bằng chứng thanh toán khác'
                        required
                        config={{
                          accept: {
                            'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
                            'application/pdf': ['.pdf']
                          },
                          maxFiles: 5,
                          maxSize: 10 * 1024 * 1024, // 10MB
                          multiple: true
                        }}
                      />

                      {/* Notes */}
                      <FormTextarea
                        control={form.control}
                        name='notes'
                        label='Ghi chú (tùy chọn)'
                        placeholder='Thêm ghi chú về thanh toán nếu có...'
                        config={{
                          maxLength: 300,
                          showCharCount: true,
                          rows: 3
                        }}
                      />

                      {/* Submit Button */}
                      <Button
                        type='submit'
                        className='w-full'
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                            Đang xác nhận...
                          </>
                        ) : (
                          <>
                            <IconCheck className='mr-2 h-4 w-4' />
                            Xác nhận thanh toán
                          </>
                        )}
                      </Button>
                    </form>
                  </FormProvider>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Hướng dẫn</CardTitle>
              </CardHeader>
              <CardContent className='text-muted-foreground space-y-2 text-sm'>
                <p>• Chọn đợt thu hoạch đã được giao thành công</p>
                <p>• Tải lên ảnh chụp biên lai hoặc bằng chứng chuyển khoản</p>
                <p>• Đảm bảo hình ảnh rõ nét và đầy đủ thông tin</p>
                <p>
                  • Sau khi xác nhận, đợt thu hoạch sẽ chuyển sang trạng thái
                  &quot;Hoàn tất&quot;
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
