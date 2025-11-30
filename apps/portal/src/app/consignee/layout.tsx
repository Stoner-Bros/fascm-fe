import KBar from '@/components/kbar';
import ConsigneeSidebar from '@/components/layout/consignee-sidebar';
import Header from '@/components/layout/header';
import ConsigneeNotificationListener from '@/components/notifications/consignee-notification-listener';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cookies } from 'next/headers';

export default async function ConsigneeLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <ConsigneeSidebar />
        <SidebarInset className='overflow-auto'>
          <Header />
          <ConsigneeNotificationListener />
          {/* page main content */}
          {children}
          {/* page main content ends */}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
