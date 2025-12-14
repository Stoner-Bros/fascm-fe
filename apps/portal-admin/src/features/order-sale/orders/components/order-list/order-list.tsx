'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';

import { useOrderList } from '../../hooks/order-list/use-order-list';
import { StatusCards } from './status-cards';
import { SearchFilters } from './search-filters';
import { OrderTable } from './order-table';
import { ReasonDialog } from './reason-dialog';

export default function OrderList() {
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
    handleApproveOrder,
    handleCancelOrder,
    handleRejectOrder,
    showRejectionReason,
    t
  } = useOrderList();

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
            <OrderTable
              loading={state.loading}
              schedules={filteredSchedules}
              updatingStatusIds={state.updatingStatusIds}
              onApproveOrder={handleApproveOrder}
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
        onConfirm={handleCancelOrder}
      />

      {/* Reject Dialog */}
      <ReasonDialog
        open={state.rejectDialogOpen}
        selectedScheduleId={state.selectedScheduleId}
        type='reject'
        onClose={handleCloseRejectDialog}
        onConfirm={handleRejectOrder}
      />
    </PageContainer>
  );
}
