import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Colors } from '../constants/colors';
import { getAnnouncements } from '../lib/firestore';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'youth', label: 'Youth' },
  { id: 'sunday_school', label: 'Sunday School' },
];

function timeAgo(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function departmentColor(dept) {
  const map = {
    all: Colors.primary,
    men: '#1A3C5E',
    women: '#C8A84B',
    youth: '#2E7D32',
    sunday_school: '#7B1FA2',
  };
  return map[dept] || Colors.primary;
}

function departmentLabel(dept) {
  const map = {
    all: 'General',
    men: 'Men',
    women: 'Women',
    youth: 'Youth',
    sunday_school: 'Sunday School',
  };
  return map[dept] || dept;
}

export default function AnnouncementsScreen() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadAnnouncements(dept = activeFilter) {
    setLoading(true);
    const data = await getAnnouncements(dept);
    setAnnouncements(data);
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    const data = await getAnnouncements(activeFilter);
    setAnnouncements(data);
    setRefreshing(false);
  }

  useEffect(() => {
    loadAnnouncements(activeFilter);
    const interval = setInterval(() => loadAnnouncements(activeFilter), 30000);
    return () => clearInterval(interval);
  }, [activeFilter]);
  
  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.filterChip,
              activeFilter === f.id && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(f.id)}
          >
            <Text
              style={[
                styles.filterLabel,
                activeFilter === f.id && styles.filterLabelActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Announcements List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{ marginTop: 60 }}
        />
      ) : announcements.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No announcements yet</Text>
          <Text style={styles.emptySubtext}>Check back soon!</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {announcements.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.deptBadge,
                    { backgroundColor: departmentColor(item.department) },
                  ]}
                >
                  <Text style={styles.deptBadgeText}>
                    {departmentLabel(item.department)}
                  </Text>
                </View>
                <Text style={styles.timeAgo}>{timeAgo(item.date)}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.body}</Text>
              <Text style={styles.postedBy}>— {item.postedBy}</Text>
            </View>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterBar: {
    maxHeight: 56,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  filterLabelActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deptBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  deptBadgeText: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeAgo: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  postedBy: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
});