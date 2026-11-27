// Native counterpart of webCapture.web.ts; native capture goes through
// react-native-view-shot instead, so this is never called.
export async function captureToDataUri(_node: unknown): Promise<string> {
  throw new Error('captureToDataUri is web-only');
}
