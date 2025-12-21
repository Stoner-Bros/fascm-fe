'use client';
import { RouteGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';
import PageContainer from '@/components/layout/page-container';
import { TruckDetail } from '@/features/truck/truck-detail';
import { useParams } from 'next/navigation';

export default function TruckDetailPage() {
  const { id } = useParams();
  return (
    <RouteGuard permission={Permission.VIEW_TRUCK}>
      <PageContainer>
        <TruckDetail truckId={id as string} />
      </PageContainer>
    </RouteGuard>
  );
}
