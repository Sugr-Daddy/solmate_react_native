export interface User {
  id: string;
  walletAddress: string;
  gender: 'male' | 'female';
  name: string;
  age: number;
  bio: string;
  photos: string[];
  preferredTipAmount: number; // 1, 2, or 5 USDC
  ghostedCount: number;
  ghostedByCount: number;
  matchCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  senderId: string;
  receiverId: string;
  tipAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'ghosted' | 'refunded';
  transactionHash: string;
  createdAt: Date;
  expiresAt: Date;
  ghostedAt?: Date;
}

export interface Transaction {
  id: string;
  walletAddress: string;
  type: 'tip_sent' | 'tip_received' | 'refund' | 'ghost_forfeit' | 'ghosted';
  amount: number;
  transactionHash: string;
  matchId?: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface WalletData {
  address: string;
  balance: number;
  usdcBalance: number;
  isConnected: boolean;
}

export interface TipAmount {
  value: number;
  label: string;
  description: string;
}

export interface OnboardingData {
  gender: 'male' | 'female';
  tipAmount: number;
  photos: string[];
  bio: string;
  name: string;
  age: number;
}

export interface MatchCardProps {
  user: User;
  onTip: (amount: number) => void;
  onSwipe: (direction: 'left' | 'right') => void;
}

export interface GhostingHistory {
  userId: string;
  userName: string;
  userPhoto: string;
  tipAmount: number;
  ghostedAt: Date;
  transactionHash: string;
}

export interface WalletHistoryItem {
  id: string;
  type: 'sent' | 'received' | 'refunded' | 'ghosted';
  amount: number;
  counterparty: {
    name: string;
    photo: string;
  };
  timestamp: Date;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
} 