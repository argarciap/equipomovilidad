import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const borderRadius = {
  small: 4,
  medium: 8,
  large: 16,
} as const;

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
} as const;

export type Theme = typeof theme;

export { colors, spacing, typography };
