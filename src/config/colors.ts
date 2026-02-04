/**
 * Tailwind color class patterns
 * Semantic color combinations for common UI patterns
 */

export const COLORS = {
  // Backgrounds
  bg: {
    primary: 'bg-bg-primary',
    secondary: 'bg-bg-secondary',
    tertiary: 'bg-bg-tertiary',
    overlay: 'bg-bg-overlay',
  },

  // Text
  text: {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    tertiary: 'text-text-tertiary',
    muted: 'text-text-muted',
    disabled: 'text-text-disabled',
  },

  // Borders
  border: {
    primary: 'border-border-primary',
    secondary: 'border-border-secondary',
    muted: 'border-border-muted',
  },

  // Status
  status: {
    success: 'text-status-success',
    error: 'text-status-error',
    warning: 'text-status-warning',
    info: 'text-status-info',
  },

  // Interactive elements
  button: {
    primary: 'bg-interactive-primary hover:bg-interactive-primary-hover',
    secondary: 'bg-interactive-secondary hover:bg-interactive-secondary-hover',
  },
} as const;

// Semantic color combinations for common patterns
export const COLOR_PATTERNS = {
  // Card/Panel backgrounds
  card: `${COLORS.bg.secondary} border-border-primary border`,

  // Primary button
  btnPrimary: `${COLORS.button.primary} ${COLORS.text.primary}`,

  // Secondary button
  btnSecondary: `${COLORS.button.secondary} ${COLORS.text.primary}`,

  // Input field
  input: `${COLORS.bg.tertiary} border-border-primary border ${COLORS.text.primary} placeholder-text-muted`,

  // Chat message - user
  chatOwn: `${COLORS.bg.secondary} ${COLORS.text.primary}`,

  // Chat message - other
  chatOther: `${COLORS.bg.tertiary} ${COLORS.text.secondary}`,
} as const;
