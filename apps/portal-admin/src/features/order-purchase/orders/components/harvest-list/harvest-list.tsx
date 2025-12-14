'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';

import { useHarvestList } from '../../hooks/harvest-list/use-harvest-list';
import { StatusCards } from './status-cards';
import { SearchFilters } from './search-filters';
import { HarvestTable } from './harvest-table';
import { ReasonDialog } from './reason-dialog';

export default function HarvestList() {
  const {
    state,
    filteredSchedules,
    statusCounts,
    setSearchQuery,
    setStatusFilter,
    handleOpenCancelDialog,
    handleCloseCancelDialog,
    handleOpenRejectDialog,
    handleCloseRejectDialog,
    handleConfirmSchedule,
    handleCancelSchedule,
    handleRejectSchedule,
    showRejectionReason,
    t
  } = useHarvestList();

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>{t('title')}</h2>
            <p className='text-muted-foreground'>{t('subtitle')}</p>
          </div>
        </div>

        {/* Status Cards */}
        <StatusCards
          loading={state.loading}
          statusCounts={statusCounts}
          onSetStatusFilter={setStatusFilter}
          t={t}
        />

        {/* Filters and Table */}
        <Card>
          <SearchFilters
            searchQuery={state.searchQuery}
            statusFilter={state.statusFilter}
            onSearchQueryChange={setSearchQuery}
            onStatusFilterChange={setStatusFilter}
            t={t}
          />
          <CardContent>
            <HarvestTable
              loading={state.loading}
              schedules={filteredSchedules}
              updatingStatusIds={state.updatingStatusIds}
              onConfirmSchedule={handleConfirmSchedule}
              onOpenCancelDialog={handleOpenCancelDialog}
              onOpenRejectDialog={handleOpenRejectDialog}
              onShowRejectionReason={showRejectionReason}
            />
          </CardContent>
        </Card>
      </div>

      {/* Cancel Dialog */}
      <ReasonDialog
        open={state.cancelDialogOpen}
        selectedScheduleId={state.selectedScheduleId}
        type='cancel'
        onClose={handleCloseCancelDialog}
        onConfirm={handleCancelSchedule}
      />

      {/* Reject Dialog */}
      <ReasonDialog
        open={state.rejectDialogOpen}
        selectedScheduleId={state.selectedScheduleId}
        type='reject'
        onClose={handleCloseRejectDialog}
        onConfirm={handleRejectSchedule}
      />
    </PageContainer>
  );
}
