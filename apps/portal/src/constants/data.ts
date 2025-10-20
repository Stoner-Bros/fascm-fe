import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Product',
    url: '/dashboard/product',
    icon: 'product',
    shortcut: ['p', 'p'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Account',
    url: '/dashboard/profile', // Navigate to profile page
    icon: 'billing',
    isActive: true,

    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Login',
        shortcut: ['l', 'l'],
        url: '/',
        icon: 'login'
      }
    ]
  },
  {
    title: 'Kanban',
    url: '/dashboard/kanban',
    icon: 'kanban',
    shortcut: ['k', 'k'],
    isActive: false,
    items: [] // No child items
  }
];

export const supplierNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/supplier/dashboard',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Harvest Batches',
    url: '/supplier/harvest-batches',
    icon: 'product',
    shortcut: ['h', 'b'],
    isActive: false,
    items: []
  },
  {
    title: 'Pickup Confirmation',
    url: '/supplier/pickup-confirmation',
    icon: 'truck',
    shortcut: ['p', 'c'],
    isActive: false,
    items: []
  },
  {
    title: 'Account',
    url: '/supplier/profile',
    icon: 'billing',
    isActive: true,
    items: [
      {
        title: 'Profile',
        url: '/supplier/profile',
        icon: 'userPen',
        shortcut: ['p', 'r']
      },
      {
        title: 'Farm Information',
        url: '/supplier/profile/farm',
        icon: 'product',
        shortcut: ['f', 'i']
      }
    ]
  }
];

export const consigneeNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/consignee/dashboard',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Products',
    url: '/consignee/products',
    icon: 'product',
    shortcut: ['p', 'r'],
    isActive: false,
    items: []
  },
  {
    title: 'Orders',
    url: '/consignee/orders',
    icon: 'shoppingCart',
    shortcut: ['o', 'r'],
    isActive: false,
    items: []
  },
  {
    title: 'Deliveries',
    url: '/consignee/deliveries',
    icon: 'truck',
    shortcut: ['d', 'l'],
    isActive: false,
    items: []
  },
  {
    title: 'Traceability',
    url: '/consignee/traceability',
    icon: 'blockChain',
    shortcut: ['t', 'r'],
    isActive: false,
    items: []
  },
  {
    title: 'Payments',
    url: '/consignee/payments',
    icon: 'creditCard',
    shortcut: ['p', 'y'],
    isActive: false,
    items: []
  },
  {
    title: 'Account',
    url: '/consignee/profile',
    icon: 'billing',
    isActive: true,
    items: [
      {
        title: 'Profile',
        url: '/consignee/profile',
        icon: 'userPen',
        shortcut: ['p', 'f']
      },
      {
        title: 'Business Info',
        url: '/consignee/profile/business',
        icon: 'building',
        shortcut: ['b', 'i']
      }
    ]
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
