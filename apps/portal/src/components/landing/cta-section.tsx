'use client';

import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Leaf, ShoppingCart } from 'lucide-react';

export function CTASection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <section className='bg-gradient-to-br from-green-50 via-green-100 to-green-200 py-20 lg:py-32 dark:from-green-950 dark:via-green-900 dark:to-green-800'>
      <div className='container mx-auto max-w-7xl px-6 lg:px-20'>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className='text-center'
        >
          <h2 className='text-agri-primary-dark dark:text-agri-primary-light mb-6 text-3xl font-bold lg:text-5xl'>
            Ready to bring transparency to your supply chain?
          </h2>
          <p className='text-agri-primary mx-auto mb-12 max-w-3xl text-lg lg:text-xl'>
            Join hundreds of farmers and retailers already using FASCM to ensure
            quality, traceability, and trust in every transaction.
          </p>

          <div className='flex flex-col items-center justify-center gap-6 sm:flex-row'>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href='/auth/sign-up'>
                <Button
                  size='lg'
                  className='group bg-agri-primary hover:bg-agri-primary-dark px-10 py-7 text-lg font-semibold text-white shadow-xl transition-all hover:shadow-2xl'
                >
                  <Leaf className='mr-2 h-6 w-6' />
                  Register as Supplier
                  <ArrowRight className='ml-2 h-6 w-6 transition-transform group-hover:translate-x-1' />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href='/auth/sign-up'>
                <Button
                  size='lg'
                  variant='outline'
                  className='group border-agri-primary bg-background text-agri-primary hover:bg-agri-primary border-3 px-10 py-7 text-lg font-semibold shadow-xl transition-all hover:text-white hover:shadow-2xl'
                >
                  <ShoppingCart className='mr-2 h-6 w-6' />
                  Register as Consignee
                  <ArrowRight className='ml-2 h-6 w-6 transition-transform group-hover:translate-x-1' />
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className='text-agri-primary mt-12'
          >
            <p className='text-sm'>
              Already have an account?{' '}
              <Link
                href='/auth/sign-in'
                className='hover:text-agri-primary-dark font-bold underline'
              >
                Sign in here
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
