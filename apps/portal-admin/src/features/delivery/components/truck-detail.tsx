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
  fetchActiveTruckAlertByTruckId,
  createTruckSetting,
  updateTruckSetting
} from '@/services/truck.service';
import {
  subscribeIoTDeviceUpdates,
  subscribeIoTDataUpdates
} from '@/services/iotdevice.service';
import IotDeviceCard from '@/components/iot/iot-device-card';
import { getApiBase } from '@/lib/client';
import { io } from 'socket.io-client';
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
import { format } from 'date-fns';
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

function normalizeSettingValue(v?: number | null) {
  return v != null && v !== -1 ? String(v) : '';
}

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
  const [minTemp, setMinTemp] = useState<string>('');
  const [maxTemp, setMaxTemp] = useState<string>('');
  const [minHum, setMinHum] = useState<string>('');
  const [maxHum, setMaxHum] = useState<string>('');
  const [creatingSetting, setCreatingSetting] = useState(false);
  const [updatingSetting, setUpdatingSetting] = useState(false);

  const loadTruckData = async () => {
    setLoading(true);
    try {
      const [truckData, settingData] = await Promise.all([
        fetchTruckById(truckId),
        fetchTruckSettingByTruckId(truckId).catch(() => null),
        fetchActiveTruckAlertByTruckId(truckId).catch(() => null)
      ]);

      setTruck(truckData);
      setTruckSetting(settingData);
      // Initialize form data
      setFormData({
        licensePlate: truckData.licensePlate ?? '',
        model: truckData.model ?? '',
        capacity: truckData.capacity?.toString() ?? '',
        currentLocation: truckData.currentLocation ?? '',
        licensePhoto: truckData.licensePhoto ?? ''
      });
      setMinTemp(normalizeSettingValue(settingData?.minTemperature));
      setMaxTemp(normalizeSettingValue(settingData?.maxTemperature));
      setMinHum(normalizeSettingValue(settingData?.minHumidity));
      setMaxHum(normalizeSettingValue(settingData?.maxHumidity));
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

  useEffect(() => {
    const unsubscribeDevice = subscribeIoTDeviceUpdates((payload) => {
      const deviceId = String(
        (payload as any)?.id ?? (payload as any)?.deviceId ?? ''
      );
      const tid = String(
        (payload as any)?.truck?.id ?? (payload as any)?.truckId ?? ''
      );
      setTruck((prev) => {
        if (!prev) return prev;
        const list = Array.isArray(prev.iotDevice) ? prev.iotDevice : [];
        const idx = list.findIndex((d) => String(d.id) === deviceId);
        const next = list.slice();
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            status: (payload as any)?.status ?? next[idx].status,
            lastDataTime: String(
              (payload as any)?.lastDataTime ??
                (payload as any)?.timestamp ??
                next[idx].lastDataTime ??
                ''
            ),
            data:
              (payload as any)?.data != null
                ? (payload as any)?.data
                : {
                    temperature:
                      (payload as any)?.temperature ??
                      (payload as any)?.temp ??
                      undefined,
                    humidity:
                      (payload as any)?.humidity ??
                      (payload as any)?.humid ??
                      undefined
                  }
          } as any;
        } else {
          if (tid && tid === String(truckId)) {
            next.unshift({
              id: deviceId,
              type: String((payload as any)?.type ?? 'sensor'),
              status: (payload as any)?.status ?? 'online',
              lastDataTime: String(
                (payload as any)?.lastDataTime ??
                  (payload as any)?.timestamp ??
                  ''
              ),
              data:
                (payload as any)?.data != null
                  ? (payload as any)?.data
                  : {
                      temperature:
                        (payload as any)?.temperature ??
                        (payload as any)?.temp ??
                        undefined,
                      humidity:
                        (payload as any)?.humidity ??
                        (payload as any)?.humid ??
                        undefined
                    }
            } as any);
          }
        }
        return { ...prev, iotDevice: next };
      });
      fetchActiveTruckAlertByTruckId(truckId)
        .then((alert) => setActiveAlert(alert))
        .catch(() => {});
    });

    const unsubscribeData = subscribeIoTDataUpdates((payload) => {
      const deviceId = String(
        (payload as any)?.id ?? (payload as any)?.deviceId ?? ''
      );
      const tid = String(
        (payload as any)?.truck?.id ?? (payload as any)?.truckId ?? ''
      );
      setTruck((prev) => {
        if (!prev) return prev;
        const list = Array.isArray(prev.iotDevice) ? prev.iotDevice : [];
        const idx = list.findIndex((d) => String(d.id) === deviceId);
        const next = list.slice();
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            lastDataTime: String(
              (payload as any)?.lastDataTime ??
                (payload as any)?.timestamp ??
                next[idx].lastDataTime ??
                ''
            ),
            data:
              (payload as any)?.data != null
                ? (payload as any)?.data
                : {
                    temperature:
                      (payload as any)?.temperature ??
                      (payload as any)?.temp ??
                      undefined,
                    humidity:
                      (payload as any)?.humidity ??
                      (payload as any)?.humid ??
                      undefined
                  }
          } as any;
        } else {
          if (tid && tid === String(truckId)) {
            next.unshift({
              id: deviceId,
              type: 'sensor',
              status: 'online',
              lastDataTime: String(
                (payload as any)?.lastDataTime ??
                  (payload as any)?.timestamp ??
                  ''
              ),
              data:
                (payload as any)?.data != null
                  ? (payload as any)?.data
                  : {
                      temperature:
                        (payload as any)?.temperature ??
                        (payload as any)?.temp ??
                        undefined,
                      humidity:
                        (payload as any)?.humidity ??
                        (payload as any)?.humid ??
                        undefined
                    }
            } as any);
          }
        }
        return { ...prev, iotDevice: next };
      });
      fetchActiveTruckAlertByTruckId(truckId)
        .then((alert) => setActiveAlert(alert))
        .catch(() => {});
    });

    return () => {
      unsubscribeDevice();
      unsubscribeData();
    };
  }, [truckId]);

  useEffect(() => {
    const base = getApiBase().replace(/\/api\/v1$/, '');
    const socket = io(`${base}/iot`, {
      path: '/socket.io',
      transports: ['websocket']
    });
    const onUpdate = (payload: any) => {
      const tid = String(payload?.truckId ?? (payload as any)?.truck?.id ?? '');
      if (!tid || tid !== String(truckId)) return;
      const deviceId = String(payload?.deviceId ?? payload?.id ?? '');
      const temperature = payload?.temperature ?? payload?.temp ?? undefined;
      const humidity = payload?.humidity ?? payload?.humid ?? undefined;
      const timestamp = String(
        payload?.timestamp ?? payload?.lastDataTime ?? new Date().toISOString()
      );
      setTruck((prev) => {
        if (!prev) return prev;
        const list = Array.isArray(prev.iotDevice) ? prev.iotDevice : [];
        const idx = list.findIndex((d) => String(d.id) === deviceId);
        const next = list.slice();
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            lastDataTime: timestamp,
            data: { temperature, humidity }
          } as any;
        } else if (deviceId) {
          next.unshift({
            id: deviceId,
            type: 'sensor',
            status: 'online',
            lastDataTime: timestamp,
            data: { temperature, humidity }
          } as any);
        }
        return { ...prev, iotDevice: next };
      });
    };
    socket.emit('iot:subscribeTruck', { truckId });
    socket.on('iot:update', onUpdate);
    return () => {
      socket.off('iot:update', onUpdate);
      socket.disconnect();
    };
  }, [truckId]);

  useEffect(() => {
    const base = getApiBase().replace(/\/api\/v1$/, '');
    const socket = io(`${base}/iot`, {
      path: '/socket.io',
      transports: ['websocket']
    });
    const events = [
      'truck-alert',
      'truck:alert',
      'truck-alert-update',
      'alert:update',
      'alert'
    ];
    const onAlert = (payload: any) => {
      const tid = String(payload?.truckId ?? payload?.truck?.id ?? '');
      if (!tid || tid !== String(truckId)) return;
      const alert: TruckAlert = {
        id: String(payload?.id ?? Date.now()),
        status: payload?.status ?? 'active',
        message: payload?.message ?? '',
        alertType: payload?.alertType ?? payload?.type ?? 'Alert',
        truck: { id: tid },
        createdAt: String(payload?.createdAt ?? new Date().toISOString()),
        updatedAt: String(payload?.updatedAt ?? new Date().toISOString())
      };
      if (String(payload?.status ?? '').toLowerCase() === 'resolved') {
        setActiveAlert(null);
      } else {
        setActiveAlert(alert);
      }
    };
    socket.emit('alert:subscribeTruck', { truckId });
    events.forEach((evt) => socket.on(evt, onAlert));
    return () => {
      events.forEach((evt) => socket.off(evt, onAlert));
      socket.disconnect();
    };
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
                    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                      {truck.iotDevice.map((device) => (
                        <IotDeviceCard
                          key={device.id}
                          id={String(device.id)}
                          type={device.type}
                          status={device.status}
                          lastDataTime={device.lastDataTime ?? ''}
                          data={device.data}
                          locationLabel={`Truck ${truck.id}`}
                        />
                      ))}
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
                    <div className='space-y-6'>
                      <div className='grid gap-6 sm:grid-cols-2'>
                        <div className='rounded-lg border p-4'>
                          <div className='flex items-center gap-2'>
                            <IconTemperature className='h-5 w-5 text-orange-500' />
                            <span className='font-medium'>
                              {t('iot.temperature')}
                            </span>
                          </div>
                          <div className='mt-2 grid grid-cols-2 gap-4'>
                            <div className='grid gap-2'>
                              <Label className='text-muted-foreground text-xs'>
                                {t('detail.min')}
                              </Label>
                              <Input
                                type='number'
                                step='any'
                                inputMode='decimal'
                                placeholder='°C'
                                value={minTemp}
                                onChange={(e) => setMinTemp(e.target.value)}
                              />
                            </div>
                            <div className='grid gap-2'>
                              <Label className='text-muted-foreground text-xs'>
                                {t('detail.max')}
                              </Label>
                              <Input
                                type='number'
                                step='any'
                                inputMode='decimal'
                                placeholder='°C'
                                value={maxTemp}
                                onChange={(e) => setMaxTemp(e.target.value)}
                              />
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
                            <div className='grid gap-2'>
                              <Label className='text-muted-foreground text-xs'>
                                {t('detail.min')}
                              </Label>
                              <Input
                                type='number'
                                step='any'
                                inputMode='decimal'
                                placeholder='%'
                                value={minHum}
                                onChange={(e) => setMinHum(e.target.value)}
                              />
                            </div>
                            <div className='grid gap-2'>
                              <Label className='text-muted-foreground text-xs'>
                                {t('detail.max')}
                              </Label>
                              <Input
                                type='number'
                                step='any'
                                inputMode='decimal'
                                placeholder='%'
                                value={maxHum}
                                onChange={(e) => setMaxHum(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='outline'
                          onClick={() => {
                            setMinTemp(
                              truckSetting.minTemperature != null
                                ? String(truckSetting.minTemperature)
                                : ''
                            );
                            setMaxTemp(
                              truckSetting.maxTemperature != null
                                ? String(truckSetting.maxTemperature)
                                : ''
                            );
                            setMinHum(
                              truckSetting.minHumidity != null
                                ? String(truckSetting.minHumidity)
                                : ''
                            );
                            setMaxHum(
                              truckSetting.maxHumidity != null
                                ? String(truckSetting.maxHumidity)
                                : ''
                            );
                          }}
                          disabled={updatingSetting}
                        >
                          {t('actions.cancel')}
                        </Button>
                        <Button
                          onClick={async () => {
                            if (!truckSetting) return;
                            setUpdatingSetting(true);
                            try {
                              const updated = await updateTruckSetting(
                                truckSetting.id,
                                {
                                  minTemperature: minTemp
                                    ? Number(minTemp)
                                    : null,
                                  maxTemperature: maxTemp
                                    ? Number(maxTemp)
                                    : null,
                                  minHumidity: minHum ? Number(minHum) : null,
                                  maxHumidity: maxHum ? Number(maxHum) : null
                                }
                              );
                              setTruckSetting(updated);
                              toast({ title: t('toast.updateSuccess') });
                            } catch {
                              toast({
                                variant: 'destructive',
                                title: t('toast.updateError'),
                                description: t('toast.tryAgain')
                              });
                            } finally {
                              setUpdatingSetting(false);
                            }
                          }}
                          disabled={updatingSetting}
                        >
                          {updatingSetting ? (
                            <>
                              <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                              {t('actions.updating')}
                            </>
                          ) : (
                            t('actions.update')
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-6'>
                      <div className='grid gap-6 sm:grid-cols-2'>
                        <div className='rounded-lg border p-4'>
                          <div className='flex items-center gap-2'>
                            <IconTemperature className='h-5 w-5 text-orange-500' />
                            <span className='font-medium'>
                              {t('iot.temperature')}
                            </span>
                          </div>
                          <div className='mt-2 grid grid-cols-2 gap-4'>
                            <div className='grid gap-2'>
                              <Label className='text-muted-foreground text-xs'>
                                {t('detail.min')}
                              </Label>
                              <Input
                                type='number'
                                step='any'
                                inputMode='decimal'
                                placeholder='°C'
                                value={minTemp}
                                onChange={(e) => setMinTemp(e.target.value)}
                              />
                            </div>
                            <div className='grid gap-2'>
                              <Label className='text-muted-foreground text-xs'>
                                {t('detail.max')}
                              </Label>
                              <Input
                                type='number'
                                step='any'
                                inputMode='decimal'
                                placeholder='°C'
                                value={maxTemp}
                                onChange={(e) => setMaxTemp(e.target.value)}
                              />
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
                            <div className='grid gap-2'>
                              <Label className='text-muted-foreground text-xs'>
                                {t('detail.min')}
                              </Label>
                              <Input
                                type='number'
                                step='any'
                                inputMode='decimal'
                                placeholder='%'
                                value={minHum}
                                onChange={(e) => setMinHum(e.target.value)}
                              />
                            </div>
                            <div className='grid gap-2'>
                              <Label className='text-muted-foreground text-xs'>
                                {t('detail.max')}
                              </Label>
                              <Input
                                type='number'
                                step='any'
                                inputMode='decimal'
                                placeholder='%'
                                value={maxHum}
                                onChange={(e) => setMaxHum(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='outline'
                          onClick={() => {
                            setMinTemp('');
                            setMaxTemp('');
                            setMinHum('');
                            setMaxHum('');
                          }}
                          disabled={creatingSetting}
                        >
                          {t('actions.cancel')}
                        </Button>
                        <Button
                          onClick={async () => {
                            if (!truck) return;
                            setCreatingSetting(true);
                            try {
                              const created = await createTruckSetting({
                                truck: { id: truck.id },
                                minTemperature: minTemp
                                  ? Number(minTemp)
                                  : null,
                                maxTemperature: maxTemp
                                  ? Number(maxTemp)
                                  : null,
                                minHumidity: minHum ? Number(minHum) : null,
                                maxHumidity: maxHum ? Number(maxHum) : null
                              });
                              setTruckSetting(created);
                              toast({
                                title: t('toast.updateSuccess')
                              });
                            } catch {
                              toast({
                                variant: 'destructive',
                                title: t('toast.updateError'),
                                description: t('toast.tryAgain')
                              });
                            } finally {
                              setCreatingSetting(false);
                            }
                          }}
                          disabled={creatingSetting}
                        >
                          {creatingSetting ? (
                            <>
                              <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                              {t('actions.updating')}
                            </>
                          ) : (
                            t('actions.create')
                          )}
                        </Button>
                      </div>
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
