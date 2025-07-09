import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const apiService = {
  // Authentication
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.success) {
        localStorage.setItem('authToken', response.data.accessToken);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        return response.data;
      }
      throw new Error(response.error || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid credentials');
    }
  },

  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    return { success: true };
  },

  // Parcels (Colis)
  getParcels: async () => {
    try {
      const response = await api.get('/colis');
      return response.data.colis || [];
    } catch (error) {
      console.error('Get parcels error:', error);
      return [];
    }
  },

  createParcel: async (parcelData) => {
    try {
      const response = await api.post('/colis', parcelData);
      return response.data;
    } catch (error) {
      console.error('Create parcel error:', error);
      throw new Error('Failed to create parcel');
    }
  },

  updateParcel: async (id, updates) => {
    try {
      const response = await api.put(`/colis/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update parcel error:', error);
      throw new Error('Failed to update parcel');
    }
  },

  deleteParcel: async (id) => {
    try {
      const response = await api.delete(`/colis/${id}`);
      return response;
    } catch (error) {
      console.error('Delete parcel error:', error);
      throw new Error('Failed to delete parcel');
    }
  },

  // Shippers (Expediteurs)
  getShippers: async () => {
    try {
      const response = await api.get('/expediteurs');
      return response.data.expediteurs || [];
    } catch (error) {
      console.error('Get shippers error:', error);
      return [];
    }
  },

  createShipper: async (shipperData) => {
    try {
      const response = await api.post('/expediteurs', shipperData);
      return response.data;
    } catch (error) {
      console.error('Create shipper error:', error);
      throw new Error('Failed to create shipper');
    }
  },

  updateShipper: async (id, updates) => {
    try {
      const response = await api.put(`/expediteurs/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update shipper error:', error);
      throw new Error('Failed to update shipper');
    }
  },

  deleteShipper: async (id) => {
    try {
      const response = await api.delete(`/expediteurs/${id}`);
      return response;
    } catch (error) {
      console.error('Delete shipper error:', error);
      throw new Error('Failed to delete shipper');
    }
  },

  // Drivers (Livreurs)
  getDrivers: async () => {
    try {
      const response = await api.get('/livreurs');
      return response.data.livreurs || [];
    } catch (error) {
      console.error('Get drivers error:', error);
      return [];
    }
  },

  createDriver: async (driverData) => {
    try {
      const response = await api.post('/livreurs', driverData);
      return response.data;
    } catch (error) {
      console.error('Create driver error:', error);
      throw new Error('Failed to create driver');
    }
  },

  updateDriver: async (id, updates) => {
    try {
      const response = await api.put(`/livreurs/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update driver error:', error);
      throw new Error('Failed to update driver');
    }
  },

  deleteDriver: async (id) => {
    try {
      const response = await api.delete(`/livreurs/${id}`);
      return response;
    } catch (error) {
      console.error('Delete driver error:', error);
      throw new Error('Failed to delete driver');
    }
  },

  // Commercials
  getCommercials: async () => {
    try {
      const response = await api.get('/commercials');
      return response.data.commercials || [];
    } catch (error) {
      console.error('Get commercials error:', error);
      return [];
    }
  },

  // Users
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data.users || [];
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  },

  // Dashboard
  getDashboardStats: async () => {
    try {
      // For now, return mock stats since dashboard endpoint needs work
      return {
        totalParcels: 2,
        totalShippers: 2,
        totalDrivers: 2,
        totalCommercials: 2,
        recentParcels: [],
        recentActivity: []
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return {
        totalParcels: 0,
        totalShippers: 0,
        totalDrivers: 0,
        totalCommercials: 0,
        recentParcels: [],
        recentActivity: []
      };
    }
  }
}; 