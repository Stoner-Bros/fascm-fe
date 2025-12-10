'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  fetchHarvestScheduleById,
  updateHarvestSchedule
} from '@/services/harvest-schedule.service';
import type { HarvestSchedule } from '@/types/harvest-schedule';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditHarvestBatchPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const scheduleId = String(params.id);

  const [schedule, setSchedule] = useState<HarvestSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    harvestDate: '',
    address: ''
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const s = await fetchHarvestScheduleById(scheduleId);
        if (cancelled) return;

        setSchedule(s);
        setFormData({
          description: s.description || '',
          harvestDate: s.harvestDate
            ? new Date(s.harvestDate as unknown as string).toISOString()
            : '',
          address: s.address || ''
        });
      } catch (err) {
        if (cancelled) return;
        toast({
          title: 'Error',
          description: 'Failed to load harvest batch',
          variant: 'destructive'
        });
        router.push('/supplier/harvest-batches');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [scheduleId, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schedule?.status || schedule.status.toUpperCase() !== 'PENDING') {
      toast({
        title: 'Cannot Edit',
        description: 'Only pending harvest batches can be edited',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      await updateHarvestSchedule(scheduleId, {
        description: formData.description || null,
        harvestDate: new Date(formData.harvestDate).toISOString(),
        address: formData.address || null
      });

      toast({
        title: 'Success',
        description: 'Harvest batch updated successfully'
      });
      router.push(`/supplier/harvest-batches/${scheduleId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update harvest batch',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/supplier/harvest-batches/${scheduleId}`);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className='flex h-[50vh] w-full items-center justify-center'>
          <div className='flex flex-col items-center gap-2'>
            <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
            <p className='text-muted-foreground'>Loading...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!schedule) {
    return null;
  }

  const totalQuantity = (schedule.harvestDetails ?? []).reduce(
    (sum, d) => sum + (d.quantity || 0),
    0
  );
  const totalPrice = (schedule.harvestDetails ?? []).reduce(
    (sum, d) => sum + (d.quantity || 0) * (d.unitPrice || 0),
    0
  );

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' onClick={() => router.back()}>
              <IconArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h2 className='text-3xl font-bold tracking-tight'>
                Chỉnh sửa lô thu hoạch
              </h2>
              <p className='text-muted-foreground'>
                Cập nhật thông tin lô #{scheduleId}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <form onSubmit={handleSubmit}>
          <div className='grid gap-6 lg:grid-cols-3'>
            <div className='space-y-6 lg:col-span-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin thu hoạch</CardTitle>
                  <CardDescription>
                    Cập nhật thời gian và địa điểm thu hoạch
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='harvestDate'>
                      Ngày và giờ thu hoạch{' '}
                      <span className='text-destructive'>*</span>
                    </Label>
                    <DateTimePicker
                      value={formData.harvestDate}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, harvestDate: value }))
                      }
                      placeholder='Chọn ngày và giờ thu hoạch'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='address'>
                      Địa chỉ thu hoạch{' '}
                      <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      id='address'
                      name='address'
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder='Nhập địa chỉ thu hoạch'
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='description'>Ghi chú</Label>
                    <textarea
                      id='description'
                      name='description'
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder='Ghi chú bổ sung (không bắt buộc)...'
                      className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danh sách sản phẩm</CardTitle>
                  <CardDescription>
                    Sản phẩm không thể chỉnh sửa sau khi tạo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='rounded-lg border'>
                    <div className='bg-muted text-muted-foreground grid grid-cols-4 gap-2 border-b px-4 py-3 text-sm font-medium'>
                      <span>Sản phẩm</span>
                      <span>Số lượng</span>
                      <span>Đơn vị</span>
                      <span className='text-right'>Đơn giá</span>
                    </div>
                    {(schedule.harvestDetails ?? []).length === 0 ? (
                      <div className='py-8 text-center text-sm text-gray-500'>
                        Không có sản phẩm nào
                      </div>
                    ) : (
                      (schedule.harvestDetails ?? []).map((detail) => (
                        <div
                          key={detail.id}
                          className='grid grid-cols-4 gap-2 border-b px-4 py-3 last:border-b-0'
                        >
                          <div className='font-medium'>
                            {detail.product?.name || '-'}
                          </div>
                          <div>{detail.quantity}</div>
                          <div>{detail.unit}</div>
                          <div className='text-right font-medium'>
                            {(detail.unitPrice || 0).toLocaleString('vi-VN')}{' '}
                            VND
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className='flex justify-end gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Hủy
                </Button>
                <Button type='submit' disabled={submitting}>
                  <IconDeviceFloppy className='mr-2 h-4 w-4' />
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Tổng quan</CardTitle>
                  <CardDescription>Thống kê lô thu hoạch</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='rounded-lg border p-3'>
                    <p className='text-muted-foreground mb-1 text-sm'>
                      Tổng khối lượng
                    </p>
                    <p className='text-2xl font-bold'>{totalQuantity} kg</p>
                  </div>
                  <div className='rounded-lg border p-3'>
                    <p className='text-muted-foreground mb-1 text-sm'>
                      Tổng giá trị
                    </p>
                    <p className='text-primary text-2xl font-bold'>
                      {totalPrice.toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                  <div className='rounded-lg border p-3'>
                    <p className='text-muted-foreground mb-1 text-sm'>
                      Số sản phẩm
                    </p>
                    <p className='text-2xl font-bold'>
                      {(schedule.harvestDetails ?? []).length}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-yellow-50'>
                <CardHeader>
                  <CardTitle className='text-sm'>⚠️ Lưu ý quan trọng</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-gray-700'>
                  <ul className='space-y-2'>
                    <li>
                      {/*  */}• Chỉ có thể chỉnh sửa khi đơn đang ở trạng thái
                      &quot;Chờ duyệt&quot;
                    </li>
                    <li>• Không thể thay đổi danh sách sản phẩm</li>
                    <li>• Thay đổi sẽ cần được duyệt lại</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
