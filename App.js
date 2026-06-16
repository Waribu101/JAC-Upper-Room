import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './constants/colors';
import { AuthProvider } from './lib/authContext';
import { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

import HomeScreen from './app/index';
import LandingScreen from './app/landing';
import AnnouncementsScreen from './app/announcements';
import DepartmentsScreen from './app/departments';
import MediaScreen from './app/media';
import MoreScreen from './app/more';
import DashboardScreen from './app/dashboard';
import NotesScreen from './app/notes';
import BibleScreen from './app/bible';


const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home-outline',
            Announcements: 'megaphone-outline',
            Departments: 'people-outline',
            Media: 'images-outline',
            Notes: 'book-outline',
            Bible: 'book-open-outline',
            More: 'menu-outline',
            Dashboard: 'shield-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarStyle: { backgroundColor: Colors.tabBar },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Announcements" component={AnnouncementsScreen} />
      <Tab.Screen name="Departments" component={DepartmentsScreen} />
      <Tab.Screen name="Media" component={MediaScreen} />
      <Tab.Screen name="Notes"  component={NotesScreen} />
      <Tab.Screen name="Bible"  component={BibleScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(err => {
      console.log('SW registration failed:', err);
    });
  });
}


function SplashScreen() {
  const pulse = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const tile1 = useRef(new Animated.Value(0)).current;
  const tile2 = useRef(new Animated.Value(0)).current;
  const tile3 = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  const tile1Y = useRef(new Animated.Value(30)).current;
  const tile2Y = useRef(new Animated.Value(30)).current;
  const tile3Y = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Logo pulse — breathes continuously
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Glow ring pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Tiles flow in one by one
    const tileAnim = (opacity, y, delay) =>
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
        Animated.spring(y, { toValue: 0, delay, useNativeDriver: true, tension: 80, friction: 8 }),
      ]);

    Animated.sequence([
      tileAnim(tile1, tile1Y, 300),
      tileAnim(tile2, tile2Y, 0),
      tileAnim(tile3, tile3Y, 0),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const tiles = [
    { label: 'JAC', opacity: tile1, y: tile1Y, color: '#E8960C' },
    { label: 'Upper', opacity: tile2, y: tile2Y, color: '#E8960C' },
    { label: 'Room', opacity: tile3, y: tile3Y, color: '#E8960C' },
  ];

  return (
    <View style={splash.container}>
      {/* Glow ring behind logo */}
      <Animated.View style={[splash.glowRing, { opacity: glowOpacity }]} />

      {/* Pulsing logo */}
      <Animated.View style={[splash.logoBox, { transform: [{ scale: pulse }] }]}>
        <Text style={splash.logoText}>JAC</Text>
      </Animated.View>

      {/* Tile row */}
      <View style={splash.tilesRow}>
      {tiles.map(({ label, opacity, y, color }) => (
          <Animated.View
          key={label}
          style={[splash.tile, { opacity, transform: [{ translateY: y }] }]}
        >
          
            <Text style={[splash.tileText, { color }]}>{label}</Text>
          </Animated.View>
        ))}
      </View>

      {/* Subtitle */}
      <Animated.Text style={[splash.subtitle, { opacity: subtitleOpacity }]}>
        KABATI · THIKA · KENYA
      </Animated.Text>
    </View>
  );
}

const splash = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B2E5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: 'rgba(232,150,12,0.45)',
  },
  logoBox: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  logoText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1B2E5E',
    letterSpacing: -1,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tile: {
    backgroundColor: 'rgba(232,150,12,0.18)',
    borderWidth: 1.5,
    borderColor: '#E8960C',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tileText: {
    color: '#E8960C',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(232,150,12,0.6)',
    letterSpacing: 3,
  },
});

export default function App() {
  const [showSplash,   setShowSplash]   = useState(true);
  const [showLanding,  setShowLanding]  = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash)  return <SplashScreen />;
  if (showLanding) return <LandingScreen onEnter={() => setShowLanding(false)} />;

  return (
    <AuthProvider>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </AuthProvider>
  );
}