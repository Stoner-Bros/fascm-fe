import KBar from '@/components/kbar';
import SupplierSidebar from '@/components/layout/supplier-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cookies } from 'next/headers';
import SupplierNotificationListener from '@/components/notifications/supplier-notification-listener';
export default async function SupplierLayout({
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
        <SupplierSidebar />
        <SidebarInset className='overflow-auto'>
          <Header />
          {/* page main content */}
          <SupplierNotificationListener />
          {children}
          {/* page main content ends */}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
