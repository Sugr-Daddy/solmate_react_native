import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { TIP_AMOUNTS } from '../constants';
import { OnboardingData } from '../types';

const { width, height } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    gender: 'male',
    tipAmount: 2,
    photos: [],
    bio: '',
    name: '',
    age: 25,
  });

  // Animation values
  const genderAnimation = useSharedValue(0);
  const tipAnimation = useSharedValue(0);
  const walletAnimation = useSharedValue(0);

  const steps = [
    { title: 'Choose Your Gender', subtitle: 'This helps us match you with the right people' },
    { title: 'Select Tip Amount', subtitle: 'Choose how much you want to tip for matches' },
    { title: 'Connect Wallet', subtitle: 'Connect your Solana wallet to start tipping' },
  ];

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setOnboardingData(prev => ({ ...prev, gender }));
    genderAnimation.value = withSpring(1);
    
    setTimeout(() => {
      setCurrentStep(1);
      tipAnimation.value = withSpring(1);
    }, 500);
  };

  const handleTipSelect = (amount: number) => {
    setOnboardingData(prev => ({ ...prev, tipAmount: amount }));
    tipAnimation.value = withSpring(1);
    
    setTimeout(() => {
      setCurrentStep(2);
      walletAnimation.value = withSpring(1);
    }, 500);
  };

  const handleWalletConnect = async () => {
    try {
      // This would integrate with actual wallet providers
      Alert.alert('Wallet Connected', 'Your Solana wallet has been connected successfully!');
      
      // Navigate to main app
      // navigation.navigate('Discovery');
    } catch (error) {
      Alert.alert('Error', 'Failed to connect wallet. Please try again.');
    }
  };

  const renderGenderSelection = () => (
    <Animated.View
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        },
        useAnimatedStyle(() => ({
          opacity: interpolate(genderAnimation.value, [0, 1], [0, 1]),
          transform: [{ scale: interpolate(genderAnimation.value, [0, 1], [0.8, 1]) }],
        })),
      ]}
    >
      <Text className="text-3xl font-bold text-white mb-8 text-center">
        I am a...
      </Text>

      <View className="flex-row space-x-6">
        <TouchableOpacity
          onPress={() => handleGenderSelect('male')}
          className={`w-32 h-32 rounded-2xl justify-center items-center border-2 ${
            onboardingData.gender === 'male'
              ? 'border-primary bg-primary/20'
              : 'border-gray-600 bg-background-secondary'
          }`}
        >
          <Ionicons
            name="male"
            size={48}
            color={onboardingData.gender === 'male' ? '#00F90C' : '#A0A0A0'}
          />
          <Text
            className={`text-lg font-semibold mt-2 ${
              onboardingData.gender === 'male' ? 'text-primary' : 'text-gray-400'
            }`}
          >
            Man
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleGenderSelect('female')}
          className={`w-32 h-32 rounded-2xl justify-center items-center border-2 ${
            onboardingData.gender === 'female'
              ? 'border-primary bg-primary/20'
              : 'border-gray-600 bg-background-secondary'
          }`}
        >
          <Ionicons
            name="female"
            size={48}
            color={onboardingData.gender === 'female' ? '#00F90C' : '#A0A0A0'}
          />
          <Text
            className={`text-lg font-semibold mt-2 ${
              onboardingData.gender === 'female' ? 'text-primary' : 'text-gray-400'
            }`}
          >
            Woman
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderTipSelection = () => (
    <Animated.View
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        },
        useAnimatedStyle(() => ({
          opacity: interpolate(tipAnimation.value, [0, 1], [0, 1]),
          transform: [{ scale: interpolate(tipAnimation.value, [0, 1], [0.8, 1]) }],
        })),
      ]}
    >
      <Text className="text-3xl font-bold text-white mb-8 text-center">
        Choose Tip Amount
      </Text>

      <View className="space-y-4 w-full">
        {TIP_AMOUNTS.map((tip) => (
          <TouchableOpacity
            key={tip.value}
            onPress={() => handleTipSelect(tip.value)}
            className={`p-6 rounded-2xl border-2 ${
              onboardingData.tipAmount === tip.value
                ? 'border-primary bg-primary/20 animate-glow'
                : 'border-gray-600 bg-background-secondary'
            }`}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text
                  className={`text-2xl font-bold ${
                    onboardingData.tipAmount === tip.value ? 'text-primary' : 'text-white'
                  }`}
                >
                  {tip.label}
                </Text>
                <Text
                  className={`text-sm ${
                    onboardingData.tipAmount === tip.value ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  {tip.description}
                </Text>
              </View>
              <Ionicons
                name={onboardingData.tipAmount === tip.value ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={onboardingData.tipAmount === tip.value ? '#00F90C' : '#A0A0A0'}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderWalletConnection = () => (
    <Animated.View
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        },
        useAnimatedStyle(() => ({
          opacity: interpolate(walletAnimation.value, [0, 1], [0, 1]),
          transform: [{ scale: interpolate(walletAnimation.value, [0, 1], [0.8, 1]) }],
        })),
      ]}
    >
      <Text className="text-3xl font-bold text-white mb-8 text-center">
        Connect Your Wallet
      </Text>

      <View className="w-full space-y-4">
        <TouchableOpacity
          onPress={handleWalletConnect}
          className="bg-primary p-6 rounded-2xl items-center animate-glow"
        >
          <Ionicons name="wallet" size={32} color="#000000" />
          <Text className="text-black text-lg font-bold mt-2">Connect Phantom Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleWalletConnect}
          className="bg-background-secondary p-6 rounded-2xl items-center border border-gray-600"
        >
          <Ionicons name="wallet" size={32} color="#00F90C" />
          <Text className="text-white text-lg font-bold mt-2">Connect Solflare</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleWalletConnect}
          className="bg-background-secondary p-6 rounded-2xl items-center border border-gray-600"
        >
          <Ionicons name="wallet" size={32} color="#00F90C" />
          <Text className="text-white text-lg font-bold mt-2">Connect Backpack</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-gray-400 text-center mt-8 px-4">
        Your wallet will be used to send and receive USDC tips for matches
      </Text>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Progress Bar */}
      <View className="flex-row justify-center items-center pt-12 pb-4">
        {steps.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full mx-1 ${
              index <= currentStep ? 'bg-primary' : 'bg-gray-600'
            }`}
            style={{ width: (width - 80) / steps.length }}
          />
        ))}
      </View>

      {/* Step Title */}
      <View className="px-6 pb-8">
        <Text className="text-2xl font-bold text-white text-center">
          {steps[currentStep]?.title}
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          {steps[currentStep]?.subtitle}
        </Text>
      </View>

      {/* Step Content */}
      {currentStep === 0 && renderGenderSelection()}
      {currentStep === 1 && renderTipSelection()}
      {currentStep === 2 && renderWalletConnection()}
    </View>
  );
};

export default OnboardingScreen; 