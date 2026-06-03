import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './constants/colors';
import { AuthProvider } from './lib/authContext';
import { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import HomeScreen from './app/index';
import AnnouncementsScreen from './app/announcements';
import DepartmentsScreen from './app/departments';
import MediaScreen from './app/media';
import MoreScreen from './app/more';
import DashboardScreen from './app/dashboard';

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
  return (
    <View style={splashStyles.container}>
      <Image
        source={require('./assets/images/jac-logo.jpg')}
        style={splashStyles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 24,
  },
});

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <AuthProvider>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </AuthProvider>
  );
}