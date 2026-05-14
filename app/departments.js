import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Colors } from '../constants/colors';
import { getDepartments } from '../lib/firestore';

function DepartmentCard({ item, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: item.color }]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: item.color }]}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.cardMeets}>🕐 {item.meets}</Text>
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  );
}

function DepartmentDetail({ item, onBack }) {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={[styles.detailHero, { backgroundColor: item.color }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.detailIcon}>{item.icon}</Text>
        <Text style={styles.detailName}>{item.name}</Text>
        <Text style={styles.detailDept}>Department</Text>
      </View>

      <View style={styles.detailContent}>
        {/* About */}
        <View style={styles.detailSection}>
          <Text style={[styles.detailSectionTitle, { color: item.color }]}>
            ABOUT
          </Text>
          <Text style={styles.detailSectionText}>{item.description}</Text>
        </View>

        {/* Meets */}
        <View style={styles.detailInfoRow}>
          <View style={[styles.detailInfoIcon, { backgroundColor: item.color }]}>
            <Text style={styles.detailInfoEmoji}>🕐</Text>
          </View>
          <View>
            <Text style={styles.detailInfoLabel}>MEETS</Text>
            <Text style={styles.detailInfoValue}>{item.meets}</Text>
          </View>
        </View>

        {/* Leader */}
        <View style={styles.detailInfoRow}>
          <View style={[styles.detailInfoIcon, { backgroundColor: item.color }]}>
            <Text style={styles.detailInfoEmoji}>👤</Text>
          </View>
          <View>
            <Text style={styles.detailInfoLabel}>DEPARTMENT LEADER</Text>
            <Text style={styles.detailInfoValue}>{item.leader}</Text>
          </View>
        </View>

        {/* Welcome note */}
        <View style={[styles.welcomeBox, { borderLeftColor: item.color }]}>
          <Text style={styles.welcomeText}>
            You are welcome to join the {item.name} department.
            We meet regularly and would love to have you with us. 🙏
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default function DepartmentsScreen() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);

  async function loadDepartments() {
    const data = await getDepartments();
    setDepartments(data);
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadDepartments();
    setRefreshing(false);
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  // Show detail view if a department is selected
  if (selected) {
    return (
      <DepartmentDetail
        item={selected}
        onBack={() => setSelected(null)}
      />
    );
  }

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={Colors.primary}
        style={{ marginTop: 60 }}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Departments</Text>
        <Text style={styles.headerSubtitle}>
          Find your place and grow with us
        </Text>
      </View>

      {/* Department Cards */}
      <View style={styles.list}>
        {departments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No departments listed yet</Text>
          </View>
        ) : (
          departments.map(item => (
            <DepartmentCard
              key={item.id}
              item={item}
              onPress={setSelected}
            />
          ))
        )}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#B8CCE0',
    marginTop: 6,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 3,
    lineHeight: 19,
  },
  cardMeets: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 5,
    fontWeight: '500',
  },
  cardArrow: {
    fontSize: 28,
    color: Colors.border,
    marginLeft: 8,
  },
  // ── Detail View ──
  detailHero: {
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  backText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  detailIcon: {
    fontSize: 52,
    marginBottom: 10,
  },
  detailName: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  detailDept: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  detailContent: {
    padding: 20,
    gap: 16,
  },
  detailSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  detailSectionText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  detailInfoRow: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  detailInfoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailInfoEmoji: {
    fontSize: 20,
  },
  detailInfoLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  detailInfoValue: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  welcomeBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
});