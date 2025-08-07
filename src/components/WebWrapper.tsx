import React from 'react';
import { View, ViewStyle } from 'react-native';

interface WebWrapperProps {
  children: React.ReactNode;
}

const WebWrapper: React.FC<WebWrapperProps> = ({ children }) => {
  const webStyle: ViewStyle = {
    flex: 1,
    width: '100%' as any,
    height: '100%' as any,
    backgroundColor: '#0A0A0A',
    minHeight: '100vh' as any,
    overflow: 'auto' as any
  };

  return (
    <View style={webStyle}>
      {children}
    </View>
  );
};

export default WebWrapper; 