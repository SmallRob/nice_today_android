import React from 'react';
import DressHealthTab from '../components/DressHealthTab';

function DressGuidePage() {
  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 pb-safe-bottom optimized-scroll">
      <DressHealthTab 
        apiBaseUrl={null}
        serviceStatus={null}
        isDesktop={false}
      />
    </div>
  );
}

export default DressGuidePage;