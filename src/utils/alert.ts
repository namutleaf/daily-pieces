import { Alert, AlertButton, Platform } from 'react-native';

export type AlertRequest = { title: string; message?: string; buttons: AlertButton[] };

let presenter: ((request: AlertRequest) => void) | null = null;

export function setAlertPresenter(next: ((request: AlertRequest) => void) | null) {
  presenter = next;
}

// react-native-web ships Alert.alert as an empty function, so on web every
// alert — including the confirm step of destructive actions like delete —
// silently did nothing. Web routes through the in-app AlertHost instead;
// native keeps the platform dialog.
export function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
  if (Platform.OS !== 'web' || !presenter) {
    Alert.alert(title, message, buttons);
    return;
  }
  presenter({ title, message, buttons: buttons?.length ? buttons : [{ text: '확인' }] });
}
