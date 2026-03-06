import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('ecoconnect-auth');
    const auth   = stored ? JSON.parse(stored) : {};
    const token  = auth?.state?.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (_) {}
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ecoconnect-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser = (d) => API.post('/auth/register', d);
export const loginUser    = (d) => API.post('/auth/login', d);
export const getMe        = ()  => API.get('/auth/me');

// Citizen
export const schedulePickup   = (d)  => API.post('/citizen/pickup', d);
export const getMyPickups     = ()   => API.get('/citizen/pickups');
export const getPickupById    = (id) => API.get(`/citizen/pickup/${id}`);
export const cancelPickup     = (id) => API.put(`/citizen/pickup/${id}/cancel`);
export const submitReport     = (d)  => API.post('/citizen/report', d);
export const getEcoPoints     = ()   => API.get('/citizen/eco-points');
export const getLeaderboard   = ()   => API.get('/citizen/leaderboard');
export const getDropPoints    = ()   => API.get('/citizen/drop-points');

// Government
export const getAllRequests    = (s)  => API.get(`/government/requests${s ? `?status=${s}` : ''}`);
export const assignCollector  = (id, collectorId) => API.put(`/government/request/${id}/assign`, { collectorId });
export const updateReqStatus  = (id, status)      => API.put(`/government/request/${id}/status`, { status });
export const getFleet         = ()   => API.get('/government/fleet');
export const getAnalytics     = ()   => API.get('/government/analytics');
export const getComplaints    = (s)  => API.get(`/government/complaints${s ? `?status=${s}` : ''}`);
export const resolveComplaint = (id) => API.put(`/government/complaint/${id}/resolve`);
export const assignComplaint  = (id, assignedTo) => API.put(`/government/complaint/${id}/assign`, { assignedTo });

// Industry
export const declareWaste    = (d)  => API.post('/industry/declare', d);
export const getDeclarations = ()   => API.get('/industry/declarations');
export const createListing   = (d)  => API.post('/industry/listing', d);
export const getListings     = (q)  => API.get(`/industry/listings${q ? '?' + new URLSearchParams(q) : ''}`);
export const getMyListings   = ()   => API.get('/industry/my-listings');
export const deleteListing   = (id) => API.delete(`/industry/listing/${id}`);
export const getESGData      = ()   => API.get('/industry/esg');
export const getCompliance   = ()   => API.get('/industry/compliance');

// Notifications
export const getNotifications = ()   => API.get('/notifications');
export const markAllRead      = ()   => API.put('/notifications/read-all');
export const markRead         = (id) => API.put(`/notifications/${id}/read`);

export default API;
