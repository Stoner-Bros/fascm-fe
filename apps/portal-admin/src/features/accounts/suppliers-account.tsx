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
  createSupplier,
  deleteSupplier,
  fetchSuppliers,
  updateSupplier
} from '@/services/supplier.service';
import { fetchWarehouses } from '@/services/warehouse.service';
import type { Supplier } from '@/types/supplier';
import type { Warehouse } from '@/types/warehouse';

const NONE_VALUE = 'none';

const DEFAULT_FORM = {
  contact: '',
  taxCode: '',
  address: '',
  certificate: '',
  qrCode: '',
  gardenName: '',
  organizationName: '',
  representativeName: '',
  warehouseId: '',
  firstName: '',
  lastName: '',
  email: '',
  password: ''
};

const formatDateTime = (value?: string | Date) => {
  if (!value) return '—';
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  } catch {
    return String(value);
  }
};

export default function SuppliersAccount() {
  const { toast } = useToast();
  const toastRef = useRef(toast);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<'ALL' | string>('ALL');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const isFetchingRef = useRef(false);

  // sync toast vào ref
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const loadData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const [supplierRes, warehouseRes] = await Promise.all([
        fetchSuppliers({ page: 1, limit: 50 }),
        fetchWarehouses({ page: 1, limit: 100 })
      ]);
      setSuppliers(supplierRes.data);
      setWarehouses(warehouseRes.data);
    } catch (error) {
      toastRef.current?.({
        variant: 'destructive',
        title: 'Không thể tải danh sách suppliers',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại'
      });
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []); // deps rỗng để không tạo lại

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
      setEditingSupplier(null);
    }
  };

  const handleSubmit = async () => {
    const isEditing = Boolean(editingSupplier);
    if (
      !form.organizationName ||
      !form.representativeName ||
      !form.contact ||
      !form.address ||
      !form.gardenName ||
      !form.taxCode ||
      !form.email ||
      !form.firstName ||
      !form.lastName ||
      (!isEditing && !form.password)
    ) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const basePayload = {
        contact: form.contact,
        taxCode: form.taxCode,
        address: form.address,
        certificate: form.certificate || undefined,
        qrCode: form.qrCode || undefined,
        gardenName: form.gardenName,
        organizationName: form.organizationName,
        representativeName: form.representativeName,
        warehouse: form.warehouseId ? { id: form.warehouseId } : null
      };
      const userFields = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName
      };

      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, {
          ...basePayload,
          user: {
            ...userFields,
            password: form.password || ''
          }
        });
        toast({ title: 'Đã cập nhật supplier' });
      } else {
        await createSupplier({
          ...basePayload,
          user: {
            ...userFields,
            password: form.password
          }
        });
        toast({ title: 'Đã tạo supplier thành công' });
      }

      resetForm();
      setEditingSupplier(null);
      setIsDialogOpen(false);
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: editingSupplier
          ? 'Không thể cập nhật supplier'
          : 'Không thể tạo supplier',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa supplier này?')) return;
    try {
      await deleteSupplier(id);
      toast({ title: 'Đã xóa supplier' });
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể xóa supplier',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại'
      });
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setForm({
      contact: supplier.contact ?? '',
      taxCode: supplier.taxCode ?? '',
      address: supplier.address ?? '',
      certificate: supplier.certificate ?? '',
      qrCode: supplier.qrCode ?? '',
      gardenName: supplier.gardenName ?? '',
      organizationName: supplier.organizationName ?? '',
      representativeName: supplier.representativeName ?? '',
      warehouseId: supplier.warehouse?.id ?? '',
      firstName: supplier.user?.firstName ?? '',
      lastName: supplier.user?.lastName ?? '',
      email: supplier.user?.email ?? '',
      password: ''
    });
    setEditingSupplier(supplier);
    setIsDialogOpen(true);
  };

  const tableData = useMemo(() => {
    const sorted = [...suppliers].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
      return bTime - aTime;
    });
    return sorted.map((supplier) => ({
      ...supplier,
      warehouseName: supplier.warehouse?.name ?? 'Không gán',
      gardenNameDisplay: supplier.gardenName ?? '—',
      email: supplier.user?.email ?? '—',
      createdAtDisplay: formatDateTime(supplier.createdAt)
    }));
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tableData.filter((supplier) => {
      const matchesSearch =
        query.length === 0 ||
        (supplier.organizationName ?? '').toLowerCase().includes(query) ||
        (supplier.gardenName ?? '').toLowerCase().includes(query) ||
        (supplier.representativeName ?? '').toLowerCase().includes(query) ||
        supplier.email.toLowerCase().includes(query) ||
        (supplier.contact ?? '').toLowerCase().includes(query) ||
        (supplier.taxCode ?? '').toLowerCase().includes(query);
      const matchesWarehouse =
        warehouseFilter === 'ALL' || supplier.warehouse?.id === warehouseFilter;
      return matchesSearch && matchesWarehouse;
    });
  }, [tableData, searchQuery, warehouseFilter]);

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <div className='flex flex-1 flex-col gap-6 overflow-y-auto pb-10'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-2'>
            <h1 className='text-3xl font-bold tracking-tight'>
              Quản lý tài khoản Suppliers
            </h1>
            <p className='text-muted-foreground'>
              Danh sách hiển thị trước, hộp thoại đảm nhiệm tạo và chỉnh sửa.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button size='lg'>
                + {editingSupplier ? 'Chỉnh sửa' : 'Tạo'} supplier
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[95vh] overflow-y-auto sm:max-w-3xl'>
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier
                    ? 'Cập nhật tài khoản supplier'
                    : 'Tạo tài khoản supplier'}
                </DialogTitle>
                <DialogDescription>
                  {editingSupplier
                    ? 'Điều chỉnh thông tin doanh nghiệp, warehouse và tài khoản đăng nhập.'
                    : 'Nhập thông tin doanh nghiệp, warehouse (nếu có) và tài khoản đăng nhập.'}
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label>Tên tổ chức *</Label>
                    <Input
                      value={form.organizationName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          organizationName: e.target.value
                        }))
                      }
                      placeholder='Trang trại ABC'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Tên vườn *</Label>
                    <Input
                      value={form.gardenName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          gardenName: e.target.value
                        }))
                      }
                      placeholder='Vườn Cam X'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Người đại diện *</Label>
                    <Input
                      value={form.representativeName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          representativeName: e.target.value
                        }))
                      }
                      placeholder='Nguyễn Văn B'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Số liên hệ *</Label>
                    <Input
                      value={form.contact}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          contact: e.target.value
                        }))
                      }
                      placeholder='0123456789'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Mã số thuế *</Label>
                    <Input
                      value={form.taxCode}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          taxCode: e.target.value
                        }))
                      }
                      placeholder='0123456789'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Địa chỉ *</Label>
                    <Input
                      value={form.address}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          address: e.target.value
                        }))
                      }
                      placeholder='Số 456, Huyện C, Tỉnh D'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Giấy chứng nhận</Label>
                    <Input
                      value={form.certificate}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          certificate: e.target.value
                        }))
                      }
                      placeholder='VietGAP...'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>QR Code</Label>
                    <Input
                      value={form.qrCode}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, qrCode: e.target.value }))
                      }
                      placeholder='URL hoặc mã'
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
                      placeholder='supplier@example.com'
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
                      placeholder='Trần'
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
                      placeholder='Văn C'
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
                    ? editingSupplier
                      ? 'Đang cập nhật...'
                      : 'Đang xử lý...'
                    : editingSupplier
                      ? 'Cập nhật supplier'
                      : 'Tạo supplier'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <Card className='flex flex-col'>
          <CardHeader className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
              <div>
                <CardTitle>Danh sách suppliers</CardTitle>
                <CardDescription>
                  Theo dõi và chỉnh sửa tài khoản supplier.
                </CardDescription>
              </div>
              <Button variant='outline' onClick={loadData} disabled={isLoading}>
                {isLoading ? 'Đang tải...' : 'Làm mới'}
              </Button>
            </div>
            <div className='flex flex-col gap-2 md:flex-row md:items-center'>
              <Input
                placeholder='Tìm theo tổ chức, đại diện, email...'
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
                      <TableHead>Tên vườn</TableHead>
                      <TableHead>Đại diện</TableHead>
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
                    ) : filteredSuppliers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className='text-center'>
                          Không có supplier nào phù hợp
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSuppliers.map((supplier, index) => (
                        <TableRow key={supplier.id}>
                          <TableCell className='font-medium'>
                            {index + 1}
                          </TableCell>
                          <TableCell className='max-w-[200px] break-words whitespace-normal'>
                            {supplier.gardenNameDisplay}
                          </TableCell>
                          <TableCell className='max-w-[150px] break-words whitespace-normal'>
                            {supplier.representativeName || '—'}
                          </TableCell>
                          <TableCell className='max-w-[200px] break-words whitespace-normal'>
                            {supplier.email}
                          </TableCell>
                          <TableCell className='max-w-[150px] break-words whitespace-normal'>
                            {supplier.warehouseName}
                          </TableCell>
                          <TableCell className='max-w-[200px] break-words whitespace-normal'>
                            {supplier.warehouse?.address}
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex justify-end gap-2'>
                              <Button
                                variant='secondary'
                                size='sm'
                                onClick={() => handleEdit(supplier)}
                              >
                                Sửa
                              </Button>
                              <Button
                                variant='destructive'
                                size='sm'
                                onClick={() => handleDelete(supplier.id)}
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
