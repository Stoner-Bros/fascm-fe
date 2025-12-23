import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';

export const metadata: Metadata = {
  title: 'FASCM | Đăng nhập',
  description: 'Trang đăng nhập hệ thống FASCM'
};

export default async function Page() {
  return <SignInViewPage />;
}
