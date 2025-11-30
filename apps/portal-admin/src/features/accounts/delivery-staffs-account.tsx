'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
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
import {
  createDeliveryStaff,
  deleteDeliveryStaff,
  fetchDeliveryStaffs,
  updateDeliveryStaff
} from '@/services/delivery-staff.service';
import { fetchWarehouses } from '@/services/warehouse.service';
import { fetchTrucks } from '@/services/truck.service';
import type { DeliveryStaff, Warehouse } from '@/types';
import type { Truck } from '@/types/truck';

const NONE_VALUE = 'none';

const DEFAULT_FORM = {
  warehouseId: '',
  truckId: '',
  licenseNumber: '',
  licensePhoto: '',
  licenseExpiredAt: '',
  firstName: '',
  lastName: '',
  email: '',
  password: ''
};

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const toInputDateTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

export default function DeliveryStaffsAccount() {
  const { toast } = useToast();
  const toastRef = useRef(toast);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deliveryStaffs, setDeliveryStaffs] = useState<DeliveryStaff[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<'ALL' | string>('ALL');
  const [editingStaff, setEditingStaff] = useState<DeliveryStaff | null>(null);
  const isFetchingRef = useRef(false);

  // đồng bộ ref với hook toast
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const loadData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const [staffRes, warehouseRes, truckRes] = await Promise.all([
        fetchDeliveryStaffs({ page: 1, limit: 50 }),
        fetchWarehouses({ page: 1, limit: 100 }),
        fetchTrucks({ page: 1, limit: 100 })
      ]);
      setDeliveryStaffs(staffRes.data);
      setWarehouses(warehouseRes.data);
      setTrucks(truckRes.data);
    } catch (error) {
      toastRef.current?.({
        variant: 'destructive',
        title: 'Không thể tải danh sách delivery staff',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại'
      });
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []); // deps rỗng để không bị tạo lại

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const resetForm = () => {
    setForm(DEFAULT_FORM);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
      setEditingStaff(null);
    }
  };

  const handleSubmit = async () => {
    if (
      !form.licenseNumber ||
      !form.licenseExpiredAt ||
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      (!editingStaff && !form.password)
    ) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        warehouse: form.warehouseId ? { id: form.warehouseId } : null,
        truck: form.truckId ? { id: form.truckId } : null,
        licenseNumber: form.licenseNumber,
        licensePhoto: form.licensePhoto || undefined,
        licenseExpiredAt: new Date(form.licenseExpiredAt).toISOString(),
        user: {
          email: form.email,
          password: form.password || '',
          firstName: form.firstName,
          lastName: form.lastName
        }
      };

      if (editingStaff) {
        await updateDeliveryStaff(editingStaff.id, payload);
        toast({ title: 'Đã cập nhật delivery staff' });
      } else {
        await createDeliveryStaff(payload);
        toast({ title: 'Đã tạo delivery staff thành công' });
      }

      resetForm();
      setEditingStaff(null);
      setIsDialogOpen(false);
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: editingStaff
          ? 'Không thể cập nhật delivery staff'
          : 'Không thể tạo delivery staff',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa delivery staff này?'))
      return;
    try {
      await deleteDeliveryStaff(id);
      toast({ title: 'Đã xóa delivery staff' });
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể xóa delivery staff',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại'
      });
    }
  };

  const handleEdit = (staff: DeliveryStaff) => {
    setForm({
      warehouseId: staff.warehouse?.id ?? '',
      truckId: staff.truck?.id ?? '',
      licenseNumber: staff.licenseNumber ?? '',
      licensePhoto: staff.licensePhoto ?? '',
      licenseExpiredAt: toInputDateTime(staff.licenseExpiredAt),
      firstName: staff.user?.firstName ?? '',
      lastName: staff.user?.lastName ?? '',
      email: staff.user?.email ?? '',
      password: ''
    });
    setEditingStaff(staff);
    setIsDialogOpen(true);
  };

  const tableData = useMemo(() => {
    const sorted = [...deliveryStaffs].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
    return sorted.map((staff) => {
      const first = staff.user?.firstName?.trim() ?? '';
      const last = staff.user?.lastName?.trim() ?? '';
      return {
        ...staff,
        firstName: first || '—',
        lastName: last || '—',
        email: staff.user?.email ?? '—',
        warehouseName: staff.warehouse?.name ?? 'Không gán',
        truckLabel: staff.truck?.licenseNumber ?? 'Không gán',
        createdAtDisplay: formatDateTime(staff.createdAt),
        licenseExpiredDisplay: formatDateTime(staff.licenseExpiredAt)
      };
    });
  }, [deliveryStaffs]);

  const filteredStaffs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tableData.filter((staff) => {
      const matchesSearch =
        query.length === 0 ||
        staff.firstName.toLowerCase().includes(query) ||
        staff.lastName.toLowerCase().includes(query) ||
        staff.email.toLowerCase().includes(query) ||
        staff.truckLabel.toLowerCase().includes(query) ||
        staff.licenseNumber.toLowerCase().includes(query);
      const matchesWarehouse =
        warehouseFilter === 'ALL' || staff.warehouse?.id === warehouseFilter;
      return matchesSearch && matchesWarehouse;
    });
  }, [tableData, searchQuery, warehouseFilter]);

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <div className='flex flex-1 flex-col gap-6 overflow-y-auto pb-10'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-2'>
            <h1 className='text-3xl font-bold tracking-tight'>
              Quản lý tài khoản Delivery Staffs
            </h1>
            <p className='text-muted-foreground'>
              Danh sách tài xế luôn hiện trước, tạo hoặc chỉnh sửa nằm trong hộp
              thoại riêng.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button size='lg'>
                + {editingStaff ? 'Chỉnh sửa' : 'Tạo'} delivery staff
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[95vh] overflow-y-auto sm:max-w-3xl'>
              <DialogHeader>
                <DialogTitle>
                  {editingStaff
                    ? 'Cập nhật tài khoản delivery staff'
                    : 'Tạo tài khoản delivery staff'}
                </DialogTitle>
                <DialogDescription>
                  {editingStaff
                    ? 'Chỉnh sửa thông tin giấy phép và tài khoản.'
                    : 'Nhập thông tin giấy phép và tài khoản người dùng.'}
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label>Warehouse (tùy chọn)</Label>
                    <Select
                      value={form.warehouseId || NONE_VALUE}
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          warehouseId: value === NONE_VALUE ? '' : value
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn warehouse' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_VALUE}>
                          Không gán warehouse
                        </SelectItem>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label>Truck (tùy chọn)</Label>
                    <Select
                      value={form.truckId || NONE_VALUE}
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          truckId: value === NONE_VALUE ? '' : value
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn truck' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_VALUE}>
                          Không gán truck
                        </SelectItem>
                        {trucks.map((truck) => (
                          <SelectItem key={truck.id} value={truck.id}>
                            {truck.licensePlate || truck.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label>Số giấy phép *</Label>
                    <Input
                      value={form.licenseNumber}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          licenseNumber: e.target.value
                        }))
                      }
                      placeholder='123456789'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Ảnh giấy phép</Label>
                    <Input
                      value={form.licensePhoto}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          licensePhoto: e.target.value
                        }))
                      }
                      placeholder='URL ảnh'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Ngày hết hạn giấy phép *</Label>
                    <Input
                      type='datetime-local'
                      value={form.licenseExpiredAt}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          licenseExpiredAt: e.target.value
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Họ *</Label>
                    <Input
                      value={form.firstName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          firstName: e.target.value
                        }))
                      }
                      placeholder='Đỗ'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Tên *</Label>
                    <Input
                      value={form.lastName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          lastName: e.target.value
                        }))
                      }
                      placeholder='Văn E'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Email *</Label>
                    <Input
                      type='email'
                      value={form.email}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder='driver@example.com'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>
                      Mật khẩu{' '}
                      {editingStaff ? '(để trống nếu giữ nguyên)' : '*'}{' '}
                    </Label>
                    <Input
                      type='password'
                      value={form.password}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          password: e.target.value
                        }))
                      }
                      placeholder='••••••••'
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Xóa dữ liệu
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting
                    ? editingStaff
                      ? 'Đang cập nhật...'
                      : 'Đang xử lý...'
                    : editingStaff
                      ? 'Cập nhật delivery staff'
                      : 'Tạo delivery staff'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <Card className='flex flex-col'>
          <CardHeader className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
              <div>
                <CardTitle>Danh sách delivery staff</CardTitle>
                <CardDescription>
                  Theo dõi và chỉnh sửa tài khoản tài xế.
                </CardDescription>
              </div>
              <Button variant='outline' onClick={loadData} disabled={isLoading}>
                {isLoading ? 'Đang tải...' : 'Làm mới'}
              </Button>
            </div>
            <div className='flex flex-col gap-2 md:flex-row md:items-center'>
              <Input
                placeholder='Tìm theo tên, email, biển số, giấy phép...'
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className='flex-1'
              />
              <Select
                value={warehouseFilter}
                onValueChange={(value) => setWarehouseFilter(value)}
              >
                <SelectTrigger className='md:w-[220px]'>
                  <SelectValue placeholder='Lọc theo warehouse' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>Tất cả warehouse</SelectItem>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className='flex-1'>
            <div className='rounded-md border'>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Họ</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Truck</TableHead>
                      <TableHead>Hết hạn GPLX</TableHead>
                      <TableHead className='text-right'>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className='text-center'>
                          Đang tải dữ liệu...
                        </TableCell>
                      </TableRow>
                    ) : filteredStaffs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className='text-center'>
                          Không có delivery staff nào phù hợp
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStaffs.map((staff, index) => (
                        <TableRow key={staff.id}>
                          <TableCell className='font-medium'>
                            {index + 1}
                          </TableCell>
                          <TableCell className='max-w-[120px] break-words whitespace-normal'>
                            {staff.firstName}
                          </TableCell>
                          <TableCell className='max-w-[120px] break-words whitespace-normal'>
                            {staff.lastName}
                          </TableCell>
                          <TableCell className='max-w-[200px] break-words whitespace-normal'>
                            {staff.email}
                          </TableCell>
                          <TableCell className='max-w-[150px] break-words whitespace-normal'>
                            {staff.warehouseName}
                          </TableCell>
                          <TableCell className='max-w-[120px] break-words whitespace-normal'>
                            {staff.truckLabel}
                          </TableCell>
                          <TableCell className='max-w-[150px] break-words whitespace-normal'>
                            {staff.licenseExpiredDisplay}
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex justify-end gap-2'>
                              <Button
                                variant='secondary'
                                size='sm'
                                onClick={() => handleEdit(staff)}
                              >
                                Sửa
                              </Button>
                              <Button
                                variant='destructive'
                                size='sm'
                                onClick={() => handleDelete(staff.id)}
                              >
                                Xóa
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
