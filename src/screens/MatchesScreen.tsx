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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Match, User } from '../types';
import { solanaService } from '../services/solana';
import { apiService } from '../services/api';

const MatchesScreen: React.FC = () => {
  // For demo purposes, we'll use the sugar daddy wallet
  const currentUserWallet = 'demo-sugar-daddy-1';
  const queryClient = useQueryClient();

  const { data: rawMatches = [], isLoading } = useQuery({
    queryKey: ['matches', currentUserWallet],
    queryFn: () => apiService.getUserMatches(currentUserWallet),
    enabled: !!currentUserWallet,
  });

  // Transform database matches to app format
  const matches = React.useMemo(() => {
    return rawMatches.map((dbMatch: any) => ({
      ...dbMatch,
      status: dbMatch.status.toLowerCase() as 'pending' | 'accepted' | 'rejected' | 'ghosted' | 'refunded',
    }));
  }, [rawMatches]);

  const acceptMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return await apiService.acceptMatch(matchId);
    },
    onSuccess: (match: any) => {
      queryClient.invalidateQueries({ queryKey: ['matches', currentUserWallet] });
      const userName = match.sender?.walletAddress === currentUserWallet ? match.receiver?.name : match.sender?.name;
      Alert.alert('Match Accepted! 💖', `You and ${userName} are now matched!`);
    },
  });

  const rejectMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return await apiService.rejectMatch(matchId);
    },
    onSuccess: (match: any) => {
      queryClient.invalidateQueries({ queryKey: ['matches', currentUserWallet] });
      const userName = match.sender?.walletAddress === currentUserWallet ? match.receiver?.name : match.sender?.name;
      Alert.alert('Match Rejected', `${userName} will be refunded.`);
    },
  });

  const getMatchUser = (match: any): User | null => {
    // Return the other user (not the current user)
    if (match.sender?.walletAddress === currentUserWallet) {
      return match.receiver ? {
        ...match.receiver,
        gender: match.receiver.gender.toLowerCase() as 'male' | 'female'
      } : null;
    } else {
      return match.sender ? {
        ...match.sender,
        gender: match.sender.gender.toLowerCase() as 'male' | 'female'
      } : null;
    }
  };

  const getMatchStatus = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Pending Response', color: '#F59E0B', icon: 'time-outline' };
      case 'ACCEPTED':
        return { text: 'Match Accepted!', color: '#00F90C', icon: 'checkmark-circle-outline' };
      case 'GHOSTED':
        return { text: 'Ghosted', color: '#8B5CF6', icon: 'close-circle-outline' };
      case 'REJECTED':
        return { text: 'Rejected', color: '#FF6B6B', icon: 'close-circle-outline' };
      case 'EXPIRED':
        return { text: 'Expired', color: '#6B7280', icon: 'alert-circle-outline' };
      default:
        return { text: 'Unknown', color: '#6B7280', icon: 'help-circle-outline' };
    }
  };

  const formatTimeAgo = (timestamp: Date | string) => {
    const now = new Date();
    const dateObject = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    // Check if the date is valid
    if (isNaN(dateObject.getTime())) {
      return 'Recently';
    }
    
    const diffInHours = Math.floor((now.getTime() - dateObject.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return dateObject.toLocaleDateString();
  };

  const handleMatchAction = (match: any, action: 'accept' | 'reject') => {
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
            onPress: () => acceptMatchMutation.mutate(match.id),
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
            onPress: () => rejectMatchMutation.mutate(match.id),
          },
        ]
      );
    }
  };

  const renderMatchItem = ({ item: match }: { item: Match }) => {
    const user = getMatchUser(match);
    const status = getMatchStatus(match.status);
    
    if (!user) return null;

    // Check if this is an incoming match (the current user is the receiver)
    const currentUser = rawMatches.find(m => m.id === match.id);
    const isIncoming = currentUser?.receiver?.walletAddress === currentUserWallet;

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