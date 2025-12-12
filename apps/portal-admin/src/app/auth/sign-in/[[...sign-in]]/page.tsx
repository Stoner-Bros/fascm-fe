import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';

export const metadata: Metadata = {
  title: 'FASCM | Authentication',
  description: 'Sign In page for authentication.'
};

export default async function Page() {
  return <SignInViewPage />;
}
