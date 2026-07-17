import api from './axios';

// Thin wrapper around the /api/trips endpoints.
// Every call automatically carries the JWT via the axios interceptor in ./axios.js

export const getTrips = () => api.get('/trips');

export const getTrip = (id) => api.get(`/trips/${id}`);

export const createTrip = (tripData) => api.post('/trips', tripData);

export const updateTrip = (id, tripData) => api.put(`/trips/${id}`, tripData);

export const deleteTrip = (id) => api.delete(`/trips/${id}`);

// Photo upload uses multipart/form-data, not JSON — axios sets the
// correct Content-Type boundary automatically when given a FormData body.
export const uploadTripPhoto = (id, file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post(`/trips/${id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
