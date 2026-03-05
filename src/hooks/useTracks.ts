import { useCallback, useEffect, useState } from "react";

import { listTracks } from "@/src/services/tracks.service";
import type { Track } from "@/src/types/track";

export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextTracks = await listTracks();
      setTracks(nextTracks);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tracks, isLoading, refresh };
}
