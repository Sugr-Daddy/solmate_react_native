import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, ActivityIndicator } from 'react-native';
import WebWrapper from './src/components/WebWrapper';
import NetworkTestScreen from './src/components/NetworkTestScreen';

// Import screens
import SignInScreen from './src/screens/SignInScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import DiscoveryScreen from './src/screens/DiscoveryScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import WalletScreen from './src/screens/WalletScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

type AuthState = 'loading' | 'signed-out' | 'needs-onboarding' | 'signed-in';

interface User {
  id: string;
  walletAddress: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  bio: string;
  photos: string[];
  preferredTipAmount: number;
  ghostedCount: number;
  ghostedByCount: number;
  matchCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [onboardingWallet, setOnboardingWallet] = useState<string>('');
  const [showNetworkTest, setShowNetworkTest] = useState(false);

  // Check for existing session on app launch
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Show network test on mobile platforms first
        if (Platform.OS !== 'web') {
          setShowNetworkTest(true);
          return;
        }
        
        // For demo purposes, start with signed-out state
        // In a real app, you'd check for stored session/wallet data
        setAuthState('signed-out');
      } catch (error) {
        console.error('Error checking auth state:', error);
        setAuthState('signed-out');
      }
    };

    checkAuthState();
  }, []);

  const handleSignInSuccess = (user: User) => {
    setCurrentUser(user);
    setAuthState('signed-in');
  };

  const handleNeedsOnboarding = (walletAddress: string) => {
    setOnboardingWallet(walletAddress);
    setAuthState('needs-onboarding');
  };

  const handleOnboardingComplete = (user: User) => {
    setCurrentUser(user);
    setAuthState('signed-in');
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setOnboardingWallet('');
    setAuthState('signed-out');
  };

  const handleNetworkTestClose = () => {
    setShowNetworkTest(false);
    setAuthState('signed-out');
  };

  // Show network test modal on mobile
  if (showNetworkTest) {
    return (
      <QueryClientProvider client={queryClient}>
        <NetworkTestScreen onClose={handleNetworkTestClose} />
      </QueryClientProvider>
    );
  }

  const renderAuthenticationFlow = () => {
    if (authState === 'loading') {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
          <ActivityIndicator size="large" color="#00F90C" />
        </View>
      );
    }

    if (authState === 'signed-out') {
      return (
        <SignInScreen
          onSignInSuccess={handleSignInSuccess}
          onNeedsOnboarding={handleNeedsOnboarding}
        />
      );
    }

    if (authState === 'needs-onboarding') {
      return (
        <OnboardingScreen
          walletAddress={onboardingWallet}
          onComplete={handleOnboardingComplete}
        />
      );
    }

    return null;
  };

  const renderMainApp = () => (
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
            headerShown: false, // Disable default header since DiscoveryScreen has its own
          }}
        />
        <Tab.Screen 
          name="Matches" 
          component={MatchesScreen}
          options={{
            title: 'Matches',
            headerShown: false, // Let the screen handle its own header
          }}
        />
        <Tab.Screen 
          name="Wallet" 
          component={WalletScreen}
          options={{
            title: 'Wallet',
            headerShown: false, // Let the screen handle its own header
          }}
        />
        <Tab.Screen 
          name="Profile" 
          options={{
            title: 'Profile',
            headerShown: false, // Let the screen handle its own header
          }}
        >
          {() => <ProfileScreen currentUser={currentUser} onSignOut={handleSignOut} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );

  const appContent = (
    <QueryClientProvider client={queryClient}>
      {authState === 'signed-in' ? renderMainApp() : renderAuthenticationFlow()}
    </QueryClientProvider>
  );

  // Wrap with WebWrapper on web platform
  if (Platform.OS === 'web') {
    return <WebWrapper>{appContent}</WebWrapper>;
  }

  return appContent;
}
