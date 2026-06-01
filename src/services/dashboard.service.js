import { api, unwrap } from './api';

export const dashboardService = {
  stats: () => api.get('/dashboard/stats').then(unwrap),
  charts: () => api.get('/dashboard/charts').then(unwrap),
};
