import { useToast } from '@/components/ui/use-toast';
import { createOrderPhase } from '@/services/order-phase.service';
import type {
  CreateOrderInvoiceDetailDto,
  OrderPhase,
  OrderSchedule
} from '@/types/order';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export interface PhaseFormData {
  description: string;
  taxRate: number;
  phaseNumber: number;
  invoiceDetails: CreateOrderInvoiceDetailDto[];
}

export function usePhaseForm(
  initialDetails: CreateOrderInvoiceDetailDto[],
  nextPhaseNumber: number,
  schedule: OrderSchedule | null,
  phases: OrderPhase[],
  setShowPhaseDialog: (show: boolean) => void,
  fetchPhases: () => void
) {
  const { toast } = useToast();
  const t = useTranslations('Orders.detail');
  const [phaseData, setPhaseData] = useState<PhaseFormData>({
    description: '',
    taxRate: 5,
    phaseNumber: nextPhaseNumber,
    invoiceDetails: initialDetails
  });
  const [loading, setLoading] = useState(false);

  const updatePhaseData = (updates: Partial<PhaseFormData>) => {
    setPhaseData((prev) => ({ ...prev, ...updates }));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setPhaseData((prev) => ({
      ...prev,
      invoiceDetails: prev.invoiceDetails.map((detail) =>
        detail.product.id === productId ? { ...detail, quantity } : detail
      )
    }));
  };

  const reset = (
    newDetails: CreateOrderInvoiceDetailDto[],
    newPhaseNumber: number
  ) => {
    setPhaseData({
      description: '',
      taxRate: 5,
      phaseNumber: newPhaseNumber,
      invoiceDetails: newDetails
    });
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
      setLoading(true);
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
      await fetchPhases();
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.details?.message || t('toast.errorCreatePhase'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    phaseData,
    updatePhaseData,
    updateQuantity,
    reset,
    handleCreatePhase,
    loading
  };
}
