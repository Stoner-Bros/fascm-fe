'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Metadata } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { login } from '@/services/auth.service';
import { RoleEnum } from '@/constants/enums';
import { useRouter } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
  const t = useTranslations('Auth.signIn');
  const router = useRouter();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await login({ email, password });
      let dashboardPath = '/dashboard';
      if (res && res.user) {
        if (res.user.role.name === RoleEnum.CONSIGNEE) {
          dashboardPath =
            process.env.NEXT_PUBLIC_CONSIGNEE_AFTER_SIGN_IN_URL ||
            '/consignee/dashboard';
        } else if (res.user.role.name === RoleEnum.SUPPLIER) {
          dashboardPath =
            process.env.NEXT_PUBLIC_SUPPLIER_AFTER_SIGN_IN_URL ||
            '/supplier/dashboard';
        } else {
          throw new Error('You are not allowed to access this portal.');
        }
      }
      router.push(dashboardPath); // Redirect to dashboard after successful login
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-zinc-900' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2 h-6 w-6'
          >
            <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
          </svg>
          Logo
        </div>
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;This starter template has saved me countless hours of work
              and helped me deliver projects to my clients faster than ever
              before.&rdquo;
            </p>
            <footer className='text-sm'>Random Dude</footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <div className='w-full space-y-4'>
            <div className='flex flex-col space-y-2 text-center'>
              <h1 className='text-2xl font-semibold tracking-tight'>
                {t('title')}
              </h1>
              <p className='text-muted-foreground text-sm'>
                {t('description')}
              </p>
            </div>
            <div className='grid gap-6'>
              {error && (
                <div className='rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
                  {error}
                </div>
              )}
              <form className='grid gap-4' onSubmit={handleSubmit}>
                <div className='grid gap-2'>
                  <Label htmlFor='email'>{t('email')}</Label>
                  <Input
                    id='email'
                    placeholder={t('emailPlaceholder')}
                    type='email'
                    autoCapitalize='none'
                    autoComplete='email'
                    autoCorrect='off'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='password'>{t('password')}</Label>
                  <Input
                    id='password'
                    placeholder={t('passwordPlaceholder')}
                    type='password'
                    autoCapitalize='none'
                    autoComplete='current-password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading ? t('signingIn') : t('signInButton')}
                </Button>
              </form>
              {/* <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background px-2 text-muted-foreground'>
                    Hoặc đăng nhập với
                  </span>
                </div>
              </div>
              <Button variant='outline' type='button' className='w-full'>
                <GitHubLogoIcon className='mr-2 h-4 w-4' />
                GitHub
              </Button> */}
            </div>
          </div>

          <p className='text-muted-foreground px-8 text-center text-sm'>
            {t('agreement')}{' '}
            <Link
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              {t('termsOfService')}
            </Link>{' '}
            {t('and')}{' '}
            <Link
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              {t('privacyPolicy')}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
