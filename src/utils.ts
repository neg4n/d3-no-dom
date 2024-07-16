export function toSvgBase64(string: string) {
  const base64String = btoa(string);
  return `data:image/svg+xml;base64,${base64String}`;
}
