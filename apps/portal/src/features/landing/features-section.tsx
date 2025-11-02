'use client';

import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Wheat, ShoppingBasket, Settings } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export function FeaturesSection() {
  const t = useTranslations('Landing.features');

  const features = [
    {
      icon: Wheat,
      titleKey: 'supplier.title',
      descriptionKey: 'supplier.description',
      color: 'from-[#2E7D32] to-[#81C784]',
      delay: 0.1
    },
    {
      icon: ShoppingBasket,
      titleKey: 'consignee.title',
      descriptionKey: 'consignee.description',
      color: 'from-[#F9A825] to-[#FBC02D]',
      delay: 0.2
    },
    {
      icon: Settings,
      titleKey: 'iotBlockchain.title',
      descriptionKey: 'iotBlockchain.description',
      color: 'from-[#1976D2] to-[#42A5F5]',
      delay: 0.3
    }
  ];
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id='features' className='bg-background py-20 lg:py-32'>
      <div className='container mx-auto max-w-7xl px-6 lg:px-20'>
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className='mb-16 text-center'
        >
          <h2 className='text-foreground mb-4 text-3xl font-bold lg:text-4xl'>
            {t('title')}
          </h2>
          <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
            {t('description')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: feature.delay }}
            >
              <Card className='group hover:border-agri-primary h-full border-2 transition-all duration-300 hover:shadow-xl'>
                <CardHeader>
                  <div
                    className={`h-16 w-16 bg-gradient-to-br ${feature.color} mb-4 flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110`}
                  >
                    <feature.icon className='h-8 w-8 text-white' />
                  </div>
                  <CardTitle className='text-foreground group-hover:text-agri-primary text-2xl font-bold transition-colors'>
                    {t(feature.titleKey)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-muted-foreground text-base leading-relaxed'>
                    {t(feature.descriptionKey)}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Features List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className='mt-16 grid gap-6 md:grid-cols-2'
        >
          <div className='rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-8 dark:from-green-950 dark:to-green-900'>
            <h3 className='text-agri-primary-dark dark:text-agri-primary-light mb-4 text-xl font-bold'>
              {t('forSuppliers.title')}
            </h3>
            <ul className='text-agri-primary space-y-3'>
              <li className='flex items-start'>
                <span className='mr-2'>✓</span>
                <span>{t('forSuppliers.items.batch')}</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>✓</span>
                <span>{t('forSuppliers.items.qr')}</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>✓</span>
                <span>{t('forSuppliers.items.pickup')}</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>✓</span>
                <span>{t('forSuppliers.items.blockchain')}</span>
              </li>
            </ul>
          </div>

          <div className='rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 dark:from-yellow-950 dark:to-yellow-900'>
            <h3 className='mb-4 text-xl font-bold text-yellow-800 dark:text-yellow-200'>
              {t('forConsignees.title')}
            </h3>
            <ul className='text-agri-secondary space-y-3'>
              <li className='flex items-start'>
                <span className='mr-2'>✓</span>
                <span>{t('forConsignees.items.view')}</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>✓</span>
                <span>{t('forConsignees.items.track')}</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>✓</span>
                <span>{t('forConsignees.items.scan')}</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>✓</span>
                <span>{t('forConsignees.items.monitoring')}</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
