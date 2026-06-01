import { api, unwrap, unwrapMeta } from './api';

export const recoveryService = {
  list: (params) => api.get('/recovery/requests', { params }).then(unwrapMeta),
  get: (id) => api.get(`/recovery/requests/${id}`).then(unwrap),
  create: (payload) => api.post('/recovery/requests', payload).then(unwrap),
  cancel: (id) => api.post(`/recovery/requests/${id}/cancel`).then(unwrap),
  start: (id) => api.post(`/recovery/requests/${id}/start`).then(unwrap),
  complete: (id) => api.post(`/recovery/requests/${id}/complete`).then(unwrap),
  placeBid: (id, payload) => api.post(`/recovery/requests/${id}/bids`, payload).then(unwrap),
  acceptBid: (id, bidId) =>
    api.post(`/recovery/requests/${id}/bids/${bidId}/accept`).then(unwrap),
  withdrawBid: (id, bidId) =>
    api.post(`/recovery/requests/${id}/bids/${bidId}/withdraw`).then(unwrap),
};

export const auditLogsService = {
  list: (params) => api.get('/audit-logs', { params }).then(unwrapMeta),
};
