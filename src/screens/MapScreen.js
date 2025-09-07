import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Callout, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS, TYPOGRAPHY, SPACING, COMMON_STYLES } from '../utils/theme';
import { TEST_DATA, EMERGENCY_LEVELS, EMERGENCY_COLORS } from '../utils/constants';
import EmergencyButton from '../components/EmergencyButton';
import storageService from '../services/storageService';
import locationService from '../services/locationService';
import firebaseService from '../services/firebaseService';

const MapScreen = ({ navigation, route }) => {
  const [alerts, setAlerts] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5); // 5km radius
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.6139, // Delhi, India as default
    longitude: 77.2090,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
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
      setIsLoading(true);
      let allAlerts = [];
      
      // Load alerts from local storage first
      const storedAlerts = await storageService.getAlerts();
      allAlerts = [...storedAlerts];
      
      // Try to fetch nearby SOS alerts from backend if we have current location
      try {
        if (currentLocation && firebaseService.isAuthenticated()) {
          const nearbyAlerts = await firebaseService.fetchNearbySOS({
            lat: currentLocation.latitude,
            lng: currentLocation.longitude,
            radius: searchRadius,
          });
          
          // Convert backend format to our alert format
          const formattedAlerts = nearbyAlerts.map(alert => ({
            id: alert.id,
            type: 'sos',
            level: EMERGENCY_LEVELS.CRITICAL,
            message: alert.message,
            location: { latitude: alert.lat, longitude: alert.lng },
            timestamp: alert.timestamp,
            sender: alert.userId,
            distance: calculateDistance(currentLocation, { latitude: alert.lat, longitude: alert.lng }),
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
    } finally {
      setIsLoading(false);
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

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
      
      // Update map region to current location
      setMapRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      
      // Reload alerts with new location
      await loadAlerts();
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Location Error', 'Unable to get current location. Please check your location settings.');
    } finally {
      setIsLoading(false);
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

  const handleSendSOSFromMap = async () => {
    try {
      if (!currentLocation) {
        Alert.alert('Location Required', 'Please enable location services to send SOS.');
        return;
      }

      Alert.alert(
        'Send Emergency SOS',
        'This will send an emergency SOS with your current location to nearby devices and the server.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send SOS',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);

                // Create SOS message
                const sosMessage = {
                  type: 'sos',
                  level: EMERGENCY_LEVELS.CRITICAL,
                  message: 'EMERGENCY SOS - Need immediate help!',
                  location: currentLocation,
                  timestamp: new Date().toISOString(),
                  sender: 'You',
                };

                // Store locally
                await storageService.addAlert(sosMessage);

                // Try to send via backend
                try {
                  if (!firebaseService.isAuthenticated()) {
                    await firebaseService.anonymousLogin();
                  }
                  
                  const user = firebaseService.getUser();
                  await firebaseService.pushSOS({
                    userId: user?.uid || 'anonymous',
                    lat: currentLocation.latitude,
                    lng: currentLocation.longitude,
                    message: sosMessage.message,
                    timestamp: sosMessage.timestamp,
                  });

                  Alert.alert('SOS Sent', 'Your emergency SOS has been sent successfully!');
                } catch (backendError) {
                  console.error('Backend SOS failed:', backendError);
                  Alert.alert('SOS Stored', 'Your SOS has been stored locally and will be sent when connection is available.');
                }

                // Refresh alerts to show the new SOS
                await loadAlerts();
              } catch (error) {
                console.error('Error sending SOS:', error);
                Alert.alert('Error', 'Failed to send SOS. Please try again.');
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in handleSendSOSFromMap:', error);
    }
  };

  const handleRefreshAlerts = async () => {
    await loadAlerts();
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
              title="🔄 Refresh"
              onPress={handleRefreshAlerts}
              variant="secondary"
              size="small"
              style={styles.headerButton}
            />
            <EmergencyButton
              title="🚨 SOS"
              onPress={handleSendSOSFromMap}
              variant="emergency"
              size="small"
              style={styles.headerButton}
            />
          </View>
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading alerts...</Text>
          </View>
        )}

        {/* Map */}
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          onMapReady={() => setMapReady(true)}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          loadingEnabled={true}
          loadingIndicatorColor={COLORS.primary}
          loadingBackgroundColor={COLORS.background}
          moveOnMarkerPress={false}
          showsBuildings={true}
          showsTraffic={false}
          showsIndoors={true}
          mapType="standard"
        >
          {/* Search Radius Circle */}
          {currentLocation && (
            <Circle
              center={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              radius={searchRadius * 1000} // Convert km to meters
              fillColor="rgba(0, 122, 255, 0.1)"
              strokeColor="rgba(0, 122, 255, 0.3)"
              strokeWidth={2}
            />
          )}

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
          <Text style={styles.legendTitle}>
            Map Info - Showing alerts within {searchRadius}km radius
          </Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF1744' }]} />
              <Text style={styles.legendText}>Critical SOS</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>High Alert</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.legendText}>Medium Alert</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Low Alert</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: 'blue' }]} />
              <Text style={styles.legendText}>Your Location</Text>
            </View>
          </View>
          <Text style={styles.alertCount}>
            Total Alerts: {alerts.length} | 
            {currentLocation ? ' Location: Active' : ' Location: Inactive'}
          </Text>
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
  
  loadingContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: 8,
    zIndex: 1000,
  },
  
  loadingText: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginTop: SPACING.xs,
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
  
  alertCount: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default MapScreen;
