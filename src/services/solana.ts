import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SOLANA_CONFIG } from '../constants';
import { WalletData, Transaction as AppTransaction } from '../types';

class SolanaService {
  private connection: Connection;
  private usdcMint: PublicKey;

  constructor() {
    this.connection = new Connection(SOLANA_CONFIG.rpcUrl, 'confirmed');
    this.usdcMint = new PublicKey(SOLANA_CONFIG.usdcMint);
  }

  // Connect to wallet (Android compatible)
  async connectWallet(): Promise<WalletData | null> {
    try {
      // For Android, this would integrate with Solana Mobile Wallet Adapter
      // For now, we'll simulate wallet connection with a valid base58 address
      const mockWalletAddress = '11111111111111111111111111111112'; // Valid base58 address
      
      // Simulate balance instead of actually querying
      const balance = 1.5; // Mock SOL balance
      const usdcBalance = 100.0; // Mock USDC balance

      return {
        address: mockWalletAddress,
        balance,
        usdcBalance,
        isConnected: true,
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  }

  // Get USDC balance
  async getUSDCBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const tokenAccount = await getAssociatedTokenAddress(
        this.usdcMint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const accountInfo = await this.connection.getAccountInfo(tokenAccount);
      if (!accountInfo) {
        return 0;
      }

      const tokenAccountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
      return tokenAccountInfo.value.uiAmount || 0;
    } catch (error) {
      console.error('Error getting USDC balance:', error);
      return 0;
    }
  }

  // Send USDC tip (Android compatible)
  async sendTip(
    fromWallet: string,
    toWallet: string,
    amount: number
  ): Promise<AppTransaction | null> {
    try {
      // This would create an actual Solana transaction
      // For Android, this would use Solana Mobile Wallet Adapter
      const transactionHash = 'mock-tx-hash-' + Date.now();
      
      const transaction: AppTransaction = {
        id: 'tx-' + Date.now(),
        walletAddress: fromWallet,
        type: 'tip_sent',
        amount,
        transactionHash,
        timestamp: new Date(),
        status: 'confirmed',
      };

      return transaction;
    } catch (error) {
      console.error('Error sending tip:', error);
      return null;
    }
  }

  // Lock USDC in escrow (smart contract interaction)
  async lockUSDCInEscrow(
    walletAddress: string,
    amount: number,
    matchId: string
  ): Promise<string | null> {
    try {
      // This would interact with your Solana program
      // For Android, this would use Solana Mobile Wallet Adapter
      const transactionHash = 'escrow-tx-' + Date.now();
      
      // In a real implementation, this would:
      // 1. Create a transaction to transfer USDC to escrow
      // 2. Sign the transaction with the user's wallet
      // 3. Submit the transaction to the network
      // 4. Return the transaction hash
      
      return transactionHash;
    } catch (error) {
      console.error('Error locking USDC in escrow:', error);
      return null;
    }
  }

  // Release USDC from escrow
  async releaseUSDCFromEscrow(
    matchId: string,
    recipientWallet: string
  ): Promise<string | null> {
    try {
      // This would interact with your Solana program
      const transactionHash = 'release-tx-' + Date.now();
      
      // In a real implementation, this would:
      // 1. Verify the match conditions are met
      // 2. Create a transaction to release USDC from escrow
      // 3. Sign the transaction with the escrow authority
      // 4. Submit the transaction to the network
      // 5. Return the transaction hash
      
      return transactionHash;
    } catch (error) {
      console.error('Error releasing USDC from escrow:', error);
      return null;
    }
  }

  // Refund USDC from escrow
  async refundUSDC(
    matchId: string,
    senderWallet: string
  ): Promise<string | null> {
    try {
      // This would interact with your Solana program
      const transactionHash = 'refund-tx-' + Date.now();
      
      // In a real implementation, this would:
      // 1. Verify the refund conditions are met
      // 2. Create a transaction to refund USDC from escrow
      // 3. Sign the transaction with the escrow authority
      // 4. Submit the transaction to the network
      // 5. Return the transaction hash
      
      return transactionHash;
    } catch (error) {
      console.error('Error refunding USDC:', error);
      return null;
    }
  }

  // Get transaction history
  async getTransactionHistory(walletAddress: string): Promise<AppTransaction[]> {
    try {
      // In a real implementation, this would query the blockchain
      // For now, we'll return mock data
      const mockTransactions: AppTransaction[] = [
        {
          id: 'tx-1',
          walletAddress,
          type: 'tip_sent',
          amount: 10,
          transactionHash: 'mock-hash-1',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          status: 'confirmed',
        },
        {
          id: 'tx-2',
          walletAddress,
          type: 'tip_received',
          amount: 25,
          transactionHash: 'mock-hash-2',
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
          status: 'confirmed',
        },
        {
          id: 'tx-3',
          walletAddress,
          type: 'tip_sent',
          amount: 50,
          transactionHash: 'mock-hash-3',
          timestamp: new Date(Date.now() - 259200000), // 3 days ago
          status: 'confirmed',
        },
      ];

      return mockTransactions;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  // Check if wallet has sufficient USDC
  async hasSufficientUSDC(walletAddress: string, amount: number): Promise<boolean> {
    try {
      const balance = await this.getUSDCBalance(walletAddress);
      return balance >= amount;
    } catch (error) {
      console.error('Error checking USDC balance:', error);
      return false;
    }
  }

  // Get ghosting history
  async getGhostingHistory(walletAddress: string): Promise<any[]> {
    try {
      // In a real implementation, this would query your database
      // For now, we'll return mock data
      return [
        {
          id: 'ghost-1',
          ghostedBy: walletAddress,
          ghostedUser: 'user-123',
          timestamp: new Date(Date.now() - 86400000),
          amount: 15,
        },
        {
          id: 'ghost-2',
          ghostedBy: walletAddress,
          ghostedUser: 'user-456',
          timestamp: new Date(Date.now() - 172800000),
          amount: 20,
        },
      ];
    } catch (error) {
      console.error('Error getting ghosting history:', error);
      return [];
    }
  }

  // Android-specific wallet connection
  async connectWalletAndroid(): Promise<WalletData | null> {
    try {
      // For Android, this would use Solana Mobile Wallet Adapter
      console.log('Connecting wallet for Android...');

      const mockWalletAddress = '11111111111111111111111111111112'; // Valid base58 address
      const balance = 2.5; // Mock SOL balance
      const usdcBalance = 150.0; // Mock USDC balance

      return {
        address: mockWalletAddress,
        balance,
        usdcBalance,
        isConnected: true,
      };
    } catch (error) {
      console.error('Error connecting wallet on Android:', error);
      return null;
    }
  }
}

export const solanaService = new SolanaService(); 