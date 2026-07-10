import api from './axios';

// Thin wrapper around the /api/trips endpoints.
// Every call automatically carries the JWT via the axios interceptor in ./axios.js

export const getTrips = () => api.get('/trips');

export const getTrip = (id) => api.get(`/trips/${id}`);

export const createTrip = (tripData) => api.post('/trips', tripData);

export const updateTrip = (id, tripData) => api.put(`/trips/${id}`, tripData);

export const deleteTrip = (id) => api.delete(`/trips/${id}`);
