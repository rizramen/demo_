import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useTabVisibility } from "@/src/context/tab-visibility-context";

import { useAudioTrackPlayer } from "@/src/hooks/useAudioTrackPlayer";
import { useTracks } from "@/src/hooks/useTracks";
import { getTrackDownloadUrl } from "@/src/utils/track-download-url";

type SortMode = "newest" | "alphabetical";

function formatTime(seconds: number) {
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainderSeconds = totalSeconds % 60;
  return `${minutes}:${remainderSeconds < 10 ? "0" : ""}${remainderSeconds}`;
}

export default function HomeScreen() {
  const { tracks, isLoading } = useTracks("vault");
  const isFocused = useIsFocused();
  const isVisible = useTabVisibility("vault");
  const isActiveScreen = isFocused && isVisible;
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const sortedTracks = useMemo(() => {
    // Always sort a copy so we never mutate React state arrays in place.
    const nextTracks = [...tracks];

    if (sortMode === "alphabetical") {
      nextTracks.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
      return nextTracks;
    }

    nextTracks.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return nextTracks;
  }, [sortMode, tracks]);

  useEffect(() => {
    if (!sortedTracks.length) {
      setSelectedTrackId(null);
      return;
    }

    // Preserve the user's selection after re-sorts; otherwise default to the first track.
    setSelectedTrackId((previousId) => {
      if (previousId && sortedTracks.some((track) => track.id === previousId)) {
        return previousId;
      }
      return sortedTracks[0].id;
    });
  }, [sortedTracks]);

  const currentTrack = useMemo(
    () => sortedTracks.find((track) => track.id === selectedTrackId) ?? sortedTracks[0] ?? null,
    [selectedTrackId, sortedTracks]
  );

  const { player, status } = useAudioTrackPlayer(currentTrack?.source ?? null, isActiveScreen);

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
    if (!isActiveScreen || typeof window === "undefined") return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.code !== "Space") return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA" || target?.isContentEditable) return;

      event.preventDefault();
      togglePlayPause();
    }

    // Web-only keyboard shortcut for play/pause.
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isActiveScreen, togglePlayPause]);

  if (!isActiveScreen) {
    // Avoid rendering interactive controls while this tab is inactive.
    return <View style={styles.inactiveScreen} pointerEvents="none" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>rizramen vault</Text>
      <Text style={styles.subtitle}>
        {isLoading ? "Loading track..." : currentTrack?.title ?? "No demo track found"}
      </Text>

      <View style={styles.controlsRow}>
        <Pressable
          style={styles.iconButton}
          onPress={() => seekBy(-15)}
          disabled={!currentTrack || isLoading}
        >
          <Ionicons name="play-back" size={30} color="#fff" />
          <Text style={styles.skipLabel}>15s</Text>
        </Pressable>

        <Pressable style={styles.iconButton} onPress={togglePlayPause} disabled={!currentTrack || isLoading}>
          <Ionicons name={status?.playing ? "pause" : "play"} size={48} color="#fff" />
        </Pressable>

        <Pressable
          style={styles.iconButton}
          onPress={() => seekBy(15)}
          disabled={!currentTrack || isLoading}
        >
          <Ionicons name="play-forward" size={30} color="#fff" />
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
          minimumTrackTintColor="#ffffff"
          maximumTrackTintColor="rgba(255,255,255,0.45)"
          thumbTintColor="#ffffff"
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
      <View style={styles.sortRow}>
        <Pressable
          style={[styles.sortButton, sortMode === "newest" && styles.sortButtonActive]}
          onPress={() => setSortMode("newest")}
        >
          <Text style={[styles.sortButtonText, sortMode === "newest" && styles.sortButtonTextActive]}>
            Newest
          </Text>
        </Pressable>
        <Pressable
          style={[styles.sortButton, sortMode === "alphabetical" && styles.sortButtonActive]}
          onPress={() => setSortMode("alphabetical")}
        >
          <Text
            style={[styles.sortButtonText, sortMode === "alphabetical" && styles.sortButtonTextActive]}
          >
            A-Z
          </Text>
        </Pressable>
      </View>
      <ScrollView style={styles.trackList} contentContainerStyle={styles.trackListContent}>
        {sortedTracks.map((track) => {
          const isSelected = track.id === currentTrack?.id;

          return (
            <Pressable
              key={track.id}
              style={[styles.trackItem, isSelected && styles.trackItemSelected]}
              onPress={() => setSelectedTrackId(track.id)}
            >
              <View style={styles.trackItemTopRow}>
                <View style={styles.trackItemInfo}>
                  <Text style={styles.trackItemTitle}>{track.title}</Text>
                  <Text style={styles.trackItemMeta}>{new Date(track.createdAt).toLocaleString()}</Text>
                </View>
                <Pressable
                  style={styles.downloadButton}
                  onPress={(event) => {
                    event.stopPropagation();
                    const downloadUrl = getTrackDownloadUrl(track);
                    if (!downloadUrl) return;
                    void Linking.openURL(downloadUrl);
                  }}
                >
                  <Text style={styles.downloadButtonText}>Download</Text>
                </Pressable>
              </View>
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
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 24,
  },
  title: { fontSize: 22, fontWeight: "700", color: '#ffffff', marginBottom: 18 },
  subtitle: { color: "#fff", marginBottom: 8 },
  controlsRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 },
  iconButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  skipLabel: { fontSize: 12, color: "#fff" },
  progressRow: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  slider: { flex: 1, minWidth: 120 },
  time: { width: 40, textAlign: "center", color: '#ffffff' },
  listTitle: { marginTop: 18, marginBottom: 8, fontSize: 16, fontWeight: "600", color: '#ffffff' },
  sortRow: {
    width: "100%",
    maxWidth: 520,
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  sortButtonActive: {
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  sortButtonText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    fontWeight: "600",
  },
  sortButtonTextActive: {
    color: "#ffffff",
  },
  trackList: { width: "100%", maxWidth: 520, maxHeight: 220 },
  trackListContent: { gap: 8, paddingBottom: 4 },
  trackItem: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  trackItemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  trackItemInfo: {
    flex: 1,
  },
  trackItemSelected: {
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  trackItemTitle: { fontSize: 14, fontWeight: "600", color: "#fff" },
  trackItemMeta: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  downloadButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  inactiveScreen: {
    flex: 1,
  },
});
