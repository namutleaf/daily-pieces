import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../navigation/types';
import { theme, MOOD_PALETTES, PALETTE_KEYS } from '../theme';
import DiaryCard from '../components/DiaryCard';
import IllustrationBackground from '../components/IllustrationBackground';
import { CategoryKey, DiaryEntry, LineKey, PaletteKey, PlacedSticker } from '../types';
import { getFontOption } from '../data/fonts';
import { ILLUSTRATION_OPTIONS } from '../data/illustrations';
import { MAX_STICKERS_PER_ENTRY, STICKER_PACKS, StickerItem, StickerPack, isStickerUnlocked } from '../data/stickers';
import {
  applyTone,
  CLOSER_OPTIONS,
  defaultBaseFragment,
  effectiveHashtags,
  lineFinalText,
} from '../utils/generateDiary';
import { getUnlockedMilestones } from '../utils/milestones';
import { checkLockSupport, authenticate } from '../utils/lock';
import {
  getFontPreference,
  removeEntry,
  updateBackgroundImage,
  updateLineOverrides,
  updatePaletteOverride,
  updateStickers,
  updateEntryLock,
  updateTextAlign,
  updateTextSize,
  updateIllustration,
  updateHashtagOverrides,
} from '../utils/storage';

const ALIGN_OPTIONS: {
  value: NonNullable<DiaryEntry['textAlign']>;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { value: 'left', icon: 'format-align-left' },
  { value: 'center', icon: 'format-align-center' },
  { value: 'right', icon: 'format-align-right' },
];

const TEXT_SIZES: NonNullable<DiaryEntry['textSize']>[] = ['small', 'medium', 'large'];

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;
type Option = { label: string; fragment: string };

const ALL_LINE_KEYS: LineKey[] = ['weather', 'mood', 'person', 'place', 'activity', 'moment', 'closer'];

// Where a newly added sticker first appears, before the user drags it
// wherever they actually want it.
const DEFAULT_STICKER_SPOTS = [
  { x: 0.78, y: 0.16 },
  { x: 0.58, y: 0.28 },
  { x: 0.74, y: 0.4 },
  { x: 0.5, y: 0.14 },
];

export default function ResultScreen({ route, navigation }: Props) {
  const { fromHistory } = route.params;
  const [entry, setEntry] = useState(route.params.entry);
  const [editing, setEditing] = useState(false);
  const [draftLines, setDraftLines] = useState<Partial<Record<LineKey, string>>>({});
  const cardRef = useRef<View>(null);
  const [working, setWorking] = useState(false);
  const [pickerKey, setPickerKey] = useState<LineKey | null>(null);
  const [pendingSwap, setPendingSwap] = useState<{ key: LineKey; option: Option } | null>(null);
  const [hashtagKey, setHashtagKey] = useState<CategoryKey | null>(null);
  const [hashtagDraft, setHashtagDraft] = useState('');
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const [stickerSheetOpen, setStickerSheetOpen] = useState(false);
  const [fontFamily, setFontFamily] = useState<string | undefined>(undefined);
  // A single generic "undo" toast reused for sticker deletion, sentence
  // swaps, and hashtag edits — whichever fired last wins the slot, same as
  // any one-at-a-time undo affordance (Gmail, Photos, etc.). Storing what to
  // revert (not a captured closure) means undo always acts on the entry's
  // current state, even if something else changed while the toast was up.
  type UndoAction =
    | { type: 'sticker'; sticker: PlacedSticker }
    | { type: 'line'; key: LineKey; previousText: string }
    | { type: 'hashtag'; key: CategoryKey; previousTag: string };
  const [undoAction, setUndoAction] = useState<{ message: string; action: UndoAction } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [unlockedMilestones, setUnlockedMilestones] = useState<number[]>([]);

  useEffect(() => {
    getFontPreference().then((key) => setFontFamily(getFontOption(key).fontFamily));
    getUnlockedMilestones().then(setUnlockedMilestones);
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const handlePickPalette = async (key: PaletteKey | undefined) => {
    setBgPickerOpen(false);
    const updated = await updatePaletteOverride(entry.id, key);
    if (!updated) return;
    // A photo or illustration takes visual priority over the mood color, so
    // clear those when the user explicitly picks a color instead.
    let cleared: DiaryEntry | null = updated;
    if (cleared.backgroundImageUri) cleared = await updateBackgroundImage(entry.id, undefined);
    if (cleared?.illustration) cleared = await updateIllustration(entry.id, undefined);
    setEntry(cleared ?? updated);
  };

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한이 필요해요', '사진 보관함 접근을 허용해주세요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 5],
    });
    if (result.canceled || !result.assets?.[0]) return;
    setBgPickerOpen(false);
    const updated = await updateBackgroundImage(entry.id, result.assets[0].uri);
    if (!updated) return;
    const cleared = updated.illustration ? await updateIllustration(entry.id, undefined) : updated;
    setEntry(cleared ?? updated);
  };

  const handlePickIllustration = async (key: DiaryEntry['illustration']) => {
    setBgPickerOpen(false);
    const updated = await updateIllustration(entry.id, key);
    if (!updated) return;
    let cleared: DiaryEntry | null = updated;
    if (cleared.backgroundImageUri) cleared = await updateBackgroundImage(entry.id, undefined);
    setEntry(cleared ?? updated);
  };

  const handleSetTextSize = async (direction: 1 | -1) => {
    const current = entry.textSize ?? 'medium';
    const nextIndex = TEXT_SIZES.indexOf(current) + direction;
    const clamped = TEXT_SIZES[Math.min(TEXT_SIZES.length - 1, Math.max(0, nextIndex))];
    if (clamped === current) return;
    const updated = await updateTextSize(entry.id, clamped);
    if (updated) setEntry(updated);
  };

  const handleToggleSticker = async (sticker: StickerItem, pack: StickerPack) => {
    const stickerId = sticker.id;
    if (!isStickerUnlocked(pack, sticker, unlockedMilestones)) {
      if (!pack.free) {
        Alert.alert('조금만 기다려주세요', '곧 새로운 스티커로 만나요 💌');
      } else {
        Alert.alert('아직 잠겨있어요', `${sticker.unlockAt}일 연속 기록을 달성하면 열려요!`);
      }
      return;
    }
    const current = entry.stickers ?? [];
    const existing = current.find((s) => s.stickerId === stickerId);
    let next: PlacedSticker[];
    if (existing) {
      next = current.filter((s) => s.instanceId !== existing.instanceId);
    } else if (current.length >= MAX_STICKERS_PER_ENTRY) {
      Alert.alert('스티커는 최대 4개까지', '카드 하나에 최대 4개까지 붙일 수 있어요.');
      return;
    } else {
      const spot = DEFAULT_STICKER_SPOTS[current.length % DEFAULT_STICKER_SPOTS.length];
      next = [
        ...current,
        { instanceId: `${stickerId}-${Date.now()}`, stickerId, x: spot.x, y: spot.y, scale: 1, rotation: 0 },
      ];
    }
    const updated = await updateStickers(entry.id, next);
    if (updated) setEntry(updated);
  };

  const handleStickerChange = async (
    instanceId: string,
    patch: Pick<PlacedSticker, 'x' | 'y' | 'scale' | 'rotation'>
  ) => {
    const current = entry.stickers ?? [];
    const next = current.map((s) => (s.instanceId === instanceId ? { ...s, ...patch } : s));
    const updated = await updateStickers(entry.id, next);
    if (updated) setEntry(updated);
  };

  const showUndo = (message: string, action: UndoAction) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoAction({ message, action });
    undoTimerRef.current = setTimeout(() => setUndoAction(null), 3000);
  };

  const handleUndo = async () => {
    if (!undoAction) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const { action } = undoAction;
    setUndoAction(null);
    if (action.type === 'sticker') {
      const current = entry.stickers ?? [];
      const updated = await updateStickers(entry.id, [...current, action.sticker]);
      if (updated) setEntry(updated);
    } else if (action.type === 'line') {
      const updated = await updateLineOverrides(entry.id, { [action.key]: action.previousText });
      if (updated) setEntry(updated);
    } else {
      const updated = await updateHashtagOverrides(entry.id, { [action.key]: action.previousTag });
      if (updated) setEntry(updated);
    }
  };

  const handleDeleteSticker = async (instanceId: string) => {
    const current = entry.stickers ?? [];
    const removed = current.find((s) => s.instanceId === instanceId);
    if (!removed) return;
    const next = current.filter((s) => s.instanceId !== instanceId);
    const updated = await updateStickers(entry.id, next);
    if (updated) setEntry(updated);

    showUndo('스티커를 삭제했어요', { type: 'sticker', sticker: removed });
  };

  const handleToggleEntryLock = async () => {
    const nextLocked = !entry.locked;
    if (nextLocked) {
      const support = await checkLockSupport();
      if (!support.supported) {
        Alert.alert(
          '잠금을 사용할 수 없어요',
          support.reason === 'web-unsupported'
            ? '웹 미리보기에서는 일기 잠금을 설정할 수 없어요. 실제 기기에서 확인해주세요.'
            : support.reason === 'no-hardware'
              ? '이 기기에는 지문/얼굴 인식 기능이 없어요.'
              : '기기 설정에서 지문 또는 얼굴 인식을 먼저 등록해주세요.'
        );
        return;
      }
      const success = await authenticate('이 일기 잠그기');
      if (!success) return;
    }
    const updated = await updateEntryLock(entry.id, nextLocked);
    if (updated) setEntry(updated);
  };

  const handleSetAlign = async (align: DiaryEntry['textAlign']) => {
    const updated = await updateTextAlign(entry.id, align);
    if (updated) setEntry(updated);
  };

  const getCurrentFinalText = (key: LineKey) =>
    lineFinalText(entry.selections, key, entry.lineOverrides, entry.closerFragment, entry.tone, entry.personName);

  const handleOpenEdit = () => {
    setDraftLines({});
    setEditing(true);
  };

  const handleCancelEdit = () => setEditing(false);

  const handleSaveEdit = async () => {
    const patch: Partial<Record<LineKey, string>> = {};
    const keysToCheck: LineKey[] =
      entry.lineOverrides.custom !== undefined ? [...ALL_LINE_KEYS, 'custom'] : ALL_LINE_KEYS;
    keysToCheck.forEach((key) => {
      const draft = draftLines[key];
      if (draft === undefined) return;
      const trimmed = draft.trim();
      if (trimmed === getCurrentFinalText(key)) return;
      // Clearing the custom line's text should remove the line entirely
      // (and the spacer above it) — an empty-string override would instead
      // leave `hasCustomLine` true forever, showing a blank gap on the card.
      patch[key] = key === 'custom' && !trimmed ? undefined : trimmed;
    });
    if (Object.keys(patch).length > 0) {
      const updated = await updateLineOverrides(entry.id, patch);
      if (updated) setEntry(updated);
    }
    setEditing(false);
  };

  const getOptions = (key: LineKey): Option[] => {
    if (key === 'closer') return CLOSER_OPTIONS;
    if (key === 'custom') return [];
    const word = entry.selections[key];
    const defaultFragment = defaultBaseFragment(entry.selections, key, entry.personName);
    return [{ label: word.label, fragment: defaultFragment }, ...(word.variants ?? [])];
  };

  const handlePickOption = (key: LineKey, option: Option) => {
    setPickerKey(null);
    const toned = applyTone(option.fragment, entry.tone);
    if (toned === getCurrentFinalText(key)) return;
    setPendingSwap({ key, option });
  };

  const handleConfirmSwap = async () => {
    if (!pendingSwap) return;
    const { key, option } = pendingSwap;
    const previousText = getCurrentFinalText(key);
    setPendingSwap(null);
    const toned = applyTone(option.fragment, entry.tone);
    const updated = await updateLineOverrides(entry.id, { [key]: toned });
    if (updated) {
      setEntry(updated);
      showUndo('문장을 바꿨어요', { type: 'line', key, previousText });
    }
  };

  const normalizeHashtag = (raw: string): string => {
    const trimmed = raw.trim().replace(/\s+/g, '');
    if (!trimmed) return '';
    return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  };

  const handleOpenHashtagEditor = (key: CategoryKey, currentTag: string) => {
    setHashtagKey(key);
    setHashtagDraft(currentTag);
  };

  const handlePickHashtagOption = (label: string) => {
    setHashtagDraft(normalizeHashtag(label));
  };

  const handleSaveHashtag = async () => {
    if (!hashtagKey) return;
    const key = hashtagKey;
    const normalized = normalizeHashtag(hashtagDraft);
    if (!normalized) {
      setHashtagKey(null);
      return;
    }
    const currentTags = effectiveHashtags(entry);
    const isDuplicate = currentTags.some((t) => t.key !== key && t.tag === normalized);
    if (isDuplicate) {
      Alert.alert('이미 쓰고 있는 태그예요', '다른 항목에서 같은 해시태그를 쓰고 있어요. 다른 표현으로 바꿔보세요.');
      return;
    }
    const previousTag = currentTags.find((t) => t.key === key)?.tag;
    setHashtagKey(null);
    if (normalized === previousTag) return;
    const updated = await updateHashtagOverrides(entry.id, { [key]: normalized });
    if (updated) {
      setEntry(updated);
      if (previousTag !== undefined) {
        showUndo('해시태그를 바꿨어요', { type: 'hashtag', key, previousTag });
      }
    }
  };

  const handleResetHashtag = async () => {
    if (!hashtagKey) return;
    const key = hashtagKey;
    const previousTag = effectiveHashtags(entry).find((t) => t.key === key)?.tag;
    setHashtagKey(null);
    const updated = await updateHashtagOverrides(entry.id, { [key]: undefined });
    if (updated) {
      setEntry(updated);
      if (previousTag !== undefined) {
        showUndo('기본 해시태그로 되돌렸어요', { type: 'hashtag', key, previousTag });
      }
    }
  };

  const captureImage = async () => {
    if (!cardRef.current) return null;
    return captureRef(cardRef, { format: 'png', quality: 1 });
  };

  const handleSaveImage = async () => {
    try {
      setWorking(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('저장 권한이 필요해요', '사진 보관함 접근을 허용해주세요.');
        return;
      }
      const uri = await captureImage();
      if (!uri) return;
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('저장 완료', '카드 이미지를 사진 보관함에 저장했어요.');
    } catch (e) {
      Alert.alert('저장 실패', '이미지를 저장하지 못했어요. 다시 시도해주세요.');
    } finally {
      setWorking(false);
    }
  };

  const handleShare = async () => {
    try {
      setWorking(true);
      const uri = await captureImage();
      if (!uri) return;
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('공유 불가', '이 기기에서는 공유 기능을 사용할 수 없어요.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png' });
    } catch (e) {
      Alert.alert('공유 실패', '공유 중 문제가 발생했어요. 다시 시도해주세요.');
    } finally {
      setWorking(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('삭제할까요?', '이 조각 일기를 삭제합니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await removeEntry(entry.id);
          navigation.navigate('History');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <DiaryCard
          ref={cardRef}
          entry={entry}
          onPressLine={(key) => setPickerKey(key)}
          onPressHashtag={handleOpenHashtagEditor}
          onLongPressCard={() => setBgPickerOpen(true)}
          onChangeSticker={handleStickerChange}
          onDeleteSticker={handleDeleteSticker}
          fontFamily={fontFamily}
        />

        <Text style={styles.hint}>
          문장이나 해시태그를 눌러보면 다른 표현으로, 길게 누르면 배경을 바꿀 수 있어요
        </Text>

        {undoAction && (
          <View style={styles.undoToast}>
            <Text style={styles.undoToastText}>{undoAction.message}</Text>
            <Pressable onPress={handleUndo} hitSlop={8}>
              <Text style={styles.undoToastAction}>되돌리기</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.iconRow}>
          <Pressable style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]} onPress={handleOpenEdit}>
            <MaterialIcons name="edit" size={20} color={theme.inkSoft} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={() => setStickerSheetOpen(true)}
          >
            <MaterialIcons name="local-offer" size={20} color={theme.inkSoft} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={handleToggleEntryLock}
          >
            <MaterialIcons
              name={entry.locked ? 'lock' : 'lock-open'}
              size={20}
              color={entry.locked ? theme.accent : theme.inkSoft}
            />
          </Pressable>

          <View style={styles.iconDivider} />

          {ALIGN_OPTIONS.map((opt) => {
            const active = (entry.textAlign ?? 'left') === opt.value;
            return (
              <Pressable
                key={opt.value}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                onPress={() => handleSetAlign(opt.value)}
              >
                <MaterialIcons name={opt.icon} size={20} color={active ? theme.accent : theme.inkSoft} />
              </Pressable>
            );
          })}

          <View style={styles.iconDivider} />

          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={() => handleSetTextSize(-1)}
            disabled={(entry.textSize ?? 'medium') === 'small'}
          >
            <MaterialIcons
              name="text-decrease"
              size={20}
              color={(entry.textSize ?? 'medium') === 'small' ? theme.border : theme.inkSoft}
            />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={() => handleSetTextSize(1)}
            disabled={(entry.textSize ?? 'medium') === 'large'}
          >
            <MaterialIcons
              name="text-increase"
              size={20}
              color={(entry.textSize ?? 'medium') === 'large' ? theme.border : theme.inkSoft}
            />
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={handleShare}
            disabled={working}
          >
            <Text style={styles.primaryBtnText}>공유하기</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={handleSaveImage}
            disabled={working}
          >
            <Text style={styles.secondaryBtnText}>이미지 저장</Text>
          </Pressable>
        </View>

        <View style={styles.linkRow}>
          <Pressable onPress={() => navigation.replace('ToneSelect')} hitSlop={8}>
            <Text style={styles.linkText}>다시 만들기</Text>
          </Pressable>
          <Text style={styles.linkDot}>·</Text>
          <Pressable onPress={() => navigation.popToTop()} hitSlop={8}>
            <Text style={styles.linkText}>홈으로</Text>
          </Pressable>
          {fromHistory && (
            <>
              <Text style={styles.linkDot}>·</Text>
              <Pressable onPress={handleDelete} hitSlop={8}>
                <Text style={styles.deleteText}>삭제하기</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>

      <Modal visible={editing} animationType="slide" onRequestClose={handleCancelEdit}>
        <SafeAreaView style={styles.editModal}>
          <View style={styles.editHeader}>
            <Pressable onPress={handleCancelEdit} hitSlop={12}>
              <Text style={styles.editHeaderBtn}>취소</Text>
            </Pressable>
            <Text style={styles.editHeaderTitle}>일기 수정</Text>
            <Pressable onPress={handleSaveEdit} hitSlop={12}>
              <Text style={[styles.editHeaderBtn, styles.editHeaderDone]}>완료</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.editScroll} keyboardShouldPersistTaps="handled">
            <DiaryCard
              entry={entry}
              editing
              draftLines={draftLines}
              onChangeLine={(key, text) => setDraftLines((prev) => ({ ...prev, [key]: text }))}
              large
              fontFamily={fontFamily}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={pickerKey !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerKey(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPickerKey(null)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>어떤 표현으로 바꿔볼까요?</Text>
            {pickerKey &&
              getOptions(pickerKey).map((option) => {
                const isCurrent = applyTone(option.fragment, entry.tone) === getCurrentFinalText(pickerKey);
                return (
                  <Pressable
                    key={option.label}
                    style={({ pressed }) => [
                      styles.sheetOption,
                      isCurrent && styles.sheetOptionActive,
                      pressed && styles.sheetOptionPressed,
                    ]}
                    onPress={() => handlePickOption(pickerKey, option)}
                  >
                    <Text style={styles.sheetOptionLabel}>
                      {isCurrent ? '✓ ' : ''}
                      {option.label}
                    </Text>
                    <Text style={styles.sheetOptionPreview}>
                      {applyTone(option.fragment, entry.tone)}
                    </Text>
                  </Pressable>
                );
              })}
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={pendingSwap !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingSwap(null)}
      >
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>문장을 바꿀까요?</Text>
            {pendingSwap && (
              <>
                <Text style={styles.confirmBefore}>{getCurrentFinalText(pendingSwap.key)}</Text>
                <Text style={styles.confirmArrow}>↓</Text>
                <Text style={styles.confirmAfter}>
                  {applyTone(pendingSwap.option.fragment, entry.tone)}
                </Text>
              </>
            )}
            <View style={styles.promptActions}>
              <Pressable
                style={({ pressed }) => [styles.promptBtn, pressed && styles.pressed]}
                onPress={() => setPendingSwap(null)}
              >
                <Text style={styles.promptBtnText}>취소</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.promptBtn,
                  styles.promptBtnPrimary,
                  pressed && styles.pressed,
                ]}
                onPress={handleConfirmSwap}
              >
                <Text style={styles.promptBtnPrimaryText}>바꾸기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={hashtagKey !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setHashtagKey(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setHashtagKey(null)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>해시태그를 선택하거나 직접 입력해보세요</Text>
            {hashtagKey && (
              <View style={styles.hashtagChipRow}>
                {getOptions(hashtagKey).map((option) => {
                  const tag = normalizeHashtag(option.label);
                  const isSelected = tag === normalizeHashtag(hashtagDraft);
                  return (
                    <Pressable
                      key={option.label}
                      style={({ pressed }) => [
                        styles.hashtagChip,
                        isSelected && styles.hashtagChipActive,
                        pressed && styles.sheetOptionPressed,
                      ]}
                      onPress={() => handlePickHashtagOption(option.label)}
                    >
                      <Text style={[styles.hashtagChipText, isSelected && styles.hashtagChipTextActive]}>
                        {tag}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            <TextInput
              style={styles.hashtagInput}
              value={hashtagDraft}
              onChangeText={setHashtagDraft}
              placeholder="예: #오늘의기록"
              placeholderTextColor={theme.inkSoft}
              autoFocus
            />
            {hashtagKey && entry.hashtagOverrides?.[hashtagKey] !== undefined && (
              <Pressable onPress={handleResetHashtag} hitSlop={8} style={styles.hashtagResetBtn}>
                <Text style={styles.hashtagResetText}>기본값으로 되돌리기</Text>
              </Pressable>
            )}
            <View style={styles.promptActions}>
              <Pressable
                style={({ pressed }) => [styles.promptBtn, pressed && styles.pressed]}
                onPress={() => setHashtagKey(null)}
              >
                <Text style={styles.promptBtnText}>취소</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.promptBtn, styles.promptBtnPrimary, pressed && styles.pressed]}
                onPress={handleSaveHashtag}
              >
                <Text style={styles.promptBtnPrimaryText}>완료</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={bgPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setBgPickerOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setBgPickerOpen(false)}>
          <ScrollView style={styles.stickerSheet} contentContainerStyle={styles.stickerSheetContent}>
            <Text style={styles.sheetTitle}>배경을 골라보세요</Text>
            <View style={styles.swatchGrid}>
              <Pressable
                style={({ pressed }) => [styles.swatchItem, pressed && styles.sheetOptionPressed]}
                onPress={handlePickPhoto}
              >
                <View style={[styles.swatchAuto, !!entry.backgroundImageUri && styles.swatchActive]}>
                  <Text style={styles.swatchAutoText}>🖼️</Text>
                </View>
                <Text style={styles.swatchLabel}>내 사진</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.swatchItem, pressed && styles.sheetOptionPressed]}
                onPress={() => handlePickPalette(undefined)}
              >
                <View
                  style={[
                    styles.swatchAuto,
                    !entry.paletteOverride &&
                      !entry.backgroundImageUri &&
                      !entry.illustration &&
                      styles.swatchActive,
                  ]}
                >
                  <Text style={styles.swatchAutoText}>기본</Text>
                </View>
                <Text style={styles.swatchLabel}>기분대로</Text>
              </Pressable>
              {PALETTE_KEYS.map((key) => {
                const palette = MOOD_PALETTES[key];
                const isActive =
                  entry.paletteOverride === key && !entry.backgroundImageUri && !entry.illustration;
                return (
                  <Pressable
                    key={key}
                    style={({ pressed }) => [styles.swatchItem, pressed && styles.sheetOptionPressed]}
                    onPress={() => handlePickPalette(key)}
                  >
                    <View
                      style={[
                        styles.swatch,
                        { backgroundColor: palette.colors[1] },
                        isActive && styles.swatchActive,
                      ]}
                    />
                    <Text style={styles.swatchLabel}>{key}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.stickerPackTitle}>일러스트</Text>
            <View style={[styles.swatchGrid, styles.illustrationGrid]}>
              {ILLUSTRATION_OPTIONS.map((opt) => {
                const isActive = entry.illustration === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    style={({ pressed }) => [styles.swatchItem, pressed && styles.sheetOptionPressed]}
                    onPress={() => handlePickIllustration(opt.key)}
                  >
                    <View style={[styles.illustrationSwatch, isActive && styles.swatchActive]}>
                      <IllustrationBackground illustration={opt.key} />
                    </View>
                    <Text style={styles.swatchLabel}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </Pressable>
      </Modal>

      <Modal
        visible={stickerSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setStickerSheetOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setStickerSheetOpen(false)}>
          <ScrollView style={styles.stickerSheet} contentContainerStyle={styles.stickerSheetContent}>
            <Text style={styles.sheetTitle}>스티커로 꾸며보세요</Text>
            <Text style={styles.stickerHint}>
              최대 {MAX_STICKERS_PER_ENTRY}개까지 붙일 수 있어요{'\n'}
              카드 위 스티커는 끌어서 옮기고, 두 손가락으로 돌리거나 크기를 바꿀 수 있어요{'\n'}
              길게 누르면 삭제돼요
            </Text>
            {STICKER_PACKS.map((pack) => (
              <View key={pack.id} style={styles.stickerPack}>
                <View style={styles.stickerPackHeader}>
                  <Text style={styles.stickerPackTitle}>{pack.title}</Text>
                  {!pack.free && <Text style={styles.stickerPackSoon}>Soon</Text>}
                </View>
                <View style={styles.stickerGrid}>
                  {pack.stickers.map((sticker) => {
                    const isActive = (entry.stickers ?? []).some((s) => s.stickerId === sticker.id);
                    const unlocked = isStickerUnlocked(pack, sticker, unlockedMilestones);
                    return (
                      <Pressable
                        key={sticker.id}
                        style={({ pressed }) => [
                          styles.stickerItem,
                          isActive && styles.stickerItemActive,
                          !unlocked && styles.stickerItemLocked,
                          pressed && styles.sheetOptionPressed,
                        ]}
                        onPress={() => handleToggleSticker(sticker, pack)}
                      >
                        <Text style={styles.stickerItemEmoji}>{sticker.emoji}</Text>
                        <Text style={styles.stickerItemLabel}>
                          {!unlocked && sticker.unlockAt ? `🔒 ${sticker.unlockAt}일` : sticker.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  hint: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
    color: theme.inkSoft,
  },
  undoToast: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.ink,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  undoToastText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  undoToastAction: {
    fontSize: 13,
    color: theme.accentSoft,
    fontWeight: '800',
  },
  iconRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 3,
  },
  iconDivider: {
    width: 1,
    height: 20,
    backgroundColor: theme.border,
  },
  actions: {
    marginTop: 20,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.border,
  },
  secondaryBtnText: {
    color: theme.ink,
    fontSize: 16,
    fontWeight: '600',
  },
  linkRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  linkText: {
    color: theme.inkSoft,
    fontSize: 14,
    fontWeight: '600',
  },
  linkDot: {
    color: theme.border,
    fontSize: 14,
  },
  deleteText: {
    color: '#C0392B',
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  editModal: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  editHeaderBtn: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.inkSoft,
  },
  editHeaderDone: {
    color: theme.accent,
    fontWeight: '700',
  },
  editHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.ink,
  },
  editScroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    gap: 10,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink,
    marginBottom: 4,
    textAlign: 'center',
  },
  sheetOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: theme.bg,
  },
  sheetOptionPressed: {
    opacity: 0.6,
  },
  sheetOptionActive: {
    backgroundColor: theme.accentSoft,
  },
  sheetOptionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.ink,
    textAlign: 'center',
    marginBottom: 3,
  },
  sheetOptionPreview: {
    fontSize: 12,
    color: theme.inkSoft,
    textAlign: 'center',
  },
  hashtagChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  hashtagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.bg,
  },
  hashtagChipActive: {
    backgroundColor: theme.accentSoft,
  },
  hashtagChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.inkSoft,
  },
  hashtagChipTextActive: {
    color: theme.accent,
  },
  hashtagInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink,
    marginBottom: 14,
  },
  hashtagResetBtn: {
    alignSelf: 'center',
    marginBottom: 14,
  },
  hashtagResetText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.inkSoft,
    textDecorationLine: 'underline',
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  confirmCard: {
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.ink,
    marginBottom: 14,
  },
  confirmBefore: {
    fontSize: 14,
    color: theme.inkSoft,
    textAlign: 'center',
    textDecorationLine: 'line-through',
  },
  confirmArrow: {
    fontSize: 16,
    color: theme.accent,
    marginVertical: 6,
  },
  confirmAfter: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink,
    textAlign: 'center',
    marginBottom: 18,
  },
  promptActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  promptBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: theme.bg,
  },
  promptBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.inkSoft,
  },
  promptBtnPrimary: {
    backgroundColor: theme.accent,
  },
  promptBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 8,
  },
  swatchItem: {
    alignItems: 'center',
    width: 64,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchAuto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchAutoText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.inkSoft,
  },
  swatchActive: {
    borderColor: theme.accent,
  },
  swatchLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    color: theme.inkSoft,
    textAlign: 'center',
  },
  illustrationGrid: {
    marginTop: 4,
    marginBottom: 4,
  },
  illustrationSwatch: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  stickerSheet: {
    maxHeight: '75%',
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  stickerSheetContent: {
    padding: 20,
    paddingBottom: 32,
  },
  stickerHint: {
    fontSize: 12,
    color: theme.inkSoft,
    textAlign: 'center',
    marginBottom: 16,
  },
  stickerPack: {
    marginBottom: 18,
  },
  stickerPackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  stickerPackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.ink,
  },
  stickerPackSoon: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.inkSoft,
    backgroundColor: theme.bg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stickerItem: {
    width: 68,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: theme.bg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  stickerItemActive: {
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
  },
  stickerItemLocked: {
    opacity: 0.45,
  },
  stickerItemEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  stickerItemLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.inkSoft,
  },
});
