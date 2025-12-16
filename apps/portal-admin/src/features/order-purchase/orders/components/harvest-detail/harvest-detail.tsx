'use client';

import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CreateHarvestInvoiceDetailDto } from '@/types/harvest-phase';
import { Package, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { LoadingState } from '../../../../../components/loading-state';
import {
  useHarvestDetail,
  useHarvestStatusActions
} from '../../hooks/harvest-detail/use-harvest-detail';
import { usePhaseForm } from '../../hooks/harvest-detail/use-phase-form';
import {
  calculateScheduleTotals,
  hasRemainingQuantity
} from '../../utils/calculations';
import { CreatePhaseDialog } from './create-phase-modal';
import { EmptyState } from './empty-state';
import { HarvestDetailsTable } from './harvest-details-table';
import { HarvestHeader } from './harvest-header';
import { HarvestInfoCard } from './harvest-info-card';
import { HarvestStatusStepper } from './harvest-status-stepper';
import { PhasesList } from './phases-list';
import { RejectDialog } from './reject-dialog';

export default function HarvestDetail({ scheduleId }: { scheduleId: string }) {
  const t = useTranslations('HarvestOrders.detail');
  const { schedule, phases, loading, fetchSchedule, fetchPhases } =
    useHarvestDetail(scheduleId);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPhaseDialog, setShowPhaseDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { approve, reject, complete, updating } = useHarvestStatusActions(
    schedule,
    () => {
      fetchSchedule();
      fetchPhases();
    }
  );

  // Initialize phase form
  const initialDetails: CreateHarvestInvoiceDetailDto[] =
    schedule?.harvestDetails?.map((detail) => ({
      product: { id: detail.product!.id },
      quantity: 0,
      unitPrice: detail.finalUnitPriceAccepted
        ? detail.finalUnitPrice || 0
        : detail.expectedUnitPrice || 0,
      unit: detail.unit || ''
    })) || [];

  const {
    phaseData,
    updatePhaseData,
    updateQuantity,
    reset,
    handleCreatePhase,
    loading: createPhaseLoading
  } = usePhaseForm(
    initialDetails,
    phases.length + 1,
    schedule,
    phases,
    setShowPhaseDialog,
    fetchPhases
  );

  // Reset phase form when schedule changes
  useEffect(() => {
    if (schedule?.harvestDetails && phaseData.invoiceDetails.length === 0) {
      const newDetails: CreateHarvestInvoiceDetailDto[] =
        schedule.harvestDetails.map((detail) => ({
          product: { id: detail.product!.id },
          quantity: 0,
          unitPrice: detail.finalUnitPriceAccepted
            ? detail.finalUnitPrice || 0
            : detail.expectedUnitPrice || 0,
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

  if (loading) {
    return <LoadingState />;
  }

  if (!schedule) {
    return <EmptyState />;
  }

  return (
    <PageContainer>
      <div className='mx-auto w-full flex-1 space-y-6'>
        <HarvestHeader
          schedule={schedule}
          status={schedule.status}
          hasRemainingQuantity={hasRemaining}
          onApprove={approve}
          onReject={() => setShowRejectDialog(true)}
          onComplete={complete}
          onCreatePhase={() => setShowPhaseDialog(true)}
          updating={updating}
        />

        {/* Harvest Status Stepper */}
        <HarvestStatusStepper
          status={schedule.status}
          reason={schedule.reason}
        />

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
              <HarvestInfoCard schedule={schedule} />
              <HarvestDetailsTable schedule={schedule} totals={totals} />
            </div>
          </TabsContent>

          {/* Phases Tab */}
          <TabsContent value='phases' className='mt-6'>
            <PhasesList phases={phases} />
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
          phaseNumber={phases.length + 1}
          onPhaseDataChange={updatePhaseData}
          onQuantityChange={updateQuantity}
          onCreate={handleCreatePhase}
          loading={createPhaseLoading}
        />
      </div>
    </PageContainer>
  );
}
