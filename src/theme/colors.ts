export const colors = {
  primary: '#E30613',
  primaryLight: '#FF4D4D',
  primaryDark: '#B00510',

  // Neutrals
  background: '#F5F5F5',
  surface: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textDisabled: '#999999',
  border: '#E0E0E0',
  divider: '#EEEEEE',

  // Status colors
  status: {
    pending: '#F59E0B',
    resolved: '#10B981',
    rejected: '#EF4444',
    open: '#3B82F6',
  },

  // Status background (lighter variants for badges)
  statusBackground: {
    pending: '#FEF3C7',
    resolved: '#D1FAE5',
    rejected: '#FEE2E2',
    open: '#DBEAFE',
  },

  white: '#FFFFFF',
  black: '#000000',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
} as const;
