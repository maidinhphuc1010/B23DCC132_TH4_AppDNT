import { Platform } from 'react-native';
const colors = {
  primary: '#4338CA',
  primarySoft: '#EEF2FF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#CBD5E1',
  onPrimary: '#FFFFFF',
  success: '#166534',
  successSoft: '#DCFCE7',
  warning: '#92400E',
  warningSoft: '#FEF3C7',
  error: '#B91C1C',
  errorSoft: '#FEE2E2',
};
const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };
const fontFamily = Platform.select({ ios: 'System', android: 'sans-serif' });
const typography = {
  title: { fontFamily, fontSize: 28, lineHeight: 36, fontWeight: '700' },
  heading: { fontFamily, fontSize: 20, lineHeight: 28, fontWeight: '700' },
  body: { fontFamily, fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontFamily, fontSize: 12, lineHeight: 18, fontWeight: '400' },
};
export const theme = {
  colors,
  spacing,
  typography,
  radius: { sm: 8, md: 12, lg: 20, pill: 999 },
  layout: {
    screenPadding: spacing.lg,
    maxContentWidth: 600,
    minTouchTarget: 48,
  },
};
