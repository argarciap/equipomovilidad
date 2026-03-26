/**
 * Login screen with role selector.
 * Renders a FlatList of available mock users from AuthProvider.
 * Each item shows full name and a colored role badge.
 * On press, invokes login(user.id) from AuthProvider.
 *
 * Requisitos: 3.1, 3.2, 3.4
 */

import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { User, UserRole } from '../types';
import { useAuth } from '../auth/AuthContext';

const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  ADMIN: '#DC2626',
  JEFE_OBRA: '#2563EB',
  ENCARGADO: '#16A34A',
  TRABAJADOR: '#EA580C',
  PREVENCION: '#9333EA',
  SOLO_LECTURA: '#6B7280',
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  JEFE_OBRA: 'Jefe de Obra',
  ENCARGADO: 'Encargado',
  TRABAJADOR: 'Trabajador',
  PREVENCION: 'Prevención',
  SOLO_LECTURA: 'Solo Lectura',
};

export function LoginScreen(): React.JSX.Element {
  const { availableUsers, login } = useAuth();

  const handlePress = async (userId: string): Promise<void> => {
    await login(userId);
  };

  const renderItem = ({ item }: { item: User }): React.JSX.Element => {
    const badgeColor = ROLE_BADGE_COLORS[item.role];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePress(item.id)}
        testID={`user-card-${item.id}`}
      >
        <Text style={styles.name}>
          {item.firstName} {item.lastName}
        </Text>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{ROLE_LABELS[item.role]}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona tu usuario</Text>
      <FlatList
        data={availableUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        testID="user-list"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
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
    fontWeight: '600',
  },
});
