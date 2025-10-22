'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Leaf, Truck, ShoppingCart, Network } from 'lucide-react';

export function HeroSection() {
  return (
    <section
      id='home'
      className='relative flex min-h-screen items-center justify-center overflow-hidden'
      style={{
        backgroundImage: 'url(/images/banner.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay */}
      <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent' />

      <div className='relative z-10 container mx-auto max-w-7xl px-6 py-20 lg:px-20'>
        <div className='grid items-center gap-12 lg:grid-cols-2'>
          {/* Left side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className='text-white'
          >
            <h1 className='mb-6 text-4xl leading-tight font-bold lg:text-5xl xl:text-6xl'>
              Connecting Farmers and Retailers in a{' '}
              <span className='text-agri-primary-light'>
                Transparent Supply Chain
              </span>
            </h1>
            <p className='mb-8 text-lg leading-relaxed text-gray-200 lg:text-xl'>
              FASCM digitizes Vietnam&apos;s fresh produce ecosystem through{' '}
              <span className='text-agri-secondary font-semibold'>
                Blockchain
              </span>{' '}
              and <span className='text-agri-secondary font-semibold'>IoT</span>{' '}
              integration.
            </p>

            <div className='flex flex-col gap-4 sm:flex-row'>
              <Link href='/auth/sign-in'>
                <Button
                  size='lg'
                  className='bg-agri-primary hover:bg-agri-primary-dark px-8 py-6 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl'
                >
                  <Leaf className='mr-2 h-5 w-5' />
                  Sign In as Supplier
                </Button>
              </Link>
              <Link href='/auth/sign-in'>
                <Button
                  size='lg'
                  variant='outline'
                  className='hover:text-agri-primary border-2 border-white bg-transparent px-8 py-6 text-lg font-semibold text-white shadow-lg transition-all hover:bg-white hover:shadow-xl'
                >
                  <ShoppingCart className='mr-2 h-5 w-5' />
                  Sign In as Consignee
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right side - Animated Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='hidden items-center justify-center lg:flex'
          >
            <div className='relative h-[500px] w-full'>
              {/* Central Network Hub */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'
              >
                <div className='from-agri-primary to-agri-primary-light flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br shadow-2xl'>
                  <Network className='h-16 w-16 text-white' />
                </div>
              </motion.div>

              {/* Orbiting Icons */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className='absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 transform'
              >
                <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'>
                  <div className='bg-card flex h-20 w-20 items-center justify-center rounded-full shadow-xl'>
                    <Leaf className='text-agri-primary h-10 w-10' />
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className='absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 transform'
              >
                <div className='absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transform'>
                  <div className='bg-card flex h-20 w-20 items-center justify-center rounded-full shadow-xl'>
                    <Truck className='text-agri-secondary h-10 w-10' />
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                className='absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 transform'
              >
                <div className='absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 transform'>
                  <div className='bg-card flex h-20 w-20 items-center justify-center rounded-full shadow-xl'>
                    <ShoppingCart className='text-agri-primary h-10 w-10' />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className='absolute bottom-10 left-1/2 -translate-x-1/2 transform'
      >
        <div className='flex h-10 w-6 justify-center rounded-full border-2 border-white pt-2'>
          <div className='h-2 w-1.5 rounded-full bg-white' />
        </div>
      </motion.div>
    </section>
  );
}
