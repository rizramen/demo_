import { GENERATED_TRACKS } from "@/src/data/tracks.generated";
import type { Track, TrackSection, TrackSeed } from "@/src/types/track";
import { titleFromFilename } from "@/src/utils/title-from-filename";

function normalizeTrack(seed: TrackSeed): Track {
  // Use a readable fallback title when the manifest entry has no explicit title.
  const fallbackTitle = seed.filename ? titleFromFilename(seed.filename) : "Untitled Demo";

  return {
    ...seed,
    title: seed.title ?? fallbackTitle,
  };
}

export async function listTracks(): Promise<Track[]> {
  // The generated manifest is static at runtime, but we keep this async API so
  // callers can swap in a remote source later without changing hook contracts.
  return GENERATED_TRACKS
    .map(normalizeTrack)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function listTracksBySection(section: TrackSection): Promise<Track[]> {
  const tracks = await listTracks();
  return tracks.filter((track) => track.section === section);
}
