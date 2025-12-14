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
  const t = useTranslations('Accounts.Managers');
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
        title: t('toast.loadError'),
        description:
          error instanceof Error ? error.message : t('toast.tryAgain')
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
        title: t('form.fillRequired')
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
          title: t('toast.updateSuccess')
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
          title: t('toast.createSuccess')
        });
      }
      resetForm();
      setEditingManager(null);
      setIsDialogOpen(false);
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: editingManager ? t('toast.updateError') : t('toast.createError'),
        description:
          error instanceof Error ? error.message : t('toast.tryAgain')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      const confirm = window.confirm(t('actions.confirmDelete'));
      if (!confirm) return;
      try {
        await deleteManager(id);
        toastRef.current?.({ title: t('toast.deleteSuccess') });
        await loadData();
      } catch (error) {
        toastRef.current?.({
          variant: 'destructive',
          title: t('toast.deleteError'),
          description:
            error instanceof Error ? error.message : t('toast.tryAgain')
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
            {t('header.title')}
          </h1>
          <p className='text-muted-foreground'>{t('header.description')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button size='lg'>{t('actions.createManager')}</Button>
          </DialogTrigger>
          <DialogContent className='max-h-[95vh] overflow-y-auto sm:max-w-2xl'>
            <DialogHeader>
              <DialogTitle>
                {editingManager
                  ? t('dialog.editTitle')
                  : t('dialog.createTitle')}
              </DialogTitle>
              <DialogDescription>
                {editingManager
                  ? t('dialog.editDescription')
                  : t('dialog.createDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
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
                      setForm((prev) => ({ ...prev, lastName: e.target.value }))
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
                    placeholder={t('placeholders.emailManager')}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>{t('form.password')}</Label>
                  <Input
                    type='password'
                    value={form.password}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder={t('placeholders.password')}
                  />
                </div>
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
                <p className='text-muted-foreground text-xs'>
                  {t('form.warehouseHelper')}
                </p>
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
                  ? editingManager
                    ? t('actions.saving')
                    : t('actions.creating')
                  : editingManager
                    ? t('actions.saveChanges')
                    : t('actions.createManager')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card className='flex flex-1 flex-col'>
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
                <SelectValue placeholder={t('filters.warehousePlaceholder')} />
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
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.columns.index')}</TableHead>
                  <TableHead>{t('table.columns.firstName')}</TableHead>
                  <TableHead>{t('table.columns.lastName')}</TableHead>
                  <TableHead>{t('table.columns.email')}</TableHead>
                  <TableHead>{t('table.columns.warehouse')}</TableHead>
                  <TableHead>{t('table.columns.address')}</TableHead>
                  <TableHead className='text-right'>
                    {t('table.columns.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className='text-center'>
                      {t('table.loading')}
                    </TableCell>
                  </TableRow>
                ) : filteredManagers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='text-center'>
                      {t('table.empty')}
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
                            {t('actions.edit')}
                          </Button>
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => handleDelete(manager.id)}
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
        </CardContent>
      </Card>
    </section>
  );
}
