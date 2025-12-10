'use client';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';
import { ThemeSelector } from '../theme-selector';
import { Separator } from '../ui/separator';
import { SidebarTrigger } from '../ui/sidebar';
import { ModeToggle } from './ThemeToggle/theme-toggle';
import CtaNotify from './cta-notify';
import { UserNav } from './user-nav';

export default function Header() {
  const [locale, setLocale] = useState<string>('');
  const router = useRouter();

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

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    // Set cookie with proper path and expiration
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    // Force a full page reload to ensure server picks up the new locale
    router.refresh();
  };
  return (
    <header className='flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Breadcrumbs />
      </div>
      <div className='flex items-center gap-2 px-4'>
        <CtaNotify />
        <div className='hidden md:flex'>
          <SearchInput />
        </div>
        <UserNav />
        <ModeToggle />
        <ThemeSelector />
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
    </header>
  );
}
