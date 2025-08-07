import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-deck-swiper';
import { useQuery } from '@tanstack/react-query';
import MatchCard from '../components/MatchCard';
import { User, Match } from '../types';
import { solanaService } from '../services/solana';

const { width, height } = Dimensions.get('window');

// Enhanced mock data with high-quality images and better profiles
const MOCK_USERS: User[] = [
  {
    id: '1',
    walletAddress: 'mock-wallet-1',
    gender: 'female',
    name: 'Sophia',
    age: 26,
    bio: 'Adventure seeker & coffee enthusiast ☕️ Love hiking, photography, and spontaneous road trips. Looking for someone to explore life\'s beautiful moments with! 🌟',
    photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face&auto=format'],
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
    photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face&auto=format'],
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
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face&auto=format'],
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
    photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face&auto=format'],
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
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face&auto=format'],
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
    bio: 'Environmental scientist & nature lover 🌿 Passionate about sustainability and outdoor adventures. Looking for someone to protect our planet with! 🌎',
    photos: ['https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop&crop=face&auto=format'],
    preferredTipAmount: 1,
    ghostedCount: 0,
    ghostedByCount: 0,
    matchCount: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const DiscoveryScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [walletData, setWalletData] = useState<any>(null);

  // Fetch wallet data
  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => solanaService.connectWallet(),
  });

  // Mock function to get users (in real app, this would be an API call)
  const { data: users = MOCK_USERS } = useQuery({
    queryKey: ['users'],
    queryFn: () => Promise.resolve(MOCK_USERS),
  });

  useEffect(() => {
    if (wallet) {
      setWalletData(wallet);
    }
  }, [wallet]);

  const handleTip = async (amount: number) => {
    if (!walletData?.isConnected) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet to send tips');
      return;
    }

    const hasSufficientBalance = await solanaService.hasSufficientUSDC(
      walletData.address,
      amount
    );

    if (!hasSufficientBalance) {
      Alert.alert('Insufficient Balance', 'You don\'t have enough USDC to send this tip');
      return;
    }

    try {
      const transaction = await solanaService.sendTip(
        walletData.address,
        'recipient-wallet',
        amount
      );

      if (transaction) {
        Alert.alert('Tip Sent!', `Successfully sent $${amount} USDC tip`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send tip. Please try again.');
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      // Handle like
      Alert.alert('Liked!', 'You liked this profile');
    } else {
      // Handle pass
      Alert.alert('Passed', 'You passed on this profile');
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

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center bg-background-primary px-6">
      <View className="bg-background-secondary rounded-3xl p-8 items-center">
        <Ionicons name="heart-outline" size={64} color="#00F90C" />
        <Text className="text-white text-2xl font-bold mt-4 mb-2">
          No More Profiles
        </Text>
        <Text className="text-gray-400 text-center text-base">
          You've seen all available profiles for now. Check back later for new matches!
        </Text>
      </View>
    </View>
  );

  if (users.length === 0) {
    return renderEmptyState();
  }

  return (
    <View className="flex-1 bg-background-primary">
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      
      {/* Header */}
      <View className="pt-12 pb-4 px-6 bg-background-primary">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold">Solmate</Text>
            <Text className="text-gray-400 text-sm">Discover amazing people</Text>
          </View>
          <View className="flex-row items-center space-x-2">
            <View className="bg-primary/20 px-3 py-1 rounded-full">
              <Text className="text-primary text-sm font-semibold">
                {users.length} profiles
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Swiper Container */}
      <View className="flex-1 px-4 pb-6">
        <Swiper
          cards={users}
          renderCard={renderCard}
          onSwipedLeft={(index) => handleSwipe('left')}
          onSwipedRight={(index) => handleSwipe('right')}
          cardIndex={currentIndex}
          backgroundColor="transparent"
          stackSize={3}
          cardVerticalMargin={20}
          cardHorizontalMargin={0}
          animateOverlayLabelsOpacity
          overlayLabels={{
            left: {
              element: (
                <View className="bg-red-500 px-6 py-3 rounded-full">
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
                <View className="bg-primary px-6 py-3 rounded-full">
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

export default DiscoveryScreen; 