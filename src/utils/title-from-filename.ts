export function titleFromFilename(filename: string): string {
  // Convert file-like names into readable titles:
  // "my_track-demo.mp3" -> "My Track Demo".
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
