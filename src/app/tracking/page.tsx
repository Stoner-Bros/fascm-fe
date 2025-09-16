'use client';

import { useState } from 'react';

export default function Tracking() {
  const [trackingId, setTrackingId] = useState('');

  const handleTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement tracking logic
    console.log('Tracking ID:', trackingId);
  };

  return (
    <div className='mx-auto max-w-2xl'>
      <h1 className='mb-8 text-center text-3xl font-bold'>Track Your Order</h1>

      <div className='mb-8 rounded-lg bg-white p-6 shadow-md'>
        <form onSubmit={handleTrackingSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='trackingId'
              className='mb-2 block text-sm font-medium text-gray-700'
            >
              Enter Tracking Number
            </label>
            <input
              type='text'
              id='trackingId'
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className='w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500'
              placeholder='Enter your tracking number'
              required
            />
          </div>
          <button
            type='submit'
            className='w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
          >
            Track Order
          </button>
        </form>
      </div>

      <div className='rounded-lg bg-white p-6 shadow-md'>
        <h2 className='mb-4 text-xl font-semibold'>Tracking Instructions</h2>
        <ul className='space-y-2 text-gray-600'>
          <li>1. Enter your tracking number in the field above</li>
          <li>2. Click on the &quot;Track Order&quot; button</li>
          <li>3. View real-time status and location of your order</li>
          <li>4. Contact support if you need any assistance</li>
        </ul>
      </div>
    </div>
  );
}
