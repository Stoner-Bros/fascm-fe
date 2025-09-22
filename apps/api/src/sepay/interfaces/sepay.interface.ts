export interface SePayQrRequest {
  amount: number; // Số tiền
  description: string; // Nội dung chuyển khoản
}

export interface SePayQrResponse {
  qrUrl: string; // URL của QR code
}

export interface SePayWebhookPayload {
  id: number; // ID giao dịch trên SePay
  gateway: string; // Brand name của ngân hàng
  transactionDate: string; // Thời gian xảy ra giao dịch phía ngân hàng
  accountNumber: string; // Số tài khoản ngân hàng
  code: string | null; // Mã code thanh toán
  content: string; // Nội dung chuyển khoản
  transferType: 'in' | 'out'; // Loại giao dịch. in là tiền vào, out là tiền ra
  transferAmount: number; // Số tiền giao dịch
  accumulated: number; // Số dư tài khoản (lũy kế)
  subAccount: string | null; // Tài khoản ngân hàng phụ (tài khoản định danh)
  referenceCode: string; // Mã tham chiếu của tin nhắn sms
  description: string; // Toàn bộ nội dung tin nhắn sms
}

export interface SePayWebhookResponse {
  success: boolean;
  message?: string;
}
