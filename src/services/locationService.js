import { PermissionsAndroid, Platform } from 'react-native';

// Use React Native's built-in geolocation as primary, with fallback
let Geolocation;
try {
  // Try to import react-native-geolocation-service
  Geolocation = require('react-native-geolocation-service').default;
} catch (error) {
  console.warn('react-native-geolocation-service not available, using native geolocation');
  Geolocation = null;
}

// Always have native geolocation as backup
const NativeGeolocation = navigator.geolocation;

// Single class declaration (previous duplicate removed)
class LocationService {
  static __MODULE_LOADED_AT = new Date().toISOString();

  constructor() {
    this.currentLocation = null;
    this.watchId = null;
    this.isTracking = false;
  }

  // Log module load once
  static logModuleLoaded() {
    if (!this._logged) {
      console.log('locationService module loaded at', this.__MODULE_LOADED_AT);
      this._logged = true;
    }
  }

  // Initialize the service: request permissions and warm-up current location
  async initialize() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Location permissions not granted during initialize()');
        return false;
      }

      // Try to fetch a current location to warm up the service (non-fatal)
      try {
        await this.getCurrentLocation();
      } catch (err) {
        // ignore errors here; service is still initialized but without a location
        console.warn('Unable to get current location during initialize():', err.message || err);
      }

      return true;
    } catch (error) {
      console.error('Error initializing location service:', error);
      return false;
    }
  }

  // Request location permissions
  async requestPermissions() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        const fineLocationGranted = granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === 'granted';
        const coarseLocationGranted = granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === 'granted';

        return fineLocationGranted || coarseLocationGranted;
      }
      return true; // iOS permissions are handled in Info.plist
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  // Get current location
  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      return new Promise((resolve, reject) => {
        try {
          // Use native geolocation to avoid Google Play Services issues
          if (NativeGeolocation && NativeGeolocation.getCurrentPosition) {
            console.log('Using native geolocation API to avoid Google Play Services');
            NativeGeolocation.getCurrentPosition(
              (position) => {
                const location = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  altitude: position.coords.altitude,
                  speed: position.coords.speed,
                  timestamp: position.timestamp,
                };
                
                this.currentLocation = location;
                console.log('Current location:', location);
                resolve(location);
              },
              (error) => {
                console.error('Native geolocation error:', error);
                console.warn('Using fallback location due to geolocation error');
                
                const fallbackLocation = {
                  latitude: 37.7749, // San Francisco
                  longitude: -122.4194,
                  accuracy: 1000,
                  altitude: null,
                  speed: null,
                  timestamp: Date.now(),
                };
                this.currentLocation = fallbackLocation;
                resolve(fallbackLocation);
              },
              {
                enableHighAccuracy: false,
                timeout: 8000,
                maximumAge: 60000,
              }
            );
          } else {
            // If native geolocation isn't available, use fallback immediately
            console.warn('Native geolocation not available, using fallback location');
            const fallbackLocation = {
              latitude: 37.7749, // San Francisco
              longitude: -122.4194,
              accuracy: 1000,
              altitude: null,
              speed: null,
              timestamp: Date.now(),
            };
            this.currentLocation = fallbackLocation;
            resolve(fallbackLocation);
          }
        } catch (nativeError) {
          console.error('Location method failed completely:', nativeError);
          console.warn('Using fallback location due to complete geolocation failure');
          
          // Always provide fallback location
          const fallbackLocation = {
            latitude: 37.7749, // San Francisco  
            longitude: -122.4194,
            accuracy: 1000,
            altitude: null,
            speed: null,
            timestamp: Date.now(),
          };
          this.currentLocation = fallbackLocation;
          resolve(fallbackLocation); // Always resolve, never reject
        }
      });
    } catch (error) {
      console.error('Error in getCurrentLocation:', error);
      console.warn('Returning fallback location due to outer error');
      
      // Always return fallback location, never throw
      const fallbackLocation = {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 1000,
        altitude: null,
        speed: null,
        timestamp: Date.now(),
      };
      this.currentLocation = fallbackLocation;
      return fallbackLocation;
    }
  }

  // Start location tracking
  async startLocationTracking(onLocationUpdate) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      if (this.isTracking) {
        console.log('Location tracking already active');
        return;
      }

      console.log('Starting location tracking...');
      this.isTracking = true;

      this.watchId = Geolocation.watchPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          };
          
          this.currentLocation = location;
          onLocationUpdate(location);
        },
        (error) => {
          console.error('Error in location tracking:', error);
          // Handle Google Play Services errors gracefully
          if (error.message && error.message.includes('FusedLocationProviderClient')) {
            console.warn('Google Play Services tracking error, stopping tracking');
            this.stopLocationTracking();
          }
        },
        {
          enableHighAccuracy: false, // Use lower accuracy
          distanceFilter: 10, // Update every 10 meters
          interval: 10000, // Update every 10 seconds (longer interval)
          fastestInterval: 5000, // Fastest update every 5 seconds
        }
      );

    } catch (error) {
      console.error('Error starting location tracking:', error);
      this.isTracking = false;
      throw error;
    }
  }

  // Stop location tracking
  stopLocationTracking() {
    try {
      if (this.watchId !== null) {
        console.log('Stopping location tracking...');
        Geolocation.clearWatch(this.watchId);
        this.watchId = null;
        this.isTracking = false;
      }
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  }

  // Get last known location
  getLastKnownLocation() {
    return this.currentLocation;
  }

  // Calculate distance between two coordinates (in meters)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  // Format distance for display
  formatDistance(distanceInMeters) {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)} km`;
    }
  }

  // Get location with address (reverse geocoding)
  async getLocationWithAddress(latitude, longitude) {
    try {
      // TODO: Implement reverse geocoding
      // For now, return mock address
      return {
        latitude,
        longitude,
        address: 'Mock Address, City, Country',
        formattedAddress: 'Mock Address, City, Country',
      };
    } catch (error) {
      console.error('Error getting location with address:', error);
      return {
        latitude,
        longitude,
        address: 'Unknown Location',
        formattedAddress: 'Unknown Location',
      };
    }
  }

  // Check if location services are enabled
  async isLocationServicesEnabled() {
    try {
      // TODO: Implement actual location services check
      return true;
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  // Get tracking status
  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      hasLocation: this.currentLocation !== null,
      lastLocation: this.currentLocation,
    };
  }

  // Cleanup resources
  destroy() {
    try {
      console.log('Destroying location service...');
      this.stopLocationTracking();
      this.currentLocation = null;
    } catch (error) {
      console.error('Error destroying location service:', error);
    }
  }
}

// Export singleton instance
export default new LocationService();
