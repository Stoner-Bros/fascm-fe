import ConsigneeHeader from '@/features/consignee/components/consignee-header';
import ConsigneeFooter from '@/features/consignee/components/consignee-footer';

export default function ConsigneeLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen flex-col'>
      <ConsigneeHeader />
      <main className='flex-1'>{children}</main>
      <ConsigneeFooter />
    </div>
  );
}
