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
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Accounts.Staffs');
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
        title: t('toast.loadError'),
        description:
          error instanceof Error ? error.message : t('toast.tryAgain')
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
        title: t('form.fillRequired')
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
        toast({ title: t('toast.updateSuccess') });
      } else {
        await createStaff(payload);
        toast({ title: t('toast.createSuccess') });
      }

      resetForm();
      setEditingStaff(null);
      setIsDialogOpen(false);
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: editingStaff ? t('toast.updateError') : t('toast.createError'),
        description:
          error instanceof Error ? error.message : t('toast.tryAgain')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('actions.confirmDelete'))) return;
    try {
      await deleteStaff(id);
      toast({ title: t('toast.deleteSuccess') });
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('toast.deleteError'),
        description:
          error instanceof Error ? error.message : t('toast.tryAgain')
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
              {t('header.title')}
            </h1>
            <p className='text-muted-foreground'>{t('header.description')}</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button size='lg'>
                {editingStaff
                  ? t('actions.editStaff')
                  : t('actions.createStaff')}
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[95vh] overflow-y-auto sm:max-w-2xl'>
              <DialogHeader>
                <DialogTitle>
                  {editingStaff
                    ? t('dialog.editTitle')
                    : t('dialog.createTitle')}
                </DialogTitle>
                <DialogDescription>
                  {editingStaff
                    ? t('dialog.editDescription')
                    : t('dialog.createDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label>{t('form.position')}</Label>
                    <Input
                      value={form.position}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          position: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.position')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.warehouseOptional')}</Label>
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
                        <SelectValue
                          placeholder={t('placeholders.selectWarehouse')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_VALUE}>
                          {t('placeholders.noWarehouse')}
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
                    <Label>{t('form.firstName')}</Label>
                    <Input
                      value={form.firstName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          firstName: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.firstName')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.lastName')}</Label>
                    <Input
                      value={form.lastName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          lastName: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.lastName')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.email')}</Label>
                    <Input
                      type='email'
                      value={form.email}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder={t('placeholders.emailStaff')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.password')}</Label>
                    <Input
                      type='password'
                      value={form.password}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          password: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.password')}
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
                  {t('actions.clearForm')}
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting
                    ? editingStaff
                      ? t('actions.saving')
                      : t('actions.creating')
                    : editingStaff
                      ? t('actions.saveChanges')
                      : t('actions.createStaff')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <Card className='flex flex-col'>
          <CardHeader className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
              <div>
                <CardTitle>{t('table.title')}</CardTitle>
                <CardDescription>{t('table.description')}</CardDescription>
              </div>
              <Button variant='outline' onClick={loadData} disabled={isLoading}>
                {isLoading ? t('table.loading') : t('actions.refresh')}
              </Button>
            </div>
            <div className='flex flex-col gap-2 md:flex-row md:items-center'>
              <Input
                placeholder={t('filters.searchPlaceholder')}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className='flex-1'
              />
              <Select
                value={warehouseFilter}
                onValueChange={(value) => setWarehouseFilter(value)}
              >
                <SelectTrigger className='md:w-[220px]'>
                  <SelectValue
                    placeholder={t('filters.warehousePlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>
                    {t('filters.allWarehouses')}
                  </SelectItem>
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
                      <TableHead>{t('table.columns.index')}</TableHead>
                      <TableHead>{t('table.columns.firstName')}</TableHead>
                      <TableHead>{t('table.columns.lastName')}</TableHead>
                      <TableHead>{t('table.columns.email')}</TableHead>
                      <TableHead>{t('table.columns.position')}</TableHead>
                      <TableHead>{t('table.columns.warehouse')}</TableHead>
                      <TableHead>{t('table.columns.createdAt')}</TableHead>
                      <TableHead className='text-right'>
                        {t('table.columns.actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className='text-center'>
                          {t('table.loading')}
                        </TableCell>
                      </TableRow>
                    ) : filteredStaffs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className='text-center'>
                          {t('table.empty')}
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
                                {t('actions.edit')}
                              </Button>
                              <Button
                                variant='destructive'
                                size='sm'
                                onClick={() => handleDelete(staff.id)}
                              >
                                {t('actions.delete')}
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
