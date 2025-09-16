'use client';

import Header from '@/components/tracking/header';
import Footer from '@/components/tracking/footer';
import { FC, ReactNode } from 'react';

interface TrackingLayoutProps {
  children: ReactNode;
}

const TrackingLayout: FC<TrackingLayoutProps> = ({ children }) => {
  return (
    <div className='flex min-h-screen flex-col'>
      <Header />
      <main className='container mx-auto flex-grow px-4 py-8'>{children}</main>
      <Footer />
    </div>
  );
};

export default TrackingLayout;
