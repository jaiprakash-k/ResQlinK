import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '../utils/theme';
import { TEST_DATA, EMERGENCY_LEVELS, EMERGENCY_COLORS } from '../utils/constants';
import EmergencyButton from '../components/EmergencyButton';
import storageService from '../services/storageService';
import locationService from '../services/locationService';

const MapScreen = ({ navigation, route }) => {
  const [alerts, setAlerts] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    loadAlerts();
    getCurrentLocation();
    
    // Focus on specific location if provided
    if (route.params?.focusLocation) {
      setMapRegion({
        latitude: route.params.focusLocation.latitude,
        longitude: route.params.focusLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [route.params]);

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

  const getCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
      
      // Update map region to current location
      setMapRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const getMarkerColor = (level) => {
    switch (level) {
      case EMERGENCY_LEVELS.CRITICAL:
        return '#FF1744';
      case EMERGENCY_LEVELS.HIGH:
        return '#F44336';
      case EMERGENCY_LEVELS.MEDIUM:
        return '#FF9800';
      case EMERGENCY_LEVELS.LOW:
        return '#4CAF50';
      default:
        return COLORS.primary;
    }
  };

  const getMarkerIcon = (type) => {
    switch (type) {
      case 'sos':
        return '🚨';
      case 'alert':
        return '⚠️';
      case 'chat':
        return '💬';
      default:
        return '📍';
    }
  };

  const handleMarkerPress = (alert) => {
    Alert.alert(
      `${alert.type.toUpperCase()} Alert`,
      `Message: ${alert.message}\nSender: ${alert.sender}\nTime: ${new Date(alert.timestamp).toLocaleString()}\nLevel: ${alert.level.toUpperCase()}`,
      [
        { text: 'OK' },
        {
          text: 'View Details',
          onPress: () => {
            // Navigate to alerts screen with specific alert
            navigation.navigate('Alerts');
          },
        },
      ]
    );
  };

  const handleCenterOnLocation = () => {
    if (currentLocation) {
      setMapRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      getCurrentLocation();
    }
  };

  const handleAddTestAlert = () => {
    const testAlert = {
      id: Date.now().toString(),
      type: 'alert',
      level: EMERGENCY_LEVELS.MEDIUM,
      message: 'Test alert on map',
      location: {
        latitude: mapRegion.latitude + (Math.random() - 0.5) * 0.01,
        longitude: mapRegion.longitude + (Math.random() - 0.5) * 0.01,
      },
      timestamp: new Date().toISOString(),
      sender: 'Test_User_' + Math.floor(Math.random() * 100),
    };

    setAlerts(prev => [...prev, testAlert]);
    storageService.addAlert(testAlert);
  };

  return (
    <SafeAreaView style={COMMON_STYLES.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Emergency Map</Text>
          <View style={styles.headerActions}>
            <EmergencyButton
              title="📍 Center"
              onPress={handleCenterOnLocation}
              variant="secondary"
              size="small"
              style={styles.headerButton}
            />
            <EmergencyButton
              title="➕ Test"
              onPress={handleAddTestAlert}
              variant="secondary"
              size="small"
              style={styles.headerButton}
            />
          </View>
        </View>

        {/* Map */}
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
        >
          {/* Current Location Marker */}
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Your Location"
              description="Current position"
              pinColor="blue"
            />
          )}

          {/* Alert Markers */}
          {alerts.map((alert) => (
            <Marker
              key={alert.id}
              coordinate={{
                latitude: alert.location.latitude,
                longitude: alert.location.longitude,
              }}
              pinColor={getMarkerColor(alert.level)}
              onPress={() => handleMarkerPress(alert)}
            >
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>
                    {getMarkerIcon(alert.type)} {alert.type.toUpperCase()}
                  </Text>
                  <Text style={styles.calloutMessage}>
                    {alert.message}
                  </Text>
                  <Text style={styles.calloutSender}>
                    From: {alert.sender}
                  </Text>
                  <Text style={styles.calloutTime}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF1744' }]} />
              <Text style={styles.legendText}>Critical</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>High</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.legendText}>Medium</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Low</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  title: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  
  headerActions: {
    flexDirection: 'row',
  },
  
  headerButton: {
    marginLeft: SPACING.sm,
    minWidth: 60,
  },
  
  map: {
    flex: 1,
  },
  
  calloutContainer: {
    width: 200,
    padding: SPACING.sm,
  },
  
  calloutTitle: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xs,
  },
  
  calloutMessage: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginBottom: SPACING.xs,
  },
  
  calloutSender: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginBottom: SPACING.xs,
  },
  
  calloutTime: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  
  legend: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  
  legendTitle: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.sm,
  },
  
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginBottom: SPACING.xs,
  },
  
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
  },
  
  legendText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
});

export default MapScreen;
