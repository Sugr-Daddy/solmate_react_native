import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  withTiming,
} from 'react-native-reanimated';
import { MatchCardProps } from '../types';
import { TIP_AMOUNTS } from '../constants';
import PhotoGalleryModal from './PhotoGalleryModal';

const { width, height } = Dimensions.get('window');

const MatchCard: React.FC<MatchCardProps> = ({ user, onTip, onSwipe }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const photoTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  // Auto-advance to next profile after 2 seconds
  useEffect(() => {
    if (isAutoAdvancing && !isPaused) {
      autoAdvanceTimerRef.current = setTimeout(() => {
        onSwipe('right'); // Auto-like the profile
      }, 2000);
    }

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [isAutoAdvancing, isPaused, onSwipe]);

  // Auto-advance to next photo every 1.5 seconds
  useEffect(() => {
    if (user.photos.length > 1 && !isPaused) {
      photoTimerRef.current = setTimeout(() => {
        setCurrentPhotoIndex((prevIndex) => 
          (prevIndex + 1) % user.photos.length
        );
      }, 1500);
    }

    return () => {
      if (photoTimerRef.current) {
        clearTimeout(photoTimerRef.current);
      }
    };
  }, [currentPhotoIndex, user.photos.length, isPaused]);

  const handleTip = (amount: number) => {
    // Animate tip button
    try {
      scale.value = withSpring(0.95, { duration: 100 }, () => {
        scale.value = withSpring(1);
      });
    } catch (error) {
      console.warn('Reanimated animation failed:', error);
    }
    
    onTip(amount);
  };

  const handlePhotoTap = (index: number) => {
    // Navigate to next photo in the profile
    const nextIndex = (index + 1) % user.photos.length;
    setCurrentPhotoIndex(nextIndex);
    
    // Show brief feedback
    Alert.alert(
      `Photo ${nextIndex + 1} of ${user.photos.length}`,
      'Tap to see next photo',
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  const handlePhotoLongPress = () => {
    setIsPaused(!isPaused);
    Alert.alert(
      isPaused ? 'Auto-advance Resumed' : 'Auto-advance Paused',
      isPaused ? 'Photos will continue advancing automatically' : 'Long press again to resume',
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  const getGhostingTag = () => {
    if (user.ghostedCount === 0) return null;
    
    return (
      <View style={styles.ghostTag}>
        <Text style={styles.ghostText}>
          👻 Ghosted {user.ghostedCount}x
        </Text>
      </View>
    );
  };

  const getMatchCount = () => {
    if (user.matchCount === 0) return null;
    
    return (
      <View style={styles.matchTag}>
        <Text style={styles.matchText}>
          💚 {user.matchCount} matches
        </Text>
      </View>
    );
  };

  const renderPhotoCarousel = () => (
    <View style={styles.imageContainer}>
      <FlatList
        data={user.photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentPhotoIndex(index);
        }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.photoItem}
            onPress={() => handlePhotoTap(index)}
            onLongPress={handlePhotoLongPress}
            activeOpacity={0.9}
            delayLongPress={500}
          >
            <Image
              source={{ uri: item || 'https://via.placeholder.com/400x600' }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      
      {/* Gradient Overlay */}
      <View style={styles.gradientOverlay} />
      
      {/* Status Tags */}
      {getGhostingTag()}
      {getMatchCount()}
      
      {/* Age Badge */}
      <View style={styles.ageBadge}>
        <Text style={styles.ageText}>
          {user.age} years
        </Text>
      </View>

      {/* Photo Indicators */}
      {user.photos.length > 1 && (
        <View style={styles.photoIndicators}>
          {user.photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.photoIndicator,
                index === currentPhotoIndex && styles.photoIndicatorActive
              ]}
            />
          ))}
        </View>
      )}


    </View>
  );

  return (
    <Animated.View
      style={[
        styles.card,
        cardStyle,
      ]}
    >
      {/* Background Image with Gradient Overlay */}
      {renderPhotoCarousel()}

      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.bioContainer}>
          <Text style={styles.userName}>
            {user.name}
          </Text>
          <Text style={styles.userBio}>
            {user.bio}
          </Text>
        </View>

        {/* Tip Buttons */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipLabel}>
            Send a tip to show interest
          </Text>
          <View style={styles.tipButtons}>
            {TIP_AMOUNTS.map((tip) => (
              <TouchableOpacity
                key={tip.value}
                onPress={() => handleTip(tip.value)}
                style={styles.tipButton}
              >
                <Text style={styles.tipAmount}>
                  ${tip.value}
                </Text>
                <Text style={styles.tipLabel}>
                  Tip
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => onSwipe('left')}
            style={styles.actionButton}
          >
            <Ionicons name="close" size={32} color="#FF6B6B" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onSwipe('right')}
            style={styles.likeButton}
          >
            <Ionicons name="heart" size={32} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
      <PhotoGalleryModal
        visible={showGalleryModal}
        photos={user.photos}
        userName={user.name}
        onClose={() => setShowGalleryModal(false)}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width - 32,
    height: height * 0.75,
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#00F90C',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  imageContainer: {
    position: 'relative',
    height: 384,
  },
  backgroundImage: {
    width: width - 32,
    height: 384,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  ghostTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  ghostText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchTag: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 249, 12, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 249, 12, 0.5)',
  },
  matchText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ageBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  ageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  photoIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  photoIndicatorActive: {
    backgroundColor: '#00F90C',
  },
  photoItem: {
    width: width - 32,
    height: 384,
  },
  userInfo: {
    padding: 24,
    backgroundColor: '#1A1A1A',
  },
  bioContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  userBio: {
    color: '#D1D5DB',
    fontSize: 16,
    lineHeight: 24,
  },
  tipContainer: {
    marginBottom: 24,
  },
  tipLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  tipButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  tipButton: {
    backgroundColor: '#00F90C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#00F90C',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  tipAmount: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  likeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#00F90C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default MatchCard; 