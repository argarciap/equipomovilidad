/**
 * Mock implementation of AuthService.
 * Loads users from mock-data.json and persists auth state in AsyncStorage.
 *
 * Requisitos: 2.2, 2.3, 2.4, 2.6, 7.1, 7.3
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthService, User, UserRole } from '../types';
import mockData from '../../mock-data.json';

const AUTH_STORAGE_KEY = 'auth_user_id';

interface MockUserRaw {
  id: string;
  external_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

function toUser(raw: MockUserRaw): User {
  return {
    id: raw.id,
    email: raw.email,
    firstName: raw.first_name,
    lastName: raw.last_name,
    role: raw.role as UserRole,
  };
}

const users: User[] = (mockData.users as MockUserRaw[]).map(toUser);

/**
 * Returns all mock users available for the login screen.
 */
export function getAvailableUsers(): User[] {
  return users;
}

export class MockAuthService implements AuthService {
  async login(userId: string): Promise<User> {
    const user = users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, userId);
    return user;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    const userId = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!userId) {
      return null;
    }
    return users.find((u) => u.id === userId) ?? null;
  }
}
