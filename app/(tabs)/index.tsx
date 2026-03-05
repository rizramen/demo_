import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAudioTrackPlayer } from "@/src/hooks/useAudioTrackPlayer";
import { useTracks } from "@/src/hooks/useTracks";

function formatTime(seconds: number) {
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainderSeconds = totalSeconds % 60;
  return `${minutes}:${remainderSeconds < 10 ? "0" : ""}${remainderSeconds}`;
}

export default function HomeScreen() {
  const { tracks, isLoading } = useTracks();
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  useEffect(() => {
    if (!tracks.length) {
      setSelectedTrackId(null);
      return;
    }

    setSelectedTrackId((previousId) => {
      if (previousId && tracks.some((track) => track.id === previousId)) {
        return previousId;
      }
      return tracks[0].id;
    });
  }, [tracks]);

  const currentTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) ?? tracks[0] ?? null,
    [selectedTrackId, tracks]
  );

  const { player, status } = useAudioTrackPlayer(currentTrack?.source ?? null);

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubSeconds, setScrubSeconds] = useState(0);

  const positionSeconds = status?.currentTime ?? 0;
  const durationSeconds = Math.max(status?.duration ?? 0, 1);

  const shownPositionSeconds = isScrubbing ? scrubSeconds : positionSeconds;

  const togglePlayPause = useCallback(() => {
    if (!currentTrack) return;

    if (status?.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [currentTrack, player, status?.playing]);

  const seekBy = useCallback(
    (secondsDelta: number) => {
      if (!currentTrack) return;

      const fromSeconds = isScrubbing ? scrubSeconds : positionSeconds;
      const nextSeconds = Math.max(0, Math.min(durationSeconds, fromSeconds + secondsDelta));
      setIsScrubbing(false);
      setScrubSeconds(nextSeconds);
      player.seekTo(nextSeconds);
    },
    [currentTrack, durationSeconds, isScrubbing, player, positionSeconds, scrubSeconds]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.code !== "Space") return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA" || target?.isContentEditable) return;

      event.preventDefault();
      togglePlayPause();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePlayPause]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>rizramen vault</Text>
      <Text>{isLoading ? "Loading track..." : currentTrack?.title ?? "No demo track found"}</Text>

      <View style={styles.controlsRow}>
        <Pressable
          style={styles.iconButton}
          onPress={() => seekBy(-15)}
          disabled={!currentTrack || isLoading}
        >
          <Ionicons name="play-back" size={30} color="#111" />
          <Text style={styles.skipLabel}>15s</Text>
        </Pressable>

        <Pressable style={styles.iconButton} onPress={togglePlayPause} disabled={!currentTrack || isLoading}>
          <Ionicons name={status?.playing ? "pause" : "play"} size={48} color="#111" />
        </Pressable>

        <Pressable
          style={styles.iconButton}
          onPress={() => seekBy(15)}
          disabled={!currentTrack || isLoading}
        >
          <Ionicons name="play-forward" size={30} color="#111" />
          <Text style={styles.skipLabel}>15s</Text>
        </Pressable>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.time}>{formatTime(shownPositionSeconds)}</Text>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={durationSeconds}
          value={shownPositionSeconds}
          disabled={!currentTrack || isLoading}
          onSlidingStart={() => {
            setIsScrubbing(true);
            setScrubSeconds(positionSeconds);
          }}
          onValueChange={(value) => setScrubSeconds(Math.floor(value))}
          onSlidingComplete={(value) => {
            const seconds = Math.floor(value);
            setIsScrubbing(false);
            player.seekTo(seconds);
          }}
        />

        <Text style={styles.time}>{formatTime(durationSeconds)}</Text>
      </View>

      <Text style={styles.listTitle}>Demo Files</Text>
      <ScrollView style={styles.trackList} contentContainerStyle={styles.trackListContent}>
        {tracks.map((track) => {
          const isSelected = track.id === currentTrack?.id;

          return (
            <Pressable
              key={track.id}
              style={[styles.trackItem, isSelected && styles.trackItemSelected]}
              onPress={() => setSelectedTrackId(track.id)}
            >
              <Text style={styles.trackItemTitle}>{track.title}</Text>
              <Text style={styles.trackItemMeta}>{new Date(track.createdAt).toLocaleString()}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 24,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 18 },
  controlsRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 },
  iconButton: { paddingVertical: 8, paddingHorizontal: 10, alignItems: "center" },
  skipLabel: { fontSize: 12, color: "#111" },
  progressRow: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  slider: { flex: 1, minWidth: 120 },
  time: { width: 40, textAlign: "center", color: "#000" },
  listTitle: { marginTop: 18, marginBottom: 8, fontSize: 16, fontWeight: "600", color: "#111" },
  trackList: { width: "100%", maxWidth: 520, maxHeight: 220 },
  trackListContent: { gap: 8, paddingBottom: 4 },
  trackItem: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  trackItemSelected: {
    borderColor: "#111",
    backgroundColor: "#f4f4f4",
  },
  trackItemTitle: { fontSize: 14, fontWeight: "600", color: "#111" },
  trackItemMeta: { fontSize: 12, color: "#666", marginTop: 2 },
});
