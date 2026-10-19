import { PaletteKey } from './types';

export const theme = {
  bg: '#F6F8FC',
  surface: '#FFFFFF',
  ink: '#152342',
  inkSoft: '#5C6B85',
  accent: '#2F5FE0',
  accentSoft: '#DEE8FF',
  sage: '#5B8DEF',
  border: '#E2E8F5',
  cardBg: '#EAF1FE',
  cardBorder: '#C9DBFA',
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
  // The mood category's second card set (src/data/words.ts m9-m16) added
  // these 8 words without a matching palette, so they were silently
  // falling back to DEFAULT_PALETTE ('평온') everywhere — card background,
  // stats swatches, and the mood message below all mismatched the mood
  // actually picked.
  홀가분함: { colors: ['#D9F5E6', '#A8DCC4'], text: '#123B2A', subtext: '#2C5A45' },
  답답함: { colors: ['#E2D9D2', '#B7A493'], text: '#3A2A1C', subtext: '#5A4534' },
  감사함: { colors: ['#FDE7CE', '#F4C48E'], text: '#4A2E0E', subtext: '#6B4A22' },
  심심함: { colors: ['#E6E8EE', '#BCC4D2'], text: '#2A303C', subtext: '#454C5C' },
  짜릿함: { colors: ['#E4FAC7', '#AEE07E'], text: '#1F3B0A', subtext: '#375A1C' },
  몽글몽글함: { colors: ['#FBE3F3', '#E4BFEE'], text: '#442048', subtext: '#603A66' },
  허전함: { colors: ['#DEE4EC', '#AFBBCB'], text: '#242E3D', subtext: '#3C4A5C' },
  벅참: { colors: ['#FFDAD3', '#F3A79A'], text: '#4A180F', subtext: '#6B2E20' },
};

export const DEFAULT_PALETTE: MoodPalette = MOOD_PALETTES['평온'];

export const PALETTE_KEYS = Object.keys(MOOD_PALETTES) as PaletteKey[];
