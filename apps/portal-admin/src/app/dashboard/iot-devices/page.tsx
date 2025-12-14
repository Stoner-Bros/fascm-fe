import { IoTDeviceManagement } from '@/features/warehouse/components/iot-device-management';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import PageContainer from '@/components/layout/page-container';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('IoTDevices');
  return {
    title: t('metadata.title')
  };
}

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer scrollable={true}>
      <IoTDeviceManagement />
    </PageContainer>
  );
}
