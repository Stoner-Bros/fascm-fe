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
import { consigneeNavItems } from '@/constants/nav-data';
import useAuth from '@/hooks/use-auth';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  IconChevronsDown,
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

export const company = {
  name: 'Retail Corp',
  logo: IconPhotoUp,
  plan: 'Business'
};

const tenants = [
  { id: '1', name: 'Main Store' },
  { id: '2', name: 'Branch Store A' },
  { id: '3', name: 'Branch Store B' }
];

export default function ConsigneeSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const { user, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('Sidebar');
  const handleSwitchTenant = (_tenantId: string) => {
    // Tenant switching functionality would be implemented here
  };

  const activeTenant = tenants[0];

  // Translation map for nav items
  const getTranslatedTitle = (title: string): string => {
    const translationMap: { [key: string]: string } = {
      dashboard: t('navigation.dashboard'),
      products: t('navigation.products'),
      orders: t('navigation.orders'),
      payments: t('navigation.payments'),
      profile: t('navigation.profile')
    };
    return translationMap[title] || title;
  };

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

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
            {consigneeNavItems.map((item) => {
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
                        {item.items?.map((subItem) => {
                          const translatedSubTitle = getTranslatedTitle(
                            subItem.title
                          );
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>
                                  <span>{translatedSubTitle}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
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
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer'
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
                    onClick={() => router.push('/consignee/profile')}
                    className='cursor-pointer'
                  >
                    <IconUserCircle className='mr-2 h-4 w-4' />
                    {t('menu.profile')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className='cursor-pointer'>
                  <IconLogout className='mr-2 h-4 w-4' />
                  {t('menu.signOut')}
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
