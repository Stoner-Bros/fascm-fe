import Link from 'next/link';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-agri-primary-dark text-white dark:bg-slate-950'>
      <div className='container mx-auto max-w-7xl px-6 py-12 lg:px-20'>
        <div className='mb-8 grid gap-12 md:grid-cols-3'>
          {/* About Column */}
          <div>
            <div className='mb-4 flex items-center gap-2'>
              <Leaf className='h-8 w-8' />
              <span className='text-2xl font-bold'>FASCM</span>
            </div>
            <p className='mb-4 leading-relaxed text-gray-300'>
              Modernizing Vietnam&apos;s fresh produce supply chain through
              Blockchain and IoT technologies for complete transparency and
              traceability.
            </p>
            <p className='text-sm text-gray-400'>
              © {currentYear} FASCM Project. All rights reserved.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className='mb-4 text-xl font-bold'>Quick Links</h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  href='#home'
                  className='flex items-center text-gray-300 transition-colors hover:text-white'
                >
                  <span className='mr-2'>→</span> Home
                </Link>
              </li>
              <li>
                <Link
                  href='#about'
                  className='flex items-center text-gray-300 transition-colors hover:text-white'
                >
                  <span className='mr-2'>→</span> About
                </Link>
              </li>
              <li>
                <Link
                  href='#features'
                  className='flex items-center text-gray-300 transition-colors hover:text-white'
                >
                  <span className='mr-2'>→</span> Features
                </Link>
              </li>
              <li>
                <Link
                  href='/contact'
                  className='flex items-center text-gray-300 transition-colors hover:text-white'
                >
                  <span className='mr-2'>→</span> Contact
                </Link>
              </li>
              <li>
                <Link
                  href='/auth/sign-in'
                  className='flex items-center text-gray-300 transition-colors hover:text-white'
                >
                  <span className='mr-2'>→</span> Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h3 className='mb-4 text-xl font-bold'>Contact Information</h3>
            <ul className='space-y-4'>
              <li className='flex items-start gap-3'>
                <Mail className='text-agri-primary-light mt-0.5 h-5 w-5' />
                <div>
                  <p className='text-gray-300'>fascm@fpt.edu.vn</p>
                  <p className='text-sm text-gray-400'>support@fascm.vn</p>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <Phone className='text-agri-primary-light mt-0.5 h-5 w-5' />
                <div>
                  <p className='text-gray-300'>(+84) 123-456-789</p>
                  <p className='text-sm text-gray-400'>Mon-Fri, 8AM-5PM</p>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <MapPin className='text-agri-primary-light mt-0.5 h-5 w-5' />
                <div>
                  <p className='text-gray-300'>FPT University</p>
                  <p className='text-sm text-gray-400'>
                    SEP490 Capstone Project
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-agri-primary border-t pt-8'>
          <div className='text-center text-sm text-gray-400'>
            <p>
              Developed with 💚 by FPT University Students | Capstone Project
              SEP490
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
