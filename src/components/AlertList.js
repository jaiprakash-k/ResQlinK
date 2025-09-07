import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';
import { EMERGENCY_LEVELS, EMERGENCY_COLORS } from '../utils/constants';
import MessageCard from './MessageCard';

const AlertList = ({
  alerts = [],
  onRefresh = null,
  onAlertPress = null,
  refreshing = false,
  style = {},
}) => {
  const [filteredAlerts, setFilteredAlerts] = useState(alerts);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    filterAlerts();
  }, [alerts, filter]);

  const filterAlerts = () => {
    if (filter === 'all') {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter(alert => alert.level === filter));
    }
  };

  const getFilterButtonStyle = (filterType) => {
    return [
      styles.filterButton,
      filter === filterType && styles.activeFilterButton,
    ];
  };

  const getFilterTextStyle = (filterType) => {
    return [
      styles.filterText,
      filter === filterType && styles.activeFilterText,
    ];
  };

  const renderAlert = ({ item }) => (
    <MessageCard
      message={item}
      onPress={() => onAlertPress && onAlertPress(item)}
      showTimestamp={true}
      showSender={true}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Alerts</Text>
      <Text style={styles.emptyStateText}>
        {filter === 'all' 
          ? 'No emergency alerts in your area'
          : `No ${filter} level alerts found`
        }
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Emergency Alerts</Text>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={getFilterButtonStyle('all')}
          onPress={() => setFilter('all')}
        >
          <Text style={getFilterTextStyle('all')}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={getFilterButtonStyle(EMERGENCY_LEVELS.CRITICAL)}
          onPress={() => setFilter(EMERGENCY_LEVELS.CRITICAL)}
        >
          <Text style={getFilterTextStyle(EMERGENCY_LEVELS.CRITICAL)}>Critical</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={getFilterButtonStyle(EMERGENCY_LEVELS.HIGH)}
          onPress={() => setFilter(EMERGENCY_LEVELS.HIGH)}
        >
          <Text style={getFilterTextStyle(EMERGENCY_LEVELS.HIGH)}>High</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={getFilterButtonStyle(EMERGENCY_LEVELS.MEDIUM)}
          onPress={() => setFilter(EMERGENCY_LEVELS.MEDIUM)}
        >
          <Text style={getFilterTextStyle(EMERGENCY_LEVELS.MEDIUM)}>Medium</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={filteredAlerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  
  header: {
    marginBottom: SPACING.lg,
  },
  
  title: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.md,
  },
  
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  
  filterButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  
  filterText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  
  activeFilterText: {
    color: COLORS.text,
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  
  emptyStateTitle: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.sm,
  },
  
  emptyStateText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.md,
  },
});

export default AlertList;
