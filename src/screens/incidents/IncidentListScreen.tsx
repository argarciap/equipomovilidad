import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AttendanceIncident,
  IncidentStatus,
} from '../../types/incidents';
import { IncidentService } from '../../services/IncidentService';
import { StatusBadge } from '../../components/StatusBadge';
import { Card } from '../../components/Card';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { formatDate, getIncidentTypeLabel } from '../../utils/formatters';
import { colors, spacing, typography, borderRadius } from '../../theme';

type IncidentsStackParamList = {
  IncidentList: undefined;
  IncidentDetail: { incidentId: string };
  CreateIncident: undefined;
};

interface IncidentListScreenProps {
  navigation: NativeStackNavigationProp<IncidentsStackParamList, 'IncidentList'>;
  incidentService: IncidentService;
  user: { id: string; role: string };
}

type FilterOption = {
  label: string;
  value: IncidentStatus | null;
};

const FILTERS: FilterOption[] = [
  { label: 'Todas', value: null },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Resueltas', value: 'RESOLVED' },
  { label: 'Rechazadas', value: 'REJECTED' },
];

const CAN_CREATE_ROLES = ['TRABAJADOR', 'ENCARGADO'];

export const IncidentListScreen: React.FC<IncidentListScreenProps> = ({
  navigation,
  incidentService,
  user,
}) => {
  const [incidents, setIncidents] = useState<AttendanceIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | null>(null);

  const loadIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await incidentService.listIncidents({
        status: statusFilter ?? undefined,
      });
      setIncidents(response.content);
    } catch (err: any) {
      setError(err.message ?? 'Error al cargar incidencias');
    } finally {
      setIsLoading(false);
    }
  }, [incidentService, statusFilter]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const handleCardPress = (incidentId: string) => {
    navigation.navigate('IncidentDetail', { incidentId });
  };

  const handleCreatePress = () => {
    navigation.navigate('CreateIncident');
  };

  const renderFilterChips = () => (
    <View style={styles.filterRow}>
      {FILTERS.map((filter) => {
        const isActive = statusFilter === filter.value;
        return (
          <TouchableOpacity
            key={filter.label}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => setStatusFilter(filter.value)}
            accessibilityRole="button"
            accessibilityLabel={`Filtrar: ${filter.label}`}
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderIncidentCard = ({ item }: { item: AttendanceIncident }) => (
    <Card
      onPress={() => handleCardPress(item.id)}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.workerName}>{item.worker_name}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.incidentType}>
        {getIncidentTypeLabel(item.type)}
      </Text>
      <Text style={styles.incidentDate}>
        {formatDate(item.affected_date)}
      </Text>
    </Card>
  );

  if (isLoading) {
    return <LoadingState message="Cargando incidencias..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadIncidents} />;
  }

  const showFab = CAN_CREATE_ROLES.includes(user.role);

  return (
    <View style={styles.container}>
      {renderFilterChips()}
      {incidents.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Sin incidencias"
          message="No hay incidencias que coincidan con los filtros seleccionados"
        />
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={(item) => item.id}
          renderItem={renderIncidentCard}
          contentContainerStyle={styles.listContent}
        />
      )}
      {showFab && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreatePress}
          accessibilityRole="button"
          accessibilityLabel="Crear incidencia"
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxl + spacing.xxl,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  workerName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  incidentType: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  incidentDate: {
    ...typography.small,
    color: colors.textDisabled,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '600',
    lineHeight: 30,
  },
});
