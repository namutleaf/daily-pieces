import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../navigation/types';
import { theme, MOOD_PALETTES, PALETTE_KEYS } from '../theme';
import DiaryCard from '../components/DiaryCard';
import { LineKey, PaletteKey } from '../types';
import { getFontOption } from '../data/fonts';
import { MAX_STICKERS_PER_ENTRY, STICKER_PACKS } from '../data/stickers';
import { applyTone, CLOSER_OPTIONS, defaultBaseFragment, lineFinalText } from '../utils/generateDiary';
import {
  getFontPreference,
  removeEntry,
  updateBackgroundImage,
  updateLineOverrides,
  updatePaletteOverride,
  updateStickers,
} from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;
type Option = { label: string; fragment: string };

const ALL_LINE_KEYS: LineKey[] = ['weather', 'mood', 'person', 'place', 'activity', 'moment', 'closer'];

export default function ResultScreen({ route, navigation }: Props) {
  const { fromHistory } = route.params;
  const [entry, setEntry] = useState(route.params.entry);
  const [editing, setEditing] = useState(false);
  const [draftLines, setDraftLines] = useState<Partial<Record<LineKey, string>>>({});
  const cardRef = useRef<View>(null);
  const [working, setWorking] = useState(false);
  const [pickerKey, setPickerKey] = useState<LineKey | null>(null);
  const [pendingSwap, setPendingSwap] = useState<{ key: LineKey; option: Option } | null>(null);
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const [stickerSheetOpen, setStickerSheetOpen] = useState(false);
  const [fontFamily, setFontFamily] = useState<string | undefined>(undefined);

  useEffect(() => {
    getFontPreference().then((key) => setFontFamily(getFontOption(key).fontFamily));
  }, []);

  const handlePickPalette = async (key: PaletteKey | undefined) => {
    setBgPickerOpen(false);
    const updated = await updatePaletteOverride(entry.id, key);
    if (!updated) return;
    // A photo takes visual priority over the mood color, so clear it when
    // the user explicitly picks a color instead.
    const cleared = updated.backgroundImageUri
      ? await updateBackgroundImage(entry.id, undefined)
      : updated;
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
    if (updated) setEntry(updated);
  };

  const handleToggleSticker = async (id: string, free: boolean) => {
    if (!free) {
      Alert.alert('조금만 기다려주세요', '곧 새로운 스티커로 만나요 💌');
      return;
    }
    const current = entry.stickers ?? [];
    let next: string[];
    if (current.includes(id)) {
      next = current.filter((s) => s !== id);
    } else if (current.length >= MAX_STICKERS_PER_ENTRY) {
      Alert.alert('스티커는 최대 4개까지', '카드 하나에 최대 4개까지 붙일 수 있어요.');
      return;
    } else {
      next = [...current, id];
    }
    const updated = await updateStickers(entry.id, next);
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
      if (draft !== undefined && draft.trim() !== getCurrentFinalText(key)) {
        patch[key] = draft.trim();
      }
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
    setPendingSwap(null);
    const toned = applyTone(option.fragment, entry.tone);
    const updated = await updateLineOverrides(entry.id, { [key]: toned });
    if (updated) setEntry(updated);
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
          onLongPressCard={() => setBgPickerOpen(true)}
          fontFamily={fontFamily}
        />

        <Text style={styles.hint}>
          문장을 눌러보면 다른 표현으로, 길게 누르면 배경을 바꿀 수 있어요
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={handleOpenEdit}
          >
            <Text style={styles.secondaryBtnText}>직접 수정하기</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={() => setStickerSheetOpen(true)}
          >
            <Text style={styles.secondaryBtnText}>스티커 꾸미기</Text>
          </Pressable>

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

          <Pressable
            style={({ pressed }) => [styles.textBtn, pressed && styles.pressed]}
            onPress={() => navigation.replace('ToneSelect')}
          >
            <Text style={styles.textBtnText}>다시 만들기</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.textBtn, pressed && styles.pressed]}
            onPress={() => navigation.popToTop()}
          >
            <Text style={styles.textBtnText}>홈으로</Text>
          </Pressable>

          {fromHistory && (
            <Pressable
              style={({ pressed }) => [styles.textBtn, pressed && styles.pressed]}
              onPress={handleDelete}
            >
              <Text style={styles.deleteText}>삭제하기</Text>
            </Pressable>
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
        visible={bgPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setBgPickerOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setBgPickerOpen(false)}>
          <View style={styles.sheet}>
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
                    !entry.paletteOverride && !entry.backgroundImageUri && styles.swatchActive,
                  ]}
                >
                  <Text style={styles.swatchAutoText}>기본</Text>
                </View>
                <Text style={styles.swatchLabel}>기분대로</Text>
              </Pressable>
              {PALETTE_KEYS.map((key) => {
                const palette = MOOD_PALETTES[key];
                const isActive = entry.paletteOverride === key && !entry.backgroundImageUri;
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
          </View>
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
            <Text style={styles.stickerHint}>최대 {MAX_STICKERS_PER_ENTRY}개까지 붙일 수 있어요</Text>
            {STICKER_PACKS.map((pack) => (
              <View key={pack.id} style={styles.stickerPack}>
                <View style={styles.stickerPackHeader}>
                  <Text style={styles.stickerPackTitle}>{pack.title}</Text>
                  {!pack.free && <Text style={styles.stickerPackSoon}>Soon</Text>}
                </View>
                <View style={styles.stickerGrid}>
                  {pack.stickers.map((sticker) => {
                    const isActive = (entry.stickers ?? []).includes(sticker.id);
                    return (
                      <Pressable
                        key={sticker.id}
                        style={({ pressed }) => [
                          styles.stickerItem,
                          isActive && styles.stickerItemActive,
                          !pack.free && styles.stickerItemLocked,
                          pressed && styles.sheetOptionPressed,
                        ]}
                        onPress={() => handleToggleSticker(sticker.id, pack.free)}
                      >
                        <Text style={styles.stickerItemEmoji}>{sticker.emoji}</Text>
                        <Text style={styles.stickerItemLabel}>{sticker.label}</Text>
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
  actions: {
    marginTop: 24,
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
  textBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  textBtnText: {
    color: theme.inkSoft,
    fontSize: 15,
    fontWeight: '600',
  },
  deleteText: {
    color: '#C0392B',
    fontSize: 15,
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
