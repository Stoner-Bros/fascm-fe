'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  CreditCard,
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  Building,
  Calendar,
  DollarSign
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  supplierName: string;
  description: string;
  documents: Array<{
    type: 'invoice' | 'receipt' | 'contract';
    name: string;
    url: string;
    uploadDate: string;
  }>;
}

const mockPayments: PaymentRecord[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    invoiceNumber: 'INV-2024-001',
    amount: 2500000,
    status: 'paid',
    dueDate: '2024-01-25',
    paidDate: '2024-01-23',
    paymentMethod: 'Chuyển khoản ngân hàng',
    supplierName: 'Nông trường Đồng Tâm',
    description: 'Thanh toán đơn hàng gạo ST25 và rau củ',
    documents: [
      {
        type: 'invoice',
        name: 'Hóa đơn INV-2024-001.pdf',
        url: '#',
        uploadDate: '2024-01-20'
      },
      {
        type: 'receipt',
        name: 'Biên lai thanh toán.pdf',
        url: '#',
        uploadDate: '2024-01-23'
      }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    invoiceNumber: 'INV-2024-002',
    amount: 1800000,
    status: 'pending',
    dueDate: '2024-01-30',
    supplierName: 'Hợp tác xã Xanh',
    description: 'Thanh toán đơn hàng dưa chuột và ớt chuông',
    documents: [
      {
        type: 'invoice',
        name: 'Hóa đơn INV-2024-002.pdf',
        url: '#',
        uploadDate: '2024-01-25'
      }
    ]
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    invoiceNumber: 'INV-2024-003',
    amount: 3200000,
    status: 'overdue',
    dueDate: '2024-01-20',
    supplierName: 'Trang trại Organic',
    description: 'Thanh toán đơn hàng rau củ organic',
    documents: [
      {
        type: 'invoice',
        name: 'Hóa đơn INV-2024-003.pdf',
        url: '#',
        uploadDate: '2024-01-18'
      }
    ]
  }
];

export function PaymentPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>(mockPayments);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [activeTab, setActiveTab] = useState('payments');

  const getStatusBadge = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant='secondary' className='flex items-center gap-1'>
            <Clock className='h-3 w-3' />
            Chờ thanh toán
          </Badge>
        );
      case 'paid':
        return (
          <Badge
            variant='default'
            className='flex items-center gap-1 bg-green-100 text-green-800'
          >
            <CheckCircle className='h-3 w-3' />
            Đã thanh toán
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant='destructive' className='flex items-center gap-1'>
            <AlertCircle className='h-3 w-3' />
            Quá hạn
          </Badge>
        );
      case 'cancelled':
        return <Badge variant='outline'>Đã hủy</Badge>;
      default:
        return <Badge variant='outline'>Không xác định</Badge>;
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <FileText className='h-4 w-4' />;
      case 'receipt':
        return <Receipt className='h-4 w-4' />;
      case 'contract':
        return <Building className='h-4 w-4' />;
      default:
        return <FileText className='h-4 w-4' />;
    }
  };

  const processPayment = () => {
    if (!selectedPayment || !paymentMethod || !paymentReference) {
      alert('Vui lòng điền đầy đủ thông tin thanh toán');
      return;
    }

    // Simulate payment processing
    const updatedPayments = payments.map((payment) =>
      payment.id === selectedPayment.id
        ? {
            ...payment,
            status: 'paid' as const,
            paidDate: new Date().toISOString().split('T')[0],
            paymentMethod: paymentMethod
          }
        : payment
    );

    setPayments(updatedPayments);
    setSelectedPayment(null);
    setPaymentMethod('');
    setPaymentReference('');
    alert('Thanh toán thành công!');
  };

  const getTotalStats = () => {
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const paid = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);
    const pending = payments
      .filter((p) => p.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
    const overdue = payments
      .filter((p) => p.status === 'overdue')
      .reduce((sum, payment) => sum + payment.amount, 0);

    return { total, paid, pending, overdue };
  };

  const stats = getTotalStats();

  return (
    <div className='flex-1 space-y-6 p-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Thanh toán & Tài liệu
        </h1>
        <p className='text-muted-foreground'>
          Quản lý thanh toán và tài liệu liên quan đến đơn hàng
        </p>
      </div>

      {/* Payment Statistics */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <DollarSign className='text-muted-foreground h-4 w-4' />
              <span className='text-sm font-medium'>Tổng cộng</span>
            </div>
            <p className='text-2xl font-bold'>
              {stats.total.toLocaleString('vi-VN')} VNĐ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-4 w-4 text-green-600' />
              <span className='text-sm font-medium'>Đã thanh toán</span>
            </div>
            <p className='text-2xl font-bold text-green-600'>
              {stats.paid.toLocaleString('vi-VN')} VNĐ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-yellow-600' />
              <span className='text-sm font-medium'>Chờ thanh toán</span>
            </div>
            <p className='text-2xl font-bold text-yellow-600'>
              {stats.pending.toLocaleString('vi-VN')} VNĐ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-4 w-4 text-red-600' />
              <span className='text-sm font-medium'>Quá hạn</span>
            </div>
            <p className='text-2xl font-bold text-red-600'>
              {stats.overdue.toLocaleString('vi-VN')} VNĐ
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='payments'>Danh sách thanh toán</TabsTrigger>
          <TabsTrigger value='documents'>Tài liệu</TabsTrigger>
        </TabsList>

        <TabsContent value='payments' className='space-y-4'>
          {/* Payments List */}
          <div className='space-y-4'>
            {payments.map((payment) => (
              <Card
                key={payment.id}
                className='transition-shadow hover:shadow-md'
              >
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <CardTitle className='text-lg'>
                        {payment.invoiceNumber}
                      </CardTitle>
                      <CardDescription>
                        Đơn hàng: {payment.orderNumber} • {payment.supplierName}
                      </CardDescription>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <p className='text-sm'>{payment.description}</p>

                  <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
                    <div>
                      <p className='text-muted-foreground'>Số tiền</p>
                      <p className='text-lg font-medium'>
                        {payment.amount.toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                    <div>
                      <p className='text-muted-foreground'>Hạn thanh toán</p>
                      <p className='flex items-center gap-1 font-medium'>
                        <Calendar className='h-4 w-4' />
                        {new Date(payment.dueDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    {payment.paidDate && (
                      <div>
                        <p className='text-muted-foreground'>Ngày thanh toán</p>
                        <p className='font-medium text-green-600'>
                          {new Date(payment.paidDate).toLocaleDateString(
                            'vi-VN'
                          )}
                        </p>
                      </div>
                    )}
                    {payment.paymentMethod && (
                      <div>
                        <p className='text-muted-foreground'>Phương thức</p>
                        <p className='font-medium'>{payment.paymentMethod}</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className='flex items-center justify-between'>
                    <div className='flex gap-2'>
                      <Button variant='outline' size='sm'>
                        <Eye className='mr-2 h-4 w-4' />
                        Xem chi tiết
                      </Button>

                      {payment.documents.length > 0 && (
                        <Button variant='outline' size='sm'>
                          <Download className='mr-2 h-4 w-4' />
                          Tải tài liệu
                        </Button>
                      )}
                    </div>

                    {payment.status === 'pending' ||
                    payment.status === 'overdue' ? (
                      <Button
                        onClick={() => setSelectedPayment(payment)}
                        className={
                          payment.status === 'overdue'
                            ? 'bg-red-600 hover:bg-red-700'
                            : ''
                        }
                      >
                        <CreditCard className='mr-2 h-4 w-4' />
                        Thanh toán ngay
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='documents' className='space-y-4'>
          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu đã tải lên</CardTitle>
              <CardDescription>
                Tất cả hóa đơn, biên lai và tài liệu liên quan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {payments.flatMap((payment) =>
                  payment.documents.map((doc) => (
                    <div
                      key={`${payment.id}-${doc.name}`}
                      className='flex items-center justify-between rounded border p-3'
                    >
                      <div className='flex items-center gap-3'>
                        {getDocumentIcon(doc.type)}
                        <div>
                          <p className='font-medium'>{doc.name}</p>
                          <p className='text-muted-foreground text-sm'>
                            {payment.invoiceNumber} • Tải lên{' '}
                            {new Date(doc.uploadDate).toLocaleDateString(
                              'vi-VN'
                            )}
                          </p>
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <Button variant='outline' size='sm'>
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button variant='outline' size='sm'>
                          <Download className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      {selectedPayment && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle>Thanh toán hóa đơn</CardTitle>
              <CardDescription>
                {selectedPayment.invoiceNumber} -{' '}
                {selectedPayment.amount.toLocaleString('vi-VN')} VNĐ
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='paymentMethod'>Phương thức thanh toán</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn phương thức thanh toán' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='bank_transfer'>
                      Chuyển khoản ngân hàng
                    </SelectItem>
                    <SelectItem value='cash'>Tiền mặt</SelectItem>
                    <SelectItem value='credit_card'>Thẻ tín dụng</SelectItem>
                    <SelectItem value='e_wallet'>Ví điện tử</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='paymentReference'>Mã tham chiếu/Ghi chú</Label>
                <Input
                  id='paymentReference'
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder='Nhập mã giao dịch hoặc ghi chú'
                />
              </div>

              <Alert>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>
                  Vui lòng kiểm tra kỹ thông tin trước khi xác nhận thanh toán.
                </AlertDescription>
              </Alert>

              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setSelectedPayment(null)}
                  className='flex-1'
                >
                  Hủy
                </Button>
                <Button onClick={processPayment} className='flex-1'>
                  Xác nhận thanh toán
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
