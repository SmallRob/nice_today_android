import React from 'react';
import DressHealthTab from '../components/DressHealthTab';

function DressGuidePage() {
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      <DressHealthTab
        apiBaseUrl={null}
        serviceStatus={null}
        isDesktop={false}
      />
    </div>
  );
}

export default DressGuidePage;