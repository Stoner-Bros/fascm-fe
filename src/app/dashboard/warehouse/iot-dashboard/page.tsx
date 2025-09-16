import PageContainer from '@/components/layout/page-container';
import { IoTDashboard } from '@/features/warehouse/components/iot-dashboard';

export default function IoTDashboardPage() {
  return (
    <PageContainer scrollable={true}>
      <IoTDashboard />
    </PageContainer>
  );
}
