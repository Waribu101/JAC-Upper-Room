import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Linking, ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/colors';
import { getQuotes } from '../lib/firestore';
import { Image } from 'react-native';

const MISSION = "To raise a generation of believers rooted in the Word, empowered by the Holy Spirit, and committed to transforming their communities for the glory of God.";
const VISION = "A church where every soul is discipled, every gift is activated, and every life reflects the Kingdom of God.";

export default function HomeScreen({ navigation }) {
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);

  useEffect(() => {
    async function loadQuote() {
      const quotes = await getQuotes();
      if (quotes.length > 0) {
        const dayOfYear = Math.floor(
          (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
        );
        const index = dayOfYear % quotes.length;
        setQuote(quotes[index]);
      }
      setQuoteLoading(false);
    }
    loadQuote();
  }, []);

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

      {/* Daily Quote */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteIcon}>✝</Text>
        {quoteLoading ? (
          <ActivityIndicator color={Colors.white} style={{ marginVertical: 8 }} />
        ) : quote ? (
          <>
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.quoteReference}>— {quote.reference}</Text>
          </>
        ) : (
          <Text style={styles.quoteText}>
            "Faith is the substance of things hoped for."
          </Text>
        )}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Access</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Announcements')}
        >
          <Text style={styles.actionIcon}>📢</Text>
          <Text style={styles.actionText}>Announcements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Departments')}
        >
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={styles.actionText}>Departments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Linking.openURL('https://facebook.com')}
        >
          <Text style={styles.actionIcon}>📺</Text>
          <Text style={styles.actionText}>Watch Live</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('More')}
        >
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
          You are part of a family that believes, prays, and grows together.
          We are glad you are here.
        </Text>
      </View>

      <View style={styles.bottomSpacing} />
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
});