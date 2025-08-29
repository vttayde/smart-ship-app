'use client';

import Layout from '@/components/layout/Layout';
import { Loading } from '@/components/ui/loading';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TrackingNumberPage() {
  const params = useParams();
  const trackingNumber = params?.trackingNumber as string;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && trackingNumber) {
      // Redirect to track page with tracking number pre-filled
      window.location.href = `/track?trackingNumber=${encodeURIComponent(trackingNumber)}`;
    }
  }, [mounted, trackingNumber]);

  if (!mounted) {
    return (
      <Layout>
        <div className='min-h-screen flex items-center justify-center'>
          <Loading />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='min-h-screen flex items-center justify-center'>
        <Loading />
      </div>
    </Layout>
  );
}
