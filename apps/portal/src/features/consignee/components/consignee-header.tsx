'use client';

import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ConsigneeHeader() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/consignee' && pathname === '/consignee') return true;
    if (path !== '/consignee' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className='sticky top-0 z-50 border-b border-green-100 bg-white shadow-sm'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link href='/consignee' className='flex items-center space-x-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-600'>
              <Leaf className='h-6 w-6 text-white' />
            </div>
            <span className='text-xl font-bold text-green-800'>AgriChain</span>
          </Link>

          {/* Navigation Menu */}
          <nav className='hidden space-x-8 md:flex'>
            <Link
              href='/consignee'
              className={`font-medium transition-colors ${
                isActive('/consignee')
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              href='/consignee/order'
              className={`font-medium transition-colors ${
                isActive('/consignee/order')
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Đặt hàng
            </Link>
            <Link
              href='/consignee/my-orders'
              className={`font-medium transition-colors ${
                isActive('/consignee/my-orders')
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Đơn hàng của tôi
            </Link>
            <Link
              href='/consignee/demo'
              className={`font-medium transition-colors ${
                isActive('/consignee/demo')
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Demo IoT & Blockchain
            </Link>
            <Link
              href='/consignee#contact'
              className='font-medium text-gray-700 transition-colors hover:text-green-600'
            >
              Liên hệ
            </Link>
          </nav>

          {/* Login/Register Button */}
          <div className='flex items-center space-x-4'>
            <Button variant='outline' className='hidden sm:inline-flex'>
              Đăng nhập
            </Button>
            <Button className='bg-green-600 hover:bg-green-700'>Đăng ký</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
