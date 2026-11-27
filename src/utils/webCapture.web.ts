import html2canvas from 'html2canvas';

// react-native-view-shot resolves the view through findNodeHandle, which
// react-native-web no longer supports — so on web its captureRef throws
// before ever reaching its own html2canvas path. A web View ref already is
// the DOM node, so render that directly.
export async function captureToDataUri(node: unknown): Promise<string> {
  const canvas = await html2canvas(node as HTMLElement, { backgroundColor: null, scale: 2 });
  return canvas.toDataURL('image/png');
}
