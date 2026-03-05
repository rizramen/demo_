import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import type { AudioSource } from "expo-audio";
import { useEffect } from "react";

export function useAudioTrackPlayer(source: AudioSource | null) {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    player.pause();
    player.seekTo(0);

    if (source) {
      player.replace(source);
    }
  }, [player, source]);

  return { player, status };
}
