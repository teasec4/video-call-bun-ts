/**
 * Color system with literal Tailwind classes
 * Each property contains a complete set of Tailwind classes including dark: variants
 */

export const COLORS = {
  // Backgrounds
  bg: {
    primary: 'bg-bg-primary-light dark:bg-bg-primary-dark',
    primaryLight: 'bg-opacity-80 dark:bg-opacity-80',
    primaryLighter: 'bg-opacity-50 dark:bg-opacity-50',
    secondary: 'bg-bg-secondary-light dark:bg-bg-secondary-dark',
    secondaryLight: 'bg-bg-secondary-light/80 dark:bg-bg-secondary-dark/80',
    tertiary: 'bg-bg-tertiary-light dark:bg-bg-tertiary-dark',
    overlay: 'bg-bg-overlay-light dark:bg-bg-overlay-dark',
  },

  // Text
  text: {
    primary: 'text-txt-primary-light dark:text-txt-primary-dark',
    secondary: 'text-txt-secondary-light dark:text-txt-secondary-dark',
    tertiary: 'text-txt-tertiary-light dark:text-txt-tertiary-dark',
    muted: 'text-txt-muted',
    disabled: 'text-txt-disabled-light dark:text-txt-disabled-dark',
  },

  // Borders
  border: {
    primary: 'border-bd-primary-light dark:border-bd-primary-dark',
    secondary: 'border-bd-secondary-light dark:border-bd-secondary-dark',
    muted: 'border-bd-muted-light dark:border-bd-muted-dark',
  },

  // Status
  status: {
    success: 'bg-st-success-light dark:bg-st-success-dark',
    error: 'bg-st-error-light dark:bg-st-error-dark',
    warning: 'bg-st-warning-light dark:bg-st-warning-dark',
    info: 'bg-st-info-light dark:bg-st-info-dark',
    successText: 'text-st-success-light dark:text-st-success-dark',
    errorText: 'text-st-error-light dark:text-st-error-dark',
  },

  // Buttons
  button: {
    primary: 'bg-btn-primary-light dark:bg-btn-primary-dark text-txt-primary-light dark:text-txt-primary-dark hover:bg-btn-primary-hover-light dark:hover:bg-btn-primary-hover-dark transition',
    secondary: 'bg-btn-secondary-light dark:bg-btn-secondary-dark text-txt-secondary-light dark:text-txt-secondary-dark hover:bg-btn-secondary-hover-light dark:hover:bg-btn-secondary-hover-dark transition',
    primaryHover: 'hover:bg-btn-primary-hover-light dark:hover:bg-btn-primary-hover-dark',
    secondaryHover: 'hover:bg-btn-secondary-hover-light dark:hover:bg-btn-secondary-hover-dark',
  },
} as const;

// Semantic patterns
export const BUTTON_STYLES = {
  primary: `bg-btn-primary-light dark:bg-btn-primary-dark text-txt-primary-light dark:text-txt-primary-dark hover:bg-btn-primary-hover-light dark:hover:bg-btn-primary-hover-dark transition`,
  secondary: `bg-btn-secondary-light dark:bg-btn-secondary-dark text-txt-secondary-light dark:text-txt-secondary-dark hover:bg-btn-secondary-hover-light dark:hover:bg-btn-secondary-hover-dark transition`,
} as const;
