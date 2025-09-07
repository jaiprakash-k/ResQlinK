import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '../utils/theme';
import { MESSAGE_TYPES, EMERGENCY_LEVELS } from '../utils/constants';
import EmergencyButton from '../components/EmergencyButton';
import locationService from '../services/locationService';
import bleService from '../services/bleService';
import wifiService from '../services/wifiService';
import storageService from '../services/storageService';

const SOSScreen = ({ navigation }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      setLocationError(null);
      
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
      
      // Store location in history
      await storageService.addLocationToHistory(location);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const sendSOSMessage = async () => {
    try {
      setIsSending(true);
      
      if (!currentLocation) {
        Alert.alert('Error', 'Location not available. Please try again.');
        return;
      }

      const sosMessage = {
        type: MESSAGE_TYPES.SOS,
        level: EMERGENCY_LEVELS.CRITICAL,
        message: 'EMERGENCY SOS - Need immediate help!',
        location: currentLocation,
        timestamp: new Date().toISOString(),
        sender: 'You',
      };

      // Store the SOS message locally
      await storageService.addAlert(sosMessage);

      // Send via Bluetooth
      const bleSent = await bleService.broadcastMessage(sosMessage);
      
      // Send via Wi-Fi mesh
      const wifiSent = await wifiService.broadcastMessage(sosMessage);

      if (bleSent || wifiSent) {
        Alert.alert(
          'SOS Sent',
          'Your emergency SOS has been sent to nearby devices.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(
          'SOS Stored',
          'Your SOS message has been stored locally. It will be sent when devices are available.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error sending SOS:', error);
      Alert.alert('Error', 'Failed to send SOS message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSOS = () => {
    Alert.alert(
      'Send Emergency SOS',
      'This will send an emergency SOS message with your current location to all nearby devices. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send SOS', 
          style: 'destructive',
          onPress: sendSOSMessage,
        },
      ]
    );
  };

  const formatLocation = (location) => {
    if (!location) return 'Unknown';
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  const formatAccuracy = (accuracy) => {
    if (!accuracy) return 'Unknown';
    return `${Math.round(accuracy)}m`;
  };

  return (
    <SafeAreaView style={COMMON_STYLES.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Emergency SOS</Text>
          <Text style={styles.subtitle}>
            Send emergency alert with your location
          </Text>
        </View>

        {/* Location Status */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={COLORS.primary} size="large" />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          ) : locationError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{locationError}</Text>
              <EmergencyButton
                title="Retry Location"
                onPress={getCurrentLocation}
                variant="secondary"
                size="small"
              />
            </View>
          ) : currentLocation ? (
            <View style={styles.locationInfo}>
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>Coordinates:</Text>
                <Text style={styles.locationValue}>
                  {formatLocation(currentLocation)}
                </Text>
              </View>
              
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>Accuracy:</Text>
                <Text style={styles.locationValue}>
                  {formatAccuracy(currentLocation.accuracy)}
                </Text>
              </View>
              
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>Timestamp:</Text>
                <Text style={styles.locationValue}>
                  {new Date(currentLocation.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noLocationContainer}>
              <Text style={styles.noLocationText}>No location available</Text>
              <EmergencyButton
                title="Get Location"
                onPress={getCurrentLocation}
                variant="primary"
                size="small"
              />
            </View>
          )}
        </View>

        {/* SOS Button */}
        <View style={styles.sosSection}>
          <EmergencyButton
            title="🚨 SEND EMERGENCY SOS 🚨"
            onPress={handleSendSOS}
            variant="emergency"
            size="large"
            disabled={!currentLocation || isSending}
            loading={isSending}
            style={styles.sosButton}
          />
          
          {!currentLocation && (
            <Text style={styles.warningText}>
              Location required to send SOS
            </Text>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>What happens when you send SOS:</Text>
          <Text style={styles.instructionsText}>
            • Your location will be sent to all nearby devices
          </Text>
          <Text style={styles.instructionsText}>
            • Message will be broadcast via Bluetooth and Wi-Fi
          </Text>
          <Text style={styles.instructionsText}>
            • SOS will be stored locally if no devices are available
          </Text>
          <Text style={styles.instructionsText}>
            • Emergency contacts will be notified
          </Text>
        </View>

        {/* Back Button */}
        <View style={styles.backSection}>
          <EmergencyButton
            title="← Back to Home"
            onPress={() => navigation.goBack()}
            variant="secondary"
            size="medium"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  
  title: {
    color: COLORS.emergency,
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
  
  locationSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.xl,
  },
  
  sectionTitle: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.md,
  },
  
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
    marginTop: SPACING.sm,
  },
  
  errorContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.md,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  
  locationInfo: {
    paddingVertical: SPACING.sm,
  },
  
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  
  locationLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    flex: 1,
  },
  
  locationValue: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: 'monospace',
    flex: 2,
    textAlign: 'right',
  },
  
  noLocationContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  
  noLocationText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
    marginBottom: SPACING.md,
  },
  
  sosSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  
  sosButton: {
    marginBottom: SPACING.md,
    minHeight: 100,
  },
  
  warningText: {
    color: COLORS.warning,
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
  },
  
  instructionsSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.xl,
  },
  
  instructionsTitle: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.md,
  },
  
  instructionsText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginBottom: SPACING.xs,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.sm,
  },
  
  backSection: {
    alignItems: 'center',
  },
});

export default SOSScreen;
