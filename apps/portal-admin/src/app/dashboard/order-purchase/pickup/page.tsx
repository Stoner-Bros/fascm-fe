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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PhaseDetailPane,
  ScheduleListPane,
  usePickupPage
} from '@/features/order-purchase/pickup';
import { LayoutGrid, List, RefreshCw, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';

type ViewMode = 'split' | 'list';

export default function PickupPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const page = usePickupPage();

  // Stats calculations
  const stats = useMemo(() => {
    const totalSchedules = page.schedules.allSchedules.length;
    const totalPickups = page.pickups.pickups.length;
    const completedPickups = page.pickups.pickups.filter(
      (p) => p.status === 'completed'
    ).length;
    const activePickups = page.pickups.pickups.filter(
      (p) => p.status === 'delivering' || p.status === 'scheduled'
    ).length;
    const todayPickups = page.pickups.pickups.filter((p) => {
      const today = new Date();
      const createdAt = new Date(p.createdAt);
      return (
        createdAt.getDate() === today.getDate() &&
        createdAt.getMonth() === today.getMonth() &&
        createdAt.getFullYear() === today.getFullYear()
      );
    }).length;

    return {
      totalSchedules,
      totalPickups,
      completedPickups,
      activePickups,
      todayPickups
    };
  }, [page.schedules.allSchedules, page.pickups.pickups]);

  const isLoading =
    page.schedules.loading ||
    page.pickups.loadingFetch ||
    page.trucks.loading ||
    page.deliveryStaffs.loading;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col gap-3'>
        {/* Header */}
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>Quản lý giao hàng</h1>
            <p className='text-muted-foreground text-sm'>
              Tạo và theo dõi các chuyến thu mua hàng từ nhà vườn
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {/* View mode toggle */}
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as ViewMode)}
              className='hidden lg:block'
            >
              <TabsList className='h-8'>
                <TabsTrigger
                  value='split'
                  className='h-7 cursor-pointer gap-1.5 px-2 text-xs'
                >
                  <LayoutGrid className='h-3.5 w-3.5' />
                  Chia đôi
                </TabsTrigger>
                <TabsTrigger
                  value='list'
                  className='h-7 cursor-pointer gap-1.5 px-2 text-xs'
                >
                  <List className='h-3.5 w-3.5' />
                  Danh sách
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant='outline'
              size='sm'
              onClick={page.refreshAll}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
              />
              Tải lại
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-2 md:grid-cols-4'>
          <Card className='p-3'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-xs font-medium'>
                Lịch thu hoạch
              </span>
              <div className='mt-1 text-xl font-bold'>
                {stats.totalSchedules}
              </div>
            </div>
          </Card>

          <Card className='p-3'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-xs font-medium'>
                Chuyến giao
              </span>
              <div className='mt-1 text-xl font-bold'>{stats.totalPickups}</div>
            </div>
          </Card>

          <Card className='p-3'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-xs font-medium'>
                Đang giao
              </span>
              <div className='mt-1 text-xl font-bold'>
                {stats.activePickups}
              </div>
            </div>
          </Card>

          <Card className='p-3'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-xs font-medium'>
                Hoàn thành
              </span>
              <div className='mt-1 text-xl font-bold'>
                {stats.completedPickups}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content - Two Pane Layout */}
        {viewMode === 'split' ? (
          <div className='grid flex-1 gap-3 overflow-hidden lg:grid-cols-[360px_1fr]'>
            {/* Left Pane - Schedule List */}
            <div className='overflow-hidden'>
              <ScheduleListPane
                schedules={page.schedules.schedules}
                loading={page.schedules.loading}
                selectedScheduleId={page.selectedScheduleId}
                searchQuery={page.schedules.searchQuery}
                statusFilter={page.schedules.statusFilter}
                page={page.schedules.page}
                pageCount={page.schedules.pageCount}
                limit={page.schedules.limit}
                hasNextPage={page.schedules.hasNextPage}
                onSelectSchedule={page.selectSchedule}
                onSearchChange={page.schedules.setSearchQuery}
                onStatusFilterChange={page.schedules.setStatusFilter}
                onPageChange={page.schedules.setPage}
                onRefresh={page.schedules.loadSchedules}
              />
            </div>

            {/* Right Pane - Phase Details */}
            <div className='overflow-hidden'>
              <PhaseDetailPane
                schedule={page.selectedSchedule}
                phases={page.selectedSchedulePhases}
                phasesLoading={
                  page.phases.loadingScheduleId === page.selectedScheduleId
                }
                trucks={page.trucks.trucks}
                trucksLoading={page.trucks.loading}
                deliveryStaffs={page.deliveryStaffs.deliveryStaffs}
                deliveryStaffsLoading={page.deliveryStaffs.loading}
                getPickupByPhaseId={page.pickups.getPickupByPhaseId}
                hasPickupForPhase={page.pickups.hasPickupForPhase}
                onCreatePickup={page.pickups.createPickup}
                onUpdatePickupStatus={page.pickups.updatePickupStatus}
                onUploadPhaseImageProof={page.pickups.uploadPhaseProof}
                onRefetchPhase={page.phases.refetchPhase}
                isCreating={page.pickups.loadingCreate}
                loadingUpdateStatusId={page.pickups.loadingUpdateStatus}
                uploadingProofPhaseId={page.pickups.loadingUploadProofPhaseId}
              />
            </div>
          </div>
        ) : (
          // List View Mode
          <Card className='flex-1 overflow-hidden'>
            <CardHeader className='px-4 py-3'>
              <CardTitle className='text-base'>
                Danh sách chuyến giao hàng
              </CardTitle>
              <CardDescription className='text-xs'>
                Tất cả các chuyến thu mua từ nhà vườn
              </CardDescription>
            </CardHeader>
            <CardContent className='overflow-auto px-4 py-2'>
              <div className='space-y-2'>
                {page.pickups.loadingFetch ? (
                  <div className='flex items-center justify-center py-8'>
                    <RefreshCw className='text-muted-foreground h-6 w-6 animate-spin' />
                  </div>
                ) : page.pickups.pickups.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-8 text-center'>
                    <Truck className='text-muted-foreground/50 mb-2 h-12 w-12' />
                    <h3 className='text-muted-foreground text-sm font-medium'>
                      Chưa có chuyến giao hàng nào
                    </h3>
                    <p className='text-muted-foreground mt-1 text-xs'>
                      Chọn một lịch thu hoạch và tạo chuyến giao mới
                    </p>
                    <Button
                      variant='outline'
                      size='sm'
                      className='mt-3'
                      onClick={() => setViewMode('split')}
                    >
                      <LayoutGrid className='mr-1.5 h-3.5 w-3.5' />
                      Chuyển sang chế độ chia đôi
                    </Button>
                  </div>
                ) : (
                  <div className='grid gap-2 md:grid-cols-2 xl:grid-cols-3'>
                    {page.pickups.pickups.map((pickup) => (
                      <Card key={pickup.id} className='overflow-hidden p-3'>
                        <div className='mb-1 flex items-center justify-between'>
                          <span className='text-muted-foreground font-mono text-[10px]'>
                            #{pickup.id.slice(0, 8).toUpperCase()}
                          </span>
                          <Badge
                            variant={
                              pickup.status === 'completed'
                                ? 'default'
                                : pickup.status === 'canceled'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className='px-1.5 py-0 text-[10px]'
                          >
                            {pickup.status}
                          </Badge>
                        </div>
                        <p className='text-sm font-medium'>
                          {pickup.harvestPhase?.harvestSchedule?.id
                            ? `Đợt ${pickup.harvestPhase.phaseNumber}`
                            : 'Chuyến giao'}
                        </p>
                        <div className='mt-2 space-y-1 text-xs'>
                          {pickup.truck && (
                            <div className='flex items-center gap-1.5'>
                              <Truck className='text-muted-foreground h-3 w-3' />
                              <span>{pickup.truck.licensePlate}</span>
                            </div>
                          )}
                          {pickup.startAddress && (
                            <div className='text-muted-foreground flex items-start gap-1.5'>
                              <span>Từ:</span>
                              <span className='truncate'>
                                {pickup.startAddress}
                              </span>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
