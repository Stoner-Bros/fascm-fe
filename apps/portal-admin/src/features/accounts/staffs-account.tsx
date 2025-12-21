'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';
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
import { Badge } from '@/components/ui/badge';
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
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useTranslations } from 'next-intl';
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  useReactTable
} from '@tanstack/react-table';
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
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [pageCount, setPageCount] = useState(1);

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
        fetchStaffs({ page: page ?? 1, limit: limit ?? 10 }),
        fetchWarehouses({ page: 1, limit: 100 })
      ]);
      setStaffs(staffRes.data);
      setWarehouses(warehouseRes.data);
      setPageCount((prev) => {
        const minimalTotal = staffRes.hasNextPage
          ? (page ?? 1) + 1
          : (page ?? 1);
        return Math.max(prev, minimalTotal);
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

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
      statusName: staff.user?.status?.name ?? 'Inactive',
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

  // DataTable columns
  const columns: ColumnDef<(typeof tableData)[number]>[] = useMemo(
    () => [
      {
        accessorKey: 'index',
        header: t('table.columns.index'),
        cell: ({ row, table }) => {
          const pageIndex = table.getState().pagination.pageIndex;
          const pageSize = table.getState().pagination.pageSize;
          return (
            pageIndex * pageSize + table.getRowModel().rows.indexOf(row) + 1
          );
        }
      },
      {
        accessorKey: 'firstName',
        header: t('table.columns.firstName'),
        cell: ({ row }) => (
          <div className='max-w-[120px] break-words whitespace-normal'>
            {row.original.firstName}
          </div>
        )
      },
      {
        accessorKey: 'lastName',
        header: t('table.columns.lastName'),
        cell: ({ row }) => (
          <div className='max-w-[120px] break-words whitespace-normal'>
            {row.original.lastName}
          </div>
        )
      },
      {
        accessorKey: 'email',
        header: t('table.columns.email'),
        cell: ({ row }) => (
          <div className='max-w-[200px] break-words whitespace-normal'>
            {row.original.email}
          </div>
        )
      },
      {
        accessorKey: 'position',
        header: t('table.columns.position'),
        cell: ({ row }) => (
          <div className='max-w-[150px] break-words whitespace-normal'>
            {row.original.position}
          </div>
        )
      },
      {
        accessorKey: 'warehouseName',
        header: t('table.columns.warehouse'),
        cell: ({ row }) => (
          <div className='max-w-[150px] break-words whitespace-normal'>
            {row.original.warehouseName}
          </div>
        )
      },
      {
        accessorKey: 'createdAtDisplay',
        header: t('table.columns.createdAt'),
        cell: ({ row }) => (
          <div className='max-w-[150px] break-words whitespace-normal'>
            {row.original.createdAtDisplay}
          </div>
        )
      },
      {
        accessorKey: 'statusName',
        header: t('table.columns.status'),
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.statusName === 'Active' ? 'default' : 'secondary'
            }
            className={
              row.original.statusName === 'Active'
                ? 'bg-green-500 hover:bg-green-600'
                : ''
            }
          >
            {row.original.statusName}
          </Badge>
        )
      },
      {
        id: 'actions',
        header: t('table.columns.actions'),
        cell: ({ row }) => (
          <div className='flex justify-end gap-2'>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => handleEdit(row.original)}
            >
              {t('actions.edit')}
            </Button>
            <Button
              variant='destructive'
              size='sm'
              onClick={() => handleDelete(row.original.id)}
            >
              {t('actions.delete')}
            </Button>
          </div>
        )
      }
    ],
    [t]
  );

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: (page ?? 1) - 1,
      pageSize: limit ?? 10
    }),
    [page, limit]
  );

  const table = useReactTable({
    data: filteredStaffs,
    columns,
    pageCount,
    state: { pagination },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const next = updater(pagination);
        setPage(next.pageIndex + 1);
      } else {
        setPage(updater.pageIndex + 1);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true
  });

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
            {isLoading ? (
              <DataTableSkeleton columnCount={8} rowCount={10} />
            ) : filteredStaffs.length === 0 ? (
              <div className='text-muted-foreground rounded-md border p-6 text-center text-sm'>
                {t('table.empty')}
              </div>
            ) : (
              <DataTable table={table} pageSizeOptions={[]} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
