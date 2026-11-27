import { RefObject } from 'react';
import { Platform, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { showAlert } from './alert';
import { captureToDataUri } from './webCapture';

// Browsers have no share sheet or photo library to hand a PNG to (both
// expo modules fail there), so on web the image is simply downloaded.
async function downloadOnWeb(ref: RefObject<View | null>, fileName: string) {
  const dataUri = await captureToDataUri(ref.current);
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function shareCardImage(ref: RefObject<View | null>, fileName: string): Promise<void> {
  if (!ref.current) return;
  try {
    if (Platform.OS === 'web') {
      await downloadOnWeb(ref, fileName);
      return;
    }
    const uri = await captureRef(ref, { format: 'png', quality: 1 });
    if (!(await Sharing.isAvailableAsync())) {
      showAlert('공유 불가', '이 기기에서는 공유 기능을 사용할 수 없어요.');
      return;
    }
    await Sharing.shareAsync(uri, { mimeType: 'image/png' });
  } catch {
    showAlert('공유 실패', '공유 중 문제가 발생했어요. 다시 시도해주세요.');
  }
}

export async function saveCardImage(ref: RefObject<View | null>, fileName: string): Promise<void> {
  if (!ref.current) return;
  try {
    if (Platform.OS === 'web') {
      await downloadOnWeb(ref, fileName);
      return;
    }
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      showAlert('저장 권한이 필요해요', '사진 보관함 접근을 허용해주세요.');
      return;
    }
    const uri = await captureRef(ref, { format: 'png', quality: 1 });
    await MediaLibrary.saveToLibraryAsync(uri);
    showAlert('저장 완료', '카드 이미지를 사진 보관함에 저장했어요.');
  } catch {
    showAlert('저장 실패', '이미지를 저장하지 못했어요. 다시 시도해주세요.');
  }
}
