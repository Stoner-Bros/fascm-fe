'use client';

import { useEffect, useState, useMemo } from 'react';
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
  DialogDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  IconTruckLoading,
  IconRefresh,
  IconEye,
  IconCalendar,
  IconMapPin,
  IconTruck
} from '@tabler/icons-react';
import { fetchHarvestSchedules } from '@/services/harvest-schedule.service';
import { fetchTrucks } from '@/services/truck.service';
import { createDelivery, fetchDeliveries } from '@/services/delivery.service';
import type { HarvestSchedule } from '@/types/harvest-schedule';
import type { Truck } from '@/types/truck';
import type { Delivery } from '@/types/delivery';
import { useToast } from '@/components/ui/use-toast';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { fetchInboundBatches } from '@/services/inbound-batch.service';
import { fetchHarvestTickets } from '@/services/harvest-ticket.service';
import { fetchHarvestDetailsByHarvestTicketId } from '@/services/harvest-detail.service';
import type { InboundBatch } from '@/types/inbound-batch';

function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <Badge variant='outline'>Unknown</Badge>;

  const variants: Record<string, { label: string; variant: any }> = {
    pending: { label: 'Chờ duyệt', variant: 'secondary' },
    approved: { label: 'Sẵn sàng thu mua', variant: 'default' },
    rejected: { label: 'Từ chối', variant: 'destructive' },
    canceled: { label: 'Đã hủy', variant: 'outline' },
    completed: { label: 'Hoàn thành', variant: 'default' }
  };

  const config = variants[status] || { label: status, variant: 'outline' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function TruckStatusBadge({ status }: { status?: string | null }) {
  if (!status) return <Badge variant='outline'>Unknown</Badge>;

  const variants: Record<string, { label: string; variant: any }> = {
    active: { label: 'Hoạt động', variant: 'default' },
    in_use: { label: 'Đang dùng', variant: 'secondary' },
    maintenance: { label: 'Bảo trì', variant: 'destructive' },
    inactive: { label: 'Không hoạt động', variant: 'outline' }
  };

  const config = variants[status] || { label: status, variant: 'outline' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function InboundTruckAssignment() {
  const { toast } = useToast();

  const [schedules, setSchedules] = useState<HarvestSchedule[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedSchedule, setSelectedSchedule] =
    useState<HarvestSchedule | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [inboundItems, setInboundItems] = useState<InboundBatch[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [assignmentForm, setAssignmentForm] = useState({
    truckId: '',
    startTime: null as Date | null,
    estimatedArrival: null as Date | null
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    hasNextPage: false
  });

  // Load all deliveries to check assignments
  const loadDeliveries = async () => {
    try {
      const res = await fetchDeliveries({ page: 1, limit: 1000 });
      // Include all deliveries without filtering by status
      setDeliveries(res.data);
    } catch (error) {
      // Silent error - deliveries will be empty
    }
  };

  // Load all harvest schedules
  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const res = await fetchHarvestSchedules({
        page: pagination.page,
        limit: pagination.limit,
        status: 'approved'
      });
      // Display all schedules without filtering by status or assignment
      setSchedules(res.data);
      setPagination((prev) => ({ ...prev, hasNextPage: res.hasNextPage }));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách lịch thu hoạch',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load available trucks
  const loadTrucks = async () => {
    try {
      const res = await fetchTrucks({ page: 1, limit: 100 });
      // Filter only active trucks (not maintenance or inactive)
      const availableTrucks = res.data.filter(
        (t: Truck) => t.status === 'active'
      );
      setTrucks(availableTrucks);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách xe',
        description: error instanceof Error ? error.message : undefined
      });
    }
  };

  useEffect(() => {
    loadDeliveries();
    loadTrucks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (deliveries.length > 0 || pagination.page === 1) {
      loadSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, deliveries]);

  useEffect(() => {
    const loadDetailProducts = async () => {
      if (!isDetailDialogOpen || !selectedSchedule) return;
      setIsDetailLoading(true);
      try {
        const ticketsRes = await fetchHarvestTickets({
          page: 1,
          limit: 1000
        });
        const matchedTickets = (ticketsRes.data || []).filter((t: any) => {
          const ticketScheduleId =
            t?.harvestScheduleId?.id ??
            t?.harvestSchedule?.id ??
            t?.harvestScheduleId ??
            t?.scheduleId ??
            '';
          return String(ticketScheduleId) === String(selectedSchedule.id);
        });
        let detailIds: string[] = [];
        if (matchedTickets.length > 0) {
          const detailResponses = await Promise.all(
            matchedTickets.map(async (t: any) => {
              try {
                const ds = await fetchHarvestDetailsByHarvestTicketId(t.id);
                return ds ?? [];
              } catch {
                return [];
              }
            })
          );
          detailIds = detailResponses.flat().map((d) => d.id);
        }
        const inboundRes = await fetchInboundBatches({ page: 1, limit: 1000 });
        const idSet = new Set(detailIds);
        const filtered = (inboundRes.data || []).filter(
          (b) => !!b.harvestDetail?.id && idSet.has(b.harvestDetail.id)
        );
        setInboundItems(filtered);
      } catch {
        setInboundItems([]);
      } finally {
        setIsDetailLoading(false);
      }
    };
    loadDetailProducts();
  }, [isDetailDialogOpen, selectedSchedule]);

  // Handle assign truck for inbound pickup
  const handleAssignTruck = async () => {
    if (!selectedSchedule || !assignmentForm.truckId) return;

    setIsSubmitting(true);
    try {
      // Create an inbound delivery record
      await createDelivery({
        truck: { id: assignmentForm.truckId },
        harvestSchedule: { id: selectedSchedule.id },
        startTime: assignmentForm.startTime?.toISOString() || null,
        endTime: assignmentForm.estimatedArrival?.toISOString() || null,
        status: 'scheduled',
        startLat: null,
        startLng: null,
        endLat: null,
        endLng: null,
        startAddress: 'Kho trung tâm',
        endAddress:
          selectedSchedule.supplierId?.address || 'Địa chỉ khách hàng',
        orderSchedule: null
      });

      toast({
        title: 'Thành công',
        description: 'Đã phân công xe đi thu mua hàng'
      });
      setIsAssignDialogOpen(false);
      setSelectedSchedule(null);
      setAssignmentForm({
        truckId: '',
        startTime: null,
        estimatedArrival: null
      });
      // Reload deliveries and schedules
      await loadDeliveries();
      loadSchedules();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description:
          error instanceof Error ? error.message : 'Không thể phân công xe'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out schedules that already have deliveries assigned
  const availableSchedules = useMemo(() => {
    // Get set of schedule IDs that already have deliveries
    const assignedScheduleIds = new Set(
      deliveries
        .filter((d) => d.harvestSchedule?.id)
        .map((d) => {
          const scheduleId =
            d.harvestSchedule?.id ?? (d.harvestSchedule as any)?.id ?? '';
          return String(scheduleId);
        })
    );

    // Filter out schedules that are already assigned
    return schedules.filter((schedule) => {
      const scheduleId = String(schedule.id);
      return !assignedScheduleIds.has(scheduleId);
    });
  }, [schedules, deliveries]);

  // Format date
  const formatDate = (date?: string | Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className='space-y-4'>
      <Card className='w-full'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <IconTruckLoading className='h-5 w-5' />
                Phân Công Xe Thu Mua Hàng (Inbound)
              </CardTitle>
              <CardDescription>
                Phân công xe đi thu mua hàng từ nhà cung cấp về kho
                {deliveries.length > 0 && (
                  <span className='text-muted-foreground ml-2 text-xs'>
                    ({deliveries.filter((d) => d.harvestSchedule).length} đã
                    phân công)
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              onClick={async () => {
                await loadDeliveries();
                loadSchedules();
              }}
              variant='outline'
              size='sm'
            >
              <IconRefresh className='mr-2 h-4 w-4' />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã lịch</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Ngày thu hoạch</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className='text-right'>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center'>
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : availableSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center'>
                      Không có lịch thu hoạch
                    </TableCell>
                  </TableRow>
                ) : (
                  availableSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className='font-mono text-sm'>
                        {schedule.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>{schedule.supplierId?.gardenName}</TableCell>
                      <TableCell>{formatDate(schedule.harvestDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={schedule.status} />
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            <IconEye className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='default'
                            size='sm'
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setIsAssignDialogOpen(true);
                            }}
                          >
                            <IconTruck className='mr-1 h-4 w-4' />
                            Phân công xe
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
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
              >
                Trước
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={!pagination.hasNextPage}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Trucks Card */}
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconTruck className='h-5 w-5' />
            Xe Khả Dụng ({trucks.length})
          </CardTitle>
          <CardDescription>
            Danh sách xe tải đang sẵn sàng để phân công
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {trucks.length === 0 ? (
              <p className='text-muted-foreground col-span-full py-4 text-center'>
                Không có xe khả dụng
              </p>
            ) : (
              trucks.map((truck) => (
                <Card key={truck.id}>
                  <CardContent className='pt-6'>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className='text-lg font-semibold'>
                          {truck.licensePlate}
                        </span>
                        <TruckStatusBadge status={truck.status} />
                      </div>
                      <div className='text-muted-foreground space-y-1 text-sm'>
                        <div>Model: {truck.model || 'N/A'}</div>
                        <div>
                          Tải trọng:{' '}
                          {truck.capacity ? `${truck.capacity} kg` : 'N/A'}
                        </div>
                        {truck.currentLocation && (
                          <div className='mt-1 flex items-center gap-1'>
                            <IconMapPin className='h-3 w-3' />
                            {truck.currentLocation}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Deliveries List */}
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconTruckLoading className='h-5 w-5' />
            Danh Sách Chuyến Inbound ({deliveries.length})
          </CardTitle>
          <CardDescription>
            Hiển thị tất cả chuyến, bao gồm đã hoàn thành và đã hủy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Lịch thu hoạch</TableHead>
                  <TableHead>Xe</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Khởi hành</TableHead>
                  <TableHead>Kết thúc</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center'>
                      Không có chuyến inbound
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveries.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className='font-mono text-sm'>
                        {d.id}
                      </TableCell>
                      <TableCell className='font-mono text-sm'>
                        {d.harvestSchedule?.id || '-'}
                      </TableCell>
                      <TableCell>
                        {d.truck?.licensePlate || d.truck?.id || '-'}
                      </TableCell>
                      <TableCell>{d.status || '-'}</TableCell>
                      <TableCell>{formatDate(d.startTime)}</TableCell>
                      <TableCell>{formatDate(d.endTime)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Chi tiết lịch thu hoạch</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-muted-foreground'>Mã lịch</Label>
                  <p className='font-mono text-sm'>{selectedSchedule.id}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>Trạng thái</Label>
                  <div className='mt-1'>
                    <StatusBadge status={selectedSchedule.status} />
                  </div>
                </div>
                <div>
                  <Label className='text-muted-foreground'>Nhà cung cấp</Label>
                  <p>{selectedSchedule.supplierId?.gardenName}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>
                    Ngày thu hoạch
                  </Label>
                  <p>{formatDate(selectedSchedule.harvestDate)}</p>
                </div>
                <div className='col-span-2'>
                  <Label className='text-muted-foreground'>Mô tả</Label>
                  <p>{selectedSchedule.description || 'Không có mô tả'}</p>
                </div>
              </div>
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
                    {isDetailLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className='text-center'>
                          Đang tải...
                        </TableCell>
                      </TableRow>
                    ) : inboundItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className='text-center'>
                          Không có sản phẩm
                        </TableCell>
                      </TableRow>
                    ) : (
                      inboundItems.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell>{b.product?.name || 'Vip'}</TableCell>
                          <TableCell>{b.quantity}</TableCell>
                          <TableCell>{b.unit}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
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

      {/* Assign Truck Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Phân công xe thu mua hàng</DialogTitle>
            <DialogDescription>
              Chọn xe và lên lịch đi thu mua hàng từ nhà cung cấp về kho
            </DialogDescription>
          </DialogHeader>
          {selectedSchedule && (
            <div className='space-y-4'>
              <div className='bg-muted rounded-lg p-4'>
                <h4 className='mb-2 flex items-center gap-2 font-semibold'>
                  <IconCalendar className='h-4 w-4' />
                  Thông tin lịch thu hoạch
                </h4>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div>
                    <span className='text-muted-foreground'>Nhà cung cấp:</span>{' '}
                    <span className='font-medium'>
                      {selectedSchedule.supplierId?.representativeName ||
                        selectedSchedule.supplierId?.gardenName ||
                        'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>
                      Ngày thu hoạch:
                    </span>{' '}
                    <span className='font-medium'>
                      {formatDate(selectedSchedule.harvestDate)}
                    </span>
                  </div>
                  <div className='col-span-2'>
                    <span className='text-muted-foreground'>Địa chỉ:</span>{' '}
                    <span className='font-medium'>
                      {selectedSchedule.supplierId?.address || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <Label htmlFor='truck-select'>Chọn xe *</Label>
                  <Select
                    value={assignmentForm.truckId}
                    onValueChange={(value) =>
                      setAssignmentForm((prev) => ({ ...prev, truckId: value }))
                    }
                  >
                    <SelectTrigger id='truck-select'>
                      <SelectValue placeholder='Chọn xe...' />
                    </SelectTrigger>
                    <SelectContent>
                      {trucks.map((truck) => (
                        <SelectItem key={truck.id} value={truck.id}>
                          {truck.licensePlate} - {truck.model} (
                          {truck.capacity ? `${truck.capacity} kg` : 'N/A'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='start-time'>Thời gian khởi hành từ kho</Label>
                  <DateTimePicker
                    value={assignmentForm.startTime || undefined}
                    onChange={(value) =>
                      setAssignmentForm((prev) => ({
                        ...prev,
                        startTime: new Date(value)
                      }))
                    }
                    placeholder='Chọn thời gian khởi hành'
                  />
                </div>

                <div>
                  <Label htmlFor='estimated-arrival'>
                    Thời gian dự kiến đến nhà cung cấp
                  </Label>
                  <DateTimePicker
                    value={assignmentForm.estimatedArrival || undefined}
                    onChange={(value) =>
                      setAssignmentForm((prev) => ({
                        ...prev,
                        estimatedArrival: new Date(value)
                      }))
                    }
                    placeholder='Chọn thời gian dự kiến'
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsAssignDialogOpen(false);
                setAssignmentForm({
                  truckId: '',
                  startTime: null,
                  estimatedArrival: null
                });
              }}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAssignTruck}
              disabled={isSubmitting || !assignmentForm.truckId}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận phân công'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
