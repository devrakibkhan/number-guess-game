import { createStitches } from '@stitches/react';

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      background: '#0a0a0a',
      backgroundSubtle: '#1a1a1a',
      foreground: '#ededed',
      primary: '#3b82f6', // blue
      primaryHover: '#2563eb',
      success: '#10b981', // green
      successHover: '#059669',
      error: '#ef4444', // red
      errorHover: '#dc2626',
      border: '#333',
    },
    space: {
      1: '4px',
      2: '8px',
      3: '16px',
      4: '24px',
      5: '32px',
      6: '64px',
    },
    fontSizes: {
      1: '12px',
      2: '14px',
      3: '16px',
      4: '20px',
      5: '24px',
      6: '32px',
      7: '48px',
    },
    fonts: {
      untitled: 'system-ui, -apple-system, sans-serif',
      mono: 'Söhne Mono, menlo, monospace',
    },
    radii: {
      1: '4px',
      2: '8px',
      3: '16px',
      round: '9999px',
    },
    shadows: {
      base: '0 4px 14px 0 rgba(0,0,0,0.3)',
      glow: '0 0 15px rgba(59, 130, 246, 0.5)',
    },
  },
  utils: {
    m: (value: string | number) => ({ margin: value }),
    mt: (value: string | number) => ({ marginTop: value }),
    mr: (value: string | number) => ({ marginRight: value }),
    mb: (value: string | number) => ({ marginBottom: value }),
    ml: (value: string | number) => ({ marginLeft: value }),
    mx: (value: string | number) => ({ marginLeft: value, marginRight: value }),
    my: (value: string | number) => ({ marginTop: value, marginBottom: value }),
    p: (value: string | number) => ({ padding: value }),
    pt: (value: string | number) => ({ paddingTop: value }),
    pr: (value: string | number) => ({ paddingRight: value }),
    pb: (value: string | number) => ({ paddingBottom: value }),
    pl: (value: string | number) => ({ paddingLeft: value }),
    px: (value: string | number) => ({ paddingLeft: value, paddingRight: value }),
    py: (value: string | number) => ({ paddingTop: value, paddingBottom: value }),
  },
});

export const globalStyles = globalCss({
  '*': { margin: 0, padding: 0, boxSizing: 'border-box' },
  'body': {
    fontFamily: '$untitled',
    backgroundColor: '$background',
    color: '$foreground',
    lineHeight: '1.5',
    WebkitFontSmoothing: 'antialiased',
  },
  'a': {
    color: 'inherit',
    textDecoration: 'none',
  },
  'button': {
    cursor: 'pointer',
    fontFamily: 'inherit',
    border: 'none',
  },
  'input': {
    fontFamily: 'inherit',
  }
});
