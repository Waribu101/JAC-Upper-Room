import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Linking, ActivityIndicator, Modal, Image,
} from 'react-native';
import { Colors } from '../constants/colors';
import { getQuotes } from '../lib/firestore';

const MISSION = "To raise a generation of believers rooted in the Word, empowered by the Holy Spirit, and committed to transforming their communities for the glory of God.";
const VISION = "A church where every soul is discipled, every gift is activated, and every life reflects the Kingdom of God.";

const DEFAULT_MOTTO = {
  text: 'Endeavouring to keep the unity of the Spirit in the bond of peace.',
  reference: 'Ephesians 4:5',
};

export default function HomeScreen({ navigation }) {
  const [quotes, setQuotes] = useState([]);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [showAllQuotes, setShowAllQuotes] = useState(false);

  useEffect(() => {
    async function loadQuotes() {
      const data = await getQuotes();
      setQuotes(data);
      setQuoteLoading(false);
    }
    loadQuotes();
  }, []);

  const motto = quotes.find(q => q.isMotto) || quotes[0] || null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Hero Banner */}
      <Image
        source={require('../assets/images/jac-logo.jpg')}
        style={styles.logoImage}
        resizeMode="contain"
      />
      <View style={styles.heroBanner}>
        <Text style={styles.churchName}>JAC Upper Room</Text>
        <Text style={styles.churchLocation}>Kabati, Thika</Text>
        <View style={styles.divider} />
        <Text style={styles.missionLabel}>OUR MISSION</Text>
        <Text style={styles.missionText}>{MISSION}</Text>
      </View>

      {/* Fixed Motto — tap to browse all quotes */}
      <TouchableOpacity style={styles.quoteCard} onPress={() => setShowAllQuotes(true)} activeOpacity={0.85}>
        <Text style={styles.quoteIcon}>✝</Text>
        {quoteLoading ? (
          <ActivityIndicator color={Colors.white} style={{ marginVertical: 8 }} />
        ) : motto ? (
          <>
            <Text style={styles.quoteText}>"{motto.text}"</Text>
            <Text style={styles.quoteReference}>— {motto.reference}</Text>
          </>
        ) : (
          <>
            <Text style={styles.quoteText}>"{DEFAULT_MOTTO.text}"</Text>
            <Text style={styles.quoteReference}>— {DEFAULT_MOTTO.reference}</Text>
          </>
        )}
        <Text style={styles.quoteTapHint}>Tap to view all quotes →</Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Access</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Announcements')}>
          <Text style={styles.actionIcon}>📢</Text>
          <Text style={styles.actionText}>Announcements</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Departments')}>
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={styles.actionText}>Departments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => Linking.openURL('https://facebook.com')}>
          <Text style={styles.actionIcon}>📺</Text>
          <Text style={styles.actionText}>Watch Live</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('More')}>
          <Text style={styles.actionIcon}>🕐</Text>
          <Text style={styles.actionText}>Service Times</Text>
        </TouchableOpacity>
      </View>

      {/* Vision Card */}
      <View style={styles.visionCard}>
        <Text style={styles.visionLabel}>OUR VISION</Text>
        <Text style={styles.visionText}>{VISION}</Text>
      </View>

      {/* Welcome Note */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome Home 🙏</Text>
        <Text style={styles.welcomeText}>
          You are part of a family that believes, prays, and grows together. We are glad you are here.
        </Text>
      </View>

      <View style={styles.bottomSpacing} />

      {/* All Quotes Modal */}
      <Modal visible={showAllQuotes} animationType="slide" transparent onRequestClose={() => setShowAllQuotes(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All Quotes</Text>
              <TouchableOpacity onPress={() => setShowAllQuotes(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {quotes.length === 0 ? (
                <Text style={styles.modalEmpty}>No quotes yet.</Text>
              ) : quotes.map(q => (
                <View key={q.id} style={[styles.modalQuoteItem, q.isMotto && styles.modalQuoteItemMotto]}>
                  <Text style={styles.modalQuoteText}>"{q.text}"</Text>
                  <Text style={styles.modalQuoteRef}>
                    — {q.reference} · {q.type}{q.isMotto ? ' · ⭐ Church Motto' : ''}
                  </Text>
                </View>
              ))}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  logoImage: {
    width: 160,
    height: 100,
    alignSelf: 'center',
    marginBottom: 8,
  },
  heroBanner: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
    alignItems: 'center',
  },
  churchName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    letterSpacing: 1,
    textAlign: 'center',
  },
  churchLocation: {
    fontSize: 14,
    color: Colors.tabBarInactive,
    marginTop: 4,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  divider: {
    width: 48,
    height: 2,
    backgroundColor: Colors.secondary,
    marginVertical: 16,
    borderRadius: 2,
  },
  missionLabel: {
    fontSize: 11,
    color: Colors.secondary,
    letterSpacing: 3,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  missionText: {
    fontSize: 14,
    color: '#B8CCE0',
    textAlign: 'center',
    lineHeight: 22,
  },
  quoteCard: {
    backgroundColor: Colors.secondary,
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  quoteIcon: {
    fontSize: 20,
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  quoteText: {
    fontSize: 15,
    color: Colors.primary,
    fontStyle: 'italic',
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'center',
  },
  quoteReference: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 16,
    marginTop: 28,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionText: { fontSize: 13, fontWeight: '600', color: Colors.primary, textAlign: 'center' },
  visionCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  visionLabel: {
    fontSize: 11,
    color: Colors.secondary,
    letterSpacing: 3,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  visionText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  welcomeCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  welcomeTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.white, marginBottom: 8 },
  welcomeText: { fontSize: 14, color: '#B8CCE0', textAlign: 'center', lineHeight: 22 },
  bottomSpacing: { height: 32 },
  quoteTapHint: { fontSize: 11, color: Colors.primary, textAlign: 'center', marginTop: 10, fontWeight: '600' },
modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', padding: 20 },
modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary },
modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
modalCloseText: { fontSize: 14, color: Colors.text, fontWeight: '700' },
modalQuoteItem: { backgroundColor: Colors.background, borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
modalQuoteItemMotto: { borderColor: Colors.secondary, borderWidth: 1.5 },
modalQuoteText: { fontSize: 14, color: Colors.text, fontStyle: 'italic', lineHeight: 21 },
modalQuoteRef: { fontSize: 12, color: Colors.secondary, marginTop: 8, fontWeight: '700' },
modalEmpty: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginVertical: 20 },
});