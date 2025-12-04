import ProfileRole from '@/features/profile/components/profile-role';
import ProfileViewPage from '@/features/profile/components/profile-view-page';

export const metadata = {
  title: 'Dashboard : Profile'
};

export default async function Page() {
  return (
    <ProfileRole>
      <ProfileViewPage />
    </ProfileRole>
  );
}
