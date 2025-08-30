'use client';

import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
import React from 'react';

const AnalyticsPage: React.FC = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      <AdvancedAnalyticsDashboard dateRange='30d' showForecasting={true} exportEnabled={true} />
    </div>
  );
};

export default AnalyticsPage;
