'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  IconTruckDelivery,
  IconRefresh,
  IconEye,
  IconMapPin,
  IconClock,
  IconArrowRight
} from '@tabler/icons-react';
import { fetchDeliveries, deleteDelivery } from '@/services/delivery.service';
import type { Delivery } from '@/types/delivery';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function DeliveryStatusBadge({ status }: { status?: string | null }) {
  if (!status) return <Badge variant='outline'>Unknown</Badge>;

  const variants: Record<string, { label: string; variant: any }> = {
    scheduled: { label: 'Đã lên lịch', variant: 'secondary' },
    departed: { label: 'Đã khởi hành', variant: 'default' },
    in_transit: { label: 'Đang vận chuyển', variant: 'default' },
    arrived: { label: 'Đã đến', variant: 'default' },
    completed: { label: 'Hoàn thành', variant: 'default' },
    cancelled: { label: 'Đã hủy', variant: 'destructive' },
    delayed: { label: 'Trễ hẹn', variant: 'destructive' }
  };

  const config = variants[status] || { label: status, variant: 'outline' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function DeliveryTypeBadge({ delivery }: { delivery: Delivery }) {
  if (delivery.harvestSchedule) {
    return <Badge variant='default'>Inbound - Thu mua</Badge>;
  }
  if (delivery.orderSchedule) {
    return <Badge variant='default'>Outbound - Giao hàng</Badge>;
  }
  return <Badge variant='outline'>Unknown</Badge>;
}

export function DeliveryTracking() {
  const { toast } = useToast();

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'inbound' | 'outbound'>(
    'all'
  );

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    hasNextPage: false
  });

  // Load all deliveries
  const loadDeliveries = async () => {
    setIsLoading(true);
    try {
      const res = await fetchDeliveries({
        page: pagination.page,
        limit: pagination.limit
      });
      setDeliveries(res.data);
      setPagination((prev) => ({ ...prev, hasNextPage: res.hasNextPage }));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách giao hàng',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  // Handle delete delivery
  const handleDelete = async (delivery: Delivery) => {
    if (!confirm('Bạn có chắc muốn xóa chuyến giao hàng này?')) return;

    try {
      await deleteDelivery(delivery.id);
      toast({
        title: 'Thành công',
        description: 'Đã xóa chuyến giao hàng'
      });
      loadDeliveries();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể xóa'
      });
    }
  };

  // Format date
  const formatDate = (date?: string | Date | null) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (d.getFullYear() === 1970) return 'N/A'; // Handle epoch time
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter deliveries by type
  const filteredDeliveries = deliveries.filter((d) => {
    if (activeTab === 'inbound') return d.harvestSchedule !== null;
    if (activeTab === 'outbound') return d.orderSchedule !== null;
    return true;
  });

  const inboundCount = deliveries.filter((d) => d.harvestSchedule).length;
  const outboundCount = deliveries.filter((d) => d.orderSchedule).length;

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <IconTruckDelivery className='h-5 w-5' />
                Theo Dõi Giao Hàng
              </CardTitle>
              <CardDescription>
                Quản lý và theo dõi tất cả các chuyến giao hàng
              </CardDescription>
            </div>
            <Button onClick={loadDeliveries} variant='outline' size='sm'>
              <IconRefresh className='mr-2 h-4 w-4' />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className='mb-4'>
              <TabsTrigger value='all'>
                Tất cả ({deliveries.length})
              </TabsTrigger>
              <TabsTrigger value='inbound'>
                Inbound ({inboundCount})
              </TabsTrigger>
              <TabsTrigger value='outbound'>
                Outbound ({outboundCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã giao hàng</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Xe</TableHead>
                      <TableHead>Tuyến đường</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className='text-right'>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className='text-center'>
                          Đang tải...
                        </TableCell>
                      </TableRow>
                    ) : filteredDeliveries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className='text-center'>
                          Không có chuyến giao hàng nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDeliveries.map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell className='font-mono text-sm'>
                            {delivery.id}
                          </TableCell>
                          <TableCell>
                            <DeliveryTypeBadge delivery={delivery} />
                          </TableCell>
                          <TableCell>
                            <div className='flex flex-col'>
                              <span className='font-semibold'>
                                {delivery.truck?.licensePlate || 'N/A'}
                              </span>
                              <span className='text-muted-foreground text-xs'>
                                {delivery.truck?.model}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className='min-w-[300px]'>
                            <div className='flex items-center gap-2 text-sm'>
                              <span
                                className='max-w-[300px] truncate'
                                title={delivery.startAddress || ''}
                              >
                                {delivery.startAddress}
                              </span>
                              <IconArrowRight className='text-muted-foreground h-3 w-3 flex-shrink-0' />
                              <span
                                className='max-w-[300px] truncate'
                                title={delivery.endAddress || ''}
                              >
                                {delivery.endAddress}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-1 text-xs'>
                              <IconClock className='h-3 w-3' />
                              {formatDate(delivery.startTime)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DeliveryStatusBadge status={delivery.status} />
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex justify-end gap-2'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => {
                                  setSelectedDelivery(delivery);
                                  setIsDetailDialogOpen(true);
                                }}
                              >
                                <IconEye className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleDelete(delivery)}
                              >
                                Hủy
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className='mt-4 flex items-center justify-between'>
                <div className='text-muted-foreground text-sm'>
                  Trang {pagination.page}
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1
                      }))
                    }
                    disabled={pagination.page === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1
                      }))
                    }
                    disabled={!pagination.hasNextPage}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Chi tiết giao hàng</DialogTitle>
          </DialogHeader>
          {selectedDelivery && (
            <div className='space-y-6'>
              {/* Basic Info */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-muted-foreground'>Mã giao hàng</Label>
                  <p className='font-mono'>{selectedDelivery.id}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>
                    Loại giao hàng
                  </Label>
                  <div className='mt-1'>
                    <DeliveryTypeBadge delivery={selectedDelivery} />
                  </div>
                </div>
                <div>
                  <Label className='text-muted-foreground'>Trạng thái</Label>
                  <div className='mt-1'>
                    <DeliveryStatusBadge status={selectedDelivery.status} />
                  </div>
                </div>
              </div>

              {/* Truck Info */}
              <div className='border-t pt-4'>
                <h4 className='mb-3 font-semibold'>Thông tin xe</h4>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-muted-foreground'>Biển số xe</Label>
                    <p className='font-semibold'>
                      {selectedDelivery.truck?.licensePlate || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className='text-muted-foreground'>Model</Label>
                    <p>{selectedDelivery.truck?.model || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className='text-muted-foreground'>Tải trọng</Label>
                    <p>
                      {selectedDelivery.truck?.capacity
                        ? `${selectedDelivery.truck.capacity} kg`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className='text-muted-foreground'>
                      Vị trí hiện tại
                    </Label>
                    <p className='flex items-center gap-1'>
                      <IconMapPin className='h-3 w-3' />
                      {selectedDelivery.truck?.currentLocation || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Route Info */}
              <div className='border-t pt-4'>
                <h4 className='mb-3 font-semibold'>Tuyến đường</h4>
                <div className='space-y-3'>
                  <div className='flex items-start gap-3'>
                    <div className='text-muted-foreground w-24 flex-shrink-0 text-sm'>
                      Điểm đi:
                    </div>
                    <div className='flex-1'>
                      <p>{selectedDelivery.startAddress || 'N/A'}</p>
                      <p className='text-muted-foreground mt-1 text-xs'>
                        Khởi hành: {formatDate(selectedDelivery.startTime)}
                      </p>
                    </div>
                  </div>
                  <div className='ml-12 flex items-center gap-3'>
                    <IconArrowRight className='text-muted-foreground h-4 w-4' />
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='text-muted-foreground w-24 flex-shrink-0 text-sm'>
                      Điểm đến:
                    </div>
                    <div className='flex-1'>
                      <p>{selectedDelivery.endAddress || 'N/A'}</p>
                      <p className='text-muted-foreground mt-1 text-xs'>
                        Dự kiến đến: {formatDate(selectedDelivery.endTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Info */}
              {selectedDelivery.harvestSchedule && (
                <div className='border-t pt-4'>
                  <h4 className='mb-3 font-semibold'>Lịch thu hoạch</h4>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label className='text-muted-foreground'>Mã lịch</Label>
                      <p className='font-mono text-sm'>
                        {selectedDelivery.harvestSchedule.id}
                      </p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground'>
                        Ngày thu hoạch
                      </Label>
                      <p>
                        {formatDate(
                          selectedDelivery.harvestSchedule.harvestDate
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedDelivery.orderSchedule && (
                <div className='border-t pt-4'>
                  <h4 className='mb-3 font-semibold'>Đơn hàng</h4>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label className='text-muted-foreground'>Mã đơn</Label>
                      <p className='font-mono text-sm'>
                        {selectedDelivery.orderSchedule.id}
                      </p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground'>Ngày đặt</Label>
                      <p>
                        {formatDate(selectedDelivery.orderSchedule.orderDate)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
