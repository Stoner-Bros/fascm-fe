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
import { MoreHorizontal } from 'lucide-react';

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
import { parseAsInteger, useQueryState } from 'nuqs';

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
  const t = useTranslations('Accounts.Consignees');
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
  const [viewingConsignee, setViewingConsignee] = useState<Consignee | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [pageCount, setPageCount] = useState(1);

  // luôn sync ref với hook toast
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const resetForm = () => {
    setForm(DEFAULT_FORM);
  };

  const loadData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const res = await fetchConsignees({
        page: page ?? 1,
        limit: limit ?? 10
      });
      setConsignees(res.data);
      setPageCount((prev) => {
        const minimalTotal = res.hasNextPage ? (page ?? 1) + 1 : (page ?? 1);
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
  }, [searchQuery, organizationFilter]);

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
        title: t('form.fillRequired')
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
        toast({ title: t('toast.updateSuccess') });
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
        toast({ title: t('toast.createSuccess') });
      }

      resetForm();
      setEditingConsignee(null);
      setIsDialogOpen(false);
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: editingConsignee
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
      await deleteConsignee(id);
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
      statusName: consignee.user?.status?.name ?? 'Inactive',
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

  const handleViewDetails = (consignee: (typeof tableData)[number]) => {
    setViewingConsignee(consignee);
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
        accessorKey: 'organizationLabel',
        header: t('table.columns.organization'),
        cell: ({ row }) => (
          <div className='max-w-[200px] break-words whitespace-normal'>
            {row.original.organizationLabel}
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
        accessorKey: 'contact',
        header: t('table.columns.contact'),
        cell: ({ row }) => (
          <div className='max-w-[120px] break-words whitespace-normal'>
            {row.original.contact || '—'}
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
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>
                {t('table.columns.actions')}
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
                {t('actions.viewDetails')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                {t('actions.edit')}
              </DropdownMenuItem>
              {row.original.statusName !== 'Active' && (
                <DropdownMenuItem onClick={() => {}}>Accept</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-red-600'
                onClick={() => handleDelete(row.original.id)}
              >
                {t('actions.delete')}
              </DropdownMenuItem>
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
    data: filteredConsignees,
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
                {editingConsignee
                  ? t('actions.editConsignee')
                  : t('actions.createConsignee')}
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[95vh] overflow-y-auto sm:max-w-3xl'>
              <DialogHeader>
                <DialogTitle>
                  {editingConsignee
                    ? t('dialog.editTitle')
                    : t('dialog.createTitle')}
                </DialogTitle>
                <DialogDescription>
                  {editingConsignee
                    ? t('dialog.editDescription')
                    : t('dialog.createDescription')}
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label>{t('form.organizationName')}</Label>
                    <Input
                      value={form.organizationName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          organizationName: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.organizationName')}
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
                      placeholder={t('placeholders.emailConsignee')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>
                      {editingConsignee
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
              </div>

              <DialogFooter className='mt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => handleDialogChange(false)}
                  disabled={isSubmitting}
                >
                  {t('actions.cancel')}
                </Button>
                <Button
                  type='button'
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? editingConsignee
                      ? t('actions.saving')
                      : t('actions.creating')
                    : editingConsignee
                      ? t('actions.saveChanges')
                      : t('actions.create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <Card className='flex flex-1 flex-col'>
          <CardHeader className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-1'>
              <CardTitle>{t('table.title')}</CardTitle>
              <CardDescription>{t('table.description')}</CardDescription>
            </div>
            <Button variant='outline' onClick={loadData} disabled={isLoading}>
              {isLoading ? t('table.loading') : t('actions.refresh')}
            </Button>
          </CardHeader>

          <CardContent className='flex-1'>
            <div className='flex flex-col gap-2 md:flex-row md:items-center'>
              <Input
                placeholder={t('filters.searchPlaceholder')}
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
                  <SelectValue
                    placeholder={t('filters.organizationPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>
                    {t('filters.allOrganizations')}
                  </SelectItem>
                  {organizationOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='mt-4'>
              {isLoading ? (
                <DataTableSkeleton columnCount={6} rowCount={10} />
              ) : filteredConsignees.length === 0 ? (
                <div className='text-muted-foreground rounded-md border p-6 text-center text-sm'>
                  {t('table.empty')}
                </div>
              ) : (
                <DataTable table={table} pageSizeOptions={[]} />
              )}
            </div>
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
            {viewingConsignee && (
              <div className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.organizationName')}
                    </Label>
                    <p className='text-sm'>
                      {viewingConsignee.organizationName || '—'}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.representativeName')}
                    </Label>
                    <p className='text-sm'>
                      {viewingConsignee.representativeName || '—'}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>{t('form.contact')}</Label>
                    <p className='text-sm'>{viewingConsignee.contact || '—'}</p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>{t('form.taxCode')}</Label>
                    <p className='text-sm'>{viewingConsignee.taxCode || '—'}</p>
                  </div>
                  <div className='space-y-2 md:col-span-2'>
                    <Label className='font-semibold'>{t('form.address')}</Label>
                    <p className='text-sm'>{viewingConsignee.address || '—'}</p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.certificate')}
                    </Label>
                    <p className='text-sm'>
                      {viewingConsignee.certificate || '—'}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>{t('form.qrCode')}</Label>
                    <p className='text-sm'>{viewingConsignee.qrCode || '—'}</p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>{t('form.email')}</Label>
                    <p className='text-sm'>
                      {viewingConsignee.user?.email || '—'}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.firstName')}
                    </Label>
                    <p className='text-sm'>
                      {viewingConsignee.user?.firstName || '—'}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.lastName')}
                    </Label>
                    <p className='text-sm'>
                      {viewingConsignee.user?.lastName || '—'}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-semibold'>
                      {t('form.createdAt')}
                    </Label>
                    <p className='text-sm'>
                      {formatDateTime(viewingConsignee.createdAt)}
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
