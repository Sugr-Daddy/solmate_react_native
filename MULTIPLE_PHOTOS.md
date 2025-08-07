# Multiple Photos Feature

## Overview
The solmate_app now supports multiple photos for user profiles. Users can upload up to 6 photos to their profile, and these photos are displayed in a carousel format across the app.

## Features

### Profile Screen
- **Photo Carousel**: Users can swipe through their photos horizontally
- **Photo Indicators**: Dots at the bottom show which photo is currently displayed
- **Add Photos**: Users can add new photos via camera or gallery (up to 6 total)
- **Remove Photos**: Users can remove photos by tapping the X button (minimum 1 photo required)
- **Photo Count Badge**: Shows current photo count (e.g., "3/6")

### Discovery Screen
- **Multiple Photos**: Each user card shows multiple photos in a carousel
- **Photo Indicators**: Shows which photo is currently displayed
- **Swipe Navigation**: Users can swipe through photos on each card

### Match Cards
- **Photo Carousel**: Match cards display multiple photos with swipe functionality
- **Photo Indicators**: Visual indicators show current photo position

## Technical Implementation

### Image Picker Service
Located at `src/utils/imagePicker.ts`:
- Handles camera and gallery photo selection
- Validates image dimensions (minimum 300x400 pixels)
- Manages permissions for camera and gallery access
- Mock upload functionality (ready for backend integration)

### User Type
The `User` interface in `src/types/index.ts` already supports multiple photos:
```typescript
interface User {
  // ... other fields
  photos: string[]; // Array of photo URLs
  // ... other fields
}
```

### Components Updated
1. **ProfileScreen**: Added photo carousel, add/remove functionality
2. **MatchCard**: Added photo carousel with indicators
3. **DiscoveryScreen**: Updated mock data with multiple photos
4. **MatchesScreen**: Updated mock data with multiple photos

## Usage

### Adding Photos
1. Navigate to Profile Screen
2. Tap "Edit" button
3. Tap the "+" button on the photo carousel
4. Choose "Take Photo" or "Choose from Gallery"
5. Select/capture your photo
6. Photo will be uploaded and added to your profile

### Removing Photos
1. Navigate to Profile Screen
2. Tap "Edit" button
3. Tap the "X" button on any photo (except the last one)
4. Photo will be removed from your profile

### Viewing Photos
- **Profile**: Swipe horizontally through your photos
- **Discovery**: Swipe through photos on user cards
- **Matches**: Swipe through photos on match cards

## Dependencies
- `expo-image-picker`: For camera and gallery access
- `react-native-reanimated`: For smooth animations
- `@expo/vector-icons`: For UI icons

## Future Enhancements
- Backend integration for photo upload
- Photo reordering functionality
- Photo filters and editing
- Video support
- Photo privacy settings 