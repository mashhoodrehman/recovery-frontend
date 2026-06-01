import { api, unwrap, unwrapMeta } from './api';

export const withdrawalsService = {
  list: (params) => api.get('/withdrawals', { params }).then(unwrapMeta),
  get: (id) => api.get(`/withdrawals/${id}`).then(unwrap),
  create: (payload) => api.post('/withdrawals', payload).then(unwrap),
  approve: (id) => api.post(`/withdrawals/${id}/approve`).then(unwrap),
  markPaid: (id) => api.post(`/withdrawals/${id}/paid`).then(unwrap),
  reject: (id, payload) => api.post(`/withdrawals/${id}/reject`, payload).then(unwrap),
};
