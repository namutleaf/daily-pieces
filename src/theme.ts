import { PaletteKey } from './types';

export const theme = {
  bg: '#FAF6ED',
  surface: '#FFFFFF',
  ink: '#2E2A26',
  inkSoft: '#7A7469',
  accent: '#D97757',
  accentSoft: '#F3D9C6',
  sage: '#7C9885',
  border: '#EAE2D3',
};

export type MoodPalette = {
  colors: [string, string];
  text: string;
  subtext: string;
};

export const MOOD_PALETTES: Record<PaletteKey, MoodPalette> = {
  설렘: { colors: ['#FFD6E8', '#C9A6F5'], text: '#3B1E4A', subtext: '#5A3A6B' },
  평온: { colors: ['#CDEAE6', '#9BC7D6'], text: '#173B3F', subtext: '#2E5A5E' },
  뿌듯: { colors: ['#FFE7A0', '#FFB88C'], text: '#4A2E10', subtext: '#6B4423' },
  피곤: { colors: ['#D7DCE5', '#9FAEC2'], text: '#242C3A', subtext: '#3E4A5C' },
  그리움: { colors: ['#C9CBF5', '#8E97D9'], text: '#20214A', subtext: '#3A3C6B' },
  행복: { colors: ['#FFF0A8', '#FFC98B'], text: '#4A3A0A', subtext: '#6B5420' },
  '살짝 우울': { colors: ['#C6D4E5', '#8FA3C2'], text: '#1E2A3A', subtext: '#3A4C63' },
  두근두근: { colors: ['#FFC2C2', '#FF8FA3'], text: '#4A1620', subtext: '#6B2233' },
};

export const DEFAULT_PALETTE: MoodPalette = MOOD_PALETTES['평온'];

export const PALETTE_KEYS = Object.keys(MOOD_PALETTES) as PaletteKey[];
