'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { confirmEmail } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const t = useTranslations('Auth.confirmEmail');

  useEffect(() => {
    const confirmEmailHash = async () => {
      try {
        const hash = searchParams.get('hash');

        if (!hash) {
          setStatus('error');
          setErrorMessage(t('error.noHash'));
          return;
        }

        // Gọi API confirm email với hash
        await confirmEmail({ hash });

        setStatus('success');

        // Chuyển hướng về trang login sau 3 giây
        setTimeout(() => {
          router.push('/dashboard/profile');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error?.message || t('error.title'));
      }
    };

    confirmEmailHash();
  }, [searchParams, router]);

  const handleRetryLogin = () => {
    router.push('/auth/sign-in');
  };

  const handleRetryRegister = () => {
    router.push('/');
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            {t('title')}
          </h2>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md'>
          {status === 'loading' && (
            <div className='text-center'>
              <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600'></div>
              <p className='mt-4 text-gray-600'>{t('verifying')}</p>
            </div>
          )}

          {status === 'success' && (
            <div className='text-center'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
                <svg
                  className='h-6 w-6 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h3 className='mt-4 text-lg font-medium text-gray-900'>
                {t('success.title')}
              </h3>
              <p className='mt-2 text-gray-600'>{t('success.description')}</p>
              <button
                onClick={handleRetryLogin}
                className='mt-4 flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none'
              >
                {t('success.loginButton')}
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className='text-center'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
                <svg
                  className='h-6 w-6 text-red-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </div>
              <h3 className='mt-4 text-lg font-medium text-gray-900'>
                {t('error.title')}
              </h3>
              <p className='mt-2 text-gray-600'>{errorMessage}</p>
              <div className='mt-4 space-y-2'>
                <button
                  onClick={handleRetryRegister}
                  className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none'
                >
                  {t('error.homeButton')}
                </button>
                <button
                  onClick={handleRetryLogin}
                  className='flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none'
                >
                  {t('error.loginButton')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
