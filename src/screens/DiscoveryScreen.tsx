import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-deck-swiper';
import { useQuery } from '@tanstack/react-query';
import MatchCard from '../components/MatchCard';
import { User, Match } from '../types';
import { solanaService } from '../services/solana';
import { apiService } from '../services/api';

const { width, height } = Dimensions.get('window');

const DiscoveryScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [walletData, setWalletData] = useState<any>(null);
  
  // For demo purposes, we'll use the sugar daddy wallet
  const currentUserWallet = 'demo-sugar-daddy-1';

  // Fetch discovery users from database
  const { data: discoveryUsers, isLoading, refetch } = useQuery({
    queryKey: ['discovery-users', currentUserWallet],
    queryFn: () => apiService.getDiscoveryUsers(currentUserWallet, 10),
    enabled: !!currentUserWallet,
  });

  // Update local state when data changes
  useEffect(() => {
    if (discoveryUsers) {
      // Transform database users to match the expected User type
      const transformedUsers = discoveryUsers.map(dbUser => ({
        ...dbUser,
        gender: dbUser.gender.toLowerCase() as 'male' | 'female', // Convert MALE/FEMALE to male/female
      }));
      setUsers(transformedUsers);
    }
  }, [discoveryUsers]);

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => solanaService.connectWallet(),
  });

  useEffect(() => {
    if (wallet) {
      setWalletData(wallet);
    } else {
      // Initialize with mock wallet data for demo
      setWalletData({
        address: currentUserWallet,
        balance: 2.5,
        usdcBalance: 150.0,
        isConnected: true,
      });
    }
  }, [wallet, currentUserWallet]);

  const handleTip = async (amount: number) => {
    // Ensure wallet is connected or use mock data
    const activeWallet = walletData || {
      address: currentUserWallet,
      balance: 2.5,
      usdcBalance: 150.0,
      isConnected: true,
    };

    if (!activeWallet?.isConnected) {
      console.log('Wallet not connected');
      return;
    }

    try {
      const hasSufficientBalance = await solanaService.hasSufficientUSDC(
        activeWallet.address,
        amount
      );

      if (!hasSufficientBalance) {
        console.log('Insufficient USDC balance');
        return;
      }

      // Get the current user we're swiping on
      const currentUser = users[currentIndex];
      if (!currentUser) return;

      const transaction = await solanaService.sendTip(
        activeWallet.address,
        currentUser.walletAddress,
        amount
      );

      if (transaction) {
        // Create match in database
        try {
          await apiService.createMatch(
            currentUserWallet,
            currentUser.walletAddress,
            amount,
            transaction.transactionHash
          );
          
          console.log(`Tip sent: $${amount} USDC to ${currentUser.name}`);
          Alert.alert(
            'Tip Sent! 💰',
            `You sent $${amount} USDC to ${currentUser.name}. They'll be notified of your interest!`
          );
          
          // Refresh discovery users to exclude the newly matched user
          refetch();
        } catch (dbError: any) {
          console.error('Database error:', dbError);
          
          // Handle duplicate match error gracefully
          if (dbError.message?.includes('Match already exists')) {
            console.log(`Match already exists with ${currentUser.name}`);
            // Still refresh the list to ensure UI consistency
            refetch();
          } else {
            Alert.alert(
              'Error',
              'Failed to create match. Please try again.'
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to send tip:', error);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (direction === 'right') {
      // Like - send a tip automatically
      const currentUser = users[currentIndex];
      if (currentUser) {
        await handleTip(currentUser.preferredTipAmount);
      }
      console.log('Profile liked');
    } else {
      // Pass
      console.log('Profile passed');
    }
    
    setCurrentIndex(prev => Math.min(prev + 1, users.length - 1));
    
    // If we're near the end, try to fetch more users
    if (currentIndex >= users.length - 2) {
      refetch();
    }
  };

  const renderCard = (user: User, index: number) => (
    <MatchCard
      key={user.id}
      user={user}
      onTip={handleTip}
      onSwipe={handleSwipe}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyCard}>
        <Ionicons name="heart-outline" size={64} color="#00F90C" />
        <Text style={styles.emptyTitle}>No More Profiles</Text>
        <Text style={styles.emptySubtitle}>
          You've seen all available profiles for now. Check back later for new matches!
        </Text>
      </View>
    </View>
  );

  if (users.length === 0) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Solmate</Text>
            <Text style={styles.headerSubtitle}>Discover amazing people</Text>
          </View>
          <View style={styles.profileCount}>
            <Text style={styles.profileCountText}>
              {users.length} profiles
            </Text>
          </View>
        </View>
      </View>

      {/* Swiper Container */}
      <View style={styles.swiperContainer}>
        <Swiper
          cards={users}
          renderCard={renderCard}
          onSwipedLeft={(cardIndex) => handleSwipe('left')}
          onSwipedRight={(cardIndex) => handleSwipe('right')}
          cardIndex={currentIndex}
          backgroundColor={'transparent'}
          stackSize={3}
          cardVerticalMargin={0}
          cardHorizontalMargin={0}
          animateOverlayLabelsOpacity
          overlayLabels={{
            left: {
              element: (
                <View style={styles.leftOverlay}>
                  <Ionicons name="close" size={24} color="white" />
                </View>
              ),
              style: {
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30,
                },
              },
            },
            right: {
              element: (
                <View style={styles.rightOverlay}>
                  <Ionicons name="heart" size={24} color="black" />
                </View>
              ),
              style: {
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30,
                },
              },
            },
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingTop: 20, // Reduced from 48 since no navigation header
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: '#0A0A0A',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  profileCount: {
    backgroundColor: 'rgba(0, 249, 12, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  profileCountText: {
    color: '#00F90C',
    fontSize: 14,
    fontWeight: '600',
  },
  swiperContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  leftOverlay: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  rightOverlay: {
    backgroundColor: '#00F90C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default DiscoveryScreen; 