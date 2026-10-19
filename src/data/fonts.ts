import { Gaegu_400Regular, Gaegu_700Bold } from '@expo-google-fonts/gaegu';
import { GowunBatang_400Regular, GowunBatang_700Bold } from '@expo-google-fonts/gowun-batang';
import { HiMelody_400Regular } from '@expo-google-fonts/hi-melody';

export const FONT_ASSETS = {
  Gaegu_400Regular,
  Gaegu_700Bold,
  GowunBatang_400Regular,
  GowunBatang_700Bold,
  HiMelody_400Regular,
};

export type FontKey = 'system' | 'gaegu' | 'gowunBatang' | 'hiMelody';

export type FontOption = {
  key: FontKey;
  label: string;
  sample: string;
  fontFamily?: string;
};

export const FONT_OPTIONS: FontOption[] = [
  { key: 'system', label: '기본체', sample: '오늘 하루도 수고했어요' },
  { key: 'gaegu', label: '다정한 손글씨체', sample: '오늘 하루도 수고했어요', fontFamily: 'Gaegu_400Regular' },
  {
    key: 'gowunBatang',
    label: '감성 세리프체',
    sample: '오늘 하루도 수고했어요',
    fontFamily: 'GowunBatang_400Regular',
  },
  { key: 'hiMelody', label: '발랄한 손글씨체', sample: '오늘 하루도 수고했어요', fontFamily: 'HiMelody_400Regular' },
];

export function getFontOption(key: FontKey): FontOption {
  return FONT_OPTIONS.find((f) => f.key === key) ?? FONT_OPTIONS[0];
}
