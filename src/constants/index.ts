import { TipAmount } from '../types';

// Tip amounts available for users
export const TIP_AMOUNTS: TipAmount[] = [
  {
    value: 1,
    label: '$1',
    description: 'Quick tip',
  },
  {
    value: 2,
    label: '$2',
    description: 'Standard tip',
  },
  {
    value: 5,
    label: '$5',
    description: 'Premium tip',
  },
];

// Solana configuration
export const SOLANA_CONFIG = {
  network: 'devnet', // Change to 'mainnet-beta' for production
  rpcUrl: 'https://api.devnet.solana.com',
  usdcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mint address
  programId: 'YOUR_PROGRAM_ID_HERE', // Your Solana program ID
};

// App configuration
export const APP_CONFIG = {
  matchExpiryHours: 24, // How long a match request is valid
  ghostingWindowHours: 72, // How long before ghosting is detected
  maxPhotos: 6,
  minBioLength: 10,
  maxBioLength: 500,
  minAge: 18,
  maxAge: 100,
};

// Animation durations
export const ANIMATION_DURATION = {
  short: 200,
  medium: 400,
  long: 600,
};

// Ghosting thresholds
export const GHOSTING_THRESHOLDS = {
  warning: 2, // Show warning after 2 ghostings
  high: 5, // High ghosting risk after 5
  critical: 10, // Critical ghosting risk after 10
};

// Wallet connection options
export const WALLET_PROVIDERS = [
  'Phantom',
  'Solflare',
  'Backpack',
  'Glow',
] as const;

export type WalletProvider = typeof WALLET_PROVIDERS[number]; 