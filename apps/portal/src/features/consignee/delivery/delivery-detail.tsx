'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import Link from 'next/link';
import { mockDeliveries } from '@/features/consignee/delivery/delivery';
import {
  IconCash,
  IconCreditCard,
  IconPhoto,
  IconCalendar,
  IconTruck,
  IconPackage
} from '@tabler/icons-react';

type Props = {
  deliveryId: string;
};

function formatCurrencyVND(n: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(n);
}

export default function ConsigneeDeliveryDetailFeature({ deliveryId }: Props) {
  const delivery = mockDeliveries.find((d) => d.id === deliveryId);

  const badgeForStatus = (s: 'Scheduled' | 'InTransit' | 'Delivered') => {
    switch (s) {
      case 'Scheduled':
        return <Badge variant='secondary'>Scheduled</Badge>;
      case 'InTransit':
        return <Badge>In Transit</Badge>;
      case 'Delivered':
        return <Badge variant='success'>Delivered</Badge>;
    }
  };

  const badgeForPayment = (p: 'Unpaid' | 'PartiallyPaid' | 'Paid') => {
    switch (p) {
      case 'Unpaid':
        return <Badge variant='destructive'>Unpaid</Badge>;
      case 'PartiallyPaid':
        return <Badge variant='outline'>Partially Paid</Badge>;
      case 'Paid':
        return <Badge variant='success'>Paid</Badge>;
    }
  };

  if (!delivery) {
    return (
      <PageContainer>
        <div className='space-y-4'>
          <h2 className='text-2xl font-bold'>Không tìm thấy đợt giao</h2>
          <Button asChild variant='outline'>
            <Link href='/consignee/deliveries'>Quay lại danh sách</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Chi tiết đợt giao #{delivery.batchNo}
            </h2>
            <p className='text-muted-foreground'>
              Đơn hàng{' '}
              <Link
                href={`/consignee/orders/${delivery.orderId}`}
                className='font-medium hover:underline'
              >
                {delivery.orderRef}
              </Link>
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {badgeForStatus(delivery.status)}
            {badgeForPayment(delivery.paymentStatus)}
          </div>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Tiến trình giao hàng</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Horizontal stepper: Lên lịch → Đang vận chuyển → Đã giao */}
            <div className='flex items-start gap-6'>
              {/* Step 1: Lên lịch */}
              <div className='flex items-start gap-3'>
                <div
                  className={
                    'flex h-10 w-10 items-center justify-center rounded-full ' +
                    (['Scheduled', 'InTransit', 'Delivered'].includes(
                      delivery.status
                    )
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground')
                  }
                >
                  <IconCalendar className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-sm font-medium'>Lên lịch</p>
                  <p className='text-muted-foreground text-xs'>
                    {delivery.scheduledDate}
                  </p>
                </div>
              </div>
              <div
                className={
                  'mt-5 h-0.5 flex-1 ' +
                  (['InTransit', 'Delivered'].includes(delivery.status)
                    ? 'bg-primary'
                    : 'bg-border')
                }
              ></div>
              {/* Step 2: Đang vận chuyển */}
              <div className='flex items-start gap-3'>
                <div
                  className={
                    'flex h-10 w-10 items-center justify-center rounded-full ' +
                    (['InTransit', 'Delivered'].includes(delivery.status)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground')
                  }
                >
                  <IconTruck className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-sm font-medium'>Đang vận chuyển</p>
                  <p className='text-muted-foreground text-xs'>-</p>
                </div>
              </div>
              <div
                className={
                  'mt-5 h-0.5 flex-1 ' +
                  (delivery.status === 'Delivered' ? 'bg-primary' : 'bg-border')
                }
              ></div>
              {/* Step 3: Đã giao */}
              <div className='flex items-start gap-3'>
                <div
                  className={
                    'flex h-10 w-10 items-center justify-center rounded-full ' +
                    (delivery.status === 'Delivered'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground')
                  }
                >
                  <IconPackage className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-sm font-medium'>Đã giao</p>
                  <p className='text-muted-foreground text-xs'>
                    {delivery.deliveredDate ?? '-'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates, Amount & Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin giao hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-4'>
              <div className='rounded-md border p-4'>
                <p className='text-muted-foreground text-sm'>Lịch giao</p>
                <p className='text-xl font-semibold'>
                  {delivery.scheduledDate}
                </p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-muted-foreground text-sm'>
                  Ngày giao thực tế
                </p>
                <p className='text-xl font-semibold'>
                  {delivery.deliveredDate ?? '-'}
                </p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-muted-foreground text-sm'>Giá trị đợt</p>
                <p className='text-xl font-semibold'>
                  {formatCurrencyVND(delivery.amount)}
                </p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-muted-foreground text-sm'>
                  Phương thức thanh toán
                </p>
                <div className='flex items-center gap-2'>
                  {delivery.paymentMethod === 'Cash' ? (
                    <>
                      <IconCash className='h-5 w-5' />
                      <span className='text-xl font-semibold'>Tiền mặt</span>
                    </>
                  ) : (
                    <>
                      <IconCreditCard className='h-5 w-5' />
                      <span className='text-xl font-semibold'>
                        Chuyển khoản
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-muted-foreground text-sm'>Thanh toán</p>
                <p className='text-xl font-semibold'>
                  {delivery.paymentStatus === 'Paid'
                    ? 'Đã thanh toán'
                    : delivery.paymentStatus === 'PartiallyPaid'
                      ? 'Thanh toán một phần'
                      : 'Chưa thanh toán'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm trong đợt giao</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Đơn vị</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {delivery.items.map((it, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{it.productName}</TableCell>
                      <TableCell>{it.qty}</TableCell>
                      <TableCell>{it.uom}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Proof Images */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconPhoto className='h-5 w-5' /> Hình ảnh chứng minh
            </CardTitle>
          </CardHeader>
          <CardContent>
            {delivery.proofImages && delivery.proofImages.length > 0 ? (
              <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                {delivery.proofImages.map((src, idx) => (
                  <div key={idx} className='overflow-hidden rounded-md border'>
                    <img
                      src={src}
                      alt={`Proof ${idx + 1}`}
                      className='h-32 w-full object-cover'
                      loading='lazy'
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>
                Chưa có hình ảnh chứng minh.
              </p>
            )}
            <div className='mt-4 flex justify-end'>
              <Button variant='outline' disabled>
                Thêm hình (demo)
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-end'>
          <Button asChild variant='outline'>
            <Link href='/consignee/deliveries'>Quay lại danh sách</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
