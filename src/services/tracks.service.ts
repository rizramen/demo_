import { GENERATED_TRACKS } from "@/src/data/tracks.generated";
import type { Track, TrackSection, TrackSeed } from "@/src/types/track";
import { titleFromFilename } from "@/src/utils/title-from-filename";

function normalizeTrack(seed: TrackSeed): Track {
  const fallbackTitle = seed.filename ? titleFromFilename(seed.filename) : "Untitled Demo";

  return {
    ...seed,
    title: seed.title ?? fallbackTitle,
  };
}

export async function listTracks(): Promise<Track[]> {
  return GENERATED_TRACKS
    .map(normalizeTrack)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function listTracksBySection(section: TrackSection): Promise<Track[]> {
  const tracks = await listTracks();
  return tracks.filter((track) => track.section === section);
}
