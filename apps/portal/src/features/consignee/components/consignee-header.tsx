'use client';

import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/layout/user-nav';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Leaf } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ConsigneeHeader() {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (path: string) => {
    if (path === '/consignee' && pathname === '/consignee') return true;
    if (path !== '/consignee' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className='sticky top-0 z-50 border-b border-green-100 bg-white shadow-sm dark:bg-gray-900'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link href='/consignee/home' className='flex items-center space-x-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-600'>
              <Leaf className='h-6 w-6 text-white' />
            </div>
            <span className='text-xl font-bold text-green-800 dark:text-white'>
              AgriChain
            </span>
          </Link>

          {/* Navigation Menu */}
          <nav className='hidden space-x-8 md:flex'>
            <Link
              href='/consignee/home'
              className={`font-medium transition-colors ${
                isActive('/consignee/home')
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-700 hover:text-green-600 dark:text-white'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              href='/consignee/demo'
              className={`font-medium transition-colors ${
                isActive('/consignee/demo')
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-700 hover:text-green-600 dark:text-white'
              }`}
            >
              Demo IoT & Blockchain
            </Link>
            <Link
              href='/consignee#contact'
              className='font-medium text-gray-700 transition-colors hover:text-green-600 dark:text-white'
            >
              Liên hệ
            </Link>
          </nav>

          {/* Login/Register Button hoặc User Avatar */}
          <div className='flex items-center space-x-10'>
            <ModeToggle />
            {user ? (
              <UserNav />
            ) : (
              <>
                <SignInButton mode='modal'>
                  <Button variant='outline' className='hidden sm:inline-flex'>
                    Đăng nhập
                  </Button>
                </SignInButton>
                <Link href='/contact'>
                  <Button className='bg-green-600 hover:bg-green-700'>
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
