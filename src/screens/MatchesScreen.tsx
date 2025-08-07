import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Match, User } from '../types';
import { solanaService } from '../services/solana';

// Enhanced mock matches data
const MOCK_MATCHES: Match[] = [
  {
    id: 'match-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    tipAmount: 3,
    status: 'pending',
    transactionHash: 'tx-hash-1',
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    expiresAt: new Date(Date.now() + 82800000), // 23 hours from now
  },
  {
    id: 'match-2',
    senderId: 'user-1',
    receiverId: 'user-3',
    tipAmount: 5,
    status: 'accepted',
    transactionHash: 'tx-hash-2',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    expiresAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'match-3',
    senderId: 'user-4',
    receiverId: 'user-1',
    tipAmount: 2,
    status: 'ghosted',
    transactionHash: 'tx-hash-3',
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    expiresAt: new Date(Date.now() - 172800000),
    ghostedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'match-4',
    senderId: 'user-5',
    receiverId: 'user-1',
    tipAmount: 4,
    status: 'pending',
    transactionHash: 'tx-hash-4',
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    expiresAt: new Date(Date.now() + 79200000), // 22 hours from now
  },
];

const MOCK_USERS: { [key: string]: User } = {
  'user-2': {
    id: 'user-2',
    walletAddress: 'mock-wallet-2',
    gender: 'female',
    name: 'Sophia',
    age: 26,
    bio: 'Adventure seeker & coffee enthusiast ☕️',
    photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face&auto=format'],
    preferredTipAmount: 3,
    ghostedCount: 0,
    ghostedByCount: 0,
    matchCount: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'user-3': {
    id: 'user-3',
    walletAddress: 'mock-wallet-3',
    gender: 'female',
    name: 'Emma',
    age: 24,
    bio: 'Yoga instructor & wellness advocate 🧘‍♀️',
    photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face&auto=format'],
    preferredTipAmount: 5,
    ghostedCount: 1,
    ghostedByCount: 0,
    matchCount: 18,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'user-4': {
    id: 'user-4',
    walletAddress: 'mock-wallet-4',
    gender: 'female',
    name: 'Isabella',
    age: 27,
    bio: 'Creative soul & art lover 🎨',
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face&auto=format'],
    preferredTipAmount: 2,
    ghostedCount: 0,
    ghostedByCount: 0,
    matchCount: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'user-5': {
    id: 'user-5',
    walletAddress: 'mock-wallet-5',
    gender: 'female',
    name: 'Olivia',
    age: 25,
    bio: 'Tech enthusiast & fitness lover 💪',
    photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face&auto=format'],
    preferredTipAmount: 4,
    ghostedCount: 0,
    ghostedByCount: 1,
    matchCount: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

const MatchesScreen: React.FC = () => {
  const { data: matches = MOCK_MATCHES } = useQuery({
    queryKey: ['matches'],
    queryFn: () => Promise.resolve(MOCK_MATCHES),
  });

  const getMatchUser = (match: Match): User | null => {
    const userId = match.senderId === 'user-1' ? match.receiverId : match.senderId;
    return MOCK_USERS[userId] || null;
  };

  const getMatchStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'Pending Response', color: '#F59E0B', icon: 'time-outline' };
      case 'accepted':
        return { text: 'Match Accepted!', color: '#00F90C', icon: 'checkmark-circle-outline' };
      case 'ghosted':
        return { text: 'Ghosted', color: '#8B5CF6', icon: 'close-circle-outline' };
      case 'expired':
        return { text: 'Expired', color: '#6B7280', icon: 'alert-circle-outline' };
      default:
        return { text: 'Unknown', color: '#6B7280', icon: 'help-circle-outline' };
    }
  };

  const handleMatchAction = (match: Match, action: 'accept' | 'reject') => {
    const user = getMatchUser(match);
    if (!user) return;

    if (action === 'accept') {
      Alert.alert(
        'Accept Match',
        `Accept ${user.name}'s tip of $${match.tipAmount} USDC?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Accept',
            onPress: () => {
              Alert.alert('Match Accepted!', `You and ${user.name} are now matched!`);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Reject Match',
        `Reject ${user.name}'s tip of $${match.tipAmount} USDC? They will be refunded.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: () => {
              Alert.alert('Match Rejected', `${user.name} will be refunded.`);
            },
          },
        ]
      );
    }
  };

  const renderMatchItem = ({ item: match }: { item: Match }) => {
    const user = getMatchUser(match);
    const status = getMatchStatus(match.status);
    
    if (!user) return null;

    const isIncoming = match.receiverId === 'user-1';
    const timeAgo = Math.floor((Date.now() - match.createdAt.getTime()) / 3600000);

    return (
      <View className="bg-background-secondary rounded-2xl p-4 mb-4 mx-4 shadow-lg">
        <View className="flex-row items-center mb-4">
          <Image
            source={{ uri: user.photos[0] }}
            className="w-16 h-16 rounded-full mr-4"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="text-white text-lg font-bold">{user.name}</Text>
            <Text className="text-gray-400 text-sm">{user.age} years old</Text>
            <Text className="text-gray-500 text-xs">{timeAgo}h ago</Text>
          </View>
          <View className="items-end">
            <View className="flex-row items-center mb-1">
              <Ionicons name={status.icon as any} size={16} color={status.color} />
              <Text className="text-gray-400 text-xs ml-1">{status.text}</Text>
            </View>
            <Text className="text-primary font-bold text-lg">${match.tipAmount}</Text>
          </View>
        </View>

        <Text className="text-gray-300 text-sm mb-4 leading-5">
          {user.bio}
        </Text>

        {match.status === 'pending' && isIncoming && (
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => handleMatchAction(match, 'accept')}
              className="flex-1 bg-primary py-3 rounded-xl items-center"
            >
              <Text className="text-black font-bold">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleMatchAction(match, 'reject')}
              className="flex-1 bg-gray-600 py-3 rounded-xl items-center"
            >
              <Text className="text-white font-bold">Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {match.status === 'accepted' && (
          <View className="bg-green-500/20 border border-green-500/30 rounded-xl p-3">
            <Text className="text-green-400 text-center font-semibold">
              💚 You're matched with {user.name}!
            </Text>
          </View>
        )}

        {match.status === 'ghosted' && (
          <View className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-3">
            <Text className="text-purple-400 text-center font-semibold">
              👻 {user.name} ghosted you
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center bg-background-primary px-6">
      <View className="bg-background-secondary rounded-3xl p-8 items-center">
        <Ionicons name="heart-outline" size={64} color="#00F90C" />
        <Text className="text-white text-2xl font-bold mt-4 mb-2">
          No Matches Yet
        </Text>
        <Text className="text-gray-400 text-center text-base">
          Start swiping to find your perfect match! When someone tips you and you accept, you'll see them here.
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background-primary">
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      
      {/* Header */}
      <View className="pt-12 pb-4 px-6 bg-background-primary">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold">Matches</Text>
            <Text className="text-gray-400 text-sm">Your connections</Text>
          </View>
          <View className="flex-row items-center space-x-2">
            <View className="bg-primary/20 px-3 py-1 rounded-full">
              <Text className="text-primary text-sm font-semibold">
                {matches.length} matches
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Matches List */}
      {matches.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default MatchesScreen; 