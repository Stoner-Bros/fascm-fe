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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { fetchMyOrders } from '@/services/order.service';
import {
  fetchDeliveriesByOrderSchedule,
  confirmDeliveryReceived,
  type Delivery
} from '@/services/delivery.service';
import {
  IconCheck,
  IconRefresh,
  IconClock,
  IconTruck,
  IconMapPin
} from '@tabler/icons-react';

type DeliveryRow = {
  id: string;
  orderScheduleId: string;
  status: string;
  startTime?: string | null;
  endTime?: string | null;
  startAddress?: string | null;
  endAddress?: string | null;
  truck?: {
    id: string;
    licensePlate?: string | null;
    model?: string | null;
    capacity?: number | null;
  } | null;
  fullDelivery: Delivery;
};

function mapDeliveryToRow(d: Delivery): DeliveryRow {
  return {
    id: d.id,
    orderScheduleId: String(d.orderSchedule?.id ?? ''),
    status: String(d.status ?? ''),
    startTime: d.startTime ?? null,
    endTime: d.endTime ?? null,
    startAddress: d.startAddress ?? null,
    endAddress: d.endAddress ?? null,
    truck: d.truck ?? null,
    fullDelivery: d
  };
}

export default function ConsigneeDeliveryFeature() {
  const { toast } = useToast();
  const [rows, setRows] = useState<DeliveryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const res = await fetchMyOrders({ page: 1, limit: 100 });
      const scheduleIds = res.data
        .map((o) => o.orderSchedule?.id)
        .filter((id): id is string => !!id);
      const deliveriesLists = await Promise.all(
        scheduleIds.map((sid) =>
          fetchDeliveriesByOrderSchedule({
            orderScheduleId: sid,
            page: 1,
            limit: 100
          })
        )
      );
      const deliveries = deliveriesLists.flatMap((r) => r.data);
      const mapped = deliveries.map(mapDeliveryToRow);
      setRows(mapped);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách giao hàng',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const totalBatches = rows.length;
  const deliveredCount = rows.filter((d) => d.status === 'completed').length;
  const inTransitCount = rows.filter(
    (d) =>
      d.status === 'scheduled' ||
      d.status === 'departed' ||
      d.status === 'in_transit' ||
      d.status === 'arrived'
  ).length;
  const totalAmount = 0;
  const unpaidAmount = 0;

  const handleConfirmClick = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelivery = async () => {
    if (!selectedDelivery) return;

    try {
      await confirmDeliveryReceived(selectedDelivery.id);
      toast({
        title: 'Thành công',
        description: 'Đã xác nhận nhận hàng thành công',
        variant: 'default'
      });
      setIsConfirmDialogOpen(false);
      setSelectedDelivery(null);
      loadDeliveries(); // Reload the list
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xác nhận nhận hàng',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant='secondary' className='flex w-fit items-center gap-1'>
            <IconClock className='h-3 w-3' />
            Đã lên lịch
          </Badge>
        );
      case 'departed':
        return (
          <Badge variant='default' className='flex w-fit items-center gap-1'>
            <IconTruck className='h-3 w-3' />
            Đã khởi hành
          </Badge>
        );
      case 'in_transit':
        return (
          <Badge variant='default' className='flex w-fit items-center gap-1'>
            <IconTruck className='h-3 w-3' />
            Đang vận chuyển
          </Badge>
        );
      case 'arrived':
        return (
          <Badge variant='default' className='flex w-fit items-center gap-1'>
            <IconMapPin className='h-3 w-3' />
            Đã đến nơi
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant='default' className='flex w-fit items-center gap-1'>
            <IconCheck className='h-3 w-3' />
            Hoàn thành
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status || 'N/A'}</Badge>;
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const canConfirm = (status: string) => {
    return (
      status === 'scheduled' ||
      status === 'departed' ||
      status === 'in_transit' ||
      status === 'arrived'
    );
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Quản Lý Giao Hàng
            </h2>
            <p className='text-muted-foreground'>
              Theo dõi và xác nhận các chuyến giao hàng của bạn
            </p>
          </div>
          <Button onClick={loadDeliveries} variant='outline' size='sm'>
            <IconRefresh className='mr-2 h-4 w-4' />
            Làm mới
          </Button>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan</CardTitle>
            <CardDescription>
              Thống kê nhanh các chuyến giao hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <div className='rounded-md border p-4'>
                <p className='text-muted-foreground text-sm'>Tổng số chuyến</p>
                <p className='text-xl font-semibold'>{totalBatches}</p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-muted-foreground text-sm'>Đang vận chuyển</p>
                <p className='text-xl font-semibold'>{inTransitCount}</p>
              </div>
              <div className='rounded-md border p-4'>
                <p className='text-muted-foreground text-sm'>Đã giao</p>
                <p className='text-xl font-semibold'>{deliveredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deliveries list */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách chuyến giao hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã giao hàng</TableHead>
                    <TableHead>Mã đơn hàng</TableHead>
                    <TableHead>Xe vận chuyển</TableHead>
                    <TableHead>Địa chỉ nhận</TableHead>
                    <TableHead>Thời gian dự kiến</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center'>
                        Đang tải...
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center'>
                        Không có chuyến giao hàng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className='font-mono text-sm'>
                          {d.id}
                        </TableCell>
                        <TableCell className='font-mono text-sm'>
                          {d.orderScheduleId || '-'}
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-semibold'>
                              {d.truck?.licensePlate || 'N/A'}
                            </span>
                            <span className='text-muted-foreground text-xs'>
                              {d.truck?.model}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='max-w-[200px] truncate'>
                            {d.endAddress || '-'}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(d.endTime)}</TableCell>
                        <TableCell>{getStatusBadge(d.status)}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button asChild variant='outline' size='sm'>
                              <Link href={`/consignee/deliveries/${d.id}/live`}>
                                Theo dõi
                              </Link>
                            </Button>
                            {canConfirm(d.status) && (
                              <Button
                                size='sm'
                                onClick={() =>
                                  handleConfirmClick(d.fullDelivery)
                                }
                                className='gap-1'
                              >
                                <IconCheck className='h-4 w-4' />
                                Xác nhận
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đã nhận hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn đã nhận đầy đủ hàng từ chuyến giao hàng{' '}
              <strong>{selectedDelivery?.id}</strong>?
              <br />
              <br />
              Hành động này sẽ đánh dấu chuyến giao hàng là hoàn thành.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelivery}>
              <IconCheck className='mr-2 h-4 w-4' />
              Xác nhận đã nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
