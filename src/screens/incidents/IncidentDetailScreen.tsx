import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AttendanceIncident, Resolution } from '../../types/incidents';
import { IncidentService } from '../../services/IncidentService';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import {
  formatDate,
  formatDateTime,
  getIncidentTypeLabel,
} from '../../utils/formatters';
import { colors, spacing, typography, borderRadius } from '../../theme';

type IncidentsStackParamList = {
  IncidentList: undefined;
  IncidentDetail: { incidentId: string };
  CreateIncident: undefined;
};

interface IncidentDetailScreenProps {
  route: RouteProp<IncidentsStackParamList, 'IncidentDetail'>;
  navigation: NativeStackNavigationProp<IncidentsStackParamList, 'IncidentDetail'>;
  incidentService: IncidentService;
  user: { id: string; role: string };
}

const CAN_RESOLVE_ROLES = ['ENCARGADO', 'JEFE_OBRA', 'ADMIN'];

export const IncidentDetailScreen: React.FC<IncidentDetailScreenProps> = ({
  route,
  navigation,
  incidentService,
  user,
}) => {
  const { incidentId } = route.params;

  const [incident, setIncident] = useState<AttendanceIncident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolveAction, setResolveAction] = useState<Resolution | null>(null);

  const loadIncident = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await incidentService.getIncident(incidentId);
      setIncident(data);
    } catch (err: any) {
      setError(err.message ?? 'Error al cargar la incidencia');
    } finally {
      setIsLoading(false);
    }
  }, [incidentService, incidentId]);

  useEffect(() => {
    loadIncident();
  }, [loadIncident]);

  const handleResolvePress = (action: Resolution) => {
    setResolveAction(action);
    setShowResolveForm(true);
  };

  const handleConfirmResolve = async () => {
    if (!resolveAction) return;

    setIsResolving(true);
    setError(null);
    try {
      await incidentService.resolveIncident(incidentId, {
        resolution: resolveAction,
        notes: resolutionNotes.trim() || undefined,
      });
      navigation.goBack();
    } catch (err: any) {
      setError(err.message ?? 'Error al resolver la incidencia');
    } finally {
      setIsResolving(false);
    }
  };

  const handleCancelResolve = () => {
    setShowResolveForm(false);
    setResolveAction(null);
  };

  if (isLoading) {
    return <LoadingState message="Cargando incidencia..." />;
  }

  if (error && !incident) {
    return <ErrorState message={error} onRetry={loadIncident} />;
  }

  if (!incident) {
    return <ErrorState message="Incidencia no encontrada" onRetry={loadIncident} />;
  }

  const canResolve =
    incident.status === 'PENDING' && CAN_RESOLVE_ROLES.includes(user.role);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header with status */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{incident.worker_name}</Text>
        <StatusBadge status={incident.status} />
      </View>

      {/* Incident info */}
      <View style={styles.section}>
        <DetailRow label="Tipo" value={getIncidentTypeLabel(incident.type)} />
        <DetailRow label="Fecha afectada" value={formatDate(incident.affected_date)} />
        <DetailRow label="Descripción" value={incident.description} />
        {incident.proposed_clock_in && (
          <DetailRow
            label="Entrada propuesta"
            value={formatDateTime(incident.proposed_clock_in)}
          />
        )}
        {incident.proposed_clock_out && (
          <DetailRow
            label="Salida propuesta"
            value={formatDateTime(incident.proposed_clock_out)}
          />
        )}
        <DetailRow label="Creada" value={formatDateTime(incident.created_at)} />
      </View>

      {/* Resolution info (when not PENDING) */}
      {incident.status !== 'PENDING' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resolución</Text>
          {incident.resolution_notes && (
            <DetailRow label="Notas" value={incident.resolution_notes} />
          )}
          {incident.resolved_at && (
            <DetailRow label="Fecha" value={formatDateTime(incident.resolved_at)} />
          )}
          {incident.resolved_by && (
            <DetailRow label="Resuelto por" value={incident.resolved_by} />
          )}
        </View>
      )}

      {/* Error banner */}
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      ) : null}

      {/* Resolve buttons */}
      {canResolve && !showResolveForm && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleResolvePress('APPROVE')}
            accessibilityRole="button"
            accessibilityLabel="Aprobar incidencia"
          >
            <Text style={styles.actionButtonText}>Aprobar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleResolvePress('REJECT')}
            accessibilityRole="button"
            accessibilityLabel="Rechazar incidencia"
          >
            <Text style={styles.actionButtonText}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Resolve form */}
      {showResolveForm && (
        <View style={styles.resolveForm}>
          <Text style={styles.resolveFormTitle}>
            {resolveAction === 'APPROVE' ? 'Aprobar incidencia' : 'Rechazar incidencia'}
          </Text>
          <Text style={styles.label}>Notas (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={resolutionNotes}
            onChangeText={setResolutionNotes}
            placeholder="Añade notas de resolución..."
            placeholderTextColor={colors.textDisabled}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            accessibilityLabel="Notas de resolución"
          />
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelResolve}
              disabled={isResolving}
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                resolveAction === 'APPROVE' ? styles.approveButton : styles.rejectButton,
                isResolving && styles.buttonDisabled,
              ]}
              onPress={handleConfirmResolve}
              disabled={isResolving}
              accessibilityRole="button"
              accessibilityLabel="Confirmar resolución"
            >
              {isResolving ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.actionButtonText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  detailRow: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  errorBanner: {
    backgroundColor: colors.statusBackground.rejected,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  errorBannerText: {
    ...typography.caption,
    color: colors.error,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.base,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  cancelButtonText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resolveForm: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.base,
    marginTop: spacing.base,
  },
  resolveFormTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
  },
});
