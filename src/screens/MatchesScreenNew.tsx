import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Sample matches data
const SAMPLE_MATCHES = [
  {
    id: 'match1',
    name: 'Emma Rose',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Hey! Thanks for the match 💕',
    timestamp: '2 min ago',
    unread: true,
    isOnline: true,
  },
  {
    id: 'match2', 
    name: 'Sophie Chen',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Would love to grab coffee this weekend!',
    timestamp: '15 min ago',
    unread: true,
    isOnline: false,
  },
  {
    id: 'match3',
    name: 'Maya Johnson',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'That art gallery looks amazing!',
    timestamp: '1 hour ago',
    unread: false,
    isOnline: true,
  },
  {
    id: 'match4',
    name: 'Zoe Martinez',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Ready for that hike? 🥾',
    timestamp: 'Yesterday',
    unread: false,
    isOnline: false,
  },
  {
    id: 'match5',
    name: 'Lily Thompson',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Just finished that book you recommended!',
    timestamp: '2 days ago',
    unread: false,
    isOnline: true,
  },
];

// Recent matches for top section
const RECENT_MATCHES = [
  {
    id: 'recent1',
    name: 'Alice',
    photo: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
    isNew: true,
  },
  {
    id: 'recent2',
    name: 'Sarah',
    photo: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&h=100&fit=crop&crop=face',
    isNew: true,
  },
  {
    id: 'recent3',
    name: 'Jessica',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    isNew: false,
  },
];

interface MatchCardProps {
  match: typeof SAMPLE_MATCHES[0];
  onPress: () => void;
}

function MatchCard({ match, onPress }: MatchCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View 
        style={[
          styles.matchCard,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={styles.matchInfo}>
          <View style={styles.photoContainer}>
            <Image source={{ uri: match.photo }} style={styles.matchPhoto} />
            {match.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          
          <View style={styles.matchDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.matchName}>{match.name}</Text>
              {match.unread && <View style={styles.unreadDot} />}
            </View>
            <Text 
              style={[
                styles.lastMessage,
                match.unread && styles.unreadMessage
              ]}
              numberOfLines={1}
            >
              {match.lastMessage}
            </Text>
          </View>
        </View>
        
        <View style={styles.timeContainer}>
          <Text style={styles.timestamp}>{match.timestamp}</Text>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color="#EC4899" 
          />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

interface RecentMatchProps {
  match: typeof RECENT_MATCHES[0];
  onPress: () => void;
}

function RecentMatch({ match, onPress }: RecentMatchProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.recentMatch}>
      <View style={styles.recentPhotoContainer}>
        <Image source={{ uri: match.photo }} style={styles.recentPhoto} />
        {match.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>
      <Text style={styles.recentName} numberOfLines={1}>
        {match.name}
      </Text>
    </TouchableOpacity>
  );
}

export default function MatchesScreen() {
  const [matches] = useState(SAMPLE_MATCHES);
  const [recentMatches] = useState(RECENT_MATCHES);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleMatchPress = (match: any) => {
    console.log('Opening chat with:', match.name);
    // Navigate to chat screen
  };

  const handleRecentMatchPress = (match: any) => {
    console.log('Viewing profile:', match.name);
    // Navigate to profile or chat
  };

  const unreadCount = matches.filter(match => match.unread).length;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FDF2F8', '#FCE7F3', '#FBBF24']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleSection}>
              <Text style={styles.headerTitle}>Sweet Matches 💕</Text>
              <Text style={styles.headerSubtitle}>
                {unreadCount > 0 
                  ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}`
                  : 'Your connections await'
                }
              </Text>
            </View>
            
            <TouchableOpacity style={styles.filterButton}>
              <LinearGradient
                colors={['#EC4899', '#BE185D']}
                style={styles.filterGradient}
              >
                <Ionicons name="options" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Recent Matches */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>New Matches ✨</Text>
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            >
              {recentMatches.map((match) => (
                <RecentMatch
                  key={match.id}
                  match={match}
                  onPress={() => handleRecentMatchPress(match)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Messages */}
          <View style={styles.messagesSection}>
            <Text style={styles.sectionTitle}>Messages 💬</Text>
            
            {matches.length > 0 ? (
              <View style={styles.matchesList}>
                {matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onPress={() => handleMatchPress(match)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <LinearGradient
                    colors={['#EC4899', '#BE185D']}
                    style={styles.emptyIconGradient}
                  >
                    <Ionicons name="heart-outline" size={40} color="white" />
                  </LinearGradient>
                </View>
                <Text style={styles.emptyTitle}>No matches yet! 💔</Text>
                <Text style={styles.emptySubtitle}>
                  Start swiping in Discovery to find your perfect match!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#EC4899',
    fontWeight: '600',
  },
  filterButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  filterGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  recentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  recentList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  recentMatch: {
    alignItems: 'center',
    width: 80,
  },
  recentPhotoContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  recentPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#EC4899',
  },
  newBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FBBF24',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  recentName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  messagesSection: {
    marginBottom: 40,
  },
  matchesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  matchPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
  matchDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EC4899',
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  unreadMessage: {
    color: '#1F2937',
    fontWeight: '600',
  },
  timeContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 40,
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
