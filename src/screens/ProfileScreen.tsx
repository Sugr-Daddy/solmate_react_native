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
  Modal,
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

interface ProfileScreenProps {
  currentUser: User | null;
  onSignOut: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ currentUser, onSignOut }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User>(currentUser || MOCK_USER);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [privacyEnabled, setPrivacyEnabled] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Update local state when currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => solanaService.connectWallet(),
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original data
    setUser(MOCK_USER);
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
          onPress: onSignOut,
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
      {/* Add logout button */}
      <TouchableOpacity 
        style={styles.headerLogoutButton}
        onPress={onSignOut}
      >
        <Ionicons name="log-out-outline" size={24} color="#00F90C" />
      </TouchableOpacity>
      
      <View style={styles.profileImageContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: user.photos[0] }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          {isEditing && (
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={() => setShowPhotoModal(true)}
            >
              <Ionicons name="camera" size={16} color="#000000" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.profileInfo}>
          {isEditing ? (
            <TextInput
              value={user.name}
              onChangeText={(text) => setUser({ ...user, name: text })}
              style={styles.editNameInput}
              placeholder="Your name"
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <Text style={styles.userName}>{user.name}</Text>
          )}
          <Text style={styles.userAge}>{user.age} years old</Text>
          {isEditing ? (
            <TextInput
              value={user.bio}
              onChangeText={(text) => setUser({ ...user, bio: text })}
              style={styles.editBioInput}
              placeholder="Tell us about yourself"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={styles.userBio}>{user.bio}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.editSection}>
        {isEditing ? (
          <View style={styles.editButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <Ionicons name="close" size={20} color="#FF6B6B" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Ionicons name="checkmark" size={20} color="#000000" />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Ionicons name="create" size={20} color="#00F90C" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEditSection = () => {
    if (!isEditing) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="create" size={24} color="#00F90C" />
          <Text style={styles.sectionTitle}>Edit Profile</Text>
        </View>
        <View style={styles.editForm}>
          <View style={styles.formItem}>
            <Text style={styles.formLabel}>Age</Text>
            <TextInput
              value={user.age.toString()}
              onChangeText={(text) => setUser({ ...user, age: parseInt(text) || 0 })}
              style={styles.formInput}
              placeholder="Your age"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formItem}>
            <Text style={styles.formLabel}>Preferred Tip Amount</Text>
            <TextInput
              value={user.preferredTipAmount.toString()}
              onChangeText={(text) => setUser({ ...user, preferredTipAmount: parseInt(text) || 0 })}
              style={styles.formInput}
              placeholder="Tip amount in USDC"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formItem}>
            <Text style={styles.formLabel}>Gender</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  user.gender === 'male' && styles.genderButtonActive
                ]}
                onPress={() => setUser({ ...user, gender: 'male' })}
              >
                <Text style={[
                  styles.genderButtonText,
                  user.gender === 'male' && styles.genderButtonTextActive
                ]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  user.gender === 'female' && styles.genderButtonActive
                ]}
                onPress={() => setUser({ ...user, gender: 'female' })}
              >
                <Text style={[
                  styles.genderButtonText,
                  user.gender === 'female' && styles.genderButtonTextActive
                ]}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

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

  const renderPhotoModal = () => (
    <Modal
      visible={showPhotoModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPhotoModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Profile Photo</Text>
            <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.photoOptions}>
            <TouchableOpacity style={styles.photoOption}>
              <Ionicons name="camera" size={32} color="#00F90C" />
              <Text style={styles.photoOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.photoOption}>
              <Ionicons name="images" size={32} color="#00F90C" />
              <Text style={styles.photoOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        {renderEditSection()}
        {renderWalletSection()}
        {renderStatsSection()}
        {renderSettingsSection()}
        {renderActionButtons()}
      </ScrollView>
      {renderPhotoModal()}
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
    position: 'relative',
  },
  headerLogoutButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
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
  editNameInput: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  editBioInput: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 60,
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
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  cancelButtonText: {
    color: '#FF6B6B',
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
  editForm: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
  },
  formItem: {
    marginBottom: 16,
  },
  formLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#00F90C',
  },
  genderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  genderButtonTextActive: {
    color: '#000000',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  photoOptions: {
    gap: 16,
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  photoOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default ProfileScreen; 