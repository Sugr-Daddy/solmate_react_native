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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { solanaService } from '../services/solana';
import { Transaction } from '../types';

// Enhanced mock transaction data
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    walletAddress: 'mock-wallet-123',
    type: 'tip_sent',
    amount: 10,
    transactionHash: 'mock-hash-1',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    status: 'confirmed',
  },
  {
    id: 'tx-2',
    walletAddress: 'mock-wallet-123',
    type: 'tip_received',
    amount: 25,
    transactionHash: 'mock-hash-2',
    timestamp: new Date(Date.now() - 172800000), // 2 days ago
    status: 'confirmed',
  },
  {
    id: 'tx-3',
    walletAddress: 'mock-wallet-123',
    type: 'ghosted',
    amount: 15,
    transactionHash: 'mock-hash-3',
    timestamp: new Date(Date.now() - 259200000), // 3 days ago
    status: 'confirmed',
  },
  {
    id: 'tx-4',
    walletAddress: 'mock-wallet-123',
    type: 'tip_sent',
    amount: 5,
    transactionHash: 'mock-hash-4',
    timestamp: new Date(Date.now() - 345600000), // 4 days ago
    status: 'confirmed',
  },
];

const WalletScreen: React.FC = () => {
  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => solanaService.connectWallet(),
  });

  const { data: transactions = MOCK_TRANSACTIONS } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => solanaService.getTransactionHistory(wallet?.address || 'mock-wallet-123'),
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'tip_sent':
        return { name: 'arrow-up', color: '#FF6B6B' };
      case 'tip_received':
        return { name: 'arrow-down', color: '#00F90C' };
      case 'ghosted':
        return { name: 'close-circle', color: '#8B5CF6' };
      default:
        return { name: 'help-circle', color: '#9CA3AF' };
    }
  };

  const getTransactionStatus = (type: string) => {
    switch (type) {
      case 'tip_sent':
        return 'Tip Sent';
      case 'tip_received':
        return 'Tip Received';
      case 'ghosted':
        return 'Ghosted (You Kept Tip)';
      default:
        return 'Unknown';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return timestamp.toLocaleDateString();
  };

  const renderTransactionItem = ({ item: transaction }: { item: Transaction }) => {
    const icon = getTransactionIcon(transaction.type);
    const status = getTransactionStatus(transaction.type);
    const isPositive = transaction.type === 'tip_received' || transaction.type === 'ghosted';
    
    return (
      <TouchableOpacity style={styles.transactionItem}>
        <View style={styles.transactionIcon}>
          <Ionicons name={icon.name as any} size={24} color={icon.color} />
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionStatus}>{status}</Text>
          <Text style={styles.transactionTime}>
            {formatTimeAgo(transaction.timestamp)}
          </Text>
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountText,
            { color: isPositive ? '#00F90C' : '#FF6B6B' }
          ]}>
            {isPositive ? '+' : '-'}${transaction.amount}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderWalletInfo = () => (
    <View style={styles.walletCard}>
      <View style={styles.walletHeader}>
        <Ionicons name="wallet" size={32} color="#00F90C" />
        <Text style={styles.walletTitle}>Wallet Balance</Text>
      </View>
      
      <View style={styles.balanceContainer}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>SOL</Text>
          <Text style={styles.balanceValue}>
            {wallet?.balance?.toFixed(4) || '0.0000'}
          </Text>
        </View>
        
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>USDC</Text>
          <Text style={styles.balanceValue}>
            ${wallet?.usdcBalance?.toFixed(2) || '0.00'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.walletAddress}>
        {wallet?.address ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}` : 'Not connected'}
      </Text>
    </View>
  );

  const renderStats = () => {
    const totalSent = transactions
      .filter(t => t.type === 'tip_sent')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalReceived = transactions
      .filter(t => t.type === 'tip_received')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalGhosted = transactions
      .filter(t => t.type === 'ghosted')
      .reduce((sum, t) => sum + t.amount, 0);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="arrow-up" size={24} color="#FF6B6B" />
          <Text style={styles.statValue}>${totalSent}</Text>
          <Text style={styles.statLabel}>Tips Sent</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="arrow-down" size={24} color="#00F90C" />
          <Text style={styles.statValue}>${totalReceived}</Text>
          <Text style={styles.statLabel}>Tips Received</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="close-circle" size={24} color="#8B5CF6" />
          <Text style={styles.statValue}>${totalGhosted}</Text>
          <Text style={styles.statLabel}>Ghosted Tips</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="wallet-outline" size={64} color="#6B7280" />
      <Text style={styles.emptyTitle}>No Transactions</Text>
      <Text style={styles.emptySubtitle}>
        Your transaction history will appear here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderWalletInfo()}
        {renderStats()}
        
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <Text style={styles.sectionSubtitle}>Your recent activity</Text>
          
          {transactions.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={transactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  walletCard: {
    backgroundColor: 'rgba(0, 249, 12, 0.1)',
    borderRadius: 24,
    padding: 24,
    margin: 16,
    marginBottom: 24,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  walletAddress: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  transactionsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionStatus: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionTime: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default WalletScreen; 