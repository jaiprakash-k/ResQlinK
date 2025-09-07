// ResQlinK App Constants
export const APP_CONFIG = {
  APP_NAME: 'ResQlinK',
  VERSION: '1.0.0',
  EMERGENCY_PHONE: '911',
};

// BLE Configuration
export const BLE_CONFIG = {
  SERVICE_UUID: '12345678-1234-1234-1234-123456789ABC',
  CHARACTERISTIC_UUID: '87654321-4321-4321-4321-CBA987654321',
  DEVICE_NAME_PREFIX: 'ResQlinK_',
  SCAN_TIMEOUT: 10000, // 10 seconds
  CONNECTION_TIMEOUT: 5000, // 5 seconds
};

// Wi-Fi Configuration
export const WIFI_CONFIG = {
  MESH_NETWORK_NAME: 'ResQlinK_Mesh',
  DEFAULT_PORT: 8080,
  DISCOVERY_TIMEOUT: 5000,
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_SETTINGS: 'user_settings',
  EMERGENCY_CONTACTS: 'emergency_contacts',
  MESSAGES: 'messages',
  ALERTS: 'alerts',
  LOCATION_HISTORY: 'location_history',
  DARK_MODE: 'dark_mode',
  BLUETOOTH_ENABLED: 'bluetooth_enabled',
  WIFI_ENABLED: 'wifi_enabled',
};

// Message Types
export const MESSAGE_TYPES = {
  SOS: 'sos',
  ALERT: 'alert',
  CHAT: 'chat',
  LOCATION: 'location',
  STATUS: 'status',
};

// Emergency Levels
export const EMERGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Colors for emergency levels
export const EMERGENCY_COLORS = {
  [EMERGENCY_LEVELS.LOW]: '#4CAF50',
  [EMERGENCY_LEVELS.MEDIUM]: '#FF9800',
  [EMERGENCY_LEVELS.HIGH]: '#F44336',
  [EMERGENCY_LEVELS.CRITICAL]: '#9C27B0',
};

// Test Data
export const TEST_DATA = {
  SAMPLE_ALERTS: [
    {
      id: '1',
      type: MESSAGE_TYPES.SOS,
      level: EMERGENCY_LEVELS.CRITICAL,
      message: 'Emergency! Need immediate help!',
      location: { latitude: 37.7749, longitude: -122.4194 },
      timestamp: new Date().toISOString(),
      sender: 'User_001',
      distance: '0.5 km',
    },
    {
      id: '2',
      type: MESSAGE_TYPES.ALERT,
      level: EMERGENCY_LEVELS.MEDIUM,
      message: 'Road blocked ahead, use alternate route',
      location: { latitude: 37.7849, longitude: -122.4094 },
      timestamp: new Date(Date.now() - 300000).toISOString(),
      sender: 'User_002',
      distance: '1.2 km',
    },
  ],
  SAMPLE_MESSAGES: [
    {
      id: '1',
      type: MESSAGE_TYPES.CHAT,
      message: 'Is everyone safe in this area?',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      sender: 'User_003',
      isOwn: false,
    },
    {
      id: '2',
      type: MESSAGE_TYPES.CHAT,
      message: 'Yes, we are all safe here. How about you?',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      sender: 'You',
      isOwn: true,
    },
  ],
};
