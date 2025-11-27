'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  IconTruck,
  IconCpu,
  IconMapPin,
  IconWeight,
  IconPlus,
  IconRefresh,
  IconEdit,
  IconTrash,
  IconSearch
} from '@tabler/icons-react';
import {
  createTruck,
  fetchTrucks,
  updateTruck,
  deleteTruck
} from '@/services/truck.service';
import type { Truck, CreateTruckDto } from '@/types/truck';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/hooks/use-debounce';

function StatusBadge({ status, t }: { status?: string | null; t: any }) {
  if (!status) return <Badge variant='outline'>{t('status.unknown')}</Badge>;

  const statusConfig: Record<string, { label: string; className: string }> = {
    active: {
      label: t('status.active'),
      className: 'border-green-200 bg-green-100 text-green-700'
    },
    inactive: {
      label: t('status.inactive'),
      className: 'border-red-200 bg-red-100 text-red-700'
    },
    available: {
      label: t('status.available'),
      className: 'border-green-200 bg-green-100 text-green-700'
    },
    in_use: {
      label: t('status.inUse'),
      className: 'border-blue-200 bg-blue-100 text-blue-700'
    },
    maintenance: {
      label: t('status.maintenance'),
      className: 'border-yellow-200 bg-yellow-100 text-yellow-700'
    },
    out_of_service: {
      label: t('status.outOfService'),
      className: 'border-red-200 bg-red-100 text-red-700'
    }
  };

  const config = statusConfig[status] || {
    label: status,
    className: 'border-gray-200 bg-gray-100 text-gray-700'
  };

  return <Badge className={config.className}>{config.label}</Badge>;
}

export function TruckManagement() {
  const t = useTranslations('Truck');
  const { toast } = useToast();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [deletingTruck, setDeletingTruck] = useState<Truck | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debounce search input for better performance
  const debouncedSearch = useDebounce(search, 300);

  const [form, setForm] = useState<CreateTruckDto>({
    licensePlate: '',
    model: '',
    capacity: null,
    status: 'active',
    currentLocation: '',
    licensePhoto: ''
  });

  const loadTrucks = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const res = await fetchTrucks({
        page: pageNum,
        limit: 50
      });
      setTrucks(res.data);
      setHasMore(res.hasNextPage || false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('toast.loadError'),
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrucks(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const resetForm = () => {
    setForm({
      licensePlate: '',
      model: '',
      capacity: null,
      status: 'active',
      currentLocation: '',
      licensePhoto: ''
    });
  };

  const handleCreate = async () => {
    if (!form.licensePlate || !form.model) {
      toast({
        variant: 'destructive',
        title: t('toast.fillRequired')
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createTruck(form);
      toast({
        title: t('toast.createSuccess'),
        description: t('toast.createSuccessDesc', {
          licensePlate: form.licensePlate
        })
      });
      resetForm();
      setOpenCreateDialog(false);
      await loadTrucks(page);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('toast.createError'),
        description:
          error instanceof Error ? error.message : t('toast.tryAgain')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingTruck) return;

    if (!form.licensePlate || !form.model) {
      toast({
        variant: 'destructive',
        title: t('toast.fillRequired')
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await updateTruck(editingTruck.id, form);
      toast({
        title: t('toast.updateSuccess'),
        description: t('toast.updateSuccessDesc', {
          licensePlate: form.licensePlate
        })
      });
      setOpenEditDialog(false);
      setEditingTruck(null);
      resetForm();
      await loadTrucks(page);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('toast.updateError'),
        description:
          error instanceof Error ? error.message : t('toast.tryAgain')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (truck: Truck) => {
    setDeletingTruck(truck);
    setOpenDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTruck) return;

    try {
      setIsDeleting(true);
      await deleteTruck(deletingTruck.id);
      toast({
        title: t('toast.deleteSuccess'),
        description: t('toast.deleteSuccessDesc', {
          licensePlate: deletingTruck.licensePlate || ''
        })
      });
      setOpenDeleteModal(false);
      setDeletingTruck(null);
      await loadTrucks(page);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('toast.deleteError'),
        description:
          error instanceof Error ? error.message : t('toast.tryAgain')
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditForm = (truck: Truck) => {
    setEditingTruck(truck);
    setForm({
      licensePlate: truck.licensePlate || '',
      model: truck.model || '',
      capacity: truck.capacity,
      status: truck.status || 'active',
      currentLocation: truck.currentLocation || '',
      licensePhoto: truck.licensePhoto || ''
    });
    setOpenEditDialog(true);
  };

  const filtered = trucks.filter((truck) => {
    const searchLower = debouncedSearch.toLowerCase();
    if (!searchLower) return true;
    return (
      (truck.licensePlate?.toLowerCase() || '').includes(searchLower) ||
      (truck.model?.toLowerCase() || '').includes(searchLower) ||
      (truck.currentLocation?.toLowerCase() || '').includes(searchLower)
    );
  });

  const selectedTruck = trucks.find((truck) => truck.id === openDetailId);
  function parseDeviceData(d: any): {
    temperature?: number;
    humidity?: number;
  } {
    try {
      if (typeof d?.data === 'string' && d.data.trim().length > 0) {
        const obj = JSON.parse(d.data);
        return {
          temperature: obj.temperature ?? obj.temp ?? obj.t,
          humidity: obj.humidity ?? obj.humid ?? obj.h
        };
      }
      if (Array.isArray(d?.data)) {
        const last = d.data[d.data.length - 1];
        return {
          temperature: last?.temperature ?? last?.temp ?? last?.t,
          humidity: last?.humidity ?? last?.humid ?? last?.h
        };
      }
      if (typeof d?.data === 'object' && d.data) {
        return {
          temperature: d.data.temperature ?? d.data.temp ?? d.data.t,
          humidity: d.data.humidity ?? d.data.humid ?? d.data.h
        };
      }
    } catch {}
    return {};
  }
  return (
    <>
      <div className='w-full space-y-6'>
        {/* Header Actions */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='relative max-w-sm flex-1'>
            <IconSearch className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
            <Input
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-10'
            />
          </div>
          <Button onClick={() => setOpenCreateDialog(true)}>
            <IconPlus className='mr-2 h-4 w-4' />
            {t('addTruck')}
          </Button>
        </div>

        {/* Truck Cards Grid */}
        {isLoading ? (
          <div className='py-12 text-center'>
            <p className='text-muted-foreground'>{t('loading')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className='py-12 text-center'>
            <IconTruck className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
            <p className='text-muted-foreground'>
              {debouncedSearch ? t('noTrucks') : t('noTrucksEmpty')}
            </p>
          </div>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filtered.map((truck) => (
              <Card
                key={truck.id}
                className='cursor-pointer transition hover:shadow-md'
              >
                <CardHeader className='pb-2'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                      <IconTruck className='h-4 w-4' />
                      {truck.licensePlate || 'N/A'}
                    </CardTitle>
                    <StatusBadge status={truck.status} t={t} />
                  </div>
                  <CardDescription>
                    {truck.model || t('fields.model')}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    <div className='flex items-center gap-1'>
                      <IconWeight className='h-4 w-4' />
                      {truck.capacity
                        ? `${truck.capacity}${t('units.kg')}`
                        : 'N/A'}
                    </div>
                    <div className='flex items-center gap-1'>
                      <IconMapPin className='h-4 w-4' />
                      {truck.currentLocation || 'N/A'}
                    </div>
                  </div>
                  {truck.iotDevice && truck.iotDevice.length > 0 && (
                    <div className='flex items-center gap-1 text-sm'>
                      <IconCpu className='h-4 w-4' />
                      <span>
                        {truck.iotDevice.length}{' '}
                        {truck.iotDevice.length === 1
                          ? t('units.device')
                          : t('units.devices')}
                      </span>
                    </div>
                  )}
                  <div className='flex gap-2 pt-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='flex-1'
                      onClick={() => setOpenDetailId(truck.id)}
                    >
                      {t('actions.details')}
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => openEditForm(truck)}
                    >
                      <IconEdit className='h-4 w-4' />
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleDeleteClick(truck)}
                    >
                      <IconTrash className='h-4 w-4' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filtered.length > 0 && (
          <div className='flex justify-center gap-2'>
            <Button
              variant='outline'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t('pagination.previous')}
            </Button>
            <Button variant='outline' disabled>
              {t('pagination.page', { page })}
            </Button>
            <Button
              variant='outline'
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
            >
              {t('pagination.next')}
            </Button>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!openDetailId}
        onOpenChange={(o) => !o && setOpenDetailId(null)}
      >
        <DialogContent className='max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-3xl'>
          {selectedTruck && (
            <>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2'>
                  <IconTruck className='h-5 w-5' /> {selectedTruck.licensePlate}
                </DialogTitle>
                <DialogDescription>{selectedTruck.model}</DialogDescription>
              </DialogHeader>

              <div className='grid gap-4 md:grid-cols-2'>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm'>
                      {t('dialog.basicInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2 text-sm'>
                    <div>
                      <span className='font-medium'>
                        {t('fields.licensePlate')}:
                      </span>{' '}
                      {selectedTruck.licensePlate || 'N/A'}
                    </div>
                    <div>
                      <span className='font-medium'>{t('fields.model')}:</span>{' '}
                      {selectedTruck.model || 'N/A'}
                    </div>
                    <div>
                      <span className='font-medium'>
                        {t('fields.capacity')}:
                      </span>{' '}
                      {selectedTruck.capacity
                        ? `${selectedTruck.capacity}${t('units.kg')}`
                        : 'N/A'}
                    </div>
                    <div>
                      <span className='font-medium'>
                        {t('fields.currentLocation')}:
                      </span>{' '}
                      {selectedTruck.currentLocation || 'N/A'}
                    </div>
                    <div>
                      <span className='font-medium'>{t('fields.status')}:</span>{' '}
                      <StatusBadge status={selectedTruck.status} t={t} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm'>
                      {t('dialog.iotDevicesSection')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3 text-sm'>
                    {selectedTruck.iotDevice &&
                    selectedTruck.iotDevice.length > 0 ? (
                      selectedTruck.iotDevice.map((device) => (
                        <div
                          key={device.id}
                          className='flex items-center justify-between border-b pb-2'
                        >
                          <div className='flex items-center gap-2'>
                            <div>
                              <IconCpu className='h-4 w-4' />
                              <div className='font-medium'>
                                {device.type || 'N/A'}
                              </div>
                              <div className='text-muted-foreground text-xs'>
                                {device.id || 'N/A'}
                              </div>
                              <div className='grid grid-cols-2 gap-4'>
                                {(() => {
                                  const r = parseDeviceData(device);
                                  return (
                                    <>
                                      <div className='rounded-lg border p-3 text-center'>
                                        <div className='text-muted-foreground text-xs'>
                                          Nhiệt độ
                                        </div>
                                        <div className='text-2xl font-bold'>
                                          {r.temperature != null
                                            ? `${r.temperature}°C`
                                            : '--'}
                                        </div>
                                      </div>
                                      <div className='rounded-lg border p-3 text-center'>
                                        <div className='text-muted-foreground text-xs'>
                                          Độ ẩm
                                        </div>
                                        <div className='text-2xl font-bold'>
                                          {r.humidity != null
                                            ? `${r.humidity}%`
                                            : '--'}
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='text-muted-foreground'>
                        {t('dialog.noIotDevices')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {selectedTruck.licensePhoto && (
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm'>
                      {t('dialog.licensePhotoSection')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedTruck.licensePhoto}
                      alt='License'
                      className='w-full rounded-md'
                    />
                  </CardContent>
                </Card>
              )}

              <DialogFooter>
                <Button variant='outline' onClick={() => setOpenDetailId(null)}>
                  {t('actions.close')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog
        open={openCreateDialog}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setOpenCreateDialog(open);
        }}
      >
        <DialogContent className='max-h-[90vh] max-w-xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{t('dialog.createTitle')}</DialogTitle>
            <DialogDescription>
              {t('dialog.createDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='licensePlate'>{t('fields.licensePlate')} *</Label>
              <Input
                id='licensePlate'
                value={form.licensePlate || ''}
                onChange={(e) =>
                  setForm({ ...form, licensePlate: e.target.value })
                }
                placeholder={t('placeholders.licensePlate')}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='model'>{t('fields.model')} *</Label>
              <Input
                id='model'
                value={form.model || ''}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder={t('placeholders.model')}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='capacity'>
                {t('fields.capacity')} ({t('units.kg')})
              </Label>
              <Input
                id='capacity'
                type='number'
                value={form.capacity || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    capacity: e.target.value ? Number(e.target.value) : null
                  })
                }
                placeholder={t('placeholders.capacity')}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='currentLocation'>
                {t('fields.currentLocation')}
              </Label>
              <Input
                id='currentLocation'
                value={form.currentLocation || ''}
                onChange={(e) =>
                  setForm({ ...form, currentLocation: e.target.value })
                }
                placeholder={t('placeholders.currentLocation')}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='status'>{t('fields.status')}</Label>
              <select
                id='status'
                value={form.status || 'active'}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className='border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm'
              >
                <option value='active'>{t('status.active')}</option>
                <option value='inactive'>{t('status.inactive')}</option>
                <option value='maintenance'>{t('status.maintenance')}</option>
                <option value='available'>{t('status.available')}</option>
                <option value='in_use'>{t('status.inUse')}</option>
                <option value='out_of_service'>
                  {t('status.outOfService')}
                </option>
              </select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='licensePhoto'>{t('fields.licensePhoto')}</Label>
              <Input
                id='licensePhoto'
                value={form.licensePhoto || ''}
                onChange={(e) =>
                  setForm({ ...form, licensePhoto: e.target.value })
                }
                placeholder={t('placeholders.licensePhoto')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setOpenCreateDialog(false)}
              disabled={isSubmitting}
            >
              {t('actions.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? t('actions.creating') : t('actions.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTruck(null);
            resetForm();
          }
          setOpenEditDialog(open);
        }}
      >
        <DialogContent className='max-h-[90vh] max-w-xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{t('dialog.editTitle')}</DialogTitle>
            <DialogDescription>
              {t('dialog.editDescription', {
                licensePlate: editingTruck?.licensePlate || ''
              })}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-licensePlate'>
                {t('fields.licensePlate')} *
              </Label>
              <Input
                id='edit-licensePlate'
                value={form.licensePlate || ''}
                onChange={(e) =>
                  setForm({ ...form, licensePlate: e.target.value })
                }
                placeholder={t('placeholders.licensePlate')}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-model'>{t('fields.model')} *</Label>
              <Input
                id='edit-model'
                value={form.model || ''}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder={t('placeholders.model')}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-capacity'>
                {t('fields.capacity')} ({t('units.kg')})
              </Label>
              <Input
                id='edit-capacity'
                type='number'
                value={form.capacity || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    capacity: e.target.value ? Number(e.target.value) : null
                  })
                }
                placeholder={t('placeholders.capacity')}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-currentLocation'>
                {t('fields.currentLocation')}
              </Label>
              <Input
                id='edit-currentLocation'
                value={form.currentLocation || ''}
                onChange={(e) =>
                  setForm({ ...form, currentLocation: e.target.value })
                }
                placeholder={t('placeholders.currentLocation')}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-status'>{t('fields.status')}</Label>
              <select
                id='edit-status'
                value={form.status || 'active'}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className='border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm'
              >
                <option value='active'>{t('status.active')}</option>
                <option value='inactive'>{t('status.inactive')}</option>
                <option value='maintenance'>{t('status.maintenance')}</option>
                <option value='available'>{t('status.available')}</option>
                <option value='in_use'>{t('status.inUse')}</option>
                <option value='out_of_service'>
                  {t('status.outOfService')}
                </option>
              </select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-licensePhoto'>
                {t('fields.licensePhoto')}
              </Label>
              <Input
                id='edit-licensePhoto'
                value={form.licensePhoto || ''}
                onChange={(e) =>
                  setForm({ ...form, licensePhoto: e.target.value })
                }
                placeholder={t('placeholders.licensePhoto')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setOpenEditDialog(false)}
              disabled={isSubmitting}
            >
              {t('actions.cancel')}
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? t('actions.updating') : t('actions.update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteModal}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDeleteModal(false);
            setDeletingTruck(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteModal.title')}</DialogTitle>
            <DialogDescription>
              {t('deleteModal.description')}
            </DialogDescription>
          </DialogHeader>
          <div className='flex w-full items-center justify-end space-x-2 pt-6'>
            <Button
              disabled={isDeleting}
              variant='outline'
              onClick={() => {
                setOpenDeleteModal(false);
                setDeletingTruck(null);
              }}
            >
              {t('deleteModal.cancel')}
            </Button>
            <Button
              disabled={isDeleting}
              variant='destructive'
              onClick={handleDeleteConfirm}
            >
              {isDeleting ? t('actions.updating') : t('deleteModal.confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TruckManagement;
