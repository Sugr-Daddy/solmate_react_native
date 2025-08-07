import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Switch,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { User } from '../types';
import { solanaService } from '../services/solana';

// Enhanced mock user data
const MOCK_USER: User = {
  id: 'user-1',
  walletAddress: 'mock-wallet-address-123',
  gender: 'male',
  name: 'Alex Chen',
  age: 26,
  bio: 'Tech enthusiast & adventure seeker 🚀 Love hiking, photography, and discovering new coffee shops. Looking for someone to share life\'s beautiful moments with! ✨',
  photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face&auto=format'],
  preferredTipAmount: 3,
  ghostedCount: 0,
  ghostedByCount: 0,
  matchCount: 15,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const ProfileScreen: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User>(MOCK_USER);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [privacyEnabled, setPrivacyEnabled] = useState(false);

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => solanaService.connectWallet(),
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Logged Out', 'You have been logged out successfully');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted');
          },
        },
      ]
    );
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.profileImageContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: user.photos[0] }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera" size={16} color="#000000" />
          </TouchableOpacity>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>
            {user.name}
          </Text>
          <Text style={styles.userAge}>
            {user.age} years old
          </Text>
          <Text style={styles.userBio}>
            {user.bio}
          </Text>
        </View>
      </View>
      
      <View style={styles.editSection}>
        {isEditing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Ionicons name="checkmark" size={20} color="#000000" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Ionicons name="create" size={20} color="#00F90C" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderWalletSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="wallet" size={24} color="#00F90C" />
        <Text style={styles.sectionTitle}>Wallet</Text>
      </View>
      <View style={styles.walletInfo}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>SOL Balance</Text>
          <Text style={styles.balanceValue}>
            {wallet?.balance?.toFixed(4) || '0.0000'} SOL
          </Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>USDC Balance</Text>
          <Text style={styles.balanceValue}>
            ${wallet?.usdcBalance?.toFixed(2) || '0.00'} USDC
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStatsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="analytics" size={24} color="#00F90C" />
        <Text style={styles.sectionTitle}>Stats</Text>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Ionicons name="heart" size={24} color="#FF6B6B" />
          <Text style={styles.statValue}>{user.matchCount}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="close-circle" size={24} color="#8B5CF6" />
          <Text style={styles.statValue}>{user.ghostedCount}</Text>
          <Text style={styles.statLabel}>Ghosted</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="trending-up" size={24} color="#00F90C" />
          <Text style={styles.statValue}>${user.preferredTipAmount}</Text>
          <Text style={styles.statLabel}>Avg Tip</Text>
        </View>
      </View>
    </View>
  );

  const renderSettingsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="settings" size={24} color="#00F90C" />
        <Text style={styles.sectionTitle}>Settings</Text>
      </View>
      <View style={styles.settingsList}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={20} color="#FFFFFF" />
            <Text style={styles.settingLabel}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#333333', true: '#00F90C' }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="location" size={20} color="#FFFFFF" />
            <Text style={styles.settingLabel}>Location</Text>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: '#333333', true: '#00F90C' }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="shield" size={20} color="#FFFFFF" />
            <Text style={styles.settingLabel}>Privacy Mode</Text>
          </View>
          <Switch
            value={privacyEnabled}
            onValueChange={setPrivacyEnabled}
            trackColor={{ false: '#333333', true: '#00F90C' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.section}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#FF6B6B" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Ionicons name="trash" size={20} color="#FF6B6B" />
        <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        {renderWalletSection()}
        {renderStatsSection()}
        {renderSettingsSection()}
        {renderActionButtons()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  profileHeader: {
    backgroundColor: 'rgba(0, 249, 12, 0.1)',
    borderRadius: 24,
    padding: 24,
    margin: 16,
    marginBottom: 24,
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00F90C',
    padding: 8,
    borderRadius: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userAge: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 8,
  },
  userBio: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },
  editSection: {
    alignItems: 'flex-end',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 249, 12, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00F90C',
  },
  editButtonText: {
    color: '#00F90C',
    fontWeight: '600',
    marginLeft: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F90C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  walletInfo: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  balanceLabel: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  settingsList: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    marginBottom: 12,
  },
  logoutButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen; 