'use client';

import { useState, useRef } from 'react';
import {
  IconTruck,
  IconQrcode,
  IconPackage,
  IconSearch
} from '@tabler/icons-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Tracking() {
  const [trackingId, setTrackingId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement tracking logic
    console.log('Tracking ID:', trackingId);
    setShowResults(true);
  };

  const startQrScanner = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // In a real implementation, you would add QR detection logic here
        // For example using a library like jsQR
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setIsScanning(false);
    }
  };

  const stopQrScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  return (
    <div className='mx-auto max-w-4xl'>
      <div className='mb-8 flex flex-col items-center justify-center space-y-4'>
        <div className='flex items-center justify-center'>
          <IconTruck size={36} className='mr-3 text-blue-600' />
          <h1 className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-4xl font-extrabold text-transparent'>
            Track Your Order
          </h1>
        </div>
        <p className='text-center text-gray-600'>
          Enter your order number or scan QR code to track your shipment in
          real-time
        </p>
      </div>

      <div className='mb-8 overflow-hidden rounded-xl bg-white shadow-lg'>
        <Tabs defaultValue='number' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='number' className='py-3'>
              <IconPackage className='mr-2' size={18} />
              Enter Order Number
            </TabsTrigger>
            <TabsTrigger value='qrcode' className='py-3'>
              <IconQrcode className='mr-2' size={18} />
              Scan QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value='number' className='p-6'>
            <form onSubmit={handleTrackingSubmit} className='space-y-4'>
              <div className='relative'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                  <IconSearch className='text-gray-400' size={20} />
                </div>
                <input
                  type='text'
                  id='trackingId'
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className='w-full rounded-lg border border-gray-300 bg-gray-50 p-4 pl-10 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                  placeholder='Enter your order number (e.g., ORD-123456)'
                  required
                />
              </div>
              <button
                type='submit'
                className='group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white shadow-md transition-all hover:shadow-lg'
              >
                <span className='relative z-10 flex items-center justify-center font-medium'>
                  <IconTruck className='mr-2' size={20} />
                  Track My Order
                </span>
                <div className='absolute inset-0 -translate-x-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-transform duration-300 ease-out group-hover:translate-x-0'></div>
              </button>
            </form>
          </TabsContent>

          <TabsContent value='qrcode' className='p-6'>
            <div className='flex flex-col items-center space-y-4'>
              {isScanning ? (
                <div className='relative h-64 w-full max-w-md overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50'>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className='h-full w-full object-cover'
                  ></video>
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='h-48 w-48 rounded-lg border-2 border-blue-500 opacity-50'></div>
                  </div>
                  <button
                    onClick={stopQrScanner}
                    className='absolute right-4 bottom-4 rounded-full bg-white p-2 shadow-md'
                  >
                    <IconQrcode size={24} className='text-red-500' />
                  </button>
                </div>
              ) : (
                <div
                  onClick={startQrScanner}
                  className='flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100'
                >
                  <IconQrcode size={48} className='mb-2 text-gray-400' />
                  <p className='text-center text-gray-500'>
                    Click to activate camera and scan QR code
                  </p>
                </div>
              )}
              <p className='text-sm text-gray-500'>
                Position the QR code within the frame to scan automatically
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {showResults ? (
        <div className='rounded-xl bg-white p-6 shadow-lg'>
          <h2 className='mb-6 text-center text-2xl font-bold text-gray-800'>
            Shipping Progress
          </h2>

          <div className='mb-8'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-sm font-medium text-gray-500'>
                Order Processing
              </span>
              <span className='text-sm font-medium text-gray-500'>
                Out for Delivery
              </span>
            </div>
            <div className='relative h-2 w-full rounded-full bg-gray-200'>
              <div className='absolute top-0 left-0 h-2 w-3/4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500'></div>
              <div className='absolute -top-1 -left-1 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-md'></div>
              <div className='absolute -top-1 left-1/3 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-md'></div>
              <div className='absolute -top-1 left-2/3 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-md'></div>
              <div className='absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-gray-300 shadow-md'></div>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='rounded-lg border border-gray-100 bg-gray-50 p-4'>
              <div className='flex items-center'>
                <div className='mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-500'>
                  <IconPackage size={24} />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-800'>
                    Order Processed
                  </h3>
                  <p className='text-sm text-gray-500'>
                    September 15, 2025 - 10:23 AM
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-lg border border-gray-100 bg-gray-50 p-4'>
              <div className='flex items-center'>
                <div className='mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-500'>
                  <IconTruck size={24} />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-800'>Shipped</h3>
                  <p className='text-sm text-gray-500'>
                    September 16, 2025 - 09:45 AM
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-lg border border-gray-100 bg-gray-50 p-4'>
              <div className='flex items-center'>
                <div className='mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-500'>
                  <IconTruck size={24} />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-800'>In Transit</h3>
                  <p className='text-sm text-gray-500'>
                    September 17, 2025 - 08:30 AM
                  </p>
                  <p className='mt-1 text-sm font-medium text-blue-600'>
                    Current Location: Distribution Center
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-lg border border-gray-100 bg-gray-50 p-4 opacity-50'>
              <div className='flex items-center'>
                <div className='mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-400'>
                  <IconTruck size={24} />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-400'>
                    Out for Delivery
                  </h3>
                  <p className='text-sm text-gray-400'>
                    Estimated: September 18, 2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='rounded-xl bg-white p-6 shadow-lg'>
          <h2 className='mb-4 text-xl font-semibold text-gray-800'>
            How to Track Your Order
          </h2>
          <div className='grid gap-6 md:grid-cols-2'>
            <div className='rounded-lg bg-blue-50 p-4'>
              <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600'>
                <span className='font-bold'>1</span>
              </div>
              <h3 className='mb-2 font-medium text-gray-800'>
                Enter Order Number
              </h3>
              <p className='text-sm text-gray-600'>
                Input your order number in the tracking field or scan the QR
                code from your confirmation email
              </p>
            </div>

            <div className='rounded-lg bg-blue-50 p-4'>
              <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600'>
                <span className='font-bold'>2</span>
              </div>
              <h3 className='mb-2 font-medium text-gray-800'>
                Track in Real-Time
              </h3>
              <p className='text-sm text-gray-600'>
                View the current status and location of your order with our
                real-time tracking system
              </p>
            </div>

            <div className='rounded-lg bg-blue-50 p-4'>
              <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600'>
                <span className='font-bold'>3</span>
              </div>
              <h3 className='mb-2 font-medium text-gray-800'>
                Delivery Updates
              </h3>
              <p className='text-sm text-gray-600'>
                Receive notifications about your order&apos;s journey from
                origin to destination
              </p>
            </div>

            <div className='rounded-lg bg-blue-50 p-4'>
              <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600'>
                <span className='font-bold'>4</span>
              </div>
              <h3 className='mb-2 font-medium text-gray-800'>Need Help?</h3>
              <p className='text-sm text-gray-600'>
                Contact our customer support team if you need assistance with
                tracking your order
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
