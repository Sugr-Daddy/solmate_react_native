import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.7;

interface User {
  id: string;
  name: string;
  age: number;
  bio?: string;
  location?: string;
  photos: string[];
  interests?: string[];
}

interface MatchCardProps {
  user: User;
  onLike: (user: User) => void;
  onSkip: (user: User) => void;
  canLike: boolean;
}

export default function MatchCard({ user, onLike, onSkip, canLike }: MatchCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  
  const position = new Animated.ValueXY();
  const rotate = position.x.interpolate({
    inputRange: [-CARD_WIDTH / 2, 0, CARD_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      position.setOffset({
        x: (position.x as any)._value,
        y: (position.y as any)._value,
      });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: position.x, dy: position.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (evt, gestureState) => {
      position.flattenOffset();
      
      if (gestureState.dx > 120) {
        // Swipe right - Like
        if (canLike) {
          handleLike();
        } else {
          // Bounce back if no hearts
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      } else if (gestureState.dx < -120) {
        // Swipe left - Skip
        handleSkip();
      } else {
        // Bounce back
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const handleLike = () => {
    if (!canLike) return;
    
    setIsLiking(true);
    
    Animated.timing(position, {
      toValue: { x: CARD_WIDTH, y: -100 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      onLike(user);
      setIsLiking(false);
    });
  };

  const handleSkip = () => {
    Animated.timing(position, {
      toValue: { x: -CARD_WIDTH, y: -100 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      onSkip(user);
    });
  };

  const nextPhoto = () => {
    if (currentPhotoIndex < user.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const rotateStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
    ],
  };

  return (
    <Animated.View
      style={[styles.card, rotateStyle]}
      {...panResponder.panHandlers}
    >
      {/* Clay Card Background */}
      <View style={styles.clayCard}>
        {/* Photo Container */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: user.photos[currentPhotoIndex] }}
            style={styles.photo}
            resizeMode="cover"
          />
          
          {/* Photo Navigation */}
          {user.photos.length > 1 && (
            <>
              {currentPhotoIndex > 0 && (
                <TouchableOpacity style={styles.navButtonLeft} onPress={prevPhoto}>
                  <LinearGradient
                    colors={['#EC4899', '#BE185D']}
                    style={styles.navButtonGradient}
                  >
                    <Ionicons name="chevron-back" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              {currentPhotoIndex < user.photos.length - 1 && (
                <TouchableOpacity style={styles.navButtonRight} onPress={nextPhoto}>
                  <LinearGradient
                    colors={['#EC4899', '#BE185D']}
                    style={styles.navButtonGradient}
                  >
                    <Ionicons name="chevron-forward" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              {/* Photo Indicators */}
              <View style={styles.photoIndicators}>
                {user.photos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentPhotoIndex && styles.activeIndicator,
                    ]}
                  />
                ))}
              </View>
            </>
          )}
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.gradientOverlay}
          />
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.age}>{user.age}</Text>
          </View>
          
          {user.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color="#EC4899" />
              <Text style={styles.location}>{user.location}</Text>
            </View>
          )}
          
          {user.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {user.bio}
            </Text>
          )}
          
          {user.interests && (
            <View style={styles.interests}>
              {user.interests.slice(0, 3).map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.likeButton,
              { opacity: canLike ? 1 : 0.5 }
            ]}
            onPress={handleLike}
            disabled={!canLike}
          >
            <LinearGradient
              colors={['#EC4899', '#BE185D']}
              style={styles.likeButtonGradient}
            >
              <Ionicons name="heart" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Heart Explosion Animation */}
        {isLiking && (
          <View style={styles.heartExplosion}>
            {[...Array(8)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.explosionHeart,
                  {
                    transform: [
                      {
                        translateX: Math.cos(i * 45 * Math.PI / 180) * 100,
                      },
                      {
                        translateY: Math.sin(i * 45 * Math.PI / 180) * 100,
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="heart" size={20} color="#EC4899" />
              </Animated.View>
            ))}
          </View>
        )}

        {/* Double Tap Hint */}
        <View style={styles.doubleTapHint}>
          <View style={styles.hintBubble}>
            <Text style={styles.hintText}>💖 Double tap to like</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'absolute',
    alignSelf: 'center',
  },
  clayCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  photoContainer: {
    height: '75%',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  navButtonLeft: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  navButtonRight: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  navButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIndicators: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  userInfo: {
    padding: 20,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  age: {
    fontSize: 20,
    color: '#6B7280',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#EC4899',
    marginLeft: 4,
    fontWeight: '600',
  },
  bio: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  interestText: {
    fontSize: 12,
    color: '#BE185D',
    fontWeight: '600',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  likeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  likeButtonGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartExplosion: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 10,
  },
  explosionHeart: {
    position: 'absolute',
  },
  doubleTapHint: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    marginTop: -20,
    pointerEvents: 'none',
  },
  hintBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
