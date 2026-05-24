import React from 'react';
import CRMPage from './admin/crm';

const DirectAdminAccess: React.FC = () => {
  return (
    <CRMPage bypassAuth={true} />
  );
};

export default DirectAdminAccess;