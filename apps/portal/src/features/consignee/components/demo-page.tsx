'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import {
  Thermometer,
  Droplets,
  Navigation,
  Shield,
  QrCode,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Database,
  Search,
  Activity,
  Download,
  Factory,
  Truck,
  Store,
  Leaf,
  MapPin,
  Calendar,
  Hash,
  User,
  FileText
} from 'lucide-react';
import TruckSimulation from './truck-simulation';

export default function DemoPage() {
  // IoT Sensor Data
  const [sensorData, setSensorData] = useState({
    temperature: 4.2,
    humidity: 68,
    location: { lat: 21.0285, lng: 105.8542 },
    status: 'active'
  });

  // Blockchain Data
  const [blockchainData, setBlockchainData] = useState({
    hash: '0x7a8b9c2d4e5f6789',
    blockHeight: 2847392,
    confirmations: 12,
    timestamp: new Date().toISOString()
  });

  // Interactive States
  const [batchCode, setBatchCode] = useState('');
  const [selectedSensor, setSelectedSensor] = useState('container-001');
  const [showQRResult, setShowQRResult] = useState(false);
  const [showBlockchainVerify, setShowBlockchainVerify] = useState(false);
  const [blockchainHash, setBlockchainHash] = useState('');
  const [lotTrackingResult, setLotTrackingResult] = useState<any>(null);
  const [blockchainVerifyResult, setBlockchainVerifyResult] =
    useState<any>(null);

  // Sample lot tracking data
  const sampleLotData: Record<string, any> = {
    'LOT-2025-001': {
      lotCode: 'LOT-2025-001',
      productName: 'Rau xanh Đà Lạt',
      productionDate: '05/09/2025',
      expiryDate: '20/09/2025',
      timeline: [
        {
          stage: 'Trang trại A',
          icon: Leaf,
          status: 'completed',
          date: '05/09/2025 06:00',
          location: 'Đà Lạt, Lâm Đồng'
        },
        {
          stage: 'Nhà máy sơ chế',
          icon: Factory,
          status: 'completed',
          date: '05/09/2025 14:00',
          location: 'KCN Đà Lạt'
        },
        {
          stage: 'Vận chuyển lạnh',
          icon: Truck,
          status: 'completed',
          date: '06/09/2025 08:00',
          location: 'Đường vận chuyển'
        },
        {
          stage: 'Siêu thị XYZ',
          icon: Store,
          status: 'completed',
          date: '06/09/2025 16:00',
          location: 'TP.HCM'
        }
      ],
      certificates: [
        { name: 'VietGAP Certificate', type: 'PDF', size: '2.3 MB' },
        { name: 'GlobalGAP Certificate', type: 'PDF', size: '1.8 MB' }
      ],
      qrCode: 'QR_LOT_2025_001_VERIFIED',
      completionPercentage: 100
    },
    'LOT-2025-002': {
      lotCode: 'LOT-2025-002',
      productName: 'Thịt bò Úc',
      productionDate: '03/09/2025',
      expiryDate: '03/10/2025',
      timeline: [
        {
          stage: 'Trang trại chăn nuôi',
          icon: Leaf,
          status: 'completed',
          date: '03/09/2025 05:00',
          location: 'Queensland, Úc'
        },
        {
          stage: 'Nhà máy chế biến',
          icon: Factory,
          status: 'completed',
          date: '03/09/2025 12:00',
          location: 'Sydney, Úc'
        },
        {
          stage: 'Vận chuyển quốc tế',
          icon: Truck,
          status: 'completed',
          date: '04/09/2025 10:00',
          location: 'Cảng Sydney'
        },
        {
          stage: 'Siêu thị ABC',
          icon: Store,
          status: 'in_progress',
          date: '07/09/2025 09:00',
          location: 'Hà Nội'
        }
      ],
      certificates: [
        { name: 'Australian Beef Certificate', type: 'PDF', size: '3.1 MB' },
        { name: 'Export Health Certificate', type: 'PDF', size: '2.5 MB' }
      ],
      qrCode: 'QR_LOT_2025_002_VERIFIED',
      completionPercentage: 75
    }
  };

  // Sample blockchain verification data
  const sampleBlockchainData: Record<string, any> = {
    '0x7a8b9c2d4e5f6789abcdef1234567890': {
      status: 'confirmed',
      blockNumber: 123456,
      confirmations: 5,
      hash: '0x7a8b9c2d4e5f6789abcdef1234567890',
      timestamp: '06/09/2025 10:35 AM',
      smartContract: 'TraceabilitySC',
      signer: 'Công ty ABC',
      gasUsed: '21000',
      transactionFee: '0.001 ETH'
    }
  };

  // Enhanced statistics data

  // Function to handle lot tracking search
  const handleLotSearch = () => {
    if (sampleLotData[batchCode]) {
      setLotTrackingResult(sampleLotData[batchCode]);
      setShowQRResult(true);
    } else {
      setLotTrackingResult(null);
      setShowQRResult(false);
    }
  };

  // Function to handle blockchain verification
  const handleBlockchainVerify = () => {
    if (sampleBlockchainData[blockchainHash]) {
      setBlockchainVerifyResult(sampleBlockchainData[blockchainHash]);
      setShowBlockchainVerify(true);
    } else {
      setBlockchainVerifyResult(null);
      setShowBlockchainVerify(false);
    }
  };

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData((prev) => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
        humidity: Math.max(
          60,
          Math.min(75, prev.humidity + (Math.random() - 0.5) * 3)
        )
      }));

      setBlockchainData((prev) => ({
        ...prev,
        hash: `0x${Math.random().toString(16).substr(2, 8)}`,
        timestamp: new Date().toISOString()
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [sensorData.temperature]);

  const traceabilityData = [
    {
      stage: 'Thu hoạch',
      location: 'Trang trại Organic Đà Lạt',
      timestamp: '2025-01-15 06:30:00',
      hash: '0x1a2b3c4d',
      status: 'completed',
      details: 'Thu hoạch rau xanh tại độ cao 1,500m'
    },
    {
      stage: 'Kho lưu trữ',
      location: 'Kho lạnh Hòa Lạc',
      timestamp: '2025-01-15 14:20:00',
      hash: '0x2b3c4d5e',
      status: 'completed',
      details: 'Bảo quản ở 4°C, độ ẩm 70%'
    },
    {
      stage: 'Vận chuyển',
      location: 'Xe tải lạnh VN-001',
      timestamp: '2025-01-16 08:00:00',
      hash: '0x3c4d5e6f',
      status: 'in_progress',
      details: 'Đang vận chuyển đến Hà Nội'
    },
    {
      stage: 'Giao hàng',
      location: 'Siêu thị BigC Thăng Long',
      timestamp: '2025-01-16 16:00:00',
      hash: '0x4d5e6f7g',
      status: 'pending',
      details: 'Dự kiến giao hàng'
    }
  ];

  const sensors = [
    {
      id: 'container-001',
      name: 'Container 001',
      type: 'Kho lạnh',
      status: 'active'
    },
    {
      id: 'container-002',
      name: 'Container 002',
      type: 'Kho khô',
      status: 'active'
    },
    {
      id: 'truck-001',
      name: 'Truck 001',
      type: 'Xe vận chuyển',
      status: 'moving'
    }
  ];

  const handleQRScan = () => {
    setBatchCode('LOT-2025-001');
    setShowQRResult(true);
  };

  return (
    <div className='min-h-screen from-blue-50 via-green-50 to-purple-50 p-6 dark:bg-gray-900'>
      <div className='mx-auto max-w-7xl space-y-8'>
        {/* Header */}
        <div className='space-y-4 text-center'>
          <h1 className='text-4xl font-bold dark:text-white'>
            Demo Công nghệ <span className='text-blue-600'>IoT</span> &{' '}
            <span className='text-purple-600'>Blockchain</span>
          </h1>
          <p className='mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300'>
            Trải nghiệm trực tiếp công nghệ giám sát realtime và truy xuất nguồn
            gốc minh bạch
          </p>
        </div>

        <Tabs defaultValue='dashboard' className='w-full'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='dashboard'>IoT Dashboard</TabsTrigger>
            <TabsTrigger value='traceability'>
              Blockchain Traceability
            </TabsTrigger>
            <TabsTrigger value='interactive'>Tra cứu</TabsTrigger>
            <TabsTrigger value='truck'>Truck Simulation</TabsTrigger>
          </TabsList>

          {/* IoT Dashboard Tab */}
          <TabsContent value='dashboard' className='space-y-6'>
            <div className='grid gap-6 lg:grid-cols-3'>
              {/* Sensor Selection */}
              <Card className='lg:col-span-1 dark:bg-gray-800'>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Activity className='mr-2 h-5 w-5 text-blue-600' />
                    Chọn Sensor
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {sensors.map((sensor) => (
                    <div
                      key={sensor.id}
                      className={`cursor-pointer rounded-lg border p-3 transition-all ${
                        selectedSensor === sensor.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-gray-700'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                      }`}
                      onClick={() => setSelectedSensor(sensor.id)}
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium dark:text-white'>
                            {sensor.name}
                          </p>
                          <p className='text-sm text-gray-600 dark:text-gray-300'>
                            {sensor.type}
                          </p>
                        </div>
                        <Badge
                          variant={
                            sensor.status === 'active' ? 'default' : 'secondary'
                          }
                          className={
                            sensor.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : ''
                          }
                        >
                          {sensor.status === 'active'
                            ? 'Hoạt động'
                            : 'Di chuyển'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Real-time Metrics */}
              <Card className='lg:col-span-2'>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Zap className='mr-2 h-5 w-5 text-yellow-600' />
                    Dữ liệu Realtime -{' '}
                    {sensors.find((s) => s.id === selectedSensor)?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='mb-6 grid grid-cols-3 gap-4'>
                    <div className='rounded-lg bg-blue-50 p-4 text-center dark:bg-gray-800'>
                      <Thermometer className='mx-auto mb-2 h-8 w-8 text-blue-700 dark:text-blue-500' />
                      <p className='text-2xl font-bold text-blue-700 dark:text-blue-500'>
                        {sensorData.temperature.toFixed(1)}°C
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-300'>
                        Nhiệt độ
                      </p>
                    </div>
                    <div className='rounded-lg bg-green-50 p-4 text-center dark:bg-gray-800'>
                      <Droplets className='mx-auto mb-2 h-8 w-8 text-green-600 dark:text-green-500' />
                      <p className='text-2xl font-bold text-green-800 dark:text-green-500'>
                        {sensorData.humidity.toFixed(0)}%
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-300'>
                        Độ ẩm
                      </p>
                    </div>
                    <div className='rounded-lg bg-orange-50 p-4 text-center dark:bg-gray-800'>
                      <Navigation className='mx-auto mb-2 h-8 w-8 text-orange-600 dark:text-orange-500' />
                      <p className='text-sm font-bold text-orange-800 dark:text-orange-500'>
                        {sensorData.location.lat.toFixed(4)}°N
                      </p>
                      <p className='text-sm font-bold text-orange-800 dark:text-orange-500'>
                        {sensorData.location.lng.toFixed(4)}°E
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-300'>
                        GPS
                      </p>
                    </div>
                  </div>

                  {/* Temperature Chart */}
                  {/* <div className="h-64">
                    <h4 className="text-lg font-semibold mb-3">Biểu đồ Nhiệt độ (5 phút gần nhất)</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={temperatureHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="temp" 
                          stroke="#2563eb" 
                          strokeWidth={2}
                          dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div> */}
                </CardContent>
              </Card>
            </div>

            {/* Alert System */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <AlertTriangle className='mr-2 h-5 w-5 text-yellow-600' />
                  Hệ thống Cảnh báo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4 md:grid-cols-3'>
                  <div className='flex items-center rounded-lg bg-green-50 p-3 dark:bg-gray-800'>
                    <CheckCircle className='mr-3 h-6 w-6 text-green-600 dark:text-green-500' />
                    <div>
                      <p className='font-medium text-green-800 dark:text-green-500'>
                        Nhiệt độ ổn định
                      </p>
                      <p className='text-sm text-green-600 dark:text-green-500'>
                        Trong khoảng cho phép
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center rounded-lg bg-green-50 p-3 dark:bg-gray-800'>
                    <CheckCircle className='mr-3 h-6 w-6 text-green-600 dark:text-green-500' />
                    <div>
                      <p className='font-medium text-green-800 dark:text-green-500'>
                        Độ ẩm bình thường
                      </p>
                      <p className='text-sm text-green-600 dark:text-green-500'>
                        68% - Lý tưởng
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center rounded-lg bg-blue-50 p-3 dark:bg-gray-800'>
                    <Navigation className='mr-3 h-6 w-6 text-blue-600 dark:text-blue-500' />
                    <div>
                      <p className='font-medium text-blue-800 dark:text-blue-500'>
                        GPS hoạt động
                      </p>
                      <p className='text-sm text-blue-600 dark:text-blue-500'>
                        Đang theo dõi vị trí
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blockchain Traceability Tab */}
          <TabsContent value='traceability' className='space-y-6'>
            <div className='grid gap-6 lg:grid-cols-2'>
              {/* QR Code Scanner */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <QrCode className='mr-2 h-5 w-5 text-purple-600' />
                    Quét QR Code Sản phẩm
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 text-center'>
                  <div className='mx-auto flex h-32 w-32 items-center justify-center rounded-lg bg-gray-100'>
                    <QrCode className='h-16 w-16 text-gray-400' />
                  </div>
                  <Button
                    onClick={handleQRScan}
                    className='bg-purple-600 hover:bg-purple-700'
                  >
                    <QrCode className='mr-2 h-4 w-4' />
                    Mô phỏng Quét QR
                  </Button>
                  {showQRResult && (
                    <div className='mt-4 rounded-lg bg-purple-50 p-4'>
                      <p className='font-medium text-purple-800'>
                        Mã lô: LOT-2025-001
                      </p>
                      <p className='text-sm text-purple-600'>
                        Rau xanh hữu cơ Đà Lạt
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Blockchain Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Shield className='mr-2 h-5 w-5 text-green-600' />
                    Xác thực Blockchain
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-800'>
                    <p className='mb-2 text-sm text-gray-600 dark:text-gray-400'>
                      Transaction Hash:
                    </p>
                    <code className='break-all font-mono text-sm text-purple-800 dark:text-purple-50'>
                      {blockchainData.hash}
                    </code>
                  </div>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-gray-600'>Block Height:</span>
                      <span className='ml-2 font-mono'>
                        {blockchainData.blockHeight}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-600'>Confirmations:</span>
                      <span className='ml-2 font-mono text-green-600'>
                        {blockchainData.confirmations}/12
                      </span>
                    </div>
                  </div>
                  <Button
                    className='w-full cursor-pointer'
                    variant='outline'
                    onClick={handleBlockchainVerify}
                  >
                    <Database className='mr-2 h-4 w-4' />
                    Kiểm tra trên Blockchain
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Traceability Timeline */}
            {showQRResult && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Clock className='mr-2 h-5 w-5 text-blue-600' />
                    Lịch sử Blockchain Timeline - LOT-2025-001
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {traceabilityData.map((item: any, index: number) => (
                      <div key={index} className='flex items-start space-x-4'>
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            item.status === 'completed'
                              ? 'bg-green-100'
                              : item.status === 'in_progress'
                                ? 'bg-blue-100'
                                : 'bg-gray-100'
                          }`}
                        >
                          {item.status === 'completed' ? (
                            <CheckCircle className='h-4 w-4 text-green-600' />
                          ) : item.status === 'in_progress' ? (
                            <Activity className='h-4 w-4 text-blue-600' />
                          ) : (
                            <Clock className='h-4 w-4 text-gray-400' />
                          )}
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center justify-between'>
                            <h4 className='font-medium text-gray-900 dark:text-gray-300'>
                              {item.stage}
                            </h4>
                            <Badge
                              variant={
                                item.status === 'completed'
                                  ? 'default'
                                  : item.status === 'in_progress'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className={
                                item.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : item.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : ''
                              }
                            >
                              {item.status === 'completed'
                                ? 'Hoàn thành'
                                : item.status === 'in_progress'
                                  ? 'Đang thực hiện'
                                  : 'Chờ xử lý'}
                            </Badge>
                          </div>
                          <p className='text-sm text-gray-500'>
                            {item.location}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {item.details}
                          </p>
                          <div className='mt-2 flex items-center space-x-4'>
                            <span className='text-xs text-gray-500'>
                              {item.timestamp}
                            </span>
                            <code className='font-mono text-xs text-purple-600'>
                              {item.hash}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Interactive Search Tab */}
          <TabsContent value='interactive' className='space-y-6'>
            <div className='grid gap-6 lg:grid-cols-2'>
              {/* Batch Code Search */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Search className='mr-2 h-5 w-5 text-blue-600' />
                    Tra cứu theo Mã lô
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex space-x-2'>
                    <Input
                      placeholder='Nhập mã lô (VD: LOT-2025-001)'
                      value={batchCode}
                      onChange={(e) => setBatchCode(e.target.value)}
                    />
                    <Button
                      type='button'
                      onClick={handleLotSearch}
                      className='cursor-pointer px-4 py-2'
                    >
                      <Search className='mr-2 h-4 w-4' />
                      Tìm kiếm
                    </Button>
                  </div>
                  <div className='text-sm text-gray-600'>
                    <p>Mã lô mẫu để thử:</p>
                    <ul className='mt-2 list-inside list-disc space-y-1'>
                      <li>LOT-2025-001 (Rau xanh Đà Lạt)</li>
                      <li>LOT-2025-002 (Thịt bò Úc)</li>
                      <li>LOT-2025-003 (Cá hồi Na Uy)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Blockchain Hash Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Database className='mr-2 h-5 w-5 text-purple-600' />
                    Xác thực Hash Blockchain
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Input
                    placeholder='Nhập transaction hash'
                    className='font-mono text-sm'
                    value={blockchainHash}
                    onChange={(e) => setBlockchainHash(e.target.value)}
                  />
                  <Button
                    type='button'
                    className='w-full cursor-pointer'
                    variant='outline'
                    onClick={handleBlockchainVerify}
                  >
                    <Database className='mr-2 h-4 w-4' />
                    Kiểm tra trên Blockchain
                  </Button>
                  <div className='text-sm text-gray-600'>
                    <p>Hash mẫu để thử:</p>
                    <code className='mt-1 block rounded bg-gray-100 p-1 text-xs'>
                      0x7a8b9c2d4e5f6789abcdef1234567890
                    </code>
                  </div>
                </CardContent>
              </Card>

              {/* Lot Tracking Results */}
              {showQRResult && lotTrackingResult && (
                <Card className='border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'>
                  <CardHeader>
                    <CardTitle className='flex items-center text-green-800 dark:text-green-200'>
                      <CheckCircle className='mr-2 h-5 w-5' />
                      Kết quả tra cứu theo Mã lô
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    {/* Basic Information */}
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                      <div className='space-y-2'>
                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                          Mã lô
                        </p>
                        <p className='font-semibold text-green-800 dark:text-green-300'>
                          {lotTrackingResult.lotCode}
                        </p>
                      </div>
                      <div className='space-y-2'>
                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                          Sản phẩm
                        </p>
                        <p className='font-semibold'>
                          {lotTrackingResult.productName}
                        </p>
                      </div>
                      <div className='space-y-2'>
                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                          Ngày sản xuất
                        </p>
                        <p className='font-semibold'>
                          {lotTrackingResult.productionDate}
                        </p>
                      </div>
                      <div className='space-y-2'>
                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                          Hạn sử dụng
                        </p>
                        <p className='font-semibold'>
                          {lotTrackingResult.expiryDate}
                        </p>
                      </div>
                    </div>

                    {/* Supply Chain Timeline */}
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <h3 className='text-lg font-semibold dark:text-gray-200'>
                          Chuỗi cung ứng
                        </h3>
                        <div className='flex items-center space-x-2'>
                          <Progress
                            value={lotTrackingResult.completionPercentage}
                            className='w-32'
                          />
                          <span className='text-sm font-medium dark:text-gray-300'>
                            {lotTrackingResult.completionPercentage}%
                          </span>
                        </div>
                      </div>

                      <div className='relative'>
                        <div className='absolute bottom-0 left-6 top-8 w-0.5 bg-gray-200 dark:bg-gray-700'></div>
                        <div className='space-y-6'>
                          {lotTrackingResult.timeline.map(
                            (step: any, index: number) => {
                              const IconComponent = step.icon;
                              return (
                                <div
                                  key={index}
                                  className='relative flex items-start space-x-4'
                                >
                                  <div
                                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                                      step.status === 'completed'
                                        ? 'border-green-500 bg-green-100 dark:bg-green-900'
                                        : step.status === 'in_progress'
                                          ? 'border-blue-500 bg-blue-100 dark:bg-blue-900'
                                          : 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
                                    }`}
                                  >
                                    <IconComponent
                                      className={`h-5 w-5 ${
                                        step.status === 'completed'
                                          ? 'text-green-600 dark:text-green-300'
                                          : step.status === 'in_progress'
                                            ? 'text-blue-600 dark:text-blue-300'
                                            : 'text-gray-400 dark:text-gray-500'
                                      }`}
                                    />
                                  </div>
                                  <div className='flex-1 space-y-1'>
                                    <div className='flex items-center space-x-2'>
                                      <h4 className='font-semibold dark:text-gray-200'>
                                        {step.stage}
                                      </h4>
                                      {step.status === 'completed' && (
                                        <Badge
                                          variant='secondary'
                                          className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                        >
                                          <CheckCircle className='mr-1 h-3 w-3' />
                                          Hoàn thành
                                        </Badge>
                                      )}
                                      {step.status === 'in_progress' && (
                                        <Badge
                                          variant='secondary'
                                          className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                        >
                                          <Clock className='mr-1 h-3 w-3' />
                                          Đang xử lý
                                        </Badge>
                                      )}
                                    </div>
                                    <div className='flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400'>
                                      <div className='flex items-center'>
                                        <Calendar className='mr-1 h-4 w-4' />
                                        {step.date}
                                      </div>
                                      <div className='flex items-center'>
                                        <MapPin className='mr-1 h-4 w-4' />
                                        {step.location}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Certificates and QR Code */}
                    <Accordion type='single' collapsible className='w-full'>
                      <AccordionItem value='certificates'>
                        <AccordionTrigger className='text-left'>
                          <div className='flex items-center dark:text-gray-200'>
                            <FileText className='mr-2 h-5 w-5' />
                            Giấy chứng nhận & QR Code
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className='space-y-4'>
                          <div className='grid gap-4 md:grid-cols-2'>
                            <div className='space-y-3'>
                              <h4 className='font-semibold dark:text-gray-200'>
                                Chứng nhận
                              </h4>
                              {lotTrackingResult.certificates.map(
                                (cert: any, index: number) => (
                                  <div
                                    key={index}
                                    className='flex items-center justify-between rounded-lg border p-3 dark:border-gray-600 dark:bg-gray-800'
                                  >
                                    <div className='flex items-center space-x-3'>
                                      <FileText className='h-5 w-5 text-blue-600 dark:text-blue-300' />
                                      <div>
                                        <p className='font-medium dark:text-gray-200'>
                                          {cert.name}
                                        </p>
                                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                                          {cert.type} • {cert.size}
                                        </p>
                                      </div>
                                    </div>
                                    <Button size='sm' variant='outline'>
                                      <Download className='h-4 w-4' />
                                    </Button>
                                  </div>
                                )
                              )}
                            </div>
                            <div className='space-y-3'>
                              <h4 className='font-semibold dark:text-gray-200'>
                                QR Code xác minh
                              </h4>
                              <div className='flex flex-col items-center space-y-2 rounded-lg border p-4 dark:border-gray-600 dark:bg-gray-800'>
                                <div className='flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700'>
                                  <QrCode className='h-12 w-12 text-gray-600 dark:text-gray-300' />
                                </div>
                                <p className='text-center text-xs text-gray-600 dark:text-gray-400'>
                                  Quét để xác minh nhanh
                                </p>
                                <code className='rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700 dark:text-gray-200'>
                                  {lotTrackingResult.qrCode}
                                </code>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              )}
              {/* Blockchain Verification Results */}
              {showBlockchainVerify && blockchainVerifyResult && (
                <Card className='border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950'>
                  <CardHeader>
                    <CardTitle className='flex items-center text-purple-800 dark:text-purple-300'>
                      <Database className='mr-2 h-5 w-5' />
                      Kết quả xác thực Blockchain
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid gap-4 md:grid-cols-2'>
                      <Card className='border-0 bg-white dark:bg-gray-900'>
                        <CardHeader className='pb-3'>
                          <CardTitle className='flex items-center text-base text-gray-900 dark:text-gray-100'>
                            <CheckCircle className='mr-2 h-5 w-5 text-green-600' />
                            Trạng thái giao dịch
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              Trạng thái
                            </span>
                            <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                              <CheckCircle className='mr-1 h-3 w-3' />
                              Transaction Confirmed
                            </Badge>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              Block
                            </span>
                            <span className='font-mono text-sm text-gray-900 dark:text-gray-100'>
                              #{blockchainVerifyResult.blockNumber}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              Xác nhận
                            </span>
                            <span className='font-semibold text-green-600 dark:text-green-400'>
                              {blockchainVerifyResult.confirmations} xác nhận
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className='border-0 bg-white dark:bg-gray-900'>
                        <CardHeader className='pb-3'>
                          <CardTitle className='flex items-center text-base text-gray-900 dark:text-gray-100'>
                            <Hash className='mr-2 h-5 w-5 text-purple-600' />
                            Thông tin Hash
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                          <div className='space-y-1'>
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              Hash
                            </span>
                            <code className='block break-all rounded bg-gray-100 p-2 font-mono text-xs dark:bg-gray-800 dark:text-gray-200'>
                              {blockchainVerifyResult.hash}
                            </code>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              Ngày ghi nhận
                            </span>
                            <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                              {blockchainVerifyResult.timestamp}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className='border-0 bg-white dark:bg-gray-900'>
                      <CardHeader className='pb-3'>
                        <CardTitle className='flex items-center text-base text-gray-900 dark:text-gray-100'>
                          <User className='mr-2 h-5 w-5 text-blue-600' />
                          Bên ghi nhận
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-3'>
                        <div className='grid gap-4 md:grid-cols-2'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              Smart Contract
                            </span>
                            <span className='font-medium text-gray-900 dark:text-gray-100'>
                              {blockchainVerifyResult.smartContract}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              Người ký
                            </span>
                            <span className='font-medium text-gray-900 dark:text-gray-100'>
                              {blockchainVerifyResult.signer}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Truck Simulation Tab */}
          <TabsContent value='truck' className='space-y-6'>
            <TruckSimulation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
