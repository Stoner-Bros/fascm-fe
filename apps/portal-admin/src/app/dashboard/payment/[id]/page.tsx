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
import { Separator } from '@/components/ui/separator';
import { PaymentHistoryTable } from '@/features/payment/components/payment-history-table';
import {
  formatDebtAmount,
  getDebtStatusColor,
  getDebtTypeLabel,
  getPartnerTypeLabel
} from '@/features/payment/utils/utils';
import { fetchDebtById, fetchPaymentsByDebtId } from '@/services/debt.service';
import type { Debt } from '@/types/debt';
import type { Payment } from '@/types/payment';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  Loader2,
  MapPin,
  Phone,
  User,
  Warehouse
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PaymentModal } from '@/features/payment/components/payment-modal';
import { useTranslations } from 'next-intl';

export default function DebtDetailPage() {
  const t = useTranslations('Payment.detail');
  const tStatus = useTranslations('Payment.status');
  const params = useParams();
  const router = useRouter();
  const debtId = params.id as string;
  const [debt, setDebt] = useState<Debt | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    async function loadDebt() {
      try {
        setLoading(true);
        const debtData = await fetchDebtById(debtId);
        setDebt(debtData);
        setError(null);
      } catch (err: any) {
        setError(err?.message ?? t('loadError'));
      } finally {
        setLoading(false);
      }
    }

    if (debtId) {
      loadDebt();
    }
  }, [debtId, t]);

  useEffect(() => {
    async function loadPayments() {
      try {
        const response = await fetchPaymentsByDebtId(debtId, { page, limit });
        setPayments(response.data);
        if (response.hasNextPage) {
          setPageCount((prev) => (page >= prev ? page + 1 : prev));
        } else {
          setPageCount(page);
        }
      } catch (err) {
        console.error(t('paymentLoadError'), err);
      }
    }

    if (debtId) {
      loadPayments();
    }
  }, [debtId, page, limit, t]);

  if (loading) {
    return (
      <PageContainer>
        <div className='flex min-h-[400px] flex-1 items-center justify-center'>
          <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
        </div>
      </PageContainer>
    );
  }

  if (error || !debt) {
    return (
      <PageContainer>
        <div className='flex-1 space-y-4'>
          <Button variant='ghost' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            {t('back')}
          </Button>
          <Card>
            <CardContent className='pt-6'>
              <p className='text-destructive'>{error || t('notFound')}</p>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const statusColors = getDebtStatusColor(debt.status);
  const remainingAmount = debt.remainingAmount || 0;
  const paidPercentage =
    debt.originalAmount && debt.originalAmount > 0
      ? Math.round(((debt.paidAmount || 0) / debt.originalAmount) * 100)
      : 0;

  return (
    <PageContainer>
      <div className='w-full flex-1 space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='flex items-start gap-4'>
            <Button variant='ghost' size='sm' onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              {t('back')}
            </Button>
            <div>
              <div className='flex items-center gap-3'>
                <h1 className='text-3xl font-bold tracking-tight'>
                  {t('title')}
                </h1>
                <Badge
                  variant='outline'
                  className={`${statusColors.bg} ${statusColors.text} ${statusColors.border} text-sm capitalize`}
                >
                  {tStatus(debt.status || 'unpaid')}
                </Badge>
              </div>
              <p className='text-muted-foreground mt-1'>
                {debt.partnerType === 'supplier' && debt.supplier
                  ? debt.supplier.gardenName
                  : debt.partnerType === 'consignee' && debt.consignee
                    ? debt.consignee.organizationName ||
                      `${debt.consignee.user?.firstName || ''} ${debt.consignee.user?.lastName || ''}`.trim() ||
                      'N/A'
                    : t('partner.unknown')}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Summary Card */}
        <Card className='border-2'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <DollarSign className='h-5 w-5' />
                {t('financial.title')}
              </CardTitle>
              {(debt.remainingAmount ?? 0) > 0 &&
                debt.partnerType !== 'consignee' &&
                (debt.partnerType === 'supplier' || debt.supplier) && (
                  <Button
                    onClick={() => setPaymentModalOpen(true)}
                    className='flex items-center gap-2'
                  >
                    <CreditCard className='h-4 w-4' />
                    {t('financial.payButton')}
                  </Button>
                )}
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6 md:grid-cols-3'>
              <div className='space-y-2'>
                <p className='text-muted-foreground text-sm font-medium'>
                  {t('financial.originalAmount')}
                </p>
                <p className='text-2xl font-bold'>
                  {formatDebtAmount(debt.originalAmount)}
                </p>
              </div>
              <div className='space-y-2'>
                <p className='text-muted-foreground text-sm font-medium'>
                  {t('financial.paidAmount', { percentage: paidPercentage })}
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {formatDebtAmount(debt.paidAmount)}
                </p>
                <div className='bg-muted h-2 w-full overflow-hidden rounded-full'>
                  <div
                    className='h-full bg-green-600 transition-all'
                    style={{ width: `${paidPercentage}%` }}
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <p className='text-muted-foreground text-sm font-medium'>
                  {t('financial.remainingAmount')}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    remainingAmount > 0
                      ? 'text-red-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  {formatDebtAmount(remainingAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debt Information */}
        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5' />
                {t('basic.title')}
              </CardTitle>
              <CardDescription>{t('basic.description')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-1'>
                <label className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                  {t('basic.debtId')}
                </label>
                <p className='font-mono text-sm'>{debt.id}</p>
              </div>
              <Separator />
              <div className='space-y-3'>
                <div className='space-y-1'>
                  <label className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                    {t('basic.partnerType')}
                  </label>
                  <div>
                    <Badge variant='outline' className='capitalize'>
                      {getPartnerTypeLabel(debt.partnerType)}
                    </Badge>
                  </div>
                </div>
                <div className='space-y-1'>
                  <label className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                    {t('basic.debtType')}
                  </label>
                  <div>
                    <Badge variant='outline' className='capitalize'>
                      {getDebtTypeLabel(debt.debtType)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partner Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                {debt.partnerType === 'supplier' ? (
                  <Building2 className='h-5 w-5' />
                ) : (
                  <User className='h-5 w-5' />
                )}
                {t('partner.title')}
              </CardTitle>
              <CardDescription>
                {debt.partnerType === 'supplier'
                  ? t('partner.supplierDescription')
                  : t('partner.consigneeDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {debt.partnerType === 'supplier' && debt.supplier ? (
                <>
                  <div className='space-y-1'>
                    <label className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                      {t('partner.gardenName')}
                    </label>
                    <p className='text-base font-semibold'>
                      {debt.supplier.gardenName}
                    </p>
                  </div>
                  <Separator />
                  <div className='space-y-1'>
                    <label className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                      {t('partner.representativeName')}
                    </label>
                    <p className='text-sm'>
                      {debt.supplier.representativeName}
                    </p>
                  </div>
                  {debt.supplier.warehouse && (
                    <>
                      <Separator />
                      <div className='space-y-1'>
                        <label className='text-muted-foreground flex items-center gap-1 text-xs font-medium tracking-wide uppercase'>
                          <Warehouse className='h-3 w-3' />
                          {t('partner.warehouse')}
                        </label>
                        <p className='text-sm font-medium'>
                          {debt.supplier.warehouse.name}
                        </p>
                        <p className='text-muted-foreground flex items-start gap-1 text-sm'>
                          <MapPin className='mt-0.5 h-3 w-3 shrink-0' />
                          {debt.supplier.warehouse.address}
                        </p>
                      </div>
                    </>
                  )}
                  {debt.supplier.contact && (
                    <>
                      <Separator />
                      <div className='space-y-1'>
                        <label className='text-muted-foreground flex items-center gap-1 text-xs font-medium tracking-wide uppercase'>
                          <Phone className='h-3 w-3' />
                          {t('partner.contact')}
                        </label>
                        <p className='text-sm'>{debt.supplier.contact}</p>
                      </div>
                    </>
                  )}
                </>
              ) : debt.partnerType === 'consignee' && debt.consignee ? (
                <>
                  <div className='space-y-1'>
                    <label className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                      {t('partner.organizationName')}
                    </label>
                    <p className='text-base font-semibold'>
                      {debt.consignee.organizationName ||
                        `${debt.consignee.user?.firstName || ''} ${debt.consignee.user?.lastName || ''}`.trim() ||
                        'N/A'}
                    </p>
                  </div>
                  {debt.consignee.representativeName && (
                    <>
                      <Separator />
                      <div className='space-y-1'>
                        <label className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                          {t('partner.representativeName')}
                        </label>
                        <p className='text-sm'>
                          {debt.consignee.representativeName}
                        </p>
                      </div>
                    </>
                  )}
                  {debt.consignee.address && (
                    <>
                      <Separator />
                      <div className='space-y-1'>
                        <label className='text-muted-foreground flex items-center gap-1 text-xs font-medium tracking-wide uppercase'>
                          <MapPin className='h-3 w-3' />
                          {t('partner.address')}
                        </label>
                        <p className='text-sm'>{debt.consignee.address}</p>
                      </div>
                    </>
                  )}
                  {debt.consignee.contact && (
                    <>
                      <Separator />
                      <div className='space-y-1'>
                        <label className='text-muted-foreground flex items-center gap-1 text-xs font-medium tracking-wide uppercase'>
                          <Phone className='h-3 w-3' />
                          {t('partner.contact')}
                        </label>
                        <p className='text-sm'>{debt.consignee.contact}</p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className='text-muted-foreground'>{t('partner.noInfo')}</p>
              )}
            </CardContent>
          </Card>

          {/* Additional Financial Details */}
          {debt.creditLimit && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CreditCard className='h-5 w-5' />
                  {t('credit.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-1'>
                  <label className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                    {t('credit.limit')}
                  </label>
                  <p className='text-lg font-semibold'>
                    {formatDebtAmount(debt.creditLimit)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='h-5 w-5' />
                {t('dates.title')}
              </CardTitle>
              <CardDescription>{t('dates.description')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {debt.dueDate && (
                <>
                  <div className='space-y-1'>
                    <label className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                      {t('dates.dueDate')}
                    </label>
                    <p className='text-sm font-medium'>
                      {new Date(debt.dueDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <Separator />
                </>
              )}
              <div className='space-y-1'>
                <label className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                  {t('dates.createdAt')}
                </label>
                <p className='text-sm'>
                  {new Date(debt.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <Separator />
              <div className='space-y-1'>
                <label className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                  {t('dates.lastUpdated')}
                </label>
                <p className='text-sm'>
                  {new Date(debt.updatedAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold tracking-tight'>
            {t('history.title')}
          </h2>
          <Card>
            <CardContent className='p-0'>
              <PaymentHistoryTable
                payments={payments}
                page={page}
                limit={limit}
                pageCount={pageCount}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            </CardContent>
          </Card>
        </div>

        {/* Payment Modal */}
        {debt && (
          <PaymentModal
            debt={debt}
            isOpen={paymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            onSuccess={() => {
              // Reload debt data after successful payment
              Promise.all([
                fetchDebtById(debtId),
                fetchPaymentsByDebtId(debtId, { page, limit })
              ])
                .then(([updatedDebt, updatedPaymentsResponse]) => {
                  setDebt(updatedDebt);
                  setPayments(updatedPaymentsResponse.data);
                  if (updatedPaymentsResponse.hasNextPage) {
                    setPageCount((prev) => (page >= prev ? page + 1 : prev));
                  } else {
                    setPageCount(page);
                  }
                })
                .catch(() => {
                  // Silently handle error - user can manually refresh
                });
            }}
          />
        )}
      </div>
    </PageContainer>
  );
}
