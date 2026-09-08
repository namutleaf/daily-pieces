import { DiaryEntry, ToneKey } from '../types';

export type RootStackParamList = {
  Home: undefined;
  ToneSelect: undefined;
  CardSelect: { tone: ToneKey };
  Result: { entry: DiaryEntry; fromHistory?: boolean };
  History: undefined;
  FontSettings: undefined;
};
