'use client';

import TrackingDashboard from '@/components/shipping/enhanced/TrackingDashboard';
import { Suspense } from 'react';

export default function TrackingPage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto py-8'>
        <Suspense
          fallback={
            <div className='flex items-center justify-center min-h-screen'>
              <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600' />
            </div>
          }
        >
          <TrackingDashboard showSearch={true} autoRefresh={true} refreshInterval={30} />
        </Suspense>
      </div>
    </div>
  );
}
