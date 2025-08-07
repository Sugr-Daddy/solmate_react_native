import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
}

export class ImagePickerService {
  static async requestPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to make this work!',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }

  static async requestCameraPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to make this work!',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }

  static async pickFromGallery(): Promise<ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4], // Portrait aspect ratio
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          width: asset.width || 400,
          height: asset.height || 600,
          type: asset.type,
          fileName: asset.fileName,
        };
      }

      return null;
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
      return null;
    }
  }

  static async takePhoto(): Promise<ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4], // Portrait aspect ratio
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          width: asset.width || 400,
          height: asset.height || 600,
          type: asset.type,
          fileName: asset.fileName,
        };
      }

      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
      return null;
    }
  }

  static async uploadImage(imageResult: ImagePickerResult): Promise<string> {
    // Mock upload - in a real app, this would upload to a cloud service
    // For now, we'll just return the local URI
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real implementation, you would upload to your backend
        // and return the uploaded URL
        resolve(imageResult.uri);
      }, 1000);
    });
  }

  static validateImage(imageResult: ImagePickerResult): boolean {
    const minWidth = 300;
    const minHeight = 400;
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (imageResult.width < minWidth || imageResult.height < minHeight) {
      Alert.alert(
        'Image Too Small',
        'Please select an image that is at least 300x400 pixels.'
      );
      return false;
    }

    // Note: In a real app, you'd check the actual file size
    // This is just a placeholder
    return true;
  }
} 