'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Truck,
  History,
  Thermometer,
  QrCode,
  Phone,
  Mail,
  MapPin,
  UserPlus,
  Shield,
  Wifi,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export function HomePage() {
  return (
    <div className='flex-1 space-y-6 p-6'>
      {/* Welcome Section */}
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Chào mừng đến với FASCM Portal
        </h1>
        <p className='text-muted-foreground'>
          Hệ thống quản lý chuỗi cung ứng thực phẩm & nông sản với công nghệ
          Blockchain và IoT
        </p>
      </div>

      {/* Quick Actions */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='cursor-pointer transition-shadow hover:shadow-md'>
          <Link href='/consignee/order'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Truy xuất nguồn gốc
              </CardTitle>
              <QrCode className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>Quét QR</div>
              <p className='text-muted-foreground text-xs'>
                Kiểm tra thông tin sản phẩm
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className='cursor-pointer transition-shadow hover:shadow-md'>
          <Link href='/consignee/my-orders'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Theo dõi đơn hàng
              </CardTitle>
              <Truck className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>Tracking</div>
              <p className='text-muted-foreground text-xs'>
                Xem trạng thái vận chuyển
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className='cursor-pointer transition-shadow hover:shadow-md'>
          <Link href='/consignee/my-orders'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Lịch sử đơn hàng
              </CardTitle>
              <History className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>History</div>
              <p className='text-muted-foreground text-xs'>
                Xem các đơn hàng đã đặt
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className='cursor-pointer transition-shadow hover:shadow-md'>
          <Link href='/consignee/my-orders'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Chất lượng IoT
              </CardTitle>
              <Thermometer className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>Monitor</div>
              <p className='text-muted-foreground text-xs'>
                Theo dõi nhiệt độ, độ ẩm
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* QR Code Traceability Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <QrCode className='h-5 w-5' />
            Truy xuất nguồn gốc sản phẩm
          </CardTitle>
          <CardDescription>
            Quét mã QR trên bao bì sản phẩm để xem thông tin chi tiết về nguồn
            gốc, quy trình sản xuất và vận chuyển
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='space-y-1'>
              <p className='font-medium'>Quét QR Code</p>
              <p className='text-muted-foreground text-sm'>
                Sử dụng camera để quét mã QR trên sản phẩm
              </p>
            </div>
            <Button>
              <QrCode className='mr-2 h-4 w-4' />
              Quét ngay
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin liên hệ</CardTitle>
            <CardDescription>Hỗ trợ khách hàng 24/7</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Phone className='h-4 w-4 text-green-600' />
              <div>
                <p className='font-medium'>Hotline</p>
                <p className='text-muted-foreground text-sm'>1900-1234</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Mail className='h-4 w-4 text-blue-600' />
              <div>
                <p className='font-medium'>Email</p>
                <p className='text-muted-foreground text-sm'>
                  support@fascm.com
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <MapPin className='h-4 w-4 text-red-600' />
              <div>
                <p className='font-medium'>Địa chỉ</p>
                <p className='text-muted-foreground text-sm'>
                  Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ, Thành Phố Thủ Đức,
                  Hồ Chí Minh
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tạo tài khoản</CardTitle>
            <CardDescription>
              Đăng ký để sử dụng đầy đủ tính năng
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <p className='text-sm'>Quy trình đăng ký đơn giản:</p>
              <ul className='text-muted-foreground space-y-1 text-sm'>
                <li>• Điền thông tin cơ bản</li>
                <li>• Xác thực email/số điện thoại</li>
                <li>• Hoàn tất đăng ký</li>
              </ul>
            </div>
            <Button className='w-full'>
              <UserPlus className='mr-2 h-4 w-4' />
              Đăng ký ngay
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Features */}
      <Card>
        <CardHeader>
          <CardTitle>Tính năng hệ thống</CardTitle>
          <CardDescription>
            Công nghệ tiên tiến đảm bảo chất lượng và minh bạch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='flex items-start gap-3 rounded-lg border p-4'>
              <Shield className='mt-1 h-6 w-6 text-blue-600' />
              <div className='space-y-1'>
                <h4 className='font-medium'>Blockchain</h4>
                <p className='text-muted-foreground text-sm'>
                  Đảm bảo tính minh bạch và không thể thay đổi thông tin sản
                  phẩm
                </p>
                <Badge variant='secondary'>Bảo mật cao</Badge>
              </div>
            </div>

            <div className='flex items-start gap-3 rounded-lg border p-4'>
              <Wifi className='mt-1 h-6 w-6 text-green-600' />
              <div className='space-y-1'>
                <h4 className='font-medium'>IoT Monitoring</h4>
                <p className='text-muted-foreground text-sm'>
                  Theo dõi nhiệt độ, độ ẩm trong quá trình vận chuyển và bảo
                  quản
                </p>
                <Badge variant='secondary'>Real-time</Badge>
              </div>
            </div>

            <div className='flex items-start gap-3 rounded-lg border p-4'>
              <Activity className='mt-1 h-6 w-6 text-orange-600' />
              <div className='space-y-1'>
                <h4 className='font-medium'>Real-time Tracking</h4>
                <p className='text-muted-foreground text-sm'>
                  Theo dõi vị trí và trạng thái đơn hàng theo thời gian thực
                </p>
                <Badge variant='secondary'>Live GPS</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
