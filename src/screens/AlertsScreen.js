import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { COLORS, SPACING, COMMON_STYLES } from '../utils/theme';
import { TEST_DATA, MESSAGE_TYPES, EMERGENCY_LEVELS } from '../utils/constants';
import AlertList from '../components/AlertList';
import EmergencyButton from '../components/EmergencyButton';
import storageService from '../services/storageService';
import firebaseService from '../services/firebaseService';
import locationService from '../services/locationService';

const AlertsScreen = ({ navigation }) => {
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      let allAlerts = [];
      
      // Load alerts from local storage first
      const storedAlerts = await storageService.getAlerts();
      allAlerts = [...storedAlerts];
      
      // Try to fetch nearby SOS alerts from backend
      try {
        if (firebaseService.isAuthenticated()) {
          const location = await locationService.getCurrentLocation();
          const nearbyAlerts = await firebaseService.fetchNearbySOS({
            lat: location.latitude,
            lng: location.longitude,
            radius: 10, // 10km radius
          });
          
          // Convert backend format to our alert format
          const formattedAlerts = nearbyAlerts.map(alert => ({
            id: alert.id,
            type: MESSAGE_TYPES.SOS,
            level: EMERGENCY_LEVELS.CRITICAL,
            message: alert.message,
            location: { latitude: alert.lat, longitude: alert.lng },
            timestamp: alert.timestamp,
            sender: alert.userId,
            distance: calculateDistance(location, { latitude: alert.lat, longitude: alert.lng }),
          }));
          
          allAlerts = [...allAlerts, ...formattedAlerts];
        }
      } catch (backendError) {
        console.error('Failed to fetch from backend:', backendError);
      }
      
      // If no alerts at all, use test data
      if (allAlerts.length === 0) {
        setAlerts(TEST_DATA.SAMPLE_ALERTS);
      } else {
        // Remove duplicates and sort by timestamp
        const uniqueAlerts = allAlerts.filter((alert, index, self) => 
          index === self.findIndex(a => a.id === alert.id)
        );
        uniqueAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setAlerts(uniqueAlerts);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      // Fallback to test data
      setAlerts(TEST_DATA.SAMPLE_ALERTS);
    }
  };

  const calculateDistance = (pos1, pos2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
    const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.latitude * Math.PI / 180) * Math.cos(pos2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return `${distance.toFixed(1)} km`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate network refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadAlerts();
    } catch (error) {
      console.error('Error refreshing alerts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAlertPress = (alert) => {
    Alert.alert(
      'Alert Details',
      `Type: ${alert.type.toUpperCase()}\nLevel: ${alert.level.toUpperCase()}\nMessage: ${alert.message}\nSender: ${alert.sender}\nTime: ${new Date(alert.timestamp).toLocaleString()}`,
      [
        { text: 'OK' },
        {
          text: 'View on Map',
          onPress: () => {
            if (alert.location) {
              navigation.navigate('Map', { 
                focusLocation: alert.location,
                alertId: alert.id 
              });
            }
          },
        },
      ]
    );
  };

  const handleClearAlerts = () => {
    Alert.alert(
      'Clear All Alerts',
      'Are you sure you want to clear all alerts? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAlerts();
              setAlerts([]);
            } catch (error) {
              console.error('Error clearing alerts:', error);
            }
          },
        },
      ]
    );
  };

  const handleAddTestAlert = () => {
    const testAlert = {
      id: Date.now().toString(),
      type: MESSAGE_TYPES.ALERT,
      level: EMERGENCY_LEVELS.MEDIUM,
      message: 'Test alert - This is a sample emergency message',
      location: {
        latitude: 37.7849 + (Math.random() - 0.5) * 0.01,
        longitude: -122.4094 + (Math.random() - 0.5) * 0.01,
      },
      timestamp: new Date().toISOString(),
      sender: 'Test_User_' + Math.floor(Math.random() * 100),
      distance: `${(Math.random() * 5).toFixed(1)} km`,
    };

    setAlerts(prev => [testAlert, ...prev]);
    
    // Store in local storage
    storageService.addAlert(testAlert);
  };

  return (
    <SafeAreaView style={COMMON_STYLES.safeArea}>
      <View style={styles.container}>
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <EmergencyButton
            title="Add Test Alert"
            onPress={handleAddTestAlert}
            variant="secondary"
            size="small"
            style={styles.headerButton}
          />
          
          <EmergencyButton
            title="Clear All"
            onPress={handleClearAlerts}
            variant="warning"
            size="small"
            style={styles.headerButton}
          />
        </View>

        {/* Alerts List */}
        <AlertList
          alerts={alerts}
          onRefresh={handleRefresh}
          onAlertPress={handleAlertPress}
          refreshing={refreshing}
          style={styles.alertList}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  headerButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  
  alertList: {
    flex: 1,
  },
});

export default AlertsScreen;
