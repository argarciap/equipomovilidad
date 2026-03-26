import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthService, User, UserRole } from '@/types';
import mockData from '@/data/mock-data.json';

const AUTH_STORAGE_KEY = 'auth_user_id';

interface RawMockUser {
  id: string;
  external_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

function mapRawUser(raw: RawMockUser): User {
  return {
    id: raw.id,
    email: raw.email,
    firstName: raw.first_name,
    lastName: raw.last_name,
    role: raw.role as UserRole,
  };
}

export class MockAuthService implements AuthService {
  private users: User[];

  constructor() {
    this.users = (mockData.users as RawMockUser[]).map(mapRawUser);
  }

  async login(userId: string): Promise<User> {
    if (!userId || userId.trim() === '') {
      throw new Error('El userId no puede estar vacío');
    }

    const user = this.users.find(u => u.id === userId);
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
    return this.users.find(u => u.id === userId) ?? null;
  }

  getAvailableUsers(): User[] {
    return this.users;
  }
}
