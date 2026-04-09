import axios from 'axios'

const BASE_URL = '/api'

const getAxios = (token) => axios.create({
  baseURL: BASE_URL,
  headers: token ? { Authorization: `Bearer ${token}` } : {},
})

// Auth
export const registerUser = (data) => getAxios().post('/auth/register', data)
export const verifyEmail = (data) => getAxios().post('/auth/verify-email', data)
export const resendOTP = (data) => getAxios().post('/auth/resend-otp', data)
export const loginUser = (data) => getAxios().post('/auth/login', data)
export const forgotPassword = (data) => getAxios().post('/auth/forgot-password', data)
export const resetPassword = (data) => getAxios().post('/auth/reset-password', data)

// Citizen
export const getCitizenProfile = (token) => getAxios(token).get('/citizen/profile')
export const updateCitizenProfile = (token, data) => getAxios(token).put('/citizen/profile', data)
export const changePassword = (token, data) => getAxios(token).put('/citizen/change-password', data)
export const schedulePickup = (token, data) => getAxios(token).post('/citizen/pickup', data)
export const getPickups = (token) => getAxios(token).get('/citizen/pickups')
export const cancelPickup = (token, id) => getAxios(token).put(`/citizen/pickup/${id}/cancel`)
export const reportIssue = (token, data) => getAxios(token).post('/citizen/report-issue', data)
export const getIssues = (token) => getAxios(token).get('/citizen/issues')
export const classifyWaste = (token, data) => getAxios(token).post('/citizen/classify', data)
export const getLeaderboard = (token, filter) => getAxios(token).get(`/citizen/leaderboard?filter=${filter || 'all'}`)
export const getNearbyIndustries = (token) => getAxios(token).get('/citizen/nearby-industries')
export const getDumpingGrounds = (token) => getAxios(token).get('/citizen/dumping-grounds')

// Tracker
export const trackPickup = (token, requestId) => getAxios(token).get(`/tracker/${requestId}`)
export const getFleetData = (token, zone) => getAxios(token).get(`/tracker/fleet/${zone}`)
export const updateCollectorLocation = (token, data) => getAxios(token).put('/tracker/location', data)

// Officer
export const getOfficerDashboard = (token) => getAxios(token).get('/officer/dashboard')
export const getOfficerRequests = (token) => getAxios(token).get('/officer/requests')
export const getFreeCollectors = (token) => getAxios(token).get('/officer/free-collectors')
export const assignCollector = (token, id, collectorId) => getAxios(token).put(`/officer/request/${id}/assign`, { collectorId })
export const getComplaints = (token) => getAxios(token).get('/officer/complaints')
export const assignComplaint = (token, id, collectorId) => getAxios(token).put(`/officer/complaint/${id}/assign`, { collectorId })
export const resolveComplaint = (token, id, notes) => getAxios(token).put(`/officer/complaint/${id}/resolve`, { resolveNotes: notes })
export const getIndustryRequests = (token) => getAxios(token).get('/officer/industry-requests')
export const assignIndustryRequest = (token, id, collectorId) => getAxios(token).put(`/officer/industry-request/${id}/assign`, { collectorId })
export const getOfficerAnalytics = (token) => getAxios(token).get('/officer/analytics')
export const getESGReports = (token) => getAxios(token).get('/officer/esg-reports')

// Collector
export const toggleDuty = (token, data) => getAxios(token).put('/collector/duty-toggle', data)
export const getMyPickups = (token) => getAxios(token).get('/collector/my-pickups')
export const updatePickupStatus = (token, id, status) => getAxios(token).put(`/collector/pickup/${id}/status`, { status })
export const getCollectorProfile = (token) => getAxios(token).get('/collector/profile')
export const updateLocation = (token, data) => getAxios(token).put('/collector/location', data)

// Industry
export const declareWaste = (token, data) => getAxios(token).post('/industry/declare', data)
export const getDeclarations = (token) => getAxios(token).get('/industry/declarations')
export const getMarketplace = (token, wasteType) => getAxios(token).get(`/industry/marketplace${wasteType ? '?wasteType=' + wasteType : ''}`)
export const createListing = (token, data) => getAxios(token).post('/industry/marketplace', data)
export const updateListing = (token, id, data) => getAxios(token).put(`/industry/marketplace/${id}`, data)
export const deleteListing = (token, id) => getAxios(token).delete(`/industry/marketplace/${id}`)
export const expressInterest = (token, id) => getAxios(token).post(`/industry/marketplace/${id}/interest`)
export const getNearbyIndustriesForIndustry = (token) => getAxios(token).get('/industry/nearby-industries')
export const getIndustryTransferRequests = (token) => getAxios(token).get('/industry/transfer-requests')
export const createTransferRequest = (token, data) => getAxios(token).post('/industry/transfer-request', data)
export const updateTransferRequest = (token, id, status) => getAxios(token).put(`/industry/transfer-request/${id}`, { status })
export const getIndustryESGReport = (token) => getAxios(token).get('/industry/esg-report')
export const getIndustryAnalytics = (token) => getAxios(token).get('/industry/analytics')

// Chat
export const sendChatMessage = (token, message, history) =>
  getAxios(token).post('/chat', { message, history });
// Notifications
export const getNotifications = (token) => getAxios(token).get('/notifications')
export const markNotificationsRead = (token) => getAxios(token).put('/notifications/mark-read')
export const deleteNotification = (token, id) => getAxios(token).delete(`/notifications/${id}`)
