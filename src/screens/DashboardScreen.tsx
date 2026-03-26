/**
 * Pantalla placeholder de Dashboard.
 * Muestra nombre y rol del usuario autenticado.
 *
 * Requisitos: 5.1, 5.5
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../auth/AuthContext';

export function DashboardScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard — Integrante 2</Text>
      <Text style={styles.info}>
        Usuario: {user?.firstName} {user?.lastName}
      </Text>
      <Text style={styles.info}>Rol: {user?.role}</Text>
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
});
