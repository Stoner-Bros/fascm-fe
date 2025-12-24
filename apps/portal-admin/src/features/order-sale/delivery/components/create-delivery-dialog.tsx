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
import { OrderPhase } from '@/types/order';
import { OrderSchedule } from '@/types/order';
import { Truck, TruckStatusEnum } from '@/types/truck';
import {
  Calendar,
  Loader2,
  MapPin,
  Package,
  Truck as TruckIcon,
  User
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/ui/use-toast';

interface CreateDeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: OrderSchedule | null;
  phase: OrderPhase;
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

// Helper function to convert quantity to kg
function convertToKg(
  quantity: number,
  unit: string | null | undefined
): number {
  if (!quantity || quantity <= 0) return 0;

  const unitLower = (unit || 'kg').toLowerCase().trim();

  // Convert to kg based on unit
  switch (unitLower) {
    case 'tấn':
    case 'ton':
    case 'tons':
      return quantity * 1000;
    case 'kg':
    case 'kilogram':
    case 'kilograms':
      return quantity;
    case 'g':
    case 'gram':
    case 'grams':
      return quantity / 1000;
    default:
      // Assume kg if unit is unknown
      return quantity;
  }
}

export function CreateDeliveryDialog({
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
}: CreateDeliveryDialogProps) {
  const { fullInfo } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('Orders.createDeliveryDialog');
  const [selectedTruckId, setSelectedTruckId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [startAddress, setStartAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    setStartAddress(fullInfo?.warehouse?.address);
  }, [fullInfo?.warehouse?.address]);

  // Calculate total quantity in kg from orderInvoiceDetails
  const totalQuantityKg = useMemo(() => {
    if (!phase.orderInvoiceDetails || phase.orderInvoiceDetails.length === 0) {
      return 0;
    }

    return phase.orderInvoiceDetails.reduce((total, detail) => {
      const quantity = detail.quantity || 0;
      const unit = detail.unit;
      return total + convertToKg(quantity, unit);
    }, 0);
  }, [phase.orderInvoiceDetails]);

  // Get selected truck
  const selectedTruck = useMemo(() => {
    return trucks.find((t) => t.id === selectedTruckId);
  }, [trucks, selectedTruckId]);

  // Check if truck capacity is sufficient
  const isCapacitySufficient = useMemo(() => {
    if (!selectedTruck || !selectedTruck.capacity) return true; // No truck selected or no capacity info
    return selectedTruck.capacity >= totalQuantityKg;
  }, [selectedTruck, totalQuantityKg]);

  // Capacity error message
  const capacityError = useMemo(() => {
    if (!selectedTruck || !selectedTruck.capacity) return null;
    if (isCapacitySufficient) return null;
    return `Sức chứa không đủ. Tổng khối lượng: ${totalQuantityKg.toFixed(2)}kg, Sức chứa xe: ${selectedTruck.capacity}kg`;
  }, [selectedTruck, totalQuantityKg, isCapacitySufficient]);

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

    // Validate capacity before submitting
    if (!isCapacitySufficient) {
      toast({
        title: 'Lỗi',
        description:
          capacityError ||
          'Sức chứa xe không đủ để chứa tổng khối lượng sản phẩm',
        variant: 'destructive'
      });
      return;
    }

    const payload: CreateDeliveryDto = {
      orderPhase: { id: phase.id },
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
    setStartAddress('');
    setNotes('');
  };

  const handleClose = () => {
    setSelectedTruckId('');
    setSelectedStaffId('');
    setStartAddress('');
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
        disabled={
          !selectedTruckId ||
          !selectedStaffId ||
          isSubmitting ||
          !isCapacitySufficient
        }
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
            {schedule?.consignee?.organizationName && (
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Khách hàng:</span>
                <span className='text-sm font-medium'>
                  {schedule.consignee.organizationName}
                </span>
              </div>
            )}
            {schedule?.deliveryDate && (
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground flex items-center gap-1'>
                  <Calendar className='h-3 w-3' />
                  Ngày giao hàng:
                </span>
                <span className='text-sm'>
                  {formatDate(schedule.deliveryDate)}
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
            {phase.orderInvoiceDetails &&
              phase.orderInvoiceDetails.length > 0 && (
                <div className='mt-1 border-t pt-2'>
                  <span className='text-muted-foreground mb-1.5 flex items-center gap-1'>
                    <Package className='h-3 w-3' />
                    {t('products')}:
                  </span>
                  <div className='space-y-1'>
                    {phase.orderInvoiceDetails.map((detail, idx) => (
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
              <SelectTrigger
                id='truck'
                className={capacityError ? 'border-destructive h-9' : 'h-9'}
              >
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
                  availableTrucks.map((truck) => {
                    const truckCapacity = truck.capacity || 0;
                    const isTruckCapacitySufficient =
                      truckCapacity >= totalQuantityKg;
                    const isDisabled =
                      truck.status === 'in_use' ||
                      truck.status === 'unavailable' ||
                      !isTruckCapacitySufficient;

                    return (
                      <SelectItem
                        key={truck.id}
                        value={truck.id}
                        disabled={isDisabled}
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
                          {!isTruckCapacitySufficient &&
                            totalQuantityKg > 0 && (
                              <Badge
                                variant='destructive'
                                className='px-1.5 py-0 text-[10px]'
                              >
                                Không đủ sức chứa
                              </Badge>
                            )}
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          )}
          {capacityError && (
            <p className='text-destructive text-xs'>{capacityError}</p>
          )}
          {selectedTruck && isCapacitySufficient && totalQuantityKg > 0 && (
            <p className='text-muted-foreground text-xs'>
              Tổng khối lượng: {totalQuantityKg.toFixed(2)}kg / Sức chứa:{' '}
              {selectedTruck.capacity}kg
            </p>
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
            placeholder={
              fullInfo?.warehouse?.address || t('loadingWarehouseAddress')
            }
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
