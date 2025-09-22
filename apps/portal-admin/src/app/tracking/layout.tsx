'use client';

import Header from '@/components/tracking/header';
import Footer from '@/components/tracking/footer';
import { FC, ReactNode } from 'react';

interface TrackingLayoutProps {
  children: ReactNode;
}

const TrackingLayout: FC<TrackingLayoutProps> = ({ children }) => {
  return (
    <div className='flex min-h-screen flex-col bg-gray-50'>
      <Header />
      <div className='relative'>
        {/* Decorative elements */}
        <div className='absolute top-0 left-0 -z-10 h-64 w-64 rounded-full bg-blue-100 opacity-50 blur-3xl'></div>
        <div className='absolute top-32 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-100 opacity-50 blur-3xl'></div>
        <div className='absolute bottom-0 left-1/3 -z-10 h-80 w-80 rounded-full bg-blue-50 opacity-50 blur-3xl'></div>

        {/* Main content */}
        <main className='container mx-auto flex-grow px-4 py-12'>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default TrackingLayout;
