# ResQlinK 🚨

> **Offline-first emergency communication via Bluetooth mesh & Wi-Fi Direct — no internet required.**

[![React Native](https://img.shields.io/badge/React%20Native-0.81.1-61DAFB?style=flat-square&logo=react)](https://reactnative.dev)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-lightgrey?style=flat-square)](https://reactnative.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![BLE](https://img.shields.io/badge/BLE-Mesh%20Ready-blue?style=flat-square)](https://github.com/dotintent/react-native-ble-plx)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API & Services](#api--services)
- [Permissions](#permissions)
- [Security & Privacy](#security--privacy)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Overview

ResQlinK is a cross-platform React Native application built for emergency communication in infrastructure-down scenarios — natural disasters, power outages, and remote environments where cellular and internet access is unavailable.

Devices running ResQlinK form a **self-healing mesh network** using Bluetooth Low Energy (BLE) and Wi-Fi Direct. Emergency SOS messages, location data, and text communications propagate hop-by-hop across the mesh — no router, no cell tower, no cloud required.

```
Device A ──BLE──► Device B ──BLE──► Device C ──WiFi──► Device D
  (You)                                                  (Responder)
   └── SOS + GPS ─────────────────────────────────────────────►
```

---

## Features

### Emergency Communication
- **SOS Broadcast** — One-tap emergency alert with GPS coordinates, severity level, and a custom message, propagated across the entire mesh
- **Alert Feed** — Real-time stream of incoming emergency alerts from nearby nodes, filterable by severity (Critical / High / Medium / Low)
- **Mesh Chat** — Offline text communication relayed hop-by-hop across the network

### Networking
- **BLE Mesh** — Bluetooth Low Energy peer discovery and message relay using `react-native-ble-plx`
- **Wi-Fi Mesh** — WebRTC / Wi-Fi Direct networking layer (stubbed — production implementation pending)
- **Auto-reconnect** — Nodes automatically re-join the mesh after disconnection
- **Hop Tracking** — Each message carries a hop counter; messages are discarded after `MAX_HOPS` to prevent infinite relay loops

### Location & Mapping
- **Live GPS** — Continuous location tracking via `react-native-geolocation-service`
- **Map View** — Interactive map with color-coded emergency pins (Critical = red, High = amber, Medium = blue, You = teal)
- **Distance Estimation** — Approximate distance to alert origin based on GPS coordinates

### Data & Storage
- **Offline-First** — All data stored locally via `@react-native-async-storage/async-storage`
- **Cloud Sync** — Firebase integration stub for syncing when connectivity is restored
- **Message Deduplication** — UUID-based deduplication prevents duplicate alerts from multiple relay paths

---

## Tech Stack

| Layer | Library | Version | Purpose |
|---|---|---|---|
| Framework | React Native | 0.81.1 | Cross-platform mobile |
| Navigation | React Navigation | 7.x | Screen routing |
| Bluetooth | react-native-ble-plx | latest | BLE mesh networking |
| Location | react-native-geolocation-service | latest | GPS tracking |
| Maps | react-native-maps | latest | Map display & pins |
| Storage | @react-native-async-storage/async-storage | latest | Local persistence |
| Cloud | Firebase | latest | Sync (stubbed) |

---

## Project Structure

```
ResQlinK/
├── android/                        # Android native project
├── ios/                            # iOS native project (macOS only)
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── EmergencyButton.js      # Animated SOS trigger button
│   │   ├── MessageCard.js          # Chat message bubble
│   │   ├── AlertList.js            # Scrollable alert feed
│   │   └── StatusIndicator.js      # Mesh connection status chip
│   │
│   ├── screens/                    # Full-page screens
│   │   ├── HomeScreen.js           # Dashboard: SOS, mesh stats, quick alerts
│   │   ├── SOSScreen.js            # Emergency SOS send flow
│   │   ├── AlertsScreen.js         # Full alert feed with filters
│   │   ├── ChatScreen.js           # Offline mesh chat
│   │   ├── MapScreen.js            # Map with emergency pins
│   │   └── SettingsScreen.js       # Network + app configuration
│   │
│   ├── services/                   # Business logic & hardware interfaces
│   │   ├── bleService.js           # BLE scanning, connecting, messaging
│   │   ├── wifiService.js          # Wi-Fi Direct / WebRTC (stub)
│   │   ├── locationService.js      # GPS + geofencing
│   │   ├── storageService.js       # AsyncStorage CRUD helpers
│   │   └── firebaseService.js      # Cloud sync (stub)
│   │
│   └── utils/                      # Shared utilities
│       ├── constants.js            # UUIDs, timeouts, config values
│       ├── theme.js                # Colors, typography, spacing
│       └── helpers.js              # Formatting, distance calc, dedup
│
├── App.js                          # Root component & navigation setup
├── package.json
└── README.md
```

---

## Installation

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | >= 20 |
| React Native CLI | latest |
| Android Studio | Hedgehog or later |
| Xcode | 15+ (macOS only) |
| CocoaPods | 1.14+ (iOS only) |

### Clone & Install

```bash
# 1. Clone the repository
git clone https://github.com/your-org/ResQlinK.git
cd ResQlinK

# 2. Install JS dependencies
npm install

# 3. iOS only — install native pods
cd ios && pod install && cd ..
```

### Run the App

```bash
# Start Metro bundler (keep this running in a separate terminal)
npm start

# Android
npm run android

# iOS (macOS only)
npm run ios
```

> **Note:** BLE and GPS features require a **physical device**. Simulators and emulators cannot test Bluetooth or real GPS data.

---

## Configuration

All configuration constants live in `src/utils/constants.js`:

```js
// src/utils/constants.js

// ─── Bluetooth ────────────────────────────────────────────────────────────────
export const BLE_SERVICE_UUID        = '12345678-1234-1234-1234-123456789ABC';
export const BLE_CHARACTERISTIC_UUID = '87654321-4321-4321-4321-CBA987654321';
export const BLE_DEVICE_NAME_PREFIX  = 'ResQlinK_';
export const BLE_SCAN_TIMEOUT_MS     = 10000;

// ─── Wi-Fi Mesh ───────────────────────────────────────────────────────────────
export const WIFI_MESH_NAME         = 'ResQlinK_Mesh';
export const WIFI_PORT              = 8080;
export const WIFI_DISCOVERY_TIMEOUT = 5000;

// ─── Mesh Routing ─────────────────────────────────────────────────────────────
export const MAX_HOPS               = 5;    // Discard messages after N hops
export const MESSAGE_TTL_MS         = 60 * 60 * 1000; // 1 hour

// ─── Alert Severity ───────────────────────────────────────────────────────────
export const SEVERITY = {
  CRITICAL : 'critical',
  HIGH     : 'high',
  MEDIUM   : 'medium',
  LOW      : 'low',
};

// ─── Storage Keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  ALERTS   : '@resqlink/alerts',
  MESSAGES : '@resqlink/messages',
  SETTINGS : '@resqlink/settings',
  NODE_ID  : '@resqlink/nodeId',
};
```

---

## Usage

### Sending an Emergency SOS

```js
import { bleService } from './src/services/bleService';
import { locationService } from './src/services/locationService';
import { SEVERITY } from './src/utils/constants';

// 1. Get current location
const location = await locationService.getCurrentLocation();

// 2. Build SOS payload
const sosPayload = {
  id       : uuid.v4(),
  type     : 'SOS',
  severity : SEVERITY.CRITICAL,
  message  : 'Building collapse — multiple people trapped',
  location : { lat: location.latitude, lng: location.longitude },
  timestamp: Date.now(),
  hops     : 0,
};

// 3. Broadcast over BLE mesh
await bleService.broadcastMessage(sosPayload);
```

### Receiving Alerts

```js
import { bleService } from './src/services/bleService';

// Register a listener — fires whenever a new alert arrives via BLE
bleService.onMessage((payload) => {
  if (payload.type === 'SOS') {
    // Save locally
    storageService.appendAlert(payload);
    // Show notification, update map pin, etc.
  }
});
```

### BLE Mesh Message Relay

```js
// bleService.js — simplified relay logic
async function handleIncomingMessage(raw) {
  const msg = JSON.parse(raw);

  // Deduplicate — drop if already seen
  if (seenMessageIds.has(msg.id)) return;
  seenMessageIds.add(msg.id);

  // Drop if TTL / hop limit exceeded
  if (msg.hops >= MAX_HOPS) return;
  if (Date.now() - msg.timestamp > MESSAGE_TTL_MS) return;

  // Deliver to local listeners
  listeners.forEach(fn => fn(msg));

  // Relay to all connected peers with incremented hop count
  const relayed = { ...msg, hops: msg.hops + 1 };
  await broadcastToConnectedPeers(relayed);
}
```

### Local Storage (AsyncStorage)

```js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './src/utils/constants';

// Save an alert
async function appendAlert(alert) {
  const existing = JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.ALERTS) || '[]');
  existing.unshift(alert); // newest first
  await AsyncStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(existing));
}

// Load all alerts
async function getAlerts() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.ALERTS);
  return raw ? JSON.parse(raw) : [];
}
```

---

## API & Services

### `bleService.js`

| Method | Description |
|---|---|
| `startScanning()` | Begin BLE device discovery |
| `stopScanning()` | Stop scanning |
| `connectToDevice(deviceId)` | Connect to a discovered ResQlinK node |
| `broadcastMessage(payload)` | Send a message to all connected peers |
| `onMessage(callback)` | Register a listener for incoming messages |
| `getConnectedDevices()` | Returns array of currently connected nodes |

### `locationService.js`

| Method | Description |
|---|---|
| `requestPermissions()` | Request GPS permissions from OS |
| `getCurrentLocation()` | One-shot location fetch |
| `watchLocation(callback)` | Continuous location stream |
| `stopWatching()` | Clear location watcher |
| `calculateDistance(a, b)` | Haversine distance between two GPS coords (km) |

### `storageService.js`

| Method | Description |
|---|---|
| `appendAlert(alert)` | Prepend new alert to local store |
| `getAlerts()` | Load all stored alerts |
| `clearAlerts()` | Wipe alert history |
| `saveSettings(settings)` | Persist user settings |
| `getSettings()` | Load user settings |

---

## Permissions

### Android — `android/app/src/main/AndroidManifest.xml`

```xml
<!-- Location (required for BLE on Android 12+) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

<!-- Bluetooth (Android 12+) -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"
    android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />

<!-- Legacy Bluetooth (Android 11 and below) -->
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />

<!-- Wi-Fi -->
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
```

### iOS — `ios/ResQlinK/Info.plist`

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>ResQlinK uses your location to include GPS coordinates in emergency alerts and show nearby incidents on the map.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>ResQlinK uses background location to relay emergency alerts even when the app is not in the foreground.</string>

<key>NSBluetoothAlwaysUsageDescription</key>
<string>ResQlinK uses Bluetooth to form a mesh network with nearby devices for offline emergency communication.</string>

<key>NSBluetoothPeripheralUsageDescription</key>
<string>ResQlinK uses Bluetooth to broadcast emergency alerts to nearby devices.</string>
```

---

## Security & Privacy

| Concern | Approach |
|---|---|
| Data storage | All data stored locally on-device via AsyncStorage; nothing sent externally by default |
| Location sharing | GPS coordinates only included when the user explicitly sends an SOS or enables location sharing |
| Personal identity | No account, login, or personal data collected. Nodes are identified by randomly-generated UUIDs |
| Message deduplication | UUID + timestamp prevents replay attacks across the mesh |
| Encryption | BLE transport encryption enabled (OS-level); end-to-end payload encryption planned (see Roadmap) |
| Cloud sync | Firebase sync is disabled by default and must be explicitly enabled in Settings |

---

## Testing

The app ships with simulation helpers for development on emulators:

```js
import { addTestAlert, addTestMessage, addTestLocation } from './src/utils/helpers';

// Inject a fake critical alert
addTestAlert({
  severity : 'critical',
  message  : 'Test: building fire at sector 7',
  location : { lat: 13.082, lng: 80.270 },
});

// Inject a fake chat message
addTestMessage({ sender: 'Node-3', text: 'Route via east corridor is clear.' });

// Add a random location pin on the map
addTestLocation();
```

Run tests:

```bash
# Unit tests
npm test

# Lint
npm run lint

# Type-check (if TypeScript is added)
npm run typecheck
```

---

## Roadmap

### Near-term
- [ ] End-to-end message encryption (AES-256 payload encryption)
- [ ] WebRTC peer-to-peer implementation for Wi-Fi mesh
- [ ] Wi-Fi Direct native module (Android)
- [ ] Push notifications for background alert delivery

### Medium-term
- [ ] Voice messages — compressed audio clips over BLE
- [ ] Image sharing — low-res photo attachments for emergencies
- [ ] Offline map tile download (region-based)
- [ ] Emergency group channels

### Long-term
- [ ] Internationalization (i18n) — multi-language support
- [ ] Background BLE mesh relay (foreground service on Android)
- [ ] LoRa radio integration for long-range mesh
- [ ] Satellite messaging fallback (Iridium / Garmin inReach)

---

## Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add voice message support'`
4. Push to your branch: `git push origin feat/your-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

> ⚠️ **ResQlinK is a supplementary emergency communication tool. Always contact your local emergency services (911, 112, 999, 100, etc.) in any life-threatening situation.** This app does not replace professional emergency response.
