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
      '/dashboard': [{ title: t('dashboard'), link: '/dashboard' }],
      '/dashboard/employee': [
        { title: t('dashboard'), link: '/dashboard' },
        { title: t('employee'), link: '/dashboard/employee' }
      ],
      '/dashboard/product': [
        { title: t('dashboard'), link: '/dashboard' },
        { title: t('product'), link: '/dashboard/product' }
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
      // Note: This is a simple fallback, for full i18n support all segments should have keys
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
