'use client';

// import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Package,
  User,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
  Edit,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  HarvestBatch,
  statusLabels,
  statusColors,
  productTypeOptions,
  unitOptions
} from '@/types/harvest';
// import { EditHarvestBatchModal } from './edit-harvest-batch-modal';

interface ViewHarvestDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: HarvestBatch;
  onUpdate: (batch: HarvestBatch) => void;
}

export function ViewHarvestDetailsModal({
  open,
  onOpenChange,
  batch,
  onUpdate
}: ViewHarvestDetailsModalProps) {
  // const [showEditModal, setShowEditModal] = useState(false);

  const getProductTypeLabel = (type: string) => {
    return (
      productTypeOptions.find((option) => option.value === type)?.label || type
    );
  };

  const getUnitLabel = (unit: string) => {
    return unitOptions.find((option) => option.value === unit)?.label || unit;
  };

  const getStatusIcon = (status: HarvestBatch['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className='h-4 w-4' />;
      case 'approved':
        return <CheckCircle className='h-4 w-4' />;
      case 'in_progress':
        return <Truck className='h-4 w-4' />;
      case 'picked_up':
        return <Package className='h-4 w-4' />;
      case 'confirmed':
        return <CheckCircle className='h-4 w-4' />;
      case 'completed':
        return <CheckCircle className='h-4 w-4' />;
      default:
        return <AlertCircle className='h-4 w-4' />;
    }
  };

  const canEdit = batch.status === 'pending';
  const canCancel = ['pending', 'approved'].includes(batch.status);

  const handleCancel = async () => {
    // Simulate API call to cancel batch
    const updatedBatch: HarvestBatch = {
      ...batch,
      status: 'pending', // Reset to pending or create a 'cancelled' status
      updatedAt: new Date(),
      statusHistory: [
        ...batch.statusHistory,
        {
          status: 'pending',
          timestamp: new Date(),
          note: 'Đợt thu hoạch đã được hủy'
        }
      ]
    };
    onUpdate(updatedBatch);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[700px]'>
          <DialogHeader>
            <div className='flex items-center justify-between'>
              <div>
                <DialogTitle>Chi tiết đợt thu hoạch</DialogTitle>
                <DialogDescription>Mã đợt: {batch.id}</DialogDescription>
              </div>
              <div className='flex items-center space-x-2'>
                <Badge
                  className={`${statusColors[batch.status]} flex items-center space-x-1`}
                >
                  {getStatusIcon(batch.status)}
                  <span>{statusLabels[batch.status]}</span>
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className='space-y-6'>
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Thông tin sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Loại sản phẩm
                    </p>
                    <p className='text-base'>
                      {getProductTypeLabel(batch.productType)}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Tên sản phẩm
                    </p>
                    <p className='text-base font-medium'>{batch.productName}</p>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Số lượng
                    </p>
                    <p className='text-base'>
                      {batch.quantity} {getUnitLabel(batch.unit)}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Ngày dự kiến lấy hàng
                    </p>
                    <p className='flex items-center text-base'>
                      <Calendar className='mr-2 h-4 w-4' />
                      {format(batch.expectedPickupDate, 'PPP', { locale: vi })}
                    </p>
                  </div>
                </div>
                {batch.description && (
                  <div>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Mô tả
                    </p>
                    <p className='text-base'>{batch.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Information */}
            {batch.deliveryStaffId && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    Thông tin vận chuyển
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-muted-foreground text-sm font-medium'>
                        Nhân viên vận chuyển
                      </p>
                      <p className='flex items-center text-base'>
                        <User className='mr-2 h-4 w-4' />
                        {batch.deliveryStaffName}
                      </p>
                    </div>
                    {batch.pickupTime && (
                      <div>
                        <p className='text-muted-foreground text-sm font-medium'>
                          Thời gian lấy hàng
                        </p>
                        <p className='flex items-center text-base'>
                          <Clock className='mr-2 h-4 w-4' />
                          {format(batch.pickupTime, 'PPP p', { locale: vi })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status History */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Lịch sử trạng thái</CardTitle>
                <CardDescription>
                  Theo dõi quá trình xử lý đợt thu hoạch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {batch.statusHistory.map((history, index) => (
                    <div key={index} className='flex items-start space-x-3'>
                      <div
                        className={`mt-2 h-2 w-2 flex-shrink-0 rounded-full ${
                          index === 0 ? 'bg-primary' : 'bg-muted-foreground'
                        }`}
                      />
                      <div className='flex-1 space-y-1'>
                        <div className='flex items-center space-x-2'>
                          <Badge
                            variant='outline'
                            className={statusColors[history.status]}
                          >
                            {statusLabels[history.status]}
                          </Badge>
                          <span className='text-muted-foreground text-sm'>
                            {format(history.timestamp, 'PPP p', { locale: vi })}
                          </span>
                        </div>
                        {history.note && (
                          <p className='text-muted-foreground text-sm'>
                            {history.note}
                          </p>
                        )}
                        {history.staffName && (
                          <p className='text-muted-foreground text-xs'>
                            Bởi: {history.staffName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className='flex items-center justify-between pt-4'>
              <div className='flex space-x-2'>
                {canEdit && (
                  <Button
                    variant='outline'
                    onClick={() => {
                      // TODO: Implement edit functionality
                      console.log('Edit batch:', batch.id);
                    }}
                  >
                    <Edit className='mr-2 h-4 w-4' />
                    Chỉnh sửa
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant='outline'
                    onClick={handleCancel}
                    className='text-red-600 hover:text-red-700'
                  >
                    <X className='mr-2 h-4 w-4' />
                    Hủy đợt thu hoạch
                  </Button>
                )}
              </div>
              <Button onClick={() => onOpenChange(false)}>Đóng</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal - TODO: Implement when needed */}
    </>
  );
}
