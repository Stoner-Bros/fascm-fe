'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormProvider } from 'react-hook-form';
import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormTextarea } from '@/components/forms/form-textarea';
import { FormDatePicker } from '@/components/forms/form-date-picker';
import { FormFileUpload } from '@/components/forms/form-file-upload';
import {
  productTypeOptions,
  qualityGradeOptions,
  unitOptions
} from '@/types/harvest';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const createHarvestBatchSchema = z.object({
  productType: z.string().min(1, 'Vui lòng chọn loại sản phẩm'),
  productName: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),
  harvestDate: z.date(),
  quantity: z
    .number()
    .min(0.1, 'Số lượng phải lớn hơn 0')
    .max(10000, 'Số lượng không được vượt quá 10,000'),
  unit: z.string().min(1, 'Vui lòng chọn đơn vị'),
  expectedQuality: z.string().min(1, 'Vui lòng chọn chất lượng dự kiến'),
  description: z.string().optional(),
  images: z.array(z.any()).optional(),
  certificates: z.array(z.any()).optional()
});

type CreateHarvestBatchFormData = z.infer<typeof createHarvestBatchSchema>;

export default function CreateHarvestBatchForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateHarvestBatchFormData>({
    resolver: zodResolver(createHarvestBatchSchema),
    defaultValues: {
      productType: '',
      productName: '',
      quantity: undefined,
      unit: '',
      expectedQuality: '',
      description: '',
      images: [],
      certificates: []
    }
  });

  const onSubmit = async (data: CreateHarvestBatchFormData) => {
    try {
      setIsSubmitting(true);

      // TODO: Replace with actual API call
      // In production, send data to API
      void data; // Use data parameter to avoid linting warning
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('Đợt thu hoạch đã được tạo thành công!');
      router.push('/supplier/harvest-batches/tracking');
    } catch (error) {
      // Error handling
      toast.error('Có lỗi xảy ra khi tạo đợt thu hoạch. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get min and max dates for harvest date picker
  const today = new Date();
  const minDate = new Date();
  minDate.setDate(today.getDate() - 7); // Allow up to 7 days in the past
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30); // Allow up to 30 days in the future

  return (
    <div className='mx-auto max-w-4xl space-y-6'>
      {/* Header */}
      <div className='flex items-center space-x-4'>
        <Button variant='outline' size='sm' asChild>
          <Link href='/supplier/overview'>
            <IconArrowLeft className='mr-2 h-4 w-4' />
            Quay lại
          </Link>
        </Button>
        <div>
          <h1 className='text-2xl font-bold'>Tạo đợt thu hoạch mới</h1>
          <p className='text-muted-foreground'>
            Nhập thông tin về đợt thu hoạch của bạn
          </p>
        </div>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormSelect
                  control={form.control}
                  name='productType'
                  label='Loại sản phẩm'
                  placeholder='Chọn loại sản phẩm'
                  options={productTypeOptions}
                  required
                />

                <FormInput
                  control={form.control}
                  name='productName'
                  label='Tên sản phẩm'
                  placeholder='Ví dụ: Cà chua cherry'
                  required
                />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <FormInput
                  control={form.control}
                  name='quantity'
                  type='number'
                  label='Số lượng'
                  placeholder='0'
                  min={0.1}
                  max={10000}
                  step={0.1}
                  required
                />

                <FormSelect
                  control={form.control}
                  name='unit'
                  label='Đơn vị'
                  placeholder='Chọn đơn vị'
                  options={unitOptions}
                  required
                />

                <FormSelect
                  control={form.control}
                  name='expectedQuality'
                  label='Chất lượng dự kiến'
                  placeholder='Chọn chất lượng'
                  options={qualityGradeOptions}
                  required
                />
              </div>

              <FormDatePicker
                control={form.control}
                name='harvestDate'
                label='Ngày thu hoạch'
                required
                config={{
                  minDate: minDate,
                  maxDate: maxDate
                }}
              />

              <FormTextarea
                control={form.control}
                name='description'
                label='Mô tả (tùy chọn)'
                placeholder='Mô tả về sản phẩm, phương pháp canh tác, đặc điểm...'
                config={{
                  maxLength: 500,
                  showCharCount: true,
                  rows: 4
                }}
              />
            </CardContent>
          </Card>

          {/* Images and Certificates */}
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh và chứng nhận</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <FormFileUpload
                control={form.control}
                name='images'
                label='Hình ảnh sản phẩm (tùy chọn)'
                description='Tải lên hình ảnh của sản phẩm để tăng độ tin cậy'
                config={{
                  accept: {
                    'image/*': ['.png', '.jpg', '.jpeg', '.webp']
                  },
                  maxFiles: 5,
                  maxSize: 5 * 1024 * 1024, // 5MB
                  multiple: true
                }}
              />

              <FormFileUpload
                control={form.control}
                name='certificates'
                label='Giấy chứng nhận (tùy chọn)'
                description='Tải lên các giấy chứng nhận chất lượng, hữu cơ, an toàn thực phẩm...'
                config={{
                  accept: {
                    'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
                    'application/pdf': ['.pdf']
                  },
                  maxFiles: 3,
                  maxSize: 10 * 1024 * 1024, // 10MB
                  multiple: true
                }}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>

            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  Đang tạo...
                </>
              ) : (
                <>
                  <IconDeviceFloppy className='mr-2 h-4 w-4' />
                  Tạo đợt thu hoạch
                </>
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
