'use client';

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
import { FileUploader } from '@/components/file-uploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  fetchTruckById,
  updateTruck,
  updateTruckStatus,
  fetchTruckSettingByTruckId,
  fetchActiveTruckAlertByTruckId
} from '@/services/truck.service';
import { uploadFile } from '@/services/file.service';
import type {
  Truck,
  TruckStatusEnum,
  TruckSetting,
  TruckAlert
} from '@/types/truck';
import {
  IconArrowLeft,
  IconCalendar,
  IconCpu,
  IconDroplet,
  IconEdit,
  IconLoader2,
  IconMapPin,
  IconRefresh,
  IconTemperature,
  IconTruck,
  IconAlertTriangle
} from '@tabler/icons-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TruckDetailProps {
  truckId: string;
}

type TruckFormData = {
  licensePlate: string;
  model: string;
  capacity: string;
  currentLocation: string;
  licensePhoto: string;
};

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

export function TruckDetail({ truckId }: TruckDetailProps) {
  const t = useTranslations('Truck');
  const { toast } = useToast();
  const router = useRouter();

  // Data state
  const [truck, setTruck] = useState<Truck | null>(null);
  const [truckSetting, setTruckSetting] = useState<TruckSetting | null>(null);
  const [activeAlert, setActiveAlert] = useState<TruckAlert | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<TruckFormData>({
    licensePlate: '',
    model: '',
    capacity: '',
    currentLocation: '',
    licensePhoto: ''
  });
  const [selectedStatus, setSelectedStatus] = useState<TruckStatusEnum | ''>(
    ''
  );
  const [licensePhotoFiles, setLicensePhotoFiles] = useState<File[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadTruckData = async () => {
    setLoading(true);
    try {
      const [truckData, settingData, alertData] = await Promise.all([
        fetchTruckById(truckId),
        fetchTruckSettingByTruckId(truckId).catch(() => null),
        fetchActiveTruckAlertByTruckId(truckId).catch(() => null)
      ]);

      setTruck(truckData);
      setTruckSetting(settingData);
      setActiveAlert(alertData);

      // Initialize form data
      setFormData({
        licensePlate: truckData.licensePlate ?? '',
        model: truckData.model ?? '',
        capacity: truckData.capacity?.toString() ?? '',
        currentLocation: truckData.currentLocation ?? '',
        licensePhoto: truckData.licensePhoto ?? ''
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
  };

  useEffect(() => {
    loadTruckData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [truckId]);

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

  // Open edit dialog
  const handleOpenEdit = () => {
    if (truck) {
      setFormData({
        licensePlate: truck.licensePlate ?? '',
        model: truck.model ?? '',
        capacity: truck.capacity?.toString() ?? '',
        currentLocation: truck.currentLocation ?? '',
        licensePhoto: truck.licensePhoto ?? ''
      });
      setIsEditOpen(true);
    }
  };

  // Open status update dialog
  const handleOpenStatus = () => {
    if (truck) {
      setSelectedStatus(truck.status ?? '');
      setIsStatusOpen(true);
    }
  };

  // Update truck
  const handleUpdate = async () => {
    if (!truck || !formData.licensePlate.trim()) {
      toast({
        variant: 'destructive',
        title: t('toast.fillRequired')
      });
      return;
    }

    setSubmitting(true);
    try {
      const updatedTruck = await updateTruck(truck.id, {
        licensePlate: formData.licensePlate.trim(),
        model: formData.model.trim() || null,
        capacity: formData.capacity ? Number(formData.capacity) : null,
        currentLocation: formData.currentLocation.trim() || null,
        licensePhoto: formData.licensePhoto.trim() || null
      });

      toast({
        title: t('toast.updateSuccess'),
        description: t('toast.updateSuccessDesc', {
          licensePlate: updatedTruck.licensePlate ?? ''
        })
      });

      setTruck(updatedTruck);
      setIsEditOpen(false);
    } catch {
      toast({
        variant: 'destructive',
        title: t('toast.updateError'),
        description: t('toast.tryAgain')
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Update truck status
  const handleStatusUpdate = async () => {
    if (!truck || !selectedStatus) return;

    setUpdatingStatus(true);
    try {
      const updatedTruck = await updateTruckStatus(truck.id, selectedStatus);

      toast({
        title: t('toast.statusUpdateSuccess'),
        description: t('toast.statusUpdateSuccessDesc', {
          licensePlate: truck.licensePlate ?? ''
        })
      });

      setTruck(updatedTruck);
      setIsStatusOpen(false);
      setSelectedStatus('');
    } catch {
      toast({
        variant: 'destructive',
        title: t('toast.statusUpdateError'),
        description: t('toast.tryAgain')
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className='flex h-96 flex-1 items-center justify-center'>
        <IconLoader2 className='text-muted-foreground h-8 w-8 animate-spin' />
        <span className='text-muted-foreground ml-2'>{t('loading')}</span>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className='flex h-96 flex-1 flex-col items-center justify-center'>
        <IconTruck className='text-muted-foreground h-12 w-12' />
        <p className='text-muted-foreground mt-4'>{t('detail.notFound')}</p>
        <Button
          variant='outline'
          className='mt-4'
          onClick={() => router.back()}
        >
          <IconArrowLeft className='mr-2 h-4 w-4' />
          {t('detail.goBack')}
        </Button>
      </div>
    );
  }

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' onClick={() => router.back()}>
            <IconArrowLeft className='mr-2 h-4 w-4' />
            {t('detail.goBack')}
          </Button>
          <div>
            <h1 className='flex items-center gap-2 text-2xl font-bold'>
              <IconTruck className='h-6 w-6 text-blue-600' />
              {truck.licensePlate || t('detail.unknownPlate')}
            </h1>
            <p className='text-muted-foreground'>
              {truck.model || t('detail.unknownModel')}
            </p>
          </div>
        </div>
        <div className='flex gap-2'>
          {getStatusBadge(truck.status, t)}
          <Button variant='outline' size='sm' onClick={handleOpenStatus}>
            {t('actions.changeStatus')}
          </Button>
          <Button variant='outline' size='sm' onClick={handleOpenEdit}>
            <IconEdit className='mr-2 h-4 w-4' />
            {t('actions.edit')}
          </Button>
          <Button variant='outline' size='sm' onClick={loadTruckData}>
            <IconRefresh className='mr-2 h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Active Alert */}
      {activeAlert && (
        <Card className='border-amber-200 bg-amber-50'>
          <CardContent className='flex items-center gap-3 py-4'>
            <IconAlertTriangle className='h-5 w-5 text-amber-600' />
            <div>
              <p className='font-medium text-amber-800'>
                {activeAlert.alertType || t('detail.alert')}
              </p>
              <p className='text-sm text-amber-700'>
                {activeAlert.message || t('detail.alertMessage')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Left Column - Main Info */}
        <div className='space-y-6 lg:col-span-2'>
          <Tabs defaultValue='info' className='w-full'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='info'>
                {t('detail.tabs.basicInfo')}
              </TabsTrigger>
              <TabsTrigger value='iot'>
                {t('detail.tabs.iotDevices')}
              </TabsTrigger>
              <TabsTrigger value='settings'>
                {t('detail.tabs.settings')}
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value='info' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('dialog.basicInfo')}</CardTitle>
                  <CardDescription>{t('detail.basicInfoDesc')}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='space-y-1'>
                      <Label className='text-muted-foreground text-sm'>
                        {t('fields.licensePlate')}
                      </Label>
                      <p className='text-lg font-medium'>
                        {truck.licensePlate || '-'}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-muted-foreground text-sm'>
                        {t('fields.model')}
                      </Label>
                      <p className='text-lg font-medium'>
                        {truck.model || '-'}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-muted-foreground text-sm'>
                        {t('fields.capacity')}
                      </Label>
                      <p className='text-lg font-medium'>
                        {truck.capacity
                          ? `${truck.capacity} ${t('units.kg')}`
                          : '-'}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-muted-foreground text-sm'>
                        {t('fields.status')}
                      </Label>
                      <div>{getStatusBadge(truck.status, t)}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-1'>
                    <Label className='text-muted-foreground text-sm'>
                      <IconMapPin className='mr-1 inline h-4 w-4' />
                      {t('fields.currentLocation')}
                    </Label>
                    <p className='text-lg'>{truck.currentLocation || '-'}</p>
                  </div>

                  <Separator />

                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='space-y-1'>
                      <Label className='text-muted-foreground text-sm'>
                        <IconCalendar className='mr-1 inline h-4 w-4' />
                        {t('detail.createdAt')}
                      </Label>
                      <p>
                        {truck.createdAt
                          ? format(
                              new Date(truck.createdAt),
                              'dd/MM/yyyy HH:mm'
                            )
                          : '-'}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <Label className='text-muted-foreground text-sm'>
                        <IconCalendar className='mr-1 inline h-4 w-4' />
                        {t('detail.updatedAt')}
                      </Label>
                      <p>
                        {truck.updatedAt
                          ? format(
                              new Date(truck.updatedAt),
                              'dd/MM/yyyy HH:mm'
                            )
                          : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* IoT Devices Tab */}
            <TabsContent value='iot' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('dialog.iotDevicesSection')}</CardTitle>
                  <CardDescription>{t('detail.iotDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {truck.iotDevice && truck.iotDevice.length > 0 ? (
                    <div className='space-y-4'>
                      {truck.iotDevice.map((device) => {
                        // Parse device data
                        let temperature: number | null = null;
                        let humidity: number | null = null;
                        try {
                          if (
                            typeof device.data === 'string' &&
                            (device.data as string).startsWith('{')
                          ) {
                            const parsed = JSON.parse(device.data);
                            temperature =
                              parsed.temperature ?? parsed.temp ?? null;
                            humidity = parsed.humidity ?? parsed.humid ?? null;
                          }
                        } catch {
                          // Ignore parse errors
                        }

                        const isOnline =
                          device.status === 'active' ||
                          device.status === 'online';
                        const lastUpdate = device.lastDataTime
                          ? formatDistanceToNow(new Date(device.lastDataTime), {
                              addSuffix: true
                            })
                          : null;

                        return (
                          <div
                            key={device.id}
                            className={`rounded-lg border p-4 ${
                              isOnline
                                ? 'border-emerald-200 bg-emerald-50/50'
                                : 'border-slate-200 bg-slate-50/50'
                            }`}
                          >
                            <div className='flex items-start justify-between'>
                              <div className='flex items-center gap-3'>
                                <div
                                  className={`rounded-lg p-2 ${
                                    isOnline ? 'bg-emerald-100' : 'bg-slate-100'
                                  }`}
                                >
                                  <IconCpu
                                    className={`h-5 w-5 ${
                                      isOnline
                                        ? 'text-emerald-600'
                                        : 'text-slate-500'
                                    }`}
                                  />
                                </div>
                                <div>
                                  <div className='font-mono font-medium'>
                                    {device.id}
                                  </div>
                                  <div className='text-muted-foreground text-xs'>
                                    {device.type || 'Sensor'}
                                  </div>
                                </div>
                              </div>
                              <Badge
                                className={
                                  isOnline
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-600'
                                }
                              >
                                {isOnline ? t('iot.online') : t('iot.offline')}
                              </Badge>
                            </div>

                            {/* Sensor Data */}
                            {(temperature !== null || humidity !== null) && (
                              <div className='mt-4 grid grid-cols-2 gap-3'>
                                {temperature !== null && (
                                  <div className='flex items-center gap-2 rounded-md border bg-white p-3'>
                                    <IconTemperature className='h-5 w-5 text-orange-500' />
                                    <div>
                                      <div className='text-muted-foreground text-xs'>
                                        {t('iot.temperature')}
                                      </div>
                                      <div className='text-lg font-semibold'>
                                        {temperature}°C
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {humidity !== null && (
                                  <div className='flex items-center gap-2 rounded-md border bg-white p-3'>
                                    <IconDroplet className='h-5 w-5 text-blue-500' />
                                    <div>
                                      <div className='text-muted-foreground text-xs'>
                                        {t('iot.humidity')}
                                      </div>
                                      <div className='text-lg font-semibold'>
                                        {humidity}%
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Last Update */}
                            {lastUpdate && (
                              <div className='text-muted-foreground mt-3 text-xs'>
                                {t('iot.lastUpdate')}: {lastUpdate}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center py-8'>
                      <IconCpu className='text-muted-foreground h-12 w-12' />
                      <p className='text-muted-foreground mt-2'>
                        {t('dialog.noIotDevices')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value='settings' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('detail.environmentSettings')}</CardTitle>
                  <CardDescription>
                    {t('detail.environmentSettingsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {truckSetting ? (
                    <div className='grid gap-6 sm:grid-cols-2'>
                      <div className='rounded-lg border p-4'>
                        <div className='flex items-center gap-2'>
                          <IconTemperature className='h-5 w-5 text-orange-500' />
                          <span className='font-medium'>
                            {t('iot.temperature')}
                          </span>
                        </div>
                        <div className='mt-2 grid grid-cols-2 gap-4'>
                          <div>
                            <Label className='text-muted-foreground text-xs'>
                              {t('detail.min')}
                            </Label>
                            <p className='text-lg font-semibold'>
                              {truckSetting.minTemperature ?? '-'}°C
                            </p>
                          </div>
                          <div>
                            <Label className='text-muted-foreground text-xs'>
                              {t('detail.max')}
                            </Label>
                            <p className='text-lg font-semibold'>
                              {truckSetting.maxTemperature ?? '-'}°C
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className='rounded-lg border p-4'>
                        <div className='flex items-center gap-2'>
                          <IconDroplet className='h-5 w-5 text-blue-500' />
                          <span className='font-medium'>
                            {t('iot.humidity')}
                          </span>
                        </div>
                        <div className='mt-2 grid grid-cols-2 gap-4'>
                          <div>
                            <Label className='text-muted-foreground text-xs'>
                              {t('detail.min')}
                            </Label>
                            <p className='text-lg font-semibold'>
                              {truckSetting.minHumidity ?? '-'}%
                            </p>
                          </div>
                          <div>
                            <Label className='text-muted-foreground text-xs'>
                              {t('detail.max')}
                            </Label>
                            <p className='text-lg font-semibold'>
                              {truckSetting.maxHumidity ?? '-'}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center py-8'>
                      <IconTemperature className='text-muted-foreground h-12 w-12' />
                      <p className='text-muted-foreground mt-2'>
                        {t('detail.noSettings')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - License Photo & Quick Info */}
        <div className='space-y-6'>
          {/* License Photo */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dialog.licensePhotoSection')}</CardTitle>
            </CardHeader>
            <CardContent>
              {truck.licensePhoto ? (
                <div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
                  <Image
                    src={truck.licensePhoto}
                    alt='License Photo'
                    fill
                    className='object-cover'
                  />
                </div>
              ) : (
                <div className='flex aspect-video items-center justify-center rounded-lg border border-dashed'>
                  <p className='text-muted-foreground text-sm'>
                    {t('detail.noLicensePhoto')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.quickStats')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground text-sm'>
                  {t('fields.iotDevices')}
                </span>
                <Badge variant='outline'>
                  <IconCpu className='mr-1 h-3 w-3' />
                  {truck.iotDevice?.length || 0}{' '}
                  {truck.iotDevice?.length === 1
                    ? t('units.device')
                    : t('units.devices')}
                </Badge>
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground text-sm'>
                  {t('fields.capacity')}
                </span>
                <span className='font-medium'>
                  {truck.capacity ? `${truck.capacity} ${t('units.kg')}` : '-'}
                </span>
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground text-sm'>
                  {t('fields.status')}
                </span>
                {getStatusBadge(truck.status, t)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('dialog.editTitle')}</DialogTitle>
            <DialogDescription>
              {t('dialog.editDescription', {
                licensePlate: truck?.licensePlate ?? ''
              })}
            </DialogDescription>
          </DialogHeader>
          <div className='grid max-h-[70vh] gap-4 overflow-y-auto px-1 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='edit-licensePlate'>
                {t('fields.licensePlate')}{' '}
                <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='edit-licensePlate'
                placeholder={t('placeholders.licensePlate')}
                value={formData.licensePlate}
                onChange={(e) =>
                  handleInputChange('licensePlate', e.target.value)
                }
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-model'>{t('fields.model')}</Label>
              <Input
                id='edit-model'
                placeholder={t('placeholders.model')}
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-capacity'>{t('fields.capacity')} (kg)</Label>
              <Input
                id='edit-capacity'
                type='number'
                placeholder={t('placeholders.capacity')}
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-currentLocation'>
                {t('fields.currentLocation')}
              </Label>
              <Input
                id='edit-currentLocation'
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
              onClick={() => setIsEditOpen(false)}
              disabled={submitting || uploadingPhoto}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={submitting || uploadingPhoto}
            >
              {submitting ? (
                <>
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                  {t('actions.updating')}
                </>
              ) : (
                t('actions.update')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('dialog.statusTitle')}</DialogTitle>
            <DialogDescription>
              {t('dialog.statusDescription', {
                licensePlate: truck?.licensePlate ?? ''
              })}
            </DialogDescription>
          </DialogHeader>
          {truck && (
            <div className='space-y-4 py-4'>
              <div className='flex items-center gap-3 rounded-lg border p-3'>
                <div className='text-muted-foreground text-sm'>
                  {t('dialog.currentStatus')}:
                </div>
                {getStatusBadge(truck.status, t)}
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='status'>{t('dialog.newStatus')}</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setSelectedStatus(value as TruckStatusEnum)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('dialog.selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='available'>
                      {t('status.available')}
                    </SelectItem>
                    <SelectItem value='unavailable'>
                      {t('status.unavailable')}
                    </SelectItem>
                    <SelectItem value='maintenance'>
                      {t('status.maintenance')}
                    </SelectItem>
                    <SelectItem value='in_use'>{t('status.inUse')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsStatusOpen(false)}
              disabled={updatingStatus}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={updatingStatus || !selectedStatus}
            >
              {updatingStatus ? (
                <>
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                  {t('actions.updating')}
                </>
              ) : (
                t('actions.updateStatus')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
