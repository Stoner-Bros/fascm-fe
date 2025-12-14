import { useToast } from '@/components/ui/use-toast';
import { createHarvestPhase } from '@/services/harvest-phase.service';
import type {
  CreateHarvestInvoiceDetailDto,
  HarvestPhase
} from '@/types/harvest-phase';
import type { HarvestSchedule } from '@/types/harvest-schedule';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export interface PhaseFormData {
  description: string;
  taxRate: number;
  phaseNumber: number;
  invoiceDetails: CreateHarvestInvoiceDetailDto[];
}

export function usePhaseForm(
  initialDetails: CreateHarvestInvoiceDetailDto[],
  nextPhaseNumber: number,
  schedule: HarvestSchedule | null,
  phases: HarvestPhase[],
  setShowPhaseDialog: (show: boolean) => void,
  fetchPhases: () => void
) {
  const { toast } = useToast();
  const t = useTranslations('HarvestOrders.detail');
  const [phaseData, setPhaseData] = useState<PhaseFormData>({
    description: '',
    taxRate: 0,
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
    newDetails: CreateHarvestInvoiceDetailDto[],
    newPhaseNumber: number
  ) => {
    setPhaseData({
      description: '',
      taxRate: 0,
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
      await createHarvestPhase({
        description:
          phaseData.description ||
          `${t('phases.phase')} ${phaseData.phaseNumber}`,
        phaseNumber: phaseData.phaseNumber,
        harvestSchedule: { id: schedule.id },
        harvestInvoice: {
          totalAmount,
          taxRate: phaseData.taxRate
        },
        harvestInvoiceDetails: validDetails
      });

      setShowPhaseDialog(false);
      // Reset phase form
      const newDetails: CreateHarvestInvoiceDetailDto[] =
        schedule.harvestDetails!.map((detail) => ({
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
