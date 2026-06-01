import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdHome,
  MdPeople,
  MdAdminPanelSettings,
  MdVpnKey,
  MdLock,
  MdPersonAdd,
  MdDirectionsCar,
  MdAssignment,
  MdAccountBalanceWallet,
  MdPayments,
  MdNotifications,
  MdSettings,
  MdHistory,
} from 'react-icons/md';

// Admin views
import Dashboard from 'views/admin/dashboard';
import UsersList from 'views/admin/users';
import RolesList from 'views/admin/roles';
import PermissionsList from 'views/admin/permissions';
import VehiclesList from 'views/admin/vehicles';
import RequestsList from 'views/admin/requests';
import WalletView from 'views/admin/wallet';
import WithdrawalsList from 'views/admin/withdrawals';
import NotificationsView from 'views/admin/notifications';
import SettingsView from 'views/admin/settings';
import AuditLogsView from 'views/admin/auditLogs';

// Auth views
import SignIn from 'views/auth/signIn';
import SignUp from 'views/auth/signUp';
import ForgotPassword from 'views/auth/forgotPassword';
import ResetPassword from 'views/auth/resetPassword';

const icon = (as) => <Icon as={as} width="20px" height="20px" color="inherit" />;

const routes = [
  {
    name: 'Dashboard',
    layout: '/admin',
    path: '/dashboard',
    icon: icon(MdHome),
    component: <Dashboard />,
    permission: 'dashboard.view',
    showInSidebar: true,
  },
  {
    name: 'Service Requests',
    layout: '/admin',
    path: '/requests',
    icon: icon(MdAssignment),
    component: <RequestsList />,
    permission: ['recovery.request.view.any', 'recovery.request.view.own'],
    showInSidebar: true,
  },
  {
    name: 'Vehicles',
    layout: '/admin',
    path: '/vehicles',
    icon: icon(MdDirectionsCar),
    component: <VehiclesList />,
    permission: ['vehicles.view.own', 'vehicles.manage.any'],
    showInSidebar: true,
  },
  {
    name: 'Wallet',
    layout: '/admin',
    path: '/wallet',
    icon: icon(MdAccountBalanceWallet),
    component: <WalletView />,
    permission: ['wallets.view.own', 'wallets.view.any'],
    showInSidebar: true,
  },
  {
    name: 'Withdrawals',
    layout: '/admin',
    path: '/withdrawals',
    icon: icon(MdPayments),
    component: <WithdrawalsList />,
    permission: ['withdrawals.view.own', 'withdrawals.manage'],
    showInSidebar: true,
  },
  {
    name: 'Notifications',
    layout: '/admin',
    path: '/notifications',
    icon: icon(MdNotifications),
    component: <NotificationsView />,
    showInSidebar: true,
  },
  {
    name: 'Users',
    layout: '/admin',
    path: '/users',
    icon: icon(MdPeople),
    component: <UsersList />,
    permission: 'users.view',
    showInSidebar: true,
  },
  {
    name: 'Roles',
    layout: '/admin',
    path: '/roles',
    icon: icon(MdAdminPanelSettings),
    component: <RolesList />,
    permission: 'roles.view',
    showInSidebar: true,
  },
  {
    name: 'Permissions',
    layout: '/admin',
    path: '/permissions',
    icon: icon(MdVpnKey),
    component: <PermissionsList />,
    permission: 'permissions.view',
    showInSidebar: true,
  },
  {
    name: 'Audit Logs',
    layout: '/admin',
    path: '/audit-logs',
    icon: icon(MdHistory),
    component: <AuditLogsView />,
    permission: 'audit.view',
    showInSidebar: true,
  },
  {
    name: 'Settings',
    layout: '/admin',
    path: '/settings',
    icon: icon(MdSettings),
    component: <SettingsView />,
    permission: 'settings.view',
    showInSidebar: true,
  },

  // Auth (not displayed in sidebar)
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: icon(MdLock),
    component: <SignIn />,
    hidden: true,
  },
  {
    name: 'Sign Up',
    layout: '/auth',
    path: '/sign-up',
    icon: icon(MdPersonAdd),
    component: <SignUp />,
    hidden: true,
  },
  {
    name: 'Forgot Password',
    layout: '/auth',
    path: '/forgot-password',
    component: <ForgotPassword />,
    hidden: true,
  },
  {
    name: 'Reset Password',
    layout: '/auth',
    path: '/reset-password',
    component: <ResetPassword />,
    hidden: true,
  },
];

export default routes;
