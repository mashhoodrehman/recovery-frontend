import { api, unwrap, unwrapMeta } from './api';

export const rolesService = {
  list: (params) => api.get('/roles', { params }).then(unwrapMeta),
  get: (id) => api.get(`/roles/${id}`).then(unwrap),
  create: (payload) => api.post('/roles', payload).then(unwrap),
  update: (id, payload) => api.put(`/roles/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/roles/${id}`),
};
