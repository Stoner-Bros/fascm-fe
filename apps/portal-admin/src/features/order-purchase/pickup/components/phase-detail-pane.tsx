'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  CreateDeliveryDto,
  Delivery,
  DeliveryStatusEnum
} from '@/types/delivery';
import { DeliveryStaff } from '@/types/delivery-staff';
import { HarvestPhase, HarvestPhaseStatus } from '@/types/harvest-phase';
import { HarvestSchedule } from '@/types/harvest-schedule';
import { Truck } from '@/types/truck';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Package,
  Plus,
  Truck as TruckIcon
} from 'lucide-react';
import { useState } from 'react';
import { CreatePickupDialog } from './create-pickup-dialog';
import {
  DeliveryStatusBadge,
  DeliveryStatusStepper
} from './delivery-status-stepper';

interface PhaseDetailPaneProps {
  schedule: HarvestSchedule | null;
  phases: HarvestPhase[];
  phasesLoading: boolean;
  trucks: Truck[];
  trucksLoading: boolean;
  deliveryStaffs: DeliveryStaff[];
  deliveryStaffsLoading: boolean;
  getPickupByPhaseId: (phaseId: string) => Delivery | undefined;
  hasPickupForPhase: (phaseId: string) => boolean;
  onCreatePickup: (data: CreateDeliveryDto) => Promise<Delivery | null>;
  onUpdatePickupStatus: (
    id: string,
    status: DeliveryStatusEnum
  ) => Promise<Delivery | null>;
  isCreating: boolean;
  loadingUpdateStatusId: string | null;
}

const phaseStatusConfig: Record<
  HarvestPhaseStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  preparing: { label: 'Chuẩn bị', variant: 'secondary' },
  delivering: { label: 'Đang giao', variant: 'default' },
  delivered: { label: 'Đã giao', variant: 'default' },
  completed: { label: 'Hoàn thành', variant: 'default' },
  canceled: { label: 'Đã hủy', variant: 'destructive' }
};

function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function PhaseCardSkeleton() {
  return (
    <div className='space-y-2 rounded-md border p-3'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-5 w-20' />
        <Skeleton className='h-4 w-14' />
      </div>
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-8 w-full' />
    </div>
  );
}

function EmptyScheduleState() {
  return (
    <Card className='flex h-full items-center justify-center'>
      <CardContent className='py-10 text-center'>
        <TruckIcon className='text-muted-foreground/50 mx-auto mb-3 h-12 w-12' />
        <h3 className='text-muted-foreground mb-1 text-sm font-medium'>
          Chọn một lịch thu hoạch
        </h3>
        <p className='text-muted-foreground mx-auto max-w-xs text-xs'>
          Chọn lịch từ danh sách bên trái để xem đợt giao hàng
        </p>
      </CardContent>
    </Card>
  );
}

export function PhaseDetailPane({
  schedule,
  phases,
  phasesLoading,
  trucks,
  trucksLoading,
  deliveryStaffs,
  deliveryStaffsLoading,
  getPickupByPhaseId,
  hasPickupForPhase,
  onCreatePickup,
  onUpdatePickupStatus,
  isCreating,
  loadingUpdateStatusId
}: PhaseDetailPaneProps) {
  const [selectedPhaseForCreate, setSelectedPhaseForCreate] =
    useState<HarvestPhase | null>(null);

  if (!schedule) {
    return <EmptyScheduleState />;
  }

  const handleCreatePickup = async (data: CreateDeliveryDto) => {
    const result = await onCreatePickup(data);
    if (result) {
      setSelectedPhaseForCreate(null);
    }
  };

  return (
    <>
      <Card className='flex h-full flex-col gap-0'>
        <CardHeader className='flex-shrink-0 px-4 py-3'>
          {/* Schedule Header */}
          <div className='flex items-start justify-between gap-3'>
            <div>
              <div className='mb-0.5 flex items-center gap-1.5'>
                <span className='text-muted-foreground font-mono text-[10px]'>
                  #{schedule.id.slice(0, 8).toUpperCase()}
                </span>
                <Badge
                  variant={
                    schedule.status === 'processing' ? 'default' : 'secondary'
                  }
                  className='px-1.5 py-0 text-[10px]'
                >
                  {schedule.status}
                </Badge>
              </div>
              <CardTitle className='text-base'>
                {schedule.supplier?.gardenName || 'Lịch thu hoạch'}
              </CardTitle>
              {schedule.description && (
                <CardDescription className='mt-0.5 text-xs'>
                  {schedule.description}
                </CardDescription>
              )}
            </div>
          </div>

          {/* Schedule Meta */}
          <div className='text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-xs'>
            {schedule.harvestDate && (
              <span className='flex items-center gap-1'>
                <Calendar className='h-3 w-3' />
                {formatDate(schedule.harvestDate)}
              </span>
            )}
            {schedule.address && (
              <span className='flex items-center gap-1'>
                <MapPin className='h-3 w-3' />
                {schedule.address}
              </span>
            )}
          </div>

          {/* Products summary */}
          {schedule.harvestDetails && schedule.harvestDetails.length > 0 && (
            <div className='bg-muted/50 mt-2 rounded-md p-2'>
              <h4 className='mb-1 flex items-center gap-1 text-xs font-medium'>
                <Package className='h-3 w-3' />
                Sản phẩm ({schedule.harvestDetails.length})
              </h4>
              <div className='flex flex-wrap gap-1'>
                {schedule.harvestDetails.map((detail, idx) => (
                  <Badge
                    key={detail.id || idx}
                    variant='outline'
                    className='px-1.5 py-0 text-[10px]'
                  >
                    {detail.product?.name} - {detail.quantity} {detail.unit}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardHeader>

        <Separator />

        <CardContent className='flex-1 overflow-y-auto px-4 py-3'>
          <div className='mb-2 flex items-center justify-between'>
            <h3 className='flex items-center gap-1.5 text-sm font-medium'>
              <FileText className='h-3.5 w-3.5' />
              Các đợt thu hoạch ({phases.length})
            </h3>
          </div>

          {phasesLoading ? (
            <div className='space-y-1.5'>
              {Array.from({ length: 3 }).map((_, i) => (
                <PhaseCardSkeleton key={i} />
              ))}
            </div>
          ) : phases.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-8 text-center'>
              <Clock className='text-muted-foreground/50 mb-2 h-10 w-10' />
              <p className='text-muted-foreground text-xs'>
                Chưa có đợt thu hoạch nào cho lịch này
              </p>
            </div>
          ) : (
            <Accordion type='multiple' className='space-y-1.5'>
              {phases.map((phase) => {
                const hasDelivery = hasPickupForPhase(phase.id);
                const delivery = getPickupByPhaseId(phase.id);
                const phaseStatus = phase.status || 'preparing';

                return (
                  <AccordionItem
                    key={phase.id}
                    value={phase.id}
                    className='bg-card rounded-md border'
                  >
                    <AccordionTrigger className='hover:bg-accent cursor-pointer px-3 py-2 hover:no-underline'>
                      <div className='flex flex-1 items-center justify-between gap-2 pr-1'>
                        <div className='flex items-center gap-2'>
                          <div
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-full text-xs',
                              hasDelivery
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {hasDelivery ? (
                              <CheckCircle2 className='h-3.5 w-3.5' />
                            ) : (
                              <span className='text-xs font-semibold'>
                                {phase.phaseNumber}
                              </span>
                            )}
                          </div>
                          <div className='text-left'>
                            <p className='text-sm font-medium'>
                              Đợt {phase.phaseNumber}
                            </p>
                            <p className='text-muted-foreground line-clamp-1 text-[10px]'>
                              {phase.description ||
                                `Đợt thu hoạch số ${phase.phaseNumber}`}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          {hasDelivery ? (
                            <DeliveryStatusBadge status={delivery?.status} />
                          ) : (
                            <Badge
                              variant={
                                phaseStatusConfig[phaseStatus]?.variant ||
                                'outline'
                              }
                              className='px-1.5 py-0 text-[10px]'
                            >
                              {phaseStatusConfig[phaseStatus]?.label ||
                                phaseStatus}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className='px-3 pb-3'>
                      <div className='space-y-2'>
                        {/* Phase products */}
                        {phase.harvestInvoiceDetails &&
                          phase.harvestInvoiceDetails.length > 0 && (
                            <div className='bg-muted/30 rounded-md p-2'>
                              <h5 className='mb-1 flex items-center gap-1 text-xs font-medium'>
                                <Package className='h-3 w-3' />
                                Sản phẩm
                              </h5>
                              <div className='space-y-0.5'>
                                {phase.harvestInvoiceDetails.map(
                                  (detail, idx) => (
                                    <div
                                      key={detail.id || idx}
                                      className='flex items-center justify-between text-xs'
                                    >
                                      <span>
                                        {detail.product?.name || 'Sản phẩm'}
                                      </span>
                                      <span className='font-medium'>
                                        {detail.quantity} {detail.unit}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Delivery info or Create button */}
                        {hasDelivery && delivery ? (
                          <div className='space-y-2'>
                            {/* Delivery details */}
                            <div className='rounded-md border p-2'>
                              <h5 className='mb-2 flex items-center gap-1 text-xs font-medium'>
                                <TruckIcon className='h-3 w-3' />
                                Thông tin chuyến giao
                              </h5>

                              <div className='grid gap-1.5 text-xs'>
                                {delivery.truck && (
                                  <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground'>
                                      Xe:
                                    </span>
                                    <span className='font-medium'>
                                      {delivery.truck.licensePlate}
                                    </span>
                                  </div>
                                )}
                                {delivery.startAddress && (
                                  <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground'>
                                      Điểm đi:
                                    </span>
                                    <span className='max-w-[150px] truncate text-[10px]'>
                                      {delivery.startAddress}
                                    </span>
                                  </div>
                                )}
                                {delivery.startTime && (
                                  <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground'>
                                      Bắt đầu:
                                    </span>
                                    <span>
                                      {formatDateTime(delivery.startTime)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Status stepper */}
                            <div className='rounded-md border p-2'>
                              <h5 className='mb-2 flex items-center gap-1 text-xs font-medium'>
                                <Clock className='h-3 w-3' />
                                Trạng thái
                              </h5>
                              <DeliveryStatusStepper
                                currentStatus={delivery.status}
                                onStatusChange={(status) =>
                                  onUpdatePickupStatus(delivery.id, status)
                                }
                                isLoading={
                                  loadingUpdateStatusId === delivery.id
                                }
                                canUpdate={true}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className='py-2 text-center'>
                            <p className='text-muted-foreground mb-2 text-xs'>
                              Đợt này chưa có chuyến giao hàng
                            </p>
                            <Button
                              size='sm'
                              onClick={() => setSelectedPhaseForCreate(phase)}
                              className='h-8 w-full'
                            >
                              <Plus className='mr-1.5 h-3.5 w-3.5' />
                              Tạo chuyến giao hàng
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Create Pickup Dialog */}
      {selectedPhaseForCreate && (
        <CreatePickupDialog
          open={!!selectedPhaseForCreate}
          onOpenChange={(open) => {
            if (!open) setSelectedPhaseForCreate(null);
          }}
          schedule={schedule}
          phase={selectedPhaseForCreate}
          trucks={trucks}
          trucksLoading={trucksLoading}
          deliveryStaffs={deliveryStaffs}
          deliveryStaffsLoading={deliveryStaffsLoading}
          onSubmit={handleCreatePickup}
          isSubmitting={isCreating}
        />
      )}
    </>
  );
}
