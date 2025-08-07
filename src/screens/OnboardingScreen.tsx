import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useMutation } from '@tanstack/react-query';
import { TIP_AMOUNTS } from '../constants';
import { OnboardingData } from '../types';
import { apiService } from '../services/api';
import { solanaService } from '../services/solana';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  walletAddress: string;
  onComplete: (user: any) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ walletAddress, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    gender: 'male',
    tipAmount: 3,
    photos: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face&auto=format'],
    bio: '',
    name: '',
    age: 25,
  });

  // Animation values
  const genderAnimation = useSharedValue(0);
  const tipAnimation = useSharedValue(0);
  const profileAnimation = useSharedValue(0);

  const steps = [
    { title: 'Choose Your Gender', subtitle: 'This helps us match you with the right people' },
    { title: 'Select Tip Amount', subtitle: 'Choose how much you want to tip for matches' },
    { title: 'Complete Profile', subtitle: 'Tell us a bit about yourself' },
  ];

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof onboardingData) => {
      return await apiService.onboardUser({
        walletAddress,
        gender: userData.gender,
        name: userData.name,
        age: userData.age,
        bio: userData.bio,
        photos: userData.photos,
        preferredTipAmount: userData.tipAmount,
      });
    },
    onSuccess: (user) => {
      Alert.alert(
        'Welcome to Solmate! 🎉',
        'Your profile has been created successfully. Start swiping to find amazing matches!',
        [{ text: 'Let\'s Go!', onPress: () => onComplete(user) }]
      );
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    },
  });

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setOnboardingData(prev => ({ ...prev, gender }));
    genderAnimation.value = withSpring(1);
    
    setTimeout(() => {
      setCurrentStep(1);
      tipAnimation.value = withSpring(1);
    }, 300);
  };

  const handleTipSelect = (amount: number) => {
    setOnboardingData(prev => ({ ...prev, tipAmount: amount }));
    tipAnimation.value = withSpring(1);
    
    setTimeout(() => {
      setCurrentStep(2);
      profileAnimation.value = withSpring(1);
    }, 300);
  };

  const handleCompleteProfile = () => {
    if (!onboardingData.name.trim() || !onboardingData.bio.trim()) {
      Alert.alert('Missing Information', 'Please fill in your name and bio.');
      return;
    }

    if (onboardingData.age < 18 || onboardingData.age > 100) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 18 and 100.');
      return;
    }

    createUserMutation.mutate(onboardingData);
  };

  const renderGenderSelection = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        useAnimatedStyle(() => ({
          opacity: interpolate(genderAnimation.value, [0, 1], [1, 1]),
          transform: [{ scale: interpolate(genderAnimation.value, [0, 1], [1, 1]) }],
        })),
      ]}
    >
      <Text style={styles.stepTitle}>I am a...</Text>

      <View style={styles.genderContainer}>
        <TouchableOpacity
          onPress={() => handleGenderSelect('male')}
          style={[
            styles.genderButton,
            onboardingData.gender === 'male' && styles.genderButtonActive
          ]}
        >
          <Ionicons
            name="male"
            size={48}
            color={onboardingData.gender === 'male' ? '#00F90C' : '#A0A0A0'}
          />
          <Text
            style={[
              styles.genderText,
              onboardingData.gender === 'male' && styles.genderTextActive
            ]}
          >
            Sugar Daddy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleGenderSelect('female')}
          style={[
            styles.genderButton,
            onboardingData.gender === 'female' && styles.genderButtonActive
          ]}
        >
          <Ionicons
            name="female"
            size={48}
            color={onboardingData.gender === 'female' ? '#00F90C' : '#A0A0A0'}
          />
          <Text
            style={[
              styles.genderText,
              onboardingData.gender === 'female' && styles.genderTextActive
            ]}
          >
            Sugar Baby
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderTipSelection = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        useAnimatedStyle(() => ({
          opacity: interpolate(tipAnimation.value, [0, 1], [1, 1]),
        })),
      ]}
    >
      <Text style={styles.stepTitle}>Choose Tip Amount</Text>
      <Text style={styles.stepSubtitle}>
        This is the amount you'll {onboardingData.gender === 'male' ? 'pay' : 'receive'} for matches
      </Text>

      <View style={styles.tipContainer}>
        {TIP_AMOUNTS.map((tip) => (
          <TouchableOpacity
            key={tip.value}
            onPress={() => handleTipSelect(tip.value)}
            style={[
              styles.tipButton,
              onboardingData.tipAmount === tip.value && styles.tipButtonActive
            ]}
          >
            <View style={styles.tipContent}>
              <Text style={[
                styles.tipAmount,
                onboardingData.tipAmount === tip.value && styles.tipAmountActive
              ]}>
                {tip.label}
              </Text>
              <Text style={[
                styles.tipDescription,
                onboardingData.tipAmount === tip.value && styles.tipDescriptionActive
              ]}>
                {tip.description}
              </Text>
            </View>
            <Ionicons
              name={onboardingData.tipAmount === tip.value ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={onboardingData.tipAmount === tip.value ? '#00F90C' : '#A0A0A0'}
            />
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderProfileCompletion = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        useAnimatedStyle(() => ({
          opacity: interpolate(profileAnimation.value, [0, 1], [1, 1]),
        })),
      ]}
    >
      <Text style={styles.stepTitle}>Complete Your Profile</Text>
      
      <View style={styles.profileForm}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            value={onboardingData.name}
            onChangeText={(text) => setOnboardingData(prev => ({ ...prev, name: text }))}
            style={styles.textInput}
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Age</Text>
          <TextInput
            value={onboardingData.age.toString()}
            onChangeText={(text) => setOnboardingData(prev => ({ ...prev, age: parseInt(text) || 18 }))}
            style={styles.textInput}
            placeholder="Enter your age"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>About You</Text>
          <TextInput
            value={onboardingData.bio}
            onChangeText={(text) => setOnboardingData(prev => ({ ...prev, bio: text }))}
            style={[styles.textInput, styles.bioInput]}
            placeholder="Tell others about yourself, your interests, what you're looking for..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          onPress={handleCompleteProfile}
          style={styles.completeButton}
          disabled={createUserMutation.isPending}
        >
          <Text style={styles.completeButtonText}>
            {createUserMutation.isPending ? 'Creating Profile...' : 'Complete Profile'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressBar,
              { width: (width - 80) / steps.length },
              index <= currentStep && styles.progressBarActive
            ]}
          />
        ))}
      </View>

      {/* Step Title */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>
          {steps[currentStep]?.title}
        </Text>
        <Text style={styles.headerSubtitle}>
          {steps[currentStep]?.subtitle}
        </Text>
      </View>

      {/* Step Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {currentStep === 0 && renderGenderSelection()}
        {currentStep === 1 && renderTipSelection()}
        {currentStep === 2 && renderProfileCompletion()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 40,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#374151',
    marginHorizontal: 4,
  },
  progressBarActive: {
    backgroundColor: '#00F90C',
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 32,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  genderButton: {
    width: 140,
    height: 140,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#374151',
  },
  genderButtonActive: {
    borderColor: '#00F90C',
    backgroundColor: 'rgba(0, 249, 12, 0.1)',
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center',
  },
  genderTextActive: {
    color: '#00F90C',
  },
  tipContainer: {
    width: '100%',
  },
  tipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  tipButtonActive: {
    borderColor: '#00F90C',
    backgroundColor: 'rgba(0, 249, 12, 0.1)',
  },
  tipContent: {
    flex: 1,
  },
  tipAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tipAmountActive: {
    color: '#00F90C',
  },
  tipDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  tipDescriptionActive: {
    color: '#00F90C',
  },
  profileForm: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  completeButton: {
    backgroundColor: '#00F90C',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  completeButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen; 