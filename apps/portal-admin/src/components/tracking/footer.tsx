'use client';

import { FC } from 'react';
import Link from 'next/link';
import {
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconTruck,
  IconMail,
  IconPhone,
  IconMapPin
} from '@tabler/icons-react';

const Footer: FC = () => {
  return (
    <footer className='bg-gradient-to-r from-gray-900 to-gray-800 text-white'>
      <div className='container mx-auto px-4 py-12'>
        {/* Top section */}
        <div className='grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4'>
          <div>
            <div className='mb-6 flex items-center'>
              <div className='mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600'>
                <IconTruck size={24} />
              </div>
              <span className='text-2xl font-bold'>FASCM</span>
            </div>
            <p className='mb-6 text-gray-300'>
              Your trusted facility service management platform for efficient
              and reliable solutions. We provide top-notch tracking services for
              all your orders.
            </p>
            <div className='flex space-x-4'>
              <Link
                href='#'
                className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-blue-400 transition-colors hover:bg-blue-600 hover:text-white'
              >
                <IconBrandFacebook size={20} />
              </Link>
              <Link
                href='#'
                className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-blue-400 transition-colors hover:bg-blue-400 hover:text-white'
              >
                <IconBrandTwitter size={20} />
              </Link>
              <Link
                href='#'
                className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-blue-400 transition-colors hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:text-white'
              >
                <IconBrandInstagram size={20} />
              </Link>
              <Link
                href='#'
                className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-blue-400 transition-colors hover:bg-blue-700 hover:text-white'
              >
                <IconBrandLinkedin size={20} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className='mb-6 text-lg font-semibold'>Quick Links</h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  href='/dashboard'
                  className='group flex items-center text-gray-300 transition-colors hover:text-blue-400'
                >
                  <span className='mr-2 h-1 w-0 rounded-full bg-blue-400 transition-all duration-300 group-hover:w-3'></span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href='/tracking'
                  className='group flex items-center text-gray-300 transition-colors hover:text-blue-400'
                >
                  <span className='mr-2 h-1 w-3 rounded-full bg-blue-400'></span>
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  href='/services'
                  className='group flex items-center text-gray-300 transition-colors hover:text-blue-400'
                >
                  <span className='mr-2 h-1 w-0 rounded-full bg-blue-400 transition-all duration-300 group-hover:w-3'></span>
                  Our Services
                </Link>
              </li>
              <li>
                <Link
                  href='/about'
                  className='group flex items-center text-gray-300 transition-colors hover:text-blue-400'
                >
                  <span className='mr-2 h-1 w-0 rounded-full bg-blue-400 transition-all duration-300 group-hover:w-3'></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href='/contact'
                  className='group flex items-center text-gray-300 transition-colors hover:text-blue-400'
                >
                  <span className='mr-2 h-1 w-0 rounded-full bg-blue-400 transition-all duration-300 group-hover:w-3'></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-6 text-lg font-semibold'>Contact Us</h3>
            <ul className='space-y-4 text-gray-300'>
              <li className='flex items-start'>
                <IconMail
                  size={20}
                  className='mt-1 mr-3 flex-shrink-0 text-blue-400'
                />
                <span>support@fascm.com</span>
              </li>
              <li className='flex items-start'>
                <IconPhone
                  size={20}
                  className='mt-1 mr-3 flex-shrink-0 text-blue-400'
                />
                <span>(123) 456-7890</span>
              </li>
              <li className='flex items-start'>
                <IconMapPin
                  size={20}
                  className='mt-1 mr-3 flex-shrink-0 text-blue-400'
                />
                <span>123 Business Street, City, Country</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-6 text-lg font-semibold'>Newsletter</h3>
            <p className='mb-4 text-gray-300'>
              Subscribe to our newsletter for the latest updates and tracking
              features.
            </p>
            <form className='space-y-3'>
              <div>
                <input
                  type='email'
                  placeholder='Your email address'
                  className='w-full rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none'
                  required
                />
              </div>
              <button
                type='submit'
                className='w-full rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-medium text-white transition-all hover:shadow-lg'
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom section */}
        <div className='mt-12 border-t border-gray-700 pt-8 text-center text-gray-300'>
          <p>&copy; {new Date().getFullYear()} FASCM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
