'use client';
import PageContainer from '@/components/layout/page-container';
import { TruckDetail } from '@/features/truck/truck-detail';
import { useParams } from 'next/navigation';

export default function TruckDetailPage() {
  const { id } = useParams();
  return (
    <PageContainer>
      <TruckDetail truckId={id as string} />
    </PageContainer>
  );
}
