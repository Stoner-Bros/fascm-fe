'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';
import { cn } from '@/lib/utils';
import { Leaf, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [locale, setLocale] = useState<string>('');
  const router = useRouter();

  const t = useTranslations('Landing.header');

  useEffect(() => {
    const cookieLocale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1];
    if (cookieLocale) {
      setLocale(cookieLocale);
    } else {
      const browserLocale = navigator.language.slice(0, 2);
      const defaultLocale = ['en', 'vi'].includes(browserLocale)
        ? browserLocale
        : 'en';
      setLocale(defaultLocale);
      document.cookie = `NEXT_LOCALE=${defaultLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    // Set cookie with proper path and expiration
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    // Force a full page reload to ensure server picks up the new locale
    router.refresh();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/95 dark:bg-background/90 shadow-md backdrop-blur-sm'
          : 'bg-background/90 backdrop-blur-sm'
      )}
    >
      <nav className='container mx-auto max-w-7xl px-6 lg:px-20'>
        <div className='flex h-20 items-center justify-between'>
          {/* Logo */}
          <Link
            href='/'
            className='text-agri-primary z-50 flex items-center gap-2 text-2xl font-bold'
          >
            <Leaf className='h-8 w-8' />
            <span>FASCM</span>
          </Link>

          {/* Desktop Navigation Menu */}
          <div className='hidden items-center gap-6 md:flex'>
            <Link
              href='#home'
              className='text-foreground hover:text-agri-primary font-medium transition-colors'
            >
              {t('home')}
            </Link>
            <Link
              href='#about'
              className='text-foreground hover:text-agri-primary font-medium transition-colors'
            >
              {t('about')}
            </Link>
            <Link
              href='#features'
              className='text-foreground hover:text-agri-primary font-medium transition-colors'
            >
              {t('features')}
            </Link>
            <Link href='/auth/sign-in'>
              <Button
                variant='outline'
                className='border-agri-primary text-agri-primary hover:bg-agri-primary hover:text-white'
              >
                {t('login')}
              </Button>
            </Link>

            {/* Theme Toggle */}
            <ModeToggle />

            {/* Language Selector */}
            <div className='border-border flex items-center gap-2 border-l pl-4'>
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
          </div>

          {/* Mobile Menu Button */}
          <div className='flex items-center gap-2 md:hidden'>
            <ModeToggle />
            <button
              className='text-agri-primary z-50'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='border-border bg-background absolute top-20 right-0 left-0 border-t shadow-lg md:hidden'>
            <div className='flex flex-col space-y-4 p-6'>
              <Link
                href='#home'
                className='text-foreground hover:text-agri-primary py-2 font-medium transition-colors'
                onClick={closeMobileMenu}
              >
                {t('home')}
              </Link>
              <Link
                href='#about'
                className='text-foreground hover:text-agri-primary py-2 font-medium transition-colors'
                onClick={closeMobileMenu}
              >
                {t('about')}
              </Link>
              <Link
                href='#features'
                className='text-foreground hover:text-agri-primary py-2 font-medium transition-colors'
                onClick={closeMobileMenu}
              >
                {t('features')}
              </Link>
              <Link
                href='#tracking'
                className='text-foreground hover:text-agri-primary py-2 font-medium transition-colors'
                onClick={closeMobileMenu}
              >
                {t('tracking')}
              </Link>
              <Link href='/auth/sign-in' onClick={closeMobileMenu}>
                <Button
                  variant='outline'
                  className='border-agri-primary text-agri-primary hover:bg-agri-primary w-full hover:text-white'
                >
                  {t('login')}
                </Button>
              </Link>

              {/* Mobile Language Selector */}
              <div className='border-border flex items-center justify-center gap-4 border-t pt-4'>
                <button
                  onClick={() => handleLocaleChange('en')}
                  className={cn(
                    'text-sm font-medium transition-colors',
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
                    'text-sm font-medium transition-colors',
                    locale === 'vi'
                      ? 'text-agri-primary'
                      : 'text-muted-foreground hover:text-agri-primary'
                  )}
                >
                  VN
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
