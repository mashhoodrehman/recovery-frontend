import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdHome,
  MdPeople,
  MdAdminPanelSettings,
  MdVpnKey,
  MdLock,
  MdPersonAdd,
} from 'react-icons/md';

// Admin views
import Dashboard from 'views/admin/dashboard';
import UsersList from 'views/admin/users';
import RolesList from 'views/admin/roles';
import PermissionsList from 'views/admin/permissions';

// Auth views
import SignIn from 'views/auth/signIn';
import SignUp from 'views/auth/signUp';
import ForgotPassword from 'views/auth/forgotPassword';
import ResetPassword from 'views/auth/resetPassword';

const routes = [
  {
    name: 'Dashboard',
    layout: '/admin',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <Dashboard />,
    showInSidebar: true,
  },
  {
    name: 'Users',
    layout: '/admin',
    path: '/users',
    icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
    component: <UsersList />,
    permission: 'users.view',
    showInSidebar: true,
  },
  {
    name: 'Roles',
    layout: '/admin',
    path: '/roles',
    icon: <Icon as={MdAdminPanelSettings} width="20px" height="20px" color="inherit" />,
    component: <RolesList />,
    permission: 'roles.view',
    showInSidebar: true,
  },
  {
    name: 'Permissions',
    layout: '/admin',
    path: '/permissions',
    icon: <Icon as={MdVpnKey} width="20px" height="20px" color="inherit" />,
    component: <PermissionsList />,
    permission: 'permissions.view',
    showInSidebar: true,
  },

  // Auth (not displayed in sidebar)
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignIn />,
    hidden: true,
  },
  {
    name: 'Sign Up',
    layout: '/auth',
    path: '/sign-up',
    icon: <Icon as={MdPersonAdd} width="20px" height="20px" color="inherit" />,
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
