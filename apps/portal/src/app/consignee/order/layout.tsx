import ConsigneeHeader from '@/features/consignee/components/consignee-header';

export default function OrderLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen flex-col'>
      <main className='flex-1'>{children}</main>
    </div>
  );
}
