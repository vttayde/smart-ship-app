'use client';

import { Suspense } from 'react';
import ShipmentManagementDashboard from '@/components/shipping/enhanced/ShipmentManagementDashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
        </div>
      }>
        <ShipmentManagementDashboard />
      </Suspense>
    </div>
  );
}
