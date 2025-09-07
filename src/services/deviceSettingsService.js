// Device Settings Service - Controls device Bluetooth, WiFi, and Location
import { Platform, Alert } from 'react-native';
import { request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import SystemSetting from 'react-native-system-setting';

class DeviceSettingsService {
  constructor() {
    this.bluetoothEnabled = false;
    this.wifiEnabled = false;
    this.locationEnabled = false;
  }

  // Request necessary permissions
  async requestPermissions() {
    try {
      if (Platform.OS === 'android') {
        // Request Bluetooth permissions
        const bluetoothResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        
        // Request Location permissions
        const locationResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        
        return bluetoothResult === RESULTS.GRANTED && locationResult === RESULTS.GRANTED;
      } else if (Platform.OS === 'ios') {
        // Request Location permissions for iOS
        const locationResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        
        return locationResult === RESULTS.GRANTED;
      }
      return false;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // Check current Bluetooth status
  async getBluetoothStatus() {
    try {
      const isEnabled = await SystemSetting.isBluetoothEnabled();
      this.bluetoothEnabled = isEnabled;
      return isEnabled;
    } catch (error) {
      console.error('Error checking Bluetooth status:', error);
      // Fallback - assume it's disabled if we can't check
      this.bluetoothEnabled = false;
      return false;
    }
  }

  // Toggle Bluetooth
  async toggleBluetooth() {
    try {
      const currentStatus = await this.getBluetoothStatus();
      
      if (currentStatus) {
        // Turn off Bluetooth - guide to settings
        Alert.alert(
          'Turn off Bluetooth',
          'This will open settings to manually turn off Bluetooth.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => this.openBluetoothSettings() 
            }
          ]
        );
      } else {
        // Try to turn on Bluetooth
        try {
          const success = await SystemSetting.setBluetooth(true);
          if (success) {
            this.bluetoothEnabled = true;
            Alert.alert('Success', 'Bluetooth has been turned on.');
          } else {
            this.openBluetoothSettings();
          }
        } catch (setBluetoothError) {
          console.log('setBluetooth not available, opening settings instead');
          Alert.alert(
            'Bluetooth Settings',
            'Please manually turn on Bluetooth in the settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => this.openBluetoothSettings() 
              }
            ]
          );
        }
      }
      
      return await this.getBluetoothStatus();
    } catch (error) {
      console.error('Error toggling Bluetooth:', error);
      this.openBluetoothSettings();
      return false;
    }
  }

  // Check current WiFi status
  async getWifiStatus() {
    try {
      const isEnabled = await SystemSetting.isWifiEnabled();
      this.wifiEnabled = isEnabled;
      return isEnabled;
    } catch (error) {
      console.error('Error checking WiFi status:', error);
      // Fallback - assume it's disabled if we can't check
      this.wifiEnabled = false;
      return false;
    }
  }

  // Toggle WiFi
  async toggleWifi() {
    try {
      const currentStatus = await this.getWifiStatus();
      
      // Note: Modern Android versions restrict programmatic WiFi control
      // We'll guide users to settings instead
      Alert.alert(
        'WiFi Settings',
        `WiFi is currently ${currentStatus ? 'enabled' : 'disabled'}. Please use device settings to toggle WiFi.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => this.openWifiSettings() 
          }
        ]
      );
      
      return await this.getWifiStatus();
    } catch (error) {
      console.error('Error toggling WiFi:', error);
      this.openWifiSettings();
      return false;
    }
  }

  // Check current Location status
  async getLocationStatus() {
    try {
      const isEnabled = await SystemSetting.isLocationEnabled();
      this.locationEnabled = isEnabled;
      return isEnabled;
    } catch (error) {
      console.error('Error checking Location status:', error);
      // Fallback - assume it's disabled if we can't check
      this.locationEnabled = false;
      return false;
    }
  }

  // Toggle Location
  async toggleLocation() {
    try {
      Alert.alert(
        'Location Services',
        'This will open settings to toggle location services.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => this.openLocationSettings() 
          }
        ]
      );
      
      return await this.getLocationStatus();
    } catch (error) {
      console.error('Error toggling Location:', error);
      this.openLocationSettings();
      return false;
    }
  }

  // Open device Bluetooth settings
  async openBluetoothSettings() {
    try {
      if (Platform.OS === 'android') {
        await SystemSetting.openBluetoothSetting();
      } else {
        await openSettings();
      }
    } catch (error) {
      console.error('Error opening Bluetooth settings:', error);
      try {
        await openSettings();
      } catch (fallbackError) {
        console.error('Error opening general settings:', fallbackError);
        Alert.alert('Settings Error', 'Unable to open settings. Please manually navigate to Bluetooth settings.');
      }
    }
  }

  // Open device WiFi settings
  async openWifiSettings() {
    try {
      if (Platform.OS === 'android') {
        await SystemSetting.openWifiSetting();
      } else {
        await openSettings();
      }
    } catch (error) {
      console.error('Error opening WiFi settings:', error);
      try {
        await openSettings();
      } catch (fallbackError) {
        console.error('Error opening general settings:', fallbackError);
        Alert.alert('Settings Error', 'Unable to open settings. Please manually navigate to WiFi settings.');
      }
    }
  }

  // Open device Location settings
  async openLocationSettings() {
    try {
      if (Platform.OS === 'android') {
        await SystemSetting.openLocationSetting();
      } else {
        await openSettings();
      }
    } catch (error) {
      console.error('Error opening Location settings:', error);
      try {
        await openSettings();
      } catch (fallbackError) {
        console.error('Error opening general settings:', fallbackError);
        Alert.alert('Settings Error', 'Unable to open settings. Please manually navigate to Location settings.');
      }
    }
  }

  // Initialize and check all statuses
  async initialize() {
    try {
      await this.requestPermissions();
      
      const bluetoothStatus = await this.getBluetoothStatus();
      const wifiStatus = await this.getWifiStatus();
      const locationStatus = await this.getLocationStatus();
      
      return {
        bluetooth: bluetoothStatus,
        wifi: wifiStatus,
        location: locationStatus
      };
    } catch (error) {
      console.error('Error initializing device settings:', error);
      return {
        bluetooth: false,
        wifi: false,
        location: false
      };
    }
  }
}

export default new DeviceSettingsService();
