'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Metadata } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { RoleEnum } from '@/constants/enums';
import { useRouter } from 'next/navigation';
import { Droplets, Leaf } from 'lucide-react';
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';

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
  const { login, logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await login({ email, password });
      let dashboardPath = '/dashboard/overview';
      if (res && res.user) {
        if (
          res.user.role.name === RoleEnum.CONSIGNEE ||
          res.user.role.name === RoleEnum.SUPPLIER
        ) {
          await logout();
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
      {/* Left Side */}
      <div className='relative h-full w-full overflow-hidden'>
        <img
          src='/images/background.jpg'
          alt='Fresh agricultural products'
          className='absolute inset-0 h-full w-full object-cover'
        />
        <div className='absolute inset-0 bg-black/50' />

        <div className='absolute top-0 right-1/4 h-96 w-96 rounded-full bg-gradient-to-b from-white/10 to-transparent blur-3xl' />

        <div className='absolute inset-0 flex flex-col items-start justify-center px-12 py-16 text-white'>
          <h1 className='mb-6 max-w-4xl bg-gradient-to-r from-green-300 via-lime-200 to-green-400 bg-clip-text text-6xl leading-tight font-extrabold text-transparent drop-shadow-[0_4px_20px_rgba(0,255,150,0.4)]'>
            Kết nối nông sản tươi Mang chất lượng đến từng gia đình
          </h1>

          <p className='mb-8 max-w-2xl text-xl leading-relaxed text-gray-200'>
            Hệ thống quản lý thu hoạch, vận chuyển và phân phối nông sản theo
            thời gian thực.
          </p>

          <div className='space-y-4'>
            <div className='flex items-center gap-3 text-lg'>
              <span className='font-bold text-green-400'>✔</span>
              <span>Nguồn gốc minh bạch</span>
            </div>
            <div className='flex items-center gap-3 text-lg'>
              <span className='font-bold text-green-400'>✔</span>
              <span>Thu hoạch trong ngày</span>
            </div>
            <div className='flex items-center gap-3 text-lg'>
              <span className='font-bold text-green-400'>✔</span>
              <span>Giao hàng chuẩn lạnh</span>
            </div>
          </div>
        </div>
      </div>
      {/* Right Side */}
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='absolute top-4 right-4 z-10 h-16 w-16'>
          <ModeToggle />
        </div>
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
