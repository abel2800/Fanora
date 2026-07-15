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
}

// Users API
export const usersAPI = {
  getProfile: (username) => api.get(`/users/profile/${username}`),
  updateProfile: (data) => api.put('/users/profile', data),
  followUser: (userId) => api.post(`/users/follow/${userId}`),
  unfollowUser: (userId) => api.post(`/users/unfollow/${userId}`),
}

// Creators API
export const creatorsAPI = {
  becomeCreator: () => api.post('/creators/apply'),
  getCreators: (params) => api.get('/creators', { params }),
  getDashboard: (creatorId) => api.get(`/creators/${creatorId}/dashboard`),
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
}

// Subscriptions API
export const subscriptionsAPI = {
  createPlan: (data) => api.post('/subscriptions/plans', data),
  getCreatorPlans: (creatorId) => api.get(`/subscriptions/plans/creator/${creatorId}`),
  getMyPlans: () => api.get('/subscriptions/plans/my'),
  updatePlan: (planId, data) => api.put(`/subscriptions/plans/${planId}`, data),
  deletePlan: (planId) => api.delete(`/subscriptions/plans/${planId}`),
  subscribe: (planId, data) => api.post(`/subscriptions/subscribe/${planId}`, data),
  cancelSubscription: (subscriptionId) => api.post(`/subscriptions/cancel/${subscriptionId}`),
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
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  getPaymentMethods: () => api.get('/wallet/payment-methods'),
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

export const uploadAPI = {
  uploadFile: async (file, type = 'image') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export default api
