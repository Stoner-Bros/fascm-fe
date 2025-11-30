'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IconArrowLeft, IconPackage } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { updateOrderSchedule } from '@/services/order-schedule.service';
import { fetchOrderDetailsByOrderId } from '@/services/order-detail.service';
import { fetchOrderById } from '@/services/order.service';
import type {
  OrderBE,
  OrderScheduleStatus,
  OrderDetailBE
} from '@/types/order';

function badgeForSchedule(status?: OrderScheduleStatus | null) {
  switch (status) {
    case 'pending':
      return (
        <Badge
          variant='outline'
          className='border-violet-200 bg-violet-50 text-violet-700'
        >
          Đang xử lý
        </Badge>
      );
    case 'approved':
      return (
        <Badge
          variant='outline'
          className='border-blue-200 bg-blue-50 text-blue-700'
        >
          Đã duyệt
        </Badge>
      );
    case 'preparing':
      return (
        <Badge
          variant='outline'
          className='border-yellow-200 bg-yellow-50 text-yellow-700'
        >
          Chờ phân công
        </Badge>
      );
    case 'delivering':
      return (
        <Badge
          variant='outline'
          className='border-amber-200 bg-amber-50 text-amber-700'
        >
          Chờ lấy hàng
        </Badge>
      );
    case 'delivered':
      return (
        <Badge
          variant='outline'
          className='border-green-200 bg-green-50 text-green-700'
        >
          Đã giao hàng
        </Badge>
      );
    case 'completed':
      return (
        <Badge
          variant='outline'
          className='border-green-200 bg-green-50 text-green-700'
        >
          Đã hoàn thành
        </Badge>
      );
    case 'canceled':
      return (
        <Badge
          variant='outline'
          className='border-red-200 bg-red-50 text-red-700'
        >
          Đã hủy
        </Badge>
      );
    default:
      return null;
  }
}

export function OrderDetail({
  order,
  orderId
}: {
  order?: OrderBE;
  orderId?: string;
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [localOrder, setLocalOrder] = useState<OrderBE | undefined>(order);
  const [details, setDetails] = useState<OrderDetailBE[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [errorOrder, setErrorOrder] = useState<string | null>(null);

  const doUpdate = async (status: OrderScheduleStatus) => {
    if (!localOrder?.orderSchedule?.id) return;
    setUpdating(true);
    try {
      const updated = await updateOrderSchedule(localOrder.orderSchedule.id, {
        status
      });
      setLocalOrder((prev) =>
        prev
          ? {
              ...prev,
              orderSchedule: {
                ...prev.orderSchedule!,
                status: updated.status
              }
            }
          : prev
      );
    } finally {
      setUpdating(false);
    }
  };

  // Load order details
  useEffect(() => {
    if (!localOrder?.id) return;
    setLoadingDetails(true);
    fetchOrderDetailsByOrderId(localOrder.id)
      .then((res) => setDetails(res.data))
      .finally(() => setLoadingDetails(false));
  }, [localOrder?.id]);

  // Load order by id if not provided
  useEffect(() => {
    if (!!localOrder || !orderId) return;
    setLoadingOrder(true);
    setErrorOrder(null);
    fetchOrderById(orderId)
      .then((o) => setLocalOrder(o))
      .catch((e) => setErrorOrder(String(e?.message ?? e)))
      .finally(() => setLoadingOrder(false));
  }, [orderId, localOrder]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='sm' onClick={() => router.back()}>
          <IconArrowLeft className='mr-2 h-4 w-4' />
          Quay lại
        </Button>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Chi tiết đơn hàng
          </h1>
          <p className='text-muted-foreground'>
            Mã đơn hàng: {localOrder?.id ?? orderId}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconPackage className='h-5 w-5' /> Trạng thái lịch giao
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>Trạng thái:</span>
                {badgeForSchedule(localOrder?.orderSchedule?.status ?? null)}
              </div>
              <div className='text-muted-foreground text-sm'>
                <div>
                  Tạo lúc:{' '}
                  {localOrder
                    ? new Date(localOrder.createdAt).toLocaleString('vi-VN')
                    : '-'}
                </div>
                <div>
                  Cập nhật:{' '}
                  {localOrder
                    ? new Date(localOrder.updatedAt).toLocaleString('vi-VN')
                    : '-'}
                </div>
              </div>
            </div>
            {localOrder?.orderSchedule?.status !== 'approved' &&
              localOrder?.orderSchedule?.status !== 'canceled' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' disabled={updating}>
                      Cập nhật
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => doUpdate('approved')}>
                      Duyệt
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => doUpdate('rejected')}>
                      Từ chối
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
          </div>
          <div className='grid gap-4 md:grid-cols-3'>
            <div>
              <span className='text-muted-foreground text-sm'>Mô tả lịch</span>
              <div className='font-semibold'>
                {localOrder?.orderSchedule?.description ?? '-'}
              </div>
            </div>
            <div>
              <span className='text-muted-foreground text-sm'>Ngày lịch</span>
              <div className='font-semibold'>
                {localOrder?.orderSchedule?.orderDate
                  ? new Date(
                      localOrder.orderSchedule!.orderDate
                    ).toLocaleDateString('vi-VN')
                  : '-'}
              </div>
            </div>
            <div>
              <span className='text-muted-foreground text-sm'>Khách nhận</span>
              <div className='font-semibold'>
                {localOrder?.orderSchedule?.consignee?.organizationName ??
                  localOrder?.orderSchedule?.consignee?.representativeName ??
                  '-'}
              </div>
              <div className='text-muted-foreground text-sm'>
                {localOrder?.orderSchedule?.consignee?.address ?? ''}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sản phẩm chi tiết </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingOrder && <div>Đang tải đơn hàng...</div>}
          {errorOrder && <div className='text-red-600'>Lỗi: {errorOrder}</div>}
          {loadingDetails ? (
            <div>Đang tải...</div>
          ) : details.length === 0 ? (
            <div>Không có sản phẩm</div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='text-left'>
                    <th className='py-2 pr-4'>Hình ảnh</th>
                    <th className='py-2 pr-4'>Sản phẩm</th>
                    <th className='py-2 pr-4'>Số lượng</th>
                    <th className='py-2 pr-4'>Đơn vị</th>
                    <th className='py-2 pr-4'>Đơn giá</th>
                    <th className='py-2 pr-4'>VAT</th>
                    <th className='py-2 pr-4'>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((d) => (
                    <tr key={d.id} className='border-t'>
                      <td className='py-2 pr-4'>
                        <img
                          src={d.product?.image ?? '/placeholder.svg'}
                          alt={d.product?.name ?? '-'}
                          className='h-12 w-12 rounded-md'
                        />
                      </td>
                      <td className='py-2 pr-4'>{d.product?.name ?? '-'}</td>
                      <td className='py-2 pr-4'>{d.quantity ?? '-'}</td>
                      <td className='py-2 pr-4'>{d.unit ?? '-'}</td>
                      <td className='py-2 pr-4'>{d.unitPrice ?? '-'}</td>
                      <td className='py-2 pr-4'>{d.taxRate ?? '-'}</td>
                      <td className='py-2 pr-4'>{d.amount ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài chính</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 md:grid-cols-2'>
          <div>
            <span className='text-muted-foreground text-sm'>
              Tổng thanh toán
            </span>
            <div className='font-semibold'>
              {localOrder?.totalPayment ?? '-'}
            </div>
          </div>
          <div>
            <span className='text-muted-foreground text-sm'>VAT</span>
            <div className='font-semibold'>{localOrder?.vatAmount ?? '-'}</div>
          </div>
          <div>
            <span className='text-muted-foreground text-sm'>Tổng tiền</span>
            <div className='font-semibold'>
              {localOrder?.totalAmount ?? '-'}
            </div>
          </div>
          <div>
            <span className='text-muted-foreground text-sm'>Khối lượng</span>
            <div className='font-semibold'>{localOrder?.totalMass ?? '-'}</div>
          </div>
          <div>
            <span className='text-muted-foreground text-sm'>Thể tích</span>
            <div className='font-semibold'>
              {localOrder?.totalVolume ?? '-'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 md:grid-cols-3'>
          <div>
            <span className='text-muted-foreground text-sm'>Ngày đặt hàng</span>
            <div className='font-semibold'>
              {localOrder?.orderDate
                ? new Date(localOrder.orderDate!).toLocaleString('vi-VN')
                : '-'}
            </div>
          </div>
          <div>
            <span className='text-muted-foreground text-sm'>Mã đơn</span>
            <div className='font-semibold'>{localOrder?.id ?? '-'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
