import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  StyleSheet,
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

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return timestamp.toLocaleDateString();
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

    return (
      <View style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <Image
            source={{ uri: user.photos[0] }}
            style={styles.userImage}
            resizeMode="cover"
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userAge}>{user.age} years old</Text>
            <Text style={styles.timeAgo}>
              {formatTimeAgo(match.createdAt)}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <Ionicons name={status.icon as any} size={16} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.text}
              </Text>
            </View>
            <Text style={styles.tipAmount}>${match.tipAmount}</Text>
          </View>
        </View>

        <Text style={styles.userBio}>
          {user.bio}
        </Text>

        {match.status === 'pending' && isIncoming && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => handleMatchAction(match, 'accept')}
              style={styles.acceptButton}
            >
              <Ionicons name="checkmark" size={20} color="#000000" />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleMatchAction(match, 'reject')}
              style={styles.rejectButton}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {match.status === 'accepted' && (
          <View style={styles.acceptedContainer}>
            <Ionicons name="heart" size={20} color="#00F90C" />
            <Text style={styles.acceptedText}>
              💚 You're matched with {user.name}!
            </Text>
          </View>
        )}

        {match.status === 'ghosted' && (
          <View style={styles.ghostedContainer}>
            <Ionicons name="close-circle" size={20} color="#8B5CF6" />
            <Text style={styles.ghostedText}>
              👻 {user.name} ghosted you
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyCard}>
        <Ionicons name="heart-outline" size={64} color="#00F90C" />
        <Text style={styles.emptyTitle}>No Matches Yet</Text>
        <Text style={styles.emptySubtitle}>
          Start swiping to find your perfect match! When someone tips you and you accept, you'll see them here.
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Matches</Text>
            <Text style={styles.headerSubtitle}>Your connections</Text>
          </View>
          <View style={styles.matchCount}>
            <Text style={styles.matchCountText}>
              {matches.length} matches
            </Text>
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
          contentContainerStyle={styles.listContainer}
        />
      )}
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  matchCount: {
    backgroundColor: 'rgba(0, 249, 12, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  matchCountText: {
    color: '#00F90C',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  matchCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userAge: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 2,
  },
  timeAgo: {
    color: '#6B7280',
    fontSize: 12,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  tipAmount: {
    color: '#00F90C',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userBio: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F90C',
    paddingVertical: 12,
    borderRadius: 16,
  },
  acceptButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    borderRadius: 16,
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  acceptedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 249, 12, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 249, 12, 0.3)',
    borderRadius: 16,
    padding: 12,
  },
  acceptedText: {
    color: '#00F90C',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  ghostedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
    padding: 12,
  },
  ghostedText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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

export default MatchesScreen; 