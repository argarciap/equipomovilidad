import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '@/auth/AuthProvider';
import { MockAuthService } from '@/auth/MockAuthService';
import { MainStack } from '@/navigation/MainStack';
import { linking } from '@/navigation/linking';

const mockAuthService = new MockAuthService();
const availableUsers = mockAuthService.getAvailableUsers();

export default function App(): React.JSX.Element {
  return (
    <AuthProvider authService={mockAuthService} availableUsers={availableUsers}>
      <NavigationContainer linking={linking}>
        <MainStack />
      </NavigationContainer>
    </AuthProvider>
  );
}
