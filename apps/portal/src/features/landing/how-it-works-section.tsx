'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  IconBell,
  IconCircleCheck,
  IconCreditCard,
  IconCurrencyDollar,
  IconPackage,
  IconSearch,
  IconShoppingCart,
  IconTruck,
  IconUserCheck,
  IconWheat,
  IconZoomCheck
} from '@tabler/icons-react';
import {
  BellIcon,
  CircleCheckIcon,
  CreditCard,
  Handshake,
  PackageIcon,
  PackageSearch,
  ShieldCheck,
  ShoppingCart,
  TruckIcon,
  UserCheckIcon,
  Wheat
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface TimelineStep {
  id: number;
  titleKey: string;
  descriptionKey: string;
  icon: React.ElementType;
  icon2: React.ElementType;
  color: string;
}

export function HowItWorksSection() {
  const t = useTranslations('Landing.howItWorks');

  const consigneeSteps: TimelineStep[] = [
    {
      id: 1,
      titleKey: 'consignee.step1.title',
      descriptionKey: 'consignee.step1.description',
      icon: IconSearch,
      icon2: PackageSearch,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      titleKey: 'consignee.step2.title',
      descriptionKey: 'consignee.step2.description',
      icon: IconShoppingCart,
      icon2: ShoppingCart,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 3,
      titleKey: 'consignee.step3.title',
      descriptionKey: 'consignee.step3.description',
      icon: IconUserCheck,
      icon2: UserCheckIcon,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 4,
      titleKey: 'consignee.step4.title',
      descriptionKey: 'consignee.step4.description',
      icon: IconCreditCard,
      icon2: CreditCard,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 5,
      titleKey: 'consignee.step5.title',
      descriptionKey: 'consignee.step5.description',
      icon: IconPackage,
      icon2: PackageIcon,
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const supplierSteps: TimelineStep[] = [
    {
      id: 1,
      titleKey: 'supplier.step1.title',
      descriptionKey: 'supplier.step1.description',
      icon: IconBell,
      icon2: BellIcon,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      titleKey: 'supplier.step2.title',
      descriptionKey: 'supplier.step2.description',
      icon: IconCurrencyDollar,
      icon2: Handshake,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 3,
      titleKey: 'supplier.step3.title',
      descriptionKey: 'supplier.step3.description',
      icon: IconCircleCheck,
      icon2: CircleCheckIcon,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 4,
      titleKey: 'supplier.step4.title',
      descriptionKey: 'supplier.step4.description',
      icon: IconZoomCheck,
      icon2: ShieldCheck,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 5,
      titleKey: 'supplier.step5.title',
      descriptionKey: 'supplier.step5.description',
      icon: IconTruck,
      icon2: TruckIcon,
      color: 'from-pink-500 to-pink-600'
    }
  ];
  const [activeTab, setActiveTab] = useState<'consignee' | 'supplier'>(
    'consignee'
  );
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const currentSteps =
    activeTab === 'consignee' ? consigneeSteps : supplierSteps;

  return (
    <section className='bg-gradient-to-br from-gray-50 to-white py-20 lg:py-32 dark:from-gray-900 dark:to-gray-800'>
      <div className='container mx-auto max-w-7xl px-6 lg:px-20'>
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className='mb-16 text-center'
        >
          <h2 className='mb-4 text-3xl font-bold text-gray-900 lg:text-4xl dark:text-white'>
            {t('title')}
          </h2>
          <p className='mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300'>
            {t('description')}
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='mb-12 flex justify-center'
        >
          <div className='flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800'>
            <Button
              variant={activeTab === 'consignee' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('consignee')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
                activeTab === 'consignee'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <IconShoppingCart className='h-4 w-4' />
              {t('tabs.consignee')}
            </Button>
            <Button
              variant={activeTab === 'supplier' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('supplier')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
                activeTab === 'supplier'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <IconWheat className='h-4 w-4' />
              {t('tabs.supplier')}
            </Button>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className='relative'
        >
          {/* Desktop Timeline */}
          <div className='hidden lg:block'>
            <div className='relative'>
              {/* Timeline Line */}
              <div className='absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700' />

              {/* Timeline Steps */}
              <div className='space-y-16'>
                {currentSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className={`flex items-center ${
                      index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    {/* Content Card */}
                    <div className='w-5/12'>
                      <Card className='group border-2 border-gray-200 transition-all duration-300 hover:border-green-300 hover:shadow-lg dark:border-gray-700 dark:hover:border-green-600'>
                        <CardContent className='p-6'>
                          <div className='flex items-start gap-4'>
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg`}
                            >
                              <step.icon className='h-6 w-6 text-white' />
                            </div>
                            <div className='flex-1'>
                              <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
                                {t(step.titleKey)}
                              </h3>
                              <p className='text-gray-600 dark:text-gray-300'>
                                {t(step.descriptionKey)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Center Icon */}
                    <div className='relative z-20 flex w-2/12 justify-center'>
                      <div
                        className={`flex items-center justify-center rounded-xl bg-white`}
                      >
                        <step.icon2 className='h-20 w-15 text-black' />
                      </div>
                    </div>

                    {/* Empty Space */}
                    <div className='w-5/12' />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className='lg:hidden'>
            <div className='space-y-8'>
              {currentSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className='relative'
                >
                  <Card className='border-2 border-gray-200 transition-all duration-300 hover:border-green-300 hover:shadow-lg dark:border-gray-700 dark:hover:border-green-600'>
                    <CardContent className='p-6'>
                      <div className='flex items-start gap-4'>
                        <div className='flex flex-col items-center'>
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg`}
                          >
                            <step.icon className='h-6 w-6 text-white' />
                          </div>
                          <Badge variant='secondary' className='mt-2 text-xs'>
                            {t('stepLabel')} {step.id}
                          </Badge>
                        </div>
                        <div className='flex-1'>
                          <h3 className='mb-2 text-lg font-bold text-gray-900 dark:text-white'>
                            {t(step.titleKey)}
                          </h3>
                          <p className='text-gray-600 dark:text-gray-300'>
                            {t(step.descriptionKey)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Connecting Line for Mobile */}
                  {index < currentSteps.length - 1 && (
                    <div className='absolute top-full left-6 h-8 w-0.5 bg-gray-300 dark:bg-gray-600' />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className='mt-16 text-center'
        >
          <div className='rounded-2xl bg-gradient-to-r from-green-500 to-green-600 p-8 text-white'>
            <h3 className='mb-4 text-2xl font-bold'>{t('cta.title')}</h3>
            <p className='mb-6 text-green-100'>
              {activeTab === 'consignee'
                ? t('cta.descriptionConsignee')
                : t('cta.descriptionSupplier')}
            </p>
            <Button
              size='lg'
              variant='secondary'
              className='bg-white text-green-600 hover:bg-gray-100'
            >
              {activeTab === 'consignee' ? (
                <>
                  <ShoppingCart className='mr-2 h-5 w-5' />
                  {t('cta.buttonConsignee')}
                </>
              ) : (
                <>
                  <Wheat className='mr-2 h-5 w-5' />
                  {t('cta.buttonSupplier')}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
