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
  paymentMethod: 'Cash' | 'BankTransfer';
  scheduledDate: string; // ISO
  deliveredDate?: string; // ISO
  items: DeliveryItem[];
  amount: number; // VND
  proofImages?: string[]; // URLs của hình ảnh chứng minh
};

export const mockDeliveries: DeliveryBatch[] = [
  {
    id: 'DEL-001',
    orderId: 'ORD-1001',
    orderRef: 'ORD-1001',
    batchNo: 1,
    status: 'Delivered',
    paymentStatus: 'PartiallyPaid',
    paymentMethod: 'BankTransfer',
    scheduledDate: '2025-11-10',
    deliveredDate: '2025-11-10',
    items: [
      { productName: 'Tomatoes', uom: 'kg', qty: 120 },
      { productName: 'Bananas', uom: 'kg', qty: 80 }
    ],
    amount: 6_000_000,
    proofImages: [
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=600&auto=format&fit=crop'
    ]
  },
  {
    id: 'DEL-002',
    orderId: 'ORD-1001',
    orderRef: 'ORD-1001',
    batchNo: 2,
    status: 'InTransit',
    paymentStatus: 'Unpaid',
    paymentMethod: 'Cash',
    scheduledDate: '2025-11-12',
    items: [
      { productName: 'Green Lettuce', uom: 'kg', qty: 50 },
      { productName: 'Cucumbers', uom: 'kg', qty: 100 }
    ],
    amount: 3_400_000,
    proofImages: [
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=600&auto=format&fit=crop'
    ]
  },
  {
    id: 'DEL-003',
    orderId: 'ORD-1002',
    orderRef: 'ORD-1002',
    batchNo: 1,
    status: 'Scheduled',
    paymentStatus: 'Unpaid',
    paymentMethod: 'BankTransfer',
    scheduledDate: '2025-11-13',
    items: [{ productName: 'Bell Peppers', uom: 'kg', qty: 60 }],
    amount: 1_920_000
  }
];

function formatCurrencyVND(n: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(n);
}

export default function ConsigneeDeliveryFeature() {
  const totalBatches = mockDeliveries.length;
  const deliveredCount = mockDeliveries.filter(
    (d) => d.status === 'Delivered'
  ).length;
  const totalAmount = mockDeliveries.reduce((acc, d) => acc + d.amount, 0);
  const unpaidAmount = mockDeliveries
    .filter((d) => d.paymentStatus !== 'Paid')
    .reduce((acc, d) => acc + d.amount, 0);

  // Group deliveries by order to handle multiple orders each with multiple batches
  const deliveriesByOrder = mockDeliveries.reduce(
    (acc, d) => {
      if (!acc[d.orderId]) acc[d.orderId] = [];
      acc[d.orderId].push(d);
      return acc;
    },
    {} as Record<string, DeliveryBatch[]>
  );

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
            <div className='space-y-6'>
              {Object.keys(deliveriesByOrder).map((orderId) => {
                const group = deliveriesByOrder[orderId];
                const orderRef = group[0]?.orderRef ?? orderId;
                return (
                  <div key={orderId}>
                    <div className='mb-2 flex items-center justify-between'>
                      <div className='text-sm font-medium'>
                        Đơn hàng {orderRef} — {group.length} đợt giao
                      </div>
                      <Link
                        href={`/consignee/orders/${orderId}`}
                        className='text-primary text-sm hover:underline'
                      >
                        Xem đơn
                      </Link>
                    </div>
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
                          {group.map((d) => (
                            <TableRow key={d.id}>
                              <TableCell>
                                <Link
                                  href={`/consignee/orders/${d.orderId}`}
                                  className='font-medium hover:underline'
                                >
                                  {d.orderRef}
                                </Link>
                              </TableCell>
                              <TableCell>#{d.batchNo}</TableCell>
                              <TableCell>{badgeForStatus(d.status)}</TableCell>
                              <TableCell>
                                {badgeForPayment(d.paymentStatus)}
                              </TableCell>
                              <TableCell>{d.scheduledDate}</TableCell>
                              <TableCell>{d.deliveredDate ?? '-'}</TableCell>
                              <TableCell>
                                <ul className='text-muted-foreground text-sm'>
                                  {d.items.map((it, idx) => (
                                    <li key={idx}>
                                      {it.productName} — {it.qty} {it.uom}
                                    </li>
                                  ))}
                                </ul>
                              </TableCell>
                              <TableCell>
                                {formatCurrencyVND(d.amount)}
                              </TableCell>
                              <TableCell className='text-right'>
                                <Link href={`/consignee/deliveries/${d.id}`}>
                                  <Button variant='outline' size='sm'>
                                    Xem
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
