import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '../utils/theme';
import { APP_CONFIG } from '../utils/constants';
import EmergencyButton from '../components/EmergencyButton';
import StatusIndicator from '../components/StatusIndicator';
import bleService from '../services/bleService';
import wifiService from '../services/wifiService';
import locationService from '../services/locationService';
import firebaseService from '../services/firebaseService';
import deviceSettingsService from '../services/deviceSettingsService';

const HomeScreen = ({ navigation }) => {
  const [bleStatus, setBleStatus] = useState('disconnected');
  const [wifiStatus, setWifiStatus] = useState('offline');
  const [locationStatus, setLocationStatus] = useState('inactive');
  const [apiStatus, setApiStatus] = useState('offline');

  useEffect(() => {
    initializeServices();
    return () => {
      // Cleanup on unmount
    };
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize API service
      const apiInitialized = await firebaseService.initialize();
      setApiStatus(apiInitialized ? 'online' : 'offline');

      // Initialize device settings and get current statuses
      const deviceStatuses = await deviceSettingsService.initialize();
      setBleStatus(deviceStatuses.bluetooth ? 'connected' : 'disconnected');
      setWifiStatus(deviceStatuses.wifi ? 'online' : 'offline');
      setLocationStatus(deviceStatuses.location ? 'active' : 'inactive');

      // Initialize BLE service
      try {
        const bleInitialized = await bleService.initialize();
        if (!deviceStatuses.bluetooth) {
          setBleStatus('disconnected');
        } else {
          setBleStatus(bleInitialized ? 'connected' : 'disconnected');
        }
      } catch (err) {
        console.error('Error initializing BLE service:', err);
        setBleStatus('disconnected');
      }

      // Initialize Wi-Fi service
      try {
        const wifiInitialized = await wifiService.initialize();
        if (!deviceStatuses.wifi) {
          setWifiStatus('offline');
        } else {
          setWifiStatus(wifiInitialized ? 'online' : 'offline');
        }
      } catch (err) {
        console.error('Error initializing WiFi service:', err);
        setWifiStatus('offline');
      }

      // Initialize Location service
      try {
        if (locationService && typeof locationService.initialize === 'function') {
          const locationInitialized = await locationService.initialize();
          if (!deviceStatuses.location) {
            setLocationStatus('inactive');
          } else {
            setLocationStatus(locationInitialized ? 'active' : 'inactive');
          }
        } else {
          console.warn('locationService.initialize is not available');
          setLocationStatus(deviceStatuses.location ? 'active' : 'inactive');
        }
      } catch (err) {
        console.error('Error initializing locationService:', err);
        setLocationStatus('inactive');
      }
    } catch (error) {
      console.error('Error initializing services:', error);
    }
  };

  // Toggle functions for device settings
  const handleBluetoothToggle = async () => {
    try {
      setBleStatus('connecting');
      const newStatus = await deviceSettingsService.toggleBluetooth();
      setBleStatus(newStatus ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Error toggling Bluetooth:', error);
      setBleStatus('disconnected');
    }
  };

  const handleWifiToggle = async () => {
    try {
      setWifiStatus('loading');
      const newStatus = await deviceSettingsService.toggleWifi();
      setWifiStatus(newStatus ? 'online' : 'offline');
    } catch (error) {
      console.error('Error toggling WiFi:', error);
      setWifiStatus('offline');
    }
  };

  const handleLocationToggle = async () => {
    try {
      setLocationStatus('loading');
      const newStatus = await deviceSettingsService.toggleLocation();
      setLocationStatus(newStatus ? 'active' : 'inactive');
    } catch (error) {
      console.error('Error toggling Location:', error);
      setLocationStatus('inactive');
    }
  };

  const handleSOSPress = () => {
    Alert.alert(
      'Emergency SOS',
      'This will send an emergency SOS message with your location to all nearby devices. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send SOS', 
          style: 'destructive',
          onPress: () => navigation.navigate('SOS')
        },
      ]
    );
  };

  const handleAlertsPress = () => {
    navigation.navigate('Alerts');
  };

  const handleChatPress = () => {
    navigation.navigate('Chat');
  };

  const handleMapPress = () => {
    navigation.navigate('Map');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={COMMON_STYLES.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>{APP_CONFIG.APP_NAME}</Text>
          <Text style={styles.subtitle}>Emergency Communication Network</Text>
        </View>

        {/* Status Indicators */}
        <View style={styles.statusContainer}>
          <StatusIndicator
            status={apiStatus}
            label="API Server"
            size="small"
          />
          <StatusIndicator
            status={bleStatus}
            label="Bluetooth"
            size="small"
            onPress={handleBluetoothToggle}
          />
          <StatusIndicator
            status={wifiStatus}
            label="Wi-Fi"
            size="small"
            onPress={handleWifiToggle}
          />
          <StatusIndicator
            status={locationStatus}
            label="Location"
            size="small"
            onPress={handleLocationToggle}
          />
        </View>

        {/* Emergency SOS Button */}
        <View style={styles.emergencySection}>
          <EmergencyButton
            title="🚨 EMERGENCY SOS 🚨"
            onPress={handleSOSPress}
            variant="emergency"
            size="large"
            style={styles.sosButton}
          />
          <Text style={styles.sosDescription}>
            Send emergency alert with your location to nearby devices
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.buttonGrid}>
            <EmergencyButton
              title="📢 Alerts"
              onPress={handleAlertsPress}
              variant="primary"
              size="medium"
              style={styles.actionButton}
            />
            
            <EmergencyButton
              title="💬 Chat"
              onPress={handleChatPress}
              variant="primary"
              size="medium"
              style={styles.actionButton}
            />
            
            <EmergencyButton
              title="🗺️ Map"
              onPress={handleMapPress}
              variant="primary"
              size="medium"
              style={styles.actionButton}
            />
            
            <EmergencyButton
              title="⚙️ Settings"
              onPress={handleSettingsPress}
              variant="secondary"
              size="medium"
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* Network Info */}
        <View style={styles.networkInfo}>
          <Text style={styles.networkTitle}>Network Status</Text>
          <Text style={styles.networkText}>
            • Bluetooth: {bleStatus === 'connected' ? 'Active' : 'Inactive'}
          </Text>
          <Text style={styles.networkText}>
            • Wi-Fi Mesh: {wifiStatus === 'online' ? 'Active' : 'Inactive'}
          </Text>
          <Text style={styles.networkText}>
            • Location: {locationStatus === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Version {APP_CONFIG.VERSION} • Offline-First Emergency Network
          </Text>
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
  
  appName: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
    textAlign: 'center',
  },
  
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  
  emergencySection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  
  sosButton: {
    marginBottom: SPACING.md,
    minHeight: 100,
  },
  
  sosDescription: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.sm,
  },
  
  actionsSection: {
    marginBottom: SPACING.xl,
  },
  
  sectionTitle: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.md,
  },
  
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  actionButton: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  
  networkInfo: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  
  networkTitle: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.sm,
  },
  
  networkText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginBottom: SPACING.xs,
  },
  
  footer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  
  footerText: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.fontSize.xs,
    textAlign: 'center',
  },
});

export default HomeScreen;
