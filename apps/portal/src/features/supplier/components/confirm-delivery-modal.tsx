'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { FormProvider } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  CheckCircle,
  XCircle,
  Package,
  User,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { HarvestBatch, statusLabels, statusColors } from '@/types/harvest';

const formSchema = z.object({
  note: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface ConfirmDeliveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: HarvestBatch;
  onConfirm: (batchId: string, confirmed: boolean, note?: string) => void;
}

export function ConfirmDeliveryModal({
  open,
  onOpenChange,
  batch,
  onConfirm
}: ConfirmDeliveryModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      note: ''
    }
  });

  const handleConfirm = async (confirmed: boolean) => {
    setIsLoading(true);
    try {
      const note = form.getValues('note');
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      onConfirm(batch.id, confirmed, note);
      form.reset();
    } catch (error) {
      console.error('Error confirming delivery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <Package className='h-5 w-5' />
            <span>Xác nhận giao hàng</span>
          </DialogTitle>
          <DialogDescription>
            Xác nhận việc giao hàng cho đợt thu hoạch #{batch.id}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Batch Information */}
          <div className='space-y-3 rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium'>{batch.productName}</h4>
              <Badge className={statusColors[batch.status]}>
                {statusLabels[batch.status]}
              </Badge>
            </div>

            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <p className='text-muted-foreground'>Số lượng</p>
                <p className='font-medium'>
                  {batch.quantity} {batch.unit}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground'>Ngày dự kiến</p>
                <p className='flex items-center font-medium'>
                  <Calendar className='mr-1 h-3 w-3' />
                  {format(batch.expectedPickupDate, 'dd/MM/yyyy', {
                    locale: vi
                  })}
                </p>
              </div>
            </div>

            {batch.deliveryStaffName && (
              <div className='border-t pt-2'>
                <p className='text-muted-foreground text-sm'>
                  Nhân viên vận chuyển
                </p>
                <p className='flex items-center font-medium'>
                  <User className='mr-2 h-4 w-4' />
                  {batch.deliveryStaffName}
                </p>
                {batch.pickupTime && (
                  <p className='text-muted-foreground text-sm'>
                    Đã lấy hàng lúc:{' '}
                    {format(batch.pickupTime, 'PPP p', { locale: vi })}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirmation Message */}
          <div className='rounded-lg border border-orange-200 bg-orange-50 p-4'>
            <div className='flex items-start space-x-3'>
              <AlertTriangle className='mt-0.5 h-5 w-5 text-orange-600' />
              <div className='space-y-1'>
                <p className='text-sm font-medium text-orange-800'>
                  Xác nhận giao hàng
                </p>
                <p className='text-sm text-orange-700'>
                  Bạn có xác nhận rằng đã giao hàng thành công cho đội vận
                  chuyển không? Hành động này sẽ cập nhật trạng thái đợt thu
                  hoạch.
                </p>
              </div>
            </div>
          </div>

          {/* Note Form */}
          <FormProvider {...form}>
            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú (tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Thêm ghi chú về việc giao hàng...'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ghi chú về tình trạng hàng hóa, thời gian giao, hoặc các lưu
                    ý khác
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormProvider>
        </div>

        <DialogFooter className='flex-col gap-2 sm:flex-row'>
          <div className='flex w-full space-x-2 sm:w-auto'>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='outline'
                  className='flex-1 border-red-200 text-red-600 hover:border-red-300 hover:text-red-700 sm:flex-none'
                  disabled={isLoading}
                >
                  <XCircle className='mr-2 h-4 w-4' />
                  Chưa giao
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận chưa giao hàng</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn rằng chưa giao hàng cho đợt thu hoạch này?
                    Trạng thái sẽ được cập nhật tương ứng.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleConfirm(false)}
                    className='bg-red-600 hover:bg-red-700'
                  >
                    Xác nhận chưa giao
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              onClick={() => handleConfirm(true)}
              disabled={isLoading}
              className='flex-1 bg-green-600 hover:bg-green-700 sm:flex-none'
            >
              <CheckCircle className='mr-2 h-4 w-4' />
              {isLoading ? 'Đang xử lý...' : 'Đã giao hàng'}
            </Button>
          </div>

          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className='w-full sm:w-auto'
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
