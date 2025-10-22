'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';
import { cn } from '@/lib/utils';
import { Leaf, Menu, X } from 'lucide-react';

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              Home
            </Link>
            <Link
              href='#about'
              className='text-foreground hover:text-agri-primary font-medium transition-colors'
            >
              About
            </Link>
            <Link
              href='#features'
              className='text-foreground hover:text-agri-primary font-medium transition-colors'
            >
              Features
            </Link>
            <Link
              href='#tracking'
              className='text-foreground hover:text-agri-primary font-medium transition-colors'
            >
              Tracking
            </Link>
            <Link href='/auth/sign-in'>
              <Button
                variant='outline'
                className='border-agri-primary text-agri-primary hover:bg-agri-primary hover:text-white'
              >
                Login / Register
              </Button>
            </Link>

            {/* Theme Toggle */}
            <ModeToggle />

            {/* Language Selector */}
            <div className='border-border flex items-center gap-2 border-l pl-4'>
              <button className='text-agri-primary text-sm font-medium'>
                EN
              </button>
              <span className='text-muted-foreground'>|</span>
              <button className='text-muted-foreground hover:text-agri-primary text-sm font-medium transition-colors'>
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
                Home
              </Link>
              <Link
                href='#about'
                className='text-foreground hover:text-agri-primary py-2 font-medium transition-colors'
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link
                href='#features'
                className='text-foreground hover:text-agri-primary py-2 font-medium transition-colors'
                onClick={closeMobileMenu}
              >
                Features
              </Link>
              <Link
                href='#tracking'
                className='text-foreground hover:text-agri-primary py-2 font-medium transition-colors'
                onClick={closeMobileMenu}
              >
                Tracking
              </Link>
              <Link href='/auth/sign-in' onClick={closeMobileMenu}>
                <Button
                  variant='outline'
                  className='border-agri-primary text-agri-primary hover:bg-agri-primary w-full hover:text-white'
                >
                  Login / Register
                </Button>
              </Link>

              {/* Mobile Language Selector */}
              <div className='border-border flex items-center justify-center gap-4 border-t pt-4'>
                <button className='text-agri-primary text-sm font-medium'>
                  EN
                </button>
                <span className='text-muted-foreground'>|</span>
                <button className='text-muted-foreground hover:text-agri-primary text-sm font-medium transition-colors'>
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
