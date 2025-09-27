'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800'>
      <div className='container mx-auto px-4 py-16'>
        <div className='mx-auto max-w-4xl'>
          {/* Header */}
          <div className='mb-12 text-center'>
            <h1 className='mb-4 text-4xl font-bold text-gray-900 dark:text-white'>
              Liên hệ với chúng tôi
            </h1>
            <p className='text-xl text-gray-600 dark:text-gray-300'>
              Để được cấp tài khoản sử dụng hệ thống AgriChain
            </p>
          </div>

          {/* Main Contact Card */}
          <Card className='mb-8 shadow-lg'>
            <CardHeader className='rounded-t-lg bg-green-600 text-center text-white'>
              <CardTitle className='text-2xl'>Đăng ký tài khoản</CardTitle>
              <CardDescription className='text-green-100'>
                Liên hệ hotline để được hỗ trợ tạo tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent className='p-8'>
              <div className='mb-8 text-center'>
                <div className='mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100'>
                  <Phone className='h-10 w-10 text-green-600' />
                </div>
                <h2 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
                  Hotline: 0909.123.456
                </h2>
                <p className='text-lg text-gray-600 dark:text-gray-300'>
                  Gọi ngay để được tư vấn và cấp tài khoản miễn phí
                </p>
              </div>

              <div className='mb-8 grid gap-6 md:grid-cols-2'>
                <div className='flex items-center space-x-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700'>
                  <Clock className='h-6 w-6 text-green-600' />
                  <div>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>
                      Giờ làm việc
                    </h3>
                    <p className='text-gray-600 dark:text-gray-300'>
                      8:00 - 17:00 (T2-T6)
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700'>
                  <Mail className='h-6 w-6 text-green-600' />
                  <div>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>
                      Email hỗ trợ
                    </h3>
                    <p className='text-gray-600 dark:text-gray-300'>
                      support@agrichain.vn
                    </p>
                  </div>
                </div>
              </div>

              <div className='text-center'>
                <Link href='/consignee/home'>
                  <Button variant='outline' className='mr-4'>
                    Quay lại trang chủ
                  </Button>
                </Link>
                <Button className='bg-green-600 hover:bg-green-700'>
                  <Phone className='mr-2 h-4 w-4' />
                  Gọi ngay
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className='grid gap-6 md:grid-cols-3'>
            <Card>
              <CardContent className='p-6 text-center'>
                <MapPin className='mx-auto mb-3 h-8 w-8 text-green-600' />
                <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                  Địa chỉ
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  Tòa nhà FPT Software
                  <br />
                  Khu Công nghệ cao Hòa Lạc
                  <br />
                  Hà Nội, Việt Nam
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6 text-center'>
                <Phone className='mx-auto mb-3 h-8 w-8 text-green-600' />
                <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                  Điện thoại
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  Hotline: 0909.123.456
                  <br />
                  Fax: (024) 3555.2222
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6 text-center'>
                <Mail className='mx-auto mb-3 h-8 w-8 text-green-600' />
                <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                  Email
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  support@agrichain.vn
                  <br />
                  info@agrichain.vn
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
