import React, { useState } from 'react';
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
import { IncidentType } from '../../types/incidents';
import { IncidentService } from '../../services/IncidentService';
import { getIncidentTypeLabel } from '../../utils/formatters';
import { colors, spacing, typography, borderRadius } from '../../theme';

type IncidentsStackParamList = {
  IncidentList: undefined;
  IncidentDetail: { incidentId: string };
  CreateIncident: undefined;
};

interface CreateIncidentScreenProps {
  navigation: NativeStackNavigationProp<IncidentsStackParamList, 'CreateIncident'>;
  incidentService: IncidentService;
  userId: string;
}

const INCIDENT_TYPES: IncidentType[] = [
  'OLVIDO_ENTRADA',
  'OLVIDO_SALIDA',
  'CORRECCION_HORA',
  'FICHAJE_DUPLICADO',
  'OTRO',
];

export const CreateIncidentScreen: React.FC<CreateIncidentScreenProps> = ({
  navigation,
  incidentService,
  userId,
}) => {
  const [type, setType] = useState<IncidentType | null>(null);
  const [affected_date, setAffectedDate] = useState('');
  const [description, setDescription] = useState('');
  const [proposed_clock_in, setProposedClockIn] = useState('');
  const [proposed_clock_out, setProposedClockOut] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!type) {
      errors.type = 'Selecciona un tipo de incidencia';
    }
    if (!affected_date.trim()) {
      errors.affected_date = 'La fecha afectada es obligatoria';
    }
    if (!description.trim()) {
      errors.description = 'La descripción es obligatoria';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await incidentService.createIncident({
        worker_id: userId,
        type: type!,
        description: description.trim(),
        affected_date: affected_date.trim(),
        proposed_clock_in: type === 'CORRECCION_HORA' && proposed_clock_in.trim()
          ? proposed_clock_in.trim()
          : undefined,
        proposed_clock_out: type === 'CORRECCION_HORA' && proposed_clock_out.trim()
          ? proposed_clock_out.trim()
          : undefined,
      });
      navigation.goBack();
    } catch (err: any) {
      setError(err.message ?? 'Error al crear la incidencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Type selector */}
      <Text style={styles.label}>Tipo de incidencia *</Text>
      <View style={styles.typeRow}>
        {INCIDENT_TYPES.map((t) => {
          const isSelected = type === t;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, isSelected && styles.typeChipSelected]}
              onPress={() => setType(t)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={getIncidentTypeLabel(t)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  isSelected && styles.typeChipTextSelected,
                ]}
              >
                {getIncidentTypeLabel(t)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {validationErrors.type ? (
        <Text style={styles.errorText}>{validationErrors.type}</Text>
      ) : null}

      {/* Affected date */}
      <Text style={styles.label}>Fecha afectada (YYYY-MM-DD) *</Text>
      <TextInput
        style={styles.input}
        value={affected_date}
        onChangeText={setAffectedDate}
        placeholder="2025-01-15"
        placeholderTextColor={colors.textDisabled}
        accessibilityLabel="Fecha afectada"
      />
      {validationErrors.affected_date ? (
        <Text style={styles.errorText}>{validationErrors.affected_date}</Text>
      ) : null}

      {/* Description */}
      <Text style={styles.label}>Descripción *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe la incidencia..."
        placeholderTextColor={colors.textDisabled}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        accessibilityLabel="Descripción"
      />
      {validationErrors.description ? (
        <Text style={styles.errorText}>{validationErrors.description}</Text>
      ) : null}

      {/* Conditional fields for CORRECCION_HORA */}
      {type === 'CORRECCION_HORA' && (
        <>
          <Text style={styles.label}>Hora de entrada propuesta (ISO 8601)</Text>
          <TextInput
            style={styles.input}
            value={proposed_clock_in}
            onChangeText={setProposedClockIn}
            placeholder="2025-01-15T07:00:00Z"
            placeholderTextColor={colors.textDisabled}
            accessibilityLabel="Hora de entrada propuesta"
          />

          <Text style={styles.label}>Hora de salida propuesta (ISO 8601)</Text>
          <TextInput
            style={styles.input}
            value={proposed_clock_out}
            onChangeText={setProposedClockOut}
            placeholder="2025-01-15T15:00:00Z"
            placeholderTextColor={colors.textDisabled}
            accessibilityLabel="Hora de salida propuesta"
          />
        </>
      )}

      {/* Error message */}
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      ) : null}

      {/* Submit button */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="Enviar incidencia"
        accessibilityState={{ disabled: isSubmitting }}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Text style={styles.submitButtonText}>Crear incidencia</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.base,
  },
  label: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.base,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  typeChipTextSelected: {
    color: colors.white,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.xs,
  },
  errorBanner: {
    backgroundColor: colors.statusBackground.rejected,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginTop: spacing.base,
  },
  errorBannerText: {
    ...typography.caption,
    color: colors.error,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.bodyBold,
    color: colors.white,
  },
});
