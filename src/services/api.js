import axios from 'axios';
import { tokenStore } from './tokenStore';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 15000,
});

let isRefreshing = false;
let pendingQueue = [];

const flushQueue = (err, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (err) reject(err);
    else resolve(token);
  });
  pendingQueue = [];
};

api.interceptors.request.use((config) => {
  const access = tokenStore.getAccess();
  if (access && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;

    if (status !== 401 || original._retry || original.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }
    const refresh = tokenStore.getRefresh();
    if (!refresh) {
      tokenStore.clear();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;
    try {
      const { data } = await api.post('/auth/refresh', { refreshToken: refresh });
      const { accessToken, refreshToken } = data.data || {};
      tokenStore.set({ accessToken, refreshToken });
      flushQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (err) {
      flushQueue(err, null);
      tokenStore.clear();
      window.location.assign('/auth/sign-in');
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export const unwrap = (res) => res.data?.data;
export const unwrapMeta = (res) => ({ data: res.data?.data, meta: res.data?.meta });
