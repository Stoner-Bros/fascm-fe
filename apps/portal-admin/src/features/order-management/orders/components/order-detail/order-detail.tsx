'use client';

import PageContainer from '@/components/layout/page-container';
import { useToast } from '@/components/ui/use-toast';
import { createOrderPhase } from '@/services/order-phase.service';
import type { CreateOrderInvoiceDetailDto } from '@/types/order';
import { useEffect, useState } from 'react';
import { CreatePhaseDialog } from './create-phase-dialog';
import { EmptyState } from './empty-state';
import { LoadingState } from '../../../../../components/loading-state';
import { OrderDetailsTable } from './order-details-table';
import { OrderHeader } from './order-header';
import { OrderInfoCard } from './order-info-card';
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
        title: 'Lỗi',
        description: 'Vui lòng nhập số lượng cho ít nhất một sản phẩm',
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
        description: phaseData.description || `Đợt ${phaseData.phaseNumber}`,
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
        title: 'Thành công',
        description: 'Đã tạo đợt giao hàng'
      });
      await refetch();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.details?.message || 'Không thể tạo đợt giao hàng',
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

        <OrderInfoCard schedule={schedule} />

        <OrderDetailsTable schedule={schedule} totals={totals} />

        <PhasesList
          phases={phases}
          onConfirmDelivery={confirmDelivery}
          updatingPhaseId={updatingPhaseId}
        />

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
