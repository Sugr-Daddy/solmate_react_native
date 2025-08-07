import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { solanaService } from '../services/solana';

interface SignInScreenProps {
  onSignInSuccess: (user: any) => void;
  onNeedsOnboarding: (walletAddress: string) => void;
}

const SignInScreen: React.FC<SignInScreenProps> = ({ onSignInSuccess, onNeedsOnboarding }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const queryClient = useQueryClient();

  // Connect Wallet Mutation
  const connectWalletMutation = useMutation({
    mutationFn: async () => {
      const wallet = await solanaService.connectWallet();
      return wallet;
    },
    onSuccess: async (walletData) => {
      if (walletData?.isConnected && walletData.address) {
        setWalletAddress(walletData.address);
        await handleSignIn(walletData.address);
      }
    },
    onError: (error) => {
      console.error('Wallet connection failed:', error);
      Alert.alert('Connection Error', 'Failed to connect wallet. Please try again.');
    },
  });

  // Sign In Mutation
  const signInMutation = useMutation({
    mutationFn: async (address: string) => {
      return await apiService.signInUser(address);
    },
    onSuccess: ({ user, needsOnboarding }) => {
      if (needsOnboarding) {
        onNeedsOnboarding(walletAddress);
      } else if (user) {
        onSignInSuccess(user);
      }
    },
    onError: (error) => {
      console.error('Sign in failed:', error);
      Alert.alert('Sign In Error', 'Failed to sign in. Please try again.');
    },
  });

  const handleSignIn = async (address: string) => {
    if (!address.trim()) {
      Alert.alert('Invalid Input', 'Please enter a valid wallet address.');
      return;
    }
    
    signInMutation.mutate(address);
  };

  const handleConnectWallet = () => {
    setIsConnectingWallet(true);
    connectWalletMutation.mutate();
  };

  const handleManualSignIn = () => {
    handleSignIn(walletAddress);
  };

  // Demo accounts for easy testing
  const demoAccounts = [
    { name: 'Sugar Daddy Demo', wallet: 'demo-sugar-daddy-1' },
    { name: 'Sophia (Sugar Baby)', wallet: 'demo-sugar-baby-1' },
    { name: 'Emma (Sugar Baby)', wallet: 'demo-sugar-baby-2' },
  ];

  const handleDemoLogin = (wallet: string) => {
    setWalletAddress(wallet);
    handleSignIn(wallet);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>💎 Solmate</Text>
          <Text style={styles.tagline}>Where Sugar Meets Solana</Text>
          <Text style={styles.description}>
            Connect with amazing people through secure, blockchain-powered dating
          </Text>
        </View>

        {/* Sign In Options */}
        <View style={styles.signInContainer}>
          <Text style={styles.sectionTitle}>Sign In</Text>
          
          {/* Wallet Connect Button */}
          <TouchableOpacity
            onPress={handleConnectWallet}
            style={styles.connectWalletButton}
            disabled={connectWalletMutation.isPending || isConnectingWallet}
          >
            <Ionicons name="wallet" size={24} color="#000000" />
            <Text style={styles.connectWalletButtonText}>
              {connectWalletMutation.isPending ? 'Connecting...' : 'Connect Solana Wallet'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Manual Wallet Address Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Wallet Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your Solana wallet address..."
              placeholderTextColor="#6B7280"
              value={walletAddress}
              onChangeText={setWalletAddress}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            onPress={handleManualSignIn}
            style={styles.signInButton}
            disabled={signInMutation.isPending || !walletAddress.trim()}
          >
            <Text style={styles.signInButtonText}>
              {signInMutation.isPending ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Demo Accounts Section */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>🎯 Quick Demo Accounts</Text>
            <Text style={styles.demoSubtitle}>Try the app with pre-made profiles</Text>
            
            {demoAccounts.map((account, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDemoLogin(account.wallet)}
                style={styles.demoButton}
                disabled={signInMutation.isPending}
              >
                <Ionicons 
                  name={account.name.includes('Sugar Daddy') ? 'diamond' : 'heart'} 
                  size={20} 
                  color="#00F90C" 
                />
                <Text style={styles.demoButtonText}>{account.name}</Text>
                <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          {/* New User */}
          <View style={styles.newUserSection}>
            <Text style={styles.newUserText}>New to Solmate?</Text>
            <Text style={styles.newUserSubtext}>
              Connect your wallet and we'll guide you through creating your profile!
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 20,
    color: '#00F90C',
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  signInContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  connectWalletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F90C',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  connectWalletButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151',
  },
  dividerText: {
    color: '#6B7280',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  signInButton: {
    backgroundColor: '#374151',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 30,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoSection: {
    marginBottom: 30,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  demoSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  demoButtonText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  newUserSection: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  newUserText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  newUserSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SignInScreen;
