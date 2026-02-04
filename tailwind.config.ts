import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-primary': {
          light: '#f5f5f5',
          dark: '#1a1a1a',
        },
        'bg-secondary': {
          light: '#e8e8e8',
          dark: '#2d2d2d',
        },
        'bg-tertiary': {
          light: '#d9d9d9',
          dark: '#3d3d3d',
        },
        'bg-overlay': {
          light: '#ffffff',
          dark: '#000000',
        },
        // Text
        'text-primary': {
          light: '#1a1a1a',
          dark: '#ffffff',
        },
        'text-secondary': {
          light: '#404040',
          dark: '#e0e0e0',
        },
        'text-tertiary': {
          light: '#606060',
          dark: '#b0b0b0',
        },
        'text-muted': {
          light: '#808080',
          dark: '#808080',
        },
        'text-disabled': {
          light: '#a0a0a0',
          dark: '#606060',
        },
        // Borders
        'border-primary': {
          light: '#d0d0d0',
          dark: '#404040',
        },
        'border-secondary': {
          light: '#e0e0e0',
          dark: '#2d2d2d',
        },
        'border-muted': {
          light: '#f0f0f0',
          dark: '#1a1a1a',
        },
        // Status
        'status-success': {
          light: '#6b9970',
          dark: '#4a7c59',
        },
        'status-error': {
          light: '#a85555',
          dark: '#8b4545',
        },
        'status-warning': {
          light: '#a89f5f',
          dark: '#8b7f47',
        },
        'status-info': {
          light: '#5a7f9f',
          dark: '#4a5f7f',
        },
        // Interactive
        'interactive-primary': {
          light: '#cccccc',
          dark: '#333333',
        },
        'interactive-primary-hover': {
          light: '#b3b3b3',
          dark: '#454545',
        },
        'interactive-secondary': {
          light: '#b3b3b3',
          dark: '#4a4a4a',
        },
        'interactive-secondary-hover': {
          light: '#999999',
          dark: '#606060',
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
} satisfies Config;
