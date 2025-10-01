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
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Package,
  Clock,
  CheckCircle,
  Truck,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  HarvestBatch,
  mockHarvestBatches,
  statusLabels,
  statusColors
} from '@/types/harvest';
// Temporarily comment out imports to fix build
// import { CreateHarvestBatchModal } from './create-harvest-batch-modal';
// import { ViewHarvestDetailsModal } from './view-harvest-details-modal';
// import { ConfirmDeliveryModal } from './confirm-delivery-modal';

export function SupplierDashboard() {
  const [batches, setBatches] = useState<HarvestBatch[]>(mockHarvestBatches);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<HarvestBatch | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Calculate statistics
  const stats = {
    total: batches.length,
    pending: batches.filter((b) => b.status === 'pending').length,
    inProgress: batches.filter((b) =>
      ['approved', 'in_progress'].includes(b.status)
    ).length,
    pickedUp: batches.filter((b) => b.status === 'picked_up').length,
    completed: batches.filter((b) =>
      ['confirmed', 'completed'].includes(b.status)
    ).length
  };

  const handleCreateBatch = (newBatch: HarvestBatch) => {
    setBatches((prev) => [newBatch, ...prev]);
    setShowCreateModal(false);
  };

  const handleUpdateBatch = (updatedBatch: HarvestBatch) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === updatedBatch.id ? updatedBatch : b))
    );
    setSelectedBatch(updatedBatch);
  };

  const handleConfirmDelivery = (
    batchId: string,
    confirmed: boolean,
    note?: string
  ) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;

    const updatedBatch: HarvestBatch = {
      ...batch,
      status: confirmed ? 'confirmed' : 'picked_up',
      confirmedAt: confirmed ? new Date() : undefined,
      updatedAt: new Date(),
      statusHistory: [
        ...batch.statusHistory,
        {
          status: confirmed ? 'confirmed' : 'picked_up',
          timestamp: new Date(),
          note:
            note ||
            (confirmed
              ? 'Nhà cung cấp xác nhận đã giao hàng'
              : 'Hủy xác nhận giao hàng')
        }
      ]
    };

    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? updatedBatch : b))
    );
    setShowConfirmModal(false);
    setSelectedBatch(null);
  };

  const getStatusBadge = (status: HarvestBatch['status']) => (
    <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
  );

  return (
    <div className='flex-1 space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Quản lý đợt thu hoạch
          </h1>
          <p className='text-muted-foreground'>
            Tạo mới, theo dõi và quản lý các đợt thu hoạch nông sản
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Tạo đợt thu hoạch
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng số đợt</CardTitle>
            <Package className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <p className='text-muted-foreground text-xs'>
              Tất cả đợt thu hoạch
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Chờ duyệt</CardTitle>
            <Clock className='h-4 w-4 text-yellow-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>
              {stats.pending}
            </div>
            <p className='text-muted-foreground text-xs'>Đang chờ phê duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Đang thực hiện
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.inProgress}
            </div>
            <p className='text-muted-foreground text-xs'>
              Đã duyệt & đang vận chuyển
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Đã lấy hàng</CardTitle>
            <Truck className='h-4 w-4 text-purple-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-600'>
              {stats.pickedUp}
            </div>
            <p className='text-muted-foreground text-xs'>
              Chờ xác nhận giao hàng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Hoàn thành</CardTitle>
            <CheckCircle className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {stats.completed}
            </div>
            <p className='text-muted-foreground text-xs'>Đã hoàn tất</p>
          </CardContent>
        </Card>
      </div>

      {/* Harvest Batches List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đợt thu hoạch</CardTitle>
          <CardDescription>
            Quản lý và theo dõi tất cả các đợt thu hoạch của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {batches.map((batch) => (
              <div
                key={batch.id}
                className='hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-4'
                onClick={() => {
                  setSelectedBatch(batch);
                  setShowDetailsModal(true);
                }}
              >
                <div className='flex items-center space-x-4'>
                  <div className='flex-shrink-0'>
                    <Package className='text-muted-foreground h-8 w-8' />
                  </div>
                  <div className='space-y-1'>
                    <div className='flex items-center space-x-2'>
                      <p className='font-medium'>{batch.productName}</p>
                      {getStatusBadge(batch.status)}
                    </div>
                    <p className='text-muted-foreground text-sm'>
                      {batch.quantity} {batch.unit} • Mã: {batch.id}
                    </p>
                    <div className='text-muted-foreground flex items-center space-x-4 text-xs'>
                      <span className='flex items-center'>
                        <Calendar className='mr-1 h-3 w-3' />
                        Dự kiến lấy:{' '}
                        {batch.expectedPickupDate.toLocaleDateString('vi-VN')}
                      </span>
                      {batch.status === 'picked_up' && (
                        <span className='flex items-center text-orange-600'>
                          <AlertCircle className='mr-1 h-3 w-3' />
                          Cần xác nhận giao hàng
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  {batch.status === 'picked_up' && (
                    <Button
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBatch(batch);
                        setShowConfirmModal(true);
                      }}
                    >
                      Xác nhận giao hàng
                    </Button>
                  )}
                  <Button variant='outline' size='sm'>
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals - Temporarily disabled */}
      {showCreateModal && <div>Create modal will be implemented</div>}
      {showDetailsModal && <div>Details modal will be implemented</div>}
      {showConfirmModal && <div>Confirm modal will be implemented</div>}
    </div>
  );
}
