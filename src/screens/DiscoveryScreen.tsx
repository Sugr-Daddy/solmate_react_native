import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-deck-swiper';
import { useQuery } from '@tanstack/react-query';
import MatchCard from '../components/MatchCard';
import { User, Match } from '../types';
import { solanaService } from '../services/solana';

const { width, height } = Dimensions.get('window');

// Enhanced mock data with diverse photos for each user
const MOCK_USERS: User[] = [
  {
    id: '1',
    walletAddress: 'mock-wallet-1',
    gender: 'female',
    name: 'Sophia',
    age: 26,
    bio: 'Adventure seeker & coffee enthusiast ☕️ Love hiking, photography, and spontaneous road trips. Looking for someone to explore life\'s beautiful moments with! 🌟',
    photos: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face&auto=format',
    ],
    preferredTipAmount: 3,
    ghostedCount: 0,
    ghostedByCount: 0,
    matchCount: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    walletAddress: 'mock-wallet-2',
    gender: 'female',
    name: 'Emma',
    age: 24,
    bio: 'Yoga instructor & wellness advocate 🧘‍♀️ Passionate about healthy living, meditation, and creating meaningful connections. Let\'s grow together! ✨',
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=face&auto=format',
    ],
    preferredTipAmount: 5,
    ghostedCount: 1,
    ghostedByCount: 0,
    matchCount: 18,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    walletAddress: 'mock-wallet-3',
    gender: 'female',
    name: 'Isabella',
    age: 27,
    bio: 'Creative soul & art lover 🎨 Dog mom to the cutest golden retriever. Love museums, indie music, and deep conversations over wine 🍷',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face&auto=format',
    ],
    preferredTipAmount: 2,
    ghostedCount: 0,
    ghostedByCount: 0,
    matchCount: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    walletAddress: 'mock-wallet-4',
    gender: 'female',
    name: 'Olivia',
    age: 25,
    bio: 'Tech enthusiast & fitness lover 💪 Startup founder by day, gym rat by night. Looking for someone who shares my passion for innovation and health! 🚀',
    photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face&auto=format',
    ],
    preferredTipAmount: 4,
    ghostedCount: 0,
    ghostedByCount: 1,
    matchCount: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    walletAddress: 'mock-wallet-5',
    gender: 'female',
    name: 'Ava',
    age: 23,
    bio: 'Foodie & travel blogger 🌍 Always on the hunt for the best restaurants and hidden gems. Let\'s create memories over amazing food! 🍕✈️',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face&auto=format',
    ],
    preferredTipAmount: 3,
    ghostedCount: 2,
    ghostedByCount: 0,
    matchCount: 22,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    walletAddress: 'mock-wallet-6',
    gender: 'female',
    name: 'Mia',
    age: 28,
    bio: 'Bookworm & nature lover 📚🌿 Hiking trails, cozy cafes, and deep conversations are my happy places. Looking for someone to share adventures with! 🏔️',
    photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=face&auto=format',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face&auto=format',
    ],
    preferredTipAmount: 2,
    ghostedCount: 0,
    ghostedByCount: 0,
    matchCount: 9,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const DiscoveryScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [walletData, setWalletData] = useState<any>(null);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => solanaService.connectWallet(),
  });

  useEffect(() => {
    if (wallet) {
      setWalletData(wallet);
    }
  }, [wallet]);

  // Auto-advance to next profile after 2 seconds
  useEffect(() => {
    if (isAutoAdvancing && !isPaused && currentIndex < users.length - 1) {
      autoAdvanceTimerRef.current = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 2000);
    }

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [isAutoAdvancing, isPaused, currentIndex, users.length]);

  const handleTip = async (amount: number) => {
    if (!walletData?.isConnected) {
      // Silently handle wallet not connected - no popup
      console.log('Wallet not connected');
      return;
    }

    const hasSufficientBalance = await solanaService.hasSufficientUSDC(
      walletData.address,
      amount
    );

    if (!hasSufficientBalance) {
      // Silently handle insufficient balance - no popup
      console.log('Insufficient USDC balance');
      return;
    }

    try {
      const transaction = await solanaService.sendTip(
        walletData.address,
        'recipient-wallet',
        amount
      );

      if (transaction) {
        // Silently handle successful tip - no popup
        console.log(`Tip sent: $${amount} USDC`);
      }
    } catch (error) {
      // Silently handle error - no popup
      console.log('Failed to send tip:', error);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      // Silently handle like - no popup
      console.log('Profile liked');
    } else {
      // Silently handle pass - no popup
      console.log('Profile passed');
    }
    
    setCurrentIndex(prev => Math.min(prev + 1, users.length - 1));
  };

  const renderCard = (user: User, index: number) => (
    <MatchCard
      key={user.id}
      user={user}
      onTip={handleTip}
      onSwipe={handleSwipe}
    />
  );

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    Alert.alert(
      isPaused ? 'Auto-advance Resumed' : 'Auto-advance Paused',
      isPaused ? 'Profiles will continue advancing automatically' : 'Tap to resume',
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

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
          <View style={styles.headerControls}>
            <View style={styles.profileCount}>
              <Text style={styles.profileCountText}>
                {users.length} profiles
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.pauseButton}
              onPress={handlePauseResume}
            >
              <Ionicons 
                name={isPaused ? "play" : "pause"} 
                size={20} 
                color={isPaused ? "#00F90C" : "#FF6B6B"} 
              />
            </TouchableOpacity>
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
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: '#0A0A0A',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  pauseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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