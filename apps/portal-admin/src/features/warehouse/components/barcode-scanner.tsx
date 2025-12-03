'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  IconBarcode,
  IconCamera,
  IconCheck,
  IconHistory,
  IconMinus,
  IconPackage,
  IconPlus,
  IconScan,
  IconX
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
  className?: string;
  onScanComplete?: (data: any) => void;
  mode?: 'import' | 'export' | 'inventory';
}

export function BarcodeScanner({
  className,
  onScanComplete,
  mode = 'inventory'
}: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scannedItems, setScannedItems] = useState<any[]>([]);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mock data cho sản phẩm
  const mockProducts = {
    '8934673001234': {
      id: 'SP001',
      name: 'Cà chua bi organic',
      category: 'Rau củ quả',
      unit: 'kg',
      currentStock: 45,
      price: 35000,
      supplier: 'Nông trại Đà Lạt',
      expiry: '2024-02-15',
      location: 'A-01-15'
    },
    '8934673005678': {
      id: 'SP002',
      name: 'Xà lách xoăn',
      category: 'Rau lá',
      unit: 'bó',
      currentStock: 120,
      price: 15000,
      supplier: 'Vườn rau sạch Hà Nội',
      expiry: '2024-01-28',
      location: 'B-02-08'
    },
    '8934673009012': {
      id: 'SP003',
      name: 'Táo Fuji nhập khẩu',
      category: 'Trái cây',
      unit: 'kg',
      currentStock: 80,
      price: 85000,
      supplier: 'Nhật Bản Foods',
      expiry: '2024-02-20',
      location: 'C-03-12'
    }
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Không thể truy cập camera:', error);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const handleManualScan = () => {
    if (manualCode.trim()) {
      processBarcode(manualCode.trim());
      setManualCode('');
    }
  };

  const processBarcode = (barcode: string) => {
    const product = mockProducts[barcode as keyof typeof mockProducts];
    if (product) {
      setCurrentItem({ ...product, barcode, scannedAt: new Date() });
    } else {
      // Sản phẩm không tìm thấy
      setCurrentItem({
        barcode,
        name: 'Sản phẩm không xác định',
        error: true,
        scannedAt: new Date()
      });
    }
  };

  const addToList = () => {
    if (currentItem && !currentItem.error) {
      const newItem = {
        ...currentItem,
        quantity,
        totalValue: currentItem.price * quantity,
        action: mode
      };
      setScannedItems((prev) => [...prev, newItem]);
      setCurrentItem(null);
      setQuantity(1);
      onScanComplete?.(newItem);
    }
  };

  const removeFromList = (index: number) => {
    setScannedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'import':
        return 'Quét mã nhập kho';
      case 'export':
        return 'Quét mã xuất kho';
      default:
        return 'Quét mã kiểm kê';
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'import':
        return 'text-green-600';
      case 'export':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className={cn('text-2xl font-bold', getModeColor())}>
            {getModeTitle()}
          </h2>
          <p className='text-muted-foreground'>
            Quét mã vạch hoặc nhập thủ công để xử lý nhanh
          </p>
        </div>
        <Badge variant='outline' className='text-sm'>
          {scannedItems.length} sản phẩm đã quét
        </Badge>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Scanner Section */}
        <div className='space-y-4'>
          {/* Camera Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <IconCamera className='mr-2 h-5 w-5' />
                Quét bằng camera
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {isScanning ? (
                <div className='relative'>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className='h-48 w-full rounded border bg-black'
                  />
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='h-32 w-48 rounded border-2 border-red-500'></div>
                  </div>
                  <Button
                    onClick={stopScanning}
                    variant='destructive'
                    size='sm'
                    className='absolute top-2 right-2'
                  >
                    <IconX className='h-4 w-4' />
                  </Button>
                </div>
              ) : (
                <div className='flex h-48 flex-col items-center justify-center rounded border-2 border-dashed bg-gray-50'>
                  <IconScan className='mb-2 h-12 w-12 text-gray-400' />
                  <p className='mb-4 text-gray-500'>Nhấn để bắt đầu quét</p>
                  <Button onClick={startScanning}>
                    <IconCamera className='mr-2 h-4 w-4' />
                    Bắt đầu quét
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Input */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <IconBarcode className='mr-2 h-5 w-5' />
                Nhập thủ công
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex gap-2'>
                <Input
                  placeholder='Nhập mã vạch...'
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                />
                <Button
                  onClick={handleManualScan}
                  disabled={!manualCode.trim()}
                >
                  <IconScan className='h-4 w-4' />
                </Button>
              </div>
              <div className='text-muted-foreground text-sm'>
                Mã mẫu: 8934673001234, 8934673005678, 8934673009012
              </div>
            </CardContent>
          </Card>

          {/* Current Item */}
          {currentItem && (
            <Card
              className={
                currentItem.error
                  ? 'border-red-300 bg-red-50'
                  : 'border-green-300 bg-green-50'
              }
            >
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span
                    className={
                      currentItem.error ? 'text-red-700' : 'text-green-700'
                    }
                  >
                    {currentItem.error
                      ? 'Không tìm thấy sản phẩm'
                      : 'Sản phẩm đã quét'}
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setCurrentItem(null)}
                  >
                    <IconX className='h-4 w-4' />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <div className='font-medium'>{currentItem.name}</div>
                  <div className='text-muted-foreground text-sm'>
                    Mã: {currentItem.barcode}
                  </div>
                </div>

                {!currentItem.error && (
                  <>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <Label>Tồn kho hiện tại</Label>
                        <div className='font-medium'>
                          {currentItem.currentStock} {currentItem.unit}
                        </div>
                      </div>
                      <div>
                        <Label>Vị trí</Label>
                        <div className='font-medium'>
                          {currentItem.location}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className='space-y-2'>
                      <Label>
                        Số lượng{' '}
                        {mode === 'import'
                          ? 'nhập'
                          : mode === 'export'
                            ? 'xuất'
                            : 'kiểm'}
                      </Label>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          <IconMinus className='h-4 w-4' />
                        </Button>
                        <Input
                          type='number'
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className='w-20 text-center'
                        />
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <IconPlus className='h-4 w-4' />
                        </Button>
                        <span className='text-muted-foreground text-sm'>
                          {currentItem.unit}
                        </span>
                      </div>
                    </div>

                    <Button onClick={addToList} className='w-full'>
                      <IconCheck className='mr-2 h-4 w-4' />
                      Thêm vào danh sách
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Scanned Items List */}
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <IconHistory className='mr-2 h-5 w-5' />
                Danh sách đã quét ({scannedItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scannedItems.length === 0 ? (
                <div className='text-muted-foreground py-8 text-center'>
                  <IconPackage className='mx-auto mb-2 h-12 w-12 opacity-50' />
                  <p>Chưa có sản phẩm nào được quét</p>
                </div>
              ) : (
                <div className='max-h-96 space-y-3 overflow-y-auto'>
                  {scannedItems.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between rounded border bg-gray-50 p-3'
                    >
                      <div className='flex-1'>
                        <div className='font-medium'>{item.name}</div>
                        <div className='text-muted-foreground text-sm'>
                          {item.quantity} {item.unit} ×{' '}
                          {item.price?.toLocaleString()}đ ={' '}
                          {item.totalValue?.toLocaleString()}đ
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          Vị trí: {item.location} | Mã: {item.barcode}
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => removeFromList(index)}
                      >
                        <IconX className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {scannedItems.length > 0 && (
                <>
                  <Separator className='my-4' />
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>Tổng giá trị:</span>
                    <span className='text-lg font-bold text-green-600'>
                      {scannedItems
                        .reduce((sum, item) => sum + (item.totalValue || 0), 0)
                        .toLocaleString()}
                      đ
                    </span>
                  </div>
                  <Button className='mt-4 w-full'>
                    Xác nhận{' '}
                    {mode === 'import'
                      ? 'nhập kho'
                      : mode === 'export'
                        ? 'xuất kho'
                        : 'kiểm kê'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BarcodeScanner;
