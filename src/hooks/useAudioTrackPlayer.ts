import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import type { AudioSource } from "expo-audio";
import { useEffect } from "react";

export function useAudioTrackPlayer(source: AudioSource | null, enabled = true) {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    // Keep playback silent when this screen/tab is not active.
    if (!enabled) {
      player.pause();
      return;
    }

    // Reset state whenever the selected source changes.
    player.pause();
    player.seekTo(0);

    if (source) {
      player.replace(source);
    }
  }, [enabled, player, source]);

  return { player, status };
}
