'use client';

import { Leaf, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';

export default function ConsigneeFooter() {
  return (
    <footer className='bg-gray-900 py-16 text-white'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid gap-8 md:grid-cols-4'>
          {/* Company Info */}
          <div className='space-y-4'>
            <div className='flex items-center space-x-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-600'>
                <Leaf className='h-6 w-6 text-white' />
              </div>
              <span className='text-xl font-bold'>AgriChain</span>
            </div>
            <p className='text-gray-400'>
              Hệ thống quản lý chuỗi cung ứng nông sản minh bạch với công nghệ
              IoT và Blockchain.
            </p>
            <div className='flex space-x-4'>
              <Facebook className='h-5 w-5 cursor-pointer text-gray-400 hover:text-white' />
              <Twitter className='h-5 w-5 cursor-pointer text-gray-400 hover:text-white' />
              <Instagram className='h-5 w-5 cursor-pointer text-gray-400 hover:text-white' />
              <Youtube className='h-5 w-5 cursor-pointer text-gray-400 hover:text-white' />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='mb-4 text-lg font-semibold'>Liên kết nhanh</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/consignee'
                  className='text-gray-400 hover:text-white'
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href='/consignee#about'
                  className='text-gray-400 hover:text-white'
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  href='/consignee/order'
                  className='text-gray-400 hover:text-white'
                >
                  Đặt hàng
                </Link>
              </li>
              <li>
                <Link
                  href='/consignee/my-orders'
                  className='text-gray-400 hover:text-white'
                >
                  Đơn hàng của tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className='mb-4 text-lg font-semibold'>Dịch vụ</h3>
            <ul className='space-y-2'>
              <li>
                <Link href='#' className='text-gray-400 hover:text-white'>
                  Truy xuất nguồn gốc
                </Link>
              </li>
              <li>
                <Link href='#' className='text-gray-400 hover:text-white'>
                  Giám sát IoT
                </Link>
              </li>
              <li>
                <Link href='#' className='text-gray-400 hover:text-white'>
                  Blockchain Verify
                </Link>
              </li>
              <li>
                <Link href='#' className='text-gray-400 hover:text-white'>
                  Vận chuyển lạnh
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className='mb-4 text-lg font-semibold'>Pháp lý</h3>
            <ul className='space-y-2'>
              <li>
                <Link href='#' className='text-gray-400 hover:text-white'>
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href='#' className='text-gray-400 hover:text-white'>
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href='#' className='text-gray-400 hover:text-white'>
                  Chính sách cookie
                </Link>
              </li>
              <li>
                <Link href='#' className='text-gray-400 hover:text-white'>
                  Hỗ trợ khách hàng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-12 border-t border-gray-800 pt-8 text-center'>
          <p className='text-gray-400'>
            © 2024 AgriChain. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
