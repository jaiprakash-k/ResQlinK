import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../utils/theme';

const StatusIndicator = ({
  status,
  label,
  onPress = null,
  showLabel = true,
  size = 'medium',
  style = {},
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
      case 'online':
      case 'active':
        return COLORS.success;
      case 'connecting':
      case 'scanning':
      case 'loading':
        return COLORS.warning;
      case 'disconnected':
      case 'offline':
      case 'inactive':
        return COLORS.error;
      case 'error':
      case 'failed':
        return COLORS.error;
      default:
        return COLORS.textTertiary;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'scanning':
        return 'Scanning...';
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'error':
        return 'Error';
      case 'failed':
        return 'Failed';
      default:
        return status || 'Unknown';
    }
  };

  const getIndicatorSize = () => {
    switch (size) {
      case 'small':
        return 8;
      case 'large':
        return 16;
      default:
        return 12;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return TYPOGRAPHY.fontSize.xs;
      case 'large':
        return TYPOGRAPHY.fontSize.md;
      default:
        return TYPOGRAPHY.fontSize.sm;
    }
  };

  const statusColor = getStatusColor();
  const indicatorSize = getIndicatorSize();
  const textSize = getTextSize();

  const containerStyle = [
    styles.container,
    onPress && styles.pressable,
    style,
  ];

  const content = (
    <View style={styles.content}>
      <View
        style={[
          styles.indicator,
          {
            width: indicatorSize,
            height: indicatorSize,
            backgroundColor: statusColor,
          },
        ]}
      />
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              fontSize: textSize,
              color: statusColor,
            },
          ]}
        >
          {label || getStatusText()}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  pressable: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  indicator: {
    borderRadius: 50,
    marginRight: SPACING.xs,
  },
  
  label: {
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default StatusIndicator;
