'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { IconAlertTriangle, IconCalendar } from '@tabler/icons-react';
import { DebtCard } from './components/debt-card';
import type { Debt } from './types';

// Mock data - chỉ có 1 nợ cần tất toán
const mockDebtData: Debt = {
  consignee: {
    contact: null,
    taxCode: null,
    address: null,
    certificate: null,
    qrCode: null,
    organizationName: 'Siêu thị BigC',
    representativeName: null,
    user: {
      id: 12,
      firstName: 'Siêu thị',
      lastName: 'BigC',
      role: {
        id: 5,
        name: 'Consignee',
        __entity: 'RoleEntity'
      },
      status: {
        id: 1,
        name: 'Active',
        __entity: 'StatusEntity'
      },
      createdAt: '2025-12-14T23:58:13.379Z',
      updatedAt: '2025-12-14T23:58:13.379Z',
      deletedAt: null
    },
    id: 'CONS_0001',
    createdAt: '2025-12-14T23:58:13.896Z',
    updatedAt: '2025-12-14T23:58:13.896Z'
  },
  supplier: null,
  partnerType: 'consignee',
  status: 'unpaid',
  // dueDate trong tương lai - cần tất toán trước ngày này
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 ngày từ bây giờ
  creditLimit: 50000000,
  remainingAmount: 25000000, // Số tiền còn lại cần tất toán
  paidAmount: 0,
  originalAmount: 25000000, // Tổng số tiền hóa đơn
  debtType: 'receivable',
  id: '40c7bd35-cb76-48f6-b8aa-ed2198af7c5a',
  createdAt: '2025-12-14T23:58:15.445Z',
  updatedAt: '2025-12-14T23:58:15.445Z'
};

export default function DebtPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Tính số ngày còn lại đến dueDate
  const getDaysUntilDue = () => {
    const dueDate = new Date(mockDebtData.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

  return (
    <PageContainer>
      <div className='w-full flex-1 space-y-6'>
        {/* Header */}
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            Tất toán hóa đơn
          </h2>
          <p className='text-muted-foreground mt-1'>
            Vui lòng tất toán hóa đơn trước ngày đến hạn
          </p>
        </div>

        {/* Alert Banner - Cảnh báo về dueDate */}
        {isOverdue ? (
          <Card className='border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 dark:border-red-900 dark:from-red-950/30 dark:to-red-900/20'>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='rounded-full bg-red-100 p-3 dark:bg-red-900/50'>
                  <IconAlertTriangle className='h-6 w-6 text-red-600 dark:text-red-400' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-red-900 dark:text-red-100'>
                    Hóa đơn đã quá hạn thanh toán
                  </h3>
                  <p className='text-sm text-red-700 dark:text-red-300'>
                    Hóa đơn đã quá hạn {Math.abs(daysUntilDue)} ngày. Vui lòng
                    tất toán ngay để tránh ảnh hưởng đến hạn mức tín dụng.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : isDueSoon ? (
          <Card className='border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:border-orange-900 dark:from-orange-950/30 dark:to-orange-900/20'>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='rounded-full bg-orange-100 p-3 dark:bg-orange-900/50'>
                  <IconAlertTriangle className='h-6 w-6 text-orange-600 dark:text-orange-400' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-orange-900 dark:text-orange-100'>
                    Hóa đơn sắp đến hạn
                  </h3>
                  <p className='text-sm text-orange-700 dark:text-orange-300'>
                    Còn {daysUntilDue} ngày đến hạn thanh toán. Vui lòng tất
                    toán trước ngày{' '}
                    {new Date(mockDebtData.dueDate).toLocaleDateString('vi-VN')}
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className='border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:border-blue-900 dark:from-blue-950/30 dark:to-blue-900/20'>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='rounded-full bg-blue-100 p-3 dark:bg-blue-900/50'>
                  <IconCalendar className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-blue-900 dark:text-blue-100'>
                    Thông tin thanh toán
                  </h3>
                  <p className='text-sm text-blue-700 dark:text-blue-300'>
                    Còn {daysUntilDue} ngày đến hạn thanh toán. Vui lòng tất
                    toán trước ngày{' '}
                    {new Date(mockDebtData.dueDate).toLocaleDateString('vi-VN')}
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Debt Card */}
        <DebtCard debt={mockDebtData} />
      </div>
    </PageContainer>
  );
}
