'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Eye,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import TruckSimulation from './truck-simulation';

export default function DemoPage() {
  // IoT Sensor Data
  const [sensorData, setSensorData] = useState({
    temperature: 4.2,
    humidity: 68,
    location: { lat: 21.0285, lng: 105.8542 },
    status: 'active'
  });

  const [temperatureHistory, setTemperatureHistory] = useState([
    { time: '10:00', temp: 4.0 },
    { time: '10:05', temp: 4.1 },
    { time: '10:10', temp: 4.3 },
    { time: '10:15', temp: 4.2 },
    { time: '10:20', temp: 4.4 }
  ]);

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

      setTemperatureHistory((prev) => {
        const newTime = new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        });
        const newData = [
          ...prev.slice(1),
          {
            time: newTime,
            temp: sensorData.temperature
          }
        ];
        return newData;
      });

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
      timestamp: '2024-01-15 06:30:00',
      hash: '0x1a2b3c4d',
      status: 'completed',
      details: 'Thu hoạch rau xanh tại độ cao 1,500m'
    },
    {
      stage: 'Kho lưu trữ',
      location: 'Kho lạnh Hòa Lạc',
      timestamp: '2024-01-15 14:20:00',
      hash: '0x2b3c4d5e',
      status: 'completed',
      details: 'Bảo quản ở 4°C, độ ẩm 70%'
    },
    {
      stage: 'Vận chuyển',
      location: 'Xe tải lạnh VN-001',
      timestamp: '2024-01-16 08:00:00',
      hash: '0x3c4d5e6f',
      status: 'in_progress',
      details: 'Đang vận chuyển đến Hà Nội'
    },
    {
      stage: 'Giao hàng',
      location: 'Siêu thị BigC Thăng Long',
      timestamp: '2024-01-16 16:00:00',
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
    setBatchCode('LOT-2024-001');
    setShowQRResult(true);
  };

  const handleBlockchainVerify = () => {
    setShowBlockchainVerify(true);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 p-6'>
      <div className='mx-auto max-w-7xl space-y-8'>
        {/* Header */}
        <div className='space-y-4 text-center'>
          <h1 className='text-4xl font-bold text-gray-900'>
            Demo Công nghệ <span className='text-blue-600'>IoT</span> &{' '}
            <span className='text-purple-600'>Blockchain</span>
          </h1>
          <p className='mx-auto max-w-3xl text-xl text-gray-600'>
            Trải nghiệm trực tiếp công nghệ giám sát realtime và truy xuất nguồn
            gốc minh bạch
          </p>
        </div>

        <Tabs defaultValue='dashboard' className='w-full'>
          <TabsList className='grid w-full grid-cols-5'>
            <TabsTrigger value='dashboard'>IoT Dashboard</TabsTrigger>
            <TabsTrigger value='traceability'>
              Blockchain Traceability
            </TabsTrigger>
            <TabsTrigger value='comparison'>So sánh Công nghệ</TabsTrigger>
            <TabsTrigger value='interactive'>Tra cứu</TabsTrigger>
            <TabsTrigger value='truck'>Truck Simulation</TabsTrigger>
          </TabsList>

          {/* IoT Dashboard Tab */}
          <TabsContent value='dashboard' className='space-y-6'>
            <div className='grid gap-6 lg:grid-cols-3'>
              {/* Sensor Selection */}
              <Card className='lg:col-span-1'>
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
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedSensor(sensor.id)}
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>{sensor.name}</p>
                          <p className='text-sm text-gray-600'>{sensor.type}</p>
                        </div>
                        <Badge
                          variant={
                            sensor.status === 'active' ? 'default' : 'secondary'
                          }
                          className={
                            sensor.status === 'active'
                              ? 'bg-green-100 text-green-800'
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
                    <div className='rounded-lg bg-blue-50 p-4 text-center'>
                      <Thermometer className='mx-auto mb-2 h-8 w-8 text-blue-600' />
                      <p className='text-2xl font-bold text-blue-800'>
                        {sensorData.temperature.toFixed(1)}°C
                      </p>
                      <p className='text-sm text-gray-600'>Nhiệt độ</p>
                    </div>
                    <div className='rounded-lg bg-green-50 p-4 text-center'>
                      <Droplets className='mx-auto mb-2 h-8 w-8 text-green-600' />
                      <p className='text-2xl font-bold text-green-800'>
                        {sensorData.humidity.toFixed(0)}%
                      </p>
                      <p className='text-sm text-gray-600'>Độ ẩm</p>
                    </div>
                    <div className='rounded-lg bg-orange-50 p-4 text-center'>
                      <Navigation className='mx-auto mb-2 h-8 w-8 text-orange-600' />
                      <p className='text-sm font-bold text-orange-800'>
                        {sensorData.location.lat.toFixed(4)}°N
                      </p>
                      <p className='text-sm font-bold text-orange-800'>
                        {sensorData.location.lng.toFixed(4)}°E
                      </p>
                      <p className='text-sm text-gray-600'>GPS</p>
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
                  <div className='flex items-center rounded-lg bg-green-50 p-3'>
                    <CheckCircle className='mr-3 h-6 w-6 text-green-600' />
                    <div>
                      <p className='font-medium text-green-800'>
                        Nhiệt độ ổn định
                      </p>
                      <p className='text-sm text-green-600'>
                        Trong khoảng cho phép
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center rounded-lg bg-green-50 p-3'>
                    <CheckCircle className='mr-3 h-6 w-6 text-green-600' />
                    <div>
                      <p className='font-medium text-green-800'>
                        Độ ẩm bình thường
                      </p>
                      <p className='text-sm text-green-600'>68% - Lý tưởng</p>
                    </div>
                  </div>
                  <div className='flex items-center rounded-lg bg-blue-50 p-3'>
                    <Navigation className='mr-3 h-6 w-6 text-blue-600' />
                    <div>
                      <p className='font-medium text-blue-800'>GPS hoạt động</p>
                      <p className='text-sm text-blue-600'>
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
                        Mã lô: LOT-2024-001
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
                  <div className='rounded-lg bg-gray-50 p-4'>
                    <p className='mb-2 text-sm text-gray-600'>
                      Transaction Hash:
                    </p>
                    <code className='font-mono text-sm break-all text-purple-800'>
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
                    onClick={handleBlockchainVerify}
                    variant='outline'
                    className='w-full'
                  >
                    <Shield className='mr-2 h-4 w-4' />
                    Verify on Blockchain
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
                    Lịch sử Blockchain Timeline - LOT-2024-001
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {traceabilityData.map((item, index) => (
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
                            <h4 className='font-medium text-gray-900'>
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
                          <p className='text-sm text-gray-600'>
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

          {/* Technology Comparison Tab */}
          <TabsContent value='comparison' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-center'>
                  So sánh: Truyền thống vs Công nghệ IoT + Blockchain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid gap-8 lg:grid-cols-2'>
                  {/* Traditional Process */}
                  <div className='space-y-4'>
                    <h3 className='text-center text-xl font-bold text-red-600'>
                      ❌ Quy trình Truyền thống
                    </h3>
                    <div className='space-y-3'>
                      <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                        <h4 className='font-medium text-red-800'>
                          Thiếu minh bạch
                        </h4>
                        <p className='text-sm text-red-600'>
                          Không biết nguồn gốc chính xác
                        </p>
                      </div>
                      <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                        <h4 className='font-medium text-red-800'>
                          Khó kiểm chứng
                        </h4>
                        <p className='text-sm text-red-600'>
                          Dựa vào giấy tờ, dễ làm giả
                        </p>
                      </div>
                      <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                        <h4 className='font-medium text-red-800'>
                          Không theo dõi realtime
                        </h4>
                        <p className='text-sm text-red-600'>
                          Không biết tình trạng vận chuyển
                        </p>
                      </div>
                      <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                        <h4 className='font-medium text-red-800'>Rủi ro cao</h4>
                        <p className='text-sm text-red-600'>
                          Hàng hóa có thể bị hỏng mà không biết
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Modern Process */}
                  <div className='space-y-4'>
                    <h3 className='text-center text-xl font-bold text-green-600'>
                      ✅ Công nghệ IoT + Blockchain
                    </h3>
                    <div className='space-y-3'>
                      <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
                        <h4 className='font-medium text-green-800'>
                          Minh bạch 100%
                        </h4>
                        <p className='text-sm text-green-600'>
                          Quét QR biết ngay nguồn gốc
                        </p>
                      </div>
                      <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
                        <h4 className='font-medium text-green-800'>
                          Không thể làm giả
                        </h4>
                        <p className='text-sm text-green-600'>
                          Dữ liệu được mã hóa trên blockchain
                        </p>
                      </div>
                      <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
                        <h4 className='font-medium text-green-800'>
                          Theo dõi realtime
                        </h4>
                        <p className='text-sm text-green-600'>
                          IoT sensors cập nhật liên tục
                        </p>
                      </div>
                      <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
                        <h4 className='font-medium text-green-800'>
                          An toàn tối đa
                        </h4>
                        <p className='text-sm text-green-600'>
                          Cảnh báo ngay khi có bất thường
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits Summary */}
                <div className='mt-8 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-6'>
                  <h4 className='mb-4 text-center text-lg font-bold'>
                    🚀 Lợi ích của Công nghệ IoT + Blockchain
                  </h4>
                  <div className='grid gap-4 text-center md:grid-cols-3'>
                    <div>
                      <TrendingUp className='mx-auto mb-2 h-8 w-8 text-blue-600' />
                      <p className='font-medium'>Tăng hiệu quả</p>
                      <p className='text-sm text-gray-600'>
                        Tự động hóa quy trình
                      </p>
                    </div>
                    <div>
                      <Shield className='mx-auto mb-2 h-8 w-8 text-green-600' />
                      <p className='font-medium'>Bảo mật cao</p>
                      <p className='text-sm text-gray-600'>
                        Dữ liệu không thể thay đổi
                      </p>
                    </div>
                    <div>
                      <Eye className='mx-auto mb-2 h-8 w-8 text-purple-600' />
                      <p className='font-medium'>Minh bạch</p>
                      <p className='text-sm text-gray-600'>
                        Theo dõi toàn bộ chuỗi
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      placeholder='Nhập mã lô (VD: LOT-2024-001)'
                      value={batchCode}
                      onChange={(e) => setBatchCode(e.target.value)}
                    />
                    <Button onClick={() => setShowQRResult(true)}>
                      <Search className='h-4 w-4' />
                    </Button>
                  </div>
                  <div className='text-sm text-gray-600'>
                    <p>Mã lô mẫu để thử:</p>
                    <ul className='mt-2 list-inside list-disc space-y-1'>
                      <li>LOT-2024-001 (Rau xanh Đà Lạt)</li>
                      <li>LOT-2024-002 (Thịt bò Úc)</li>
                      <li>LOT-2024-003 (Cá hồi Na Uy)</li>
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
                  />
                  <Button className='w-full' variant='outline'>
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
            </div>

            {/* Statistics Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <TrendingUp className='mr-2 h-5 w-5 text-green-600' />
                  Thống kê Hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4 md:grid-cols-4'>
                  <div className='rounded-lg bg-blue-50 p-4 text-center'>
                    <p className='text-2xl font-bold text-blue-800'>1,247</p>
                    <p className='text-sm text-blue-600'>
                      Sản phẩm được theo dõi
                    </p>
                  </div>
                  <div className='rounded-lg bg-green-50 p-4 text-center'>
                    <p className='text-2xl font-bold text-green-800'>98.7%</p>
                    <p className='text-sm text-green-600'>
                      Độ chính xác dữ liệu
                    </p>
                  </div>
                  <div className='rounded-lg bg-purple-50 p-4 text-center'>
                    <p className='text-2xl font-bold text-purple-800'>24/7</p>
                    <p className='text-sm text-purple-600'>Giám sát liên tục</p>
                  </div>
                  <div className='rounded-lg bg-orange-50 p-4 text-center'>
                    <p className='text-2xl font-bold text-orange-800'>156</p>
                    <p className='text-sm text-orange-600'>Cảnh báo đã xử lý</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
