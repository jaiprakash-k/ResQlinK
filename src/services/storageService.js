import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

class StorageService {
  constructor() {
    this.cache = new Map();
  }

  // Generic storage methods
  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      this.cache.set(key, value);
      console.log(`Stored item: ${key}`);
      return true;
    } catch (error) {
      console.error(`Error storing item ${key}:`, error);
      return false;
    }
  }

  async getItem(key, defaultValue = null) {
    try {
      // Check cache first
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }

      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue !== null) {
        const value = JSON.parse(jsonValue);
        this.cache.set(key, value);
        return value;
      }
      return defaultValue;
    } catch (error) {
      console.error(`Error retrieving item ${key}:`, error);
      return defaultValue;
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      this.cache.delete(key);
      console.log(`Removed item: ${key}`);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      return false;
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
      this.cache.clear();
      console.log('Cleared all storage');
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // User Settings
  async getUserSettings() {
    return await this.getItem(STORAGE_KEYS.USER_SETTINGS, {
      darkMode: true,
      bluetoothEnabled: true,
      wifiEnabled: true,
      locationEnabled: true,
      notificationsEnabled: true,
      emergencyContacts: [],
    });
  }

  async setUserSettings(settings) {
    return await this.setItem(STORAGE_KEYS.USER_SETTINGS, settings);
  }

  // Emergency Contacts
  async getEmergencyContacts() {
    return await this.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS, []);
  }

  async setEmergencyContacts(contacts) {
    return await this.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, contacts);
  }

  async addEmergencyContact(contact) {
    const contacts = await this.getEmergencyContacts();
    contacts.push({
      id: Date.now().toString(),
      ...contact,
      timestamp: new Date().toISOString(),
    });
    return await this.setEmergencyContacts(contacts);
  }

  async removeEmergencyContact(contactId) {
    const contacts = await this.getEmergencyContacts();
    const filteredContacts = contacts.filter(contact => contact.id !== contactId);
    return await this.setEmergencyContacts(filteredContacts);
  }

  // Messages
  async getMessages() {
    return await this.getItem(STORAGE_KEYS.MESSAGES, []);
  }

  async setMessages(messages) {
    return await this.setItem(STORAGE_KEYS.MESSAGES, messages);
  }

  async addMessage(message) {
    const messages = await this.getMessages();
    messages.push({
      id: Date.now().toString(),
      ...message,
      timestamp: new Date().toISOString(),
    });
    return await this.setMessages(messages);
  }

  async clearMessages() {
    return await this.setMessages([]);
  }

  // Alerts
  async getAlerts() {
    return await this.getItem(STORAGE_KEYS.ALERTS, []);
  }

  async setAlerts(alerts) {
    return await this.setItem(STORAGE_KEYS.ALERTS, alerts);
  }

  async addAlert(alert) {
    const alerts = await this.getAlerts();
    alerts.push({
      id: Date.now().toString(),
      ...alert,
      timestamp: new Date().toISOString(),
    });
    return await this.setAlerts(alerts);
  }

  async removeAlert(alertId) {
    const alerts = await this.getAlerts();
    const filteredAlerts = alerts.filter(alert => alert.id !== alertId);
    return await this.setAlerts(filteredAlerts);
  }

  async clearAlerts() {
    return await this.setAlerts([]);
  }

  // Location History
  async getLocationHistory() {
    return await this.getItem(STORAGE_KEYS.LOCATION_HISTORY, []);
  }

  async setLocationHistory(history) {
    return await this.setItem(STORAGE_KEYS.LOCATION_HISTORY, history);
  }

  async addLocationToHistory(location) {
    const history = await this.getLocationHistory();
    history.push({
      id: Date.now().toString(),
      ...location,
      timestamp: new Date().toISOString(),
    });
    
    // Keep only last 100 locations
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    return await this.setLocationHistory(history);
  }

  async clearLocationHistory() {
    return await this.setLocationHistory([]);
  }

  // Dark Mode
  async getDarkMode() {
    return await this.getItem(STORAGE_KEYS.DARK_MODE, true);
  }

  async setDarkMode(enabled) {
    return await this.setItem(STORAGE_KEYS.DARK_MODE, enabled);
  }

  // Bluetooth Enabled
  async getBluetoothEnabled() {
    return await this.getItem(STORAGE_KEYS.BLUETOOTH_ENABLED, true);
  }

  async setBluetoothEnabled(enabled) {
    return await this.setItem(STORAGE_KEYS.BLUETOOTH_ENABLED, enabled);
  }

  // Wi-Fi Enabled
  async getWiFiEnabled() {
    return await this.getItem(STORAGE_KEYS.WIFI_ENABLED, true);
  }

  async setWiFiEnabled(enabled) {
    return await this.setItem(STORAGE_KEYS.WIFI_ENABLED, enabled);
  }

  // Export data for backup
  async exportData() {
    try {
      const data = {
        userSettings: await this.getUserSettings(),
        emergencyContacts: await this.getEmergencyContacts(),
        messages: await this.getMessages(),
        alerts: await this.getAlerts(),
        locationHistory: await this.getLocationHistory(),
        exportTimestamp: new Date().toISOString(),
      };
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  // Import data from backup
  async importData(data) {
    try {
      if (data.userSettings) await this.setUserSettings(data.userSettings);
      if (data.emergencyContacts) await this.setEmergencyContacts(data.emergencyContacts);
      if (data.messages) await this.setMessages(data.messages);
      if (data.alerts) await this.setAlerts(data.alerts);
      if (data.locationHistory) await this.setLocationHistory(data.locationHistory);
      
      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Get storage usage info
  async getStorageInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const info = {
        totalKeys: keys.length,
        cacheSize: this.cache.size,
        keys: keys,
      };
      return info;
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }
}

// Export singleton instance
export default new StorageService();
