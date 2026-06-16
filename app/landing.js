import { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Linking, Platform,
} from 'react-native';
import { Colors } from '../constants/colors';

export default function LandingScreen({ onEnter }) {
  const crossOpacity = useRef(new Animated.Value(0)).current;
  const crossY       = useRef(new Animated.Value(-20)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const ctaOpacity   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(crossOpacity,   { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
        Animated.spring(crossY,         { toValue: 0, delay: 200, useNativeDriver: true, tension: 60, friction: 8 }),
      ]),
      Animated.timing(contentOpacity,   { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(ctaOpacity,       { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.logoRow}>
        <View style={s.logoBox}>
          <Text style={s.logoText}>JAC</Text>
        </View>
        <Text style={s.logoName}>UPPER ROOM</Text>
      </View>

      {/* Cross */}
      <Animated.Text style={[s.cross, { opacity: crossOpacity, transform: [{ translateY: crossY }] }]}>
        ✝
      </Animated.Text>

      {/* Main content */}
      <Animated.View style={[s.content, { opacity: contentOpacity }]}>
        <Text style={s.eyebrow}>WELCOME HOME</Text>
        <Text style={s.headline}>
          A place to{' '}
          <Text style={s.headlineAccent}>worship,</Text>
          {'\n'}grow & belong.
        </Text>

        {/* Scripture */}
        <View style={s.verseWrap}>
          <View style={s.verseLine} />
          <View style={s.verseInner}>
            <Text style={s.verseText}>
              "Where two or three gather in my name, there am I with them."
            </Text>
            <Text style={s.verseRef}>— Matthew 18:20</Text>
          </View>
        </View>

        {/* Info pills */}
        <View style={s.pillRow}>
          {['Sunday 10AM', 'Kabati · Thika', 'Bible Study', 'Community'].map(label => (
            <View key={label} style={s.pill}>
              <Text style={s.pillText}>{label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* CTAs */}
      <Animated.View style={[s.ctaWrap, { opacity: ctaOpacity }]}>
        <TouchableOpacity style={s.btnPrimary} onPress={onEnter} activeOpacity={0.85}>
          <Text style={s.btnPrimaryText}>Enter the Upper Room →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.btnSecondary}
          onPress={() => Linking.openURL('https://www.youtube.com')}
          activeOpacity={0.85}
        >
          <Text style={s.btnSecondaryText}>Watch Us Live on YouTube</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'web' ? 48 : 60,
    paddingBottom: 0,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 36 },
  logoBox: {
    width: 38, height: 38, borderRadius: 8, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText:  { fontSize: 13, fontWeight: '700', color: Colors.primary },
  logoName:  { fontSize: 11, color: 'rgba(244,246,250,0.55)', letterSpacing: 2 },

  cross: { fontSize: 48, color: Colors.secondary, marginBottom: 20 },

  content: { flex: 1 },
  eyebrow: { fontSize: 10, letterSpacing: 3, color: 'rgba(232,148,58,0.7)', fontWeight: '600', marginBottom: 12 },
  headline: { fontSize: 30, fontWeight: '700', color: Colors.white, lineHeight: 38, marginBottom: 24 },
  headlineAccent: { color: Colors.secondary },

  verseWrap: {
    flexDirection: 'row', gap: 14, marginBottom: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8, padding: 14,
  },
  verseLine:  { width: 3, borderRadius: 2, backgroundColor: Colors.accent, opacity: 0.6 },
  verseInner: { flex: 1 },
  verseText:  { fontSize: 13, color: 'rgba(244,246,250,0.75)', fontStyle: 'italic', lineHeight: 20 },
  verseRef:   { fontSize: 11, color: Colors.accent, marginTop: 8, fontWeight: '600', letterSpacing: 0.8 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5, borderColor: 'rgba(232,148,58,0.3)',
    borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12,
  },
  pillText: { fontSize: 11, color: 'rgba(244,246,250,0.65)' },

  ctaWrap: {
    paddingVertical: 28,
    borderTopWidth: 0.5, borderTopColor: 'rgba(232,148,58,0.15)',
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: Colors.secondary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  btnPrimaryText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  btnSecondary: {
    borderWidth: 0.5, borderColor: 'rgba(232,148,58,0.4)',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  btnSecondaryText: { fontSize: 13, color: 'rgba(244,246,250,0.6)' },
});