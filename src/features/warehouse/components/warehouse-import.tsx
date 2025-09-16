'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  IconPackageImport,
  IconScan,
  IconTemperature,
  IconDroplet,
  IconBrain,
  IconShield,
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconTruck,
  IconLeaf,
  IconScale,
  IconClipboardCheck,
  IconFileText,
  IconCalendar,
  IconUser,
  IconMapPin,
  IconPhoto,
  IconBarcode
} from '@tabler/icons-react';

// Mock data
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

const productCategories = [
  'Rau củ quả',
  'Trái cây',
  'Ngũ cốc',
  'Thảo mộc',
  'Hạt giống',
  'Khác'
];

export function WarehouseImport() {
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

  // Enhanced validation function
  const validateForm = () => {
    const errors: string[] = [];

    if (!productName.trim()) errors.push('Tên sản phẩm không được để trống');
    if (!selectedCategory) errors.push('Vui lòng chọn loại sản phẩm');
    if (!quantity || parseInt(quantity) <= 0)
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
        quantity: parseInt(quantity),
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
      setSelectedCategory('Rau củ quả');
      setQuantity('50');
      setSupplier('Nông trại ABC');
    }, 2000);
  };

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>Nhập kho hàng</h2>
            <p className='text-muted-foreground'>
              Quản lý nhập kho với AI phân tích và blockchain logging
            </p>
          </div>
          <Button onClick={handleScan} disabled={isScanning}>
            <IconScan className='mr-2 h-4 w-4' />
            {isScanning ? 'Đang quét...' : 'Quét mã vạch'}
          </Button>
        </div>

        <div className='grid gap-6 md:grid-cols-3'>
          {/* Environmental Monitoring */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Nhiệt độ kho
              </CardTitle>
              <IconTemperature className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {mockSensorData.temperature}°C
              </div>
              <p className='text-muted-foreground text-xs'>
                Cập nhật {mockSensorData.lastUpdate}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Độ ẩm</CardTitle>
              <IconDroplet className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {mockSensorData.humidity}%
              </div>
              <p className='text-muted-foreground text-xs'>
                Cập nhật {mockSensorData.lastUpdate}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Chất lượng không khí
              </CardTitle>
              <IconLeaf className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {mockSensorData.airQuality}
              </div>
              <p className='text-muted-foreground text-xs'>
                Cập nhật {mockSensorData.lastUpdate}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {/* Enhanced Import Form */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconPackageImport className='h-5 w-5' />
                Thông tin nhập kho chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className='rounded-md border border-red-200 bg-red-50 p-3'>
                  <div className='mb-2 flex items-center gap-2'>
                    <IconAlertTriangle className='h-4 w-4 text-red-500' />
                    <span className='text-sm font-medium text-red-700'>
                      Lỗi validation:
                    </span>
                  </div>
                  <ul className='space-y-1'>
                    {validationErrors.map((error, index) => (
                      <li key={index} className='text-xs text-red-600'>
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Tabs
                value={`step-${currentStep}`}
                onValueChange={(value) =>
                  setCurrentStep(parseInt(value.split('-')[1]))
                }
              >
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger value='step-1' className='text-xs'>
                    Thông tin cơ bản
                  </TabsTrigger>
                  <TabsTrigger value='step-2' className='text-xs'>
                    Chi tiết sản phẩm
                  </TabsTrigger>
                  <TabsTrigger value='step-3' className='text-xs'>
                    Xác thực & Lưu trữ
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='step-1' className='mt-4 space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='productName'>Tên sản phẩm *</Label>
                      <Input
                        id='productName'
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder='Nhập tên sản phẩm'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='category'>Loại sản phẩm *</Label>
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn loại sản phẩm' />
                        </SelectTrigger>
                        <SelectContent>
                          {productCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='quantity'>Số lượng (kg) *</Label>
                      <Input
                        id='quantity'
                        type='number'
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder='Nhập số lượng'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='supplier'>Nhà cung cấp *</Label>
                      <Input
                        id='supplier'
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        placeholder='Tên nhà cung cấp'
                      />
                    </div>
                  </div>

                  <Button onClick={() => setCurrentStep(2)} className='w-full'>
                    Tiếp tục <IconClipboardCheck className='ml-2 h-4 w-4' />
                  </Button>
                </TabsContent>

                <TabsContent value='step-2' className='mt-4 space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='batchNumber'>Số lô hàng *</Label>
                      <Input
                        id='batchNumber'
                        value={batchNumber}
                        onChange={(e) => setBatchNumber(e.target.value)}
                        placeholder='VD: LOT-2024-001'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='expiryDate'>Ngày hết hạn *</Label>
                      <Input
                        id='expiryDate'
                        type='date'
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='originLocation'>Nơi xuất xứ *</Label>
                      <Input
                        id='originLocation'
                        value={originLocation}
                        onChange={(e) => setOriginLocation(e.target.value)}
                        placeholder='VD: Đà Lạt, Lâm Đồng'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='qualityGrade'>Cấp độ chất lượng *</Label>
                      <Select
                        value={qualityGrade}
                        onValueChange={setQualityGrade}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn cấp độ' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='A+'>A+ (Xuất khẩu)</SelectItem>
                          <SelectItem value='A'>A (Loại 1)</SelectItem>
                          <SelectItem value='B'>B (Loại 2)</SelectItem>
                          <SelectItem value='C'>C (Chế biến)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='notes'>Ghi chú chi tiết</Label>
                    <Textarea
                      id='notes'
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder='Mô tả chi tiết về sản phẩm, điều kiện vận chuyển...'
                      rows={3}
                    />
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setCurrentStep(1)}
                      className='flex-1'
                    >
                      Quay lại
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      className='flex-1'
                    >
                      Tiếp tục <IconFileText className='ml-2 h-4 w-4' />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value='step-3' className='mt-4 space-y-4'>
                  <div className='rounded-md border border-blue-200 bg-blue-50 p-4'>
                    <div className='mb-2 flex items-center gap-2'>
                      <IconShield className='h-4 w-4 text-blue-500' />
                      <span className='text-sm font-medium text-blue-700'>
                        Xác thực và lưu trữ
                      </span>
                    </div>
                    <p className='mb-3 text-xs text-blue-600'>
                      Hệ thống sẽ tự động xác thực thông tin và lưu trữ trên
                      blockchain
                    </p>

                    <div className='space-y-2'>
                      <div className='flex items-center justify-between text-xs'>
                        <span>QR Code tự động</span>
                        <IconBarcode className='h-4 w-4 text-green-500' />
                      </div>
                      <div className='flex items-center justify-between text-xs'>
                        <span>Blockchain logging</span>
                        <IconShield className='h-4 w-4 text-green-500' />
                      </div>
                      <div className='flex items-center justify-between text-xs'>
                        <span>AI quality check</span>
                        <IconBrain className='h-4 w-4 text-green-500' />
                      </div>
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setCurrentStep(2)}
                      className='flex-1'
                    >
                      Quay lại
                    </Button>
                    <Button
                      onClick={handleAddItem}
                      className='flex-1'
                      disabled={isValidating}
                    >
                      {isValidating ? (
                        <>
                          <IconClock className='mr-2 h-4 w-4 animate-spin' />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <IconPackageImport className='mr-2 h-4 w-4' />
                          Hoàn tất nhập kho
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
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
                  <span className='text-sm font-medium'>Điểm chất lượng:</span>
                  <span className='text-sm font-bold'>
                    {mockAIAnalysis.qualityScore}/100
                  </span>
                </div>
                <Progress value={mockAIAnalysis.qualityScore} className='h-2' />
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
                            <span className='text-gray-500'>Nhà cung cấp:</span>
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
  );
}
