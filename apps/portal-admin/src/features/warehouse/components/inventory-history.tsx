'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconArrowDown,
  IconArrowUp,
  IconCalendar,
  IconUser,
  IconPackage
} from '@tabler/icons-react';

// Define types for inventory history
export interface InventoryHistoryItem {
  id: string;
  type: 'import' | 'export';
  date: string;
  quantity: number;
  unit: string;
  reason: string;
  performedBy: string;
  batchNumber?: string;
  supplier?: string;
  customer?: string;
  notes?: string;
  remainingStock: number;
}

interface InventoryHistoryProps {
  productId: string;
  productName: string;
}

export function InventoryHistory({
  productId,
  productName
}: InventoryHistoryProps) {
  // Mock data for inventory history
  const mockHistoryData: InventoryHistoryItem[] = [
    {
      id: '1',
      type: 'import',
      date: '2024-01-15T08:30:00',
      quantity: 200,
      unit: 'kg',
      reason: 'Nhập hàng từ nhà cung cấp',
      performedBy: 'Nguyễn Văn A',
      batchNumber: 'BATCH-001',
      supplier: 'Nông trại Xanh Đà Lạt',
      notes: 'Hàng tươi, chất lượng tốt',
      remainingStock: 350
    },
    {
      id: '2',
      type: 'export',
      date: '2024-01-14T14:20:00',
      quantity: 50,
      unit: 'kg',
      reason: 'Xuất hàng cho khách hàng',
      performedBy: 'Trần Thị B',
      customer: 'Siêu thị BigC',
      notes: 'Đơn hàng #ORD-2024-001',
      remainingStock: 150
    },
    {
      id: '3',
      type: 'export',
      date: '2024-01-13T16:45:00',
      quantity: 25,
      unit: 'kg',
      reason: 'Hàng hết hạn - Tiêu hủy',
      performedBy: 'Lê Văn C',
      notes: 'Sản phẩm quá hạn sử dụng',
      remainingStock: 200
    },
    {
      id: '4',
      type: 'import',
      date: '2024-01-12T09:15:00',
      quantity: 150,
      unit: 'kg',
      reason: 'Nhập bổ sung tồn kho',
      performedBy: 'Phạm Văn D',
      batchNumber: 'BATCH-002',
      supplier: 'Nông trại Xanh Đà Lạt',
      notes: 'Bổ sung do tồn kho thấp',
      remainingStock: 225
    },
    {
      id: '5',
      type: 'export',
      date: '2024-01-11T11:30:00',
      quantity: 75,
      unit: 'kg',
      reason: 'Xuất hàng cho khách hàng',
      performedBy: 'Hoàng Thị E',
      customer: 'Cửa hàng Organic Fresh',
      notes: 'Đơn hàng #ORD-2024-002',
      remainingStock: 75
    },
    {
      id: '6',
      type: 'import',
      date: '2024-01-10T07:00:00',
      quantity: 100,
      unit: 'kg',
      reason: 'Nhập hàng đầu kỳ',
      performedBy: 'Nguyễn Văn A',
      batchNumber: 'BATCH-003',
      supplier: 'Nông trại Xanh Đà Lạt',
      notes: 'Lô hàng đầu tháng',
      remainingStock: 150
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: 'import' | 'export') => {
    return type === 'import' ? (
      <IconArrowDown className='h-4 w-4 text-green-600' />
    ) : (
      <IconArrowUp className='h-4 w-4 text-red-600' />
    );
  };

  const getTypeBadge = (type: 'import' | 'export') => {
    return type === 'import' ? (
      <Badge
        variant='outline'
        className='border-green-200 bg-green-50 text-green-700'
      >
        Nhập kho
      </Badge>
    ) : (
      <Badge
        variant='outline'
        className='border-red-200 bg-red-50 text-red-700'
      >
        Xuất kho
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconPackage className='h-5 w-5' />
          Lịch sử nhập xuất kho
        </CardTitle>
        <CardDescription>
          Chi tiết các giao dịch nhập xuất kho của sản phẩm:{' '}
          <strong>{productName}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {mockHistoryData.map((item) => (
            <div
              key={item.id}
              className='hover:bg-muted/50 rounded-lg border p-4 transition-colors'
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-3'>
                  <div className='mt-1'>{getTypeIcon(item.type)}</div>
                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-2'>
                      {getTypeBadge(item.type)}
                      <span className='text-muted-foreground flex items-center gap-1 text-sm'>
                        <IconCalendar className='h-3 w-3' />
                        {formatDate(item.date)}
                      </span>
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <div>
                        <p className='mb-1 text-sm font-medium'>
                          Thông tin giao dịch
                        </p>
                        <p className='text-muted-foreground mb-1 text-sm'>
                          <strong>Số lượng:</strong> {item.quantity} {item.unit}
                        </p>
                        <p className='text-muted-foreground mb-1 text-sm'>
                          <strong>Lý do:</strong> {item.reason}
                        </p>
                        <p className='text-muted-foreground flex items-center gap-1 text-sm'>
                          <IconUser className='h-3 w-3' />
                          <strong>Người thực hiện:</strong> {item.performedBy}
                        </p>
                      </div>

                      <div>
                        <p className='mb-1 text-sm font-medium'>
                          Chi tiết bổ sung
                        </p>
                        {item.batchNumber && (
                          <p className='text-muted-foreground mb-1 text-sm'>
                            <strong>Số lô:</strong> {item.batchNumber}
                          </p>
                        )}
                        {item.supplier && (
                          <p className='text-muted-foreground mb-1 text-sm'>
                            <strong>Nhà cung cấp:</strong> {item.supplier}
                          </p>
                        )}
                        {item.customer && (
                          <p className='text-muted-foreground mb-1 text-sm'>
                            <strong>Khách hàng:</strong> {item.customer}
                          </p>
                        )}
                        <p className='text-muted-foreground text-sm'>
                          <strong>Tồn kho sau GD:</strong> {item.remainingStock}{' '}
                          {item.unit}
                        </p>
                      </div>
                    </div>

                    {item.notes && (
                      <div className='bg-muted/30 mt-3 rounded p-2 text-sm'>
                        <strong>Ghi chú:</strong> {item.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-6 flex justify-center'>
          <Button variant='outline'>Xem thêm lịch sử</Button>
        </div>
      </CardContent>
    </Card>
  );
}
