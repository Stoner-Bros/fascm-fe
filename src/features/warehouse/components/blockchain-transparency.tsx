import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconSearch,
  IconShield,
  IconLink,
  IconClock,
  IconMapPin,
  IconUser,
  IconTruck,
  IconPackage,
  IconLeaf,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconQrcode,
  IconFingerprint
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface BlockchainTransparencyProps {
  className?: string;
}

export function BlockchainTransparency({
  className
}: BlockchainTransparencyProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Mock data cho blockchain tracking
  const blockchainData = {
    products: [
      {
        id: 'SP001',
        name: 'Cà chua bi organic',
        batchId: 'LOT001',
        qrCode: 'QR001234567890',
        blockchainHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
        status: 'verified',
        currentLocation: 'Kho A-01-15',
        transactions: [
          {
            id: 'TX001',
            type: 'harvest',
            timestamp: '2024-01-15T08:00:00Z',
            location: 'Nông trại Đà Lạt, Lâm Đồng',
            actor: 'Nguyễn Văn Nông',
            details: 'Thu hoạch 500kg cà chua bi organic',
            blockHash: '0x1a2b3c4d5e6f7890',
            verified: true,
            temperature: null,
            humidity: null
          },
          {
            id: 'TX002',
            type: 'quality_check',
            timestamp: '2024-01-15T10:30:00Z',
            location: 'Trạm kiểm định Đà Lạt',
            actor: 'Trần Thị Kiểm',
            details: 'Kiểm tra chất lượng - Đạt tiêu chuẩn organic',
            blockHash: '0x2b3c4d5e6f789012',
            verified: true,
            qualityScore: 95,
            certificates: ['Organic Certificate', 'VietGAP']
          },
          {
            id: 'TX003',
            type: 'transport',
            timestamp: '2024-01-16T06:00:00Z',
            location: 'Đà Lạt → Hà Nội',
            actor: 'Công ty vận tải ABC',
            details: 'Vận chuyển bằng xe lạnh, nhiệt độ 2-4°C',
            blockHash: '0x3c4d5e6f78901234',
            verified: true,
            temperature: 3.2,
            humidity: 65,
            vehicleId: 'VT-001'
          },
          {
            id: 'TX004',
            type: 'warehouse_in',
            timestamp: '2024-01-20T14:00:00Z',
            location: 'Kho Fresh Supply, Hà Nội',
            actor: 'Lê Văn Kho',
            details: 'Nhập kho 500kg, kiểm tra chất lượng OK',
            blockHash: '0x4d5e6f7890123456',
            verified: true,
            temperature: 4.2,
            humidity: 68,
            storageLocation: 'A-01-15'
          }
        ],
        certifications: [
          {
            name: 'Organic Certificate',
            issuer: 'Quocert',
            validUntil: '2024-12-31',
            hash: '0xabc123def456'
          },
          {
            name: 'VietGAP',
            issuer: 'Bộ NN&PTNT',
            validUntil: '2024-06-30',
            hash: '0xdef456abc123'
          }
        ],
        iotData: {
          currentTemp: 4.2,
          currentHumidity: 68,
          lastUpdate: '2024-01-25T10:00:00Z'
        }
      }
    ],
    stats: {
      totalTransactions: 1247,
      verifiedProducts: 156,
      blockchainUptime: 99.9,
      avgVerificationTime: 2.3 // seconds
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'harvest':
        return <IconLeaf className='h-5 w-5 text-green-600' />;
      case 'quality_check':
        return <IconShield className='h-5 w-5 text-blue-600' />;
      case 'transport':
        return <IconTruck className='h-5 w-5 text-orange-600' />;
      case 'warehouse_in':
        return <IconPackage className='h-5 w-5 text-purple-600' />;
      case 'warehouse_out':
        return <IconPackage className='h-5 w-5 text-red-600' />;
      default:
        return <IconLink className='h-5 w-5 text-gray-600' />;
    }
  };

  const getTransactionTitle = (type: string) => {
    switch (type) {
      case 'harvest':
        return 'Thu hoạch';
      case 'quality_check':
        return 'Kiểm tra chất lượng';
      case 'transport':
        return 'Vận chuyển';
      case 'warehouse_in':
        return 'Nhập kho';
      case 'warehouse_out':
        return 'Xuất kho';
      default:
        return 'Giao dịch';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  const searchProduct = () => {
    if (searchQuery.trim()) {
      // Simulate search - in real app, this would call API
      const found = blockchainData.products.find(
        (p) =>
          p.qrCode.includes(searchQuery) ||
          p.batchId.includes(searchQuery) ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (found) {
        setSelectedProduct(found.id);
      }
    }
  };

  const selectedProductData = blockchainData.products.find(
    (p) => p.id === selectedProduct
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Minh bạch Blockchain</h2>
          <p className='text-muted-foreground'>
            Truy xuất nguồn gốc và lịch sử giao dịch nông sản
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='text-green-600'>
            <IconShield className='mr-1 h-3 w-3' />
            Blockchain Verified
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm'>Tổng giao dịch</p>
                <p className='text-2xl font-bold'>
                  {blockchainData.stats.totalTransactions.toLocaleString()}
                </p>
              </div>
              <IconLink className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm'>
                  Sản phẩm đã xác minh
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {blockchainData.stats.verifiedProducts}
                </p>
              </div>
              <IconCheck className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm'>
                  Uptime Blockchain
                </p>
                <p className='text-2xl font-bold text-blue-600'>
                  {blockchainData.stats.blockchainUptime}%
                </p>
              </div>
              <IconShield className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm'>
                  Thời gian xác minh
                </p>
                <p className='text-2xl font-bold text-purple-600'>
                  {blockchainData.stats.avgVerificationTime}s
                </p>
              </div>
              <IconClock className='h-8 w-8 text-purple-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <IconSearch className='mr-2 h-5 w-5' />
            Tra cứu sản phẩm
          </CardTitle>
          <CardDescription>
            Nhập mã QR, mã lô hoặc tên sản phẩm để tra cứu thông tin blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-2'>
            <Input
              placeholder='Nhập mã QR, mã lô hoặc tên sản phẩm...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchProduct()}
              className='flex-1'
            />
            <Button onClick={searchProduct}>
              <IconSearch className='h-4 w-4' />
            </Button>
            <Button variant='outline'>
              <IconQrcode className='h-4 w-4' />
            </Button>
          </div>
          <div className='text-muted-foreground mt-2 text-sm'>
            Mã mẫu: QR001234567890, LOT001, Cà chua bi organic
          </div>
        </CardContent>
      </Card>

      {/* Product Details */}
      {selectedProductData && (
        <Tabs defaultValue='timeline' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <TabsList>
              <TabsTrigger value='timeline'>Lịch sử giao dịch</TabsTrigger>
              <TabsTrigger value='certificates'>Chứng nhận</TabsTrigger>
              <TabsTrigger value='iot'>Dữ liệu IoT</TabsTrigger>
              <TabsTrigger value='blockchain'>Blockchain Info</TabsTrigger>
            </TabsList>
            <div className='flex items-center gap-2'>
              <Badge variant='outline'>{selectedProductData.batchId}</Badge>
              <Badge className='bg-green-100 text-green-800'>
                <IconCheck className='mr-1 h-3 w-3' />
                Đã xác minh
              </Badge>
            </div>
          </div>

          {/* Product Header */}
          <Card>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div>
                  <CardTitle className='text-xl'>
                    {selectedProductData.name}
                  </CardTitle>
                  <CardDescription className='mt-1'>
                    Mã lô: {selectedProductData.batchId} | QR:{' '}
                    {selectedProductData.qrCode}
                  </CardDescription>
                </div>
                <div className='text-right'>
                  <div className='text-muted-foreground text-sm'>
                    Vị trí hiện tại
                  </div>
                  <div className='flex items-center font-medium'>
                    <IconMapPin className='mr-1 h-4 w-4' />
                    {selectedProductData.currentLocation}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <TabsContent value='timeline' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử giao dịch Blockchain</CardTitle>
                <CardDescription>
                  Toàn bộ hành trình của sản phẩm được ghi nhận trên blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {selectedProductData.transactions.map((tx, index) => (
                    <div key={tx.id} className='flex gap-4'>
                      <div className='flex flex-col items-center'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100'>
                          {getTransactionIcon(tx.type)}
                        </div>
                        {index <
                          selectedProductData.transactions.length - 1 && (
                          <div className='mt-2 h-16 w-px bg-gray-200'></div>
                        )}
                      </div>
                      <div className='flex-1 pb-8'>
                        <Card>
                          <CardContent className='p-4'>
                            <div className='mb-2 flex items-start justify-between'>
                              <div>
                                <h4 className='font-medium'>
                                  {getTransactionTitle(tx.type)}
                                </h4>
                                <p className='text-muted-foreground text-sm'>
                                  {tx.details}
                                </p>
                              </div>
                              <Badge
                                variant={tx.verified ? 'default' : 'secondary'}
                              >
                                {tx.verified ? 'Đã xác minh' : 'Chờ xác minh'}
                              </Badge>
                            </div>

                            <div className='grid grid-cols-2 gap-4 text-sm'>
                              <div>
                                <span className='text-muted-foreground'>
                                  Thời gian:
                                </span>
                                <div className='font-medium'>
                                  {formatDateTime(tx.timestamp)}
                                </div>
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  Địa điểm:
                                </span>
                                <div className='font-medium'>{tx.location}</div>
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  Người thực hiện:
                                </span>
                                <div className='font-medium'>{tx.actor}</div>
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  Block Hash:
                                </span>
                                <div className='flex items-center gap-1 font-medium'>
                                  <code className='text-xs'>
                                    {formatHash(tx.blockHash)}
                                  </code>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                      copyToClipboard(tx.blockHash)
                                    }
                                  >
                                    <IconCopy className='h-3 w-3' />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {(tx.temperature || tx.humidity) && (
                              <div className='mt-3 border-t pt-3'>
                                <div className='grid grid-cols-2 gap-4 text-sm'>
                                  {tx.temperature && (
                                    <div>
                                      <span className='text-muted-foreground'>
                                        Nhiệt độ:
                                      </span>
                                      <div className='font-medium'>
                                        {tx.temperature}°C
                                      </div>
                                    </div>
                                  )}
                                  {tx.humidity && (
                                    <div>
                                      <span className='text-muted-foreground'>
                                        Độ ẩm:
                                      </span>
                                      <div className='font-medium'>
                                        {tx.humidity}%
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {tx.qualityScore && (
                              <div className='mt-3 border-t pt-3'>
                                <div className='text-sm'>
                                  <span className='text-muted-foreground'>
                                    Điểm chất lượng:
                                  </span>
                                  <span className='ml-2 font-medium text-green-600'>
                                    {tx.qualityScore}/100
                                  </span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='certificates' className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {selectedProductData.certifications.map((cert, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <IconShield className='mr-2 h-5 w-5 text-green-600' />
                      {cert.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div>
                      <span className='text-muted-foreground text-sm'>
                        Cơ quan cấp:
                      </span>
                      <div className='font-medium'>{cert.issuer}</div>
                    </div>
                    <div>
                      <span className='text-muted-foreground text-sm'>
                        Có hiệu lực đến:
                      </span>
                      <div className='font-medium'>{cert.validUntil}</div>
                    </div>
                    <div>
                      <span className='text-muted-foreground text-sm'>
                        Hash xác thực:
                      </span>
                      <div className='flex items-center gap-1 font-medium'>
                        <code className='text-xs'>{formatHash(cert.hash)}</code>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => copyToClipboard(cert.hash)}
                        >
                          <IconCopy className='h-3 w-3' />
                        </Button>
                      </div>
                    </div>
                    <Button variant='outline' size='sm' className='w-full'>
                      <IconExternalLink className='mr-2 h-4 w-4' />
                      Xem chứng nhận
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value='iot' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Dữ liệu IoT hiện tại</CardTitle>
                <CardDescription>
                  Thông tin môi trường bảo quản theo thời gian thực
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div className='rounded bg-blue-50 p-4 text-center'>
                    <div className='text-2xl font-bold text-blue-600'>
                      {selectedProductData.iotData.currentTemp}°C
                    </div>
                    <div className='text-muted-foreground text-sm'>
                      Nhiệt độ
                    </div>
                  </div>
                  <div className='rounded bg-cyan-50 p-4 text-center'>
                    <div className='text-2xl font-bold text-cyan-600'>
                      {selectedProductData.iotData.currentHumidity}%
                    </div>
                    <div className='text-muted-foreground text-sm'>Độ ẩm</div>
                  </div>
                  <div className='rounded bg-green-50 p-4 text-center'>
                    <div className='text-sm font-medium text-green-600'>
                      Trạng thái
                    </div>
                    <div className='text-muted-foreground text-sm'>
                      Bình thường
                    </div>
                  </div>
                </div>
                <div className='text-muted-foreground text-sm'>
                  Cập nhật lần cuối:{' '}
                  {formatDateTime(selectedProductData.iotData.lastUpdate)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='blockchain' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Thông tin Blockchain</CardTitle>
                <CardDescription>
                  Chi tiết kỹ thuật về việc lưu trữ trên blockchain
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <span className='text-muted-foreground text-sm'>
                      Contract Hash:
                    </span>
                    <div className='flex items-center gap-1 font-mono text-sm'>
                      {formatHash(selectedProductData.blockchainHash)}
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          copyToClipboard(selectedProductData.blockchainHash)
                        }
                      >
                        <IconCopy className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <span className='text-muted-foreground text-sm'>
                      Trạng thái:
                    </span>
                    <div className='flex items-center gap-2'>
                      <Badge className='bg-green-100 text-green-800'>
                        <IconCheck className='mr-1 h-3 w-3' />
                        Đã xác minh
                      </Badge>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className='space-y-2'>
                  <h4 className='font-medium'>
                    Tổng số giao dịch: {selectedProductData.transactions.length}
                  </h4>
                  <div className='text-muted-foreground text-sm'>
                    Tất cả giao dịch đều được mã hóa và lưu trữ bất biến trên
                    blockchain
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default BlockchainTransparency;
