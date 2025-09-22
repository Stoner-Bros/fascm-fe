'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  IconActivity,
  IconBuilding,
  IconClock,
  IconDownload,
  IconPackage,
  IconRefresh,
  IconSearch,
  IconTruck,
  IconMapPin,
  IconThermometer,
  IconDroplet,
  IconUsers,
  IconWeight,
  IconCube
} from '@tabler/icons-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { OutboundDelivery, Truck, Order } from '@/types/delivery';
import { OrderManagement } from './order-management';

// Mock truck data
const mockTrucks: Truck[] = [
  {
    id: 'TRUCK-001',
    licenseNumber: 'HY-29A-12345',
    model: 'Hyundai H350 Refrigerated',
    capacity: 2000,
    maxWeight: 2500,
    volume: 15.5,
    fuelType: 'diesel',
    status: 'available',
    gpsDevice: {
      deviceId: 'GPS-001',
      isActive: true,
      lastUpdate: new Date().toISOString()
    },
    environmentSensors: {
      temperatureSensorId: 'TEMP-001',
      humiditySensorId: 'HUM-001',
      isActive: true,
      lastUpdate: new Date().toISOString()
    },
    transportStaff: [
      {
        id: 'STAFF-001',
        name: 'Nguyễn Văn A',
        phone: '0987654321',
        role: 'driver',
        licenseNumber: 'B2-123456789',
        experience: 5
      },
      {
        id: 'STAFF-002',
        name: 'Trần Văn B',
        phone: '0976543210',
        role: 'assistant',
        experience: 3
      }
    ],
    registrationExpiry: '2025-12-31'
  },
  {
    id: 'TRUCK-002',
    licenseNumber: 'HN-30B-67890',
    model: 'Isuzu NPR Cooler Truck',
    capacity: 1500,
    maxWeight: 2000,
    volume: 12.0,
    fuelType: 'diesel',
    status: 'available',
    gpsDevice: {
      deviceId: 'GPS-002',
      isActive: true,
      lastUpdate: new Date().toISOString()
    },
    environmentSensors: {
      temperatureSensorId: 'TEMP-002',
      humiditySensorId: 'HUM-002',
      isActive: true,
      lastUpdate: new Date().toISOString()
    },
    transportStaff: [
      {
        id: 'STAFF-003',
        name: 'Lê Văn C',
        phone: '0965432109',
        role: 'driver',
        licenseNumber: 'C-987654321',
        experience: 8
      },
      {
        id: 'STAFF-004',
        name: 'Phạm Văn D',
        phone: '0954321098',
        role: 'assistant',
        experience: 2
      }
    ],
    registrationExpiry: '2025-08-15'
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
    totalValue: 4500000,
    deliveryDate: '2024-09-18T14:00:00',
    priority: 'high',
    requiresSignature: true,
    status: 'confirmed',
    createdAt: '2024-09-17T08:00:00',
    updatedAt: '2024-09-17T10:00:00'
  },
  {
    id: 'ORD-2024-002',
    customerId: 'CUST-002',
    customerName: 'Nhà hàng Hải Sản Tươi',
    customerAddress: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
    customerContact: '0287654321',
    customerType: 'restaurant',
    items: [
      {
        id: 'ITEM-003',
        productId: 'PROD-003',
        productName: 'Hải sản đông lạnh',
        quantity: 80,
        unit: 'kg',
        weight: 80,
        volume: 1.2,
        specialRequirements: 'Đông lạnh -2°C'
      }
    ],
    totalWeight: 80,
    totalVolume: 1.2,
    totalValue: 2400000,
    deliveryDate: '2024-09-18T11:30:00',
    priority: 'urgent',
    requiresSignature: true,
    status: 'confirmed',
    createdAt: '2024-09-17T15:00:00',
    updatedAt: '2024-09-17T16:00:00'
  }
];

export function SimpleOutboundDelivery() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<OutboundDelivery[]>([
    {
      id: 'OUT-2024-001',
      warehouseId: 'WH-001',
      warehouseName: 'Kho Trung tâm Hà Nội',
      warehouseAddress: 'Số 123 Đường Giải Phóng, Hai Bà Trưng, Hà Nội',
      truckId: 'TRUCK-001',
      truck: mockTrucks[0],
      orders: [mockOrders[0]],
      totalWeight: 150,
      totalVolume: 2.3,
      totalValue: 4500000,
      departureTime: '2024-09-18T06:00:00',
      estimatedArrival: '2024-09-18T14:00:00',
      actualArrival: '2024-09-18T13:45:00',
      status: 'completed',
      monitoring: {
        truckId: 'TRUCK-001',
        location: {
          latitude: 10.7769,
          longitude: 106.7009,
          address: 'Siêu thị BigC, Quận 1, TP.HCM',
          timestamp: '2024-09-18T13:45:00'
        },
        environment: {
          temperature: 4.5,
          humidity: 65,
          timestamp: '2024-09-18T13:45:00'
        },
        speed: 0,
        fuel: 75,
        isMoving: false,
        lastUpdate: '2024-09-18T13:45:00'
      },
      route: [
        {
          orderId: 'ORD-2024-001',
          customerName: 'Siêu thị BigC',
          customerAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
          estimatedArrival: '2024-09-18T14:00:00',
          actualArrival: '2024-09-18T13:45:00',
          status: 'delivered'
        }
      ],
      priorityLevel: 'high',
      specialHandling: 'Bảo quản lạnh',
      notes:
        'Giao hàng thành công, đã có chữ ký xác nhận. Xe có 2 nhân viên vận chuyển.',
      createdAt: '2024-09-17T08:00:00',
      updatedAt: '2024-09-18T14:00:00'
    }
  ]);

  const handleCreateDelivery = (orders: Order[], truck: Truck) => {
    const newDelivery: OutboundDelivery = {
      id: `OUT-2024-${(deliveries.length + 1).toString().padStart(3, '0')}`,
      warehouseId: 'WH-001',
      warehouseName: 'Kho Trung tâm Hà Nội',
      warehouseAddress: 'Số 123 Đường Giải Phóng, Hai Bà Trưng, Hà Nội',
      truckId: truck.id,
      truck: truck,
      orders: orders,
      totalWeight: orders.reduce((sum, order) => sum + order.totalWeight, 0),
      totalVolume: orders.reduce((sum, order) => sum + order.totalVolume, 0),
      totalValue: orders.reduce((sum, order) => sum + order.totalValue, 0),
      departureTime: new Date().toISOString(),
      estimatedArrival: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      route: orders.map((order) => ({
        orderId: order.id,
        customerName: order.customerName,
        customerAddress: order.customerAddress,
        estimatedArrival: order.deliveryDate,
        status: 'pending'
      })),
      priorityLevel: orders.some((o) => o.priority === 'urgent')
        ? 'urgent'
        : orders.some((o) => o.priority === 'high')
          ? 'high'
          : 'medium',
      notes: `Vận chuyển ${orders.length} đơn hàng với xe ${truck.licenseNumber}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDeliveries([...deliveries, newDelivery]);
  };

  const getStatusBadge = (status: OutboundDelivery['status']) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge className='border-gray-200 bg-gray-100 text-gray-700'>
            Đã lên lịch
          </Badge>
        );
      case 'loading':
        return (
          <Badge className='border-yellow-200 bg-yellow-100 text-yellow-700'>
            Đang chất hàng
          </Badge>
        );
      case 'departed':
        return (
          <Badge className='border-orange-200 bg-orange-100 text-orange-700'>
            Đã khởi hành
          </Badge>
        );
      case 'in_transit':
        return (
          <Badge className='border-blue-200 bg-blue-100 text-blue-700'>
            Đang vận chuyển
          </Badge>
        );
      case 'delivering':
        return (
          <Badge className='border-purple-200 bg-purple-100 text-purple-700'>
            Đang giao hàng
          </Badge>
        );
      case 'completed':
        return (
          <Badge className='border-green-200 bg-green-100 text-green-700'>
            Hoàn thành
          </Badge>
        );
      case 'returned':
        return (
          <Badge className='border-red-200 bg-red-100 text-red-700'>
            Đã trả về
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className='border-red-200 bg-red-100 text-red-700'>
            Đã hủy
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <IconBuilding className='h-8 w-8 text-blue-600' />
            Vận chuyển Xuất kho (Outbound)
          </h1>
          <p className='text-muted-foreground'>
            Quản lý các đợt vận chuyển từ kho ra điểm phân phối với kiểm soát
            tải trọng
          </p>
        </div>
        <Button variant='outline' size='sm'>
          <IconDownload className='mr-2 h-4 w-4' />
          Xuất báo cáo
        </Button>
      </div>

      {/* Summary Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng đợt</CardTitle>
            <IconActivity className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{deliveries.length}</div>
            <p className='text-muted-foreground text-xs'>đợt vận chuyển</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Đang vận chuyển
            </CardTitle>
            <IconTruck className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {deliveries.filter((d) => d.status === 'in_transit').length}
            </div>
            <p className='text-muted-foreground text-xs'>đang trên đường</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Hoàn thành</CardTitle>
            <IconPackage className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {deliveries.filter((d) => d.status === 'completed').length}
            </div>
            <p className='text-muted-foreground text-xs'>đã giao xong</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Xe khả dụng</CardTitle>
            <IconTruck className='h-4 w-4 text-orange-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {mockTrucks.filter((t) => t.status === 'available').length}
            </div>
            <p className='text-muted-foreground text-xs'>sẵn sàng</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Management */}
      <OrderManagement
        availableOrders={mockOrders}
        availableTrucks={mockTrucks}
        onCreateDelivery={handleCreateDelivery}
      />

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đợt vận chuyển xuất kho</CardTitle>
          <CardDescription>
            Quản lý và theo dõi các đợt vận chuyển từ kho ra điểm phân phối
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đợt</TableHead>
                <TableHead>Xe tải & Nhân viên</TableHead>
                <TableHead>Đơn hàng</TableHead>
                <TableHead>Tải trọng & Thể tích</TableHead>
                <TableHead>Giám sát</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow
                  key={delivery.id}
                  className='hover:bg-muted/50 cursor-pointer'
                  onClick={() =>
                    router.push(`/dashboard/delivery/outbound/${delivery.id}`)
                  }
                >
                  <TableCell className='font-medium'>{delivery.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className='flex items-center gap-2 font-medium'>
                        <IconTruck className='h-4 w-4' />
                        {delivery.truck.licenseNumber}
                      </div>
                      <div className='text-muted-foreground text-sm'>
                        {delivery.truck.model}
                      </div>
                      <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                        <IconUsers className='h-3 w-3' />
                        {delivery.truck.transportStaff.length} nhân viên
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      {delivery.orders.slice(0, 2).map((order) => (
                        <div key={order.id} className='text-sm'>
                          <div className='font-medium'>
                            {order.customerName}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            {order.items.length} sản phẩm -{' '}
                            {formatCurrency(order.totalValue)}
                          </div>
                        </div>
                      ))}
                      {delivery.orders.length > 2 && (
                        <div className='text-muted-foreground text-xs'>
                          +{delivery.orders.length - 2} đơn nữa
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-1 text-xs'>
                        <IconWeight className='h-3 w-3' />
                        <span>
                          {delivery.totalWeight}kg / {delivery.truck.maxWeight}
                          kg
                        </span>
                      </div>
                      <div className='flex items-center gap-1 text-xs'>
                        <IconCube className='h-3 w-3' />
                        <span>
                          {delivery.totalVolume}m³ / {delivery.truck.volume}m³
                        </span>
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        Sử dụng:{' '}
                        {(
                          (delivery.totalWeight / delivery.truck.maxWeight) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {delivery.monitoring ? (
                      <div className='space-y-1'>
                        <div className='flex items-center gap-1 text-xs'>
                          <IconMapPin className='h-3 w-3 text-blue-600' />
                          <span className='text-muted-foreground'>
                            {delivery.monitoring.location.address?.substring(
                              0,
                              20
                            )}
                            ...
                          </span>
                        </div>
                        <div className='flex items-center gap-1 text-xs'>
                          <IconThermometer className='h-3 w-3 text-orange-600' />
                          <span>
                            {delivery.monitoring.environment.temperature}°C
                          </span>
                        </div>
                        <div className='flex items-center gap-1 text-xs'>
                          <IconDroplet className='h-3 w-3 text-blue-500' />
                          <span>
                            {delivery.monitoring.environment.humidity}%
                          </span>
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          {delivery.monitoring.isMoving ? (
                            <Badge
                              variant='outline'
                              className='bg-green-50 text-green-700'
                            >
                              Di chuyển {delivery.monitoring.speed}km/h
                            </Badge>
                          ) : (
                            <Badge
                              variant='outline'
                              className='bg-gray-50 text-gray-700'
                            >
                              Đã dừng
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className='text-muted-foreground text-xs'>
                        Chưa có dữ liệu
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>
                      <div>
                        Khởi hành: {formatDateTime(delivery.departureTime)}
                      </div>
                      <div className='text-muted-foreground'>
                        Dự kiến: {formatDateTime(delivery.estimatedArrival)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
