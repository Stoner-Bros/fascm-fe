'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  IconPackageExport,
  IconBuilding,
  IconBarcode,
  IconUser
} from '@tabler/icons-react';
import { toast } from 'sonner';

// Simplified schema focusing on warehouse and area
const stockExportSchema = z.object({
  productId: z.string().min(1, 'Vui lòng chọn sản phẩm'),
  warehouseId: z.string().min(1, 'Vui lòng chọn kho'),
  areaId: z.string().min(1, 'Vui lòng chọn khu vực'),
  quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
  unit: z.string().min(1, 'Vui lòng chọn đơn vị'),
  destination: z.string().min(1, 'Vui lòng nhập địa chỉ giao hàng'),
  customerId: z.string().min(1, 'Vui lòng chọn khách hàng'),
  notes: z.string().optional()
});

type StockExportFormData = z.infer<typeof stockExportSchema>;

// Mock data
const mockWarehouses = [
  {
    id: 'wh-001',
    name: 'Kho Hà Nội',
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
      }
    ]
  },
  {
    id: 'wh-002',
    name: 'Kho TP.HCM',
    location: 'TP. Hồ Chí Minh',
    areas: [
      {
        id: 'area-004',
        name: 'Khu B1 - Rau củ',
        capacity: 1200,
        currentStock: 900,
        temperature: 6,
        humidity: 82
      },
      {
        id: 'area-005',
        name: 'Khu B2 - Thịt cá',
        capacity: 600,
        currentStock: 400,
        temperature: 2,
        humidity: 75
      }
    ]
  }
];

const mockProducts = [
  {
    id: 'prod-001',
    name: 'Cà chua cherry',
    sku: 'CT001',
    category: 'Rau củ quả',
    unit: 'kg'
  },
  {
    id: 'prod-002',
    name: 'Táo Fuji',
    sku: 'TF002',
    category: 'Trái cây',
    unit: 'kg'
  },
  {
    id: 'prod-003',
    name: 'Thịt bò Úc',
    sku: 'TB003',
    category: 'Thịt',
    unit: 'kg'
  },
  {
    id: 'prod-004',
    name: 'Cá hồi Na Uy',
    sku: 'CH004',
    category: 'Hải sản',
    unit: 'kg'
  }
];

const mockCustomers = [
  {
    id: 'cust-001',
    name: 'Siêu thị BigC',
    address: '123 Nguyễn Trãi, Hà Nội',
    phone: '024-1234-5678'
  },
  {
    id: 'cust-002',
    name: 'Cửa hàng FreshMart',
    address: '456 Lê Lợi, TP.HCM',
    phone: '028-9876-5432'
  },
  {
    id: 'cust-003',
    name: 'Nhà hàng Golden Dragon',
    address: '789 Trần Hưng Đạo, Đà Nẵng',
    phone: '0236-555-1234'
  }
];

const units = ['kg', 'tấn', 'thùng', 'bao', 'lít'];

export function WarehouseExport() {
  // Form states
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exportOrders, setExportOrders] = useState<any[]>([]);

  // Form setup
  const form = useForm<StockExportFormData>({
    resolver: zodResolver(stockExportSchema),
    defaultValues: {
      productId: '',
      warehouseId: '',
      areaId: '',
      quantity: 1,
      unit: '',
      destination: '',
      customerId: '',
      notes: ''
    }
  });

  // Handlers
  const handleWarehouseChange = (warehouseId: string) => {
    const warehouse = mockWarehouses.find((w) => w.id === warehouseId);
    setSelectedWarehouse(warehouse);
    setSelectedArea(null);
    form.setValue('warehouseId', warehouseId);
    form.setValue('areaId', '');
  };

  const handleAreaChange = (areaId: string) => {
    const area = selectedWarehouse?.areas.find((a: any) => a.id === areaId);
    setSelectedArea(area);
    form.setValue('areaId', areaId);
  };

  const handleProductChange = (productId: string) => {
    const product = mockProducts.find((p) => p.id === productId);
    setSelectedProduct(product);
    form.setValue('productId', productId);
    if (product) {
      form.setValue('unit', product.unit);
    }
  };

  const generateExportCode = () => {
    const timestamp = format(new Date(), 'yyyyMMddHHmmss');
    return `EXP-${timestamp}`;
  };

  const handleSubmit = async (data: StockExportFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Export data:', data);

      // Create new export order
      const newOrder = {
        id: Date.now(),
        exportCode: generateExportCode(),
        warehouse: selectedWarehouse,
        area: selectedArea,
        product: selectedProduct,
        quantity: data.quantity,
        unit: data.unit,
        destination: data.destination,
        customer: mockCustomers.find((c) => c.id === data.customerId),
        notes: data.notes,
        timestamp: new Date().toLocaleString('vi-VN'),
        status: 'Đã tạo',
        blockchainHash: `0x${Math.random().toString(16).substr(2, 8)}`
      };

      setExportOrders([newOrder, ...exportOrders]);

      // Reset form after successful submission
      form.reset();
      setSelectedWarehouse(null);
      setSelectedArea(null);
      setSelectedProduct(null);

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
              Tạo đơn xuất kho từ kho và khu vực cụ thể
            </p>
          </div>
        </div>

        {/* Export Form */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconPackageExport className='h-5 w-5' />
              Tạo đơn xuất kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form
              form={form as any}
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-6'
            >
              {/* Basic Information */}
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='warehouseId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kho hàng *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleWarehouseChange(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn kho hàng' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockWarehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              <div className='flex items-center gap-2'>
                                <IconBuilding className='h-4 w-4' />
                                {warehouse.name} - {warehouse.location}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='areaId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Khu vực *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleAreaChange(value);
                        }}
                        disabled={!selectedWarehouse}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn khu vực' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedWarehouse?.areas.map((area: any) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='productId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sản phẩm *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleProductChange(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn sản phẩm' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              <div className='flex items-center gap-2'>
                                <IconBarcode className='h-4 w-4' />
                                {product.name} ({product.sku})
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-2 gap-2'>
                  <FormField
                    control={form.control}
                    name='quantity'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng *</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='0'
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='unit'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đơn vị *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Chọn đơn vị' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='destination'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ giao hàng *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Nhập địa chỉ giao hàng'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='customerId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Khách hàng *</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn khách hàng' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockCustomers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              <div className='flex items-center gap-2'>
                                <IconUser className='h-4 w-4' />
                                {customer.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              {/* Area Information Display */}
              {selectedArea && (
                <div className='bg-muted/50 rounded-lg p-4'>
                  <h4 className='mb-2 font-medium'>Thông tin khu vực</h4>
                  <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
                    <div>
                      <span className='text-muted-foreground'>Sức chứa:</span>
                      <p className='font-medium'>{selectedArea.capacity} m²</p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Đã sử dụng:</span>
                      <p className='font-medium'>
                        {selectedArea.currentStock} m²
                      </p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Nhiệt độ:</span>
                      <p className='font-medium'>
                        {selectedArea.temperature}°C
                      </p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Độ ẩm:</span>
                      <p className='font-medium'>{selectedArea.humidity}%</p>
                    </div>
                  </div>
                </div>
              )}

              <div className='flex gap-2'>
                <Button type='submit' disabled={isSubmitting}>
                  <IconPackageExport className='mr-2 h-4 w-4' />
                  {isSubmitting ? 'Đang tạo...' : 'Tạo đơn xuất kho'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    form.reset();
                    setSelectedWarehouse(null);
                    setSelectedArea(null);
                    setSelectedProduct(null);
                  }}
                >
                  Làm mới
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>

        {/* Export Orders List */}
        {exportOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Danh sách đơn xuất kho</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {exportOrders.map((order) => (
                  <div key={order.id} className='rounded-lg border p-4'>
                    <div className='mb-4 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline'>{order.status}</Badge>
                        <span className='font-mono text-sm'>
                          {order.exportCode}
                        </span>
                      </div>
                      <span className='text-muted-foreground text-sm'>
                        {order.timestamp}
                      </span>
                    </div>

                    <div className='grid gap-4 md:grid-cols-2'>
                      <div>
                        <p className='text-sm'>
                          <strong>Kho:</strong> {order.warehouse?.name}
                        </p>
                        <p className='text-sm'>
                          <strong>Khu vực:</strong> {order.area?.name}
                        </p>
                        <p className='text-sm'>
                          <strong>Sản phẩm:</strong> {order.product?.name}
                        </p>
                        <p className='text-sm'>
                          <strong>Số lượng:</strong> {order.quantity}{' '}
                          {order.unit}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm'>
                          <strong>Khách hàng:</strong> {order.customer?.name}
                        </p>
                        <p className='text-sm'>
                          <strong>Địa chỉ giao:</strong> {order.destination}
                        </p>
                        {order.notes && (
                          <p className='text-sm'>
                            <strong>Ghi chú:</strong> {order.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className='mt-4 flex items-center justify-between border-t pt-4'>
                      <div className='flex items-center gap-2'>
                        <span className='font-mono text-xs'>
                          {order.blockchainHash}
                        </span>
                      </div>
                      <Badge variant='outline' className='text-xs'>
                        Blockchain logged
                      </Badge>
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
