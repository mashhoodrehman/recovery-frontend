import { api, unwrap } from './api';

export const settingsService = {
  list: () => api.get('/settings').then(unwrap),
  publicSettings: () => api.get('/settings/public').then(unwrap),
  update: (settings) => api.put('/settings', { settings }).then(unwrap),
};
