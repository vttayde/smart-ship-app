'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Home, RefreshCw, Truck, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date().toLocaleTimeString());
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get last sync time from localStorage
    const storedLastSync = localStorage.getItem('lastSync');
    if (storedLastSync) {
      setLastSync(storedLastSync);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (isOnline) {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='max-w-md w-full'>
        <Card className='p-8 text-center'>
          {/* Offline Icon */}
          <div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
              isOnline ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {isOnline ? (
              <RefreshCw className={`w-8 h-8 text-green-600 ${isOnline ? 'animate-spin' : ''}`} />
            ) : (
              <WifiOff className='w-8 h-8 text-red-600' />
            )}
          </div>

          {/* Status Message */}
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            {isOnline ? 'Connection Restored!' : "You're Offline"}
          </h1>

          <p className='text-gray-600 mb-6'>
            {isOnline
              ? 'Your internet connection has been restored. You can now access all features.'
              : "It looks like you're not connected to the internet. Some features may be limited."}
          </p>

          {/* Connection Status */}
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6 ${
              isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
            />
            {isOnline ? 'Online' : 'Offline'}
          </div>

          {/* Last Sync Info */}
          {lastSync && <p className='text-sm text-gray-500 mb-6'>Last synced: {lastSync}</p>}

          {/* Offline Features Available */}
          {!isOnline && (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
              <h3 className='font-semibold text-blue-900 mb-3'>Available Offline:</h3>
              <ul className='text-sm text-blue-800 space-y-2 text-left'>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mr-3' />
                  View previously loaded shipments
                </li>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mr-3' />
                  Access cached analytics data
                </li>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mr-3' />
                  Create draft shipments (will sync when online)
                </li>
                <li className='flex items-center'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mr-3' />
                  View courier recommendations
                </li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className='space-y-3'>
            <Button
              onClick={handleRetry}
              className='w-full'
              variant={isOnline ? 'default' : 'secondary'}
              disabled={!isOnline}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isOnline ? 'animate-spin' : ''}`} />
              {isOnline ? 'Reload Page' : 'Retry Connection'}
            </Button>

            <Button onClick={handleGoHome} variant='outline' className='w-full'>
              <Home className='w-4 h-4 mr-2' />
              Go to Homepage
            </Button>

            <Link href='/dashboard' className='block'>
              <Button variant='ghost' className='w-full'>
                <Truck className='w-4 h-4 mr-2' />
                Access Dashboard (Offline Mode)
              </Button>
            </Link>
          </div>

          {/* Tips */}
          <div className='mt-8 p-4 bg-gray-50 rounded-lg'>
            <h4 className='font-semibold text-gray-900 mb-2'>Tips while offline:</h4>
            <ul className='text-sm text-gray-600 space-y-1 text-left'>
              <li>• Your draft shipments will be saved and synced when you&apos;re back online</li>
              <li>• Analytics data from your last session is available</li>
              <li>• Use the search to find cached shipment information</li>
            </ul>
          </div>
        </Card>

        {/* PWA Install Prompt */}
        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-500'>
            Install SmartShip as an app for better offline experience
          </p>
        </div>
      </div>
    </div>
  );
}
