// ResQlinK Dark Theme Configuration
export const COLORS = {
  // Primary Colors
  primary: '#FF4444', // Emergency Red
  primaryDark: '#CC0000',
  primaryLight: '#FF6666',
  
  // Secondary Colors
  secondary: '#4A90E2', // Trust Blue
  secondaryDark: '#357ABD',
  secondaryLight: '#6BA3F5',
  
  // Background Colors
  background: '#1A1A1A', // Very Dark Gray
  backgroundSecondary: '#2D2D2D', // Dark Gray
  backgroundTertiary: '#404040', // Medium Dark Gray
  
  // Surface Colors
  surface: '#2A2A2A',
  surfaceLight: '#3A3A3A',
  
  // Text Colors
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textTertiary: '#999999',
  textDisabled: '#666666',
  
  // Status Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Emergency Colors
  emergency: '#FF1744',
  emergencyDark: '#D50000',
  emergencyLight: '#FF5983',
  
  // Border Colors
  border: '#404040',
  borderLight: '#555555',
  borderDark: '#2A2A2A',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Transparent
  transparent: 'transparent',
};

export const TYPOGRAPHY = {
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    emergency: 48, // Large for emergency buttons
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 50,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergency: {
    shadowColor: COLORS.emergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
};

// Common Styles
export const COMMON_STYLES = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  text: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
  },
  
  textSecondary: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  
  textEmergency: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.emergency,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },
  
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  
  buttonText: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  
  emergencyButton: {
    backgroundColor: COLORS.emergency,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    ...SHADOWS.emergency,
  },
  
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    ...SHADOWS.sm,
  },
  
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
};
