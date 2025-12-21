'use client';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navItems } from '@/constants/data';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  IconBell,
  IconChevronsDown,
  IconCreditCard,
  IconLogout,
  IconPhotoUp,
  IconUserCircle
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';
import useAuth from '@/hooks/use-auth';
import type { NavItem } from '@/types';
export const company = {
  name: 'Acme Inc',
  logo: IconPhotoUp,
  plan: 'Enterprise'
};

const tenants = [
  { id: '1', name: 'Acme Inc' },
  { id: '2', name: 'Beta Corp' },
  { id: '3', name: 'Gamma Ltd' }
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const { user, logout, userRole, checkRouteAccess } = useAuth();
  const router = useRouter();
  const t = useTranslations('Sidebar');

  const handleSwitchTenant = () => {
    // Tenant switching functionality would be implemented here
  };

  const activeTenant = tenants[0];

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  // Filter navigation items based on user permissions
  const filterNavItems = React.useMemo(() => {
    if (!userRole) return [];

    return navItems
      .map((item) => {
        // Check if main item is accessible
        const hasMainAccess = !item.url || checkRouteAccess(item.url);

        // Filter sub-items based on permissions
        const filteredSubItems = item.items
          ? item.items.filter((subItem) => checkRouteAccess(subItem.url))
          : [];

        // If item has sub-items, only show if at least one sub-item is accessible
        // If item has no sub-items, show if main item is accessible
        if (item.items && item.items.length > 0) {
          if (filteredSubItems.length === 0) {
            return null; // Hide parent if no accessible sub-items
          }
          return {
            ...item,
            items: filteredSubItems
          };
        } else {
          return hasMainAccess ? item : null;
        }
      })
      .filter((item): item is NavItem => item !== null);
  }, [userRole, checkRouteAccess]);

  // Translation map for nav items
  const getTranslatedTitle = (title: string): string => {
    const translationMap: { [key: string]: string } = {
      Dashboard: t('dashboard'),
      Order: t('order'),
      Warehouse: t('warehouse'),
      'Stock Management': t('stockManagement'),
      'IoT Device': t('iotDevice'),
      Delivery: t('delivery'),
      Inbound: t('inbound'),
      Outbound: t('outbound'),
      Truck: t('truck'),
      Product: t('product'),
      Category: t('category'),
      Account: t('account'),
      Profile: t('profile'),
      Login: t('login'),
      Kanban: t('kanban'),
      'Purchase Order': t('purchaseOrder'),
      'Sale Order': t('saleOrder'),
      Pickup: t('pickup'),
      Import: t('import'),
      Export: t('export'),
      Manager: t('manager'),
      Staff: t('staff'),
      'Delivery Staff': t('deliveryStaff'),
      Supplier: t('supplier'),
      Consignee: t('consignee')
    };
    return translationMap[title] || title;
  };

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <OrgSwitcher
          tenants={tenants}
          defaultTenant={activeTenant}
          onTenantSwitch={handleSwitchTenant}
        />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>{t('overview')}</SidebarGroupLabel>
          <SidebarMenu>
            {filterNavItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              const translatedTitle = getTranslatedTitle(item.title);
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  open={true}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip={translatedTitle}
                      onClick={(e) => {
                        if (item.url && item.url !== '#') {
                          e.preventDefault();
                          router.push(item.url);
                        }
                      }}
                      className={
                        item.url ? 'cursor-pointer' : 'hover:bg-transparent'
                      }
                    >
                      {item.icon && <Icon />}
                      <span>{translatedTitle}</span>
                    </SidebarMenuButton>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{getTranslatedTitle(subItem.title)}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={translatedTitle}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{translatedTitle}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  {user && (
                    <UserAvatarProfile
                      className='h-8 w-8 rounded-lg'
                      showInfo
                      user={user}
                    />
                  )}
                  <IconChevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='px-1 py-1.5'>
                    {user && (
                      <UserAvatarProfile
                        className='h-8 w-8 rounded-lg'
                        showInfo
                        user={user}
                      />
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    <IconUserCircle className='mr-2 h-4 w-4' />
                    {t('userMenu.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconCreditCard className='mr-2 h-4 w-4' />
                    {t('userMenu.billing')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconBell className='mr-2 h-4 w-4' />
                    {t('userMenu.notifications')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <IconLogout className='mr-2 h-4 w-4' />
                  {t('userMenu.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
