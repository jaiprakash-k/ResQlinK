import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';
import { EMERGENCY_LEVELS, EMERGENCY_COLORS } from '../utils/constants';

const MessageCard = ({
  message,
  onPress = null,
  showTimestamp = true,
  showSender = true,
  style = {},
}) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getEmergencyColor = (level) => {
    return EMERGENCY_COLORS[level] || COLORS.primary;
  };

  const getCardStyle = () => {
    const baseStyle = [styles.card];
    
    // Add emergency level indicator
    if (message.level) {
      baseStyle.push({
        borderLeftWidth: 4,
        borderLeftColor: getEmergencyColor(message.level),
      });
    }
    
    return [...baseStyle, style];
  };

  return (
    <TouchableOpacity
      style={getCardStyle()}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.header}>
        {showSender && (
          <Text style={styles.sender}>
            {message.sender || 'Unknown'}
          </Text>
        )}
        {showTimestamp && (
          <Text style={styles.timestamp}>
            {formatTimestamp(message.timestamp)}
          </Text>
        )}
      </View>
      
      <Text style={styles.message} numberOfLines={3}>
        {message.message}
      </Text>
      
      {message.type && (
        <View style={styles.typeContainer}>
          <View
            style={[
              styles.typeIndicator,
              { backgroundColor: getEmergencyColor(message.level) },
            ]}
          />
          <Text style={styles.typeText}>
            {message.type.toUpperCase()}
          </Text>
        </View>
      )}
      
      {message.distance && (
        <Text style={styles.distance}>
          📍 {message.distance}
        </Text>
      )}
      
      {message.location && (
        <Text style={styles.location}>
          📍 {message.location.latitude.toFixed(4)}, {message.location.longitude.toFixed(4)}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    ...SHADOWS.sm,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  
  sender: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    flex: 1,
  },
  
  timestamp: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  
  message: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.md,
    marginBottom: SPACING.sm,
  },
  
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  
  typeText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  
  distance: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.xs,
  },
  
  location: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: 'monospace',
    marginTop: SPACING.xs,
  },
});

export default MessageCard;
