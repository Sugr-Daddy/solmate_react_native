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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Sample user profile data
const USER_PROFILE = {
  name: 'Jessica',
  age: 26,
  bio: 'Love hiking, coffee dates, and weekend adventures! Looking for someone to explore the city with 🌸',
  location: 'San Francisco, CA',
  occupation: 'UX Designer',
  photos: [
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&crop=face',
  ],
  interests: ['Hiking', 'Coffee', 'Travel', 'Art', 'Music', 'Photography'],
  lifestyle: {
    exercise: 'Often',
    smoking: 'Never',
    drinking: 'Socially',
    pets: 'Love dogs',
  },
  preferences: {
    ageRange: [24, 32],
    distance: 25,
    looking: 'Long-term relationship',
  },
};

const STATS = [
  { label: 'Views', value: '127', icon: 'eye' },
  { label: 'Likes', value: '89', icon: 'heart' },
  { label: 'Matches', value: '23', icon: 'sparkles' },
];

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress: () => void;
  showArrow?: boolean;
  color?: string;
}

function SettingItem({ icon, title, subtitle, value, onPress, showArrow = true, color = '#EC4899' }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {showArrow && (
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );
}

interface StatCardProps {
  stat: typeof STATS[0];
}

function StatCard({ stat }: StatCardProps) {
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
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View 
        style={[
          styles.statCard,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <LinearGradient
          colors={['#EC4899', '#BE185D']}
          style={styles.statGradient}
        >
          <Ionicons name={stat.icon as any} size={24} color="white" />
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing would open here!');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings screen would open here!');
  };

  const handlePreferences = () => {
    Alert.alert('Preferences', 'Dating preferences would open here!');
  };

  const handleSubscription = () => {
    Alert.alert('Premium', 'Premium subscription options would open here!');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Support & help center would open here!');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy', 'Privacy settings would open here!');
  };

  const nextPhoto = () => {
    if (currentPhotoIndex < USER_PROFILE.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FDF2F8', '#FCE7F3', '#FBBF24']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Profile ✨</Text>
            <TouchableOpacity onPress={handleSettings}>
              <View style={styles.settingsButton}>
                <Ionicons name="settings" size={20} color="#EC4899" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <Animated.View 
            style={[
              styles.profileCard,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Photos */}
            <View style={styles.photoSection}>
              <TouchableOpacity 
                style={styles.photoContainer}
                onPress={nextPhoto}
              >
                <Image 
                  source={{ uri: USER_PROFILE.photos[currentPhotoIndex] }} 
                  style={styles.profilePhoto}
                />
                
                {/* Photo Navigation */}
                <View style={styles.photoNavigation}>
                  {USER_PROFILE.photos.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.photoDot,
                        index === currentPhotoIndex && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>

                {/* Photo Controls */}
                {currentPhotoIndex > 0 && (
                  <TouchableOpacity 
                    style={[styles.photoControl, styles.prevControl]}
                    onPress={prevPhoto}
                  >
                    <Ionicons name="chevron-back" size={20} color="white" />
                  </TouchableOpacity>
                )}
                {currentPhotoIndex < USER_PROFILE.photos.length - 1 && (
                  <TouchableOpacity 
                    style={[styles.photoControl, styles.nextControl]}
                    onPress={nextPhoto}
                  >
                    <Ionicons name="chevron-forward" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEditProfile}
              >
                <LinearGradient
                  colors={['#EC4899', '#BE185D']}
                  style={styles.editGradient}
                >
                  <Ionicons name="create" size={16} color="white" />
                  <Text style={styles.editText}>Edit</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {USER_PROFILE.name}, {USER_PROFILE.age}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="#EC4899" />
                <Text style={styles.location}>{USER_PROFILE.location}</Text>
              </View>
              <Text style={styles.occupation}>{USER_PROFILE.occupation}</Text>
              <Text style={styles.bio}>{USER_PROFILE.bio}</Text>
            </View>

            {/* Interests */}
            <View style={styles.interestsSection}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.interestTags}>
                {USER_PROFILE.interests.map((interest) => (
                  <View key={interest} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Stats 📊</Text>
            <View style={styles.statsGrid}>
              {STATS.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </View>
          </View>

          {/* Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Settings & Preferences</Text>
            
            <View style={styles.settingsCard}>
              <SettingItem
                icon="heart"
                title="Dating Preferences"
                subtitle="Age range, distance, looking for"
                onPress={handlePreferences}
              />
              
              <SettingItem
                icon="diamond"
                title="Premium Features"
                subtitle="Unlock unlimited likes & more"
                onPress={handleSubscription}
                color="#FBBF24"
              />
              
              <SettingItem
                icon="shield-checkmark"
                title="Privacy & Safety"
                subtitle="Control who can see your profile"
                onPress={handlePrivacy}
                color="#10B981"
              />
              
              <SettingItem
                icon="help-circle"
                title="Help & Support"
                subtitle="Get help with your account"
                onPress={handleSupport}
                color="#6366F1"
              />
            </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  photoSection: {
    position: 'relative',
    marginBottom: 20,
  },
  photoContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
  },
  photoNavigation: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  photoDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: 'white',
  },
  photoControl: {
    position: 'absolute',
    top: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -20 }],
  },
  prevControl: {
    left: 16,
  },
  nextControl: {
    right: 16,
  },
  editButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  editGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  editText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  profileInfo: {
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  location: {
    fontSize: 16,
    color: '#EC4899',
    fontWeight: '600',
  },
  occupation: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  interestsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#EC4899',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  interestText: {
    color: '#BE185D',
    fontWeight: '600',
    fontSize: 14,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  settingsSection: {
    marginBottom: 40,
  },
  settingsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
