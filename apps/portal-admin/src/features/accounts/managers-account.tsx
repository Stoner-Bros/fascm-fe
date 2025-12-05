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
  createManager,
  deleteManager,
  fetchManagers,
  updateManager
} from '@/services/manager.service';
import { fetchWarehouses } from '@/services/warehouse.service';
import type { Manager, Warehouse } from '@/types';

type ManagerRow = Manager & {
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  warehouseName: string;
  createdAtDisplay: string;
};

const NONE_VALUE = 'none';

const DEFAULT_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  warehouseId: ''
};

const getManagerFullName = (manager: Manager) => {
  const first = manager.user?.firstName?.trim() ?? '';
  const last = manager.user?.lastName?.trim() ?? '';
  const name = `${first} ${last}`.trim();
  if (name.length === 0) {
    return manager.user?.email || manager.id;
  }
  return name;
};

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  try {
    const formatter = new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
    return formatter.format(new Date(value));
  } catch {
    return value;
  }
};

export default function ManagersAccount() {
  const { toast } = useToast();
  const toastRef = useRef(toast);
  const isFetchingRef = useRef(false);
  useEffect(() => {
    toastRef.current = toast;
  }, []);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<'ALL' | string>('ALL');
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const [managerRes, warehouseRes] = await Promise.all([
        fetchManagers({ page: 1, limit: 50 }),
        fetchWarehouses({ page: 1, limit: 100 })
      ]);
      setManagers(managerRes.data);
      setWarehouses(warehouseRes.data);
    } catch (error) {
      toastRef.current?.({
        variant: 'destructive',
        title: 'Không thể tải dữ liệu manager',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại'
      });
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

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
      setEditingManager(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng điền đầy đủ thông tin'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingManager) {
        await updateManager(editingManager.id, {
          warehouse: form.warehouseId ? { id: form.warehouseId } : null,
          user: {
            email: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName
          }
        });
        toast({
          title: 'Đã cập nhật manager'
        });
      } else {
        await createManager({
          warehouse: form.warehouseId ? { id: form.warehouseId } : null,
          user: {
            email: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName
          }
        });
        toast({
          title: 'Đã tạo manager thành công'
        });
      }
      resetForm();
      setEditingManager(null);
      setIsDialogOpen(false);
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tạo manager',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      const confirm = window.confirm('Bạn có chắc chắn muốn xóa manager này?');
      if (!confirm) return;
      try {
        await deleteManager(id);
        toastRef.current?.({ title: 'Đã xóa manager' });
        await loadData();
      } catch (error) {
        toastRef.current?.({
          variant: 'destructive',
          title: 'Không thể xóa manager',
          description:
            error instanceof Error ? error.message : 'Vui lòng thử lại'
        });
      }
    },
    [loadData]
  );

  const handleEdit = useCallback((manager: ManagerRow) => {
    setForm({
      firstName: manager.user?.firstName ?? '',
      lastName: manager.user?.lastName ?? '',
      email: manager.user?.email ?? '',
      password: '',
      warehouseId: manager.warehouse?.id ?? ''
    });
    setEditingManager(manager);
    setIsDialogOpen(true);
  }, []);

  // @ts-ignore
  const tableData = useMemo<ManagerRow[]>(() => {
    const sortedManagers = [...managers].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
    return sortedManagers.map((manager) => ({
      ...manager,
      userId: manager.user?.id ?? '—',
      firstName: manager.user?.firstName ?? '—',
      lastName: manager.user?.lastName ?? '—',
      fullName: getManagerFullName(manager),
      email: manager.user?.email || '—',
      warehouseName: manager.warehouse?.name || 'Không gán',
      createdAtDisplay: formatDateTime(manager.createdAt)
    }));
  }, [managers]);

  const filteredManagers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tableData.filter((manager) => {
      const matchesSearch =
        query.length === 0 ||
        manager.fullName.toLowerCase().includes(query) ||
        manager.email.toLowerCase().includes(query) ||
        manager.userId.toLowerCase().includes(query);
      const matchesWarehouse =
        warehouseFilter === 'ALL' ||
        manager.warehouse?.id === warehouseFilter ||
        manager.warehouseName === warehouseFilter;
      return matchesSearch && matchesWarehouse;
    });
  }, [tableData, searchQuery, warehouseFilter]);

  return (
    <section className='flex w-full flex-col gap-6 pb-6'>
      <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Quản lý tài khoản Managers
          </h1>
          <p className='text-muted-foreground'>
            Danh sách hiển thị trước, thao tác tạo manager bật qua hộp thoại
            riêng.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button size='lg'>+ Tạo manager</Button>
          </DialogTrigger>
          <DialogContent className='max-h-[95vh] overflow-y-auto sm:max-w-2xl'>
            <DialogHeader>
              <DialogTitle>
                {editingManager
                  ? 'Cập nhật tài khoản manager'
                  : 'Tạo tài khoản manager'}
              </DialogTitle>
              <DialogDescription>
                {editingManager
                  ? 'Điều chỉnh thông tin manager đã chọn.'
                  : 'Nhập thông tin người dùng và gán warehouse tùy chọn.'}
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label>Họ</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        firstName: e.target.value
                      }))
                    }
                    placeholder='Nguyễn'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Tên</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                    placeholder='Văn A'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Email</Label>
                  <Input
                    type='email'
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder='manager@example.com'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Mật khẩu</Label>
                  <Input
                    type='password'
                    value={form.password}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder='••••••••'
                  />
                </div>
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
                <p className='text-muted-foreground text-xs'>
                  Nếu không chọn, giá trị sẽ được truyền là null.
                </p>
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
                  ? editingManager
                    ? 'Đang cập nhật...'
                    : 'Đang xử lý...'
                  : editingManager
                    ? 'Cập nhật manager'
                    : 'Tạo manager'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card className='flex flex-1 flex-col'>
        <CardHeader className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
            <div>
              <CardTitle>Danh sách manager</CardTitle>
              <CardDescription>
                Quản lý và theo dõi thông tin tài khoản manager.
              </CardDescription>
            </div>
            <Button variant='outline' onClick={loadData} disabled={isLoading}>
              {isLoading ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </div>
          <div className='flex flex-col gap-2 md:flex-row md:items-center'>
            <Input
              placeholder='Tìm kiếm theo tên, email, mã tài khoản...'
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className='flex-1'
            />
            <Select
              value={warehouseFilter}
              onValueChange={(value) => setWarehouseFilter(value)}
            >
              <SelectTrigger className='md:w-[220px]'>
                <SelectValue placeholder='Lọc theo kho' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Tất cả kho</SelectItem>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Họ</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead className='text-right'>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className='text-center'>
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : filteredManagers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='text-center'>
                      Không có manager phù hợp với tiêu chí lọc
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredManagers.map((manager, index) => (
                    <TableRow key={manager.id}>
                      <TableCell className='font-medium'>{index + 1}</TableCell>
                      <TableCell className='max-w-[120px] break-words whitespace-normal'>
                        {manager.firstName}
                      </TableCell>
                      <TableCell className='max-w-[120px] break-words whitespace-normal'>
                        {manager.lastName}
                      </TableCell>
                      <TableCell className='max-w-[200px] break-words whitespace-normal'>
                        {manager.email}
                      </TableCell>
                      <TableCell className='max-w-[150px] break-words whitespace-normal'>
                        {manager.warehouseName}
                      </TableCell>
                      <TableCell className='max-w-[200px] break-words whitespace-normal'>
                        {manager.warehouse?.address}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='secondary'
                            size='sm'
                            onClick={() => handleEdit(manager)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => handleDelete(manager.id)}
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
        </CardContent>
      </Card>
    </section>
  );
}
