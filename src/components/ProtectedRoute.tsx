import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { startPkceLogin } from '../features/auth/pkce';

const ProtectedRoute: React.FC = () => {
  const status = useSelector((state: RootState) => state.auth.status);

  useEffect(() => {
    if (status !== 'authenticated' && status !== 'logging-out') {
      void startPkceLogin();
    }
  }, [status]);

  if (status !== 'authenticated') {
    return null;
  }
  return <Outlet />;
};

export default ProtectedRoute;
