'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  IconUser,
  IconPlus,
  IconTrash,
  IconCheck,
  IconAlertTriangle,
  IconPackage
} from '@tabler/icons-react';
import { toast } from 'sonner';

// Type definitions
interface StockInfo {
  available: number;
  reserved: number;
  total: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  stockByArea: Record<string, StockInfo>;
}

// Product item schema for multiple products
const productItemSchema = z.object({
  productId: z.string().min(1, 'Vui lòng chọn sản phẩm'),
  quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
  unit: z.string().min(1, 'Vui lòng chọn đơn vị')
});

// Main form schema
const exportFormSchema = z.object({
  areaId: z.string().min(1, 'Vui lòng chọn khu vực'),
  products: z
    .array(productItemSchema)
    .min(1, 'Vui lòng thêm ít nhất một sản phẩm'),
  customerName: z.string().min(1, 'Vui lòng nhập tên khách hàng'),
  customerPhone: z.string().optional(),
  destination: z.string().min(1, 'Vui lòng nhập địa chỉ giao hàng'),
  notes: z.string().optional()
});

type ExportFormData = z.infer<typeof exportFormSchema>;
type ProductItem = z.infer<typeof productItemSchema>;

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
      capacity: 600,
      currentStock: 400,
      temperature: 25,
      humidity: 60
    }
  ]
};

// Mock products with stock by area
const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Cà chua cherry',
    sku: 'CT001',
    category: 'Rau củ quả',
    unit: 'kg',
    stockByArea: {
      'area-001': { available: 150, reserved: 20, total: 170 },
      'area-002': { available: 80, reserved: 10, total: 90 }
    }
  },
  {
    id: 'prod-002',
    name: 'Táo Fuji',
    sku: 'TF002',
    category: 'Trái cây',
    unit: 'kg',
    stockByArea: {
      'area-002': { available: 200, reserved: 30, total: 230 },
      'area-003': { available: 50, reserved: 5, total: 55 }
    }
  },
  {
    id: 'prod-003',
    name: 'Thịt bò Úc',
    sku: 'TB003',
    category: 'Thịt',
    unit: 'kg',
    stockByArea: {
      'area-003': { available: 100, reserved: 15, total: 115 }
    }
  },
  {
    id: 'prod-004',
    name: 'Cá hồi Na Uy',
    sku: 'CH004',
    category: 'Hải sản',
    unit: 'kg',
    stockByArea: {
      'area-003': { available: 75, reserved: 10, total: 85 }
    }
  },
  {
    id: 'prod-005',
    name: 'Gạo ST25',
    sku: 'G005',
    category: 'Ngũ cốc',
    unit: 'bao',
    stockByArea: {
      'area-004': { available: 500, reserved: 50, total: 550 }
    }
  },
  {
    id: 'prod-006',
    name: 'Dầu ăn',
    sku: 'DA006',
    category: 'Gia vị',
    unit: 'lít',
    stockByArea: {
      'area-004': { available: 300, reserved: 25, total: 325 }
    }
  }
];

const units = ['kg', 'tấn'];

export function WarehouseExport() {
  // State management
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [productItems, setProductItems] = useState<ProductItem[]>([
    { productId: '', quantity: 1, unit: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exportOrders, setExportOrders] = useState<any[]>([]);

  // Form setup
  const form = useForm<ExportFormData>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      areaId: '',
      products: [{ productId: '', quantity: 1, unit: '' }],
      customerName: '',
      customerPhone: '',
      destination: '',
      notes: ''
    }
  });

  // Event handlers
  const handleAreaChange = (areaId: string) => {
    const area = mockWarehouse.areas.find((a: any) => a.id === areaId);
    setSelectedArea(area);

    // Filter products available in this area
    const productsInArea = mockProducts.filter(
      (product) => product.stockByArea && product.stockByArea[areaId]
    );
    setAvailableProducts(productsInArea);

    // Reset product items when area changes
    setProductItems([{ productId: '', quantity: 1, unit: '' }]);
    form.setValue('products', [{ productId: '', quantity: 1, unit: '' }]);
  };

  // Product management functions
  const addProductItem = () => {
    const newItem: ProductItem = { productId: '', quantity: 1, unit: '' };
    const updatedItems = [...productItems, newItem];
    setProductItems(updatedItems);
    form.setValue('products', updatedItems);
  };

  const removeProductItem = (index: number) => {
    if (productItems.length > 1) {
      const updatedItems = productItems.filter((_, i) => i !== index);
      setProductItems(updatedItems);
      form.setValue('products', updatedItems);
    }
  };

  const updateProductItem = (
    index: number,
    field: keyof ProductItem,
    value: any
  ) => {
    const updatedItems = [...productItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Auto-set unit when product is selected
    if (field === 'productId' && value) {
      const product = availableProducts.find((p) => p.id === value);
      if (product) {
        updatedItems[index].unit = product.unit;
      }
    }

    setProductItems(updatedItems);
    form.setValue('products', updatedItems);
  };

  // Get stock information for a product
  const getProductStock = (productId: string): StockInfo | null => {
    if (!selectedArea || !productId) return null;
    const product = availableProducts.find((p) => p.id === productId);
    return product?.stockByArea?.[selectedArea.id] || null;
  };

  const handleSubmit = async (data: ExportFormData) => {
    setIsSubmitting(true);
    try {
      // Validate stock availability
      const stockValidation = data.products.map((item) => {
        const stock = getProductStock(item.productId);
        const product = availableProducts.find((p) => p.id === item.productId);

        if (!stock || item.quantity > stock.available) {
          return {
            valid: false,
            productName: product?.name || 'Unknown',
            requested: item.quantity,
            available: stock?.available || 0
          };
        }
        return { valid: true };
      });

      const invalidItems = stockValidation.filter((item) => !item.valid);
      if (invalidItems.length > 0) {
        const errorMessage = invalidItems
          .map(
            (item) =>
              `${item.productName}: yêu cầu ${item.requested}, chỉ có ${item.available} khả dụng`
          )
          .join('\n');

        toast.error(`Không đủ hàng tồn kho:\n${errorMessage}`);
        setIsSubmitting(false);
        return;
      }

      // Create new order
      const validatedProducts = data.products.map((item) => {
        const product = availableProducts.find((p) => p.id === item.productId);
        const stock = getProductStock(item.productId);
        return {
          ...product,
          quantity: item.quantity,
          unit: item.unit,
          stockInfo: stock
        };
      });

      const newOrder = {
        id: `EXP-${Date.now()}`,
        warehouseId: mockWarehouse.id,
        warehouseName: mockWarehouse.name,
        areaId: selectedArea.id,
        areaName: selectedArea.name,
        products: validatedProducts,
        customerName: data.customerName,
        customerPhone: data.customerPhone || '',
        destination: data.destination,
        notes: data.notes || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: 'current-user'
      };

      setExportOrders([newOrder, ...exportOrders]);

      // Reset form
      form.reset();
      setSelectedArea(null);
      setAvailableProducts([]);
      setProductItems([{ productId: '', quantity: 1, unit: '' }]);

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
              {/* Area Selection */}
              <div className='flex items-center'>
                <div className='w-[200px]'>
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
                        >
                          <FormControl>
                            <SelectTrigger className='w-[250px]'>
                              <SelectValue placeholder='Chọn khu vực trong kho' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockWarehouse.areas.map((area: any) => (
                              <SelectItem key={area.id} value={area.id}>
                                <div className='flex w-[200px] items-center gap-2'>
                                  <IconBuilding className='h-4 w-4' />
                                  {area.name}
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
              </div>

              {/* Area Information Display */}
              {selectedArea && (
                <div className='bg-muted/50 rounded-lg p-4'>
                  <h4 className='mb-3 flex items-center gap-2 font-medium'>
                    <IconBuilding className='h-4 w-4' />
                    Thông tin khu vực: {selectedArea.name}
                  </h4>
                  <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
                    <div>
                      <span className='text-muted-foreground'>Sức chứa:</span>
                      <p className='font-medium'>{selectedArea.capacity} </p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Đã sử dụng:</span>
                      <p className='font-medium'>{selectedArea.currentStock}</p>
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

                  {availableProducts.length > 0 && (
                    <div className='mt-4'>
                      <h5 className='mb-2 text-sm font-medium'>
                        Sản phẩm có sẵn trong khu vực:
                      </h5>
                      <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                        {availableProducts.map((product) => {
                          const stock = product.stockByArea?.[selectedArea.id];
                          if (!stock) return null;
                          return (
                            <div
                              key={product.id}
                              className='bg-background flex items-center justify-between rounded p-2 text-xs'
                            >
                              <div>
                                <span className='font-medium'>
                                  {product.name}
                                </span>
                                <span className='text-muted-foreground ml-1'>
                                  ({product.sku})
                                </span>
                              </div>
                              <div className='text-right'>
                                <div className='font-medium text-green-600'>
                                  {stock.available} {product.unit} khả dụng
                                </div>
                                {/* <div className='text-muted-foreground'>
                                  {stock.reserved} {product.unit} đã đặt
                                </div> */}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Products Section */}
              {selectedArea && availableProducts.length > 0 && (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h4 className='flex items-center gap-2 font-medium'>
                      <IconPackage className='h-4 w-4' />
                      Danh sách sản phẩm xuất
                    </h4>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={addProductItem}
                      className='flex items-center gap-1'
                    >
                      <IconPlus className='h-4 w-4' />
                      Thêm sản phẩm
                    </Button>
                  </div>

                  {productItems.map((item, index) => {
                    const stock = getProductStock(item.productId);
                    const product = availableProducts.find(
                      (p) => p.id === item.productId
                    );
                    const isStockInsufficient =
                      stock && item.quantity > stock.available;

                    return (
                      <Card
                        key={index}
                        className={`p-4 ${isStockInsufficient ? 'border-red-200 bg-red-50' : ''}`}
                      >
                        <div className='flex items-start gap-4'>
                          <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-4'>
                            {/* Product Selection */}
                            <div className='md:col-span-2'>
                              <label className='mb-2 block text-sm font-medium'>
                                Sản phẩm *
                              </label>
                              <Select
                                value={item.productId}
                                onValueChange={(value) =>
                                  updateProductItem(index, 'productId', value)
                                }
                              >
                                <SelectTrigger className='w-[250px]'>
                                  <SelectValue placeholder='Chọn sản phẩm' />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableProducts.map((product) => (
                                    <SelectItem
                                      key={product.id}
                                      value={product.id}
                                    >
                                      <div className='flex w-[200px] items-center gap-2'>
                                        <IconBarcode className='h-4 w-4' />
                                        {product.name} ({product.sku})
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Quantity */}
                            <div>
                              <label className='mb-2 block text-sm font-medium'>
                                Số lượng *
                              </label>
                              <Input
                                type='number'
                                min='1'
                                value={item.quantity}
                                onChange={(e) =>
                                  updateProductItem(
                                    index,
                                    'quantity',
                                    Number(e.target.value)
                                  )
                                }
                                className={
                                  isStockInsufficient ? 'border-red-300' : ''
                                }
                              />
                            </div>

                            {/* Unit */}
                            <div>
                              <label className='mb-2 block text-sm font-medium'>
                                Đơn vị *
                              </label>
                              <div className='w-[50px]'>
                                <Select
                                  value={item.unit}
                                  onValueChange={(value) =>
                                    updateProductItem(index, 'unit', value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder='Đơn vị' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {units.map((unit) => (
                                      <SelectItem key={unit} value={unit}>
                                        {unit}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          {/* Remove Button */}
                          {productItems.length > 1 && (
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => removeProductItem(index)}
                              className='text-red-600 hover:bg-red-50 hover:text-red-700'
                            >
                              <IconTrash className='h-4 w-4' />
                            </Button>
                          )}
                        </div>

                        {/* Stock Information */}
                        {stock && product && (
                          <div className='mt-3 border-t pt-3'>
                            <div className='flex items-center justify-between text-sm'>
                              <div className='flex items-center gap-4'>
                                <div className='flex items-center gap-1'>
                                  <IconCheck className='h-4 w-4 text-green-600' />
                                  <span>
                                    Khả dụng:{' '}
                                    <strong>
                                      {stock.available} {product.unit}
                                    </strong>
                                  </span>
                                </div>
                              </div>
                              {isStockInsufficient && (
                                <div className='flex items-center gap-1 text-red-600'>
                                  <IconAlertTriangle className='h-4 w-4' />
                                  <span className='text-xs'>
                                    Không đủ hàng tồn kho
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Customer and Delivery Information */}
              {selectedArea && (
                <div className='space-y-4'>
                  <h4 className='flex items-center gap-2 font-medium'>
                    <IconUser className='h-4 w-4' />
                    Thông tin khách hàng và giao hàng
                  </h4>

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='customerName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên khách hàng *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Nhập tên khách hàng'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='customerPhone'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Nhập số điện thoại'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='destination'
                      render={({ field }) => (
                        <FormItem className='md:col-span-2'>
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
                </div>
              )}

              {/* Submit Buttons */}
              {selectedArea && (
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
                      setAvailableProducts([]);
                      setProductItems([
                        { productId: '', quantity: 1, unit: '' }
                      ]);
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
                          {order.customerName}
                        </span>
                      </div>
                      <Badge>{order.status}</Badge>
                    </div>
                    <div className='text-muted-foreground text-sm'>
                      <p>Khu vực: {order.areaName}</p>
                      <p>Địa chỉ: {order.destination}</p>
                      <p>Sản phẩm: {order.products.length} loại</p>
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
