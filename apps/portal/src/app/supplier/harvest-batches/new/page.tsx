'use client';

import PageContainer from '@/components/layout/page-container';
import { IconLoader2 } from '@tabler/icons-react';

import { useCreateHarvestSchedule } from '../../../../features/supplier/harvest-batches/hooks/use-create-harvest-schedule';
import {
  ProductSelectionStep,
  ScheduleStep,
  ReviewStep,
  StepProgress,
  StepNavigation
} from '../../../../features/supplier/harvest-batches/components';

export default function NewHarvestBatchPage() {
  const {
    state,
    toggleProduct,
    updateHarvestDetail,
    setStep,
    setHarvestDate,
    setHarvestAddress,
    setDescription,
    setHarvestPos,
    toggleMap,
    calculateTotal,
    calculateTotalQuantity,
    canProceedToSchedule,
    canProceedToReview,
    handleSubmit,
    handleBack,
    t
  } = useCreateHarvestSchedule();

  if (state.loading) {
    return (
      <PageContainer>
        <div className='flex h-[60vh] flex-1 items-center justify-center'>
          <IconLoader2 className='text-muted-foreground h-8 w-8 animate-spin' />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='mx-auto w-full max-w-6xl space-y-6 pb-12'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {t('new.title')}
          </h1>
          <p className='text-muted-foreground mt-2'>{t('new.subtitle')}</p>
        </div>

        {/* Progress Steps */}
        <StepProgress currentStep={state.currentStep} t={t} />

        {/* Step 1: Products */}
        {state.currentStep === 'products' && (
          <ProductSelectionStep
            products={state.products}
            harvestDetails={state.harvestDetails}
            selectedProducts={state.selectedProducts}
            onToggleProduct={toggleProduct}
            onUpdateHarvestDetail={updateHarvestDetail}
            calculateTotal={calculateTotal}
            t={t}
          />
        )}

        {/* Step 2: Schedule */}
        {state.currentStep === 'schedule' && (
          <ScheduleStep
            harvestDate={state.harvestDate}
            harvestAddress={state.harvestAddress}
            description={state.description}
            harvestPos={state.harvestPos}
            showMap={state.showMap}
            onSetHarvestDate={setHarvestDate}
            onSetHarvestAddress={setHarvestAddress}
            onSetDescription={setDescription}
            onSetHarvestPos={setHarvestPos}
            onToggleMap={toggleMap}
            t={t}
          />
        )}

        {/* Step 3: Review */}
        {state.currentStep === 'review' && (
          <ReviewStep
            products={state.products}
            harvestDetails={state.harvestDetails}
            harvestDate={state.harvestDate}
            harvestAddress={state.harvestAddress}
            description={state.description}
            calculateTotal={calculateTotal}
            calculateTotalQuantity={calculateTotalQuantity}
            t={t}
          />
        )}

        {/* Navigation Buttons */}
        <StepNavigation
          currentStep={state.currentStep}
          submitting={state.submitting}
          canProceedToSchedule={canProceedToSchedule}
          canProceedToReview={canProceedToReview}
          onBack={handleBack}
          onSetStep={setStep}
          onSubmit={handleSubmit}
          t={t}
        />
      </div>
    </PageContainer>
  );
}
