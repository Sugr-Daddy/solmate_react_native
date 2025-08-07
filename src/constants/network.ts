import { Platform } from 'react-native';

// Network configuration for different environments
export const NetworkConfig = {
  // API server port
  PORT: 3001,
  
  // Get the appropriate API base URL based on platform
  getApiBaseUrl(): string {
    if (Platform.OS === 'web') {
      return `http://localhost:${this.PORT}/api`;
    }
    
    // For mobile devices (Expo Go), we need to use the computer's local IP
    // This should be updated to match your computer's IP address
    const LOCAL_IP = this.getLocalIP();
    return `http://${LOCAL_IP}:${this.PORT}/api`;
  },
  
  // Get local IP address (you can override this manually if needed)
  getLocalIP(): string {
    // Common local IP ranges - you might need to update this based on your network
    // You can find your IP by running `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
    
    // Update this with your actual local IP address from the server output
    return '172.25.128.1'; // Updated from server output
  },
  
  // Health check URL
  getHealthUrl(): string {
    if (Platform.OS === 'web') {
      return `http://localhost:${this.PORT}/health`;
    }
    return `http://${this.getLocalIP()}:${this.PORT}/health`;
  }
};

// Export for use in development
export const DEV_CONFIG = {
  // Set this to your computer's local IP address when using Expo Go
  LOCAL_IP: '172.25.128.1', // Updated from server output
  PORT: 3001,
};
