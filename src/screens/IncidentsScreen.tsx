/**
 * Pantalla placeholder de Incidencias.
 * Será implementada por Integrante 5.
 *
 * Requisitos: 5.4, 5.5
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../auth/AuthContext';

export function IncidentsScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incidencias — Será implementada por Integrante 5</Text>
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
