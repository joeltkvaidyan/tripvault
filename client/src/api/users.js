import api from './axios';

// Public — no auth required, works even if there's no token in localStorage
export const getPublicProfile = (username) => api.get(`/users/${username}/profile`);

// Private — updates the logged-in user's bio and/or username
export const updateMyProfile = (payload) => api.put('/users/profile', payload);
