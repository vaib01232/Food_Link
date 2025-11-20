// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
    RESEND_VERIFICATION: `${API_BASE_URL}/auth/resend-verification`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    UPDATE_PHONE: `${API_BASE_URL}/auth/update-phone`,
    VERIFY_PHONE: `${API_BASE_URL}/auth/verify-phone`,
  },
  DONATIONS: {
    BASE: `${API_BASE_URL}/donations`,
    BY_ID: (id) => `${API_BASE_URL}/donations/${id}`,
    CLAIM: (id) => `${API_BASE_URL}/donations/${id}/claim`,
    CONFIRM_PICKUP: (id) => `${API_BASE_URL}/donations/${id}/confirm-pickup`,
    CANCEL_CLAIM: (id) => `${API_BASE_URL}/donations/${id}/cancel-claim`,
    CLAIMED: `${API_BASE_URL}/donations/claimed`,
    DELETE: (id) => `${API_BASE_URL}/donations/${id}`,
  },
  UPLOADS: {
    IMAGES: `${API_BASE_URL}/uploads/images`,
    IMAGE: `${API_BASE_URL}/uploads/image`,
  },
  NOTIFICATIONS: {
    BASE: `${API_BASE_URL}/notifications`,
    UNREAD_COUNT: `${API_BASE_URL}/notifications/unread-count`,
    MARK_READ: (id) => `${API_BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/mark-all-read`,
  },
};

export { BACKEND_BASE_URL };
export default API_BASE_URL;
