import { DiaryEntry } from '../types';

export type RootStackParamList = {
  Home: undefined;
  CardSelect: undefined;
  Result: { entry: DiaryEntry; fromHistory?: boolean };
  History: undefined;
};
