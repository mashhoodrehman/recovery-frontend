import React from 'react';
import { Navigate } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';
import { useAuth } from 'context/AuthContext';

export default function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="lg" thickness="3px" color="brand.500" />
      </Center>
    );
  }
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;
  return children;
}
