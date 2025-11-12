'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';
import { UserNav } from './user-nav';
import { ThemeSelector } from '../theme-selector';
import { ModeToggle } from './ThemeToggle/theme-toggle';
import CtaGithub from './cta-github';
import { cn } from '@/lib/utils';

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
      setLocale(browserLocale);
      document.cookie = `NEXT_LOCALE=${browserLocale}`;
      router.refresh();
    }
  }, [router]);

  const handleLocaleChange = (locale: string) => {
    setLocale(locale);
    document.cookie = `NEXT_LOCALE=${locale}`;
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
        <CtaGithub />
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
