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
      background: '#131313',
      surface: '#131313',
      surfaceContainerLowest: '#0e0e0e',
      surfaceContainerLow: '#1c1b1b',
      surfaceContainer: '#201f1f',
      surfaceContainerHigh: '#2a2a2a',
      surfaceContainerHighest: '#353534',
      onSurface: '#e5e2e1',
      onSurfaceVariant: '#b9cacb',
      primaryContainer: '#00f0ff',
      onPrimaryContainer: '#006970',
      primary: '#dbfcff',
      secondaryContainer: '#fe00fe',
      secondary: '#ffabf3',
      tertiaryContainer: '#00fa64',
      tertiary: '#dbffd7',
      error: '#ffb4ab',
      onError: '#690005',
      outline: '#849495',
      outlineVariant: '#3b494b',
    },
    space: {
      1: '4px',
      2: '8px',
      3: '16px',
      4: '20px',
      5: '24px',
      6: '40px',
      7: '48px',
      8: '64px',
    },
    fontSizes: {
      1: '12px',
      2: '14px',
      3: '16px',
      4: '18px',
      5: '24px',
      6: '32px',
      7: '48px',
      8: '56px',
      9: '64px',
    },
    fonts: {
      space: '"Space Grotesk", sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    radii: {
      1: '0.125rem', // 2px
      2: '0.25rem', // 4px
      3: '0.5rem',  // 8px
      4: '0.75rem', // 12px
      round: '9999px',
    },
    shadows: {
      base: '0 4px 14px 0 rgba(0,0,0,0.3)',
      glowCyan: '0 0 15px rgba(0, 240, 255, 0.6)',
      glowCyanStrong: '0 0 20px rgba(0, 240, 255, 0.8)',
      glowCyanInset: 'inset 0 0 10px rgba(0, 240, 255, 0.1)',
      glowMagenta: '0 0 8px rgba(254, 0, 254, 0.8)',
      glowGreen: '0 0 12px rgba(0, 250, 100, 0.6)',
      glass: '0 4px 30px rgba(0, 240, 255, 0.1)',
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
  '@import': [
    "url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap')",
    "url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block')",
    "url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap')"
  ],
  '*': { margin: 0, padding: 0, boxSizing: 'border-box' },
  'body': {
    fontFamily: '$space',
    backgroundColor: '$background',
    color: '$onSurface',
    lineHeight: '1.5',
    WebkitFontSmoothing: 'antialiased',
    overflowX: 'hidden',
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
  },
  '.material-symbols-outlined': {
    fontFamily: '"Material Symbols Outlined"',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontSize: '24px',
    lineHeight: 1,
    letterSpacing: 'normal',
    textTransform: 'none',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
    direction: 'ltr',
    WebkitFontFeatureSettings: '"liga"',
    WebkitFontSmoothing: 'antialiased',
  }
});
