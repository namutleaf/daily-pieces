import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'daily_pieces_milestones_v1';

// Streak lengths (in days) that unlock a bonus sticker. Once unlocked, a
// milestone stays unlocked forever, even if the streak later breaks.
export const MILESTONES = [7, 30, 100];

export async function getUnlockedMilestones(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function checkAndUnlockMilestones(streak: number): Promise<number[]> {
  const unlocked = await getUnlockedMilestones();
  const newlyUnlocked = MILESTONES.filter((m) => streak >= m && !unlocked.includes(m));
  if (newlyUnlocked.length === 0) return [];
  await AsyncStorage.setItem(KEY, JSON.stringify([...unlocked, ...newlyUnlocked]));
  return newlyUnlocked;
}
