import { api, unwrap, unwrapMeta } from './api';

export const usersService = {
  list: (params) => api.get('/users', { params }).then(unwrapMeta),
  get: (id) => api.get(`/users/${id}`).then(unwrap),
  create: (payload) => api.post('/users', payload).then(unwrap),
  update: (id, payload) => api.put(`/users/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/users/${id}`),
};
