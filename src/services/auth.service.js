import { api, unwrap } from './api';

export const authService = {
  login: (payload) => api.post('/auth/login', payload).then(unwrap),
  signup: (payload) => api.post('/auth/signup', payload).then(unwrap),
  me: () => api.get('/auth/me').then(unwrap),
  logout: () => api.post('/auth/logout').then(unwrap),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload).then(unwrap),
  resetPassword: (payload) => api.post('/auth/reset-password', payload).then(unwrap),
};
