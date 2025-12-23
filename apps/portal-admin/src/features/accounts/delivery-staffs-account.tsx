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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  createDeliveryStaff,
  deleteDeliveryStaff,
  fetchDeliveryStaffs,
  updateDeliveryStaff
} from '@/services/delivery-staff.service';
import { fetchWarehouses } from '@/services/warehouse.service';
import { fetchTrucks } from '@/services/truck.service';
import { approveRegister } from '@/services/auth.service';
import type { DeliveryStaff, Warehouse } from '@/types';
import type { Truck } from '@/types/truck';

const DEFAULT_FORM = {
  warehouseId: '',
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
  const t = useTranslations('Accounts.DeliveryStaffs');
  const { toast } = useToast();
  const toastRef = useRef(toast);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deliveryStaffs, setDeliveryStaffs] = useState<DeliveryStaff[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<'ALL' | string>('ALL');
  const [editingStaff, setEditingStaff] = useState<DeliveryStaff | null>(null);
  const [viewingStaff, setViewingStaff] = useState<DeliveryStaff | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const isFetchingRef = useRef(false);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [pageCount, setPageCount] = useState(1);

  // đồng bộ ref với hook toast
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const loadData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const [staffRes, warehouseRes] = await Promise.all([
        fetchDeliveryStaffs({ page: page ?? 1, limit: limit ?? 10 }),
        fetchWarehouses({ page: 1, limit: 100 })
      ]);
      setDeliveryStaffs(staffRes.data);
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
      !form.warehouseId ||
      !form.licenseNumber ||
      !form.licenseExpiredAt ||
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      (!editingStaff && !form.password)
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
        warehouse: { id: form.warehouseId },
        licenseNumber: form.licenseNumber,
        licensePhoto: form.licensePhoto || undefined,
        licenseExpiredAt: new Date(form.licenseExpiredAt).toISOString(),
        user: {
          id: editingStaff?.user?.id ?? 0,
          email: form.email,
          password: form.password || '',
          firstName: form.firstName,
          lastName: form.lastName
        }
      };

      if (editingStaff) {
        await updateDeliveryStaff(editingStaff.id, payload);
        toast({ title: t('toast.updateSuccess') });
      } else {
        await createDeliveryStaff(payload);
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
      await deleteDeliveryStaff(id);
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

  const handleApprove = async (staff: DeliveryStaff) => {
    if (!staff.user?.id) {
      toast({
        variant: 'destructive',
        title: t('toast.approveError'),
        description: 'User ID not found'
      });
      return;
    }

    if (!window.confirm(t('actions.confirmApprove'))) return;

    try {
      await approveRegister(staff.user.id);
      toast({ title: t('toast.approveSuccess') });
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('toast.approveError'),
        description:
          error instanceof Error ? error.message : t('toast.tryAgain')
      });
    }
  };

  const handleEdit = (staff: DeliveryStaff) => {
    setForm({
      warehouseId: staff.warehouse?.id ?? '',
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
        warehouseName: staff.warehouse?.name ?? '—',
        statusName: staff.user?.status?.name ?? 'Inactive',
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
        staff.licenseNumber.toLowerCase().includes(query);
      const matchesWarehouse =
        warehouseFilter === 'ALL' || staff.warehouse?.id === warehouseFilter;
      return matchesSearch && matchesWarehouse;
    });
  }, [tableData, searchQuery, warehouseFilter]);

  const handleViewDetails = (staff: DeliveryStaff) => {
    setViewingStaff(staff);
    setIsViewDialogOpen(true);
  };

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
        accessorKey: 'warehouseName',
        header: t('table.columns.warehouse'),
        cell: ({ row }) => (
          <div className='max-w-[150px] break-words whitespace-normal'>
            {row.original.warehouseName}
          </div>
        )
      },
      {
        accessorKey: 'licenseExpiredDisplay',
        header: t('table.columns.licenseExpired'),
        cell: ({ row }) => (
          <div className='max-w-[150px] break-words whitespace-normal'>
            {row.original.licenseExpiredDisplay}
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
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>Open menu</span>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => handleViewDetails(item)}>
                  {t('actions.viewDetails')}
                </DropdownMenuItem>
                {item.statusName !== 'Active' && (
                  <DropdownMenuItem onClick={() => handleApprove(item)}>
                    {t('actions.approve')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
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
                  ? t('actions.editDeliveryStaff')
                  : t('actions.createDeliveryStaff')}
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[95vh] overflow-y-auto sm:max-w-3xl'>
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
                    <Label>{t('form.warehouse')}</Label>
                    <Select
                      value={form.warehouseId}
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          warehouseId: value
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('placeholders.selectWarehouse')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.licenseNumber')}</Label>
                    <Input
                      value={form.licenseNumber}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          licenseNumber: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.licenseNumber')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.licensePhoto')}</Label>
                    <Input
                      value={form.licensePhoto}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          licensePhoto: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.licensePhoto')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.licenseExpiredAt')}</Label>
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
                      placeholder={t('placeholders.emailDriver')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>
                      {editingStaff
                        ? t('form.passwordOptional')
                        : t('form.password')}
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
                      : t('actions.createDeliveryStaff')}
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

        {/* View Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>{t('dialog.viewTitle')}</DialogTitle>
              <DialogDescription>
                {t('dialog.viewDescription')}
              </DialogDescription>
            </DialogHeader>
            {viewingStaff && (
              <div className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.firstName')}
                    </Label>
                    <p className='text-sm'>
                      {viewingStaff.user?.firstName || '—'}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.lastName')}
                    </Label>
                    <p className='text-sm'>
                      {viewingStaff.user?.lastName || '—'}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>{t('form.email')}</Label>
                    <p className='text-sm'>{viewingStaff.user?.email || '—'}</p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.licenseNumber')}
                    </Label>
                    <p className='text-sm'>
                      {viewingStaff.licenseNumber || '—'}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.warehouseOptional')}
                    </Label>
                    <p className='text-sm'>
                      {viewingStaff.warehouse?.name || t('form.notAssigned')}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.licenseExpiredAt')}
                    </Label>
                    <p className='text-sm'>
                      {formatDateTime(viewingStaff.licenseExpiredAt)}
                    </p>
                  </div>
                  <div className='space-y-2 md:col-span-2'>
                    <Label className='font-semibold'>
                      {t('form.licensePhoto')}
                    </Label>
                    {viewingStaff.licensePhoto ? (
                      <div className='relative aspect-video w-full max-w-md overflow-hidden rounded-lg border'>
                        <img
                          src={viewingStaff.licensePhoto}
                          alt='License Photo'
                          className='h-full w-full object-cover'
                        />
                      </div>
                    ) : (
                      <p className='text-sm'>—</p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.createdAt')}
                    </Label>
                    <p className='text-sm'>
                      {formatDateTime(viewingStaff.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsViewDialogOpen(false)}
              >
                {t('actions.close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
