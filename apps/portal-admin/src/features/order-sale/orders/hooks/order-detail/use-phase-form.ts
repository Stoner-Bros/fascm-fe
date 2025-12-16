import { useToast } from '@/components/ui/use-toast';
import { createOrderPhase } from '@/services/order-phase.service';
import type {
  CreateOrderInvoiceDetailDto,
  OrderPhase,
  OrderSchedule
} from '@/types/order';
import type { OrderDetail } from '@/types/order-detail';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export interface PhaseFormData {
  description: string;
  taxRate: number;
  phaseNumber: number;
  invoiceDetails: CreateOrderInvoiceDetailDto[];
  selectedSelections: Record<string, string[]>; // productId -> selectionIds[]
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
    invoiceDetails: initialDetails,
    selectedSelections: {}
  });
  const [loading, setLoading] = useState(false);

  const updatePhaseData = (updates: Partial<PhaseFormData>) => {
    setPhaseData((prev) => ({ ...prev, ...updates }));
  };

  const toggleSelection = (
    productId: string,
    selectionId: string,
    orderDetail: OrderDetail
  ) => {
    setPhaseData((prev) => {
      const currentSelections = prev.selectedSelections[productId] || [];
      const isSelected = currentSelections.includes(selectionId);

      let newSelections: string[];
      if (isSelected) {
        newSelections = currentSelections.filter((id) => id !== selectionId);
      } else {
        newSelections = [...currentSelections, selectionId];
      }

      // Calculate quantity as sum of selected selections
      const selectedSelections =
        orderDetail.orderDetailSelections?.filter((sel) =>
          newSelections.includes(sel.id)
        ) || [];
      const totalQuantity = selectedSelections.reduce(
        (sum, sel) => sum + (sel.quantity || 0),
        0
      );

      // Get unit from first selected selection or orderDetail
      const unit = selectedSelections[0]?.unit || orderDetail.unit || null;

      // Update invoice details
      const updatedDetails = prev.invoiceDetails.map((detail) => {
        if (detail.product.id === productId) {
          return {
            ...detail,
            quantity: totalQuantity,
            selectionIds: newSelections.length > 0 ? newSelections : null,
            unit: unit || detail.unit
          };
        }
        return detail;
      });

      return {
        ...prev,
        selectedSelections: {
          ...prev.selectedSelections,
          [productId]: newSelections
        },
        invoiceDetails: updatedDetails
      };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    // This method is kept for backward compatibility but may not be used
    // when using selection-based approach
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
      invoiceDetails: newDetails,
      selectedSelections: {}
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

    // Calculate total amount with tax from selected selections
    let subtotal = 0;
    schedule.orderDetails?.forEach((orderDetail) => {
      const detail = validDetails.find(
        (d) => d.product.id === orderDetail.product?.id
      );
      if (detail && detail.selectionIds && detail.selectionIds.length > 0) {
        const selectedSelections =
          orderDetail.orderDetailSelections?.filter((sel) =>
            detail.selectionIds!.includes(sel.id)
          ) || [];
        selectedSelections.forEach((sel) => {
          subtotal += (sel.quantity || 0) * (sel.unitPrice || 0);
        });
      }
    });
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
          product: { id: detail.product!.id || null },
          quantity: 0,
          unit: detail.unit || null,
          selectionIds: null
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
    toggleSelection,
    reset,
    handleCreatePhase,
    loading
  };
}
