/**
 * Application entry point.
 *
 * Wraps the component tree with AuthProvider (using MockAuthService)
 * and NavigationContainer (with deep link configuration).
 *
 * Requisitos: 2.1, 4.1, 4.8
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './auth/AuthProvider';
import { MockAuthService } from './auth/MockAuthService';
import { MainStack } from './navigation/MainStack';
import { linking } from './navigation/linking';

const authService = new MockAuthService();

export function App(): React.JSX.Element {
  return (
    <AuthProvider authService={authService}>
      <NavigationContainer linking={linking}>
        <MainStack />
      </NavigationContainer>
    </AuthProvider>
  );
}
