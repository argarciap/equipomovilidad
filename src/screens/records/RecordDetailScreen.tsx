import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import type { AttendanceRecord } from '../../types/records';
import type { MockRecordsService } from '../../services/MockRecordsService';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { colors, spacing, typography, borderRadius } from '../../theme';

type RecordsStackParamList = { RecordList: undefined; RecordDetail: { recordId: string } };

interface RecordDetailScreenProps {
  route: RouteProp<RecordsStackParamList, 'RecordDetail'>;
  recordsService: MockRecordsService;
}

const Row: React.FC<{ label: string; value: string | null }> = ({ label, value }) => {
  if (!value) return null;
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>;
};

export const RecordDetailScreen: React.FC<RecordDetailScreenProps> = ({ route, recordsService }) => {
  const { recordId } = route.params;
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { setRecord(await recordsService.getRecord(recordId)); }
    catch (err: any) { setError(err.message ?? 'Error al cargar registro'); }
    finally { setIsLoading(false); }
  }, [recordsService, recordId]);

  useEffect(() => { load(); }, [load]);

  if (isLoading) return <LoadingState message="Cargando registro..." />;
  if (error || !record) return <ErrorState message={error ?? 'Registro no encontrado'} onRetry={load} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{record.worker_name}</Text>
        <StatusBadge status={record.status} />
      </View>
      <View style={styles.section}>
        <Row label="Fecha" value={formatDate(record.date)} />
        <Row label="Entrada" value={formatDateTime(record.clock_in)} />
        <Row label="Método entrada" value={record.clock_in_method} />
        <Row label="Salida" value={record.clock_out ? formatDateTime(record.clock_out) : 'Pendiente'} />
        <Row label="Método salida" value={record.clock_out_method} />
        {record.total_hours != null && <Row label="Horas totales" value={`${record.total_hours.toFixed(1)}h`} />}
        {record.clock_in_location && <Row label="Ubicación entrada" value={`${record.clock_in_location.latitude.toFixed(4)}, ${record.clock_in_location.longitude.toFixed(4)}`} />}
        {record.clock_out_location && <Row label="Ubicación salida" value={`${record.clock_out_location.latitude.toFixed(4)}, ${record.clock_out_location.longitude.toFixed(4)}`} />}
        {record.modification_reason && <Row label="Motivo corrección" value={record.modification_reason} />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base },
  title: { ...typography.title, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  section: { backgroundColor: colors.surface, borderRadius: borderRadius.medium, padding: spacing.base },
  row: { marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  value: { ...typography.body, color: colors.textPrimary },
});
