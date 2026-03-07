import { useCallback, useEffect, useState } from "react";

import { listTracks, listTracksBySection } from "@/src/services/tracks.service";
import type { Track, TrackSection } from "@/src/types/track";

export function useTracks(section?: TrackSection) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use the section-specific query when provided, otherwise load everything.
      const nextTracks = section ? await listTracksBySection(section) : await listTracks();
      setTracks(nextTracks);
    } finally {
      setIsLoading(false);
    }
  }, [section]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tracks, isLoading, refresh };
}
