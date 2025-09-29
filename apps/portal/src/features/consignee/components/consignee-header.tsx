'use client';

import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/layout/user-nav';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Leaf, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    title: 'Đơn hàng #ORD001 đã được xác nhận',
    message: 'Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.',
    time: '5 phút trước',
    isRead: false,
    type: 'order'
  },
  {
    id: 2,
    title: 'Sản phẩm mới có sẵn',
    message: 'Rau xanh hữu cơ từ trang trại ABC đã có sẵn.',
    time: '1 giờ trước',
    isRead: false,
    type: 'product'
  },
  {
    id: 3,
    title: 'Đơn hàng #ORD002 đang giao',
    message: 'Đơn hàng của bạn đang trên đường giao đến địa chỉ.',
    time: '2 giờ trước',
    isRead: true,
    type: 'delivery'
  }
];

export default function ConsigneeHeader() {
  const pathname = usePathname();
  const { user } = useUser();
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const isActive = (path: string) => {
    if (path === '/consignee' && pathname === '/consignee') return true;
    if (path !== '/consignee' && pathname.startsWith(path)) return true;
    return false;
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
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
          <div className='flex items-center space-x-4'>
            <ModeToggle />
            {user ? (
              <>
                {/* Notification Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm' className='relative'>
                      <Bell className='h-5 w-5' />
                      {unreadCount > 0 && (
                        <Badge
                          variant='destructive'
                          className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs'
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-80'>
                    <DropdownMenuLabel className='flex items-center justify-between'>
                      Thông báo
                      {unreadCount > 0 && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={markAllAsRead}
                          className='text-xs'
                        >
                          Đánh dấu tất cả đã đọc
                        </Button>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className='max-h-96 overflow-y-auto'>
                      {notifications.length === 0 ? (
                        <div className='p-4 text-center text-gray-500'>
                          Không có thông báo nào
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className={`flex cursor-pointer flex-col items-start p-3 ${
                              !notification.isRead
                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className='flex w-full items-start justify-between'>
                              <div className='flex-1'>
                                <p
                                  className={`text-sm font-medium ${
                                    !notification.isRead
                                      ? 'text-blue-900 dark:text-blue-100'
                                      : 'text-gray-900 dark:text-gray-100'
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
                                  {notification.message}
                                </p>
                                <p className='mt-1 text-xs text-gray-500 dark:text-gray-500'>
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className='ml-2 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600'></div>
                              )}
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <UserNav />
              </>
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
