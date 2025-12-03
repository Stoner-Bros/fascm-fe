'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { createExportTicket } from '@/services/export-ticket.service';
import { fetchOrderDetailsByOrderId } from '@/services/order-detail.service';
import { updateOrderSchedule } from '@/services/order-schedule.service';
import { fetchOrdersByStatus } from '@/services/order.service';
import type { OrderBE } from '@/types/order';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconClipboardList, IconPackageExport } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const exportFormSchema = z.object({
  selectedOrders: z
    .array(z.string())
    .min(1, 'Vui lòng chọn ít nhất một đơn hàng'),
  notes: z.string().optional()
});

type ExportFormData = z.infer<typeof exportFormSchema>;

export default function WarehouseExport() {
  const [availableOrders, setAvailableOrders] = useState<OrderBE[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ExportFormData>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: { selectedOrders: [], notes: '' }
  });

  const loadApprovedOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetchOrdersByStatus({
        page: 1,
        limit: 10,
        status: 'approved'
      });
      const approved = res.data.filter(
        (o) => o.orderSchedule?.status === 'approved'
      );
      setAvailableOrders(approved);
    } catch (e) {
      console.error(e);
      toast.error('Không tải được danh sách đơn đã duyệt');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApprovedOrders();
  }, []);

  const selectedOrders = useWatch({
    control: form.control,
    name: 'selectedOrders'
  });
  const selectedCount = selectedOrders?.length ?? 0;

  const handleSubmit = async (data: ExportFormData) => {
    setIsSubmitting(true);
    try {
      const targetOrders = availableOrders.filter((o) =>
        data.selectedOrders.includes(o.id)
      );
      const detailResponses = await Promise.all(
        targetOrders.map((o) => fetchOrderDetailsByOrderId(o.id, 1, 500))
      );
      const details = detailResponses.flatMap((r) => r.data);
      const uniqueDetailsMap = new Map(details.map((d) => [d.id, d]));
      const uniqueDetails = Array.from(uniqueDetailsMap.values());
      if (details.length === 0) {
        toast.warning('Không có chi tiết đơn hàng để tạo phiếu xuất');
        return;
      }
      const createdTickets: string[] = [];
      const skippedTickets: { id: string; reason?: string }[] = [];
      for (const d of uniqueDetails) {
        const body = {
          numberOfBatch: Math.max(1, d.numberOfBatch ?? 1),
          ExportDate: new Date(),
          orderDetail: { id: d.id }
        };
        try {
          const created = await createExportTicket(body);
          createdTickets.push(created.id);
        } catch (err: any) {
          const msg = typeof err?.message === 'string' ? err.message : '';
          skippedTickets.push({ id: d.id, reason: msg });
        }
      }
      if (skippedTickets.length > 0) {
        toast.warning(`Bỏ qua ${skippedTickets.length} chi tiết đã có phiếu`);
      }
      toast.success(`Đã tạo ${createdTickets.length} phiếu xuất kho`);

      const updatedScheduleCount = await (async () => {
        let count = 0;
        for (const order of targetOrders) {
          const scheduleId = order.orderSchedule?.id;
          if (!scheduleId) continue;
          try {
            await updateOrderSchedule(scheduleId, { status: 'preparing' });
            count++;
          } catch (e) {
            console.warn('Không cập nhật được trạng thái đơn', scheduleId, e);
          }
        }
        return count;
      })();

      if (updatedScheduleCount > 0) {
        toast.success(
          `Cập nhật trạng thái ${updatedScheduleCount} đơn sang "Chờ phân xe"`
        );
        await loadApprovedOrders();
      }
      form.reset();
    } catch (e) {
      console.error(e);
      toast.error('Có lỗi khi tạo phiếu xuất kho');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer scrollable>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <IconPackageExport className='h-5 w-5' />
              Xuất kho theo đơn đã duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form
              form={form}
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-6'
            >
              <div className='flex items-center justify-between'>
                <h3 className='flex items-center gap-2 text-base font-semibold'>
                  <IconClipboardList className='h-5 w-5' />
                  Danh sách đơn hàng đã duyệt
                </h3>
                <Badge variant='secondary'>Đã chọn: {selectedCount}</Badge>
              </div>

              <FormField
                control={form.control}
                name='selectedOrders'
                render={() => (
                  <FormItem>
                    <div className='rounded-lg border'>
                      {isLoading ? (
                        <div className='text-muted-foreground p-4 text-sm'>
                          Đang tải...
                        </div>
                      ) : (
                        <div className='grid grid-cols-1 divide-y'>
                          {availableOrders.map((order) => {
                            const consignee = order.orderSchedule?.consignee;
                            const name =
                              consignee?.organizationName ??
                              consignee?.representativeName ??
                              'Khách nhận';
                            const isChecked = form
                              .watch('selectedOrders')
                              .includes(order.id);
                            return (
                              <label
                                key={order.id}
                                className='hover:bg-muted flex cursor-pointer items-center justify-between gap-4 p-4'
                              >
                                <div className='flex items-start gap-4'>
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      const curr =
                                        form.getValues('selectedOrders');
                                      const next = checked
                                        ? [...curr, order.id]
                                        : curr.filter((id) => id !== order.id);
                                      form.setValue('selectedOrders', next, {
                                        shouldValidate: true
                                      });
                                    }}
                                  />
                                  <div>
                                    <div className='mb-1 flex items-center gap-2'>
                                      <Badge variant='outline'>
                                        {order.id}
                                      </Badge>
                                      <Badge>APPROVED</Badge>
                                    </div>
                                    <div className='text-muted-foreground text-sm'>
                                      <p className='font-medium'>{name}</p>
                                      <p>Mã KH: {consignee?.id ?? '-'}</p>
                                      <p>
                                        Ngày đơn:{' '}
                                        {order.orderSchedule?.orderDate ?? '-'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex gap-2 border-t pt-4'>
                <Button
                  type='submit'
                  disabled={isSubmitting || selectedCount === 0}
                >
                  <IconPackageExport className='mr-2 h-4 w-4' />
                  {isSubmitting ? 'Đang tạo...' : 'Tạo phiếu xuất kho'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    form.reset();
                  }}
                >
                  Làm mới
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

export { WarehouseExport };
