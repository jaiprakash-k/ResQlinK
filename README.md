# ResQlinK - Emergency Communication Network

A cross-platform React Native app for offline-first emergency communication using Bluetooth (BLE mesh) and Wi-Fi (WebRTC/Wi-Fi Direct) networking.

## 🚨 Features

### Core Screens
- **HomeScreen**: Main dashboard with emergency buttons and network status
- **SOSScreen**: Send emergency SOS with GPS location
- **AlertsScreen**: View emergency alerts from nearby devices
- **ChatScreen**: Offline chat for emergency communication
- **MapScreen**: Map view with SOS message locations
- **SettingsScreen**: Configure network and app settings

### Key Features
- **Offline-First**: Works without internet connection
- **Bluetooth Mesh**: BLE communication with nearby devices
- **Wi-Fi Mesh**: WebRTC/Wi-Fi Direct networking (stubbed)
- **GPS Location**: Real-time location tracking and sharing
- **Dark Theme**: Emergency-ready UI with high contrast
- **Local Storage**: AsyncStorage for offline data persistence
- **Cloud Sync**: Firebase integration (stubbed for offline-first)

## 🛠️ Technology Stack

- **React Native 0.81.1** - Cross-platform mobile development
- **React Navigation 7** - Screen navigation
- **react-native-ble-plx** - Bluetooth Low Energy communication
- **react-native-geolocation-service** - GPS location services
- **react-native-maps** - Map display with markers
- **@react-native-async-storage/async-storage** - Local data storage
- **Firebase** - Cloud sync (stubbed)

## 📱 Installation

### Prerequisites
- Node.js >= 20
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS)

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd ResQlinK

# Install dependencies
npm install

# iOS setup (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── EmergencyButton.js
│   ├── MessageCard.js
│   ├── AlertList.js
│   └── StatusIndicator.js
├── screens/            # App screens
│   ├── HomeScreen.js
│   ├── SOSScreen.js
│   ├── AlertsScreen.js
│   ├── ChatScreen.js
│   ├── MapScreen.js
│   └── SettingsScreen.js
├── services/           # Business logic services
│   ├── bleService.js
│   ├── wifiService.js
│   ├── locationService.js
│   ├── storageService.js
│   └── firebaseService.js
└── utils/              # Utilities and constants
    ├── constants.js
    ├── theme.js
    └── helpers.js
```

## 🔧 Configuration

### Bluetooth Configuration
- Service UUID: `12345678-1234-1234-1234-123456789ABC`
- Characteristic UUID: `87654321-4321-4321-4321-CBA987654321`
- Device name prefix: `ResQlinK_`

### Wi-Fi Configuration
- Mesh network name: `ResQlinK_Mesh`
- Default port: `8080`
- Discovery timeout: `5000ms`

### Permissions Required

#### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
```

#### iOS (ios/ResQlinK/Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access for emergency communication</string>
<key>NSBluetoothAlwaysUsageDescription</key>
<string>This app uses Bluetooth for emergency mesh networking</string>
```

## 🚀 Usage

### Emergency SOS
1. Tap the red "EMERGENCY SOS" button on the home screen
2. Confirm your location is accurate
3. Tap "Send SOS" to broadcast emergency alert
4. Message will be sent via Bluetooth and Wi-Fi to nearby devices

### Viewing Alerts
1. Navigate to "Alerts" screen
2. View emergency messages from nearby devices
3. Filter by emergency level (Critical, High, Medium, Low)
4. Tap alerts to view details or location on map

### Emergency Chat
1. Go to "Chat" screen
2. Type messages to communicate with nearby users
3. Messages are sent via mesh network
4. Chat history is stored locally

### Map View
1. Open "Map" screen to see emergency locations
2. Different colored pins indicate emergency levels
3. Tap pins to view alert details
4. Blue pin shows your current location

## 🔒 Security & Privacy

- **Offline-First**: No data sent to external servers by default
- **Local Storage**: All data stored locally on device
- **Encrypted Communication**: BLE and Wi-Fi mesh use encrypted channels
- **Location Privacy**: GPS data only shared during emergencies
- **No Personal Data**: App doesn't collect personal information

## 🧪 Testing

The app includes test data and simulation features:

- **Test Alerts**: Add sample emergency alerts
- **Test Messages**: Send mock chat messages
- **Test Locations**: Add random location markers
- **Service Simulation**: BLE and Wi-Fi services include mock functionality

## 🔮 Future Enhancements

### Planned Features
- **WebRTC Implementation**: Real peer-to-peer communication
- **Wi-Fi Direct**: Native mesh networking
- **Encryption**: End-to-end message encryption
- **Voice Messages**: Audio emergency messages
- **Image Sharing**: Photo sharing for emergencies
- **Group Management**: Create emergency groups
- **Push Notifications**: Emergency alert notifications
- **Offline Maps**: Download maps for offline use

### Technical Improvements
- **Performance Optimization**: Reduce battery usage
- **Network Resilience**: Better connection handling
- **Data Compression**: Optimize message sizes
- **Background Sync**: Sync when network available
- **Multi-language**: Internationalization support

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For emergency situations, always call your local emergency services (911, 112, etc.).

For app support or bug reports, please create an issue in the repository.

---

**⚠️ Important**: This app is designed for emergency communication and should not replace official emergency services. Always contact local emergency services in life-threatening situations.