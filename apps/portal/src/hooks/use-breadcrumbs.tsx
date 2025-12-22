'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

export function useBreadcrumbs() {
  const t = useTranslations('Breadcrumbs');
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // This allows to add custom title as well
    const routeMapping: Record<string, BreadcrumbItem[]> = {
      // Supplier routes
      '/supplier/dashboard': [
        { title: t('dashboard'), link: '/supplier/dashboard' }
      ],
      '/supplier/products': [
        { title: t('products'), link: '/supplier/products' }
      ],
      '/supplier/harvest-batches': [
        { title: t('harvestBatches'), link: '/supplier/harvest-batches' }
      ],
      '/supplier/harvest-batches/new': [
        { title: t('harvestBatches'), link: '/supplier/harvest-batches' },
        { title: t('newHarvestBatch'), link: '/supplier/harvest-batches/new' }
      ],
      '/supplier/harvest-batches/[id]': [
        { title: t('harvestBatches'), link: '/supplier/harvest-batches' },
        {
          title: t('harvestBatchDetails'),
          link: '/supplier/harvest-batches/[id]'
        }
      ],
      '/supplier/profile': [{ title: t('profile'), link: '/supplier/profile' }],

      // Consignee routes
      '/consignee/dashboard': [
        { title: t('dashboard'), link: '/consignee/dashboard' }
      ],
      '/consignee/products': [
        { title: t('products'), link: '/consignee/products' }
      ],
      '/consignee/orders': [{ title: t('orders'), link: '/consignee/orders' }],
      '/consignee/orders/new': [
        { title: t('orders'), link: '/consignee/orders' },
        { title: t('newOrder'), link: '/consignee/orders/new' }
      ],
      '/consignee/orders/[id]': [
        { title: t('orders'), link: '/consignee/orders' },
        { title: t('orderDetails'), link: '/consignee/orders/[id]' }
      ],
      '/consignee/products/[id]': [
        { title: t('products'), link: '/consignee/products' },
        { title: t('productDetails'), link: '/consignee/products/[id]' }
      ],

      '/consignee/profile': [
        { title: t('profile'), link: '/consignee/profile' }
      ]

      // Add more custom mappings as needed
    };

    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      const titleKey = segment.charAt(0).toLowerCase() + segment.slice(1);
      // Try to translate if key exists, otherwise format segment
      const title = t.has(titleKey)
        ? t(titleKey)
        : segment.charAt(0).toUpperCase() + segment.slice(1);
      return {
        title,
        link: path
      };
    });
  }, [pathname, t]);

  return breadcrumbs;
}
