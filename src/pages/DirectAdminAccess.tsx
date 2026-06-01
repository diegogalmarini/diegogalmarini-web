import React from 'react';
import CRMPage from './admin/crm';

const DirectAdminAccess: React.FC = () => {
  const isLocal = import.meta.env.DEV;
  return (
    <CRMPage bypassAuth={isLocal} />
  );
};

export default DirectAdminAccess;