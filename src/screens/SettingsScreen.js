import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '../utils/theme';
import { APP_CONFIG } from '../utils/constants';
import EmergencyButton from '../components/EmergencyButton';
import StatusIndicator from '../components/StatusIndicator';
import storageService from '../services/storageService';
import bleService from '../services/bleService';
import wifiService from '../services/wifiService';
import locationService from '../services/locationService';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    darkMode: true,
    bluetoothEnabled: true,
    wifiEnabled: true,
    locationEnabled: true,
    notificationsEnabled: true,
  });
  const [bleStatus, setBleStatus] = useState('disconnected');
  const [wifiStatus, setWifiStatus] = useState('offline');
  const [locationStatus, setLocationStatus] = useState('inactive');

  useEffect(() => {
    loadSettings();
    checkServiceStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await storageService.getUserSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const checkServiceStatus = async () => {
    try {
      const bleEnabled = await bleService.isBluetoothEnabled();
      setBleStatus(bleEnabled ? 'connected' : 'disconnected');

      const wifiEnabled = await wifiService.isWiFiEnabled();
      setWifiStatus(wifiEnabled ? 'online' : 'offline');

      const locationEnabled = await locationService.isLocationServicesEnabled();
      setLocationStatus(locationEnabled ? 'active' : 'inactive');
    } catch (error) {
      console.error('Error checking service status:', error);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await storageService.setUserSettings(newSettings);
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const handleBluetoothToggle = (value) => {
    updateSetting('bluetoothEnabled', value);
    if (value) {
      bleService.initialize();
    } else {
      bleService.destroy();
    }
  };

  const handleWiFiToggle = (value) => {
    updateSetting('wifiEnabled', value);
    if (value) {
      wifiService.initialize();
    } else {
      wifiService.destroy();
    }
  };

  const handleLocationToggle = (value) => {
    updateSetting('locationEnabled', value);
    if (value) {
      if (locationService && typeof locationService.initialize === 'function') {
        locationService.initialize();
      } else {
        console.warn('locationService.initialize is not available');
      }
    } else {
      locationService.destroy();
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will clear all stored messages, alerts, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clear();
              await loadSettings();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const data = await storageService.exportData();
      Alert.alert(
        'Data Export',
        `Exported ${Object.keys(data).length} data categories. Data is stored locally.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data.');
    }
  };

  const SettingItem = ({ title, description, value, onValueChange, status }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
        {status && (
          <StatusIndicator
            status={status}
            size="small"
            style={styles.statusIndicator}
          />
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor={value ? COLORS.text : COLORS.textTertiary}
      />
    </View>
  );

  return (
    <SafeAreaView style={COMMON_STYLES.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Configure your emergency network</Text>
        </View>

        {/* Service Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Status</Text>
          <View style={styles.statusContainer}>
            <StatusIndicator
              status={bleStatus}
              label="Bluetooth"
              size="medium"
            />
            <StatusIndicator
              status={wifiStatus}
              label="Wi-Fi Mesh"
              size="medium"
            />
            <StatusIndicator
              status={locationStatus}
              label="Location"
              size="medium"
            />
          </View>
        </View>

        {/* Network Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network Settings</Text>
          
          <SettingItem
            title="Bluetooth"
            description="Enable Bluetooth mesh networking"
            value={settings.bluetoothEnabled}
            onValueChange={handleBluetoothToggle}
            status={bleStatus}
          />
          
          <SettingItem
            title="Wi-Fi Mesh"
            description="Enable Wi-Fi mesh networking"
            value={settings.wifiEnabled}
            onValueChange={handleWiFiToggle}
            status={wifiStatus}
          />
          
          <SettingItem
            title="Location Services"
            description="Enable GPS location tracking"
            value={settings.locationEnabled}
            onValueChange={handleLocationToggle}
            status={locationStatus}
          />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <SettingItem
            title="Dark Mode"
            description="Use dark theme for better visibility"
            value={settings.darkMode}
            onValueChange={(value) => updateSetting('darkMode', value)}
          />
          
          <SettingItem
            title="Notifications"
            description="Enable emergency notifications"
            value={settings.notificationsEnabled}
            onValueChange={(value) => updateSetting('notificationsEnabled', value)}
          />
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <View style={styles.buttonContainer}>
            <EmergencyButton
              title="Export Data"
              onPress={handleExportData}
              variant="secondary"
              size="medium"
              style={styles.dataButton}
            />
            
            <EmergencyButton
              title="Clear All Data"
              onPress={handleClearData}
              variant="warning"
              size="medium"
              style={styles.dataButton}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Name:</Text>
              <Text style={styles.infoValue}>{APP_CONFIG.APP_NAME}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version:</Text>
              <Text style={styles.infoValue}>{APP_CONFIG.VERSION}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Emergency Phone:</Text>
              <Text style={styles.infoValue}>{APP_CONFIG.EMERGENCY_PHONE}</Text>
            </View>
          </View>
        </View>

        {/* Back Button */}
        <View style={styles.backSection}>
          <EmergencyButton
            title="← Back to Home"
            onPress={() => navigation.goBack()}
            variant="primary"
            size="medium"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  
  title: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.sm,
  },
  
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
    textAlign: 'center',
  },
  
  section: {
    marginBottom: SPACING.xl,
  },
  
  sectionTitle: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.md,
  },
  
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
  },
  
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  
  settingTitle: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: SPACING.xs,
  },
  
  settingDescription: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.sm,
  },
  
  statusIndicator: {
    marginTop: SPACING.xs,
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  dataButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  
  infoContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
  },
  
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  
  infoValue: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  
  backSection: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
});

export default SettingsScreen;
