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
  createStaff,
  deleteStaff,
  fetchStaffs,
  updateStaff
} from '@/services/staff.service';
import { fetchWarehouses } from '@/services/warehouse.service';
import type { Staff, Warehouse } from '@/types';

const NONE_VALUE = 'none';

const DEFAULT_FORM = {
  position: '',
  warehouseId: '',
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

export default function StaffsAccount() {
  const { toast } = useToast();
  const toastRef = useRef(toast);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<'ALL' | string>('ALL');
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const isFetchingRef = useRef(false);

  // sync toast vào ref để loadData không cần deps
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const loadData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const [staffRes, warehouseRes] = await Promise.all([
        fetchStaffs({ page: 1, limit: 50 }),
        fetchWarehouses({ page: 1, limit: 100 })
      ]);
      setStaffs(staffRes.data);
      setWarehouses(warehouseRes.data);
    } catch (error) {
      toastRef.current?.({
        variant: 'destructive',
        title: 'Không thể tải danh sách staff',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại'
      });
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []); // deps rỗng

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
      !form.position ||
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.password
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
        position: form.position,
        warehouse: form.warehouseId ? { id: form.warehouseId } : null,
        user: {
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName
        }
      };

      if (editingStaff) {
        await updateStaff(editingStaff.id, payload);
        toast({ title: 'Đã cập nhật staff' });
      } else {
        await createStaff(payload);
        toast({ title: 'Đã tạo staff thành công' });
      }

      resetForm();
      setEditingStaff(null);
      setIsDialogOpen(false);
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: editingStaff
          ? 'Không thể cập nhật staff'
          : 'Không thể tạo staff',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa staff này?')) return;
    try {
      await deleteStaff(id);
      toast({ title: 'Đã xóa staff' });
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể xóa staff',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại'
      });
    }
  };

  const handleEdit = (staff: Staff) => {
    setForm({
      position: staff.position ?? '',
      warehouseId: staff.warehouse?.id ?? '',
      firstName: staff.user?.firstName ?? '',
      lastName: staff.user?.lastName ?? '',
      email: staff.user?.email ?? '',
      password: ''
    });
    setEditingStaff(staff);
    setIsDialogOpen(true);
  };

  const tableData = useMemo(() => {
    const sorted = [...staffs].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
    return sorted.map((staff) => ({
      ...staff,
      firstName: staff.user?.firstName ?? '—',
      lastName: staff.user?.lastName ?? '—',
      email: staff.user?.email ?? '—',
      warehouseName: staff.warehouse?.name ?? 'Không gán',
      createdAtDisplay: formatDateTime(staff.createdAt)
    }));
  }, [staffs]);

  const filteredStaffs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tableData.filter((staff) => {
      const matchesSearch =
        query.length === 0 ||
        staff.firstName.toLowerCase().includes(query) ||
        staff.lastName.toLowerCase().includes(query) ||
        staff.email.toLowerCase().includes(query) ||
        (staff.position ?? '').toLowerCase().includes(query);
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
              Quản lý tài khoản Staffs
            </h1>
            <p className='text-muted-foreground'>
              Danh sách nhân sự hiển thị phía trước, tạo/chỉnh sửa thông qua hộp
              thoại.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button size='lg'>
                + {editingStaff ? 'Chỉnh sửa' : 'Tạo'} staff
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[95vh] overflow-y-auto sm:max-w-2xl'>
              <DialogHeader>
                <DialogTitle>
                  {editingStaff
                    ? 'Cập nhật tài khoản staff'
                    : 'Tạo tài khoản staff'}
                </DialogTitle>
                <DialogDescription>
                  {editingStaff
                    ? 'Điều chỉnh thông tin vị trí và tài khoản.'
                    : 'Nhập thông tin vị trí và tài khoản người dùng.'}
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label>Vị trí *</Label>
                    <Input
                      value={form.position}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          position: e.target.value
                        }))
                      }
                      placeholder='Warehouse Staff'
                    />
                  </div>
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
                    <Label>Họ *</Label>
                    <Input
                      value={form.firstName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          firstName: e.target.value
                        }))
                      }
                      placeholder='Phạm'
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
                      placeholder='Thị D'
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
                      placeholder='staff@example.com'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Mật khẩu *</Label>
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
                      ? 'Cập nhật staff'
                      : 'Tạo staff'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <Card className='flex flex-col'>
          <CardHeader className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
              <div>
                <CardTitle>Danh sách staff</CardTitle>
                <CardDescription>
                  Theo dõi và chỉnh sửa tài khoản staff.
                </CardDescription>
              </div>
              <Button variant='outline' onClick={loadData} disabled={isLoading}>
                {isLoading ? 'Đang tải...' : 'Làm mới'}
              </Button>
            </div>
            <div className='flex flex-col gap-2 md:flex-row md:items-center'>
              <Input
                placeholder='Tìm theo tên, email, vị trí...'
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
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Ngày tạo</TableHead>
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
                          Không có staff nào phù hợp
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
                            {staff.position}
                          </TableCell>
                          <TableCell className='max-w-[150px] break-words whitespace-normal'>
                            {staff.warehouseName}
                          </TableCell>
                          <TableCell className='max-w-[150px] break-words whitespace-normal'>
                            {staff.createdAtDisplay}
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
