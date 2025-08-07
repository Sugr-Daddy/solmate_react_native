import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
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

const { width, height } = Dimensions.get('window');

const MatchCard: React.FC<MatchCardProps> = ({ user, onTip, onSwipe }) => {
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

  return (
    <Animated.View
      style={[
        styles.card,
        cardStyle,
      ]}
    >
      {/* Background Image with Gradient Overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: user.photos[0] || 'https://via.placeholder.com/400x600' }}
          style={styles.backgroundImage}
          resizeMode="cover"
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
      </View>

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
            <Ionicons name="close" size={28} color="#FF6B6B" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onSwipe('right')}
            style={styles.likeButton}
          >
            <Ionicons name="heart" size={28} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width - 32,
    height: height * 0.8, // Increased from 0.75 for more space
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
    height: height * 0.45, // Dynamic height based on screen, was fixed 384px
    minHeight: 300, // Ensure minimum height
    maxHeight: 500, // Prevent excessive height on large screens
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Ensure proper scaling without cropping faces
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Reduced opacity from 0.8 to 0.4
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
  userInfo: {
    padding: 20, // Reduced from 24
    backgroundColor: '#1A1A1A',
    flex: 1, // Allow flexible sizing
  },
  bioContainer: {
    marginBottom: 12, // Reduced from 16
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
    marginBottom: 16, // Reduced from 24
  },
  tipLabel: {
    color: '#9CA3AF',
    fontSize: 13, // Slightly smaller
    fontWeight: '500',
    marginBottom: 8, // Reduced from 12
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
    gap: 20, // Reduced from 24
    marginTop: 4, // Add some top margin
  },
  actionButton: {
    width: 56, // Reduced from 64
    height: 56, // Reduced from 64
    borderRadius: 28, // Adjusted for new size
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
    width: 56, // Reduced from 64
    height: 56, // Reduced from 64
    borderRadius: 28, // Adjusted for new size
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