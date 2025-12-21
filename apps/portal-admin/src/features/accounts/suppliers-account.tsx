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
  createSupplier,
  deleteSupplier,
  fetchSuppliers,
  updateSupplier
} from '@/services/supplier.service';
import { fetchWarehouses } from '@/services/warehouse.service';
import { approveRegister } from '@/services/auth.service';
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
  const t = useTranslations('Accounts.Suppliers');
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
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'Active' | 'Inactive'
  >('ALL');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const isFetchingRef = useRef(false);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [pageCount, setPageCount] = useState(1);

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
        fetchSuppliers({ page: page ?? 1, limit: limit ?? 10 }),
        fetchWarehouses({ page: 1, limit: 100 })
      ]);
      setSuppliers(supplierRes.data);
      setWarehouses(warehouseRes.data);
      setPageCount((prev) => {
        const minimalTotal = supplierRes.hasNextPage
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

  // Reset page when search or filter changes
  useEffect(() => {
    if (page !== 1) {
      void setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, warehouseFilter]);

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
        title: t('form.fillRequired')
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
        toast({ title: t('toast.updateSuccess') });
      } else {
        await createSupplier({
          ...basePayload,
          user: {
            ...userFields,
            password: form.password
          }
        });
        toast({ title: t('toast.createSuccess') });
      }

      resetForm();
      setEditingSupplier(null);
      setIsDialogOpen(false);
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: editingSupplier
          ? t('toast.updateError')
          : t('toast.createError'),
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
      await deleteSupplier(id);
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

  const handleApprove = async (supplier: Supplier) => {
    if (!supplier.user?.id) {
      toast({
        variant: 'destructive',
        title: t('toast.approveError'),
        description: 'User ID not found'
      });
      return;
    }

    if (!window.confirm(t('actions.confirmApprove'))) return;

    try {
      await approveRegister(supplier.user.id);
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

  const handleEdit = (supplier: Supplier) => {
    setForm({
      contact: supplier.contact ?? '',
      taxCode: supplier.taxCode ?? '',
      address: supplier.address ?? '',
      certificate: supplier.certificate ?? '',
      qrCode: supplier.qrCode ?? '',
      gardenName: supplier.gardenName ?? '',
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
      warehouseName: supplier.warehouse?.name ?? t('labels.unassigned'),
      gardenNameDisplay: supplier.gardenName ?? '—',
      email: supplier.user?.email ?? '—',
      statusName: supplier.user?.status?.name ?? 'Inactive',
      createdAtDisplay: formatDateTime(supplier.createdAt)
    }));
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tableData.filter((supplier) => {
      const matchesSearch =
        query.length === 0 ||
        (supplier.gardenName ?? '').toLowerCase().includes(query) ||
        (supplier.representativeName ?? '').toLowerCase().includes(query) ||
        supplier.email.toLowerCase().includes(query) ||
        (supplier.contact ?? '').toLowerCase().includes(query) ||
        (supplier.taxCode ?? '').toLowerCase().includes(query);
      const matchesWarehouse =
        warehouseFilter === 'ALL' || supplier.warehouse?.id === warehouseFilter;
      const matchesStatus =
        statusFilter === 'ALL' || supplier.statusName === statusFilter;
      return matchesSearch && matchesWarehouse && matchesStatus;
    });
  }, [tableData, searchQuery, warehouseFilter, statusFilter]);

  const handleViewDetails = (supplier: (typeof tableData)[number]) => {
    setViewingSupplier(supplier);
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
        accessorKey: 'gardenNameDisplay',
        header: t('table.columns.garden'),
        cell: ({ row }) => (
          <div className='max-w-[200px] break-words whitespace-normal'>
            {row.original.gardenNameDisplay}
          </div>
        )
      },
      {
        accessorKey: 'representativeName',
        header: t('table.columns.representative'),
        cell: ({ row }) => (
          <div className='max-w-[150px] break-words whitespace-normal'>
            {row.original.representativeName || '—'}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
                {t('actions.viewDetails')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                {t('actions.edit')}
              </DropdownMenuItem>
              {row.original.statusName !== 'Active' && (
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
    data: filteredSuppliers,
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
                {editingSupplier
                  ? t('actions.editSupplier')
                  : t('actions.createSupplier')}
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[95vh] overflow-y-auto sm:max-w-3xl'>
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier
                    ? t('dialog.editTitle')
                    : t('dialog.createTitle')}
                </DialogTitle>
                <DialogDescription>
                  {editingSupplier
                    ? t('dialog.editDescription')
                    : t('dialog.createDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label>{t('form.gardenName')}</Label>
                    <Input
                      value={form.gardenName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          gardenName: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.gardenName')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.representativeName')}</Label>
                    <Input
                      value={form.representativeName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          representativeName: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.representativeName')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.contact')}</Label>
                    <Input
                      value={form.contact}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          contact: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.contact')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.taxCode')}</Label>
                    <Input
                      value={form.taxCode}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          taxCode: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.taxCode')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.address')}</Label>
                    <Input
                      value={form.address}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          address: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.address')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.certificate')}</Label>
                    <Input
                      value={form.certificate}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          certificate: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.certificate')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.qrCode')}</Label>
                    <Input
                      value={form.qrCode}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, qrCode: e.target.value }))
                      }
                      placeholder={t('placeholders.qrCode')}
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
                      placeholder={t('placeholders.emailSupplier')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>
                      {editingSupplier
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
                      <SelectValue placeholder={t('placeholders.warehouse')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>
                        {t('form.unassignedWarehouse')}
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
                  {t('actions.clear')}
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting
                    ? editingSupplier
                      ? t('actions.saving')
                      : t('actions.creating')
                    : editingSupplier
                      ? t('actions.saveChanges')
                      : t('actions.create')}
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
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as 'ALL' | 'Active' | 'Inactive')
                }
              >
                <SelectTrigger className='md:w-[180px]'>
                  <SelectValue placeholder={t('filters.statusPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>
                    {t('filters.allStatuses')}
                  </SelectItem>
                  <SelectItem value='Active'>{t('filters.active')}</SelectItem>
                  <SelectItem value='Inactive'>
                    {t('filters.inactive')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className='flex-1'>
            {isLoading ? (
              <DataTableSkeleton columnCount={5} rowCount={10} />
            ) : filteredSuppliers.length === 0 ? (
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
            {viewingSupplier && (
              <div className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.gardenName')}
                    </Label>
                    <p className='text-sm'>
                      {viewingSupplier.gardenName || '—'}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.representativeName')}
                    </Label>
                    <p className='text-sm'>
                      {viewingSupplier.representativeName || '—'}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>{t('form.contact')}</Label>
                    <p className='text-sm'>{viewingSupplier.contact || '—'}</p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>{t('form.taxCode')}</Label>
                    <p className='text-sm'>{viewingSupplier.taxCode || '—'}</p>
                  </div>
                  <div className='space-y-2 md:col-span-2'>
                    <Label className='font-semibold'>{t('form.address')}</Label>
                    <p className='text-sm'>{viewingSupplier.address || '—'}</p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.certificate')}
                    </Label>
                    <p className='text-sm'>
                      {viewingSupplier.certificate || '—'}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>{t('form.qrCode')}</Label>
                    <p className='text-sm'>{viewingSupplier.qrCode || '—'}</p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.warehouseOptional')}
                    </Label>
                    <p className='text-sm'>
                      {viewingSupplier.warehouse?.name || t('form.notAssigned')}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>{t('form.email')}</Label>
                    <p className='text-sm'>
                      {viewingSupplier.user?.email || '—'}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.firstName')}
                    </Label>
                    <p className='text-sm'>
                      {viewingSupplier.user?.firstName || '—'}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.lastName')}
                    </Label>
                    <p className='text-sm'>
                      {viewingSupplier.user?.lastName || '—'}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.createdAt')}
                    </Label>
                    <p className='text-sm'>
                      {formatDateTime(viewingSupplier.createdAt)}
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
