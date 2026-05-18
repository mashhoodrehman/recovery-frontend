import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import initialTheme from './theme/theme';
import { AuthProvider } from 'context/AuthContext';
import RequireAuth from 'guards/RequireAuth';
import GuestRoute from 'guards/GuestRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default function Main() {
  // eslint-disable-next-line
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  return (
    <ChakraProvider theme={currentTheme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <Routes>
            <Route
              path="auth/*"
              element={
                <GuestRoute>
                  <AuthLayout />
                </GuestRoute>
              }
            />
            <Route
              path="admin/*"
              element={
                <RequireAuth>
                  <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
                </RequireAuth>
              }
            />
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}
