import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Sample wallet data
const WALLET_DATA = {
  balance: 1250.75,
  currency: 'SOL',
  usdValue: 156342.30,
  address: 'FG7h...k8Ws',
  recentTransactions: [
    {
      id: 'tx1',
      type: 'received',
      amount: 50.25,
      from: 'Emma Rose',
      timestamp: '2 hours ago',
      status: 'completed',
      note: 'Coffee date payment 💕',
    },
    {
      id: 'tx2',
      type: 'sent',
      amount: 25.00,
      to: 'Sophie Chen',
      timestamp: '1 day ago',
      status: 'completed',
      note: 'Movie tickets',
    },
    {
      id: 'tx3',
      type: 'received',
      amount: 75.50,
      from: 'Maya Johnson',
      timestamp: '3 days ago',
      status: 'completed',
      note: 'Dinner split',
    },
  ],
};

const FEATURES = [
  {
    id: 'send',
    title: 'Send SOL',
    subtitle: 'Transfer to matches',
    icon: 'arrow-up',
    color: '#EC4899',
    gradient: ['#EC4899', '#BE185D'],
  },
  {
    id: 'receive',
    title: 'Receive SOL',
    subtitle: 'Share your address',
    icon: 'arrow-down',
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
  },
  {
    id: 'buy',
    title: 'Buy SOL',
    subtitle: 'Add to your wallet',
    icon: 'card',
    color: '#FBBF24',
    gradient: ['#FBBF24', '#F59E0B'],
  },
  {
    id: 'swap',
    title: 'Swap Tokens',
    subtitle: 'Exchange currencies',
    icon: 'swap-horizontal',
    color: '#6366F1',
    gradient: ['#6366F1', '#4F46E5'],
  },
];

interface FeatureCardProps {
  feature: typeof FEATURES[0];
  onPress: () => void;
}

function FeatureCard({ feature, onPress }: FeatureCardProps) {
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
      style={styles.featureCard}
    >
      <Animated.View 
        style={[
          styles.featureContent,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <LinearGradient
          colors={feature.gradient as any}
          style={styles.featureGradient}
        >
          <View style={styles.featureIcon}>
            <Ionicons name={feature.icon as any} size={24} color="white" />
          </View>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

interface TransactionItemProps {
  transaction: typeof WALLET_DATA.recentTransactions[0];
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const isReceived = transaction.type === 'received';
  
  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[
          styles.transactionIcon,
          { backgroundColor: isReceived ? '#10B98120' : '#EC489920' }
        ]}>
          <Ionicons 
            name={isReceived ? 'arrow-down' : 'arrow-up'} 
            size={20} 
            color={isReceived ? '#10B981' : '#EC4899'} 
          />
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>
            {isReceived ? 'Received from' : 'Sent to'} {isReceived ? transaction.from : transaction.to}
          </Text>
          <Text style={styles.transactionNote}>{transaction.note}</Text>
          <Text style={styles.transactionTime}>{transaction.timestamp}</Text>
        </View>
      </View>
      
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          { color: isReceived ? '#10B981' : '#EC4899' }
        ]}>
          {isReceived ? '+' : '-'}{transaction.amount} SOL
        </Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Completed</Text>
        </View>
      </View>
    </View>
  );
}

export default function WalletScreen() {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
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

  const handleFeaturePress = (featureId: string) => {
    switch (featureId) {
      case 'send':
        Alert.alert('Send SOL', 'Send SOL to your matches would open here!');
        break;
      case 'receive':
        Alert.alert('Receive SOL', 'Share your wallet address would open here!');
        break;
      case 'buy':
        Alert.alert('Buy SOL', 'Purchase SOL with fiat would open here!');
        break;
      case 'swap':
        Alert.alert('Swap Tokens', 'Token swap interface would open here!');
        break;
    }
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const handleViewAll = () => {
    Alert.alert('All Transactions', 'Full transaction history would open here!');
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
            <Text style={styles.headerTitle}>Sweet Wallet 💰</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="scan" size={20} color="#EC4899" />
            </TouchableOpacity>
          </View>

          {/* Balance Card */}
          <Animated.View 
            style={[
              styles.balanceCard,
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
            <LinearGradient
              colors={['#EC4899', '#BE185D']}
              style={styles.balanceGradient}
            >
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <TouchableOpacity onPress={toggleBalanceVisibility}>
                  <Ionicons 
                    name={isBalanceVisible ? 'eye' : 'eye-off'} 
                    size={20} 
                    color="rgba(255, 255, 255, 0.8)" 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.balanceAmount}>
                <Text style={styles.solBalance}>
                  {isBalanceVisible ? `${WALLET_DATA.balance.toFixed(2)} SOL` : '••••••'}
                </Text>
                <Text style={styles.usdBalance}>
                  {isBalanceVisible ? `$${WALLET_DATA.usdValue.toLocaleString()}` : '••••••'}
                </Text>
              </View>
              
              <View style={styles.addressSection}>
                <Text style={styles.addressLabel}>Wallet Address</Text>
                <View style={styles.addressRow}>
                  <Text style={styles.addressText}>{WALLET_DATA.address}</Text>
                  <TouchableOpacity>
                    <Ionicons name="copy" size={16} color="rgba(255, 255, 255, 0.8)" />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Features Grid */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Quick Actions ⚡</Text>
            <View style={styles.featuresGrid}>
              {FEATURES.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  onPress={() => handleFeaturePress(feature.id)}
                />
              ))}
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsSection}>
            <View style={styles.transactionsHeader}>
              <Text style={styles.sectionTitle}>Recent Activity 📝</Text>
              <TouchableOpacity onPress={handleViewAll}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.transactionsList}>
              {WALLET_DATA.recentTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </View>
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <View style={styles.securityIcon}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            </View>
            <View style={styles.securityText}>
              <Text style={styles.securityTitle}>Your wallet is secure</Text>
              <Text style={styles.securitySubtitle}>
                Transactions are protected by Solana blockchain security
              </Text>
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
  balanceCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  balanceGradient: {
    padding: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  balanceAmount: {
    marginBottom: 20,
  },
  solBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  usdBalance: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  addressSection: {
    marginTop: 8,
  },
  addressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  addressText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  featureCard: {
    width: (width - 56) / 2,
  },
  featureContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  featureGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  featureIcon: {
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  transactionsSection: {
    marginBottom: 24,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#EC4899',
    fontWeight: '600',
  },
  transactionsList: {
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
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  transactionNote: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: '#10B98120',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 40,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B98120',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityText: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  securitySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});
