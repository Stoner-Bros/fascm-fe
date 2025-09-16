'use client';

import { FC } from 'react';
import Link from 'next/link';

const Footer: FC = () => {
  return (
    <footer className='bg-gray-800 text-white'>
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          <div>
            <h3 className='mb-4 text-lg font-semibold'>About FASCM</h3>
            <p className='text-gray-300'>
              Your trusted facility service management platform for efficient
              and reliable solutions.
            </p>
          </div>
          <div>
            <h3 className='mb-4 text-lg font-semibold'>Quick Links</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/dashboard'
                  className='text-gray-300 hover:text-white'
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href='/tracking'
                  className='text-gray-300 hover:text-white'
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='mb-4 text-lg font-semibold'>Contact</h3>
            <ul className='space-y-2 text-gray-300'>
              <li>Email: support@fascm.com</li>
              <li>Phone: (123) 456-7890</li>
              <li>Address: 123 Business Street, City, Country</li>
            </ul>
          </div>
        </div>
        <div className='mt-8 border-t border-gray-700 pt-4 text-center text-gray-300'>
          <p>&copy; {new Date().getFullYear()} FASCM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
