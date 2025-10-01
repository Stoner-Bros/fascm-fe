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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  HarvestBatch,
  CreateHarvestBatchData,
  productTypeOptions,
  unitOptions
} from '@/types/harvest';

const formSchema = z.object({
  productType: z.string().min(1, 'Vui lòng chọn loại sản phẩm'),
  productName: z.string().min(1, 'Vui lòng nhập tên sản phẩm'),
  quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
  unit: z.string().min(1, 'Vui lòng chọn đơn vị'),
  expectedPickupDate: z.date().refine((date) => date !== undefined, {
    message: 'Vui lòng chọn ngày dự kiến lấy hàng'
  }),
  description: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface CreateHarvestBatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (batch: HarvestBatch) => void;
}

export function CreateHarvestBatchModal({
  open,
  onOpenChange,
  onSuccess
}: CreateHarvestBatchModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productType: '',
      productName: '',
      quantity: 0,
      unit: '',
      expectedPickupDate: undefined,
      description: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newBatch: HarvestBatch = {
        id: `HB${String(Date.now()).slice(-6)}`,
        supplierId: 'supplier-1',
        supplierName: 'Nông trại Xanh',
        productType: data.productType as any,
        productName: data.productName,
        quantity: data.quantity,
        unit: data.unit as any,
        expectedPickupDate: data.expectedPickupDate,
        description: data.description,
        images: [],
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(),
            note: 'Đợt thu hoạch được tạo'
          }
        ]
      };

      onSuccess(newBatch);
      form.reset();
    } catch (error) {
      console.error('Error creating harvest batch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Tạo đợt thu hoạch mới</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết về đợt thu hoạch nông sản của bạn
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='productType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại sản phẩm</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn loại sản phẩm' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='productName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên sản phẩm</FormLabel>
                    <FormControl>
                      <Input placeholder='Ví dụ: Cà chua cherry' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='quantity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='0'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='unit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn vị</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn đơn vị' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='expectedPickupDate'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Ngày dự kiến lấy hàng</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: vi })
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Chọn ngày bạn muốn đội vận chuyển đến lấy hàng
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả (tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Mô tả chi tiết về sản phẩm, chất lượng, điều kiện bảo quản...'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Thông tin bổ sung về sản phẩm để đội vận chuyển hiểu rõ hơn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='space-y-2'>
              <FormLabel>Hình ảnh sản phẩm (tùy chọn)</FormLabel>
              <div className='flex w-full items-center justify-center'>
                <label className='flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100'>
                  <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                    <Upload className='mb-4 h-8 w-8 text-gray-500' />
                    <p className='mb-2 text-sm text-gray-500'>
                      <span className='font-semibold'>Nhấp để tải lên</span>{' '}
                      hoặc kéo thả
                    </p>
                    <p className='text-xs text-gray-500'>
                      PNG, JPG hoặc JPEG (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    type='file'
                    className='hidden'
                    multiple
                    accept='image/*'
                  />
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Đang tạo...' : 'Tạo đợt thu hoạch'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
