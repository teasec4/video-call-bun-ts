import React from 'react';

export const colorStyles = {
  bgPrimary: { backgroundColor: 'var(--bg-primary)' } as React.CSSProperties,
  bgSecondary: { backgroundColor: 'var(--bg-secondary)' } as React.CSSProperties,
  bgTertiary: { backgroundColor: 'var(--bg-tertiary)' } as React.CSSProperties,
  bgOverlay: { backgroundColor: 'var(--bg-overlay)' } as React.CSSProperties,
  
  textPrimary: { color: 'var(--txt-primary)' } as React.CSSProperties,
  textSecondary: { color: 'var(--txt-secondary)' } as React.CSSProperties,
  textMuted: { color: 'var(--txt-muted)' } as React.CSSProperties,
  textDisabled: { color: 'var(--txt-disabled)' } as React.CSSProperties,
  
  bdPrimary: { borderColor: 'var(--bd-primary)' } as React.CSSProperties,
  bdSecondary: { borderColor: 'var(--bd-secondary)' } as React.CSSProperties,
  bdMuted: { borderColor: 'var(--bd-muted)' } as React.CSSProperties,
  
  statusSuccess: { backgroundColor: 'var(--st-success)' } as React.CSSProperties,
  statusError: { backgroundColor: 'var(--st-error)' } as React.CSSProperties,
  
  buttonPrimary: {
    backgroundColor: 'var(--btn-primary)',
    color: 'var(--txt-primary)',
  } as React.CSSProperties,
  
  buttonSecondary: {
    backgroundColor: 'var(--btn-secondary)',
    color: 'var(--txt-secondary)',
  } as React.CSSProperties,
  
  input: {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--txt-primary)',
    borderColor: 'var(--bd-primary)',
  } as React.CSSProperties,
};

export const createButtonHoverHandler = (baseColor: string, hoverColor: string) => {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = hoverColor;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = baseColor;
    },
  };
};
