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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
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
  createManager,
  deleteManager,
  fetchManagers,
  updateManager
} from '@/services/manager.service';
import { fetchWarehouses } from '@/services/warehouse.service';
import { approveRegister } from '@/services/auth.service';
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
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [pageCount, setPageCount] = useState(1);

  const loadData = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const [managerRes, warehouseRes] = await Promise.all([
        fetchManagers({ page: page ?? 1, limit: limit ?? 10 }),
        fetchWarehouses({ page: 1, limit: 100 })
      ]);
      setManagers(managerRes.data);
      setWarehouses(warehouseRes.data);
      setPageCount((prev) => {
        const minimalTotal = managerRes.hasNextPage
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

  const handleApprove = useCallback(
    async (manager: ManagerRow) => {
      if (!manager.user?.id) {
        toastRef.current?.({
          variant: 'destructive',
          title: t('toast.approveError'),
          description: 'User ID not found'
        });
        return;
      }

      if (!window.confirm(t('actions.confirmApprove'))) return;

      try {
        await approveRegister(manager.user.id);
        toastRef.current?.({ title: t('toast.approveSuccess') });
        await loadData();
      } catch (error) {
        toastRef.current?.({
          variant: 'destructive',
          title: t('toast.approveError'),
          description:
            error instanceof Error ? error.message : t('toast.tryAgain')
        });
      }
    },
    [loadData, t]
  );

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
      statusName: manager.user?.status?.name ?? 'Inactive',
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

  // DataTable columns
  const columns: ColumnDef<ManagerRow>[] = useMemo(
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
        accessorKey: 'warehouseName',
        header: t('table.columns.warehouse'),
        cell: ({ row }) => (
          <div className='max-w-[150px] break-words whitespace-normal'>
            {row.original.warehouseName}
          </div>
        )
      },
      {
        accessorKey: 'address',
        header: t('table.columns.address'),
        cell: ({ row }) => (
          <div className='max-w-[200px] break-words whitespace-normal'>
            {row.original.warehouse?.address || '—'}
          </div>
        )
      },
      {
        accessorKey: 'statusName',
        header: t('table.columns.status'),
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.user?.status?.name === 'Active'
                ? 'default'
                : 'secondary'
            }
            className={
              row.original.user?.status?.name === 'Active'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            }
          >
            {row.original.user?.status?.name || 'Inactive'}
          </Badge>
        )
      },
      {
        id: 'actions',
        header: t('table.columns.actions'),
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {row.original.user?.status?.name !== 'Active' && (
                <DropdownMenuItem onClick={() => handleApprove(row.original)}>
                  {t('actions.approve')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
    data: filteredManagers,
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
          {isLoading ? (
            <DataTableSkeleton columnCount={7} rowCount={10} />
          ) : filteredManagers.length === 0 ? (
            <div className='text-muted-foreground rounded-md border p-6 text-center text-sm'>
              {t('table.empty')}
            </div>
          ) : (
            <DataTable table={table} pageSizeOptions={[]} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
