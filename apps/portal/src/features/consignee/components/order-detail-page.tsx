'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  IconArrowLeft,
  IconPackage,
  IconFileText,
  IconCar
} from '@tabler/icons-react';
import dynamic from 'next/dynamic';
const DeliveryRouteSim = dynamic(
  () => import('@/components/map/delivery-route-sim'),
  { ssr: false }
);
import { Order, OrderDetail } from '@/features/consignee';
import { fetchOrderById } from '@/services/order.service';
import { fetchOrderDetails } from '@/services/order-detail.service';
import { updateOrderSchedule } from '@/services/order-schedule.service';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [details, setDetails] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const orderId = params.id as string;

  const statusClasses = (s?: string) => {
    const k = String(s ?? '').toUpperCase();
    if (k === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700';
    if (k === 'CONFIRMED') return 'bg-yellow-100 text-yellow-700';
    if (k === 'CANCELLED') return 'bg-red-100 text-red-700';
    if (k === 'COMPLETED') return 'bg-green-100 text-green-700';
    if (k === 'SCHEDULED') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) return;

      try {
        setLoading(true);
        const [orderData, detailsRes] = await Promise.all([
          fetchOrderById(orderId),
          fetchOrderDetails({ orderId, page: 1, limit: 10 })
        ]);
        if (!orderData) {
          toast({
            title: 'Không tìm thấy đơn hàng',
            description: 'Đơn hàng không tồn tại hoặc đã bị xóa.',
            variant: 'destructive'
          });
          return;
        }

        setOrder(orderData);
        setDetails(detailsRes.data ?? []);
      } catch (error) {
        toast({
          title: 'Lỗi tải dữ liệu',
          description: 'Không thể tải thông tin đơn hàng. Vui lòng thử lại.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const totalAmount = Number(order?.totalAmount ?? 0) || 0;

  const configStatus = (s?: string) => {
    const k = String(s ?? '').toUpperCase();
    if (k === 'IN_PROGRESS') return 'Đang thực hiện';
    if (k === 'CONFIRMED') return 'Đã xác nhận';
    if (k === 'CANCELLED') return 'Đã hủy';
    if (k === 'COMPLETED') return 'Đã hoàn thành';
    if (k === 'SCHEDULED') return 'Đã lên lịch';
    return 'Chưa xác nhận';
  };

  if (loading) {
    return (
      <PageContainer scrollable>
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='text-center'>
            <div className='border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2'></div>
            <p className='text-muted-foreground'>
              Đang tải thông tin đơn hàng...
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer scrollable>
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='text-center'>
            <IconPackage className='text-muted-foreground mx-auto mb-4 h-16 w-16' />
            <h3 className='mb-2 text-lg font-semibold'>
              Không tìm thấy đơn hàng
            </h3>
            <p className='text-muted-foreground mb-4'>
              Đơn hàng với ID {orderId} không tồn tại.
            </p>
            <Button onClick={() => router.push('/consignee/orders')}>
              <IconArrowLeft className='mr-2 h-4 w-4' />
              Quay lại danh sách đơn hàng
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable>
      <div className='space-y-6'>
        {/* Header */}
        <div className='grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4'>
          <div className='flex items-center space-x-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => router.push('/consignee/orders')}
            >
              <IconArrowLeft className='mr-2 h-4 w-4' />
              Quay lại
            </Button>
            <div>
              <h1 className='text-2xl font-bold'>Chi tiết đơn hàng</h1>
              <div className='flex items-center gap-2'>
                <p className='text-muted-foreground'>Mã đơn hàng: {order.id}</p>
                <span
                  className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${statusClasses(order.orderSchedule?.status)}`}
                >
                  {configStatus(order.orderSchedule?.status) ?? '-'}
                </span>
              </div>
            </div>
          </div>
          <div className='text-right md:justify-self-end'>
            <p className='text-sm'>
              Ngày đặt: {order.orderDate ? formatDate(order.orderDate) : '-'}
            </p>
            <p className='font-medium'>
              Tổng tiền:{' '}
              {formatCurrency(
                Number(
                  order.totalPayment ??
                    Number(order.totalAmount ?? 0) +
                      Number(order.vatAmount ?? 0)
                )
              )}
            </p>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          <div className='space-y-6 lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <IconPackage className='mr-2 h-5 w-5' />
                  Sản phẩm đặt hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {details.map((item, index) => (
                    <div key={item.id}>
                      <div className='flex items-center justify-between gap-4'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-md border'>
                          <img
                            src={item.product?.image || undefined}
                            alt={item.product?.name ?? item.product?.id ?? '-'}
                            className='h-full w-full rounded-md object-cover'
                          />
                        </div>
                        <div className='flex-1'>
                          <h4 className='font-medium'>
                            {item.product?.name ?? item.product?.id ?? '-'}
                          </h4>
                          <p className='text-muted-foreground text-sm'>
                            {item.quantity ?? 0} {item.unit ?? ''} ×{' '}
                            {formatCurrency(item.unitPrice ?? 0)}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>
                            {formatCurrency(
                              (Number.isFinite(item.quantity ?? 0)
                                ? (item.quantity ?? 0)
                                : 0) * (item.unitPrice ?? 0)
                            )}
                          </p>
                          <p className='text-muted-foreground text-sm'>
                            Gồm VAT:{' '}
                            {formatCurrency(
                              (Number.isFinite(item.quantity ?? 0)
                                ? (item.quantity ?? 0)
                                : 0) *
                                (item.unitPrice ?? 0) *
                                (1 + Number(order?.taxRate ?? 5) / 100)
                            )}
                          </p>
                        </div>
                      </div>
                      {index < details.length - 1 && (
                        <Separator className='mt-4' />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <IconCar className='mr-2 h-5 w-5' />
                  Vận tải
                </CardTitle>
              </CardHeader>
              <CardContent>
                {String(order.orderSchedule?.status ?? '').toLowerCase() ===
                'completed' ? (
                  <div className='space-y-1'>
                    <div className='text-sm font-medium text-green-700'>
                      Đơn hàng đã được xác nhận
                    </div>
                    <div className='text-muted-foreground text-sm'>
                      Thời điểm:{' '}
                      {order.orderSchedule?.updatedAt
                        ? new Date(
                            order.orderSchedule.updatedAt as any
                          ).toLocaleString('vi-VN')
                        : new Date().toLocaleString('vi-VN')}
                    </div>
                  </div>
                ) : String(order.orderSchedule?.status ?? '').toLowerCase() ===
                    'delivering' && order.orderSchedule?.address ? (
                  <DeliveryRouteSim
                    cargo={`Khối lượng ${String(order.totalMass ?? '')} kg`}
                    startAddress={'Trung tâm TP. Hồ Chí Minh'}
                    endAddress={String(order.orderSchedule?.address)}
                    orderScheduleId={String(order.orderSchedule?.id ?? '')}
                    productName={String(
                      details?.[0]?.product?.name ??
                        details?.[0]?.product?.id ??
                        ''
                    )}
                  />
                ) : (
                  <div className='text-muted-foreground text-sm'>
                    Bản đồ chỉ hiển thị khi trạng thái đang giao hàng
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span>Tổng dòng:</span>
                  <span>{details.length}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Tạm tính:</span>
                  <span>
                    {formatCurrency(
                      details.reduce(
                        (sum, it) =>
                          sum +
                          (Number.isFinite(it.quantity ?? 0)
                            ? (it.quantity ?? 0)
                            : 0) *
                            (it.unitPrice ?? 0),
                        0
                      )
                    )}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Thuế suất:</span>
                  <span>{Number(order?.taxRate ?? 5)}%</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>VAT:</span>
                  <span>
                    {formatCurrency(
                      Number(order?.vatAmount ?? 0) ||
                        Number(order?.totalAmount ?? 0) *
                          (Number(order?.taxRate ?? 5) / 100)
                    )}
                  </span>
                </div>
                <Separator />
                <div className='flex justify-between font-medium'>
                  <span>Tổng cộng:</span>
                  <span>
                    {formatCurrency(
                      Number(
                        order?.totalPayment ??
                          Number(order?.totalAmount ?? 0) +
                            Number(order?.vatAmount ?? 0)
                      )
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>
                    Trạng thái lịch:
                  </span>
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${statusClasses(order.orderSchedule?.status)}`}
                  >
                    {order.orderSchedule?.status ?? '-'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Mô tả lịch:</span>
                  <span>{order.orderSchedule?.description ?? '-'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Ngày giao hàng:</span>
                  <span>
                    {order.orderSchedule?.orderDate
                      ? formatDate(order.orderSchedule.orderDate)
                      : '-'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Ngày đặt hàng:</span>
                  <span>
                    {order.orderDate ? formatDate(order.orderDate) : '-'}
                  </span>
                </div>
                <div className='mt-4 border-t pt-3'>
                  <div className='mb-2 font-medium'>
                    Thông tin địa chỉ giao hàng
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Tổ chức:</span>
                    <span>
                      {order.orderSchedule?.consignee?.organizationName ?? '-'}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Đại diện:</span>
                    <span>
                      {order.orderSchedule?.consignee?.representativeName ??
                        '-'}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Địa chỉ giao:</span>
                    <span>{order.orderSchedule?.address ?? '-'}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Số điện thoại:
                    </span>
                    <span>
                      {order.orderSchedule?.consignee?.contact ?? '-'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => window.print()}
                >
                  <IconFileText className='mr-2 h-4 w-4' />
                  In đơn hàng
                </Button>
                {String(order.orderSchedule?.status ?? '').toLowerCase() ===
                  'delivered' && (
                  <>
                    <div className='text-muted-foreground text-sm'>
                      Hàng đã giao. Vui lòng xác nhận để hoàn thành đơn.
                    </div>
                    <Button
                      className='w-full'
                      disabled={confirming}
                      onClick={async () => {
                        const id = String(order.orderSchedule?.id ?? '');
                        if (!id) return;
                        try {
                          setConfirming(true);
                          const updated = await updateOrderSchedule(id, {
                            status: 'completed'
                          });
                          setOrder((prev) => {
                            if (!prev) return prev;
                            const normalized = {
                              id: String(updated.id),
                              status: updated.status as any,
                              address: String(updated.address ?? ''),
                              description: updated.description ?? null,
                              orderDate:
                                typeof updated.orderDate === 'string'
                                  ? updated.orderDate
                                  : updated.orderDate
                                    ? new Date(
                                        updated.orderDate as any
                                      ).toISOString()
                                    : null,
                              consignee: updated.consignee
                                ? { id: String((updated.consignee as any).id) }
                                : null,
                              updatedAt: updated.updatedAt
                                ? new Date(
                                    updated.updatedAt as any
                                  ).toISOString()
                                : new Date().toISOString()
                            };
                            return { ...prev, orderSchedule: normalized };
                          });
                          toast({
                            title: 'Xác nhận thành công',
                            description:
                              'Đơn hàng đã được xác nhận hoàn thành.',
                            variant: 'default'
                          });
                        } catch (e) {
                          toast({
                            title: 'Không thể xác nhận',
                            description:
                              'Có lỗi khi cập nhật trạng thái. Vui lòng thử lại.',
                            variant: 'destructive'
                          });
                        } finally {
                          setConfirming(false);
                        }
                      }}
                    >
                      Xác nhận đã nhận hàng
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
