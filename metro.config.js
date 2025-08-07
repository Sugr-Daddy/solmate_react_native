const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for web platform
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Handle React Native Web specific issues
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native$': 'react-native-web',
  'react-native/Libraries/Utilities/Platform': 'react-native-web/dist/exports/Platform',
};

// Add support for additional file extensions
config.resolver.sourceExts.push('cjs');

// Configure for better web compatibility
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config; 