import type { CreateOrderInvoiceDetailDto } from '@/types/order';
import { useState } from 'react';

export interface PhaseFormData {
  description: string;
  taxRate: number;
  phaseNumber: number;
  invoiceDetails: CreateOrderInvoiceDetailDto[];
}

export function usePhaseForm(
  initialDetails: CreateOrderInvoiceDetailDto[],
  nextPhaseNumber: number
) {
  const [phaseData, setPhaseData] = useState<PhaseFormData>({
    description: '',
    taxRate: 5,
    phaseNumber: nextPhaseNumber,
    invoiceDetails: initialDetails
  });

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

  return {
    phaseData,
    updatePhaseData,
    updateQuantity,
    reset
  };
}
