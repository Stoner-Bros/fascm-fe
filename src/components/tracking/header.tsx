'use client';

import { FC } from 'react';
import Link from 'next/link';

const Header: FC = () => {
  return (
    <header className='bg-white shadow-md'>
      <div className='container mx-auto px-4 py-4'>
        <nav className='flex items-center justify-between'>
          <Link href='/' className='text-xl font-bold text-gray-800'>
            FASCM
          </Link>
          <div className='flex items-center space-x-6'>
            <Link
              href='/dashboard'
              className='text-gray-600 hover:text-gray-900'
            >
              Dashboard
            </Link>
            <Link
              href='/tracking'
              className='text-gray-600 hover:text-gray-900'
            >
              Track Order
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
