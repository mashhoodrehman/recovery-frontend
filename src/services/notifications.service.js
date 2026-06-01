import { api, unwrap, unwrapMeta } from './api';

export const notificationsService = {
  list: (params) => api.get('/notifications', { params }).then(unwrapMeta),
  markRead: (id) => api.post(`/notifications/${id}/read`).then(unwrap),
  markAllRead: () => api.post('/notifications/read-all').then(unwrap),
  send: (payload) => api.post('/notifications/send', payload).then(unwrap),
  registerToken: (fcmToken) => api.post('/notifications/register-token', { fcmToken }).then(unwrap),
};
