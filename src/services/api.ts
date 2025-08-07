import { Platform } from 'react-native';
import { NetworkConfig } from '../constants/network';

const API_BASE_URL = NetworkConfig.getApiBaseUrl();

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      console.log(`API Request: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`API Response for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication
  async signInUser(walletAddress: string) {
    return this.request<{ user: any; needsOnboarding: boolean }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  }

  async onboardUser(data: {
    walletAddress: string;
    name: string;
    age: number;
    gender: string;
    bio: string;
    photos: string[];
    preferredTipAmount: number;
  }) {
    return this.request<{ user: any }>('/auth/onboard', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Discovery
  async getDiscoveryUsers(walletAddress: string, limit: number = 10) {
    return this.request<any[]>(`/users/discovery/${walletAddress}?limit=${limit}`);
  }

  // Matches
  async createMatch(
    senderWallet: string,
    receiverWallet: string,
    tipAmount: number,
    transactionHash: string
  ) {
    return this.request<any>('/matches', {
      method: 'POST',
      body: JSON.stringify({
        senderWallet,
        receiverWallet,
        tipAmount,
        transactionHash,
      }),
    });
  }

  async getUserMatches(walletAddress: string) {
    return this.request<any[]>(`/matches/${walletAddress}`);
  }

  async acceptMatch(matchId: string) {
    return this.request<any>(`/matches/${matchId}/accept`, {
      method: 'PATCH',
    });
  }

  async rejectMatch(matchId: string) {
    return this.request<any>(`/matches/${matchId}/reject`, {
      method: 'PATCH',
    });
  }

  // Utility
  async seedDatabase() {
    return this.request<{ message: string; userCount: number }>('/seed', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
