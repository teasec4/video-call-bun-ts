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
        'bg-primary-light': '#f5f5f5',
        'bg-primary-dark': '#1a1a1a',
        'bg-secondary-light': '#e8e8e8',
        'bg-secondary-dark': '#2d2d2d',
        'bg-tertiary-light': '#d9d9d9',
        'bg-tertiary-dark': '#3d3d3d',
        'bg-overlay-light': '#ffffff',
        'bg-overlay-dark': '#000000',
        // Text
        'txt-primary-light': '#1a1a1a',
        'txt-primary-dark': '#ffffff',
        'txt-secondary-light': '#404040',
        'txt-secondary-dark': '#e0e0e0',
        'txt-tertiary-light': '#606060',
        'txt-tertiary-dark': '#b0b0b0',
        'txt-muted': '#808080',
        'txt-disabled-light': '#a0a0a0',
        'txt-disabled-dark': '#606060',
        // Borders
        'bd-primary-light': '#d0d0d0',
        'bd-primary-dark': '#404040',
        'bd-secondary-light': '#e0e0e0',
        'bd-secondary-dark': '#2d2d2d',
        'bd-muted-light': '#f0f0f0',
        'bd-muted-dark': '#1a1a1a',
        // Status
        'st-success-light': '#6b9970',
        'st-success-dark': '#4a7c59',
        'st-error-light': '#a85555',
        'st-error-dark': '#8b4545',
        'st-warning-light': '#a89f5f',
        'st-warning-dark': '#8b7f47',
        'st-info-light': '#5a7f9f',
        'st-info-dark': '#4a5f7f',
        // Interactive
        'btn-primary-light': '#cccccc',
        'btn-primary-dark': '#333333',
        'btn-primary-hover-light': '#b3b3b3',
        'btn-primary-hover-dark': '#454545',
        'btn-secondary-light': '#b3b3b3',
        'btn-secondary-dark': '#4a4a4a',
        'btn-secondary-hover-light': '#999999',
        'btn-secondary-hover-dark': '#606060',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
} satisfies Config;
