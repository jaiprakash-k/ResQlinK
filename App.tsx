/**
 * ResQlinK - Emergency Communication Network
 * Offline-first emergency communication using Bluetooth and Wi-Fi mesh
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import SOSScreen from './src/screens/SOSScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import ChatScreen from './src/screens/ChatScreen';
import MapScreen from './src/screens/MapScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import theme
import { COLORS } from './src/utils/theme';

const Stack = createStackNavigator();

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={COLORS.background}
        translucent={false}
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.surface,
              borderBottomColor: COLORS.border,
              borderBottomWidth: 1,
            },
            headerTintColor: COLORS.text,
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
            cardStyle: {
              backgroundColor: COLORS.background,
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'ResQlinK',
              headerShown: false, // Hide header for home screen
            }}
          />
          <Stack.Screen
            name="SOS"
            component={SOSScreen}
            options={{
              title: 'Emergency SOS',
              headerStyle: {
                backgroundColor: COLORS.emergency,
              },
              headerTintColor: COLORS.text,
            }}
          />
          <Stack.Screen
            name="Alerts"
            component={AlertsScreen}
            options={{
              title: 'Emergency Alerts',
            }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              title: 'Emergency Chat',
            }}
          />
          <Stack.Screen
            name="Map"
            component={MapScreen}
            options={{
              title: 'Emergency Map',
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Settings',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
