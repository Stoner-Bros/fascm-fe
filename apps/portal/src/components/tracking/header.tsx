'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { IconTruck, IconMenu2, IconX } from '@tabler/icons-react';

const Header: FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className='sticky top-0 z-50 bg-white shadow-md'>
      <div className='container mx-auto px-4 py-4'>
        <nav className='flex items-center justify-between'>
          <Link href='/' className='flex items-center space-x-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white'>
              <IconTruck size={24} />
            </div>
            <span className='text-xl font-bold text-gray-800'>FASCM</span>
          </Link>

          {/* Desktop navigation */}
          <div className='hidden items-center space-x-6 md:flex'>
            <Link
              href='/dashboard'
              className='group relative text-gray-600 transition-colors hover:text-blue-600'
            >
              <span>Dashboard</span>
              <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full'></span>
            </Link>
            <Link
              href='/tracking'
              className='group relative font-medium text-blue-600'
            >
              <span>Track Order</span>
              <span className='absolute bottom-0 left-0 h-0.5 w-full bg-blue-600'></span>
            </Link>
            <Link
              href='/contact'
              className='group relative text-gray-600 transition-colors hover:text-blue-600'
            >
              <span>Contact</span>
              <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full'></span>
            </Link>
            <Link
              href='/login'
              className='rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-sm font-medium text-white transition-all hover:shadow-lg'
            >
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className='text-gray-600 md:hidden'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className='mt-4 space-y-4 border-t border-gray-200 pt-4 md:hidden'>
            <Link
              href='/dashboard'
              className='block py-2 text-gray-600 hover:text-blue-600'
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href='/tracking'
              className='block py-2 font-medium text-blue-600'
              onClick={() => setMobileMenuOpen(false)}
            >
              Track Order
            </Link>
            <Link
              href='/contact'
              className='block py-2 text-gray-600 hover:text-blue-600'
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href='/login'
              className='block rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-center text-white'
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
