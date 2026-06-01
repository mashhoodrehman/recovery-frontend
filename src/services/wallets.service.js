import { api, unwrap, unwrapMeta } from './api';

export const walletsService = {
  me: () => api.get('/wallets/me').then(unwrap),
  get: (userId) => api.get(`/wallets/${userId}`).then(unwrap),
  transactions: (params) => api.get('/wallets/transactions', { params }).then(unwrapMeta),
  adjust: (payload) => api.post('/wallets/adjust', payload).then(unwrap),
};
