import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

const EmergencyButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  icon = null,
  style = {},
  textStyle = {},
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Variant styles
    switch (variant) {
      case 'emergency':
        baseStyle.push(styles.emergencyButton);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'warning':
        baseStyle.push(styles.warningButton);
        break;
      default:
        baseStyle.push(styles.primaryButton);
    }
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallButton);
        break;
      case 'medium':
        baseStyle.push(styles.mediumButton);
        break;
      default:
        baseStyle.push(styles.largeButton);
    }
    
    // Disabled style
    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }
    
    return [...baseStyle, style];
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText];
    
    // Variant text styles
    switch (variant) {
      case 'emergency':
        baseStyle.push(styles.emergencyText);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryText);
        break;
      case 'warning':
        baseStyle.push(styles.warningText);
        break;
      default:
        baseStyle.push(styles.primaryText);
    }
    
    // Size text styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallText);
        break;
      case 'medium':
        baseStyle.push(styles.mediumText);
        break;
      default:
        baseStyle.push(styles.largeText);
    }
    
    return [...baseStyle, textStyle];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator
            color={variant === 'secondary' ? COLORS.primary : COLORS.text}
            size="small"
          />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={getTextStyle()}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variant styles
  primaryButton: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  
  emergencyButton: {
    backgroundColor: COLORS.emergency,
    ...SHADOWS.emergency,
  },
  
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  
  warningButton: {
    backgroundColor: COLORS.warning,
    ...SHADOWS.md,
  },
  
  // Size styles
  smallButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 40,
  },
  
  mediumButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 50,
  },
  
  largeButton: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    minHeight: 60,
  },
  
  // Disabled style
  disabledButton: {
    backgroundColor: COLORS.textDisabled,
    opacity: 0.6,
  },
  
  // Button content
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconContainer: {
    marginRight: SPACING.sm,
  },
  
  // Text styles
  buttonText: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
  },
  
  primaryText: {
    color: COLORS.text,
  },
  
  emergencyText: {
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  
  secondaryText: {
    color: COLORS.primary,
  },
  
  warningText: {
    color: COLORS.text,
  },
  
  // Size text styles
  smallText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  
  mediumText: {
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  
  largeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
});

export default EmergencyButton;
