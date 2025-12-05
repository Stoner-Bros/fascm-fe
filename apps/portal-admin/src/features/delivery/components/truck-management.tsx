'use client';

import { FileUploader } from '@/components/file-uploader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Modal } from '@/components/ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { uploadFile } from '@/services/file.service';
import {
  createTruck,
  deleteTruck,
  fetchTrucks
} from '@/services/truck.service';
import type { Truck, TruckStatusEnum } from '@/types/truck';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCpu,
  IconLoader2,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconTruck
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const LIMIT = 10;
  const isMounted = useRef(false);

  const loadTrucks = async () => {
    setLoading(true);
    try {
      const response = await fetchTrucks({ page, limit: LIMIT });
      setTrucks(response.data ?? []);
      setHasMore(response.hasNextPage ?? false);
    } catch {
      toast({
        variant: 'destructive',
        title: t('toast.loadError'),
        description: t('toast.tryAgain')
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      loadTrucks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      loadTrucks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Filter trucks by search term
  const filteredTrucks = trucks.filter((truck) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      truck.licensePlate?.toLowerCase().includes(term) ||
      truck.model?.toLowerCase().includes(term) ||
      truck.currentLocation?.toLowerCase().includes(term)
    );
  });

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
    <div className='flex-1 space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <IconTruck className='h-8 w-8 text-blue-600' />
            {t('title')}
          </h1>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={loadTrucks} disabled={loading}>
            <IconRefresh
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
          </Button>
          <Button onClick={handleOpenCreate}>
            <IconPlus className='mr-2 h-4 w-4' />
            {t('addTruck')}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className='flex items-center gap-4'>
        <div className='relative flex-1'>
          <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className='p-0'>
          {loading ? (
            <div className='flex items-center justify-center py-16'>
              <IconLoader2 className='text-muted-foreground h-8 w-8 animate-spin' />
              <span className='text-muted-foreground ml-2'>{t('loading')}</span>
            </div>
          ) : filteredTrucks.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <IconTruck className='text-muted-foreground h-12 w-12' />
              <p className='text-muted-foreground mt-2'>
                {searchTerm ? t('noTrucks') : t('noTrucksEmpty')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('fields.licensePlate')}</TableHead>
                  <TableHead>{t('fields.model')}</TableHead>
                  <TableHead>{t('fields.capacity')}</TableHead>
                  <TableHead>{t('fields.currentLocation')}</TableHead>
                  <TableHead>{t('fields.status')}</TableHead>
                  <TableHead>{t('fields.iotDevices')}</TableHead>
                  <TableHead className='text-right'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrucks.map((truck) => (
                  <TableRow
                    onClick={() => router.push(`/dashboard/truck/${truck.id}`)}
                    className='hover:bg-accent cursor-pointer'
                    key={truck.id}
                  >
                    <TableCell className='font-medium'>
                      {truck.licensePlate || '-'}
                    </TableCell>
                    <TableCell>{truck.model || '-'}</TableCell>
                    <TableCell>
                      {truck.capacity
                        ? `${truck.capacity} ${t('units.kg')}`
                        : '-'}
                    </TableCell>
                    <TableCell>{truck.currentLocation || '-'}</TableCell>
                    <TableCell>{getStatusBadge(truck.status, t)}</TableCell>
                    <TableCell>
                      {truck.iotDevice && truck.iotDevice.length > 0 ? (
                        <Badge
                          variant='outline'
                          className='hover:bg-accent cursor-pointer'
                        >
                          <IconCpu className='mr-1 h-3 w-3' />
                          {truck.iotDevice.length}{' '}
                          {truck.iotDevice.length === 1
                            ? t('units.device')
                            : t('units.devices')}
                        </Badge>
                      ) : (
                        <span className='text-muted-foreground'>-</span>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleOpenDelete(truck)}
                        title={t('actions.delete')}
                        className='text-destructive hover:text-destructive'
                      >
                        <IconTrash className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && trucks.length > 0 && (
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <IconChevronLeft className='h-4 w-4' />
            {t('pagination.previous')}
          </Button>
          <span className='text-muted-foreground text-sm'>
            {t('pagination.page', { page })}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
          >
            {t('pagination.next')}
            <IconChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}

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
    </div>
  );
}
