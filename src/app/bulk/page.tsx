'use client';

import BulkOperations from '@/components/bulk/BulkOperations';
import React from 'react';

const BulkOperationsPage: React.FC = () => {
  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <BulkOperations />
      </div>
    </div>
  );
};

export default BulkOperationsPage;
