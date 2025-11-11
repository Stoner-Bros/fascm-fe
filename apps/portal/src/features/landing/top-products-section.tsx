'use client';

import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface Product {
  id: string;
  nameKey: string;
  price: string;
  minOrder: string;
  statusKey: string;
  descriptionKey: string;
  image: string;
}

const topProducts: Product[] = [
  {
    id: '1',
    nameKey: 'products.banana.name',
    price: '$3.00',
    minOrder: '1kg',
    statusKey: 'availableNow',
    descriptionKey: 'products.banana.description',
    image: '/api/placeholder/300/200'
  },
  {
    id: '2',
    nameKey: 'products.orange.name',
    price: 'POE',
    minOrder: '1tonne',
    statusKey: 'availableNow',
    descriptionKey: 'products.orange.description',
    image: '/api/placeholder/300/200'
  },
  {
    id: '3',
    nameKey: 'products.pineapple.name',
    price: 'POE',
    minOrder: '1tonne',
    statusKey: 'availableNow',
    descriptionKey: 'products.pineapple.description',
    image: '/api/placeholder/300/200'
  },
  {
    id: '4',
    nameKey: 'products.carrots.name',
    price: 'POE',
    minOrder: '1120kg',
    statusKey: 'availableNow',
    descriptionKey: 'products.carrots.description',
    image: '/api/placeholder/300/200'
  },
  {
    id: '5',
    nameKey: 'products.apple.name',
    price: 'POE',
    minOrder: '1120kg',
    statusKey: 'availableNow',
    descriptionKey: 'products.apple.description',
    image: '/api/placeholder/300/200'
  }
];

export function TopProductsSection() {
  const t = useTranslations('Landing.topProducts');
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section className='bg-white py-16 lg:py-24 dark:bg-gray-900'>
      <div className='container mx-auto max-w-7xl px-6 lg:px-20'>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className='mb-12 flex items-center justify-between'>
            <div className=''>
              <h2 className='text-3xl font-bold text-gray-900 lg:text-4xl dark:text-white'>
                {t('title')}
              </h2>
              <p className='mt-2 text-gray-600 dark:text-gray-300'>
                {t('description')}
              </p>
            </div>
          </div>

          {/* Products Grid */}
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
            {topProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className='h-[420px] w-full' // Fixed height and width
              >
                <Card className='group h-full w-full overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800 dark:shadow-gray-700/20'>
                  <div className='relative'>
                    {/* Product Image */}
                    <div className='aspect-[4/3] overflow-hidden bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800/30 dark:to-green-700/30'>
                      <div className='flex h-full items-center justify-center'>
                        <div className='text-center'>
                          <div className='mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 dark:bg-green-400/30'>
                            <span className='text-2xl'>🌱</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Favorite Button */}
                    <button className='absolute top-3 right-3 rounded-full bg-white/80 p-2 shadow-md transition-colors hover:bg-white hover:text-red-500 dark:bg-gray-700/80 dark:hover:bg-gray-600'>
                      <Heart className='h-4 w-4 dark:text-gray-300' />
                    </button>
                  </div>

                  <CardContent className='flex h-[calc(100%-200px)] flex-col justify-between p-4'>
                    {/* Product Name */}
                    <h3 className='font-semibold'>{t(product.nameKey)}</h3>
                    {/* Status */}
                    <div className='mb-2'>
                      <span className='inline-flex items-end rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-800/50 dark:text-green-200'>
                        {t(product.statusKey)}
                      </span>
                    </div>

                    {/* Price and Min Order */}
                    <div className='mb-3 space-y-1'>
                      <div className='flex items-center justify-between gap-2'>
                        <span className='text-lg font-bold text-gray-900 dark:text-white'>
                          {product.price}
                        </span>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                          {t('minOrder')} {product.minOrder}
                        </span>
                      </div>
                    </div>

                    {/* Supplier Info */}
                    <div className='mt-auto space-y-1 border-t pt-3 dark:border-gray-600'>
                      <p className='text-sm font-medium text-gray-900 dark:text-white'>
                        {t(product.descriptionKey)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
