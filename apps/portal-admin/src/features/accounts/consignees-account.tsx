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
  createConsignee,
  deleteConsignee,
  fetchConsignees,
  updateConsignee
} from '@/services/consignee.service';
import type { Consignee } from '@/types/consignee';

type ConsigneeForm = {
  contact: string;
  taxCode: string;
  address: string;
  certificate: string;
  qrCode: string;
  organizationName: string;
  representativeName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const DEFAULT_FORM: ConsigneeForm = {
  contact: '',
  taxCode: '',
  address: '',
  certificate: '',
  qrCode: '',
  organizationName: '',
  representativeName: '',
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

export default function ConsigneesAccount() {
  const { toast } = useToast();
  const toastRef = useRef(toast);
  const isFetchingRef = useRef(false);

  const [form, setForm] = useState<ConsigneeForm>(DEFAULT_FORM);
  const [consignees, setConsignees] = useState<Consignee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState<'ALL' | string>(
    'ALL'
  );
  const [editingConsignee, setEditingConsignee] = useState<Consignee | null>(
    null
  );

  // luôn sync ref với hook toast
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const resetForm = () => {
    setForm(DEFAULT_FORM);
  };

  // LOAD DATA – không phụ thuộc toast để tránh re-fetch
  const loadData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const res = await fetchConsignees({ page: 1, limit: 50 });
      setConsignees(res.data);
    } catch (error) {
      toastRef.current?.({
        variant: 'destructive',
        title: 'Không thể tải danh sách consignees',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại'
      });
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []); // <── deps rỗng, không bị tạo lại

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
      setEditingConsignee(null);
    }
  };

  const handleSubmit = async () => {
    if (
      !form.organizationName ||
      !form.representativeName ||
      !form.contact ||
      !form.address ||
      !form.taxCode ||
      !form.email ||
      !form.firstName ||
      !form.lastName ||
      (!editingConsignee && !form.password)
    ) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingConsignee) {
        await updateConsignee(editingConsignee.id, {
          contact: form.contact,
          taxCode: form.taxCode,
          address: form.address,
          certificate: form.certificate || undefined,
          qrCode: form.qrCode || undefined,
          organizationName: form.organizationName,
          representativeName: form.representativeName,
          user: {
            email: form.email,
            password: form.password || '',
            firstName: form.firstName,
            lastName: form.lastName
          }
        });
        toast({ title: 'Đã cập nhật consignee' });
      } else {
        await createConsignee({
          contact: form.contact,
          taxCode: form.taxCode,
          address: form.address,
          certificate: form.certificate || undefined,
          qrCode: form.qrCode || undefined,
          organizationName: form.organizationName,
          representativeName: form.representativeName,
          user: {
            email: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName
          }
        });
        toast({ title: 'Đã tạo consignee thành công' });
      }

      resetForm();
      setEditingConsignee(null);
      setIsDialogOpen(false);
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: editingConsignee
          ? 'Không thể cập nhật consignee'
          : 'Không thể tạo consignee',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa consignee này?')) return;
    try {
      await deleteConsignee(id);
      toast({ title: 'Đã xóa consignee' });
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể xóa consignee',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại'
      });
    }
  };

  const handleEdit = (consignee: Consignee) => {
    setForm({
      contact: consignee.contact ?? '',
      taxCode: consignee.taxCode ?? '',
      address: consignee.address ?? '',
      certificate: consignee.certificate ?? '',
      qrCode: consignee.qrCode ?? '',
      organizationName: consignee.organizationName ?? '',
      representativeName: consignee.representativeName ?? '',
      firstName: consignee.user?.firstName ?? '',
      lastName: consignee.user?.lastName ?? '',
      email: consignee.user?.email ?? '',
      password: ''
    });
    setEditingConsignee(consignee);
    setIsDialogOpen(true);
  };

  const tableData = useMemo(() => {
    const sorted = [...consignees].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
      return bTime - aTime;
    });

    return sorted.map((consignee) => ({
      ...consignee,
      email: consignee.user?.email ?? '—',
      organizationLabel: consignee.organizationName ?? '—',
      createdAtDisplay: formatDateTime(consignee.createdAt)
    }));
  }, [consignees]);

  const filteredConsignees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tableData.filter((consignee) => {
      const matchesSearch =
        query.length === 0 ||
        consignee.organizationLabel.toLowerCase().includes(query) ||
        (consignee.representativeName ?? '').toLowerCase().includes(query) ||
        consignee.email.toLowerCase().includes(query) ||
        (consignee.contact ?? '').toLowerCase().includes(query) ||
        (consignee.taxCode ?? '').toLowerCase().includes(query);

      const matchesFilter =
        organizationFilter === 'ALL' ||
        consignee.organizationName === organizationFilter;

      return matchesSearch && matchesFilter;
    });
  }, [organizationFilter, searchQuery, tableData]);

  const organizationOptions = useMemo(() => {
    const unique = new Set(
      tableData
        .map((consignee) => consignee.organizationName)
        .filter(Boolean) as string[]
    );
    return Array.from(unique);
  }, [tableData]);

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <div className='flex flex-1 flex-col gap-6 overflow-y-auto pb-10'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-2'>
            <h1 className='text-3xl font-bold tracking-tight'>
              Quản lý tài khoản Consignees
            </h1>
            <p className='text-muted-foreground'>
              Danh sách hiển thị trước, thao tác tạo/chỉnh sửa nằm trong hộp
              thoại riêng.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button size='lg'>
                + {editingConsignee ? 'Chỉnh sửa' : 'Tạo'} consignee
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[95vh] overflow-y-auto sm:max-w-3xl'>
              <DialogHeader>
                <DialogTitle>
                  {editingConsignee
                    ? 'Cập nhật tài khoản consignee'
                    : 'Tạo tài khoản consignee'}
                </DialogTitle>
                <DialogDescription>
                  {editingConsignee
                    ? 'Điều chỉnh thông tin doanh nghiệp đã chọn.'
                    : 'Nhập thông tin doanh nghiệp và tài khoản đăng nhập.'}
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
                      placeholder='Công ty ABC'
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
                      placeholder='Nguyễn Văn A'
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
                      placeholder='Số 123, Quận 1, TP.HCM'
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
                      placeholder='ISO 22000...'
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
                      placeholder='consignee@example.com'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>
                      Mật khẩu{' '}
                      {editingConsignee ? '(để trống nếu giữ nguyên)' : '*'}
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
                      placeholder='Nguyễn'
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
                      placeholder='Văn A'
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className='mt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => handleDialogChange(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button
                  type='button'
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? editingConsignee
                      ? 'Đang lưu...'
                      : 'Đang tạo...'
                    : editingConsignee
                      ? 'Lưu thay đổi'
                      : 'Tạo mới'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <Card className='flex flex-1 flex-col'>
          <CardHeader className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-1'>
              <CardTitle>Danh sách consignee</CardTitle>
              <CardDescription>
                Xem và chỉnh sửa các tài khoản consignee.
              </CardDescription>
            </div>
            <Button variant='outline' onClick={loadData} disabled={isLoading}>
              {isLoading ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </CardHeader>

          <CardContent className='flex-1'>
            <div className='flex flex-col gap-2 md:flex-row md:items-center'>
              <Input
                placeholder='Tìm kiếm theo tổ chức, đại diện, email...'
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className='flex-1'
              />
              <Select
                value={organizationFilter}
                onValueChange={(value) =>
                  setOrganizationFilter(value as 'ALL' | string)
                }
              >
                <SelectTrigger className='md:w-[220px]'>
                  <SelectValue placeholder='Lọc tổ chức' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>Tất cả tổ chức</SelectItem>
                  {organizationOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='mt-4 rounded-md border'>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Tổ chức</TableHead>
                      <TableHead>Đại diện</TableHead>
                      <TableHead>Liên hệ</TableHead>
                      <TableHead>Email</TableHead>
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
                    ) : filteredConsignees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className='text-center'>
                          Không có consignee nào phù hợp
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredConsignees.map((consignee, index) => (
                        <TableRow key={consignee.id}>
                          <TableCell className='font-medium'>
                            {index + 1}
                          </TableCell>
                          <TableCell className='max-w-[200px] break-words whitespace-normal'>
                            {consignee.organizationLabel}
                          </TableCell>
                          <TableCell className='max-w-[150px] break-words whitespace-normal'>
                            {consignee.representativeName || '—'}
                          </TableCell>
                          <TableCell className='max-w-[120px] break-words whitespace-normal'>
                            {consignee.contact || '—'}
                          </TableCell>
                          <TableCell className='max-w-[200px] break-words whitespace-normal'>
                            {consignee.email}
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex justify-end gap-2'>
                              <Button
                                variant='secondary'
                                size='sm'
                                onClick={() => handleEdit(consignee)}
                              >
                                Sửa
                              </Button>
                              <Button
                                variant='destructive'
                                size='sm'
                                onClick={() => handleDelete(consignee.id)}
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
