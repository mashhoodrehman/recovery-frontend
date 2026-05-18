import { api, unwrap, unwrapMeta } from './api';

export const permissionsService = {
  list: (params) => api.get('/permissions', { params }).then(unwrapMeta),
  groups: () => api.get('/permissions/groups/all').then(unwrap),
  get: (id) => api.get(`/permissions/${id}`).then(unwrap),
  create: (payload) => api.post('/permissions', payload).then(unwrap),
  update: (id, payload) => api.put(`/permissions/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/permissions/${id}`),
};
