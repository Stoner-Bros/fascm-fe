'use client';

import PageContainer from '@/components/layout/page-container';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createOrderPhase } from '@/services/order-phase.service';
import type { CreateOrderInvoiceDetailDto } from '@/types/order';
import { Package, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { CreatePhaseDialog } from './create-phase-modal';
import { EmptyState } from './empty-state';
import { LoadingState } from '../../../../../components/loading-state';
import { OrderDetailsTable } from './order-details-table';
import { OrderHeader } from './order-header';
import { OrderInfoCard } from './order-info-card';
import { OrderStatusStepper } from './order-status-stepper';
import { PhasesList } from './phases-list';
import { RejectDialog } from './reject-dialog';
import {
  useOrderDetail,
  useOrderStatusActions,
  usePhaseActions
} from '../../hooks/order-detail/use-order-detail';
import { usePhaseForm } from '../../hooks/order-detail/use-phase-form';
import {
  calculateScheduleTotals,
  hasRemainingQuantity
} from '../../utils/calculations';

export default function OrderDetail({ scheduleId }: { scheduleId: string }) {
  const { toast } = useToast();
  const t = useTranslations('Orders.detail');
  const { schedule, phases, loading, refetch } = useOrderDetail(scheduleId);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPhaseDialog, setShowPhaseDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { approve, reject, complete, updating } = useOrderStatusActions(
    schedule,
    refetch
  );

  const { confirmDelivery, updatingPhaseId } = usePhaseActions(refetch);

  // Initialize phase form
  const initialDetails: CreateOrderInvoiceDetailDto[] =
    schedule?.orderDetails?.map((detail) => ({
      product: { id: detail.product!.id },
      quantity: 0,
      unitPrice: detail.unitPrice || 0,
      unit: detail.unit || ''
    })) || [];

  const { phaseData, updatePhaseData, updateQuantity, reset } = usePhaseForm(
    initialDetails,
    phases.length + 1
  );

  // Reset phase form when schedule changes
  useEffect(() => {
    if (schedule?.orderDetails && phaseData.invoiceDetails.length === 0) {
      const newDetails: CreateOrderInvoiceDetailDto[] =
        schedule.orderDetails.map((detail) => ({
          product: { id: detail.product!.id },
          quantity: 0,
          unitPrice: detail.unitPrice || 0,
          unit: detail.unit || ''
        }));
      reset(newDetails, phases.length + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule?.id]);

  // Calculate totals
  const totals = schedule ? calculateScheduleTotals(schedule, phases) : {};
  const hasRemaining = hasRemainingQuantity(totals);

  const handleReject = async () => {
    await reject(rejectReason);
    setShowRejectDialog(false);
    setRejectReason('');
  };

  const handleCreatePhase = async () => {
    if (!schedule) return;

    // Validate invoice details
    const validDetails = phaseData.invoiceDetails.filter(
      (d) => d.quantity && d.quantity > 0
    );
    if (validDetails.length === 0) {
      toast({
        title: t('toast.error'),
        description: t('toast.errorPhaseValidation'),
        variant: 'destructive'
      });
      return;
    }

    // Calculate total amount with tax
    const subtotal = validDetails.reduce((sum, detail) => {
      return sum + detail.quantity! * (detail.unitPrice || 0);
    }, 0);
    const totalAmount = subtotal * (1 + phaseData.taxRate / 100);

    try {
      await createOrderPhase({
        description:
          phaseData.description ||
          `${t('phases.phase')} ${phaseData.phaseNumber}`,
        phaseNumber: phaseData.phaseNumber,
        orderSchedule: { id: schedule.id },
        orderInvoice: {
          totalAmount,
          taxRate: phaseData.taxRate
        },
        orderInvoiceDetails: validDetails
      });

      setShowPhaseDialog(false);
      // Reset phase form
      const newDetails: CreateOrderInvoiceDetailDto[] =
        schedule.orderDetails!.map((detail) => ({
          product: { id: detail.product!.id },
          quantity: 0,
          unitPrice: detail.unitPrice || 0,
          unit: detail.unit || ''
        }));
      reset(newDetails, phases.length + 2);

      toast({
        title: t('toast.success'),
        description: t('toast.successCreatePhase')
      });
      await refetch();
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.details?.message || t('toast.errorCreatePhase'),
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!schedule) {
    return <EmptyState />;
  }

  return (
    <PageContainer>
      <div className='mx-auto w-full flex-1 space-y-6'>
        <OrderHeader
          schedule={schedule}
          status={schedule.status}
          hasRemainingQuantity={hasRemaining}
          onApprove={approve}
          onReject={() => setShowRejectDialog(true)}
          onComplete={complete}
          onCreatePhase={() => setShowPhaseDialog(true)}
          updating={updating}
        />

        {/* Order Status Stepper */}
        <OrderStatusStepper status={schedule.status} reason={schedule.reason} />

        {/* Main Tabs */}
        <Tabs defaultValue='overview' className='w-full'>
          <TabsList className='gap-1'>
            <TabsTrigger
              value='overview'
              className='flex cursor-pointer items-center gap-2 hover:bg-transparent'
            >
              <Package className='h-4 w-4' />
              {t('tabs.overview')}
            </TabsTrigger>
            <TabsTrigger
              value='phases'
              className='flex cursor-pointer items-center gap-2 hover:bg-transparent'
            >
              <Truck className='h-4 w-4' />
              {t('tabs.phases')}
              {phases.length > 0 && (
                <span className='bg-primary text-primary-foreground ml-1 rounded-full px-2 py-0.5 text-xs font-medium'>
                  {phases.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='mt-6'>
            <div className='space-y-6'>
              <OrderInfoCard schedule={schedule} />
              <OrderDetailsTable schedule={schedule} totals={totals} />
            </div>
          </TabsContent>

          {/* Phases Tab */}
          <TabsContent value='phases' className='mt-6'>
            <PhasesList
              phases={phases}
              onConfirmDelivery={confirmDelivery}
              updatingPhaseId={updatingPhaseId}
            />
          </TabsContent>
        </Tabs>

        <RejectDialog
          open={showRejectDialog}
          onOpenChange={setShowRejectDialog}
          reason={rejectReason}
          onReasonChange={setRejectReason}
          onConfirm={handleReject}
          loading={updating}
        />

        <CreatePhaseDialog
          open={showPhaseDialog}
          onOpenChange={setShowPhaseDialog}
          schedule={schedule}
          totals={totals}
          phaseData={phaseData}
          onPhaseDataChange={updatePhaseData}
          onQuantityChange={updateQuantity}
          onCreate={handleCreatePhase}
          loading={updating}
        />
      </div>
    </PageContainer>
  );
}
