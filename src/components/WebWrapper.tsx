import React from 'react';
import { View } from 'react-native';

interface WebWrapperProps {
  children: React.ReactNode;
}

const WebWrapper: React.FC<WebWrapperProps> = ({ children }) => {
  return (
    <View className="web-container bg-background-primary">
      {children}
    </View>
  );
};

export default WebWrapper; 