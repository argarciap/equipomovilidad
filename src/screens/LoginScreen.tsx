import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '@/auth/AuthContext';
import type { User, UserRole } from '@/types';

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: '#8B0000',
  JEFE_OBRA: '#1565C0',
  ENCARGADO: '#2E7D32',
  TRABAJADOR: '#E65100',
  PREVENCION: '#6A1B9A',
  SOLO_LECTURA: '#757575',
};

function UserCard({
  user,
  onPress,
  disabled,
}: {
  user: User;
  onPress: () => void;
  disabled: boolean;
}) {
  const badgeColor = ROLE_COLORS[user.role];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${user.firstName} ${user.lastName}, ${user.role}`}
    >
      <Text style={styles.userName}>
        {user.firstName} {user.lastName}
      </Text>
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{user.role}</Text>
      </View>
    </Pressable>
  );
}

export function LoginScreen(): React.JSX.Element {
  const { availableUsers, login } = useAuth();
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = useCallback(
    async (userId: string) => {
      setLoggingIn(true);
      try {
        await login(userId);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Error desconocido';
        Alert.alert('Error de inicio de sesión', message);
      } finally {
        setLoggingIn(false);
      }
    },
    [login],
  );

  const renderItem = useCallback(
    ({ item }: { item: User }) => (
      <UserCard
        user={item}
        onPress={() => handleLogin(item.id)}
        disabled={loggingIn}
      />
    ),
    [handleLogin, loggingIn],
  );

  const keyExtractor = useCallback((item: User) => item.id, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleccionar Usuario</Text>
      <FlatList
        data={availableUsers}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#212121',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  cardPressed: {
    opacity: 0.7,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    flexShrink: 1,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
