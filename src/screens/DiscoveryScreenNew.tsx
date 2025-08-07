import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ProfileCard from '../components/ProfileCard';

const { width, height } = Dimensions.get('window');

// Sample profiles for the demo
const SAMPLE_PROFILES = [
  {
    id: 'sample1',
    name: 'Emma Rose',
    age: 26,
    bio: 'Love hiking, coffee dates, and weekend adventures! Looking for someone to explore the city with 🌸',
    location: 'San Francisco',
    photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=400&fit=crop&crop=face'],
    interests: ['Hiking', 'Coffee', 'Travel'],
  },
  {
    id: 'sample2', 
    name: 'Sophie Chen',
    age: 28,
    bio: 'Yoga instructor by day, foodie by night. Let\'s find the best ramen spots together! 🍜',
    location: 'Los Angeles',
    photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face'],
    interests: ['Yoga', 'Food', 'Meditation'],
  },
  {
    id: 'sample3',
    name: 'Maya Johnson', 
    age: 24,
    bio: 'Artist and dog lover 🎨🐕 Always up for museum visits and long walks in the park',
    location: 'New York',
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop&crop=face'],
    interests: ['Art', 'Dogs', 'Museums'],
  },
  {
    id: 'sample4',
    name: 'Zoe Martinez',
    age: 29, 
    bio: 'Tech enthusiast and weekend warrior. Love rock climbing and trying new cuisines!',
    location: 'Austin',
    photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop&crop=face'],
    interests: ['Tech', 'Climbing', 'Food'],
  },
  {
    id: 'sample5',
    name: 'Lily Thompson',
    age: 25,
    bio: 'Book lover and coffee addict ☕📚 Always looking for the next great read and cozy cafe',
    location: 'Seattle', 
    photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop&crop=face'],
    interests: ['Reading', 'Coffee', 'Writing'],
  }
];

export default function DiscoveryScreen() {
  const [profiles, setProfiles] = useState(SAMPLE_PROFILES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heartCountAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLike = (user: any) => {
    if (hearts <= 0) return;

    // Simulate match logic - 30% chance of match for demo
    const isMatch = Math.random() < 0.3;
    
    if (isMatch) {
      setMatchedUser(user);
      setShowMatchAnimation(true);
    }

    // Update hearts with animation
    Animated.sequence([
      Animated.timing(heartCountAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartCountAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setHearts(prev => Math.max(0, prev - 1));
    setCurrentIndex(prev => prev + 1);
  };

  const handleSkip = (user: any) => {
    setCurrentIndex(prev => prev + 1);
  };

  const refreshProfiles = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentIndex(0);
      setHearts(5);
      setIsLoading(false);
    }, 1000);
  };

  const currentProfile = profiles[currentIndex];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#FDF2F8', '#FCE7F3', '#FBBF24']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingIcon,
              {
                transform: [
                  {
                    rotate: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#EC4899', '#BE185D']}
              style={styles.loadingGradient}
            >
              <Ionicons name="sparkles" size={32} color="white" />
            </LinearGradient>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FDF2F8', '#FCE7F3', '#FBBF24']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#EC4899', '#BE185D']}
                style={styles.logo}
              >
                <Ionicons name="sparkles" size={20} color="white" />
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.brandTitle}>SOLMATE</Text>
              <Text style={styles.brandSubtitle}>Find your sweet match</Text>
            </View>
          </View>
          
          {/* Heart Counter */}
          <Animated.View
            style={[
              styles.heartCounter,
              { transform: [{ scale: heartCountAnim }] }
            ]}
          >
            <Ionicons name="heart" size={20} color="#EC4899" />
            <Text style={styles.heartCount}>{hearts}</Text>
          </Animated.View>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Sweet Discoveries ✨</Text>
          <Text style={styles.welcomeSubtitle}>
            Double tap 💖 to crush on someone special
          </Text>
        </View>

        {/* Profile Cards */}
        <View style={styles.cardContainer}>
          {currentProfile ? (
            <ProfileCard
              key={currentProfile.id}
              user={currentProfile}
              onLike={handleLike}
              onSkip={handleSkip}
              canLike={hearts > 0}
            />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="refresh" size={40} color="white" />
              </View>
              <Text style={styles.emptyTitle}>No more profiles! 🎉</Text>
              <Text style={styles.emptySubtitle}>
                You've seen everyone in your area. Check back later for new matches!
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={refreshProfiles}
              >
                <LinearGradient
                  colors={['#EC4899', '#BE185D']}
                  style={styles.refreshGradient}
                >
                  <Text style={styles.refreshText}>Refresh Profiles</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Hearts Status */}
        {hearts === 0 && (
          <View style={styles.heartsEmpty}>
            <Text style={styles.heartsEmptyTitle}>Out of Hearts! 💔</Text>
            <Text style={styles.heartsEmptySubtitle}>
              Your hearts will refill tomorrow. Come back then to find more matches!
            </Text>
          </View>
        )}

        {/* Match Animation */}
        {showMatchAnimation && matchedUser && (
          <View style={styles.matchOverlay}>
            <Animated.View style={styles.matchModal}>
              <Text style={styles.matchEmoji}>🎉</Text>
              <Text style={styles.matchTitle}>It's a Match!</Text>
              <Text style={styles.matchSubtitle}>
                You and {matchedUser.name} liked each other!
              </Text>
              <TouchableOpacity
                style={styles.matchButton}
                onPress={() => setShowMatchAnimation(false)}
              >
                <LinearGradient
                  colors={['#EC4899', '#BE185D']}
                  style={styles.matchButtonGradient}
                >
                  <Text style={styles.matchButtonText}>Keep Swiping! 💕</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#EC4899',
    fontWeight: '600',
  },
  heartCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  heartCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#BE185D',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#EC4899',
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: 'white',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 24,
  },
  refreshButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  refreshGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  refreshText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  heartsEmpty: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heartsEmptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  heartsEmptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  matchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  matchModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    margin: 24,
    alignItems: 'center',
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  matchEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  matchSubtitle: {
    fontSize: 16,
    color: '#EC4899',
    textAlign: 'center',
    marginBottom: 24,
  },
  matchButton: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  matchButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  matchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    marginBottom: 20,
  },
  loadingGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
