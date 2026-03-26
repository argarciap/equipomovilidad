module.exports = {
  preset: 'react-native',
  setupFiles: [
    './node_modules/@react-native-async-storage/async-storage/jest/async-storage-mock.js',
  ],
  setupFilesAfterSetup: [],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-async-storage)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
