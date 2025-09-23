'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  IconPackageExport,
  IconUser,
  IconCheck,
  IconAlertTriangle,
  IconPackage,
  IconTruck,
  IconMapPin,
  IconPhone,
  IconWeight,
  IconCube,
  IconClipboardList,
  IconScan
} from '@tabler/icons-react';
import { toast } from 'sonner';

// Type definitions for Consignee and Orders
interface Consignee {
  id: string;
  name: string;
  address: string;
  contact: string;
  type: 'supermarket' | 'restaurant' | 'distributor' | 'retailer';
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  weight: number;
  volume: number;
  specialRequirements?: string;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerContact: string;
  customerType: 'supermarket' | 'restaurant' | 'distributor' | 'retailer';
  items: OrderItem[];
  totalWeight: number;
  totalVolume: number;
  deliveryDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiresSignature: boolean;
  status:
    | 'pending'
    | 'confirmed'
    | 'packed'
    | 'assigned'
    | 'in_transit'
    | 'delivered'
    | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Main form schema - updated for order selection
const exportFormSchema = z.object({
  areaId: z.string().min(1, 'Vui lòng chọn khu vực'),
  consigneeId: z.string().min(1, 'Vui lòng chọn người nhận'),
  selectedOrders: z
    .array(z.string())
    .min(1, 'Vui lòng chọn ít nhất một đơn hàng'),
  notes: z.string().optional()
});

type ExportFormData = z.infer<typeof exportFormSchema>;

// Mock data - Fixed warehouse (first one)
const mockWarehouse = {
  id: 'wh-001',
  name: 'Kho Trung tâm',
  location: 'Hà Nội',
  areas: [
    {
      id: 'area-001',
      name: 'Khu A1 - Rau lá',
      capacity: 1000,
      currentStock: 750,
      temperature: 4,
      humidity: 85
    },
    {
      id: 'area-002',
      name: 'Khu A2 - Trái cây',
      capacity: 800,
      currentStock: 600,
      temperature: 8,
      humidity: 80
    },
    {
      id: 'area-003',
      name: 'Khu A3 - Đông lạnh',
      capacity: 500,
      currentStock: 300,
      temperature: -18,
      humidity: 70
    },
    {
      id: 'area-004',
      name: 'Khu A4 - Khô',
      capacity: 1200,
      currentStock: 900,
      temperature: 25,
      humidity: 60
    }
  ]
};

// Mock consignees data
const mockConsignees: Consignee[] = [
  {
    id: 'CUST-001',
    name: 'Siêu thị BigC',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    contact: '0281234567',
    type: 'supermarket'
  },
  {
    id: 'CUST-002',
    name: 'Nhà hàng Hải Sản Tươi',
    address: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
    contact: '0287654321',
    type: 'restaurant'
  },
  {
    id: 'CUST-003',
    name: 'Kho bãi Miền Tây',
    address: '789 Quốc lộ 1A, Cần Thơ',
    contact: '0292345678',
    type: 'distributor'
  },
  {
    id: 'CUST-004',
    name: 'Cửa hàng Thực phẩm Sạch',
    address: '321 Trần Hưng Đạo, Quận 5, TP.HCM',
    contact: '0283456789',
    type: 'retailer'
  }
];

// Mock orders data
const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    customerId: 'CUST-001',
    customerName: 'Siêu thị BigC',
    customerAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    customerContact: '0281234567',
    customerType: 'supermarket',
    items: [
      {
        id: 'ITEM-001',
        productId: 'PROD-001',
        productName: 'Rau lá tươi',
        quantity: 100,
        unit: 'kg',
        weight: 100,
        volume: 1.5,
        specialRequirements: 'Bảo quản lạnh 2-4°C'
      },
      {
        id: 'ITEM-002',
        productId: 'PROD-002',
        productName: 'Củ cải trắng',
        quantity: 50,
        unit: 'kg',
        weight: 50,
        volume: 0.8
      }
    ],
    totalWeight: 150,
    totalVolume: 2.3,
    deliveryDate: '2024-09-18T14:00:00',
    priority: 'high',
    requiresSignature: true,
    status: 'confirmed',
    createdAt: '2024-09-17T08:00:00',
    updatedAt: '2024-09-17T10:00:00'
  },
  {
    id: 'ORD-2024-002',
    customerId: 'CUST-001',
    customerName: 'Siêu thị BigC',
    customerAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    customerContact: '0281234567',
    customerType: 'supermarket',
    items: [
      {
        id: 'ITEM-003',
        productId: 'PROD-003',
        productName: 'Cà chua',
        quantity: 80,
        unit: 'kg',
        weight: 80,
        volume: 1.2
      }
    ],
    totalWeight: 80,
    totalVolume: 1.2,
    deliveryDate: '2024-09-18T16:00:00',
    priority: 'medium',
    requiresSignature: true,
    status: 'confirmed',
    createdAt: '2024-09-17T15:00:00',
    updatedAt: '2024-09-17T16:00:00'
  },
  {
    id: 'ORD-2024-003',
    customerId: 'CUST-002',
    customerName: 'Nhà hàng Hải Sản Tươi',
    customerAddress: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
    customerContact: '0287654321',
    customerType: 'restaurant',
    items: [
      {
        id: 'ITEM-004',
        productId: 'PROD-004',
        productName: 'Hải sản đông lạnh',
        quantity: 60,
        unit: 'kg',
        weight: 60,
        volume: 1.0,
        specialRequirements: 'Đông lạnh -2°C'
      }
    ],
    totalWeight: 60,
    totalVolume: 1.0,
    deliveryDate: '2024-09-18T11:30:00',
    priority: 'urgent',
    requiresSignature: true,
    status: 'confirmed',
    createdAt: '2024-09-17T12:00:00',
    updatedAt: '2024-09-17T12:00:00'
  },
  {
    id: 'ORD-2024-004',
    customerId: 'CUST-003',
    customerName: 'Kho bãi Miền Tây',
    customerAddress: '789 Quốc lộ 1A, Cần Thơ',
    customerContact: '0292345678',
    customerType: 'distributor',
    items: [
      {
        id: 'ITEM-005',
        productId: 'PROD-005',
        productName: 'Thực phẩm khô',
        quantity: 200,
        unit: 'kg',
        weight: 200,
        volume: 2.5
      }
    ],
    totalWeight: 200,
    totalVolume: 2.5,
    deliveryDate: '2024-09-18T16:00:00',
    priority: 'medium',
    requiresSignature: false,
    status: 'pending',
    createdAt: '2024-09-17T12:00:00',
    updatedAt: '2024-09-17T12:00:00'
  }
];

export function WarehouseExport() {
  // State management
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [selectedConsignee, setSelectedConsignee] = useState<Consignee | null>(
    null
  );
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [scanMode, setScanMode] = useState<boolean>(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exportOrders, setExportOrders] = useState<any[]>([]);

  // const selectedOrders = availableOrders.filter(order =>
  //   selectedOrderIds.includes(order.id)
  // );

  // // Helper function for order status labels
  // const getOrderStatusLabel = (status: string) => {
  //   switch (status) {
  //     case 'pending': return 'Chờ xử lý';
  //     case 'confirmed': return 'Đã xác nhận';
  //     case 'packed': return 'Đã đóng gói';
  //     case 'assigned': return 'Đã phân công';
  //     case 'in_transit': return 'Đang vận chuyển';
  //     case 'delivered': return 'Đã giao';
  //     case 'cancelled': return 'Đã hủy';
  //     default: return status;
  //   }
  // };

  const steps = [
    {
      id: 1,
      title: 'Chọn khu vực',
      icon: IconMapPin,
      description: 'Chọn khu vực kho xuất hàng'
    },
    {
      id: 2,
      title: 'Chọn người nhận',
      icon: IconUser,
      description: 'Chọn khách hàng nhận hàng'
    },
    {
      id: 3,
      title: 'Chọn đơn hàng',
      icon: IconClipboardList,
      description: 'Chọn các đơn hàng cần xuất'
    },
    {
      id: 4,
      title: 'Xác nhận',
      icon: IconCheck,
      description: 'Xem lại và xác nhận xuất kho'
    }
  ];

  // Form setup
  const form = useForm<ExportFormData>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      areaId: '',
      consigneeId: '',
      selectedOrders: [],
      notes: ''
    }
  });

  // Handle area selection
  const handleAreaChange = (areaId: string) => {
    const area = mockWarehouse.areas.find((a: any) => a.id === areaId);
    setSelectedArea(area);
    setCurrentStep(2);
    // Reset subsequent selections
    setSelectedConsignee(null);
    setAvailableOrders([]);
    setSelectedOrderIds([]);
    form.setValue('consigneeId', '');
    form.setValue('selectedOrders', []);
  };

  // Handle consignee selection
  const handleConsigneeChange = (consigneeId: string) => {
    const consignee = mockConsignees.find((c) => c.id === consigneeId);
    setSelectedConsignee(consignee || null);

    if (consignee) {
      // Filter orders for selected consignee
      const ordersForConsignee = mockOrders.filter(
        (order) =>
          order.customerId === consigneeId && order.status === 'confirmed'
      );
      setAvailableOrders(ordersForConsignee);
      setCurrentStep(3);
    }

    setSelectedOrderIds([]);
    form.setValue('selectedOrders', []);
  };

  // Handle order selection
  const handleOrderSelection = (orderId: string, checked: boolean) => {
    let updatedSelectedOrders: string[];

    if (checked) {
      updatedSelectedOrders = [...selectedOrderIds, orderId];
    } else {
      updatedSelectedOrders = selectedOrderIds.filter((id) => id !== orderId);
    }

    setSelectedOrderIds(updatedSelectedOrders);
    form.setValue('selectedOrders', updatedSelectedOrders);

    if (updatedSelectedOrders.length > 0) {
      setCurrentStep(4);
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: Order['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant='destructive'>Khẩn cấp</Badge>;
      case 'high':
        return <Badge variant='default'>Cao</Badge>;
      case 'medium':
        return <Badge variant='secondary'>Trung bình</Badge>;
      case 'low':
        return <Badge variant='outline'>Thấp</Badge>;
      default:
        return null;
    }
  };

  // Get customer type label
  const getCustomerTypeLabel = (type: Consignee['type']) => {
    switch (type) {
      case 'supermarket':
        return 'Siêu thị';
      case 'restaurant':
        return 'Nhà hàng';
      case 'distributor':
        return 'Nhà phân phối';
      case 'retailer':
        return 'Cửa hàng bán lẻ';
      default:
        return type;
    }
  };

  // Calculate totals for selected orders
  const calculateTotals = () => {
    const selectedOrders = availableOrders.filter((order) =>
      selectedOrderIds.includes(order.id)
    );

    return {
      totalOrders: selectedOrders.length,
      totalWeight: selectedOrders.reduce(
        (sum, order) => sum + order.totalWeight,
        0
      ),
      totalVolume: selectedOrders.reduce(
        (sum, order) => sum + order.totalVolume,
        0
      ),
      totalItems: selectedOrders.reduce(
        (sum, order) => sum + order.items.length,
        0
      )
    };
  };

  const handleSubmit = async (data: ExportFormData) => {
    setIsSubmitting(true);

    try {
      const selectedOrders = availableOrders.filter((order) =>
        data.selectedOrders.includes(order.id)
      );

      const totals = calculateTotals();

      const newExportOrder = {
        id: `EXP-${Date.now()}`,
        warehouseId: mockWarehouse.id,
        warehouseName: mockWarehouse.name,
        areaId: selectedArea.id,
        areaName: selectedArea.name,
        consigneeId: data.consigneeId,
        consigneeName: selectedConsignee?.name,
        consigneeAddress: selectedConsignee?.address,
        consigneeContact: selectedConsignee?.contact,
        orders: selectedOrders,
        totalOrders: totals.totalOrders,
        totalWeight: totals.totalWeight,
        totalVolume: totals.totalVolume,
        totalItems: totals.totalItems,
        notes: data.notes || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: 'current-user'
      };

      setExportOrders([newExportOrder, ...exportOrders]);

      // Reset form
      form.reset();
      setSelectedArea(null);
      setSelectedConsignee(null);
      setAvailableOrders([]);
      setSelectedOrderIds([]);

      toast.success('Tạo đơn xuất kho thành công!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Có lỗi xảy ra khi tạo đơn xuất kho!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>Xuất kho</h2>
            <p className='text-muted-foreground'>
              Tạo đơn xuất kho từ {mockWarehouse.name}
            </p>
          </div>
        </div>

        {/* Export Form */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconTruck className='h-5 w-5' />
              Tạo đơn xuất kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Scan Mode Toggle */}
            <div className='mb-6 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <IconScan className='h-4 w-4' />
                <span className='text-sm font-medium'>Chế độ quét mã</span>
              </div>
              <Button
                variant={scanMode ? 'default' : 'outline'}
                size='sm'
                onClick={() => setScanMode(!scanMode)}
              >
                {scanMode ? 'Tắt quét mã' : 'Bật quét mã'}
              </Button>
            </div>

            {scanMode && (
              <Card className='mb-6 border-2 border-blue-200 bg-blue-50'>
                <CardContent className='pt-6'>
                  <div className='text-center'>
                    <div className='flex flex-col items-center gap-4'>
                      <div className='rounded-full bg-blue-100 p-4'>
                        <IconScan className='h-8 w-8 text-blue-600' />
                      </div>
                      <div>
                        <h3 className='mb-2 font-semibold text-blue-900'>
                          Chế độ Scan & Go
                        </h3>
                        <p className='mb-4 text-sm text-blue-700'>
                          Quét mã QR trên đơn hàng để tự động tải thông tin
                          consignee và order
                        </p>
                        <Button
                          variant='outline'
                          className='border-blue-300 text-blue-700 hover:bg-blue-100'
                          onClick={() => {
                            // Simulate QR scan - in real app would open camera
                            const mockScannedOrder = mockOrders[0];
                            const mockConsignee = mockConsignees.find(
                              (c) => c.id === mockScannedOrder.customerId
                            );

                            if (mockConsignee) {
                              // Auto-fill form based on scanned QR
                              form.setValue('consigneeId', mockConsignee.id);
                              handleConsigneeChange(mockConsignee.id);

                              // Auto-select the scanned order
                              setTimeout(() => {
                                handleOrderSelection(mockScannedOrder.id, true);
                                setCurrentStep(4);
                              }, 500);

                              setScanMode(false);
                              toast.success('Đã quét thành công đơn hàng!');
                            }
                          }}
                        >
                          <IconScan className='mr-2 h-4 w-4' />
                          Bắt đầu quét QR
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stepper Header */}
            <div className='mb-8'>
              {/* Desktop Stepper */}
              <div className='hidden md:block'>
                <div className='flex items-center justify-between'>
                  {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = currentStep === stepNumber;
                    const isCompleted = currentStep > stepNumber;
                    const isAccessible = stepNumber <= currentStep;

                    return (
                      <div key={step.id} className='flex flex-1 items-center'>
                        {/* Step Circle */}
                        <div className='flex flex-col items-center'>
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : isActive
                                  ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                                  : isAccessible
                                    ? 'cursor-pointer bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    : 'bg-gray-100 text-gray-400'
                            } `}
                            onClick={() =>
                              isAccessible && setCurrentStep(stepNumber)
                            }
                          >
                            {isCompleted ? (
                              <IconCheck className='h-5 w-5' />
                            ) : (
                              stepNumber
                            )}
                          </div>

                          {/* Step Label */}
                          <div className='mt-2 text-center'>
                            <div
                              className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}
                            >
                              {step.title}
                            </div>
                            <div className='mt-1 text-xs text-gray-400'>
                              {step.description}
                            </div>
                          </div>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                          <div
                            className={`mx-4 h-0.5 flex-1 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Stepper */}
              <div className='md:hidden'>
                <div className='mb-4 flex items-center justify-center'>
                  <div className='flex items-center space-x-2'>
                    {steps.map((step, index) => {
                      const stepNumber = index + 1;
                      const isActive = currentStep === stepNumber;
                      const isCompleted = currentStep > stepNumber;

                      return (
                        <div key={step.id} className='flex items-center'>
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : isActive
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-600'
                            } `}
                          >
                            {isCompleted ? (
                              <IconCheck className='h-4 w-4' />
                            ) : (
                              stepNumber
                            )}
                          </div>
                          {index < steps.length - 1 && (
                            <div
                              className={`mx-1 h-0.5 w-8 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Current Step Info */}
                <div className='text-center'>
                  <div className='text-lg font-semibold text-blue-600'>
                    {steps[currentStep - 1]?.title}
                  </div>
                  <div className='mt-1 text-sm text-gray-500'>
                    {steps[currentStep - 1]?.description}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className='mt-6'>
                <div className='mb-2 flex justify-between text-sm text-gray-600'>
                  <span>Tiến trình hoàn thành</span>
                  <span>
                    {Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}
                    %
                  </span>
                </div>
                <Progress
                  value={((currentStep - 1) / (steps.length - 1)) * 100}
                  className='h-2'
                />
              </div>
            </div>

            <Form
              form={form as any}
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-6'
            >
              {/* Step 1: Area Selection - Card Based */}
              {currentStep >= 1 && (
                <div className='space-y-4'>
                  <h3 className='flex items-center gap-2 text-lg font-semibold'>
                    <IconMapPin className='h-5 w-5' />
                    Bước 1: Chọn khu vực kho
                  </h3>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {mockWarehouse.areas.map((area: any) => {
                      const isSelected = selectedArea?.id === area.id;
                      const capacityPercent =
                        (area.currentStock / area.capacity) * 100;
                      const isNearFull = capacityPercent > 80;

                      return (
                        <Card
                          key={area.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-gray-700'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => {
                            handleAreaChange(area.id);
                            form.setValue('areaId', area.id);
                          }}
                        >
                          <CardContent className='p-4'>
                            <div className='mb-3 flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <IconMapPin
                                  className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}
                                />
                                <span className='font-medium'>{area.name}</span>
                              </div>
                              {isSelected && (
                                <IconCheck className='h-5 w-5 text-blue-600' />
                              )}
                            </div>

                            <div className='space-y-2'>
                              <div className='flex justify-between text-sm'>
                                <span>Dung lượng:</span>
                                <span
                                  className={
                                    isNearFull
                                      ? 'font-medium text-orange-600'
                                      : 'text-gray-600'
                                  }
                                >
                                  {area.currentStock}/{area.capacity}
                                </span>
                              </div>
                              <Progress
                                value={capacityPercent}
                                className='h-2'
                              />
                              <div className='flex justify-between text-xs text-gray-500'>
                                <span>
                                  {capacityPercent.toFixed(1)}% đã sử dụng
                                </span>
                                {isNearFull && (
                                  <span className='text-orange-600'>
                                    Gần đầy
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Consignee Selection - Card Based */}
              {currentStep >= 2 && selectedArea && (
                <div className='space-y-4'>
                  <h3 className='flex items-center gap-2 text-lg font-semibold'>
                    <IconUser className='h-5 w-5' />
                    Bước 2: Chọn người nhận
                  </h3>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {mockConsignees.map((consignee) => {
                      const isSelected = selectedConsignee?.id === consignee.id;

                      return (
                        <Card
                          key={consignee.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-gray-700'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => {
                            handleConsigneeChange(consignee.id);
                            form.setValue('consigneeId', consignee.id);
                          }}
                        >
                          <CardContent className='p-4'>
                            <div className='mb-3 flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <IconUser
                                  className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}
                                />
                                <span className='font-medium'>
                                  {consignee.name}
                                </span>
                                <Badge variant='outline' className='t text-xs'>
                                  {getCustomerTypeLabel(consignee.type)}
                                </Badge>
                              </div>
                              {isSelected && (
                                <IconCheck className='h-5 w-5 text-blue-600' />
                              )}
                            </div>

                            <div className='space-y-2 text-sm text-gray-600 dark:text-white'>
                              <div className='flex items-start gap-2'>
                                <IconMapPin className='mt-0.5 h-4 w-4 flex-shrink-0' />
                                <span className='line-clamp-2'>
                                  {consignee.address}
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <IconPhone className='h-4 w-4 flex-shrink-0' />
                                <span>{consignee.contact}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Orders Selection - Card Based */}
              {currentStep >= 3 &&
                selectedConsignee &&
                availableOrders.length > 0 && (
                  <div className='space-y-4'>
                    <h3 className='flex items-center gap-2 text-lg font-semibold'>
                      <IconClipboardList className='h-5 w-5' />
                      Bước 3: Chọn đơn hàng
                    </h3>
                    <FormField
                      control={form.control}
                      name='selectedOrders'
                      render={() => (
                        <FormItem>
                          <div className='space-y-3'>
                            {availableOrders.map((order) => (
                              <Card key={order.id} className='p-4'>
                                <div className='flex items-start gap-3'>
                                  <Checkbox
                                    checked={selectedOrderIds.includes(
                                      order.id
                                    )}
                                    onCheckedChange={(checked) =>
                                      handleOrderSelection(
                                        order.id,
                                        checked as boolean
                                      )
                                    }
                                  />
                                  <div className='flex-1 space-y-2'>
                                    <div className='flex items-center justify-between'>
                                      <div className='flex items-center gap-2'>
                                        <Badge variant='outline'>
                                          {order.id}
                                        </Badge>
                                        {getPriorityBadge(order.priority)}
                                        {order.requiresSignature && (
                                          <Badge variant='secondary'>
                                            Cần chữ ký
                                          </Badge>
                                        )}
                                      </div>
                                      <div className='text-muted-foreground text-sm'>
                                        {new Date(
                                          order.deliveryDate
                                        ).toLocaleDateString('vi-VN')}
                                      </div>
                                    </div>

                                    <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
                                      <div className='flex items-center gap-1'>
                                        <IconPackage className='h-4 w-4' />
                                        <span>
                                          {order.items.length} sản phẩm
                                        </span>
                                      </div>
                                      <div className='flex items-center gap-1'>
                                        <IconWeight className='h-4 w-4' />
                                        <span>{order.totalWeight} kg</span>
                                      </div>
                                      <div className='flex items-center gap-1'>
                                        <IconCube className='h-4 w-4' />
                                        <span>{order.totalVolume} m³</span>
                                      </div>
                                    </div>

                                    <div className='space-y-1'>
                                      <div className='text-sm font-medium'>
                                        Sản phẩm:
                                      </div>
                                      <div className='text-muted-foreground text-sm'>
                                        {order.items.map((item, index) => (
                                          <span key={item.id}>
                                            {item.productName} ({item.quantity}{' '}
                                            {item.unit})
                                            {index < order.items.length - 1 &&
                                              ', '}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

              {/* No Orders Message */}
              {currentStep >= 3 &&
                selectedConsignee &&
                availableOrders.length === 0 && (
                  <div className='space-y-4'>
                    <h3 className='flex items-center gap-2 text-lg font-semibold'>
                      <IconClipboardList className='h-5 w-5' />
                      Bước 3: Chọn đơn hàng
                    </h3>
                    <Card className='p-6 text-center'>
                      <div className='flex flex-col items-center gap-2'>
                        <IconAlertTriangle className='text-muted-foreground h-8 w-8' />
                        <p className='text-muted-foreground'>
                          Không có đơn hàng nào đã xác nhận cho người nhận này
                        </p>
                      </div>
                    </Card>
                  </div>
                )}

              {/* Step 4: Review Dashboard */}
              {currentStep >= 4 &&
                selectedConsignee &&
                selectedOrderIds.length > 0 && (
                  <div className='space-y-6'>
                    <h3 className='flex items-center gap-2 text-lg font-semibold'>
                      <IconCheck className='h-5 w-5' />
                      Bước 4: Xem lại thông tin xuất kho
                    </h3>

                    {/* Review Summary Cards */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                      {/* Area Info */}
                      <Card>
                        <CardHeader className='pb-3'>
                          <CardTitle className='flex items-center gap-2 text-sm'>
                            <IconMapPin className='h-4 w-4' />
                            Khu vực xuất
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='pt-0'>
                          <div className='space-y-2'>
                            <p className='font-medium'>{selectedArea?.name}</p>
                            <div className='flex items-center gap-2 text-sm text-gray-600'>
                              <IconPackage className='h-4 w-4' />
                              <span>
                                Sức chứa: {selectedArea?.capacity}/800
                              </span>
                            </div>
                            <Progress
                              value={(selectedArea?.capacity || 0) / 8}
                              className='h-2'
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Consignee Info */}
                      <Card>
                        <CardHeader className='pb-3'>
                          <CardTitle className='flex items-center gap-2 text-sm'>
                            <IconUser className='h-4 w-4' />
                            Người nhận
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='pt-0'>
                          <div className='space-y-2'>
                            <p className='font-medium'>
                              {selectedConsignee?.name}
                            </p>
                            <div className='flex items-center gap-2 text-sm text-gray-600'>
                              <IconMapPin className='h-4 w-4' />
                              <span className='line-clamp-2'>
                                {selectedConsignee?.address}
                              </span>
                            </div>
                            <div className='flex items-center gap-2 text-sm text-gray-600'>
                              <IconPhone className='h-4 w-4' />
                              <span>{selectedConsignee?.contact}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Order Summary */}
                      <Card>
                        <CardHeader className='pb-3'>
                          <CardTitle className='flex items-center gap-2 text-sm'>
                            <IconClipboardList className='h-4 w-4' />
                            Tổng quan đơn hàng
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='pt-0'>
                          <div className='space-y-2'>
                            <p className='font-medium'>
                              {selectedOrderIds.length} đơn hàng
                            </p>
                            <div className='flex items-center gap-2 text-sm text-gray-600'>
                              <IconWeight className='h-4 w-4' />
                              <span>{calculateTotals().totalWeight} kg</span>
                            </div>
                            <div className='flex items-center gap-2 text-sm text-gray-600'>
                              <IconCube className='h-4 w-4' />
                              <span>{calculateTotals().totalVolume} m³</span>
                            </div>
                            <div className='flex items-center gap-2 text-sm text-gray-600'>
                              <IconPackage className='h-4 w-4' />
                              <span className='font-medium'>
                                {calculateTotals().totalItems} sản phẩm
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Selected Orders Detail */}
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-base'>
                          <IconClipboardList className='h-5 w-5' />
                          Chi tiết đơn hàng được chọn
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-4'>
                          {availableOrders
                            .filter((order) =>
                              selectedOrderIds.includes(order.id)
                            )
                            .map((order) => (
                              <div
                                key={order.id}
                                className='rounded-lg border bg-gray-50 p-4 dark:bg-gray-800 dark:text-white'
                              >
                                <div className='mb-3 flex items-center justify-between'>
                                  <div className='flex items-center gap-2'>
                                    <span className='font-medium'>
                                      {order.id}
                                    </span>
                                    <Badge
                                      className={`text-xs ${
                                        order.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : order.status === 'confirmed'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      {order.status === 'pending'
                                        ? 'Chờ xử lý'
                                        : order.status === 'confirmed'
                                          ? 'Đã xác nhận'
                                          : 'Khác'}
                                    </Badge>
                                  </div>
                                  <span className='text-sm text-gray-600'>
                                    {new Date(
                                      order.deliveryDate
                                    ).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>

                                <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-3'>
                                  <div className='flex items-center gap-2'>
                                    <IconWeight className='h-4 w-4 text-gray-500' />
                                    <span>{order.totalWeight} kg</span>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <IconCube className='h-4 w-4 text-gray-500' />
                                    <span>{order.totalVolume} m³</span>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <IconPackage className='h-4 w-4 text-gray-500' />
                                    <span>
                                      {order.items?.length || 0} sản phẩm
                                    </span>
                                  </div>
                                </div>

                                {/* Products List */}
                                {order.items && order.items.length > 0 && (
                                  <div className='mt-4 space-y-2'>
                                    <h5 className='text-sm font-medium'>
                                      Sản phẩm:
                                    </h5>
                                    <div className='space-y-2'>
                                      {order.items.map((item, idx) => (
                                        <div
                                          key={idx}
                                          className='flex items-center justify-between rounded border bg-white p-2 dark:bg-gray-800 dark:text-white'
                                        >
                                          <div className='flex-1'>
                                            <span className='text-sm font-medium'>
                                              {item.productName}
                                            </span>
                                            <div className='mt-1 flex items-center gap-2'>
                                              <span className='text-xs text-gray-600 dark:text-white'>
                                                Số lượng: {item.quantity}{' '}
                                                {item.unit}
                                              </span>
                                              <span className='text-xs text-gray-600 dark:text-white'>
                                                Trọng lượng: {item.weight} kg
                                              </span>
                                            </div>
                                          </div>
                                          <Badge
                                            variant='outline'
                                            className='text-xs'
                                          >
                                            {item.unit}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Notes Section */}
                    <FormField
                      control={form.control}
                      name='notes'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ghi chú</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Ghi chú thêm về đơn xuất kho...'
                              className='min-h-[100px]'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

              {/* Submit Buttons */}
              {currentStep >= 4 &&
                selectedConsignee &&
                selectedOrderIds.length > 0 && (
                  <div className='flex gap-2 border-t pt-4'>
                    <Button type='submit' disabled={isSubmitting}>
                      <IconPackageExport className='mr-2 h-4 w-4' />
                      {isSubmitting ? 'Đang tạo...' : 'Tạo đơn xuất kho'}
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => {
                        form.reset();
                        setSelectedArea(null);
                        setSelectedConsignee(null);
                        setAvailableOrders([]);
                        setSelectedOrderIds([]);
                        setCurrentStep(1);
                      }}
                    >
                      Làm mới
                    </Button>
                  </div>
                )}
            </Form>
          </CardContent>
        </Card>

        {/* Export Orders List */}
        {exportOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Đơn xuất kho đã tạo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {exportOrders.map((order) => (
                  <div key={order.id} className='rounded-lg border p-4'>
                    <div className='mb-2 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline'>{order.id}</Badge>
                        <span className='font-medium'>
                          {order.consigneeName}
                        </span>
                      </div>
                      <Badge>{order.status}</Badge>
                    </div>
                    <div className='text-muted-foreground space-y-1 text-sm'>
                      <p>Khu vực: {order.areaName}</p>
                      <p>Địa chỉ: {order.consigneeAddress}</p>
                      <p>
                        Đơn hàng: {order.totalOrders} đơn, {order.totalItems}{' '}
                        sản phẩm
                      </p>
                      <p>Tổng trọng lượng: {order.totalWeight} kg</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
