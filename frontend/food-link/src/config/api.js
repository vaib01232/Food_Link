// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
  },
  DONATIONS: {
    BASE: `${API_BASE_URL}/donations`,
    CLAIM: (id) => `${API_BASE_URL}/donations/${id}/claim`,
  },
};

export default API_BASE_URL;
