import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import WebWrapper from './src/components/WebWrapper';

// Import screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import DiscoveryScreen from './src/screens/DiscoveryScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import WalletScreen from './src/screens/WalletScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

export default function App() {
  const appContent = (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;
              
              if (route.name === 'Discovery') {
                iconName = focused ? 'heart' : 'heart-outline';
              } else if (route.name === 'Matches') {
                iconName = focused ? 'people' : 'people-outline';
              } else if (route.name === 'Wallet') {
                iconName = focused ? 'wallet' : 'wallet-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              } else {
                iconName = 'help-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#00F90C',
            tabBarInactiveTintColor: '#A0A0A0',
            tabBarStyle: {
              backgroundColor: '#1A1A1A',
              borderTopColor: '#333333',
              borderTopWidth: 1,
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
            },
            headerStyle: {
              backgroundColor: '#0A0A0A',
              borderBottomColor: '#333333',
              borderBottomWidth: 1,
            },
            headerTitleStyle: {
              color: '#FFFFFF',
              fontWeight: 'bold',
              fontFamily: 'Inter',
            },
            headerTintColor: '#00F90C',
          })}
        >
          <Tab.Screen 
            name="Discovery" 
            component={DiscoveryScreen}
            options={{
              title: 'Solmate',
              headerShown: true,
            }}
          />
          <Tab.Screen 
            name="Matches" 
            component={MatchesScreen}
            options={{
              title: 'Matches',
              headerShown: true,
            }}
          />
          <Tab.Screen 
            name="Wallet" 
            component={WalletScreen}
            options={{
              title: 'Wallet',
              headerShown: true,
            }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{
              title: 'Profile',
              headerShown: true,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );

  // Wrap with WebWrapper on web platform
  if (Platform.OS === 'web') {
    return <WebWrapper>{appContent}</WebWrapper>;
  }

  return appContent;
}
