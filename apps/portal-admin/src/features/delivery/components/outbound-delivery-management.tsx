'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import {
  createDelivery,
  deleteDelivery,
  fetchDeliveries,
  updateDelivery
} from '@/services/delivery.service';
import { fetchTrucks } from '@/services/truck.service';
import type {
  CreateDeliveryDto,
  Delivery,
  DeliveryStatusEnum
} from '@/types/delivery';
import type { Truck } from '@/types/truck';
import {
  IconEdit,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconTruckDelivery
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

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
  orderPhase: null,
  harvestPhase: null
};

const ENUM_TO_UI: Record<DeliveryStatusEnum, string> = {
  scheduled: 'scheduled',
  delivering: 'in_transit',
  delivered: 'completed',
  completed: 'completed',
  rejected: 'scheduled',
  returning: 'returned',
  canceled: 'cancelled'
};

const UI_TO_ENUM: Record<string, DeliveryStatusEnum> = {
  scheduled: 'scheduled',
  loading: 'delivering',
  departed: 'delivering',
  in_transit: 'delivering',
  delivering: 'delivering',
  completed: 'completed',
  returned: 'returning',
  cancelled: 'canceled'
};

function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <Badge variant='outline'>Unknown</Badge>;

  const variants: Record<string, { label: string; variant: any }> = {
    scheduled: { label: 'Đã lên lịch', variant: 'secondary' },
    loading: { label: 'Đang tải hàng', variant: 'default' },
    departed: { label: 'Đã khởi hành', variant: 'default' },
    in_transit: { label: 'Đang giao hàng', variant: 'default' },
    delivering: { label: 'Đang giao', variant: 'default' },
    completed: { label: 'Hoàn thành', variant: 'default' },
    returned: { label: 'Đã trả hàng', variant: 'destructive' },
    cancelled: { label: 'Đã hủy', variant: 'destructive' }
  };

  const config = variants[status] || { label: status, variant: 'outline' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function OutboundDeliveryManagement() {
  const { toast } = useToast();

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);

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
    status: '',
    orderPhaseId: ''
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
        limit: pagination.limit,
        orderPhaseId: filters.orderPhaseId || undefined
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

  useEffect(() => {
    loadDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, debouncedSearch, filters.orderPhaseId, filters.status]);

  useEffect(() => {
    loadTrucks();
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
      harvestPhase: null,
      orderPhase: delivery.orderPhase ? { id: delivery.orderPhase.id } : null
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
                <IconTruckDelivery className='h-5 w-5' />
                Quản lý Giao hàng Outbound
              </CardTitle>
              <CardDescription>
                Quản lý các chuyến giao hàng từ kho đến khách hàng
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
            <Input
              placeholder='Order Phase ID'
              value={filters.orderPhaseId}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  orderPhaseId: e.target.value
                }))
              }
              className='w-[250px]'
            />
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
                <SelectItem value='loading'>Đang tải hàng</SelectItem>
                <SelectItem value='departed'>Đã khởi hành</SelectItem>
                <SelectItem value='in_transit'>Đang giao hàng</SelectItem>
                <SelectItem value='delivering'>Đang giao</SelectItem>
                <SelectItem value='completed'>Hoàn thành</SelectItem>
                <SelectItem value='returned'>Đã trả hàng</SelectItem>
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
                  <TableHead>Đơn hàng</TableHead>
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
                        {delivery.orderPhase?.id
                          ? delivery.orderPhase.id.slice(0, 8) + '...'
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
            <DialogTitle>Tạo giao hàng Outbound mới</DialogTitle>
            <DialogDescription>
              Tạo chuyến giao hàng từ kho đến khách hàng
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            {/* Order Schedule ID */}
            <div className='grid gap-2'>
              <Label>Order Schedule ID</Label>
              <Input
                placeholder='Nhập Order Phase ID'
                value={form.orderPhase?.id || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    orderPhase: e.target.value ? { id: e.target.value } : null
                  }))
                }
              />
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
              <Label>Địa chỉ điểm đi (Kho)</Label>
              <Input
                placeholder='Nhập địa chỉ kho'
                value={form.startAddress || ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startAddress: e.target.value }))
                }
              />
            </div>

            {/* End Address */}
            <div className='grid gap-2'>
              <Label>Địa chỉ điểm đến (Khách hàng)</Label>
              <Input
                placeholder='Nhập địa chỉ khách hàng'
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
                  <SelectItem value='loading'>Đang tải hàng</SelectItem>
                  <SelectItem value='departed'>Đã khởi hành</SelectItem>
                  <SelectItem value='in_transit'>Đang giao hàng</SelectItem>
                  <SelectItem value='delivering'>Đang giao</SelectItem>
                  <SelectItem value='completed'>Hoàn thành</SelectItem>
                  <SelectItem value='returned'>Đã trả hàng</SelectItem>
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
            <div className='grid gap-2'>
              <Label>Order Schedule ID</Label>
              <Input
                placeholder='Nhập Order Phase ID'
                value={form.orderPhase?.id || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    orderPhase: e.target.value ? { id: e.target.value } : null
                  }))
                }
              />
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
                  <SelectItem value='loading'>Đang tải hàng</SelectItem>
                  <SelectItem value='departed'>Đã khởi hành</SelectItem>
                  <SelectItem value='in_transit'>Đang giao hàng</SelectItem>
                  <SelectItem value='delivering'>Đang giao</SelectItem>
                  <SelectItem value='completed'>Hoàn thành</SelectItem>
                  <SelectItem value='returned'>Đã trả hàng</SelectItem>
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
