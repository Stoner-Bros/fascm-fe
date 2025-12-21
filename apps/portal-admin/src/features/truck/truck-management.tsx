'use client';

import { FileUploader } from '@/components/file-uploader';
import { Modal } from '@/components/modal';
import { PermissionGuard } from '@/components/permissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Permission } from '@/constants/permissions';
import { uploadFile } from '@/services/file.service';
import { connectIoTSocket } from '@/services/iotdevice.service';
import {
  createTruck,
  deleteTruck,
  fetchTruckAlerts,
  fetchTrucks
} from '@/services/truck.service';
import type { Truck, TruckAlert, TruckStatusEnum } from '@/types/truck';
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconCpu,
  IconLoader2,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTools,
  IconTrash,
  IconTruck
} from '@tabler/icons-react';
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  useReactTable
} from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function getStatusBadge(status: TruckStatusEnum | null | undefined, t: any) {
  switch (status) {
    case 'available':
      return (
        <Badge className='bg-emerald-100 text-emerald-800 hover:bg-emerald-100'>
          {t('status.available')}
        </Badge>
      );
    case 'in_use':
      return (
        <Badge className='bg-sky-100 text-sky-800 hover:bg-sky-100'>
          {t('status.inUse')}
        </Badge>
      );
    case 'maintenance':
      return (
        <Badge className='bg-amber-100 text-amber-800 hover:bg-amber-100'>
          {t('status.maintenance')}
        </Badge>
      );
    case 'unavailable':
      return (
        <Badge className='bg-slate-100 text-slate-800 hover:bg-slate-100'>
          {t('status.unavailable')}
        </Badge>
      );
    default:
      return (
        <Badge className='bg-slate-100 text-slate-600 hover:bg-slate-100'>
          N/A
        </Badge>
      );
  }
}

type TruckFormData = {
  licensePlate: string;
  model: string;
  capacity: string;
  currentLocation: string;
  licensePhoto: string;
};

const initialFormData: TruckFormData = {
  licensePlate: '',
  model: '',
  capacity: '',
  currentLocation: '',
  licensePhoto: ''
};

export function TruckManagement() {
  const t = useTranslations('Truck');
  const { toast } = useToast();
  const router = useRouter();
  // Data state
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [pageCount, setPageCount] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'available' | 'in_use' | 'maintenance' | 'unavailable'
  >('ALL');

  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected truck
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);

  // Form state
  const [formData, setFormData] = useState<TruckFormData>(initialFormData);
  const [licensePhotoFiles, setLicensePhotoFiles] = useState<File[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isMounted = useRef(false);
  const [alertsByTruck, setAlertsByTruck] = useState<
    Record<string, TruckAlert | null>
  >({});

  const loadTrucks = useCallback(async () => {
    const currentPage = page ?? 1;
    const currentLimit = limit ?? 10;
    setLoading(true);
    try {
      const response = await fetchTrucks({
        page: currentPage,
        limit: currentLimit
      });
      setTrucks(response.data ?? []);
      setPageCount((prev) => {
        const minimalTotal = response.hasNextPage
          ? currentPage + 1
          : currentPage;
        return Math.max(prev, minimalTotal);
      });
    } catch {
      toast({
        variant: 'destructive',
        title: t('toast.loadError'),
        description: t('toast.tryAgain')
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const loadTruckAlerts = useCallback(async () => {
    try {
      const res = await fetchTruckAlerts({ page: 1, limit: 100 });
      const map: Record<string, TruckAlert | null> = {};
      (res.data || [])
        .filter((a) => String(a.status).toLowerCase() !== 'resolved')
        .forEach((a) => {
          const tid = String(a.truck?.id ?? '');
          if (!tid) return;
          const prev = map[tid];
          if (!prev) map[tid] = a;
          else {
            const p = new Date(
              prev.createdAt || prev.updatedAt || ''
            ).getTime();
            const c = new Date(a.createdAt || a.updatedAt || '').getTime();
            if (c >= p) map[tid] = a;
          }
        });
      setAlertsByTruck(map);
    } catch {}
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      loadTruckAlerts();
      const socket = connectIoTSocket();
      const events = [
        'truck-alert',
        'truck:alert',
        'truck-alert-update',
        'alert:update',
        'alert'
      ];
      const onAlert = (payload: any) => {
        const tid = String(payload?.truckId ?? payload?.truck?.id ?? '');
        if (!tid) return;
        const alert: TruckAlert = {
          id: String(payload?.id ?? Date.now()),
          status: payload?.status ?? 'active',
          message: payload?.message ?? '',
          alertType: payload?.alertType ?? payload?.type ?? 'Alert',
          truck: { id: tid },
          createdAt: String(payload?.createdAt ?? new Date().toISOString()),
          updatedAt: String(payload?.updatedAt ?? new Date().toISOString())
        };
        setAlertsByTruck((prev) => ({
          ...prev,
          [tid]:
            String(alert.status).toLowerCase() === 'resolved' ? null : alert
        }));
      };
      events.forEach((evt) => socket.on(evt, onAlert));
      return () => {
        events.forEach((evt) => socket.off(evt, onAlert));
        socket.disconnect();
      };
    }
  }, [loadTruckAlerts]);

  useEffect(() => {
    if (isMounted.current) {
      loadTrucks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // Filter trucks by search term and status
  const filteredTrucks = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return trucks.filter((truck) => {
      const matchesSearch =
        !term ||
        truck.licensePlate?.toLowerCase().includes(term) ||
        truck.model?.toLowerCase().includes(term) ||
        truck.currentLocation?.toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === 'ALL' || truck.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [trucks, searchTerm, statusFilter]);

  // DataTable columns
  const columns: ColumnDef<Truck>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <span
            className='cursor-pointer hover:underline'
            onClick={() => router.push(`/dashboard/truck/${row.original.id}`)}
          >
            {row.original.id || '-'}
          </span>
        )
      },
      {
        accessorKey: 'licensePlate',
        header: t('fields.licensePlate'),
        cell: ({ row }) => (
          <span
            className='cursor-pointer font-medium hover:underline'
            onClick={() => router.push(`/dashboard/truck/${row.original.id}`)}
          >
            {row.original.licensePlate || '-'}
          </span>
        )
      },
      {
        accessorKey: 'model',
        header: t('fields.model'),
        cell: ({ row }) => (
          <span
            className='cursor-pointer hover:underline'
            onClick={() => router.push(`/dashboard/truck/${row.original.id}`)}
          >
            {row.original.model || '-'}
          </span>
        )
      },
      {
        accessorKey: 'capacity',
        header: t('fields.capacity'),
        cell: ({ row }) => {
          const capacity = row.original.capacity;
          return (
            <span
              className='cursor-pointer hover:underline'
              onClick={() => router.push(`/dashboard/truck/${row.original.id}`)}
            >
              {capacity ? `${capacity} ${t('units.kg')}` : '-'}
            </span>
          );
        }
      },
      {
        accessorKey: 'currentLocation',
        header: t('fields.currentLocation'),
        cell: ({ row }) => (
          <span
            className='cursor-pointer hover:underline'
            onClick={() => router.push(`/dashboard/truck/${row.original.id}`)}
          >
            {row.original.currentLocation || '-'}
          </span>
        )
      },
      {
        accessorKey: 'status',
        header: t('fields.status'),
        cell: ({ row }) => (
          <div
            className='cursor-pointer'
            onClick={() => router.push(`/dashboard/truck/${row.original.id}`)}
          >
            {getStatusBadge(row.original.status, t)}
          </div>
        )
      },
      {
        accessorKey: 'iotDevice',
        header: t('fields.iotDevices'),
        cell: ({ row }) => {
          const devices = row.original.iotDevice;
          return devices && devices.length > 0 ? (
            <Badge
              variant='outline'
              className='hover:bg-accent cursor-pointer'
              onClick={() => router.push(`/dashboard/truck/${row.original.id}`)}
            >
              <IconCpu className='mr-1 h-3 w-3' />
              {devices.length}{' '}
              {devices.length === 1 ? t('units.device') : t('units.devices')}
            </Badge>
          ) : (
            <span
              className='text-muted-foreground cursor-pointer hover:underline'
              onClick={() => router.push(`/dashboard/truck/${row.original.id}`)}
            >
              -
            </span>
          );
        }
      },
      {
        id: 'alert',
        header: 'Alert',
        cell: ({ row }) => {
          const alert = alertsByTruck[row.original.id];
          return (
            <div
              className='cursor-pointer'
              onClick={() => router.push(`/dashboard/truck/${row.original.id}`)}
            >
              {alert ? (
                <Badge
                  variant='outline'
                  className='gap-1.5 bg-amber-50 text-amber-600'
                >
                  <IconAlertTriangle className='h-3 w-3 text-amber-600' />
                  {alert.alertType || 'Alert'}
                </Badge>
              ) : (
                <Badge
                  variant='outline'
                  className='gap-1.5 bg-emerald-50 text-emerald-600'
                >
                  OK
                </Badge>
              )}
            </div>
          );
        }
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className='text-right'>
            <PermissionGuard permission={Permission.DELETE_TRUCK}>
              <Button
                variant='ghost'
                size='icon'
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDelete(row.original);
                }}
                title={t('actions.delete')}
                className='text-destructive hover:text-destructive'
              >
                <IconTrash className='h-4 w-4' />
              </Button>
            </PermissionGuard>
          </div>
        )
      }
    ],
    [t, alertsByTruck, router]
  );

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: (page ?? 1) - 1,
      pageSize: limit ?? 10
    }),
    [page, limit]
  );

  const table = useReactTable({
    data: filteredTrucks,
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

  // Status counts
  const statusCounts = useMemo(
    () => ({
      all: trucks.length,
      available: trucks.filter((t) => t.status === 'available').length,
      in_use: trucks.filter((t) => t.status === 'in_use').length,
      maintenance: trucks.filter((t) => t.status === 'maintenance').length,
      unavailable: trucks.filter((t) => t.status === 'unavailable').length
    }),
    [trucks]
  );

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setLicensePhotoFiles([]);
  };

  // Open create dialog
  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  // Open delete confirmation
  const handleOpenDelete = (truck: Truck) => {
    setSelectedTruck(truck);
    setIsDeleteOpen(true);
  };

  // Handle form input change
  const handleInputChange = (field: keyof TruckFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle license photo upload
  const handlePhotoUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setUploadingPhoto(true);
    try {
      const uploaded = await uploadFile(files[0]);
      setFormData((prev) => ({ ...prev, licensePhoto: uploaded.path }));
      setLicensePhotoFiles([]);
      toast({
        title: t('toast.uploadSuccess'),
        description: t('toast.uploadSuccessDesc')
      });
    } catch {
      toast({
        variant: 'destructive',
        title: t('toast.uploadError'),
        description: t('toast.tryAgain')
      });
      throw new Error('Upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Create truck
  const handleCreate = async () => {
    if (!formData.licensePlate.trim()) {
      toast({
        variant: 'destructive',
        title: t('toast.fillRequired')
      });
      return;
    }

    setSubmitting(true);
    try {
      const newTruck = await createTruck({
        licensePlate: formData.licensePlate.trim(),
        model: formData.model.trim() || null,
        capacity: formData.capacity ? Number(formData.capacity) : null,
        currentLocation: formData.currentLocation.trim() || null,
        licensePhoto: formData.licensePhoto.trim() || null
      });

      toast({
        title: t('toast.createSuccess'),
        description: t('toast.createSuccessDesc', {
          licensePlate: newTruck.licensePlate ?? ''
        })
      });

      // Update local state without reloading
      setTrucks((prev) => [newTruck, ...prev]);
      setIsCreateOpen(false);
      resetForm();
    } catch {
      toast({
        variant: 'destructive',
        title: t('toast.createError'),
        description: t('toast.tryAgain')
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete truck
  const handleDelete = async () => {
    if (!selectedTruck) return;

    setDeleting(true);
    try {
      await deleteTruck(selectedTruck.id);

      toast({
        title: t('toast.deleteSuccess'),
        description: t('toast.deleteSuccessDesc', {
          licensePlate: selectedTruck.licensePlate ?? ''
        })
      });

      // Update local state without reloading
      setTrucks((prev) =>
        prev.filter((truck) => truck.id !== selectedTruck.id)
      );
      setIsDeleteOpen(false);
      setSelectedTruck(null);
    } catch {
      toast({
        variant: 'destructive',
        title: t('toast.deleteError'),
        description: t('toast.tryAgain')
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
              <IconTruck className='h-8 w-8 text-blue-600' />
              {t('title')}
            </h2>
            <p className='text-muted-foreground'>
              Manage and track your trucks
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={loadTrucks} disabled={loading}>
              <IconRefresh
                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              {t('actions.refresh')}
            </Button>
            <PermissionGuard permission={Permission.CREATE_TRUCK}>
              <Button onClick={handleOpenCreate}>
                <IconPlus className='mr-2 h-4 w-4' />
                {t('addTruck')}
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Status Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('ALL')}
          >
            <CardHeader className='pb-3'>
              <CardDescription>Total Trucks</CardDescription>
              <CardTitle className='text-3xl'>
                {loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  statusCounts.all
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('available')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconCheck className='h-4 w-4' />
                {t('status.available')}
              </CardDescription>
              <CardTitle className='text-3xl'>
                {loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  statusCounts.available
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('in_use')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconTruck className='h-4 w-4' />
                {t('status.inUse')}
              </CardDescription>
              <CardTitle className='text-3xl'>
                {loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  statusCounts.in_use
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('maintenance')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconTools className='h-4 w-4' />
                {t('status.maintenance')}
              </CardDescription>
              <CardTitle className='text-3xl'>
                {loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  statusCounts.maintenance
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('unavailable')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconClock className='h-4 w-4' />
                {t('status.unavailable')}
              </CardDescription>
              <CardTitle className='text-3xl'>
                {loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  statusCounts.unavailable
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <div className='flex flex-1 items-center space-x-2'>
                <div className='relative flex-1'>
                  <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                  <Input
                    placeholder={t('searchPlaceholder')}
                    className='pl-8'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter(
                      (v as
                        | 'ALL'
                        | 'available'
                        | 'in_use'
                        | 'maintenance'
                        | 'unavailable') || 'ALL'
                    )
                  }
                >
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Filter by status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>All Status</SelectItem>
                    <SelectItem value='available'>
                      {t('status.available')}
                    </SelectItem>
                    <SelectItem value='in_use'>{t('status.inUse')}</SelectItem>
                    <SelectItem value='maintenance'>
                      {t('status.maintenance')}
                    </SelectItem>
                    <SelectItem value='unavailable'>
                      {t('status.unavailable')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <DataTableSkeleton columnCount={9} rowCount={10} />
            ) : filteredTrucks.length === 0 ? (
              <div className='text-muted-foreground rounded-md border p-6 text-center text-sm'>
                <div className='flex flex-col items-center justify-center'>
                  <IconTruck className='mb-2 h-12 w-12' />
                  <p>
                    {searchTerm || statusFilter !== 'ALL'
                      ? t('noTrucks')
                      : t('noTrucksEmpty')}
                  </p>
                </div>
              </div>
            ) : (
              <DataTable table={table} pageSizeOptions={[]} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('dialog.createTitle')}</DialogTitle>
            <DialogDescription>
              {t('dialog.createDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className='grid max-h-[70vh] gap-4 overflow-y-auto px-1 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='licensePlate'>
                {t('fields.licensePlate')}{' '}
                <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='licensePlate'
                placeholder={t('placeholders.licensePlate')}
                value={formData.licensePlate}
                onChange={(e) =>
                  handleInputChange('licensePlate', e.target.value)
                }
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='model'>{t('fields.model')}</Label>
              <Input
                id='model'
                placeholder={t('placeholders.model')}
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='capacity'>{t('fields.capacity')} (kg)</Label>
              <Input
                id='capacity'
                type='number'
                placeholder={t('placeholders.capacity')}
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='currentLocation'>
                {t('fields.currentLocation')}
              </Label>
              <Input
                id='currentLocation'
                placeholder={t('placeholders.currentLocation')}
                value={formData.currentLocation}
                onChange={(e) =>
                  handleInputChange('currentLocation', e.target.value)
                }
              />
            </div>
            <div className='grid gap-2'>
              <Label>{t('fields.licensePhoto')}</Label>
              {formData.licensePhoto ? (
                <div className='space-y-3'>
                  <div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
                    <Image
                      src={formData.licensePhoto}
                      alt='License Photo'
                      fill
                      className='object-cover'
                    />
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, licensePhoto: '' }))
                    }
                  >
                    {t('actions.changeImage')}
                  </Button>
                </div>
              ) : (
                <FileUploader
                  value={licensePhotoFiles}
                  onValueChange={setLicensePhotoFiles}
                  onUpload={handlePhotoUpload}
                  accept={{ 'image/*': [] }}
                  maxSize={5 * 1024 * 1024}
                  maxFiles={1}
                  disabled={uploadingPhoto}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsCreateOpen(false)}
              disabled={submitting || uploadingPhoto}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={submitting || uploadingPhoto}
            >
              {submitting ? (
                <>
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                  {t('actions.creating')}
                </>
              ) : (
                t('actions.create')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Modal
        title={t('deleteModal.title')}
        description={t('deleteModal.description')}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
      >
        <div className='flex w-full items-center justify-end gap-2 pt-6'>
          <Button
            variant='outline'
            onClick={() => setIsDeleteOpen(false)}
            disabled={deleting}
          >
            {t('deleteModal.cancel')}
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
            {t('deleteModal.confirm')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
