const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Customize the config before returning it.
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    // Add specific aliases for problematic modules
    'react-native/Libraries/Utilities/Platform': 'react-native-web/dist/exports/Platform',
  };

  // Add support for TypeScript
  config.resolve.extensions.push('.ts', '.tsx');

  // Configure for better web performance
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  };

  // Handle React Native Web specific issues
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer"),
  };

  return config;
}; 