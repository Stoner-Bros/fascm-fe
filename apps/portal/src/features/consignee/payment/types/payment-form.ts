export type PaymentFormData = {
  amount: number;
  paymentMethod: 'bank_transfer' | 'cash';
};

export type PaymentFormErrors = {
  amount?: string;
};
