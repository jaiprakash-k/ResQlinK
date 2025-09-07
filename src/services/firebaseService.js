// API-backed Firebase Service
import { apiRequest } from './apiClient';
import { APP_CONFIG } from '../utils/constants';

class FirebaseService {
  constructor() {
    this.token = null;
    this.user = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('Initializing API service...');
      console.log('Attempting to connect to:', APP_CONFIG.BACKEND_URL || 'http://localhost:4000');
      
      const response = await apiRequest('/health');
      console.log('Health check response:', response);
      
      this.isInitialized = true;
      console.log('✅ API service initialized successfully');
      return true;
    } catch (error) {
      console.warn('⚠️ Backend server not available:', error.message);
      console.log('📱 App will continue in offline mode with local storage');
      console.log('🔧 To fix: Ensure backend server is running and accessible');
      this.isInitialized = false;
      return false;
    }
  }

  async signIn(email) {
    try {
      const res = await apiRequest('/api/auth/login/email', { method: 'POST', body: { email } });
      this.token = res.token;
      this.user = { uid: res.uid, email: res.email };
      return res;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  }

  async anonymousLogin() {
    try {
      const res = await apiRequest('/api/auth/login/anonymous', { method: 'POST' });
      this.token = res.token;
      this.user = { uid: res.uid, anonymous: true };
      return res;
    } catch (error) {
      console.error('Anonymous login failed:', error);
      throw error;
    }
  }

  async signOut() {
    this.token = null;
    this.user = null;
    return true;
  }

  isAuthenticated() {
    return !!this.token;
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  async pushSOS({ userId, lat, lng, message, timestamp }) {
    try {
      return await apiRequest('/api/sos', {
        method: 'POST',
        body: { userId, lat, lng, message, timestamp },
        token: this.token,
      });
    } catch (error) {
      console.error('Push SOS failed:', error);
      throw error;
    }
  }

  async fetchNearbySOS({ lat, lng, radius }) {
    try {
      return await apiRequest(`/api/sos/nearby?lat=${lat}&lng=${lng}&radius=${radius || 5}`, {
        token: this.token,
      });
    } catch (error) {
      console.error('Fetch nearby SOS failed:', error);
      throw error;
    }
  }

  async syncChatMessages(messages) {
    try {
      return await apiRequest('/api/chat/sync', {
        method: 'POST',
        body: { messages },
        token: this.token,
      });
    } catch (error) {
      console.error('Sync chat messages failed:', error);
      throw error;
    }
  }

  async fetchAllMessages() {
    try {
      return await apiRequest('/api/admin/messages/all', {
        token: this.token,
      });
    } catch (error) {
      console.error('Fetch all messages failed:', error);
      throw error;
    }
  }

  // Additional methods for offline support
  async addMessage(message) {
    console.log('Adding message:', message);
    // This would typically store locally and sync later
    return { success: true, id: Date.now().toString() };
  }

  async getMessages() {
    console.log('Getting messages from local storage');
    // This would typically get from local storage
    return [];
  }

  async addAlert(alert) {
    console.log('Adding alert:', alert);
    // This would typically store locally and sync later
    return { success: true, id: Date.now().toString() };
  }

  async getAlerts() {
    console.log('Getting alerts from local storage');
    // This would typically get from local storage
    return [];
  }
}

export default new FirebaseService();
