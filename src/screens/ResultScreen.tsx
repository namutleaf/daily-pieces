import React, { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';
import DiaryCard from '../components/DiaryCard';
import { removeEntry, updateEntryText } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ route, navigation }: Props) {
  const { fromHistory } = route.params;
  const [entry, setEntry] = useState(route.params.entry);
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(entry.diaryText);
  const cardRef = useRef<View>(null);
  const [working, setWorking] = useState(false);

  const handleToggleEdit = async () => {
    if (editing) {
      const trimmed = draftText.trim();
      const nextEntry = { ...entry, diaryText: trimmed };
      setEntry(nextEntry);
      await updateEntryText(entry.id, trimmed);
    } else {
      setDraftText(entry.diaryText);
    }
    setEditing((v) => !v);
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
          editing={editing}
          editValue={draftText}
          onChangeEditValue={setDraftText}
        />

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={handleToggleEdit}
          >
            <Text style={styles.secondaryBtnText}>{editing ? '수정 완료' : '직접 수정하기'}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={handleShare}
            disabled={working || editing}
          >
            <Text style={styles.primaryBtnText}>공유하기</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={handleSaveImage}
            disabled={working || editing}
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
});
