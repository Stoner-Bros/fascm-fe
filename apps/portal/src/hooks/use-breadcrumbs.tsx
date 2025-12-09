'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  // Supplier routes
  '/supplier/dashboard': [{ title: 'Dashboard', link: '/supplier/dashboard' }],
  '/supplier/products': [{ title: 'Products', link: '/supplier/products' }],
  '/supplier/harvest-batches': [
    { title: 'Harvest Batches', link: '/supplier/harvest-batches' }
  ],
  '/supplier/harvest-batches/new': [
    { title: 'Harvest Batches', link: '/supplier/harvest-batches' },
    { title: 'New Harvest Batch', link: '/supplier/harvest-batches/new' }
  ],
  '/supplier/harvest-batches/[id]': [
    { title: 'Harvest Batches', link: '/supplier/harvest-batches' },
    { title: 'Harvest Batch Details', link: '/supplier/harvest-batches/[id]' }
  ],
  '/supplier/profile': [{ title: 'Profile', link: '/supplier/profile' }],

  // Consignee routes
  '/consignee/dashboard': [
    { title: 'Dashboard', link: '/consignee/dashboard' }
  ],
  '/consignee/products': [{ title: 'Products', link: '/consignee/products' }],
  '/consignee/orders': [{ title: 'Orders', link: '/consignee/orders' }],
  '/consignee/orders/new': [
    { title: 'Orders', link: '/consignee/orders' },
    { title: 'New Order', link: '/consignee/orders/new' }
  ],
  '/consignee/orders/[id]': [
    { title: 'Orders', link: '/consignee/orders' },
    { title: 'Order Details', link: '/consignee/orders/[id]' }
  ],
  '/consignee/products/[id]': [
    { title: 'Products', link: '/consignee/products' },
    { title: 'Product Details', link: '/consignee/products/[id]' }
  ],

  '/consignee/profile': [{ title: 'Profile', link: '/consignee/profile' }]

  // Add more custom mappings as needed
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path
      };
    });
  }, [pathname]);

  return breadcrumbs;
}
