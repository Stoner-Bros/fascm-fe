'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { Order } from '../types/order';
import { formatDate } from '@/lib/format';
import { OrderService } from '@/features/consignee/services/order-service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { fetchMyOrders } from '@/services/order.service';

export default function ConsigneeOrdersFeature() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [orderDateFrom, setOrderDateFrom] = useState<string>('');
  const [orderDateTo, setOrderDateTo] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const LIMIT = 8;
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const statusClasses = (s?: string) => {
    const k = String(s ?? '').toUpperCase();
    if (k === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700';
    if (k === 'COMPLETED') return 'bg-green-100 text-green-700';
    if (k === 'CANCELLED') return 'bg-red-100 text-red-700';
    if (k === 'SCHEDULED') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchMyOrders({ page, limit: LIMIT })
      .then((res) => {
        if (!mounted) return;
        const data = res.data ?? [];
        const toTime = (o: Order) =>
          new Date((o.orderDate as any) ?? (o.createdAt as any)).getTime();
        const sorted = [...data].sort((a, b) => toTime(b) - toTime(a));
        setOrders(sorted);
        setHasNextPage(Boolean((res as any).hasNextPage));
      })
      .catch(() => {
        if (!mounted) return;
        toast({
          title: 'Lỗi tải đơn hàng',
          description: 'Không thể tải danh sách đơn hàng'
        });
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [page]);

  const inDateRange = (d?: string | null) => {
    if (!d) return true;
    const t = new Date(d).getTime();
    if (Number.isNaN(t)) return true;
    const fromOk = orderDateFrom
      ? t >= new Date(orderDateFrom).getTime()
      : true;
    const toOk = orderDateTo ? t <= new Date(orderDateTo).getTime() : true;
    return fromOk && toOk;
  };

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.trim().toLowerCase();
    const matchId = q.length === 0 ? true : order.id.toLowerCase().includes(q);
    const status = String(order.orderSchedule?.status ?? '').toUpperCase();
    const matchStatus =
      statusFilter && statusFilter !== 'ALL' ? status === statusFilter : true;
    const matchDate = inDateRange(order.orderDate ?? null);
    return matchId && matchStatus && matchDate;
  });
  const showNewest = false;

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>Orders</h2>
            <p className='text-muted-foreground'>
              Manage and track your orders
            </p>
          </div>
          <Link href='/consignee/orders/new'>
            <Button>New Order</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4'>
              <Input
                placeholder='Tìm theo Order ID'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Lọc theo trạng thái' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>Tất cả</SelectItem>
                  <SelectItem value='IN_PROGRESS'>IN_PROGRESS</SelectItem>
                  <SelectItem value='SCHEDULED'>SCHEDULED</SelectItem>
                  <SelectItem value='COMPLETED'>COMPLETED</SelectItem>
                  <SelectItem value='CANCELLED'>CANCELLED</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type='date'
                value={orderDateFrom}
                onChange={(e) => setOrderDateFrom(e.target.value)}
                placeholder='Từ ngày'
              />
              <Input
                type='date'
                value={orderDateTo}
                onChange={(e) => setOrderDateTo(e.target.value)}
                placeholder='Đến ngày'
              />
            </div>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Schedule Status</TableHead>
                    <TableHead>Schedule Description</TableHead>
                    <TableHead>Schedule Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Total Payment</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className='text-center'>
                        {loading ? 'Đang tải...' : 'Không có đơn hàng'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className='font-medium'>
                          {order.id}
                        </TableCell>
                        <TableCell>
                          {formatDate(order.orderDate ?? '-')}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${statusClasses(order.orderSchedule?.status)}`}
                          >
                            {order.orderSchedule?.status ?? '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {order.orderSchedule?.description ?? '-'}
                        </TableCell>
                        <TableCell>
                          {formatDate(order.orderSchedule?.orderDate ?? '-')}
                        </TableCell>
                        <TableCell>
                          {OrderService.formatCurrency(
                            Number(order.totalAmount ?? 0)
                          )}
                        </TableCell>
                        <TableCell>
                          {OrderService.formatCurrency(
                            Number(order.totalPayment ?? 0)
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Link href={`/consignee/orders/${order.id}`}>
                            <Button variant='ghost' size='sm'>
                              Xem
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className='mt-3 flex items-center justify-between'>
              <div className='text-muted-foreground text-sm'>Trang {page}</div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Trước
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={!hasNextPage || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
