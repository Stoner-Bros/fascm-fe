import { ImportTicketManagement } from '@/features/warehouse/components/import-ticket-management';
import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: Import Tickets'
};

export default function ImportTicketsPage() {
  return (
    <PageContainer scrollable={true}>
      <ImportTicketManagement />
    </PageContainer>
  );
}
