import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NetworkConfig } from '../constants/network';

const NetworkTestScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>('');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionStatus('testing');
    const healthUrl = NetworkConfig.getHealthUrl();
    const baseUrl = NetworkConfig.getApiBaseUrl();
    setApiUrl(baseUrl);

    try {
      console.log(`Testing connection to: ${healthUrl}`);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Connection successful:', data);
        setConnectionStatus('success');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing': return '#F59E0B';
      case 'success': return '#00F90C';
      case 'error': return '#FF6B6B';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing': return 'sync';
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing': return 'Testing connection...';
      case 'success': return 'Connected successfully!';
      case 'error': return 'Connection failed';
    }
  };

  const showNetworkHelp = () => {
    const helpMessage = Platform.OS === 'web' 
      ? 'You are running on web. Make sure the API server is running on localhost:3001'
      : `You are running on ${Platform.OS}. Make sure:
1. Your API server is running on your computer
2. Your phone and computer are on the same WiFi network
3. Update the LOCAL_IP in src/constants/network.ts to your computer's IP address

Current API URL: ${apiUrl}

To find your IP address:
• Windows: Run 'ipconfig' in Command Prompt
• Mac/Linux: Run 'ifconfig' in Terminal
• Look for your WiFi adapter's IP address`;

    Alert.alert('Network Setup Help', helpMessage);
  };

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Network Connection Test</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.statusContainer}>
          <Ionicons 
            name={getStatusIcon()} 
            size={64} 
            color={getStatusColor()}
            style={connectionStatus === 'testing' ? styles.spinning : undefined} 
          />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          
          {connectionStatus === 'error' && (
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          )}

          <Text style={styles.urlText}>
            API URL: {apiUrl}
          </Text>
          <Text style={styles.platformText}>
            Platform: {Platform.OS}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={testConnection} style={styles.retryButton}>
            <Ionicons name="refresh" size={20} color="#000000" />
            <Text style={styles.retryButtonText}>Test Again</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={showNetworkHelp} style={styles.helpButton}>
            <Ionicons name="help-circle" size={20} color="#00F90C" />
            <Text style={styles.helpButtonText}>Help</Text>
          </TouchableOpacity>
        </View>

        {connectionStatus === 'success' && (
          <TouchableOpacity onPress={onClose} style={styles.continueButton}>
            <Text style={styles.continueButtonText}>Continue to App</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  urlText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  platformText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F90C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#000000',
    fontWeight: '600',
    marginLeft: 8,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00F90C',
  },
  helpButtonText: {
    color: '#00F90C',
    fontWeight: '600',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: '#00F90C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spinning: {
    // Add spinning animation if needed
  },
});

export default NetworkTestScreen;
