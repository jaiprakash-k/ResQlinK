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

const AlertsScreen = ({ navigation }) => {
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      // Load alerts from storage
      const storedAlerts = await storageService.getAlerts();
      
      // If no stored alerts, use test data
      if (storedAlerts.length === 0) {
        setAlerts(TEST_DATA.SAMPLE_ALERTS);
      } else {
        setAlerts(storedAlerts);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      // Fallback to test data
      setAlerts(TEST_DATA.SAMPLE_ALERTS);
    }
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
