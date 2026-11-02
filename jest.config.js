module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|react-native-safe-area-context|react-native-screens|@react-native(-community)?|@react-native-async-storage|@react-navigation|@react-native-masked-view)/)',
  ],
};
