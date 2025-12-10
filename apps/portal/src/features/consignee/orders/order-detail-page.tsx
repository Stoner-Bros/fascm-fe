'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { useToast } from '@/hooks/use-toast';
import { fetchOrderPhasesBySchedule } from '@/services/order-phases.service';
import { fetchOrderScheduleById } from '@/services/order-schedule.service';
import { createPayment } from '@/services/payment.service';
import type {
  OrderPhase,
  OrderPhaseStatus,
  OrderSchedule,
  OrderScheduleStatus
} from '@/types/order';
import type { Payment } from '@/types/payment';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconClock,
  IconCreditCard,
  IconEdit,
  IconExternalLink,
  IconFileInvoice,
  IconLoader2,
  IconMapPin,
  IconPackage,
  IconTruck,
  IconX
} from '@tabler/icons-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

const getStatusIcon = (status: OrderScheduleStatus) => {
  switch (status) {
    case 'pending':
      return <IconClock className='h-4 w-4' />;
    case 'approved':
      return <IconCheck className='h-4 w-4' />;
    case 'processing':
      return <IconTruck className='h-4 w-4' />;
    case 'completed':
      return <IconCheck className='h-4 w-4' />;
    case 'rejected':
      return <IconX className='h-4 w-4' />;
    case 'canceled':
      return <IconX className='h-4 w-4' />;
    default:
      return <IconPackage className='h-4 w-4' />;
  }
};

const getStatusLabel = (status: OrderScheduleStatus) => {
  switch (status) {
    case 'pending':
      return 'Chờ duyệt đơn';
    case 'rejected':
      return 'Đã từ chối đơn';
    case 'approved':
      return 'Đã duyệt đơn';
    case 'processing':
      return 'Đang xử lý';
    case 'completed':
      return 'Đã hoàn thành';
    case 'canceled':
      return 'Đã hủy đơn';
    default:
      return status || 'Unknown';
  }
};

const getPhaseStatusIcon = (status?: OrderPhaseStatus | null) => {
  if (!status) return <IconClock className='h-4 w-4' />;
  switch (status) {
    case 'preparing':
      return <IconPackage className='h-4 w-4' />;
    case 'delivering':
      return <IconTruck className='h-4 w-4' />;
    case 'delivered':
      return <IconCheck className='h-4 w-4' />;
    case 'completed':
      return <IconCheck className='h-4 w-4' />;
    case 'canceled':
      return <IconX className='h-4 w-4' />;
    default:
      return <IconClock className='h-4 w-4' />;
  }
};

const getPhaseStatusVariant = (
  status?: OrderPhaseStatus | null
): 'outline' | 'default' | 'secondary' | 'destructive' => {
  if (!status) return 'outline';
  switch (status) {
    case 'preparing':
      return 'secondary';
    case 'delivering':
      return 'default';
    case 'delivered':
      return 'default';
    case 'completed':
      return 'default';
    case 'canceled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getPhaseStatusLabel = (status?: OrderPhaseStatus | null) => {
  if (!status) return 'Chưa bắt đầu';
  switch (status) {
    case 'preparing':
      return 'Đang chuẩn bị';
    case 'delivering':
      return 'Đang giao hàng';
    case 'delivered':
      return 'Đã giao hàng';
    case 'completed':
      return 'Hoàn thành';
    case 'canceled':
      return 'Đã hủy';
    default:
      return status || 'Unknown';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [orderSchedule, setOrderSchedule] = useState<OrderSchedule | null>(
    null
  );
  const [orderPhases, setOrderPhases] = useState<OrderPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [phasesLoading, setPhasesLoading] = useState(true);

  // Payment state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  const orderId = params?.id as string;

  // Real-time payment status tracking
  usePaymentStatus({
    paymentCode: currentPayment?.paymentCode || null,
    onPaymentSuccess: () => {
      toast({
        title: 'Payment successful!',
        description: 'Your payment has been completed successfully',
        variant: 'default'
      });
      handleClosePaymentDialog();
      loadOrderPhases(); // Reload to get updated status
    },
    onPaymentCanceled: () => {
      toast({
        title: 'Payment canceled',
        description: 'The payment has been canceled',
        variant: 'destructive'
      });
      handleClosePaymentDialog();
    }
  });

  const loadOrderDetail = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const data = await fetchOrderScheduleById(orderId);
      setOrderSchedule(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load order details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrderPhases = async () => {
    if (!orderId) return;

    setPhasesLoading(true);
    try {
      const response = await fetchOrderPhasesBySchedule(orderId, {
        page: 1,
        limit: 50
      });
      setOrderPhases(response.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load order phases',
        variant: 'destructive'
      });
    } finally {
      setPhasesLoading(false);
    }
  };

  // Handle payment creation
  const handleCreatePayment = async (invoiceId: string) => {
    setCreatingPayment(true);
    try {
      const payment = await createPayment({
        orderInvoiceId: invoiceId,
        paymentMethod: 'transfer' // Online payment via PayOS
      });

      setCurrentPayment(payment);

      // Generate QR code image from QR code string (if available)
      if (payment.qrCode) {
        try {
          // The backend returns a QR code string, we need to generate an image from it
          const qrDataUrl = await QRCode.toDataURL(payment.qrCode, {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'M'
          });
          setQrCodeDataUrl(qrDataUrl);
        } catch (qrError) {
          // Failed to generate QR code image
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error('Failed to generate QR code image:', qrError);
          }
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setCreatingPayment(false);
    }
  };

  const handleOpenPaymentDialog = (invoiceId: string) => {
    setPaymentDialogOpen(true);
    handleCreatePayment(invoiceId);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setCurrentPayment(null);
    setQrCodeDataUrl(null);
  };

  useEffect(() => {
    loadOrderDetail();
    loadOrderPhases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col items-center justify-center py-12'>
          <div className='border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
          <p className='text-muted-foreground'>Loading order details...</p>
        </div>
      </PageContainer>
    );
  }

  if (!orderSchedule) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col items-center justify-center py-12'>
          <IconPackage className='text-muted-foreground mb-4 h-16 w-16' />
          <p className='text-muted-foreground'>Order not found</p>
          <Button
            variant='outline'
            onClick={() => router.push('/consignee/orders')}
            className='mt-4'
          >
            <IconArrowLeft className='mr-2 h-4 w-4' />
            Back to Orders
          </Button>
        </div>
      </PageContainer>
    );
  }

  const totalAmount =
    orderSchedule.orderDetails?.reduce(
      (sum, detail) => sum + (detail.amount || 0),
      0
    ) || 0;

  const totalQuantity =
    orderSchedule.orderDetails?.reduce(
      (sum, detail) => sum + (detail.quantity || 0),
      0
    ) || 0;

  // Order status stepper steps
  const getOrderSteps = () => {
    const steps = [
      { key: 'pending', label: 'Chờ duyệt', icon: IconClock },
      { key: 'approved', label: 'Đã duyệt', icon: IconCheck },
      { key: 'processing', label: 'Đang xử lý', icon: IconTruck },
      { key: 'completed', label: 'Hoàn thành', icon: IconCheck }
    ];

    const currentStatus = orderSchedule.status as OrderScheduleStatus;
    let currentStepIndex = 0;

    if (currentStatus === 'pending') currentStepIndex = 0;
    else if (currentStatus === 'approved') currentStepIndex = 1;
    else if (currentStatus === 'processing') currentStepIndex = 2;
    else if (currentStatus === 'completed') currentStepIndex = 3;
    else if (currentStatus === 'rejected' || currentStatus === 'canceled')
      currentStepIndex = -1; // Special case

    return { steps, currentStepIndex };
  };

  const { steps, currentStepIndex } = getOrderSteps();

  return (
    <PageContainer>
      <div className='w-full flex-1 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => router.push('/consignee/orders')}
              >
                <IconArrowLeft className='h-5 w-5' />
              </Button>
              <div>
                <h2 className='text-3xl font-bold tracking-tight'>
                  Order Details
                </h2>
                <p className='text-muted-foreground'>
                  Order ID: {orderSchedule.id}
                </p>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {orderSchedule.status === 'pending' && (
              <Button
                variant='outline'
                onClick={() =>
                  router.push(`/consignee/orders/${orderSchedule.id}/edit`)
                }
              >
                <IconEdit className='mr-2 h-4 w-4' />
                Edit Order
              </Button>
            )}
          </div>
        </div>

        {/* Order Status Stepper */}
        <Card>
          <CardContent>
            {orderSchedule.status === 'rejected' ||
            orderSchedule.status === 'canceled' ? (
              <div className='flex items-center justify-center gap-3 p-4'>
                <Badge
                  variant='destructive'
                  className='flex items-center gap-2 px-4 py-2 text-base'
                >
                  {getStatusIcon(orderSchedule.status as OrderScheduleStatus)}
                  {getStatusLabel(orderSchedule.status as OrderScheduleStatus)}
                </Badge>
                {orderSchedule.reason && (
                  <p className='text-muted-foreground text-sm'>
                    - {orderSchedule.reason}
                  </p>
                )}
              </div>
            ) : (
              <div className='flex items-center justify-between'>
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isLast = index === steps.length - 1;

                  return (
                    <div key={step.key} className='flex flex-1 items-center'>
                      <div className='flex flex-col items-center'>
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
                            isCompleted || isCurrent
                              ? 'border-primary bg-primary text-white'
                              : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                          }`}
                        >
                          <StepIcon className='h-6 w-6' />
                        </div>
                        <p
                          className={`mt-2 text-sm font-medium ${
                            isCompleted || isCurrent
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                      {!isLast && (
                        <div
                          className={`mx-2 h-[2px] flex-1 transition-colors ${
                            isCompleted
                              ? 'bg-primary'
                              : 'bg-muted-foreground/30'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue='overview' className='w-full'>
          <TabsList className='gap-1'>
            <TabsTrigger
              value='overview'
              className='hover:border-primary flex cursor-pointer items-center gap-2 hover:bg-transparent'
            >
              <IconPackage className='h-4 w-4' />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value='phases'
              className='hover:border-primary flex cursor-pointer items-center gap-2 hover:bg-transparent'
            >
              <IconTruck className='h-4 w-4' />
              Delivery Phases
              {orderPhases.length > 0 && (
                <Badge variant='secondary' className='ml-1'>
                  {orderPhases.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='mt-6'>
            <div className='grid grid-cols-1 gap-6'>
              {/* Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <IconPackage className='h-5 w-5' />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Order Information Section */}
                  <div>
                    <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
                      <IconPackage className='h-4 w-4' />
                      Order Details
                    </h3>
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                      <div>
                        <p className='text-muted-foreground mb-1 text-xs'>
                          Order Number
                        </p>
                        <p className='font-medium'>
                          {orderSchedule.order?.orderNumber || orderSchedule.id}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground mb-1 text-xs'>
                          Total Quantity
                        </p>
                        <p className='font-medium'>
                          {totalQuantity} {orderSchedule.order?.unit || 'kg'}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground mb-1 text-xs'>
                          Created At
                        </p>
                        <p className='text-sm font-medium'>
                          {formatDate(orderSchedule.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Consignee Information Section */}
                  <div>
                    <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
                      <IconBuilding className='h-4 w-4' />
                      Consignee Information
                    </h3>
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                      <div>
                        <p className='text-muted-foreground mb-1 text-xs'>
                          Organization
                        </p>
                        <p className='font-medium'>
                          {orderSchedule.consignee?.organizationName || '-'}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground mb-1 text-xs'>
                          Representative
                        </p>
                        <p className='font-medium'>
                          {orderSchedule.consignee?.representativeName || '-'}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground mb-1 text-xs'>
                          Contact
                        </p>
                        <p className='font-medium'>
                          {orderSchedule.consignee?.contact || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Delivery Information Section */}
                  <div>
                    <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
                      <IconTruck className='h-4 w-4' />
                      Delivery Information
                    </h3>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <div>
                        <p className='text-muted-foreground mb-1 flex items-center gap-1 text-xs'>
                          <IconCalendar className='h-3 w-3' />
                          Delivery Date
                        </p>
                        <p className='font-medium'>
                          {orderSchedule.deliveryDate
                            ? formatDate(orderSchedule.deliveryDate)
                            : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground mb-1 flex items-center gap-1 text-xs'>
                          <IconMapPin className='h-3 w-3' />
                          Delivery Address
                        </p>
                        <p className='text-sm font-medium'>
                          {orderSchedule.address || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    {orderSchedule.description && (
                      <div className='mt-3'>
                        <p className='text-muted-foreground mb-1 text-xs'>
                          Description / Notes
                        </p>
                        <p className='bg-muted/50 rounded-md border p-3 text-sm'>
                          {orderSchedule.description}
                        </p>
                      </div>
                    )}
                    {orderSchedule.reason &&
                      orderSchedule.status === 'rejected' && (
                        <div className='mt-3'>
                          <p className='text-destructive mb-1 text-xs font-semibold'>
                            Rejection Reason
                          </p>
                          <p className='border-destructive bg-destructive/10 rounded-md border p-3 text-sm'>
                            {orderSchedule.reason}
                          </p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>
                    {orderSchedule.orderDetails?.length || 0} item(s) in this
                    order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {orderSchedule.orderDetails?.map((detail) => (
                      <div
                        key={detail.id}
                        className='flex items-center gap-4 rounded-lg border p-4'
                      >
                        <div className='relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100'>
                          {detail.product?.image ? (
                            <Image
                              src={detail.product.image}
                              alt={detail.product?.name || 'Product'}
                              fill
                              className='object-cover'
                            />
                          ) : (
                            <div className='flex h-full w-full items-center justify-center'>
                              <IconPackage className='text-muted-foreground h-8 w-8' />
                            </div>
                          )}
                        </div>
                        <div className='flex-1'>
                          <h4 className='font-semibold'>
                            {detail.product?.name || 'Unknown Product'}
                          </h4>
                          <p className='text-muted-foreground text-sm'>
                            Product ID: {detail.product?.id || '-'}
                          </p>
                          <div className='mt-2 flex items-center gap-4 text-sm'>
                            <span>
                              Quantity: <strong>{detail.quantity}</strong>{' '}
                              {detail.unit}
                            </span>
                            <span>
                              Unit Price:{' '}
                              <strong>
                                {formatCurrency(detail.unitPrice || 0)}
                              </strong>
                            </span>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='text-muted-foreground text-sm'>
                            Amount
                          </p>
                          <p className='text-lg font-bold'>
                            {formatCurrency(detail.amount || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className='my-4' />

                  <div className='flex justify-end'>
                    <div className='space-y-2'>
                      <div className='flex justify-between gap-8'>
                        <span className='text-muted-foreground'>Subtotal:</span>
                        <span className='font-medium'>
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                      <div className='flex justify-between gap-8'>
                        <span className='text-lg font-bold'>Total:</span>
                        <span className='text-lg font-bold'>
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Delivery Phases Tab */}
          <TabsContent value='phases' className='mt-6'>
            <div className='space-y-6'>
              {phasesLoading ? (
                <Card>
                  <CardContent className='py-12'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
                      <p className='text-muted-foreground'>Loading phases...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : orderPhases.length === 0 ? (
                <Card>
                  <CardContent className='py-12'>
                    <div className='flex flex-col items-center justify-center'>
                      <IconPackage className='text-muted-foreground mb-4 h-16 w-16' />
                      <p className='text-muted-foreground text-lg font-medium'>
                        No delivery phases yet
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        Delivery phases will appear here once created
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                orderPhases.map((phase) => (
                  <Card key={phase.id}>
                    <CardHeader>
                      <div className='flex items-center justify-between'>
                        <CardTitle className='flex items-center gap-2'>
                          {getPhaseStatusIcon(phase.status)}
                          Phase {phase.phaseNumber}
                        </CardTitle>
                        <Badge
                          variant={getPhaseStatusVariant(phase.status)}
                          className='flex items-center gap-1'
                        >
                          {getPhaseStatusIcon(phase.status)}
                          {getPhaseStatusLabel(phase.status)}
                        </Badge>
                      </div>
                      {phase.description && (
                        <CardDescription>{phase.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      {/* Invoice Details (Products) */}
                      {phase.orderInvoiceDetails &&
                        phase.orderInvoiceDetails.length > 0 && (
                          <div className='space-y-3'>
                            <h5 className='flex items-center gap-2 font-semibold'>
                              <IconPackage className='h-4 w-4' />
                              Items in this phase
                            </h5>
                            <div className='grid gap-3'>
                              {phase.orderInvoiceDetails.map((detail) => (
                                <div
                                  key={detail.id}
                                  className='bg-card flex items-center gap-4 rounded-lg border p-4'
                                >
                                  <div className='relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100'>
                                    {detail.product?.image ? (
                                      <Image
                                        src={detail.product.image}
                                        alt={detail.product?.name || 'Product'}
                                        fill
                                        className='object-cover'
                                      />
                                    ) : (
                                      <div className='flex h-full w-full items-center justify-center'>
                                        <IconPackage className='text-muted-foreground h-8 w-8' />
                                      </div>
                                    )}
                                  </div>
                                  <div className='min-w-0 flex-1'>
                                    <h6 className='text-base font-semibold'>
                                      {detail.product?.name ||
                                        'Unknown Product'}
                                    </h6>
                                    <p className='text-muted-foreground text-sm'>
                                      Product ID: {detail.product?.id || '-'}
                                    </p>
                                    <div className='mt-2 flex items-center gap-4 text-sm'>
                                      <span className='text-muted-foreground'>
                                        Quantity:{' '}
                                        <strong className='text-foreground'>
                                          {detail.quantity}
                                        </strong>{' '}
                                        {detail.unit}
                                      </span>
                                      <span className='text-muted-foreground'>
                                        ×
                                      </span>
                                      <span className='text-muted-foreground'>
                                        Unit Price:{' '}
                                        <strong className='text-foreground'>
                                          {formatCurrency(
                                            detail.unitPrice || 0
                                          )}
                                        </strong>
                                      </span>
                                    </div>
                                  </div>
                                  <div className='text-right'>
                                    <p className='text-muted-foreground mb-1 text-xs'>
                                      Amount
                                    </p>
                                    <p className='text-xl font-bold'>
                                      {formatCurrency(detail.amount || 0)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Invoice Information - Highlighted */}
                      {phase.orderInvoice && (
                        <div className='border-primary/30 from-primary/5 to-primary/10 space-y-4 rounded-lg border-2 bg-gradient-to-br p-6 shadow-md'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2 text-lg font-bold'>
                              <IconFileInvoice className='text-primary h-6 w-6' />
                              <span className='text-primary'>
                                Invoice Information
                              </span>
                              {/* Payment Status Badge */}
                              {phase.orderInvoice.payment?.status === 'paid' ? (
                                <Badge className='flex items-center gap-1 bg-green-500 text-white'>
                                  <IconCheck className='h-4 w-4' />
                                  Đã thanh toán
                                </Badge>
                              ) : (
                                <Badge
                                  variant='outline'
                                  className='flex items-center gap-1 border-orange-500 text-orange-500'
                                >
                                  <IconClock className='h-4 w-4' />
                                  Chưa thanh toán
                                </Badge>
                              )}
                            </div>

                            <div className='flex items-center gap-2'>
                              {/* Payment Button - Show if payment exists and is pending */}
                              {(phase.orderInvoice?.payment === null ||
                                (phase.orderInvoice?.payment !== null &&
                                  phase.orderInvoice.payment?.status ===
                                    'pending')) && (
                                <Button
                                  onClick={() =>
                                    handleOpenPaymentDialog(
                                      phase.orderInvoice.id
                                    )
                                  }
                                  className='flex items-center gap-2'
                                  size='lg'
                                >
                                  <IconCreditCard className='h-5 w-5' />
                                  Thanh toán online
                                </Button>
                              )}
                            </div>
                          </div>
                          <Separator className='bg-primary/20' />
                          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                            <div>
                              <p className='text-muted-foreground mb-1 text-xs'>
                                Total Amount
                              </p>
                              <p className='text-base font-semibold'>
                                {formatCurrency(
                                  phase.orderInvoice.totalAmount || 0
                                )}
                              </p>
                            </div>
                            <div>
                              <p className='text-muted-foreground mb-1 text-xs'>
                                VAT ({phase.orderInvoice.taxRate || 0}%)
                              </p>
                              <p className='text-base font-semibold'>
                                {formatCurrency(
                                  phase.orderInvoice.vatAmount || 0
                                )}
                              </p>
                            </div>
                            <div className='col-span-2 md:col-span-1'>
                              <p className='text-muted-foreground mb-1 text-xs'>
                                Total Payment
                              </p>
                              <p className='text-primary text-2xl font-bold'>
                                {formatCurrency(
                                  phase.orderInvoice.totalPayment || 0
                                )}
                              </p>
                            </div>
                            <div>
                              <p className='text-muted-foreground mb-1 text-xs'>
                                Quantity
                              </p>
                              <p className='text-base font-semibold'>
                                {phase.orderInvoice.quantity}{' '}
                                {phase.orderInvoice.unit || 'kg'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Image Proofs */}
                      {phase.imageProof && phase.imageProof.length > 0 && (
                        <div className='space-y-3'>
                          <h5 className='font-semibold'>Image Proofs</h5>
                          <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'>
                            {phase.imageProof.map((img) => (
                              <div
                                key={img.id}
                                className='bg-muted relative aspect-square overflow-hidden rounded-md border'
                              >
                                {img.path && (
                                  <Image
                                    src={img.path}
                                    alt='Proof'
                                    fill
                                    className='object-cover transition-transform hover:scale-105'
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Phase Dates */}
                      <div className='text-muted-foreground flex items-center justify-between border-t pt-4 text-sm'>
                        <div>
                          <span>Created: </span>
                          <span className='text-foreground font-medium'>
                            {formatDate(phase.createdAt)}
                          </span>
                        </div>
                        <div>
                          <span>Updated: </span>
                          <span className='text-foreground font-medium'>
                            {formatDate(phase.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className='max-h-[90vh] !max-w-4xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <IconCreditCard className='h-6 w-6' />
              Online Payment
            </DialogTitle>
            <DialogDescription>
              Complete your payment using bank transfer via PayOS
            </DialogDescription>
          </DialogHeader>

          <div className='w-full space-y-6 py-4'>
            {creatingPayment ? (
              <div className='flex flex-col items-center justify-center py-12'>
                <IconLoader2 className='text-primary mb-4 h-12 w-12 animate-spin' />
                <p className='text-muted-foreground text-lg'>
                  Creating payment...
                </p>
              </div>
            ) : currentPayment ? (
              <div className='grid grid-cols-12 gap-6'>
                {/* QR Code */}
                {qrCodeDataUrl && (
                  <Card className='col-span-4'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-base'>Scan QR Code</CardTitle>
                      <CardDescription>Use your banking app</CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col items-center'>
                      <div className='border-primary/20 rounded-lg border-2 bg-white p-4 shadow-sm'>
                        <Image
                          src={qrCodeDataUrl}
                          alt='Payment QR Code'
                          width={250}
                          height={250}
                          className='rounded-md'
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className='col-span-8 space-y-6'>
                  {/* Payment Details Card */}
                  <Card>
                    <CardHeader className='pb-3'>
                      <CardTitle className='flex items-center gap-2 text-lg'>
                        <IconFileInvoice className='h-5 w-5' />
                        Payment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <p className='text-muted-foreground mb-1 text-xs'>
                            Payment Code
                          </p>
                          <p className='bg-muted rounded px-2 py-1 font-mono text-sm font-semibold'>
                            {currentPayment.paymentCode}
                          </p>
                        </div>
                        <div>
                          <p className='text-muted-foreground mb-1 text-xs'>
                            Amount
                          </p>
                          <p className='text-primary text-xl font-bold'>
                            {formatCurrency(currentPayment.amount || 0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Instructions */}
                  <Card>
                    <CardHeader className='pb-3'>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <IconAlertCircle className='h-5 w-5 text-blue-600' />
                        How to Pay
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <ol className='space-y-3 text-sm'>
                        <li className='flex gap-3'>
                          <span className='bg-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white'>
                            1
                          </span>
                          <span className='flex-1'>
                            {qrCodeDataUrl
                              ? 'Scan the QR code with your banking app'
                              : 'Click the button below to open payment page'}
                          </span>
                        </li>
                        {currentPayment.checkoutUrl && (
                          <li className='flex gap-3'>
                            <span className='bg-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white'>
                              2
                            </span>
                            <span className='flex-1'>
                              Or use the payment page link to pay online
                            </span>
                          </li>
                        )}
                        <li className='flex gap-3'>
                          <span className='bg-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white'>
                            {currentPayment.checkoutUrl && qrCodeDataUrl
                              ? '3'
                              : '2'}
                          </span>
                          <span className='flex-1'>
                            Complete the payment in your banking app
                          </span>
                        </li>
                        <li className='flex gap-3'>
                          <span className='bg-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white'>
                            {currentPayment.checkoutUrl && qrCodeDataUrl
                              ? '4'
                              : '3'}
                          </span>
                          <span className='flex-1'>
                            Wait for confirmation - status updates automatically
                          </span>
                        </li>
                      </ol>

                      {/* Checkout URL Button */}
                      {currentPayment.checkoutUrl && (
                        <Button
                          onClick={() => {
                            if (currentPayment.checkoutUrl) {
                              window.open(currentPayment.checkoutUrl, '_blank');
                            }
                          }}
                          className='flex w-full items-center justify-center gap-2'
                          size='lg'
                        >
                          <IconExternalLink className='h-5 w-5' />
                          Open Payment Page
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-12'>
                <p className='text-muted-foreground'>
                  Failed to create payment. Please try again.
                </p>
                <Button
                  onClick={handleClosePaymentDialog}
                  variant='outline'
                  className='mt-4'
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
