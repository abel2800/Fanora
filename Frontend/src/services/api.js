import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      Cookies.remove('token')
      window.location.href = '/auth/login'
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.')
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.')
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  verifyEmail: (token) => api.post(`/auth/verify-email/${token}`),
  resendVerification: () => api.post('/auth/resend-verification'),
  changePassword: (data) => api.post('/auth/change-password', data),
  sendOtp: (data) => api.post('/auth/send-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
}

// Users API
export const usersAPI = {
  getProfile: (username) => api.get(`/users/profile/${username}`),
  updateProfile: (data) => api.put('/users/profile', data),
  followUser: (userId) => api.post(`/users/follow/${userId}`),
  unfollowUser: (userId) => api.post(`/users/unfollow/${userId}`),
  getFollowing: (userId) => api.get(`/users/following/${userId}`),
  getFollowers: (userId) => api.get(`/users/followers/${userId}`),
  getMyFollowing: () => api.get('/users/me/following'),
  getSettings: () => api.get('/users/me/settings'),
  updateSettings: (data) => api.put('/users/me/settings', data),
  registerDeviceToken: (data) => api.post('/users/me/device-token', data),
}

// Creators API
export const creatorsAPI = {
  becomeCreator: () => api.post('/creators/apply'),
  getCreators: (params) => api.get('/creators', { params }),
  getDashboard: (creatorId) => api.get(`/creators/${creatorId}/dashboard`),
  getInsights: (params) => api.get('/creators/me/insights', { params }),
  getReferral: () => api.get('/creators/me/referral'),
  applyReferral: (data) => api.post('/creators/referral/apply', data),
}

// Add becomeCreator to authAPI as well
authAPI.becomeCreator = () => api.post('/creators/apply')

// Content API
export const contentAPI = {
  createContent: (data) => api.post('/content', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getContent: (contentId) => api.get(`/content/${contentId}`),
  getFeed: (params) => api.get('/content/feed', { params }),
  getCreatorContent: (creatorId, params) => api.get(`/content/creator/${creatorId}`, { params }),
  getTrending: (params) => api.get('/content/trending', { params }),
  updateContent: (contentId, data) => api.put(`/content/${contentId}`, data),
  deleteContent: (contentId) => api.delete(`/content/${contentId}`),
  likeContent: (contentId) => api.post(`/content/${contentId}/like`),
  unlikeContent: (contentId) => api.delete(`/content/${contentId}/like`),
  addComment: (contentId, data) => api.post(`/content/${contentId}/comments`, data),
  getComments: (contentId, params) => api.get(`/content/${contentId}/comments`, { params }),
  deleteComment: (contentId, commentId) => api.delete(`/content/${contentId}/comments/${commentId}`),
  purchaseContent: (contentId) => api.post(`/content/${contentId}/purchase`),
  getMyPurchases: () => api.get('/content/purchases/my'),
  getCalendar: (params) => api.get('/content/calendar/mine', { params }),
  updateCalendarItem: (id, data) => api.patch(`/content/calendar/${id}`, data),
}

// Subscriptions API
export const subscriptionsAPI = {
  createPlan: (data) => api.post('/subscriptions/plans', data),
  getCreatorPlans: (creatorId) => api.get(`/subscriptions/plans/creator/${creatorId}`),
  getMyPlans: () => api.get('/subscriptions/plans/my'),
  updatePlan: (planId, data) => api.put(`/subscriptions/plans/${planId}`, data),
  deletePlan: (planId) => api.delete(`/subscriptions/plans/${planId}`),
  subscribe: (planId, data) => api.post(`/subscriptions/subscribe/${planId}`, data),
  cancelSubscription: (subscriptionId, data) => api.post(`/subscriptions/cancel/${subscriptionId}`, data),
  pauseSubscription: (subscriptionId) => api.post(`/subscriptions/pause/${subscriptionId}`),
  getMySubscriptions: () => api.get('/subscriptions/my'),
  getSubscribers: (planId, params) => api.get(`/subscriptions/subscribers/${planId}`, { params }),
  getEarnings: (params) => api.get('/subscriptions/earnings', { params }),
  getPopularPlans: (params) => api.get('/subscriptions/popular', { params }),
}

// Wallet API
export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  setPin: (data) => api.post('/wallet/set-pin', data),
  verifyPin: (data) => api.post('/wallet/verify-pin', data),
  linkTelebirr: (data) => api.post('/wallet/link-telebirr', data),
  linkCBE: (data) => api.post('/wallet/link-cbe', data),
  topupTelebirr: (data) => api.post('/wallet/topup/telebirr', data),
  topupCBE: (data) => api.post('/wallet/topup/cbe', data),
  confirmTopup: (transactionId) => api.post(`/wallet/topup/confirm/${transactionId}`),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  getPaymentMethods: () => api.get('/wallet/payment-methods'),
  withdraw: (data) => api.post('/wallet/withdraw', data),
}

// Payments API
export const paymentsAPI = {
  getPaymentStatus: (transactionId) => api.get(`/payments/status/${transactionId}`),
  requestRefund: (transactionId, data) => api.post(`/payments/refund/${transactionId}`, data),
  getAnalytics: (params) => api.get('/payments/analytics', { params }),
}

// Messages API
export const messagesAPI = {
  getConversations: (params) => api.get('/messages/conversations', { params }),
  getConversation: (userId) => api.get(`/messages/conversations/${userId}`),
  sendMessage: (userId, data) => api.post(`/messages/send/${userId}`, data),
  getMessages: (userId, params) => api.get(`/messages/${userId}`, { params }),
  markAsRead: (conversationId) => api.post(`/messages/read/${conversationId}`),
  deleteConversation: (userId) => api.delete(`/messages/conversations/${userId}`),
  searchMessages: (query) => api.get('/messages/search', { params: { q: query } }),
  sendBlast: (data) => api.post('/messages/blast', data),
  unlockMessage: (messageId, data) => api.post(`/messages/${messageId}/unlock`, data),
}

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.post(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
}

// Tips API
export const tipsAPI = {
  sendTip: (creatorId, data) => api.post(`/tips/send/${creatorId}`, data),
  getTipsSent: (params) => api.get('/tips/sent', { params }),
  getTipsReceived: (params) => api.get('/tips/received', { params }),
  getTipsHistory: (params) => api.get('/tips/history', { params }),
  getStats: () => api.get('/tips/stats'),
}

// Stories API
export const storiesAPI = {
  getFeed: () => api.get('/stories'),
  getCreatorStories: (creatorId) => api.get(`/stories/creator/${creatorId}`),
  createStory: (data) => api.post('/stories', data),
  getStory: (storyId) => api.get(`/stories/${storyId}`),
  deleteStory: (storyId) => api.delete(`/stories/${storyId}`),
}

// Search API
export const searchAPI = {
  search: (params) => api.get('/search', { params }),
}

export const liveAPI = {
  list: () => api.get('/live'),
  get: (id) => api.get(`/live/${id}`),
  start: (data) => api.post('/live/start', data),
  end: (id) => api.post(`/live/${id}/end`),
}

export const uploadAPI = {
  uploadFile: async (file, folder = 'uploads') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export const bundlesAPI = {
  getCreatorBundles: (creatorId) => api.get(`/bundles/creator/${creatorId}`),
  getMyBundles: () => api.get('/bundles/my'),
  createBundle: (data) => api.post('/bundles', data),
  updateBundle: (id, data) => api.put(`/bundles/${id}`, data),
  deleteBundle: (id) => api.delete(`/bundles/${id}`),
  purchaseBundle: (id, data) => api.post(`/bundles/${id}/purchase`, data),
}

export const trustAPI = {
  getReports: () => api.get('/trust/reports'),
  submitReport: (data) => api.post('/trust/report', data),
  getBlocked: () => api.get('/trust/blocked'),
  blockUser: (userId) => api.post(`/trust/block/${userId}`),
  unblockUser: (userId) => api.delete(`/trust/block/${userId}`),
}

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getVerificationQueue: () => api.get('/admin/verification-queue'),
  reviewVerification: (userId, data) => api.post(`/admin/verification/${userId}`, data),
  getModerationQueue: () => api.get('/admin/moderation-queue'),
  reviewContent: (contentId, data) => api.post(`/admin/moderation/${contentId}`, data),
  getPayoutQueue: () => api.get('/admin/payout-queue'),
  reviewPayout: (transactionId, data) => api.post(`/admin/payout/${transactionId}`, data),
  getDisputes: () => api.get('/admin/disputes'),
  resolveDispute: (reportId, data) => api.post(`/admin/disputes/${reportId}`, data),
}

export const requestsAPI = {
  getMine: () => api.get('/requests/mine'),
  getInbox: () => api.get('/requests/inbox'),
  create: (data) => api.post('/requests', data),
  respond: (id, data) => api.patch(`/requests/${id}/respond`, data),
  pay: (id, data) => api.post(`/requests/${id}/pay`, data),
  deliver: (id, data) => api.patch(`/requests/${id}/deliver`, data),
}

export const giftsAPI = {
  getMine: () => api.get('/gifts/mine'),
  create: (data) => api.post('/gifts', data),
  redeem: (data) => api.post('/gifts/redeem', data),
}

export const creatorOnboardingAPI = {
  get: () => api.get('/creator-onboarding'),
  updateIdentity: (data) => api.put('/creator-onboarding/identity', data),
  analyze: () => api.post('/creator-onboarding/analyze'),
  updatePayout: (data) => api.put('/creator-onboarding/payout', data),
  submit: (data) => api.post('/creator-onboarding/submit', data),
}

export const mediaSecurityAPI = {
  getWatermark: (contentId) => api.get(`/media-security/watermark/${contentId}`),
  reportEvent: (data) => api.post('/media-security/event', data),
  getEvents: () => api.get('/media-security/events'),
}

export const wishlistAPI = {
  getAll: () => api.get('/wishlist'),
  status: (contentId) => api.get(`/wishlist/${contentId}/status`),
  add: (contentId) => api.post(`/wishlist/${contentId}`),
  remove: (contentId) => api.delete(`/wishlist/${contentId}`),
}

export default api
