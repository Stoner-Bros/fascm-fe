'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  IconPackageImport,
  IconScan,
  IconBrain,
  IconShield,
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconClipboardCheck,
  IconFileText,
  IconCalendar,
  IconUser,
  IconMapPin,
  IconBarcode,
  IconBuilding,
  IconUpload
} from '@tabler/icons-react';
import { format } from 'date-fns';
import type { Warehouse, Area, Product, Supplier } from '@/types/inventory';

// Schema validation cho form nhập kho
const stockEntrySchema = z
  .object({
    productId: z.string().min(1, 'Vui lòng chọn sản phẩm'),
    warehouseId: z.string().min(1, 'Vui lòng chọn kho'),
    areaId: z.string().min(1, 'Vui lòng chọn khu vực'),
    batchNumber: z.string().min(1, 'Vui lòng nhập mã lô hàng'),
    quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
    unit: z.string().min(1, 'Vui lòng chọn đơn vị'),
    manufacturingDate: z.date({
      required_error: 'Vui lòng chọn ngày sản xuất',
      invalid_type_error: 'Ngày sản xuất không hợp lệ'
    }),
    expiryDate: z.date({
      required_error: 'Vui lòng chọn ngày hết hạn',
      invalid_type_error: 'Ngày hết hạn không hợp lệ'
    }),
    receivedDate: z.date({
      required_error: 'Vui lòng chọn ngày nhập kho',
      invalid_type_error: 'Ngày nhập kho không hợp lệ'
    }),
    origin: z.string().min(1, 'Vui lòng nhập xuất xứ'),
    quality: z.enum(['A', 'B', 'C', 'D'], {
      required_error: 'Vui lòng chọn chất lượng',
      invalid_type_error: 'Chất lượng không hợp lệ'
    }),
    supplierId: z.string().min(1, 'Vui lòng chọn nhà cung cấp'),
    notes: z.string().optional()
  })
  .refine((data) => data.expiryDate > data.manufacturingDate, {
    message: 'Ngày hết hạn phải sau ngày sản xuất',
    path: ['expiryDate']
  })
  .refine((data) => data.receivedDate >= data.manufacturingDate, {
    message: 'Ngày nhập kho không thể trước ngày sản xuất',
    path: ['receivedDate']
  });
type StockEntryFormData = z.infer<typeof stockEntrySchema>;

// Mock data cho warehouses, products, suppliers
const mockWarehouses: Warehouse[] = [
  {
    id: '1',
    name: 'Kho Hà Nội',
    location: 'Hà Nội',
    address: 'Số 123, Đường ABC, Hà Nội',
    status: 'active',
    manager: 'Nguyễn Văn A',
    phone: '0123456789',
    email: 'manager.hn@company.com',
    totalCapacity: 1000,
    currentCapacity: 650,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    areas: [
      {
        id: '1-1',
        warehouseId: '1',
        name: 'Khu A1 - Rau lá',
        capacity: 200,
        currentStock: 120,
        temperature: 4,
        humidity: 85,
        status: 'normal',
        sensors: [],
        products: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '1-2',
        warehouseId: '1',
        name: 'Khu A2 - Trái cây',
        capacity: 300,
        currentStock: 180,
        temperature: 8,
        humidity: 75,
        status: 'normal',
        sensors: [],
        products: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '1-3',
        warehouseId: '1',
        name: 'Khu A3 - Đông lạnh',
        capacity: 250,
        currentStock: 200,
        temperature: -18,
        humidity: 60,
        status: 'warning',
        sensors: [],
        products: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
  },
  {
    id: '2',
    name: 'Kho TP.HCM',
    location: 'TP. Hồ Chí Minh',
    address: 'Số 456, Đường XYZ, TP.HCM',
    status: 'active',
    manager: 'Trần Thị B',
    phone: '0987654321',
    email: 'manager.hcm@company.com',
    totalCapacity: 1500,
    currentCapacity: 800,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    areas: [
      {
        id: '2-1',
        warehouseId: '2',
        name: 'Khu B1 - Rau củ',
        capacity: 400,
        currentStock: 250,
        temperature: 6,
        humidity: 80,
        status: 'normal',
        sensors: [],
        products: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2-2',
        warehouseId: '2',
        name: 'Khu B2 - Ngũ cốc',
        capacity: 500,
        currentStock: 300,
        temperature: 20,
        humidity: 65,
        status: 'normal',
        sensors: [],
        products: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2-3',
        warehouseId: '2',
        name: 'Khu B3 - Thảo mộc',
        capacity: 300,
        currentStock: 150,
        temperature: 15,
        humidity: 70,
        status: 'normal',
        sensors: [],
        products: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
  }
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Cà chua',
    sku: 'VEG-001',
    unit: 'kg',
    category: 'Rau củ quả'
  },
  { id: '2', name: 'Táo', sku: 'FRU-001', unit: 'kg', category: 'Trái cây' },
  {
    id: '3',
    name: 'Gạo ST25',
    sku: 'GRA-001',
    unit: 'kg',
    category: 'Ngũ cốc'
  },
  { id: '4', name: 'Rau cải', sku: 'VEG-002', unit: 'kg', category: 'Rau lá' }
];

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Nông trại ABC',
    contact: '0123456789',
    address: 'Đà Lạt, Lâm Đồng'
  },
  { id: '2', name: 'Công ty XYZ', contact: '0987654321', address: 'Long An' },
  {
    id: '3',
    name: 'HTX Nông nghiệp',
    contact: '0369852147',
    address: 'Cần Thơ'
  }
];

// Mock data cũ
const mockSensorData = {
  temperature: 18.5,
  humidity: 65,
  airQuality: 'Tốt',
  lastUpdate: '2 phút trước'
};

const mockAIAnalysis = {
  riskLevel: 'Thấp',
  predictedShelfLife: '15 ngày',
  qualityScore: 92,
  recommendations: [
    'Duy trì nhiệt độ 16-20°C',
    'Kiểm tra độ ẩm định kỳ',
    'Tách riêng sản phẩm có dấu hiệu hư hỏng'
  ]
};

export function WarehouseImport() {
  // Form states từ stock-entry-form
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null
  );
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // Form setup
  const form = useForm<StockEntryFormData>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: {
      productId: '',
      warehouseId: '',
      areaId: '',
      batchNumber: '',
      quantity: 1,
      unit: '',
      manufacturingDate: new Date(),
      expiryDate: new Date(),
      receivedDate: new Date(),
      origin: '',
      quality: 'A' as const,
      supplierId: '',
      notes: ''
    }
  });

  // States cũ
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [importItems, setImportItems] = useState<any[]>([]);

  // Enhanced validation and tracking states
  const [productName, setProductName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [originLocation, setOriginLocation] = useState('');
  const [qualityGrade, setQualityGrade] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);

  // Xử lý thay đổi kho
  const handleWarehouseChange = (warehouseId: string) => {
    const warehouse = mockWarehouses.find((w) => w.id === warehouseId);
    setSelectedWarehouse(warehouse || null);
    setSelectedArea(null);
    form.setValue('warehouseId', warehouseId);
    form.setValue('areaId', '');
  };

  // Xử lý thay đổi khu vực
  const handleAreaChange = (areaId: string) => {
    if (selectedWarehouse) {
      const area = selectedWarehouse.areas.find((a) => a.id === areaId);
      setSelectedArea(area || null);
      form.setValue('areaId', areaId);
    }
  };

  // Xử lý thay đổi sản phẩm
  const handleProductChange = (productId: string) => {
    const product = mockProducts.find((p) => p.id === productId);
    setSelectedProduct(product || null);
    if (product) {
      form.setValue('productId', productId);
      form.setValue('unit', product.unit);
    }
  };

  // Tự động tạo mã lô hàng
  const generateBatchNumber = () => {
    const today = new Date();
    const dateStr = format(today, 'yyyyMMdd');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `LOT${dateStr}-${randomStr}`;
  };

  // Xử lý submit form
  const handleSubmit = async (data: StockEntryFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newItem = {
        id: Date.now(),
        ...data,
        warehouse: selectedWarehouse,
        area: selectedArea,
        product: selectedProduct,
        supplier: mockSuppliers.find((s) => s.id === data.supplierId),
        timestamp: new Date().toLocaleString('vi-VN'),
        status: 'Đã nhập kho',
        blockchainHash: `0x${Math.random().toString(16).substr(2, 8)}`,
        qrCode: `QR-${Date.now()}`
      };

      setImportItems([...importItems, newItem]);
      form.reset();
      setSelectedWarehouse(null);
      setSelectedArea(null);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error submitting stock entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kiểm tra khả năng chứa của khu vực
  const checkAreaCapacity = (area: Area, quantity: number) => {
    const availableSpace = area.capacity - area.currentStock;
    const estimatedSpace = quantity * 0.1; // Giả sử 1 đơn vị = 0.1m²

    return {
      hasSpace: estimatedSpace <= availableSpace,
      availableSpace,
      estimatedSpace,
      occupancyAfter:
        ((area.currentStock + estimatedSpace) / area.capacity) * 100
    };
  };

  const units = ['kg', 'tấn', 'thùng', 'bao', 'lít', 'chai', 'hộp', 'cái'];
  const qualityOptions = [
    {
      value: 'A',
      label: 'Loại A - Xuất khẩu',
      color: 'bg-green-100 text-green-800'
    },
    {
      value: 'B',
      label: 'Loại B - Nội địa cao cấp',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      value: 'C',
      label: 'Loại C - Nội địa thường',
      color: 'bg-yellow-100 text-yellow-800'
    },
    { value: 'D', label: 'Loại D - Chế biến', color: 'bg-red-100 text-red-800' }
  ];

  // Enhanced validation function
  const validateForm = () => {
    const errors: string[] = [];

    if (!productName.trim()) errors.push('Tên sản phẩm không được để trống');
    if (!selectedCategory) errors.push('Vui lòng chọn loại sản phẩm');
    if (!quantity || Number.parseInt(quantity) <= 0)
      errors.push('Số lượng phải lớn hơn 0');
    if (!supplier.trim()) errors.push('Nhà cung cấp không được để trống');
    if (!batchNumber.trim()) errors.push('Số lô hàng không được để trống');
    if (!expiryDate) errors.push('Ngày hết hạn không được để trống');
    if (!originLocation.trim()) errors.push('Nơi xuất xứ không được để trống');
    if (!qualityGrade) errors.push('Vui lòng chọn cấp độ chất lượng');

    // Check expiry date
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      const today = new Date();
      if (expiry <= today) {
        errors.push('Ngày hết hạn phải sau ngày hiện tại');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleAddItem = () => {
    if (!validateForm()) return;

    setIsValidating(true);

    // Simulate validation process
    setTimeout(() => {
      const newItem = {
        id: Date.now(),
        productName,
        category: selectedCategory,
        quantity: Number.parseInt(quantity),
        supplier,
        notes,
        batchNumber,
        expiryDate,
        originLocation,
        qualityGrade,
        certifications: [...certifications],
        photos: [...photos],
        timestamp: new Date().toLocaleString('vi-VN'),
        status: 'Đã xác thực',
        blockchainHash: `0x${Math.random().toString(16).substr(2, 8)}`,
        qrCode: `QR-${Date.now()}`,
        trackingSteps: [
          {
            step: 1,
            name: 'Tiếp nhận hàng',
            completed: true,
            timestamp: new Date().toLocaleString('vi-VN')
          },
          {
            step: 2,
            name: 'Kiểm tra chất lượng',
            completed: true,
            timestamp: new Date().toLocaleString('vi-VN')
          },
          {
            step: 3,
            name: 'Xác thực thông tin',
            completed: true,
            timestamp: new Date().toLocaleString('vi-VN')
          },
          {
            step: 4,
            name: 'Lưu trữ blockchain',
            completed: true,
            timestamp: new Date().toLocaleString('vi-VN')
          },
          {
            step: 5,
            name: 'Nhập kho hoàn tất',
            completed: true,
            timestamp: new Date().toLocaleString('vi-VN')
          }
        ]
      };

      setImportItems([...importItems, newItem]);
      setIsValidating(false);

      // Reset form
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setProductName('');
    setSelectedCategory('');
    setQuantity('');
    setSupplier('');
    setNotes('');
    setBatchNumber('');
    setExpiryDate('');
    setOriginLocation('');
    setQualityGrade('');
    setCertifications([]);
    setPhotos([]);
    setValidationErrors([]);
    setCurrentStep(1);
  };

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scanning
    setTimeout(() => {
      setIsScanning(false);
      // Auto-fill form with scanned data
      const scannedProduct = mockProducts[0];
      handleProductChange(scannedProduct.id);
      form.setValue('quantity', 50);
      form.setValue('batchNumber', generateBatchNumber());
    }, 2000);
  };

  return (
    <TooltipProvider>
      <PageContainer scrollable={true}>
        <div className='flex flex-1 flex-col space-y-6'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-3xl font-bold tracking-tight'>
                Nhập kho hàng hóa
              </h2>
              <p className='text-muted-foreground'>
                Quản lý nhập kho với AI phân tích và blockchain logging
              </p>
            </div>
            <div className='flex gap-2'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleScan}
                    disabled={isScanning}
                  >
                    <IconScan className='h-4 w-4' />
                    {isScanning ? 'Đang quét...' : 'Quét mã vạch'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Quét mã vạch sản phẩm</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <IconUpload className='h-4 w-4' />
                    Nhập Excel
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Nhập từ file Excel</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            {/* Enhanced Import Form */}
            <Card className='w-full max-w-4xl'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2'>
                      <IconPackageImport className='h-5 w-5' />
                      Nhập kho hàng hóa
                    </CardTitle>
                    <p className='text-muted-foreground text-sm'>
                      Nhập thông tin chi tiết về lô hàng mới vào kho
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Form
                  form={form as any}
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className='space-y-6'
                >
                  {/* Thông tin cơ bản */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Thông tin cơ bản</h3>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      {/* Chọn sản phẩm */}
                      <FormField
                        control={form.control}
                        name='productId'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sản phẩm *</FormLabel>
                            <Select
                              onValueChange={handleProductChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Chọn sản phẩm...' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockProducts.map((product) => (
                                  <SelectItem
                                    key={product.id}
                                    value={product.id}
                                  >
                                    <div className='flex items-center gap-2'>
                                      <span>{product.name}</span>
                                      <Badge variant='outline'>
                                        {product.sku}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Mã lô hàng */}
                      <FormField
                        control={form.control}
                        name='batchNumber'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mã lô hàng *</FormLabel>
                            <div className='flex gap-2'>
                              <FormControl>
                                <Input
                                  placeholder='Nhập mã lô hàng...'
                                  {...field}
                                />
                              </FormControl>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={() =>
                                      form.setValue(
                                        'batchNumber',
                                        generateBatchNumber()
                                      )
                                    }
                                  >
                                    <IconBarcode className='h-4 w-4' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Tự động tạo mã</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                      {/* Số lượng */}
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

                      {/* Đơn vị */}
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
                                  <SelectValue placeholder='Chọn đơn vị...' />
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

                      {/* Chất lượng */}
                      <FormField
                        control={form.control}
                        name='quality'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chất lượng *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Chọn chất lượng...' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {qualityOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    <div className='flex items-center gap-2'>
                                      <Badge
                                        className={option.color}
                                        variant='outline'
                                      >
                                        {option.value}
                                      </Badge>
                                      <span>{option.label}</span>
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

                  {/* Vị trí lưu trữ */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Vị trí lưu trữ</h3>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      {/* Chọn kho */}
                      <FormField
                        control={form.control}
                        name='warehouseId'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kho hàng *</FormLabel>
                            <Select
                              onValueChange={handleWarehouseChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Chọn kho...' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockWarehouses.map((warehouse) => (
                                  <SelectItem
                                    key={warehouse.id}
                                    value={warehouse.id}
                                  >
                                    <div className='flex items-center gap-2'>
                                      <IconBuilding className='h-4 w-4' />
                                      <span>{warehouse.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Chọn khu vực */}
                      <FormField
                        control={form.control}
                        name='areaId'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Khu vực *</FormLabel>
                            <Select
                              onValueChange={handleAreaChange}
                              value={field.value}
                              disabled={!selectedWarehouse}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Chọn khu vực...' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {selectedWarehouse?.areas.map((area) => {
                                  const capacity = checkAreaCapacity(
                                    area,
                                    form.watch('quantity') || 0
                                  );
                                  return (
                                    <SelectItem key={area.id} value={area.id}>
                                      <div className='flex w-full items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                          <IconMapPin className='h-4 w-4' />
                                          <span>{area.name}</span>
                                          {!capacity.hasSpace && (
                                            <IconAlertTriangle className='h-4 w-4 text-orange-500' />
                                          )}
                                        </div>
                                        <span className='text-muted-foreground text-xs'>
                                          {(
                                            (area.currentStock /
                                              area.capacity) *
                                            100
                                          ).toFixed(1)}
                                          %
                                        </span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Thông tin khu vực được chọn */}
                    {selectedArea && (
                      <Card className='bg-muted/50'>
                        <CardContent className='p-4'>
                          <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
                            <div>
                              <span className='text-muted-foreground'>
                                Sức chứa:
                              </span>
                              <div className='font-medium'>
                                {selectedArea.capacity} m²
                              </div>
                            </div>
                            <div>
                              <span className='text-muted-foreground'>
                                Đã sử dụng:
                              </span>
                              <div className='font-medium'>
                                {selectedArea.currentStock} m²
                              </div>
                            </div>
                            <div>
                              <span className='text-muted-foreground'>
                                Nhiệt độ:
                              </span>
                              <div className='font-medium'>
                                {selectedArea.temperature}°C
                              </div>
                            </div>
                            <div>
                              <span className='text-muted-foreground'>
                                Độ ẩm:
                              </span>
                              <div className='font-medium'>
                                {selectedArea.humidity}%
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Thông tin bổ sung */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Thông tin bổ sung</h3>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      {/* Nhà cung cấp */}
                      <FormField
                        control={form.control}
                        name='supplierId'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nhà cung cấp *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Chọn nhà cung cấp...' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockSuppliers.map((supplier) => (
                                  <SelectItem
                                    key={supplier.id}
                                    value={supplier.id}
                                  >
                                    <div className='flex items-center gap-2'>
                                      <IconUser className='h-4 w-4' />
                                      <span>{supplier.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Xuất xứ */}
                      <FormField
                        control={form.control}
                        name='origin'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Xuất xứ *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='VD: Đà Lạt, Lâm Đồng'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Ghi chú */}
                    <FormField
                      control={form.control}
                      name='notes'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ghi chú</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Ghi chú thêm về sản phẩm...'
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className='flex gap-4'>
                    <Button
                      type='submit'
                      disabled={isSubmitting}
                      className='flex-1'
                    >
                      {isSubmitting ? (
                        <>
                          <IconClock className='mr-2 h-4 w-4 animate-spin' />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <IconPackageImport className='mr-2 h-4 w-4' />
                          Nhập kho
                        </>
                      )}
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => form.reset()}
                      disabled={isSubmitting}
                    >
                      Làm mới
                    </Button>
                  </div>
                </Form>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconBrain className='h-5 w-5 text-purple-600' />
                  Phân tích AI
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Mức độ rủi ro:</span>
                  <Badge
                    variant={
                      mockAIAnalysis.riskLevel === 'Thấp'
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {mockAIAnalysis.riskLevel}
                  </Badge>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Thời hạn dự kiến:</span>
                  <span className='text-sm'>
                    {mockAIAnalysis.predictedShelfLife}
                  </span>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>
                      Điểm chất lượng:
                    </span>
                    <span className='text-sm font-bold'>
                      {mockAIAnalysis.qualityScore}/100
                    </span>
                  </div>
                  <Progress
                    value={mockAIAnalysis.qualityScore}
                    className='h-2'
                  />
                </div>

                <div className='space-y-2'>
                  <span className='text-sm font-medium'>Khuyến nghị:</span>
                  <ul className='space-y-1'>
                    {mockAIAnalysis.recommendations.map((rec, index) => (
                      <li
                        key={index}
                        className='text-muted-foreground flex items-start gap-2 text-xs'
                      >
                        <IconCheck className='mt-0.5 h-3 w-3 flex-shrink-0 text-green-500' />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Import Items List */}
          {importItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconShield className='h-5 w-5 text-blue-600' />
                  Danh sách nhập kho chi tiết ({importItems.length} mục)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  {importItems.map((item) => (
                    <div
                      key={item.id}
                      className='rounded-lg border bg-gradient-to-r from-green-50 to-blue-50 p-6'
                    >
                      {/* Header with product info */}
                      <div className='mb-4 flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='mb-2 flex items-center gap-2'>
                            <h3 className='text-lg font-semibold text-gray-900'>
                              {item.productName}
                            </h3>
                            <Badge variant='outline'>{item.category}</Badge>
                            <Badge
                              variant='secondary'
                              className='bg-green-100 text-green-800'
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
                            <div>
                              <span className='text-gray-500'>Số lượng:</span>
                              <p className='font-medium'>{item.quantity} kg</p>
                            </div>
                            <div>
                              <span className='text-gray-500'>
                                Nhà cung cấp:
                              </span>
                              <p className='font-medium'>{item.supplier}</p>
                            </div>
                            <div>
                              <span className='text-gray-500'>Số lô:</span>
                              <p className='font-medium'>{item.batchNumber}</p>
                            </div>
                            <div>
                              <span className='text-gray-500'>Cấp độ:</span>
                              <p className='font-medium'>{item.qualityGrade}</p>
                            </div>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='mb-2 flex items-center gap-2'>
                            <IconBarcode className='h-4 w-4 text-blue-500' />
                            <span className='rounded bg-blue-100 px-2 py-1 font-mono text-xs'>
                              {item.qrCode}
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <IconShield className='h-4 w-4 text-green-500' />
                            <span className='rounded bg-green-100 px-2 py-1 font-mono text-xs'>
                              {item.blockchainHash}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detailed info grid */}
                      <div className='mb-4 grid grid-cols-1 gap-4 rounded-lg border bg-white p-4 md:grid-cols-3'>
                        <div className='flex items-center gap-2'>
                          <IconCalendar className='h-4 w-4 text-orange-500' />
                          <div>
                            <span className='text-xs text-gray-500'>
                              Hết hạn:
                            </span>
                            <p className='text-sm font-medium'>
                              {new Date(item.expiryDate).toLocaleDateString(
                                'vi-VN'
                              )}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <IconMapPin className='h-4 w-4 text-red-500' />
                          <div>
                            <span className='text-xs text-gray-500'>
                              Xuất xứ:
                            </span>
                            <p className='text-sm font-medium'>
                              {item.originLocation}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <IconClock className='h-4 w-4 text-blue-500' />
                          <div>
                            <span className='text-xs text-gray-500'>
                              Nhập kho:
                            </span>
                            <p className='text-sm font-medium'>
                              {item.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tracking Steps */}
                      <div className='mb-4'>
                        <h4 className='mb-3 flex items-center gap-2 text-sm font-medium text-gray-700'>
                          <IconClipboardCheck className='h-4 w-4' />
                          Quy trình xử lý:
                        </h4>
                        <div className='flex items-center justify-between'>
                          {item.trackingSteps.map(
                            (
                              step: {
                                step: number;
                                name: string;
                                completed: boolean;
                                timestamp: string;
                              },
                              index: number
                            ) => (
                              <div
                                key={step.step}
                                className='flex flex-col items-center'
                              >
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                    step.completed
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-200 text-gray-500'
                                  }`}
                                >
                                  {step.completed ? (
                                    <IconCheck className='h-4 w-4' />
                                  ) : (
                                    step.step
                                  )}
                                </div>
                                <div className='mt-2 max-w-20 text-center text-xs'>
                                  <p className='font-medium'>{step.name}</p>
                                  {step.completed && (
                                    <p className='text-xs text-gray-500'>
                                      {step.timestamp}
                                    </p>
                                  )}
                                </div>
                                {index < item.trackingSteps.length - 1 && (
                                  <div
                                    className={`absolute mt-4 h-0.5 w-16 ${
                                      step.completed
                                        ? 'bg-green-500'
                                        : 'bg-gray-200'
                                    }`}
                                    style={{
                                      left: '50%',
                                      transform: 'translateX(50%)'
                                    }}
                                  />
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {item.notes && (
                        <div className='rounded-md border border-yellow-200 bg-yellow-50 p-3'>
                          <div className='flex items-start gap-2'>
                            <IconFileText className='mt-0.5 h-4 w-4 text-yellow-600' />
                            <div>
                              <span className='text-sm font-medium text-yellow-800'>
                                Ghi chú:
                              </span>
                              <p className='mt-1 text-sm text-yellow-700'>
                                {item.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageContainer>
    </TooltipProvider>
  );
}
