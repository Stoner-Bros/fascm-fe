'use client';

import Link from 'next/link';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function LandingFooter() {
  const t = useTranslations('Landing.footer');
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
              {t('description')}
            </p>
            <p className='text-sm text-gray-400'>
              © {currentYear} {t('copyright')}
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className='mb-4 text-xl font-bold'>{t('quickLinks')}</h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  href='#home'
                  className='flex items-center text-gray-300 transition-colors hover:text-white'
                >
                  <span className='mr-2'>→</span> {t('links.home')}
                </Link>
              </li>
              <li>
                <Link
                  href='#about'
                  className='flex items-center text-gray-300 transition-colors hover:text-white'
                >
                  <span className='mr-2'>→</span> {t('links.about')}
                </Link>
              </li>
              <li>
                <Link
                  href='#features'
                  className='flex items-center text-gray-300 transition-colors hover:text-white'
                >
                  <span className='mr-2'>→</span> {t('links.features')}
                </Link>
              </li>
              <li>
                <Link
                  href='/contact'
                  className='flex items-center text-gray-300 transition-colors hover:text-white'
                >
                  <span className='mr-2'>→</span> {t('links.contact')}
                </Link>
              </li>
              <li>
                <Link
                  href='/auth/sign-in'
                  className='flex items-center text-gray-300 transition-colors hover:text-white'
                >
                  <span className='mr-2'>→</span> {t('links.login')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h3 className='mb-4 text-xl font-bold'>{t('contact.title')}</h3>
            <ul className='space-y-4'>
              <li className='flex items-start gap-3'>
                <Mail className='text-agri-primary-light mt-0.5 h-5 w-5' />
                <div>
                  <p className='text-gray-300'>fascm@fpt.edu.vn</p>
                  <p className='text-sm text-gray-400'>
                    {t('contact.emailSupport')}
                  </p>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <Phone className='text-agri-primary-light mt-0.5 h-5 w-5' />
                <div>
                  <p className='text-gray-300'>{t('contact.phone')}</p>
                  <p className='text-sm text-gray-400'>{t('contact.hours')}</p>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <MapPin className='text-agri-primary-light mt-0.5 h-5 w-5' />
                <div>
                  <p className='text-gray-300'>{t('contact.university')}</p>
                  <p className='text-sm text-gray-400'>
                    {t('contact.project')}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-agri-primary border-t pt-8'>
          <div className='text-center text-sm text-gray-400'>
            <p>{t('developed')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
