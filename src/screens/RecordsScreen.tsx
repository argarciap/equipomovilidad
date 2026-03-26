import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/auth/AuthContext';

export function RecordsScreen(): React.JSX.Element {
  const { user } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registros</Text>
      <Text style={styles.info}>Rol: {user?.role}</Text>
      <Text style={styles.info}>Será implementada por Integrante 4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  info: { fontSize: 16, marginBottom: 8 },
});
