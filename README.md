# Solmate - Blockchain-Powered Dating App

Solmate (S-O-L-M-A-T-E) is a revolutionary dating app that uses the Solana blockchain to prevent ghosting through USDC tipping mechanics. Users tip in USDC to get matches, with anti-ghosting mechanics that ensure accountability.

## 🎯 Overview

Solmate combines the best of dating apps with blockchain technology to create a more honest and accountable dating experience. The app uses USDC tips as a commitment mechanism - if someone ghosts you after accepting a tip, they forfeit the tip to you.

## 🔐 Feature Summary

### 👨 Male Flow:
- Choose gender: "I am a man"
- Select tip amount: $1, $2, or $5
- Upload photos and add bio
- Fund Solana wallet with USDC
- Browse profiles and send tips
- **Anti-ghosting mechanics**: If accepted + ghosted, girl keeps the tip. If not accepted, man gets refunded.

### 👩 Female Flow:
- Choose gender: "I am a woman"
- Choose preferred tip amount: $1, $2, or $5
- Upload photos and add bio + optional Q&A
- Connect wallet
- Browse or receive matches

### 💡 Key Features:
- **USDC Locking**: All funds locked in USDC on Solana
- **Match = Transaction**: Every match is a blockchain transaction
- **Ghost = Forfeit**: Ghosting results in tip forfeiture
- **Public History**: Wallet history reveals ghosting behavior
- **Anti-Ghosting**: Transparent accountability system

## 🖌️ Design Requirements

### General Style:
- **Theme**: Futuristic meets elegant dating app aesthetic
- **Font**: Custom rounded sans-serif fonts (Inter, SF Pro Rounded)
- **Design System**: Dark mode default with neon green (#00F90C) and (#00C000) accents
- **Colors**: Dark backgrounds with bright green CTAs

### UI/UX Features:
- **Animated gender selection screen**
- **Elegant tip selector with glow hover effects**
- **Upload flow with progress indicators**
- **Modal-based wallet connection with Solana brand flair**
- **Swipeable card UI (Tinder-style) with blurred background photos**
- **Floating tip buttons ($1, $2, $5) at bottom**
- **Ghosting tags showing wallet match history**
- **Smooth wallet animations using Reanimated 3**
- **Microinteractions for tips (sparkles, coin flips)**

## 💻 Tech Stack

### Frontend:
- **React Native** with Expo
- **React Navigation** for routing
- **Tailwind CSS** (via NativeWind)
- **react-native-deck-swiper** for card swiping
- **react-native-reanimated** for animations
- **TypeScript** for type safety

### Blockchain & Wallets:
- **@solana/web3.js** for Solana interactions
- **@solana/spl-token** for USDC token operations
- **USDC Token Program** integration
- **Phantom Wallet Connect** support
- **Solana Pay** integration (optional)

### Backend (Future):
- **Firebase/Supabase** for user data
- **MongoDB/PostgreSQL** for match states
- **Smart contract** for escrow logic

## 🏗️ Project Structure

```
solmate_app/
├── src/
│   ├── components/
│   │   └── MatchCard.tsx          # Swipeable profile cards
│   ├── screens/
│   │   ├── OnboardingScreen.tsx   # Gender selection & wallet setup
│   │   ├── DiscoveryScreen.tsx    # Main swiping interface
│   │   ├── MatchesScreen.tsx      # Pending/accepted matches
│   │   ├── WalletScreen.tsx       # Transaction history
│   │   └── ProfileScreen.tsx      # User profile & settings
│   ├── services/
│   │   └── solana.ts              # Blockchain interactions
│   ├── types/
│   │   └── index.ts               # TypeScript definitions
│   ├── constants/
│   │   └── index.ts               # App constants & config
│   └── utils/                     # Utility functions
├── App.tsx                        # Main app with navigation
├── tailwind.config.js             # Tailwind CSS configuration
└── README.md                      # This file
```

## 🚀 Getting Started

### Prerequisites:
- Node.js (v18 or higher)
- Expo CLI
- Solana wallet (Phantom, Solflare, etc.)
- USDC tokens for testing

### Installation:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd solmate_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on different platforms**
   ```bash
   # iOS Simulator
   npx expo start --ios
   
   # Android Emulator
   npx expo start --android
   
   # Web Browser
   npx expo start --web
   ```

## 🔧 Smart Contract Logic

The app includes a Solana program that handles:

### Escrow System:
- **Lock USDC** into temporary escrow
- **24-hour match window**: If no mutual match, refund to sender
- **72-hour ghosting window**: If matched but ghosted, release to receiver
- **All transactions** stored as on-chain metadata

### Safety Features:
- **Wallet disconnect handling**
- **Fake matching prevention**
- **Spam protection**
- **Edge case handling**

## 📱 Screenshots & Features

### Onboarding Flow:
1. **Gender Selection**: Animated male/female selection
2. **Tip Amount**: Choose $1, $2, or $5 with glow effects
3. **Wallet Connection**: Connect Phantom, Solflare, or Backpack

### Discovery Screen:
- **Swipeable Cards**: Tinder-style interface with blurred backgrounds
- **Tip Buttons**: Floating $1/$2/$5 buttons with animations
- **Ghosting Tags**: Show ghosting history from wallet data
- **Wallet Status**: Display USDC balance and connection status

### Matches Screen:
- **Pending Matches**: Accept/reject incoming match requests
- **Accepted Matches**: View successful matches
- **Ghosting Warnings**: Alert users about ghosting history
- **Transaction Status**: Show tip amounts and outcomes

### Wallet Screen:
- **Balance Display**: SOL and USDC balances
- **Transaction History**: All tip interactions with status
- **Ghosting Stats**: Track ghosting behavior
- **Wallet Connection**: Connect new wallets

### Profile Screen:
- **User Stats**: Match count, ghosting history
- **Settings**: Notifications, location, privacy
- **Wallet Info**: Address and balance display
- **Profile Editing**: Update bio, photos, preferences

## 🎨 Design System

### Colors:
- **Primary**: #00F90C (Neon Green)
- **Primary Dark**: #00C000
- **Background**: #0A0A0A (Dark)
- **Background Secondary**: #1A1A1A
- **Text Primary**: #FFFFFF
- **Text Secondary**: #A0A0A0
- **Ghost**: #FF6B6B (Red for ghosting)

### Animations:
- **Glow Effects**: Pulsing green glow on selected items
- **Sparkle Animations**: Micro-interactions for tips
- **Coin Flip**: Animated tip button interactions
- **Smooth Transitions**: Reanimated 3 for fluid UX

## 🔐 Security Features

### Anti-Ghosting Mechanics:
- **Escrow System**: USDC locked in smart contract
- **Time Windows**: 24h for matches, 72h for ghosting
- **Public History**: All ghosting behavior on-chain
- **Refund Logic**: Automatic refunds for rejected matches

### Wallet Security:
- **Connection Validation**: Verify wallet authenticity
- **Balance Checks**: Ensure sufficient USDC before tips
- **Transaction Signing**: Secure Solana transaction handling
- **Error Handling**: Graceful failure recovery

## 🚀 Deployment

### Building for Production:
```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android

# Build for web
npx expo build:web
```

### Smart Contract Deployment:
1. Deploy Solana program to devnet/mainnet
2. Update `SOLANA_CONFIG.programId` in constants
3. Test with devnet USDC before mainnet

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on devnet
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Solana Foundation** for blockchain infrastructure
- **Expo** for React Native development platform
- **React Navigation** for mobile navigation
- **Tailwind CSS** for styling system
- **React Query** for state management

## 🔮 Future Roadmap

### Phase 2 Features:
- **Video Profiles**: Short video introductions
- **Group Chats**: Multi-person conversations
- **Event Matching**: Location-based meetups
- **Premium Features**: Advanced filtering and boosts

### Phase 3 Features:
- **NFT Badges**: Achievement system
- **DAO Governance**: Community-driven features
- **Cross-Chain**: Support for other blockchains
- **AI Matching**: Machine learning recommendations

---

**Solmate** - Where blockchain meets romance, and ghosting becomes expensive! 💚 