import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';
import { useAuth } from 'context/AuthContext';

export default function RequireAuth({ children, permission }) {
  const { isAuthenticated, loading, can } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="lg" thickness="3px" color="brand.500" />
      </Center>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace state={{ from: location }} />;
  }
  if (permission && !can(...(Array.isArray(permission) ? permission : [permission]))) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}
