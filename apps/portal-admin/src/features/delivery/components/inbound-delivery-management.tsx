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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
  IconTruck,
  IconPlus,
  IconRefresh,
  IconEdit,
  IconTrash,
  IconSearch
} from '@tabler/icons-react';
import {
  createDelivery,
  fetchDeliveries,
  updateDelivery,
  deleteDelivery
} from '@/services/delivery.service';
import { fetchTrucks } from '@/services/truck.service';
import { fetchHarvestSchedules } from '@/services/harvest-schedule.service';
import type {
  Delivery,
  CreateDeliveryDto,
  DeliveryStatusEnum
} from '@/types/delivery';
import type { Truck } from '@/types/truck';
import type { HarvestSchedule } from '@/types/harvest-schedule';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { DateTimePicker } from '@/components/ui/date-time-picker';

const defaultForm: CreateDeliveryDto = {
  startLat: null,
  startLng: null,
  endLat: null,
  endLng: null,
  startAddress: '',
  endAddress: '',
  status: 'scheduled',
  startTime: null,
  endTime: null,
  truck: null,
  harvestSchedule: null,
  orderSchedule: null
};

const ENUM_TO_UI: Record<DeliveryStatusEnum, string> = {
  scheduled: 'scheduled',
  delivering: 'in_transit',
  delivered: 'arrived',
  completed: 'completed',
  rejected: 'scheduled',
  returning: 'in_transit',
  canceled: 'cancelled'
};

const UI_TO_ENUM: Record<string, DeliveryStatusEnum> = {
  scheduled: 'scheduled',
  departed: 'delivering',
  in_transit: 'delivering',
  arrived: 'delivered',
  completed: 'completed',
  cancelled: 'canceled'
};

function StatusBadge({ status }: { status?: string | null }) {
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

export function InboundDeliveryManagement() {
  const { toast } = useToast();

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [harvestSchedules, setHarvestSchedules] = useState<HarvestSchedule[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [form, setForm] = useState<CreateDeliveryDto>(defaultForm);

  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    hasNextPage: false
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  // Load deliveries
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

  // Load trucks
  const loadTrucks = async () => {
    try {
      const res = await fetchTrucks({ page: 1, limit: 100 });
      setTrucks(res.data);
    } catch (error) {
      // Silent error - trucks will be empty
    }
  };

  // Load harvest schedules
  const loadHarvestSchedules = async () => {
    try {
      const res = await fetchHarvestSchedules({ page: 1, limit: 100 });
      setHarvestSchedules(res.data);
    } catch (error) {
      // Silent error - harvest schedules will be empty
    }
  };

  useEffect(() => {
    loadDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, debouncedSearch]);

  useEffect(() => {
    loadTrucks();
    loadHarvestSchedules();
  }, []);

  // Handle create
  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await createDelivery(form);
      toast({
        title: 'Thành công',
        description: 'Đã tạo giao hàng mới'
      });
      setIsCreateDialogOpen(false);
      setForm(defaultForm);
      loadDeliveries();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description:
          error instanceof Error ? error.message : 'Không thể tạo giao hàng'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!selectedDelivery) return;

    setIsSubmitting(true);
    try {
      await updateDelivery(selectedDelivery.id, form);
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật giao hàng'
      });
      setIsEditDialogOpen(false);
      setSelectedDelivery(null);
      setForm(defaultForm);
      loadDeliveries();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description:
          error instanceof Error ? error.message : 'Không thể cập nhật'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedDelivery) return;

    setIsSubmitting(true);
    try {
      await deleteDelivery(selectedDelivery.id);
      toast({
        title: 'Thành công',
        description: 'Đã xóa giao hàng'
      });
      setIsDeleteDialogOpen(false);
      setSelectedDelivery(null);
      loadDeliveries();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể xóa'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setForm({
      startLat: delivery.startLat,
      startLng: delivery.startLng,
      endLat: delivery.endLat,
      endLng: delivery.endLng,
      startAddress: delivery.startAddress,
      endAddress: delivery.endAddress,
      status: delivery.status,
      startTime: delivery.startTime,
      endTime: delivery.endTime,
      truck: delivery.truck ? { id: delivery.truck.id } : null,
      harvestSchedule: delivery.harvestSchedule
        ? { id: delivery.harvestSchedule.id }
        : null,
      orderSchedule: null
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsDeleteDialogOpen(true);
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      !filters.search ||
      delivery.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      delivery.startAddress
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      delivery.endAddress?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = !filters.status || delivery.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className='flex h-full flex-col gap-4 p-4'>
      <Card className='flex flex-1 flex-col overflow-hidden'>
        <CardHeader className='flex-shrink-0'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <IconTruck className='h-5 w-5' />
                Quản lý Giao hàng Inbound
              </CardTitle>
              <CardDescription>
                Quản lý các chuyến giao hàng từ nhà cung cấp về kho
              </CardDescription>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={loadDeliveries}
                disabled={isLoading}
              >
                <IconRefresh className='h-4 w-4' />
              </Button>
              <Button
                size='sm'
                onClick={() => {
                  setForm(defaultForm);
                  setIsCreateDialogOpen(true);
                }}
              >
                <IconPlus className='mr-2 h-4 w-4' />
                Tạo giao hàng
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className='flex flex-1 flex-col overflow-hidden'>
          {/* Filters */}
          <div className='mb-4 flex flex-shrink-0 gap-4'>
            <div className='relative flex-1'>
              <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder='Tìm kiếm theo địa chỉ...'
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className='pl-9'
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value === 'all' ? '' : value
                }))
              }
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả</SelectItem>
                <SelectItem value='scheduled'>Đã lên lịch</SelectItem>
                <SelectItem value='departed'>Đã khởi hành</SelectItem>
                <SelectItem value='in_transit'>Đang vận chuyển</SelectItem>
                <SelectItem value='arrived'>Đã đến</SelectItem>
                <SelectItem value='completed'>Hoàn thành</SelectItem>
                <SelectItem value='cancelled'>Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className='flex-1 overflow-auto rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Lịch thu hoạch</TableHead>
                  <TableHead>Xe tải</TableHead>
                  <TableHead>Điểm đi</TableHead>
                  <TableHead>Điểm đến</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian bắt đầu</TableHead>
                  <TableHead className='text-right'>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className='text-center'>
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filteredDeliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className='text-center'>
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className='font-mono text-xs'>
                        {delivery.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {delivery.harvestSchedule?.id
                          ? delivery.harvestSchedule.id.slice(0, 8) + '...'
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {delivery.truck?.licensePlate || '-'}
                      </TableCell>
                      <TableCell className='max-w-[200px] truncate'>
                        {delivery.startAddress || '-'}
                      </TableCell>
                      <TableCell className='max-w-[200px] truncate'>
                        {delivery.endAddress || '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={delivery.status} />
                      </TableCell>
                      <TableCell>
                        {delivery.startTime
                          ? new Date(delivery.startTime).toLocaleString('vi-VN')
                          : '-'}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => openEditDialog(delivery)}
                          >
                            <IconEdit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => openDeleteDialog(delivery)}
                          >
                            <IconTrash className='h-4 w-4' />
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
          <div className='mt-4 flex flex-shrink-0 items-center justify-between border-t pt-4'>
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
                    page: Math.max(1, prev.page - 1)
                  }))
                }
                disabled={pagination.page === 1 || isLoading}
              >
                Trước
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={!pagination.hasNextPage || isLoading}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Tạo giao hàng Inbound mới</DialogTitle>
            <DialogDescription>
              Tạo chuyến giao hàng từ nhà cung cấp về kho
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            {/* Harvest Schedule */}
            <div className='grid gap-2'>
              <Label>Lịch thu hoạch</Label>
              <Select
                value={form.harvestSchedule?.id || ''}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    harvestSchedule: value ? { id: value } : null
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn lịch thu hoạch' />
                </SelectTrigger>
                <SelectContent>
                  {harvestSchedules.map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {schedule.id.slice(0, 8)}... -{' '}
                      {schedule.description || 'No description'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Truck */}
            <div className='grid gap-2'>
              <Label>Xe tải</Label>
              <Select
                value={form.truck?.id || ''}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    truck: value ? { id: value } : null
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn xe tải' />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map((truck) => (
                    <SelectItem key={truck.id} value={truck.id}>
                      {truck.licensePlate || truck.id} - {truck.model || 'N/A'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Address */}
            <div className='grid gap-2'>
              <Label>Địa chỉ điểm đi</Label>
              <Input
                placeholder='Nhập địa chỉ điểm đi'
                value={form.startAddress || ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startAddress: e.target.value }))
                }
              />
            </div>

            {/* End Address */}
            <div className='grid gap-2'>
              <Label>Địa chỉ điểm đến</Label>
              <Input
                placeholder='Nhập địa chỉ điểm đến'
                value={form.endAddress || ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endAddress: e.target.value }))
                }
              />
            </div>

            {/* Coordinates */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label>Vĩ độ điểm đi</Label>
                <Input
                  type='number'
                  step='0.000001'
                  placeholder='10.762622'
                  value={form.startLat || ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      startLat: e.target.value ? Number(e.target.value) : null
                    }))
                  }
                />
              </div>
              <div className='grid gap-2'>
                <Label>Kinh độ điểm đi</Label>
                <Input
                  type='number'
                  step='0.000001'
                  placeholder='106.660172'
                  value={form.startLng || ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      startLng: e.target.value ? Number(e.target.value) : null
                    }))
                  }
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label>Vĩ độ điểm đến</Label>
                <Input
                  type='number'
                  step='0.000001'
                  placeholder='10.762622'
                  value={form.endLat || ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      endLat: e.target.value ? Number(e.target.value) : null
                    }))
                  }
                />
              </div>
              <div className='grid gap-2'>
                <Label>Kinh độ điểm đến</Label>
                <Input
                  type='number'
                  step='0.000001'
                  placeholder='106.660172'
                  value={form.endLng || ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      endLng: e.target.value ? Number(e.target.value) : null
                    }))
                  }
                />
              </div>
            </div>

            {/* Status */}
            <div className='grid gap-2'>
              <Label>Trạng thái</Label>
              <Select
                value={form.status ? ENUM_TO_UI[form.status] : 'scheduled'}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, status: UI_TO_ENUM[value] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='scheduled'>Đã lên lịch</SelectItem>
                  <SelectItem value='departed'>Đã khởi hành</SelectItem>
                  <SelectItem value='in_transit'>Đang vận chuyển</SelectItem>
                  <SelectItem value='arrived'>Đã đến</SelectItem>
                  <SelectItem value='completed'>Hoàn thành</SelectItem>
                  <SelectItem value='cancelled'>Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Time */}
            <div className='grid gap-2'>
              <Label>Thời gian bắt đầu</Label>
              <DateTimePicker
                value={form.startTime ? new Date(form.startTime) : undefined}
                onChange={(dateStr) =>
                  setForm((prev) => ({
                    ...prev,
                    startTime: dateStr || null
                  }))
                }
              />
            </div>

            {/* End Time */}
            <div className='grid gap-2'>
              <Label>Thời gian kết thúc (dự kiến)</Label>
              <DateTimePicker
                value={form.endTime ? new Date(form.endTime) : undefined}
                onChange={(dateStr) =>
                  setForm((prev) => ({
                    ...prev,
                    endTime: dateStr || null
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo...' : 'Tạo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Cập nhật giao hàng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chuyến giao hàng
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            {/* Same form fields as create */}
            <div className='grid gap-2'>
              <Label>Lịch thu hoạch</Label>
              <Select
                value={form.harvestSchedule?.id || ''}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    harvestSchedule: value ? { id: value } : null
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn lịch thu hoạch' />
                </SelectTrigger>
                <SelectContent>
                  {harvestSchedules.map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {schedule.id.slice(0, 8)}... -{' '}
                      {schedule.description || 'No description'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-2'>
              <Label>Xe tải</Label>
              <Select
                value={form.truck?.id || ''}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    truck: value ? { id: value } : null
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn xe tải' />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map((truck) => (
                    <SelectItem key={truck.id} value={truck.id}>
                      {truck.licensePlate || truck.id} - {truck.model || 'N/A'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-2'>
              <Label>Địa chỉ điểm đi</Label>
              <Input
                placeholder='Nhập địa chỉ điểm đi'
                value={form.startAddress || ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startAddress: e.target.value }))
                }
              />
            </div>

            <div className='grid gap-2'>
              <Label>Địa chỉ điểm đến</Label>
              <Input
                placeholder='Nhập địa chỉ điểm đến'
                value={form.endAddress || ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endAddress: e.target.value }))
                }
              />
            </div>

            <div className='grid gap-2'>
              <Label>Trạng thái</Label>
              <Select
                value={form.status ? ENUM_TO_UI[form.status] : 'scheduled'}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, status: UI_TO_ENUM[value] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='scheduled'>Đã lên lịch</SelectItem>
                  <SelectItem value='departed'>Đã khởi hành</SelectItem>
                  <SelectItem value='in_transit'>Đang vận chuyển</SelectItem>
                  <SelectItem value='arrived'>Đã đến</SelectItem>
                  <SelectItem value='completed'>Hoàn thành</SelectItem>
                  <SelectItem value='cancelled'>Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa giao hàng này? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
