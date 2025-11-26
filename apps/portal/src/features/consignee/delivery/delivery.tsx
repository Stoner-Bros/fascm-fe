'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchMyOrders } from '@/services/order.service';
import {
  fetchDeliveriesByOrderSchedule,
  type Delivery
} from '@/services/delivery.service';

type DeliveryItem = {
  productName: string;
  uom: string;
  qty: number;
};

type DeliveryBatch = {
  id: string;
  orderId: string;
  orderRef: string;
  batchNo: number;
  status: 'Scheduled' | 'InTransit' | 'Delivered';
  paymentStatus: 'Unpaid' | 'PartiallyPaid' | 'Paid';
  scheduledDate: string; // ISO
  deliveredDate?: string; // ISO
  items: DeliveryItem[];
  amount: number; // VND
};

function mapDeliveryToRow(d: Delivery): {
  id: string;
  orderScheduleId: string;
  status: string;
  startTime?: string | null;
  endTime?: string | null;
} {
  return {
    id: d.id,
    orderScheduleId: String(d.orderSchedule?.id ?? ''),
    status: String(d.status ?? ''),
    startTime: d.startTime ?? null,
    endTime: d.endTime ?? null
  };
}

function formatCurrencyVND(n: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(n);
}

export default function ConsigneeDeliveryFeature() {
  const [rows, setRows] = useState<ReturnType<typeof mapDeliveryToRow>[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    fetchMyOrders({ page: 1, limit: 10 })
      .then(async (res) => {
        const scheduleIds = res.data
          .map((o) => o.orderSchedule?.id)
          .filter((id): id is string => !!id);
        const deliveriesLists = await Promise.all(
          scheduleIds.map((sid) =>
            fetchDeliveriesByOrderSchedule({
              orderScheduleId: sid,
              page: 1,
              limit: 10
            })
          )
        );
        const deliveries = deliveriesLists.flatMap((r) => r.data);
        const mapped = deliveries.map(mapDeliveryToRow);
        if (!ignore) setRows(mapped);
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, []);
  const totalBatches = rows.length;
  const deliveredCount = rows.filter((d) => d.status === 'COMPLETED').length;
  const totalAmount = 0;
  const unpaidAmount = 0;

  const badgeForStatus = (s: DeliveryBatch['status']) => {
    switch (s) {
      case 'Scheduled':
        return <Badge variant='secondary'>Scheduled</Badge>;
      case 'InTransit':
        return <Badge>In Transit</Badge>;
      case 'Delivered':
        return <Badge variant='success'>Delivered</Badge>;
    }
  };

  const badgeForPayment = (p: DeliveryBatch['paymentStatus']) => {
    switch (p) {
      case 'Unpaid':
        return <Badge variant='destructive'>Unpaid</Badge>;
      case 'PartiallyPaid':
        return <Badge variant='outline'>Partially Paid</Badge>;
      case 'Paid':
        return <Badge variant='success'>Paid</Badge>;
    }
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Delivery theo đơn hàng
            </h2>
            <p className='text-muted-foreground'>
              Quản lý các đợt giao, thanh toán theo từng đợt.
            </p>
          </div>
          <div>
            <Button asChild>
              <Link href={'/consignee/deliveries/DEMO-RT-001/live'}>
                Xem Demo Realtime
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan</CardTitle>
            <CardDescription>
              Thống kê nhanh các đợt giao đang diễn ra
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-4'>
              <div className='rounded-md border p-4'>
                <p className='text-muted-foreground text-sm'>Tổng số đợt</p>
                <p className='text-xl font-semibold'>{totalBatches}</p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-muted-foreground text-sm'>Đã giao</p>
                <p className='text-xl font-semibold'>{deliveredCount}</p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-muted-foreground text-sm'>Tổng giá trị</p>
                <p className='text-xl font-semibold'>
                  {formatCurrencyVND(totalAmount)}
                </p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-muted-foreground text-sm'>Chưa thanh toán</p>
                <p className='text-xl font-semibold'>
                  {formatCurrencyVND(unpaidAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deliveries list */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách các đợt giao</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className='text-right'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.orderScheduleId || '-'}</TableCell>
                      <TableCell>{d.status || '-'}</TableCell>
                      <TableCell>{d.startTime ?? '-'}</TableCell>
                      <TableCell>{d.endTime ?? '-'}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className='space-x-2 text-right'>
                        <Button asChild variant='outline' size='sm'>
                          <Link href={`/consignee/deliveries/${d.id}`}>
                            Xem
                          </Link>
                        </Button>
                        <Button asChild size='sm'>
                          <Link href={`/consignee/deliveries/${d.id}/live`}>
                            Live
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
