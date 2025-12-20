export function validatePaymentAmount(
  amount: number,
  maxAmount: number
): string | undefined {
  if (!amount || amount <= 0) {
    return 'Số tiền phải lớn hơn 0';
  }
  if (amount > maxAmount) {
    return `Số tiền không được vượt quá ${maxAmount.toLocaleString('vi-VN')} ₫`;
  }
  return undefined;
}

export type PaymentFormData = {
  amount: number;
  paymentMethod: 'bank_transfer' | 'cash';
};

export type PaymentFormErrors = {
  amount?: string;
};

export function validatePaymentForm(
  data: PaymentFormData,
  maxAmount: number
): PaymentFormErrors {
  const errors: PaymentFormErrors = {};

  const amountError = validatePaymentAmount(data.amount, maxAmount);
  if (amountError) {
    errors.amount = amountError;
  }

  return errors;
}
