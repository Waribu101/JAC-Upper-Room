import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Linking, ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/colors';
import { getServices, getLeadership } from '../lib/firestore';

function SectionHeader({ title }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLine} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

function ServiceCard({ item }) {
  return (
    <View style={styles.serviceCard}>
      <View style={styles.serviceIconBox}>
        <Text style={styles.serviceIcon}>🕐</Text>
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDetail}>{item.day} • {item.time}</Text>
        <Text style={styles.serviceLocation}>📍 {item.location}</Text>
      </View>
    </View>
  );
}

function LeaderCard({ item }) {
  const initials = item.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.leaderCard}>
      <View style={styles.leaderAvatar}>
        <Text style={styles.leaderInitials}>{initials}</Text>
      </View>
      <View style={styles.leaderInfo}>
        <Text style={styles.leaderName}>{item.name}</Text>
        <Text style={styles.leaderRole}>{item.role}</Text>
      </View>
    </View>
  );
}

export default function MoreScreen() {
  const [services, setServices] = useState([]);
  const [leadership, setLeadership] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, l] = await Promise.all([getServices(), getLeadership()]);
      setServices(s);
      setLeadership(l);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <SectionHeader title="SERVICE TIMES" />
      {services.length === 0
        ? <Text style={styles.emptyText}>No services listed yet.</Text>
        : services.map(item => <ServiceCard key={item.id} item={item} />)
      }

      <SectionHeader title="OUR LEADERSHIP" />
      {leadership.length === 0
        ? <Text style={styles.emptyText}>No leadership listed yet.</Text>
        : leadership.map(item => <LeaderCard key={item.id} item={item} />)
      }

      <SectionHeader title="CONTACT US" />
      <View style={styles.contactCard}>
        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => Linking.openURL('tel:+254700000000')}
        >
          <Text style={styles.contactIcon}>📞</Text>
          <View>
            <Text style={styles.contactLabel}>Phone</Text>
            <Text style={styles.contactValue}>+254 700 000 000</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.contactDivider} />
        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => Linking.openURL('mailto:jacupperroom@gmail.com')}
        >
          <Text style={styles.contactIcon}>✉️</Text>
          <View>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>jacupperroom@gmail.com</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.contactDivider} />
        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => Linking.openURL('https://maps.google.com/?q=Kabati,Thika,Kenya')}
        >
          <Text style={styles.contactIcon}>📍</Text>
          <View>
            <Text style={styles.contactLabel}>Location</Text>
            <Text style={styles.contactValue}>Kabati, Thika, Kenya</Text>
          </View>
        </TouchableOpacity>
      </View>
      <SectionHeader title="ADMIN" />
<TouchableOpacity
  style={styles.adminBtn}
  onPress={() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  }}
>
  <Text style={styles.adminBtnText}>⚙️  Admin Panel</Text>
</TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 24, marginBottom: 14,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: Colors.secondary,
    letterSpacing: 2, marginHorizontal: 12,
  },
  serviceCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  serviceIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary, alignItems: 'center',
    justifyContent: 'center', marginRight: 14,
  },
  serviceIcon: { fontSize: 20 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  serviceDetail: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  serviceLocation: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  leaderCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  leaderAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primary, alignItems: 'center',
    justifyContent: 'center', marginRight: 14,
  },
  leaderInitials: { fontSize: 18, fontWeight: '700', color: Colors.white },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  leaderRole: { fontSize: 13, color: Colors.secondary, marginTop: 2, fontWeight: '500' },
  contactCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 4,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  contactIcon: { fontSize: 22 },
  contactLabel: {
    fontSize: 11, color: Colors.textMuted, fontWeight: '600',
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  contactValue: { fontSize: 14, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  contactDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 12 },
  adminBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  adminBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});