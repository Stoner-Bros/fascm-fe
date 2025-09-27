'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  Mail,
  MapPin,
  Truck,
  Leaf,
  Shield,
  QrCode,
  Thermometer,
  Droplets,
  Navigation,
  ChevronRight,
  Play
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [currentTemp, setCurrentTemp] = useState(8);
  const [currentHumidity, setCurrentHumidity] = useState(72);
  const [blockchainHash, setBlockchainHash] = useState('0x7a8b9c2d...');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTemp((prev) => prev + (Math.random() - 0.5) * 2);
      setCurrentHumidity((prev) =>
        Math.max(60, Math.min(80, prev + (Math.random() - 0.5) * 5))
      );
      setBlockchainHash(`0x${Math.random().toString(16).substr(2, 8)}...`);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950'>
      {/* Hero Section */}
      <section id='home' className='relative overflow-hidden py-20 lg:py-32'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid items-center gap-12 lg:grid-cols-2'>
            <div className='space-y-8'>
              <div className='space-y-4'>
                <Badge className='bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'>
                  🚀 Công nghệ IoT & Blockchain
                </Badge>
                <h1 className='text-4xl font-bold leading-tight text-gray-900 lg:text-6xl dark:text-white'>
                  Quản lý Chuỗi Cung Ứng
                  <span className='text-green-600 dark:text-green-400'>
                    {' '}
                    Nông Sản Minh Bạch
                  </span>
                </h1>
                <p className='text-xl leading-relaxed text-gray-600 dark:text-gray-300'>
                  Theo dõi hành trình nông sản từ trang trại đến bàn ăn với công
                  nghệ IoT và Blockchain tiên tiến
                </p>
              </div>

              {/* Hotline */}
              <div className='flex items-center space-x-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-gray-700 dark:bg-gray-800'>
                <Phone className='h-6 w-6 text-green-600 dark:text-green-400' />
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>
                    Hotline 24/7
                  </p>
                  <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
                    1900 1234
                  </p>
                </div>
                <Button
                  size='sm'
                  className='ml-auto bg-green-600 hover:bg-green-700'
                >
                  <Phone className='mr-2 h-4 w-4' />
                  Gọi ngay
                </Button>
              </div>

              {/* CTA Buttons */}
              <div className='flex flex-col gap-4 sm:flex-row'>
                <Button
                  size='lg'
                  className='bg-green-600 px-8 text-lg hover:bg-green-700'
                >
                  Bắt đầu đặt hàng
                  <ChevronRight className='ml-2 h-5 w-5' />
                </Button>
                <Button size='lg' variant='outline' className='px-8 text-lg'>
                  <Play className='mr-2 h-5 w-5' />
                  Xem demo
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className='relative'>
              <div className='rounded-2xl bg-gradient-to-br from-green-400 to-green-600 p-8 shadow-2xl dark:from-green-700 dark:to-green-900'>
                <div className='grid grid-cols-2 gap-4 text-white'>
                  <div className='rounded-lg bg-white/20 p-4 backdrop-blur-sm'>
                    <Truck className='mb-2 h-8 w-8' />
                    <p className='text-sm'>Vận chuyển</p>
                    <p className='font-bold'>Real-time</p>
                  </div>
                  <div className='rounded-lg bg-white/20 p-4 backdrop-blur-sm'>
                    <QrCode className='mb-2 h-8 w-8' />
                    <p className='text-sm'>Truy xuất</p>
                    <p className='font-bold'>Nguồn gốc</p>
                  </div>
                  <div className='rounded-lg bg-white/20 p-4 backdrop-blur-sm'>
                    <Shield className='mb-2 h-8 w-8' />
                    <p className='text-sm'>Blockchain</p>
                    <p className='font-bold'>Minh bạch</p>
                  </div>
                  <div className='rounded-lg bg-white/20 p-4 backdrop-blur-sm'>
                    <Leaf className='mb-2 h-8 w-8' />
                    <p className='text-sm'>Nông sản</p>
                    <p className='font-bold'>Sạch</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlight Features */}
      <section className='bg-white py-20 dark:bg-gray-900'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mb-16 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 lg:text-4xl dark:text-white'>
              Tại sao chọn AgriChain?
            </h2>
            <p className='mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300'>
              Chúng tôi mang đến giải pháp toàn diện cho chuỗi cung ứng nông sản
              với công nghệ tiên tiến
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
            <Card className='border-green-200 transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <CardHeader className='text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900'>
                  <QrCode className='h-8 w-8 text-green-600 dark:text-green-400' />
                </div>
                <CardTitle className='text-green-800 dark:text-green-300'>
                  🌱 Truy xuất nguồn gốc
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-center text-gray-600 dark:text-gray-300'>
                  Quét QR để biết hành trình nông sản từ trang trại đến tay bạn
                </CardDescription>
              </CardContent>
            </Card>

            <Card className='border-green-200 transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <CardHeader className='text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
                  <Navigation className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                </div>
                <CardTitle className='text-blue-800 dark:text-blue-300'>
                  📡 IoT Realtime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-center text-gray-600 dark:text-gray-300'>
                  Theo dõi nhiệt độ, độ ẩm, GPS vận chuyển trực tiếp
                </CardDescription>
              </CardContent>
            </Card>

            <Card className='border-green-200 transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <CardHeader className='text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900'>
                  <Shield className='h-8 w-8 text-purple-600 dark:text-purple-400' />
                </div>
                <CardTitle className='text-purple-800 dark:text-purple-300'>
                  🔗 Blockchain Proof
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-center text-gray-600 dark:text-gray-300'>
                  Mọi đơn hàng được ghi nhận minh bạch, chống gian lận
                </CardDescription>
              </CardContent>
            </Card>

            <Card className='border-green-200 transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <CardHeader className='text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900'>
                  <Truck className='h-8 w-8 text-orange-600 dark:text-orange-400' />
                </div>
                <CardTitle className='text-orange-800 dark:text-orange-300'>
                  📦 Đặt hàng dễ dàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-center text-gray-600 dark:text-gray-300'>
                  Theo lô, theo kg, theo business rule rõ ràng
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='bg-green-50 py-20 dark:bg-gray-800'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mb-16 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 lg:text-4xl dark:text-white'>
              Quy trình đơn giản 3 bước
            </h2>
            <p className='text-xl text-gray-600 dark:text-gray-300'>
              Từ đặt hàng đến nhận sản phẩm, mọi thứ đều minh bạch và dễ dàng
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-3'>
            <div className='text-center'>
              <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-600'>
                <span className='text-2xl font-bold text-white'>1</span>
              </div>
              <h3 className='mb-4 text-xl font-bold text-gray-900 dark:text-white'>
                Đặt lô hàng online
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Chọn sản phẩm, số lượng và thông tin giao hàng một cách dễ dàng
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600'>
                <span className='text-2xl font-bold text-white'>2</span>
              </div>
              <h3 className='mb-4 text-xl font-bold text-gray-900 dark:text-white'>
                Theo dõi vận chuyển
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Xem real-time IoT data: nhiệt độ, độ ẩm, vị trí GPS của hàng hóa
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-purple-600'>
                <span className='text-2xl font-bold text-white'>3</span>
              </div>
              <h3 className='mb-4 text-xl font-bold text-gray-900 dark:text-white'>
                Nhận hàng & thanh toán
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Xác nhận chất lượng và thanh toán minh bạch qua blockchain
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* IoT & Blockchain Demo */}
      <section className='bg-white py-20 dark:bg-gray-900'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mb-16 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 lg:text-4xl dark:text-white'>
              Demo Công nghệ IoT & Blockchain
            </h2>
            <p className='text-xl text-gray-600 dark:text-gray-300'>
              Trải nghiệm trực tiếp công nghệ giám sát và minh bạch hóa
            </p>
          </div>

          <div className='grid gap-12 lg:grid-cols-2'>
            {/* IoT Widget */}
            <Card className='border-blue-200 dark:border-gray-700 dark:bg-gray-800'>
              <CardHeader>
                <CardTitle className='flex items-center text-blue-800 dark:text-blue-300'>
                  <Thermometer className='mr-2 h-6 w-6' />
                  IoT Sensor Demo
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='rounded-lg bg-blue-50 p-4 dark:bg-blue-900'>
                    <div className='flex items-center justify-between'>
                      <Thermometer className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                      <span className='text-2xl font-bold text-blue-800 dark:text-blue-300'>
                        {currentTemp.toFixed(1)}°C
                      </span>
                    </div>
                    <p className='mt-2 text-sm text-gray-600 dark:text-gray-300'>
                      Nhiệt độ kho
                    </p>
                  </div>
                  <div className='rounded-lg bg-green-50 p-4 dark:bg-green-900'>
                    <div className='flex items-center justify-between'>
                      <Droplets className='h-8 w-8 text-green-600 dark:text-green-400' />
                      <span className='text-2xl font-bold text-green-800 dark:text-green-300'>
                        {currentHumidity.toFixed(0)}%
                      </span>
                    </div>
                    <p className='mt-2 text-sm text-gray-600 dark:text-gray-300'>
                      Độ ẩm
                    </p>
                  </div>
                </div>
                <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-800'>
                  <div className='flex items-center justify-between'>
                    <Navigation className='h-6 w-6 text-gray-600 dark:text-gray-300' />
                    <Badge
                      variant='outline'
                      className='text-green-600 dark:text-green-400'
                    >
                      Đang vận chuyển
                    </Badge>
                  </div>
                  <p className='mt-2 text-sm text-gray-600 dark:text-gray-300'>
                    GPS: 21.0285°N, 105.8542°E
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Blockchain Demo */}
            <Card className='border-purple-200 dark:border-gray-700 dark:bg-gray-800'>
              <CardHeader>
                <CardTitle className='flex items-center text-purple-800 dark:text-purple-300'>
                  <Shield className='mr-2 h-6 w-6' />
                  Blockchain Hash Demo
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='rounded-lg bg-purple-50 p-4 dark:bg-purple-900'>
                  <p className='mb-2 text-sm text-gray-600 dark:text-gray-300'>
                    Transaction Hash:
                  </p>
                  <code className='break-all font-mono text-sm text-purple-800 dark:text-purple-300'>
                    {blockchainHash}
                  </code>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-300'>
                      Block Height:
                    </span>
                    <span className='font-mono'>2,847,392</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-300'>
                      Confirmations:
                    </span>
                    <span className='font-mono text-green-600 dark:text-green-400'>
                      12/12
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-300'>
                      Status:
                    </span>
                    <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'>
                      Verified
                    </Badge>
                  </div>
                </div>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Mọi giao dịch được ghi nhận bất biến trên blockchain, đảm bảo
                  tính minh bạch tuyệt đối.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id='contact' className='bg-green-50 py-20 dark:bg-gray-800'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mb-16 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 lg:text-4xl dark:text-white'>
              Liên hệ với chúng tôi
            </h2>
            <p className='text-xl text-gray-600 dark:text-gray-300'>
              Đội ngũ hỗ trợ 24/7 sẵn sàng giải đáp mọi thắc mắc
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-3'>
            <Card className='border-green-200 text-center dark:border-gray-700 dark:bg-gray-800'>
              <CardHeader>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900'>
                  <Phone className='h-8 w-8 text-green-600 dark:text-green-400' />
                </div>
                <CardTitle className='dark:text-white'>Hotline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-2 text-2xl font-bold text-green-600 dark:text-green-400'>
                  1900 1234
                </p>
                <p className='text-gray-600 dark:text-gray-300'>Hỗ trợ 24/7</p>
                <Button className='mt-4 bg-green-600 hover:bg-green-700'>
                  <Phone className='mr-2 h-4 w-4' />
                  Gọi ngay
                </Button>
              </CardContent>
            </Card>

            <Card className='border-green-200 text-center dark:border-gray-700 dark:bg-gray-800'>
              <CardHeader>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
                  <Mail className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                </div>
                <CardTitle className='dark:text-white'>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-2 text-lg font-semibold text-blue-600 dark:text-blue-400'>
                  support@agrichain.vn
                </p>
                <p className='text-gray-600 dark:text-gray-300'>
                  Phản hồi trong 2 giờ
                </p>
                <Button variant='outline' className='mt-4'>
                  <Mail className='mr-2 h-4 w-4' />
                  Gửi email
                </Button>
              </CardContent>
            </Card>

            <Card className='border-green-200 text-center dark:border-gray-700 dark:bg-gray-800'>
              <CardHeader>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900'>
                  <MapPin className='h-8 w-8 text-orange-600 dark:text-orange-400' />
                </div>
                <CardTitle className='dark:text-white'>Địa chỉ kho</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-2 font-medium text-gray-800 dark:text-gray-200'>
                  Khu Công nghệ cao Hòa Lạc
                </p>
                <p className='mb-4 text-gray-600 dark:text-gray-300'>
                  Thạch Thất, Hà Nội
                </p>
                <Button variant='outline' className='mt-4'>
                  <MapPin className='mr-2 h-4 w-4' />
                  Xem bản đồ
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
