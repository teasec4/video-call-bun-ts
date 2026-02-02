/**
 * Color Theme Configuration
 * 
 * Classic black & white vintage palette with shades of gray
 * Supports light/dark mode switching
 */

export type ThemeMode = 'dark' | 'light';

// Vintage grayscale palette
const COLORS_DARK = {
  // Backgrounds
  bg: {
    primary: '#1a1a1a',      // Deep black
    secondary: '#2d2d2d',    // Dark gray
    tertiary: '#3d3d3d',     // Medium-dark gray
    overlay: '#000000',      // Pure black for overlays
  },
  
  // Text
  text: {
    primary: '#ffffff',      // Pure white
    secondary: '#e0e0e0',    // Light gray
    tertiary: '#b0b0b0',     // Medium gray
    muted: '#808080',        // Muted gray
    disabled: '#606060',     // Disabled gray
  },
  
  // Borders & Accents
  border: {
    primary: '#404040',      // Medium gray border
    secondary: '#2d2d2d',    // Dark border
    muted: '#1a1a1a',        // Very dark border
  },
  
  // Status colors (keeping subtle for vintage feel)
  status: {
    success: '#4a7c59',      // Muted green
    error: '#8b4545',        // Muted red
    warning: '#8b7f47',      // Muted yellow/gold
    info: '#4a5f7f',         // Muted blue
  },
  
  // Interactive
  interactive: {
    primary: '#333333',      // Primary button - dark gray
    primaryHover: '#454545', // Primary hover
    secondary: '#4a4a4a',    // Secondary button - lighter gray
    secondaryHover: '#606060',
  },
};

const COLORS_LIGHT = {
  // Backgrounds
  bg: {
    primary: '#f5f5f5',      // Very light gray
    secondary: '#e8e8e8',    // Light gray
    tertiary: '#d9d9d9',     // Medium gray
    overlay: '#ffffff',      // White for overlays
  },
  
  // Text
  text: {
    primary: '#1a1a1a',      // Deep black
    secondary: '#404040',    // Dark gray
    tertiary: '#606060',     // Medium gray
    muted: '#808080',        // Muted gray
    disabled: '#a0a0a0',     // Disabled gray
  },
  
  // Borders
  border: {
    primary: '#d0d0d0',      // Medium gray
    secondary: '#e0e0e0',    // Light gray
    muted: '#f0f0f0',        // Very light gray
  },
  
  // Status colors
  status: {
    success: '#6b9970',      // Muted green
    error: '#a85555',        // Muted red
    warning: '#a89f5f',      // Muted yellow
    info: '#5a7f9f',         // Muted blue
  },
  
  // Interactive
  interactive: {
    primary: '#cccccc',      // Light gray button
    primaryHover: '#b3b3b3', // Hover
    secondary: '#b3b3b3',    // Secondary button
    secondaryHover: '#999999',
  },
};

export const THEMES = {
  dark: COLORS_DARK,
  light: COLORS_LIGHT,
} as const;

export const DEFAULT_THEME: ThemeMode = 'dark';

/**
 * Get theme colors for current mode
 */
export function getThemeColors(mode: ThemeMode = DEFAULT_THEME) {
  return THEMES[mode];
}

/**
 * CSS variable names for Tailwind integration
 */
export const CSS_VARS = {
  bg: {
    primary: '--color-bg-primary',
    secondary: '--color-bg-secondary',
    tertiary: '--color-bg-tertiary',
    overlay: '--color-bg-overlay',
  },
  text: {
    primary: '--color-text-primary',
    secondary: '--color-text-secondary',
    tertiary: '--color-text-tertiary',
    muted: '--color-text-muted',
    disabled: '--color-text-disabled',
  },
  border: {
    primary: '--color-border-primary',
    secondary: '--color-border-secondary',
    muted: '--color-border-muted',
  },
  status: {
    success: '--color-status-success',
    error: '--color-status-error',
    warning: '--color-status-warning',
    info: '--color-status-info',
  },
  interactive: {
    primary: '--color-interactive-primary',
    primaryHover: '--color-interactive-primary-hover',
    secondary: '--color-interactive-secondary',
    secondaryHover: '--color-interactive-secondary-hover',
  },
} as const;

/**
 * Converts theme colors to CSS variable string
 */
export function generateCssVariables(colors: typeof COLORS_DARK): string {
  const vars: string[] = [];
  
  Object.entries(colors).forEach(([category, values]) => {
    Object.entries(values).forEach(([name, color]) => {
      const cssVarName = CSS_VARS[category as keyof typeof CSS_VARS][name as any];
      vars.push(`${cssVarName}: ${color};`);
    });
  });
  
  return vars.join('\n');
}
