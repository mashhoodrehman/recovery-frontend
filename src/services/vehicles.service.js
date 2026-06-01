import { api, unwrap, unwrapMeta } from './api';

export const vehiclesService = {
  list: (params) => api.get('/vehicles', { params }).then(unwrapMeta),
  get: (id) => api.get(`/vehicles/${id}`).then(unwrap),
  create: (payload) => api.post('/vehicles', payload).then(unwrap),
  update: (id, payload) => api.put(`/vehicles/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/vehicles/${id}`),
};

export const VEHICLE_TYPES = [
  { value: 'tow_truck', label: 'Tow Truck' },
  { value: 'flatbed_truck', label: 'Flatbed Truck' },
  { value: 'recovery_truck', label: 'Recovery Truck' },
  { value: 'pickup_truck', label: 'Pickup Truck' },
  { value: 'roadside_assistance', label: 'Roadside Assistance' },
];
