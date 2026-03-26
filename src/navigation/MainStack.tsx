/**
 * Main stack navigator with conditional rendering based on auth state.
 *
 * - isLoading: shows centered ActivityIndicator
 * - !isAuthenticated: shows LoginScreen (auth branch)
 * - isAuthenticated: shows BottomTabs (authenticated app branch)
 *
 * Uses conditional rendering (not initialRouteName) as per design doc.
 *
 * Requisitos: 3.3, 3.5, 4.1, 4.2, 4.3
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { BottomTabs } from './BottomTabs';

const Stack = createNativeStackNavigator();

export function MainStack(): React.JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" testID="loading-indicator" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={BottomTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
