'use client';

import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RoleEnum } from '@/constants/enums';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const metadata: Metadata = {
  title: 'FASCM | Đăng nhập',
  description: 'Trang đăng nhập hệ thống FASCM'
};

export default function SignInViewPage() {
  const t = useTranslations('Auth.signIn');
  const router = useRouter();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, logout } = useAuth();

  const [locale, setLocale] = useState<string>('');

  useEffect(() => {
    const cookieLocale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1];
    setLocale(cookieLocale || 'en');
  }, []);

  const handleLocaleChange = (locale: string) => {
    setLocale(locale);
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    router.refresh();
  };

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
      console.log(err);
      setError('Tài khoản hoặc mật khẩu không chính xác.');
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
          alt={t('promotional.heading')}
          className='absolute inset-0 h-full w-full object-cover'
        />
        <div className='absolute inset-0 bg-black/50' />

        <div className='absolute top-0 right-1/4 h-96 w-96 rounded-full bg-gradient-to-b from-white/10 to-transparent blur-3xl' />

        <div className='absolute inset-0 flex flex-col items-start justify-center px-12 py-16 text-white'>
          <h1 className='mb-6 max-w-4xl bg-gradient-to-r from-green-300 via-lime-200 to-green-400 bg-clip-text text-6xl leading-tight font-extrabold text-transparent drop-shadow-[0_4px_20px_rgba(0,255,150,0.4)]'>
            {t('promotional.heading')}
          </h1>

          <p className='mb-8 max-w-2xl text-xl leading-relaxed text-gray-200'>
            {t('promotional.description')}
          </p>

          <div className='space-y-4'>
            <div className='flex items-center gap-3 text-lg'>
              <span className='font-bold text-green-400'>✔</span>
              <span>{t('promotional.feature1')}</span>
            </div>
            <div className='flex items-center gap-3 text-lg'>
              <span className='font-bold text-green-400'>✔</span>
              <span>{t('promotional.feature2')}</span>
            </div>
            <div className='flex items-center gap-3 text-lg'>
              <span className='font-bold text-green-400'>✔</span>
              <span>{t('promotional.feature3')}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Right Side */}
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='absolute top-4 right-4 z-10 flex items-center gap-4'>
          {/* Language Selector */}
          <div className='flex items-center gap-2'>
            <button
              onClick={() => handleLocaleChange('en')}
              className={cn(
                'cursor-pointer text-sm font-medium transition-colors',
                locale === 'en'
                  ? 'text-agri-primary'
                  : 'text-muted-foreground hover:text-agri-primary'
              )}
            >
              EN
            </button>
            <span className='text-muted-foreground'>|</span>
            <button
              onClick={() => handleLocaleChange('vi')}
              className={cn(
                'cursor-pointer text-sm font-medium transition-colors',
                locale === 'vi'
                  ? 'text-agri-primary'
                  : 'text-muted-foreground hover:text-agri-primary'
              )}
            >
              VN
            </button>
          </div>
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
