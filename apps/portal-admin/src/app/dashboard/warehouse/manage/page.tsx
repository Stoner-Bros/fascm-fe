import PageContainer from '@/components/layout/page-container';
import { WarehouseManagement } from '@/features/warehouse/components/warehouse-management';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Dashboard: Warehouse Management'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function WarehouseManagePage(props: pageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer scrollable={true}>
      <WarehouseManagement />
    </PageContainer>
  );
}
