'use client';

import { Modal } from '@/components/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateDeliveryDto } from '@/types/delivery';
import { DeliveryStaff } from '@/types/delivery-staff';
import { HarvestPhase } from '@/types/harvest-phase';
import { HarvestSchedule } from '@/types/harvest-schedule';
import { Truck, TruckStatusEnum } from '@/types/truck';
import {
  Calendar,
  Loader2,
  MapPin,
  Package,
  Truck as TruckIcon,
  User
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';

interface CreatePickupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: HarvestSchedule | null;
  phase: HarvestPhase;
  trucks: Truck[];
  trucksLoading: boolean;
  deliveryStaffs: DeliveryStaff[];
  deliveryStaffsLoading: boolean;
  onSubmit: (data: CreateDeliveryDto) => Promise<void>;
  isSubmitting: boolean;
}

function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getTruckStatusLabel(
  status: TruckStatusEnum | null | undefined
): string {
  const labels: Record<TruckStatusEnum, string> = {
    available: 'Sẵn sàng',
    unavailable: 'Không khả dụng',
    maintenance: 'Bảo trì',
    in_use: 'Đang sử dụng'
  };
  return status ? labels[status] || status : 'Không xác định';
}

export function CreatePickupDialog({
  open,
  onOpenChange,
  schedule,
  phase,
  trucks,
  trucksLoading,
  deliveryStaffs,
  deliveryStaffsLoading,
  onSubmit,
  isSubmitting
}: CreatePickupDialogProps) {
  const { fullInfo } = useAuth();
  const t = useTranslations('HarvestOrders.createPickupDialog');
  const [selectedTruckId, setSelectedTruckId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [startAddress, setStartAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    setStartAddress(fullInfo?.warehouse?.address);
  }, [fullInfo?.warehouse?.address]);

  // Filter available trucks
  const availableTrucks = trucks.filter(
    (t) => t.status === 'available' || t.status === 'in_use'
  );

  // Filter active delivery staff only
  const activeDeliveryStaffs = deliveryStaffs.filter(
    (staff) => staff.user?.status?.id === 1
  );

  const handleSubmit = async () => {
    if (!selectedTruckId || !selectedStaffId) return;

    const payload: CreateDeliveryDto = {
      harvestPhase: { id: phase.id },
      truck: { id: selectedTruckId },
      deliveryStaff: { id: selectedStaffId },
      startAddress: startAddress || undefined,
      endAddress: schedule?.address || undefined,
      status: 'scheduled'
    };

    await onSubmit(payload);

    // Reset form
    setSelectedTruckId('');
    setSelectedStaffId('');
    setNotes('');
  };

  const handleClose = () => {
    setSelectedTruckId('');
    setSelectedStaffId('');
    setNotes('');
    onOpenChange(false);
  };

  const footerContent = (
    <div className='flex items-center justify-end gap-2'>
      <Button variant='outline' onClick={handleClose} disabled={isSubmitting}>
        {t('cancel')}
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={!selectedTruckId || !selectedStaffId || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            {t('creating')}
          </>
        ) : (
          <>
            <TruckIcon className='mr-2 h-4 w-4' />
            {t('createDelivery')}
          </>
        )}
      </Button>
    </div>
  );

  return (
    <Modal
      title={t('title', { phaseNumber: phase.phaseNumber ?? 0 })}
      description={t('description', { phaseNumber: phase.phaseNumber ?? 0 })}
      isOpen={open}
      onClose={handleClose}
      footer={footerContent}
    >
      <div className='space-y-4'>
        {/* Phase Info Summary */}
        <div className='bg-muted/30 rounded-md border p-3'>
          <h4 className='mb-2 text-sm font-medium'>{t('phaseInfo')}</h4>
          <div className='grid gap-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Đợt:</span>
              <Badge variant='outline' className='text-xs'>
                Đợt {phase.phaseNumber}
              </Badge>
            </div>
            {schedule?.supplier?.gardenName && (
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Nhà vườn:</span>
                <span className='text-sm font-medium'>
                  {schedule.supplier.gardenName}
                </span>
              </div>
            )}
            {schedule?.harvestDate && (
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground flex items-center gap-1'>
                  <Calendar className='h-3 w-3' />
                  Ngày thu hoạch:
                </span>
                <span className='text-sm'>
                  {formatDate(schedule.harvestDate)}
                </span>
              </div>
            )}
            {schedule?.address && (
              <div className='flex items-start justify-between gap-4'>
                <span className='text-muted-foreground flex items-center gap-1'>
                  <MapPin className='h-3 w-3' />
                  {t('address')}:
                </span>
                <span className='text-right text-xs'>{schedule.address}</span>
              </div>
            )}
            {phase.harvestInvoiceDetails &&
              phase.harvestInvoiceDetails.length > 0 && (
                <div className='mt-1 border-t pt-2'>
                  <span className='text-muted-foreground mb-1.5 flex items-center gap-1'>
                    <Package className='h-3 w-3' />
                    {t('products')}:
                  </span>
                  <div className='space-y-1'>
                    {phase.harvestInvoiceDetails.map((detail, idx) => (
                      <div
                        key={detail.id || idx}
                        className='flex items-center justify-between text-xs'
                      >
                        <span>{detail.product?.name || t('productLabel')}</span>
                        <span className='font-medium'>
                          {detail.quantity} {detail.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Truck Selection */}
        <div className='space-y-1.5'>
          <Label htmlFor='truck' className='flex items-center gap-1.5 text-sm'>
            <TruckIcon className='h-3.5 w-3.5' />
            {t('selectTruck')} <span className='text-destructive'>*</span>
          </Label>
          {trucksLoading ? (
            <Skeleton className='h-9 w-full' />
          ) : (
            <Select
              value={selectedTruckId}
              onValueChange={setSelectedTruckId}
              disabled={availableTrucks.length === 0}
            >
              <SelectTrigger id='truck' className='h-9'>
                <SelectValue
                  placeholder={
                    availableTrucks.length === 0
                      ? t('noTrucksAvailable')
                      : t('selectTruckPlaceholder')
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableTrucks.length === 0 ? (
                  <div className='text-muted-foreground p-3 text-center text-sm'>
                    {t('noTrucksAvailable')}
                  </div>
                ) : (
                  availableTrucks.map((truck) => (
                    <SelectItem
                      key={truck.id}
                      value={truck.id}
                      disabled={
                        truck.status === 'in_use' ||
                        truck.status === 'unavailable'
                      }
                    >
                      <div className='flex items-center gap-2'>
                        <TruckIcon className='text-muted-foreground h-3.5 w-3.5' />
                        <span className='font-medium'>
                          {truck.licensePlate}
                        </span>
                        <span className='text-muted-foreground text-xs'>
                          ({truck.model || 'N/A'} - {truck.capacity}kg)
                        </span>
                        <Badge
                          variant={
                            truck.status === 'available'
                              ? 'default'
                              : truck.status === 'in_use'
                                ? 'secondary'
                                : 'outline'
                          }
                          className='px-1.5 py-0 text-[10px]'
                        >
                          {getTruckStatusLabel(truck.status)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Delivery Staff Selection */}
        <div className='space-y-1.5'>
          <Label htmlFor='staff' className='flex items-center gap-1.5 text-sm'>
            <User className='h-3.5 w-3.5' />
            {t('selectStaff')} <span className='text-destructive'>*</span>
          </Label>
          {deliveryStaffsLoading ? (
            <Skeleton className='h-9 w-full' />
          ) : (
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
              <SelectTrigger id='staff' className='h-9'>
                <SelectValue placeholder={t('selectStaffPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {activeDeliveryStaffs.length === 0 ? (
                  <div className='text-muted-foreground p-3 text-center text-sm'>
                    {t('noStaffAvailable')}
                  </div>
                ) : (
                  activeDeliveryStaffs.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      <div className='flex items-center gap-2'>
                        <User className='text-muted-foreground h-3.5 w-3.5' />
                        <span className='font-medium'>
                          {staff.user?.firstName} {staff.user?.lastName}
                        </span>
                        <span className='text-muted-foreground text-xs'>
                          {staff.licenseNumber}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Start Address (Optional) */}
        <div className='space-y-1.5'>
          <Label
            htmlFor='startAddress'
            className='flex items-center gap-1.5 text-sm'
          >
            <MapPin className='h-3.5 w-3.5' />
            {t('startAddress')}
          </Label>
          <Input
            id='startAddress'
            value={startAddress}
            disabled
            readOnly
            placeholder={startAddress || t('loadingWarehouseAddress')}
            className='bg-muted h-9'
          />
        </div>

        {/* Notes (Optional) */}
        <div className='space-y-1.5'>
          <Label htmlFor='notes' className='text-sm'>
            {t('notes')}
          </Label>
          <Textarea
            id='notes'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('notesPlaceholder')}
            rows={2}
          />
        </div>
      </div>
    </Modal>
  );
}
