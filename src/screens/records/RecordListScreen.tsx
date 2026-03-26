import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AttendanceRecord } from '../../types/records';
import type { RecordStatus } from '../../types/incidents';
import type { MockRecordsService } from '../../services/MockRecordsService';
import { StatusBadge } from '../../components/StatusBadge';
import { Card } from '../../components/Card';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { formatDate, formatTime } from '../../utils/formatters';
import { colors, spacing, typography, borderRadius } from '../../theme';

type RecordsStackParamList = {
  RecordList: undefined;
  RecordDetail: { recordId: string };
};

interface RecordListScreenProps {
  navigation: NativeStackNavigationProp<RecordsStackParamList, 'RecordList'>;
  recordsService: MockRecordsService;
}

type FilterOption = { label: string; value: RecordStatus | null };
const FILTERS: FilterOption[] = [
  { label: 'Todos', value: null },
  { label: 'Abiertos', value: 'OPEN' },
  { label: 'Cerrados', value: 'CLOSED' },
  { label: 'Incidencia', value: 'INCIDENT' },
];

export const RecordListScreen: React.FC<RecordListScreenProps> = ({ navigation, recordsService }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RecordStatus | null>(null);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await recordsService.listRecords({
        date_from: '2025-01-01', date_to: '2025-12-31',
        status: statusFilter ?? undefined,
      });
      setRecords(response.content);
    } catch (err: any) {
      setError(err.message ?? 'Error al cargar registros');
    } finally {
      setIsLoading(false);
    }
  }, [recordsService, statusFilter]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <Card onPress={() => navigation.navigate('RecordDetail', { recordId: item.id })} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.workerName}>{item.worker_name}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.date}>{formatDate(item.date)}</Text>
      <View style={styles.timeRow}>
        <Text style={styles.time}>Entrada: {formatTime(item.clock_in)} ({item.clock_in_method})</Text>
        {item.clock_out && <Text style={styles.time}>Salida: {formatTime(item.clock_out)} ({item.clock_out_method})</Text>}
      </View>
      {item.total_hours != null && <Text style={styles.hours}>{item.total_hours.toFixed(1)}h</Text>}
    </Card>
  );

  if (isLoading) return <LoadingState message="Cargando registros..." />;
  if (error) return <ErrorState message={error} onRetry={loadRecords} />;

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f.label} style={[styles.chip, statusFilter === f.value && styles.chipActive]}
            onPress={() => setStatusFilter(f.value)} accessibilityRole="button" accessibilityState={{ selected: statusFilter === f.value }}>
            <Text style={[styles.chipText, statusFilter === f.value && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {records.length === 0 ? (
        <EmptyState icon="📋" title="Sin registros" message="No hay registros que coincidan con los filtros" />
      ) : (
        <FlatList data={records} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={styles.list} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.base, paddingVertical: spacing.md, gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textSecondary },
  chipTextActive: { color: colors.white },
  list: { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  workerName: { ...typography.bodyBold, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  date: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  time: { ...typography.small, color: colors.textSecondary },
  hours: { ...typography.bodyBold, color: colors.primary, textAlign: 'right' },
});
