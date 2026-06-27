import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const brand = {
  navy: '#07111f',
  navySoft: '#10243c',
  blue: '#1f8cff',
  green: '#45d483',
  warning: '#f6c35b',
  textMuted: '#718198'
};

export const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.blue,
    secondary: brand.green,
    background: '#f6f8fb',
    surface: '#ffffff',
    surfaceVariant: '#eef3f9',
    onSurfaceVariant: '#405065'
  }
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#68aaff',
    secondary: brand.green,
    background: brand.navy,
    surface: brand.navySoft,
    surfaceVariant: '#162f4d',
    onSurfaceVariant: '#c6d2e2'
  }
};
