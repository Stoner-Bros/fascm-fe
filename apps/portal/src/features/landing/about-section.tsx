'use client';

import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Shield, Cpu, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function AboutSection() {
  const t = useTranslations('Landing.about');
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <section id='about' className='bg-agri-background py-20 lg:py-32'>
      <div className='container mx-auto max-w-7xl px-6 lg:px-20'>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className='grid items-center gap-12 lg:grid-cols-2 lg:gap-16'
        >
          {/* Left side - Images/Icons */}
          <div className='relative'>
            <div className='grid grid-cols-2 gap-4'>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className='from-agri-primary to-agri-primary-light flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br p-8 text-white shadow-lg transition-shadow hover:shadow-xl'
              >
                <Shield className='mb-4 h-16 w-16' />
                <h3 className='text-center text-xl font-bold'>
                  {t('cards.blockchain')}
                </h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className='mt-8 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#F9A825] to-[#FBC02D] p-8 text-white shadow-lg transition-shadow hover:shadow-xl'
              >
                <Cpu className='mb-4 h-16 w-16' />
                <h3 className='text-center text-xl font-bold'>
                  {t('cards.iot')}
                </h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className='col-span-2 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#1976D2] to-[#42A5F5] p-8 text-white shadow-lg transition-shadow hover:shadow-xl'
              >
                <Package className='mb-4 h-16 w-16' />
                <h3 className='text-center text-xl font-bold'>
                  {t('cards.supplyChain')}
                </h3>
              </motion.div>
            </div>
          </div>

          {/* Right side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className='text-agri-text mb-6 text-3xl leading-tight font-bold lg:text-4xl'>
              {t('title')}{' '}
              <span className='text-agri-primary'>{t('titleHighlight')}</span>
            </h2>
            <div className='text-agri-text space-y-6 text-lg leading-relaxed'>
              <p>
                {t('description1')} <strong>{t('farmers')}</strong>,{' '}
                <strong>{t('distributors')}</strong>, {t('and')}{' '}
                <strong>{t('retailers')}</strong> {t('description2')}{' '}
                <span className='text-agri-primary font-semibold'>
                  {t('blockchain')}
                </span>{' '}
                {t('and')}{' '}
                <span className='text-agri-secondary font-semibold'>
                  {t('iotTechnologies')}
                </span>
                , {t('description3')}
              </p>
              <p>{t('description4')}</p>
              <div className='grid grid-cols-3 gap-4 pt-6'>
                <div className='text-center'>
                  <div className='text-agri-primary mb-2 text-4xl font-bold'>
                    100%
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    {t('stats.traceability')}
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-agri-primary mb-2 text-4xl font-bold'>
                    24/7
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    {t('stats.monitoring')}
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-agri-primary mb-2 text-4xl font-bold whitespace-nowrap'>
                    Real-time
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    {t('stats.updates')}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
