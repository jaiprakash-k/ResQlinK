// Simple API client for ResQlinK backend
import { APP_CONFIG } from '../utils/constants';

const BASE_URL = APP_CONFIG.BACKEND_URL || 'http://localhost:4000';

// Test server connectivity
export async function testConnectivity() {
  try {
    console.log('Testing connectivity to:', BASE_URL);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('✅ Backend connectivity test successful');
      return true;
    } else {
      console.log('❌ Backend responded with error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend connectivity test failed:', error.message);
    return false;
  }
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    console.log(`API Request: ${method} ${BASE_URL}${path}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const data = await res.json();
    
    if (!res.ok) {
      console.error(`API Error ${res.status}:`, data);
      throw new Error(data.message || `API error: ${res.status}`);
    }
    
    console.log(`API Success: ${method} ${BASE_URL}${path}`);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Connection timeout: Server took too long to respond');
      throw new Error('Connection timeout. Server is not responding.');
    }
    
    if (error.message === 'Network request failed' || error.message.includes('TypeError')) {
      console.error('Network Error: Cannot connect to backend server');
      console.error('Please check:');
      console.error('1. Backend server is running on:', BASE_URL);
      console.error('2. Your device can reach the server');
      console.error('3. No firewall is blocking the connection');
      console.error('4. WiFi/mobile data is working');
      throw new Error('Cannot connect to server. Please check your connection and try again.');
    }
    throw error;
  }
}
