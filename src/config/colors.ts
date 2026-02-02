/**
 * Tailwind color aliases using CSS variables
 * Use these in your components instead of hardcoded Tailwind classes
 */

export const COLORS = {
  // Backgrounds
  bg: {
    primary: 'bg-[var(--color-bg-primary)]',
    secondary: 'bg-[var(--color-bg-secondary)]',
    tertiary: 'bg-[var(--color-bg-tertiary)]',
    overlay: 'bg-[var(--color-bg-overlay)]',
  },
  
  // Text
  text: {
    primary: 'text-[var(--color-text-primary)]',
    secondary: 'text-[var(--color-text-secondary)]',
    tertiary: 'text-[var(--color-text-tertiary)]',
    muted: 'text-[var(--color-text-muted)]',
    disabled: 'text-[var(--color-text-disabled)]',
  },
  
  // Borders
  border: {
    primary: 'border-[var(--color-border-primary)]',
    secondary: 'border-[var(--color-border-secondary)]',
    muted: 'border-[var(--color-border-muted)]',
  },
  
  // Status
  status: {
    success: 'bg-[var(--color-status-success)]',
    error: 'bg-[var(--color-status-error)]',
    warning: 'bg-[var(--color-status-warning)]',
    info: 'bg-[var(--color-status-info)]',
  },
  
  // Interactive elements
  button: {
    primary: 'bg-[var(--color-interactive-primary)]',
    primaryHover: 'hover:bg-[var(--color-interactive-primary-hover)]',
    secondary: 'bg-[var(--color-interactive-secondary)]',
    secondaryHover: 'hover:bg-[var(--color-interactive-secondary-hover)]',
  },
} as const;

// Semantic color combinations for common patterns
export const COLOR_PATTERNS = {
  // Card/Panel backgrounds
  card: `${COLORS.bg.secondary} ${COLORS.border.primary} border`,
  
  // Primary button
  btnPrimary: `${COLORS.button.primary} ${COLORS.button.primaryHover} ${COLORS.text.primary}`,
  
  // Secondary button
  btnSecondary: `${COLORS.button.secondary} ${COLORS.button.secondaryHover} ${COLORS.text.primary}`,
  
  // Input field
  input: `${COLORS.bg.tertiary} ${COLORS.border.primary} border ${COLORS.text.primary} placeholder-[var(--color-text-muted)]`,
  
  // Chat message - user
  chatOwn: `${COLORS.bg.secondary} ${COLORS.text.primary}`,
  
  // Chat message - other
  chatOther: `${COLORS.bg.tertiary} ${COLORS.text.secondary}`,
} as const;
