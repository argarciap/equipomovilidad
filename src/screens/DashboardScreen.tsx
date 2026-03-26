/**
 * Pantalla placeholder de Dashboard.
 * Muestra nombre y rol del usuario autenticado.
 *
 * Requisitos: 5.1, 5.5
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../auth/AuthContext';

export function DashboardScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.info}>
        Usuario: {user?.firstName} {user?.lastName}
      </Text>
      <Text style={styles.info}>Rol: {user?.role}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={logout} accessibilityRole="button" accessibilityLabel="Cerrar sesión">
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
