'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AreaSelector,
  BatchSelector,
  ExportTicketSummary,
  InvoiceDetailSelector,
  PhaseSelector,
  ScheduleSelector,
  StepIndicator
} from '@/features/order-sale/export/components';
import { useExportTicketWizard } from '@/features/order-sale/export/hooks';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateExportTicketPage() {
  const wizard = useExportTicketWizard();

  const renderCurrentStep = () => {
    switch (wizard.currentStep) {
      case 'schedule':
        return (
          <ScheduleSelector
            schedules={wizard.schedules}
            selectedSchedule={wizard.selectedSchedule}
            loading={wizard.loadingSchedules}
            error={wizard.errorSchedules}
            onSelect={wizard.selectSchedule}
            onRefresh={wizard.loadSchedules}
            onNext={wizard.nextStep}
          />
        );

      case 'phase':
        return (
          <PhaseSelector
            phases={wizard.phases}
            selectedPhase={wizard.selectedPhase}
            loading={wizard.loadingPhases}
            error={wizard.errorPhases}
            onSelect={wizard.selectPhase}
            onRefresh={() =>
              wizard.selectedSchedule &&
              wizard.refreshPhases(wizard.selectedSchedule.id)
            }
            onNext={wizard.nextStep}
            onBack={wizard.prevStep}
          />
        );

      case 'invoiceDetail':
        return (
          <InvoiceDetailSelector
            phase={wizard.selectedPhase}
            selectedInvoiceDetail={wizard.selectedInvoiceDetail}
            onSelect={wizard.selectInvoiceDetail}
            onNext={wizard.nextStep}
            onBack={wizard.prevStep}
          />
        );

      case 'area':
        return (
          <AreaSelector
            areas={wizard.areas}
            selectedArea={wizard.selectedArea}
            selectedInvoiceDetail={wizard.selectedInvoiceDetail}
            loading={wizard.loadingAreas}
            error={wizard.errorAreas}
            onSelect={wizard.selectArea}
            onRefresh={wizard.loadAreas}
            onNext={wizard.nextStep}
            onBack={wizard.prevStep}
          />
        );

      case 'batches':
        return (
          <BatchSelector
            batches={wizard.batches}
            selectedBatchIds={wizard.selectedBatchIds}
            selectedArea={wizard.selectedArea}
            selectedInvoiceDetail={wizard.selectedInvoiceDetail}
            loading={wizard.loadingBatches}
            error={wizard.errorBatches}
            onToggle={wizard.toggleBatch}
            onRefresh={() =>
              wizard.selectedArea &&
              wizard.selectedInvoiceDetail?.product?.id &&
              wizard.refreshBatches(
                wizard.selectedArea.id,
                wizard.selectedInvoiceDetail.product.id
              )
            }
            onNext={wizard.nextStep}
            onBack={wizard.prevStep}
          />
        );

      case 'summary':
        return (
          <ExportTicketSummary
            selectedSchedule={wizard.selectedSchedule}
            selectedPhase={wizard.selectedPhase}
            selectedInvoiceDetail={wizard.selectedInvoiceDetail}
            selectedArea={wizard.selectedArea}
            selectedBatchIds={wizard.selectedBatchIds}
            batches={wizard.batches}
            isSubmitting={wizard.isSubmitting}
            submitError={wizard.submitError}
            submitSuccess={wizard.submitSuccess}
            onSubmit={wizard.submitExportTicket}
            onBack={wizard.prevStep}
            onReset={wizard.reset}
          />
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <div className='mx-auto w-full max-w-6xl space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <Link href='/dashboard/order-sale/export'>
            <Button variant='ghost' size='icon'>
              <ArrowLeft className='h-5 w-5' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>Tạo phiếu xuất kho</h1>
            <p className='text-muted-foreground'>
              Tạo phiếu xuất kho theo từng bước
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <Card>
          <CardContent className='py-6'>
            <StepIndicator
              currentStep={wizard.currentStep}
              canProceed={wizard.canProceed}
              isStepAccessible={wizard.isStepAccessible}
              onStepClick={wizard.goToStep}
            />
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardContent className='py-6'>{renderCurrentStep()}</CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
