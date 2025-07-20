import axios from 'axios';

// Mock user data for testing
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@quickzone.tn',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'QuickZone',
    role: 'Administration',
    permissions: {
      dashboard: true,
      personnel: {
        administration: true,
        commercial: true,
        finance: true,
        chef_agence: true,
        membre_agence: true,
        livreurs: true
      },
      expediteur: true,
      colis: true,
      pickup: true,
      secteurs: true,
      entrepots: true,
      paiment_expediteur: true,
      reclamation: true
    }
  },
  {
    id: 2,
    username: 'marie',
    email: 'marie@quickzone.tn',
    password: 'marie123',
    firstName: 'Marie',
    lastName: 'Dupont',
    role: 'Administration',
    permissions: {
      dashboard: true,
      personnel: {
        administration: true,
        commercial: true,
        finance: true,
        chef_agence: true,
        membre_agence: true,
        livreurs: true
      },
      expediteur: true,
      colis: true,
      pickup: true,
      secteurs: true,
      entrepots: true,
      paiment_expediteur: true,
      reclamation: true
    }
  },
  {
    id: 3,
    username: 'pierre',
    email: 'pierre@quickzone.tn',
    password: 'pierre123',
    firstName: 'Pierre',
    lastName: 'Dubois',
    role: 'Commercial',
    permissions: {
      dashboard: true,
      personnel: {
        commercial: true
      },
      expediteur: true,
      colis: true,
      pickup: true,
      secteurs: true,
      reclamation: true
    }
  },
  {
    id: 4,
    username: 'sophie',
    email: 'sophie@quickzone.tn',
    password: 'sophie123',
    firstName: 'Sophie',
    lastName: 'Martin',
    role: 'Commercial',
    permissions: {
      dashboard: true,
      personnel: {
        commercial: true
      },
      expediteur: true,
      colis: true,
      pickup: true,
      secteurs: true,
      reclamation: true
    }
  },
  {
    id: 5,
    username: 'claude',
    email: 'claude@quickzone.tn',
    password: 'claude123',
    firstName: 'Claude',
    lastName: 'Bernard',
    role: 'Finance',
    permissions: {
      dashboard: true,
      personnel: {
        finance: true
      },
      paiment_expediteur: true
    }
  },
  {
    id: 6,
    username: 'isabelle',
    email: 'isabelle@quickzone.tn',
    password: 'isabelle123',
    firstName: 'Isabelle',
    lastName: 'Leroy',
    role: 'Finance',
    permissions: {
      dashboard: true,
      personnel: {
        finance: true
      },
      paiment_expediteur: true
    }
  },
  {
    id: 7,
    username: 'francois',
    email: 'francois@quickzone.tn',
    password: 'francois123',
    firstName: 'François',
    lastName: 'Petit',
    role: 'Chef d\'agence',
    permissions: {
      dashboard: true,
      personnel: {
        chef_agence: true,
        membre_agence: true,
        livreurs: true
      },
      expediteur: true,
      colis: true,
      pickup: true,
      secteurs: true,
      entrepots: true,
      reclamation: true
    }
  },
  {
    id: 8,
    username: 'nathalie',
    email: 'nathalie@quickzone.tn',
    password: 'nathalie123',
    firstName: 'Nathalie',
    lastName: 'Moreau',
    role: 'Chef d\'agence',
    permissions: {
      dashboard: true,
      personnel: {
        chef_agence: true,
        membre_agence: true,
        livreurs: true
      },
      expediteur: true,
      colis: true,
      pickup: true,
      secteurs: true,
      entrepots: true,
      reclamation: true
    }
  },
  {
    id: 9,
    username: 'thomas',
    email: 'thomas@quickzone.tn',
    password: 'thomas123',
    firstName: 'Thomas',
    lastName: 'Leroy',
    role: 'Membre de l\'agence',
    permissions: {
      dashboard: true,
      colis: true,
      pickup: true,
      reclamation: true
    }
  },
  {
    id: 10,
    username: 'celine',
    email: 'celine@quickzone.tn',
    password: 'celine123',
    firstName: 'Céline',
    lastName: 'Rousseau',
    role: 'Membre de l\'agence',
    permissions: {
      dashboard: true,
      colis: true,
      pickup: true,
      reclamation: true
    }
  },
  {
    id: 11,
    username: 'marc',
    email: 'marc@quickzone.tn',
    password: 'marc123',
    firstName: 'Marc',
    lastName: 'Simon',
    role: 'Livreurs',
    permissions: {
      dashboard: true,
      pickup: true
    }
  },
  {
    id: 12,
    username: 'laurent',
    email: 'laurent@quickzone.tn',
    password: 'laurent123',
    firstName: 'Laurent',
    lastName: 'Girard',
    role: 'Livreurs',
    permissions: {
      dashboard: true,
      pickup: true
    }
  },
  {
    id: 13,
    username: 'expediteur1',
    email: 'expediteur1@quickzone.tn',
    password: 'expediteur123',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'Expéditeur',
    permissions: {
      dashboard: true,
      colis: true,
      paiment_expediteur: true,
      reclamation: true
    }
  },
  {
    id: 14,
    username: 'expediteur2',
    email: 'expediteur2@quickzone.tn',
    password: 'expediteur123',
    firstName: 'Marie',
    lastName: 'Martin',
    role: 'Expéditeur',
    permissions: {
      dashboard: true,
      colis: true,
      paiment_expediteur: true,
      reclamation: true
    }
  }
];

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
      console.log('Login attempt with:', { email: credentials.email });
      const response = await api.post('/auth/login', credentials);
      
      console.log('Login response:', response);
      
      if (response && response.success) {
        const { accessToken, user } = response.data;
        
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        
        return response;
      } else {
        throw new Error(response?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Provide more specific error messages
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 400) {
        throw new Error('Please provide valid email and password');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred. Please try again.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  },

  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    // Redirect to login page
    window.location.href = '/';
    return { success: true };
  },

  // Parcels (Colis)
  getParcels: async (page = 1, limit = 100) => {
    try {
      const response = await api.get(`/parcels?page=${page}&limit=${limit}`);
      console.log('Parcels API response:', response.data);
      
      // Handle different response formats
      if (response.data?.data?.parcels) {
        return response.data.data.parcels;
      } else if (response.data?.parcels) {
        return response.data.parcels;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected parcels response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Get parcels error:', error);
      return [];
    }
  },

  // Get single parcel by ID
  getParcel: async (id) => {
    try {
      console.log('🔍 Calling getParcel with ID:', id);
      const response = await api.get(`/parcels/${id}`);
      console.log('📡 Raw API response:', response);
      console.log('📡 Response type:', typeof response);
      console.log('📡 Response keys:', Object.keys(response || {}));
      
      // The axios interceptor already extracts response.data, so we get { success: true, data: {...} }
      if (response && response.success === true && response.data) {
        console.log('✅ Success format - returning data');
        return response.data;
      } else if (response && response.data) {
        console.log('✅ Data format - returning data');
        return response.data;
      } else if (response) {
        console.log('✅ Direct response format - returning response');
        return response;
      } else {
        console.warn('❌ Unexpected response format:', response);
        return null;
      }
    } catch (error) {
      console.error('❌ Get parcel error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      return null;
    }
  },

  // Get parcels for a specific expéditeur
  getExpediteurParcels: async (email, page = 1, limit = 1000) => {
    try {
      const response = await api.get(`/parcels/expediteur/${encodeURIComponent(email)}?page=${page}&limit=${limit}`);
      console.log('Expediteur parcels API response:', response.data);
      
      // Handle different response formats
      if (response.data?.data?.parcels) {
        return response.data.data.parcels;
      } else if (response.data?.parcels) {
        return response.data.parcels;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected expediteur parcels response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Get expediteur parcels error:', error);
      return [];
    }
  },

  // Get expediteur dashboard statistics
  getExpediteurStats: async (email) => {
    try {
      const response = await api.get(`/parcels/expediteur/${encodeURIComponent(email)}/stats`);
      console.log('Expediteur stats API response:', response.data);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.warn('Unexpected expediteur stats response format:', response.data);
        return {
          totalParcels: 0,
          totalRevenue: 0,
          currentMonth: 0,
          deliveredThisMonth: 0,
          complaintsCount: 0,
          monthlyChanges: { parcels: 0, delivered: 0 },
          statusStats: {}
        };
      }
    } catch (error) {
      console.error('Get expediteur stats error:', error);
      return {
        totalParcels: 0,
        totalRevenue: 0,
        totalRevenue: 0,
        currentMonth: 0,
        deliveredThisMonth: 0,
        complaintsCount: 0,
        monthlyChanges: { parcels: 0, delivered: 0 },
        statusStats: {}
      };
    }
  },

  // Get expediteur payments
  getExpediteurPayments: async (email, page = 1, limit = 1000) => {
    try {
      const response = await api.get(`/payments/expediteur/${encodeURIComponent(email)}?page=${page}&limit=${limit}`);
      console.log('Expediteur payments API response:', response);
      
      if (response.success && response.data) {
        if (response.data.payments) {
          // New format with pagination
          return response.data.payments;
        } else {
          // Old format - direct array
          return response.data;
        }
      } else {
        console.warn('Unexpected expediteur payments response format:', response);
        return [];
      }
    } catch (error) {
      console.error('Get expediteur payments error:', error);
      return [];
    }
  },

  // Get all payments (for admin users)
  getAllPayments: async () => {
    try {
      const response = await api.get('/payments');
      console.log('All payments API response:', response);
      
      // Handle different response formats
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        console.warn('Unexpected all payments response format:', response);
        return [];
      }
    } catch (error) {
      console.error('Get all payments error:', error);
      return [];
    }
  },

  createParcel: async (parcelData) => {
    try {
      const response = await api.post('/parcels', parcelData);
      return response;
    } catch (error) {
      console.error('Create parcel error:', error);
      throw new Error('Failed to create parcel');
    }
  },

  updateParcel: async (id, updates) => {
    try {
      console.log('Updating parcel:', { id, updates });
      const response = await api.put(`/parcels/${id}`, updates);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update parcel error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw new Error('Failed to update parcel');
    }
  },

  deleteParcel: async (id) => {
    try {
      console.log('Deleting parcel:', id);
      const response = await api.delete(`/parcels/${id}`);
      console.log('Delete response:', response.data);
      return response.data || response;
    } catch (error) {
      console.error('Delete parcel error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw new Error('Failed to delete parcel');
    }
  },

  // Shippers (Expediteurs)
  getShippers: async () => {
    try {
      const response = await api.get('/shippers');
      console.log('Shippers response:', response);
      return response.data?.data?.shippers || response.data?.shippers || [];
    } catch (error) {
      console.error('Get shippers error:', error);
      return [];
    }
  },

  createShipper: async (shipperData) => {
    try {
      console.log('Creating shipper:', shipperData);
      
      // Check if shipperData is already a FormData object
      if (shipperData instanceof FormData) {
        console.log('shipperData is already FormData, using directly');
        console.log('=== API SERVICE DEBUG ===');
        console.log('FormData entries:', Array.from(shipperData.entries()));
        console.log('FormData keys:', Array.from(shipperData.keys()));
        console.log('FormData values:', Array.from(shipperData.values()));
        
        const response = await api.post('/shippers', shipperData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Create response:', response.data);
        return response.data;
      } else {
        // Create FormData for file upload (fallback for non-FormData input)
        const formData = new FormData();
        
        // Add text fields
        Object.keys(shipperData).forEach(key => {
          if (key !== 'id_document' && key !== 'company_documents') {
            formData.append(key, shipperData[key]);
          }
        });
        
        // Add files if they exist
        if (shipperData.id_document) {
          formData.append('id_document', shipperData.id_document);
        }
        if (shipperData.company_documents) {
          formData.append('company_documents', shipperData.company_documents);
        }
        
        console.log('=== API SERVICE DEBUG ===');
        console.log('FormData entries:', Array.from(formData.entries()));
        console.log('FormData keys:', Array.from(formData.keys()));
        console.log('FormData values:', Array.from(formData.values()));
        
        const response = await api.post('/shippers', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Create response:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Create shipper error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Provide more specific error messages
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 400) {
        throw new Error('Invalid data provided. Please check all required fields.');
      } else if (error.response?.status === 409) {
        throw new Error('A shipper with this email already exists');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred. Please try again.');
      } else {
        throw new Error('Failed to create shipper');
      }
    }
  },

  updateShipper: async (id, updates) => {
    try {
      console.log('Updating shipper:', { id, updates });
      
      // Check if updates is already a FormData object
      if (updates instanceof FormData) {
        console.log('updates is already FormData, using directly');
        console.log('FormData entries:', Array.from(updates.entries()));
        
        const response = await api.put(`/shippers/${id}`, updates, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Update response:', response.data);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        return response.data;
      } else {
        // Create FormData for file upload (fallback for non-FormData input)
        const formData = new FormData();
        
        // Add text fields
        Object.keys(updates).forEach(key => {
          if (key !== 'id_document' && key !== 'company_documents') {
            formData.append(key, updates[key]);
          }
        });
        
        // Add files if they exist
        if (updates.id_document) {
          formData.append('id_document', updates.id_document);
        }
        if (updates.company_documents) {
          formData.append('company_documents', updates.company_documents);
        }
        
        console.log('FormData entries:', Array.from(formData.entries()));
        
        const response = await api.put(`/shippers/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Update response:', response.data);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        return response.data;
      }
    } catch (error) {
      console.error('Update shipper error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Provide more specific error messages
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 404) {
        throw new Error('Shipper not found');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid data provided');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred. Please try again.');
      } else {
        throw new Error('Failed to update shipper');
      }
    }
  },

  deleteShipper: async (id) => {
    try {
      const response = await api.delete(`/shippers/${id}`);
      return response;
    } catch (error) {
      console.error('Delete shipper error:', error);
      throw new Error('Failed to delete shipper');
    }
  },

  deleteShipperWithDependencies: async (id) => {
    try {
      const response = await api.delete(`/shippers/${id}/with-dependencies`);
      return response.data || response;
    } catch (error) {
      console.error('Delete shipper with dependencies error:', error);
      throw new Error('Failed to delete shipper with dependencies');
    }
  },

  // Payment management functions
  getShipperPayments: async (shipperId) => {
    try {
      const response = await api.get(`/payments/shipper/${shipperId}`);
      return response.data;
    } catch (error) {
      console.error('Get shipper payments error:', error);
      throw new Error('Failed to fetch shipper payments');
    }
  },

  deletePayment: async (paymentId) => {
    try {
      const response = await api.delete(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Delete payment error:', error);
      throw new Error('Failed to delete payment');
    }
  },

  createPayment: async (paymentData) => {
    try {
      console.log('Creating payment with data:', paymentData);
      const response = await api.post('/payments', paymentData);
      console.log('Create payment response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create payment error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 400) {
        throw new Error('Invalid payment data provided');
      } else if (error.response?.status === 404) {
        throw new Error('Shipper not found');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred. Please try again.');
      } else {
        throw new Error('Failed to create payment');
      }
    }
  },

  deleteAllShipperPayments: async (shipperId) => {
    try {
      // First get all payments for this shipper
      const paymentsResponse = await api.get(`/payments/shipper/${shipperId}`);
      const payments = paymentsResponse.data.data || [];
      
      // Delete each payment
      const deletePromises = payments.map(payment => 
        api.delete(`/payments/${payment.id}`)
      );
      
      await Promise.all(deletePromises);
      
      return {
        success: true,
        message: `Successfully deleted ${payments.length} payments`,
        deletedCount: payments.length
      };
    } catch (error) {
      console.error('Delete all shipper payments error:', error);
      throw new Error('Failed to delete shipper payments');
    }
  },

  // Drivers (Livreurs)
  getDrivers: async () => {
    try {
      console.log('🔍 Fetching drivers from API...');
      const response = await api.get('/personnel/livreurs');
      console.log('📡 API Response:', response);
      console.log('📡 Response.data:', response.data);
      
      const drivers = response.data || [];
      console.log('🚗 Drivers array:', drivers);
      console.log('🚗 Drivers count:', drivers.length);
      
      return drivers;
    } catch (error) {
      console.error('Get drivers error:', error);
      console.error('Error response:', error.response);
      return [];
    }
  },

  createDriver: async (driverData) => {
    try {
      const response = await api.post('/personnel/livreurs', driverData);
      return response.data || response;
    } catch (error) {
      console.error('Create driver error:', error);
      throw error;
    }
  },

  updateDriver: async (id, driverData) => {
    try {
      const response = await api.put(`/personnel/livreurs/${id}`, driverData);
      return response.data || response;
    } catch (error) {
      console.error('Update driver error:', error);
      throw error;
    }
  },

  deleteDriver: async (id) => {
    try {
      const response = await api.delete(`/personnel/livreurs/${id}`);
      return response.data || response;
    } catch (error) {
      console.error('Delete driver error:', error);
      throw error;
    }
  },

  // File upload functions
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Uploading file:', file.name, 'Size:', file.size);
      
      // Use axios directly (not the configured instance) to avoid response interceptor
      const response = await axios.post('http://localhost:5000/api/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout for file uploads
      });
      
      console.log('Upload response:', response.data);
      
      // Check if the response has the expected structure
      if (response.data && response.data.success) {
        return response.data;
      } else {
        console.error('Unexpected response structure:', response.data);
        throw new Error('Upload failed - unexpected response');
      }
    } catch (error) {
      console.error('Upload file error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // If it's a network error or server error, provide a more specific message
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      } else if (error.response?.status === 413) {
        throw new Error('File too large. Maximum size is 10MB.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Upload failed');
      }
    }
  },

  uploadMultipleFiles: async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Use axios directly (not the configured instance) to avoid response interceptor
      const response = await axios.post('http://localhost:5000/api/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout for file uploads
      });
      
      return response.data;
    } catch (error) {
      console.error('Upload files error:', error);
      throw new Error('Upload failed');
    }
  },



  // Commercials
  getCommercials: async () => {
    try {
      const response = await api.get('/personnel/commercials');
      return response.data || [];
    } catch (error) {
      console.error('Get commercials error:', error);
      return [];
    }
  },

  // Admin Dashboard
  getAdminDashboard: async () => {
    try {
      const response = await api.get('/dashboard/admin');
      return response;
    } catch (error) {
      console.error('Get admin dashboard error:', error);
      return null;
    }
  },

  // Admin Profile
  getAdminProfile: async () => {
    try {
      const response = await api.get('/admin/profile');
      return response.data;
    } catch (error) {
      console.error('Get admin profile error:', error);
      return null;
    }
  },

  updateAdminProfile: async (profileData) => {
    try {
      const response = await api.put('/admin/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update admin profile error:', error);
      throw new Error('Failed to update admin profile');
    }
  },

  // Administration Management
  getAdministrators: async () => {
    try {
      const response = await api.get('/personnel/administrators');
      return response.data || [];
    } catch (error) {
      console.error('Get administrators error:', error);
      return [];
    }
  },

  createAdministrator: async (adminData) => {
    try {
      const response = await api.post('/personnel/administrators', adminData);
      return response;
    } catch (error) {
      console.error('Create administrator error:', error);
      throw new Error('Failed to create administrator');
    }
  },

  updateAdministrator: async (id, adminData) => {
    try {
      const response = await api.put(`/personnel/administrators/${id}`, adminData);
      return response;
    } catch (error) {
      console.error('Update administrator error:', error);
      throw new Error('Failed to update administrator');
    }
  },

  deleteAdministrator: async (id) => {
    try {
      const response = await api.delete(`/personnel/administrators/${id}`);
      return response;
    } catch (error) {
      console.error('Delete administrator error:', error);
      throw new Error('Failed to delete administrator');
    }
  },

  // Commercial Management
  createCommercial: async (commercialData) => {
    try {
      const response = await api.post('/personnel/commercials', commercialData);
      return response;
    } catch (error) {
      console.error('Create commercial error:', error);
      throw new Error('Failed to create commercial');
    }
  },

  updateCommercial: async (id, commercialData) => {
    try {
      const response = await api.put(`/personnel/commercials/${id}`, commercialData);
      return response;
    } catch (error) {
      console.error('Update commercial error:', error);
      throw new Error('Failed to update commercial');
    }
  },

  deleteCommercial: async (id) => {
    try {
      const response = await api.delete(`/personnel/commercials/${id}`);
      return response;
    } catch (error) {
      console.error('Delete commercial error:', error);
      throw new Error('Failed to delete commercial');
    }
  },

  // Get shippers by commercial ID
  getShippersByCommercial: async (commercialId) => {
    try {
      const response = await api.get(`/personnel/commercials/${commercialId}/shippers`);
      return response.data || [];
    } catch (error) {
      console.error('Get shippers by commercial error:', error);
      return [];
    }
  },

  // Get payments for shippers of a specific commercial
  getCommercialPayments: async (commercialId, params = {}) => {
    try {
      const response = await api.get(`/personnel/commercials/${commercialId}/payments`, { params });
      return response.data || { payments: [], pagination: {} };
    } catch (error) {
      console.error('Get commercial payments error:', error);
      return { payments: [], pagination: {} };
    }
  },

  // Get parcels for shippers of a specific commercial
  getCommercialParcels: async (commercialId, params = {}) => {
    try {
      const response = await api.get(`/personnel/commercials/${commercialId}/parcels`, { params });
      return response.data || { parcels: [], pagination: {} };
    } catch (error) {
      console.error('Get commercial parcels error:', error);
      return { parcels: [], pagination: {} };
    }
  },

  // Get complaints for shippers of a specific commercial
  getCommercialComplaints: async (commercialId, page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });
      
      const response = await api.get(`/complaints/commercial/${commercialId}?${params}`);
      return response.data || { complaints: [], pagination: {} };
    } catch (error) {
      console.error('Get commercial complaints error:', error);
      return { complaints: [], pagination: {} };
    }
  },

  // Get commercial statistics
  getCommercialStats: async (commercialId) => {
    try {
      const response = await api.get(`/personnel/commercials/${commercialId}/stats`);
      return response.data || {};
    } catch (error) {
      console.error('Get commercial stats error:', error);
      return {};
    }
  },

  // Get commercial's own payments (commissions, salaries, bonuses)
  getCommercialOwnPayments: async (commercialId) => {
    try {
      const response = await api.get(`/personnel/commercials/${commercialId}/own-payments`);
      return response.data || { payments: [], pagination: {} };
    } catch (error) {
      console.error('Get commercial own payments error:', error);
      return { payments: [], pagination: {} };
    }
  },

  // Create commercial payment
  createCommercialPayment: async (commercialId, paymentData) => {
    try {
      const response = await api.post(`/personnel/commercials/${commercialId}/payments`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Create commercial payment error:', error);
      throw error;
    }
  },

  // Update commercial payment
  updateCommercialPayment: async (commercialId, paymentId, paymentData) => {
    try {
      const response = await api.put(`/personnel/commercials/${commercialId}/payments/${paymentId}`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Update commercial payment error:', error);
      throw error;
    }
  },

  // Delete commercial payment
  deleteCommercialPayment: async (commercialId, paymentId) => {
    try {
      const response = await api.delete(`/personnel/commercials/${commercialId}/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Delete commercial payment error:', error);
      throw error;
    }
  },

  // Get commercial payment statistics
  getCommercialPaymentStats: async (commercialId) => {
    try {
      const response = await api.get(`/personnel/commercials/${commercialId}/payment-stats`);
      return response.data || {};
    } catch (error) {
      console.error('Get commercial payment stats error:', error);
      return {};
    }
  },

  // Get all commercials for admin dropdown
  getCommercials: async () => {
    try {
      const response = await api.get('/personnel/commercials');
      return response.data || [];
    } catch (error) {
      console.error('Get commercials error:', error);
      return [];
    }
  },

  // Get shipper details with payments and parcels
  getShipperDetails: async (shipperId) => {
    try {
      const response = await api.get(`/shippers/${shipperId}/details`);
      return response.data;
    } catch (error) {
      console.error('Get shipper details error:', error);
      throw error;
    }
  },

  // Finance Management
  getComptables: async () => {
    try {
      console.log('🔍 Making API call to /personnel/accountants...');
      const response = await api.get('/personnel/accountants');
      console.log('🔍 Raw response from accountants API:', response);
      console.log('📊 Response data:', response.data);
      console.log('📋 Data array:', response.data);
      const result = response.data || [];
      console.log('📋 Final result:', result);
      return result;
    } catch (error) {
      console.error('❌ Get comptables error:', error);
      console.error('❌ Error details:', error.response?.data);
      return [];
    }
  },

  createComptable: async (comptableData) => {
    try {
      const response = await api.post('/personnel/accountants', comptableData);
      return response;
    } catch (error) {
      console.error('Create comptable error:', error);
      throw new Error('Failed to create comptable');
    }
  },

  updateComptable: async (id, comptableData) => {
    try {
      const response = await api.put(`/personnel/accountants/${id}`, comptableData);
      return response;
    } catch (error) {
      console.error('Update comptable error:', error);
      throw new Error('Failed to update comptable');
    }
  },

  deleteComptable: async (id) => {
    try {
      const response = await api.delete(`/personnel/accountants/${id}`);
      return response;
    } catch (error) {
      console.error('Delete comptable error:', error);
      throw new Error('Failed to delete comptable');
    }
  },

  // Agency Members Management
  getAgencyMembers: async () => {
    try {
      const response = await api.get('/personnel/agency-members');
      return response.data;
    } catch (error) {
      console.error('Get agency members error:', error);
      return [];
    }
  },

  createAgencyMember: async (memberData) => {
    try {
      const response = await api.post('/personnel/agency-members', memberData);
      return response;
    } catch (error) {
      console.error('Create agency member error:', error);
      throw new Error('Failed to create agency member');
    }
  },

  updateAgencyMember: async (id, memberData) => {
    try {
      const response = await api.put(`/personnel/agency-members/${id}`, memberData);
      return response;
    } catch (error) {
      console.error('Update agency member error:', error);
      throw new Error('Failed to update agency member');
    }
  },

  deleteAgencyMember: async (id) => {
    try {
      const response = await api.delete(`/personnel/agency-members/${id}`);
      return response;
    } catch (error) {
      console.error('Delete agency member error:', error);
      throw new Error('Failed to delete agency member');
    }
  },

  updateAgencyManager: async (id, data) => {
    try {
      const response = await api.put(`/personnel/agency-managers/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update agency manager error:', error);
      throw error;
    }
  },

  // Sectors CRUD
  getSectors: async () => {
    try {
      const response = await api.get('/sectors');
      console.log('Frontend getSectors response:', response);
      return response.data || [];
    } catch (error) {
      console.error('Get sectors error:', error);
      return [];
    }
  },
  createSector: async (sectorData) => {
    try {
      const response = await api.post('/sectors', sectorData);
      return response.data;
    } catch (error) {
      console.error('Create sector error:', error);
      throw error;
    }
  },
  updateSector: async (id, sectorData) => {
    try {
      const response = await api.put(`/sectors/${id}`, sectorData);
      return response.data;
    } catch (error) {
      console.error('Update sector error:', error);
      throw error;
    }
  },
  deleteSector: async (id) => {
    try {
      const response = await api.delete(`/sectors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete sector error:', error);
      throw error;
    }
  },
  // Agency managers for dropdown
  getAgencyManagers: async () => {
    try {
      const response = await api.get('/personnel/agency-managers');
      console.log('Agency managers response:', response);
      // The backend returns { success: true, data: [...], pagination: {...} }
      // We need to return just the data array
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Get agency managers error:', error);
      return [];
    }
  },

  // Create agency manager
  createAgencyManager: async (managerData) => {
    try {
      console.log('🔧 Frontend: Creating agency manager with data:', managerData);
      const response = await api.post('/personnel/agency-managers', managerData);
      console.log('🔧 Frontend: Raw response:', response);
      console.log('🔧 Frontend: Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create agency manager error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update agency manager
  updateAgencyManager: async (id, managerData) => {
    try {
      console.log('🔧 Frontend: Updating agency manager with data:', { id, managerData });
      const response = await api.put(`/personnel/agency-managers/${id}`, managerData);
      console.log('🔧 Frontend: Update response:', response);
      return response.data;
    } catch (error) {
      console.error('Update agency manager error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Delete agency manager
  deleteAgencyManager: async (id) => {
    try {
      const response = await api.delete(`/personnel/agency-managers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete agency manager error:', error);
      throw error;
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
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return {
        parcels: { total: 0, delivered: 0 },
        shippers: { total: 0 },
        drivers: { total: 0, active: 0 },
        revenue: { monthly: 0 }
      };
    }
  },

  // Agencies
  getAgencies: async () => {
    try {
      const response = await api.get('/agencies');
      console.log('Agencies response:', response);
      return response || [];
    } catch (error) {
      console.error('Get agencies error:', error);
      return [];
    }
  },

  // Complaints
  getComplaints: async (page = 1, limit = 10, filters = {}, user = null) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      // Get user info from localStorage if not provided
      let userInfo = user;
      if (!userInfo) {
        try {
          const currentUserStr = localStorage.getItem('currentUser');
          if (currentUserStr) {
            userInfo = JSON.parse(currentUserStr);
            console.log('🔍 User from localStorage:', userInfo);
          } else {
            console.warn('No user found in localStorage');
          }
        } catch (e) {
          console.warn('Failed to get user from localStorage:', e);
        }
      }
      
      // Prepare headers with user info
      const headers = {};
      console.log('🔍 User parameter received:', user);
      console.log('🔍 User from store:', userInfo);
      console.log('🔍 User type:', typeof userInfo);
      console.log('🔍 User keys:', userInfo ? Object.keys(userInfo) : 'null');
      
      if (userInfo && userInfo.email && userInfo.role) {
        headers['user-email'] = userInfo.email;
        headers['user-role'] = userInfo.role;
        console.log('✅ Headers prepared:', headers);
      } else {
        console.warn('⚠️ No valid user found, headers will be empty');
        console.warn('⚠️ User object:', userInfo);
        console.warn('⚠️ User email:', userInfo?.email);
        console.warn('⚠️ User role:', userInfo?.role);
      }
      
      console.log('🔍 Calling complaints API with params:', params.toString());
      console.log('👤 User info in headers:', { email: userInfo?.email, role: userInfo?.role });
      
      const response = await api.get(`/complaints?${params}`, { headers });
      console.log('📡 Raw complaints response:', response);
      
      // The response interceptor returns response.data, so we need to check the structure
      if (response && response.success && response.data) {
        console.log('✅ Complaints data found:', response.data);
        return response.data;
      } else {
        console.warn('⚠️ Unexpected complaints response format:', response);
        return { complaints: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
      }
    } catch (error) {
      console.error('❌ Get complaints error:', error);
      return { complaints: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
    }
  },

  getExpediteurComplaints: async (email, page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await api.get(`/complaints/expediteur/${encodeURIComponent(email)}?${params}`);
      console.log('Expediteur complaints response:', response);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.warn('Unexpected expediteur complaints response format:', response);
        return { complaints: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
      }
    } catch (error) {
      console.error('Get expediteur complaints error:', error);
      return { complaints: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
    }
  },

  getComplaint: async (id) => {
    try {
      const response = await api.get(`/complaints/${id}`);
      console.log('Single complaint response:', response);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.warn('Unexpected single complaint response format:', response);
        return null;
      }
    } catch (error) {
      console.error('Get complaint error:', error);
      return null;
    }
  },

  createComplaint: async (complaintData) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(complaintData).forEach(key => {
        if (key !== 'attachments') {
          formData.append(key, complaintData[key]);
        }
      });
      
      // Add files
      if (complaintData.attachments && complaintData.attachments.length > 0) {
        complaintData.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }
      
      console.log('Sending complaint data:', Object.fromEntries(formData));
      
      const response = await api.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Create complaint response:', response);
      return response;
    } catch (error) {
      console.error('Create complaint error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        throw new Error(error.response.data.message || 'Failed to create complaint');
      }
      throw new Error('Failed to create complaint');
    }
  },

  updateComplaint: async (id, updates) => {
    try {
      const response = await api.put(`/complaints/${id}`, updates);
      console.log('Update complaint response:', response);
      return response;
    } catch (error) {
      console.error('Update complaint error:', error);
      throw new Error('Failed to update complaint');
    }
  },

  deleteComplaint: async (id) => {
    try {
      const response = await api.delete(`/complaints/${id}`);
      console.log('Delete complaint response:', response);
      return response;
    } catch (error) {
      console.error('Delete complaint error:', error);
      throw new Error('Failed to delete complaint');
    }
  }
};

// Export complaints functions
export const {
  getComplaints,
  getExpediteurComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint
} = apiService;

// Warehouses API functions
export const warehousesService = {
  getWarehouses: async () => {
    try {
      console.log('🔍 Calling warehouses API...');
      const response = await api.get('/warehouses');
      console.log('📡 Warehouses API response:', response);
      console.log('📡 Response data type:', typeof response.data);
      console.log('📡 Response data keys:', Object.keys(response.data || {}));
      console.log('📡 Full response data:', response.data);
      // response.data contains the actual API response (with success and data properties)
      return response.data;
    } catch (error) {
      console.error('❌ Warehouses API error:', error);
      return { success: false, data: [] };
    }
  },

  getWarehouseDetails: async (id) => {
    try {
      console.log('🔍 Calling warehouse details API for ID:', id);
      const response = await api.get(`/warehouses/${id}`);
      console.log('📡 Warehouse details API response:', response);
      // response.data contains the actual API response (with success and data properties)
      return response.data;
    } catch (error) {
      console.error('❌ Warehouse details API error:', error);
      return { success: false, data: null };
    }
  },

  createWarehouse: async (warehouseData) => {
    try {
      console.log('🚀 createWarehouse called with data:', warehouseData);
      const response = await api.post('/warehouses', warehouseData);
      console.log('📡 createWarehouse response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ createWarehouse error:', error);
      throw error;
    }
  },

  updateWarehouse: async (id, warehouseData) => {
    try {
      console.log('🔄 updateWarehouse called with id:', id, 'data:', warehouseData);
      const response = await api.put(`/warehouses/${id}`, warehouseData);
      console.log('📡 updateWarehouse response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ updateWarehouse error:', error);
      throw error;
    }
  },

  deleteWarehouse: async (id) => {
    try {
      console.log('🗑️ deleteWarehouse called with id:', id);
      const response = await api.delete(`/warehouses/${id}`);
      console.log('📡 deleteWarehouse response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ deleteWarehouse error:', error);
      throw error;
    }
  }
}; 

// Missions de collecte (missions_pickup)
export const missionsPickupService = {
  getMissionsPickup: async (params = {}) => {
    try {
      console.log('🔍 Calling missions-pickup API with params:', params);
      const response = await api.get('/missions-pickup', { params });
      console.log('📡 Missions API response:', response);
      console.log('📡 Missions data:', response.data);
      
      // Return the full response data structure
      return response.data;
    } catch (error) {
      console.error('❌ Missions API error:', error);
      return { success: false, data: [] };
    }
  },
  createMissionPickup: async (data) => {
    try {
      console.log('🚀 createMissionPickup called with data:', data);
      const response = await api.post('/missions-pickup', data);
      console.log('📡 createMissionPickup response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ createMissionPickup error:', error);
      throw error;
    }
  },
  updateMissionPickup: async (id, data) => {
    try {
      console.log('🔄 updateMissionPickup called with id:', id, 'data:', data);
      const response = await api.put(`/missions-pickup/${id}`, data);
      console.log('📡 updateMissionPickup response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ updateMissionPickup error:', error);
      throw error;
    }
  },
  deleteMissionPickup: async (id) => {
    const response = await api.delete(`/missions-pickup/${id}`);
    return response.data;
  },
  
  getMissionSecurityCode: async (id) => {
    try {
      console.log('🔐 getMissionSecurityCode called with id:', id);
      const response = await api.get(`/missions-pickup/${id}/security-code`);
      console.log('📡 Security code response:', response);
      console.log('📡 Response data:', response.data);
      console.log('📡 Response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ getMissionSecurityCode error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },
}; 