import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Slider from "@react-native-community/slider";
import { useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useTabVisibility } from "@/src/context/tab-visibility-context";

import { useAudioTrackPlayer } from "@/src/hooks/useAudioTrackPlayer";
import { useTracks } from "@/src/hooks/useTracks";
import { getTrackDownloadUrl } from "@/src/utils/track-download-url";

type SortMode = "newest" | "alphabetical";

const PLAY_ICON = require("../../assets/images/controls/play.png");
const PAUSE_ICON = require("../../assets/images/controls/pause.png");
const SKIP_BACK_ICON = require("../../assets/images/controls/skip-back.png");
const SKIP_FORWARD_ICON = require("../../assets/images/controls/skip-forward.png");
const INSTAGRAM_ICON = require("../../assets/images/instaTransparentIcon.png");
const SOUNDCLOUD_ICON = require("../../assets/images/soundcloudIconNoText.png");
const SPOTIFY_ICON = require("../../assets/images/spotifyIcon.png");

function formatTime(seconds: number) {
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainderSeconds = totalSeconds % 60;
  return `${minutes}:${remainderSeconds < 10 ? "0" : ""}${remainderSeconds}`;
}

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const { tracks, isLoading } = useTracks("archive");
  const isFocused = useIsFocused();
  const isVisible = useTabVisibility("archive");
  const isActiveScreen = isFocused && isVisible;
  const isPhone = width < 768;
  const isNarrowPhone = width < 420;
  const contentMaxWidth = isPhone ? Math.max(280, Math.min(width - 24, 520)) : 520;
  const trackListMaxHeight = isPhone ? Math.max(180, Math.min(320, Math.floor(height * 0.34))) : 220;
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
    <View style={[styles.container, isPhone && styles.containerPhone]}>
      <Text style={[styles.title, isPhone && styles.titlePhone]}>Archive</Text>
      <Text style={[styles.subtitle, isNarrowPhone && styles.subtitlePhone]}>
        {isLoading ? "Loading track..." : currentTrack?.title ? `"${currentTrack.title}"` : "No demo track found"}
      </Text>
      <View style={[styles.socialCornerRow, isPhone && styles.socialCornerRowPhone]}>
        <Pressable onPress={() => void Linking.openURL("https://instagram.com/rizramen")} style={styles.socialButton}>
          <Image source={INSTAGRAM_ICON} style={styles.socialIcon} resizeMode="contain" />
        </Pressable>
        <Pressable onPress={() => void Linking.openURL("https://soundcloud.com/rizramen")} style={styles.socialButton}>
          <Image source={SOUNDCLOUD_ICON} style={styles.socialIcon} resizeMode="contain" />
        </Pressable>
        <Pressable
          onPress={() =>
            void Linking.openURL(
              "https://open.spotify.com/artist/6cAAufcMkqQsx46dOM9a1B?si=fHjEl-teSG2tixF8QEsCbA"
            )
          }
          style={[styles.socialButton, styles.spotifyButtonSpacing]}
        >
          <Image source={SPOTIFY_ICON} style={styles.socialIcon} resizeMode="contain" />
        </Pressable>
      </View>

      <View style={[styles.controlsRow, isPhone && styles.controlsRowPhone]}>
        <Pressable
          style={[styles.iconButton, (!currentTrack || isLoading) && styles.disabledButton]}
          onPress={() => seekBy(-15)}
          disabled={!currentTrack || isLoading}
        >
          <Image source={SKIP_BACK_ICON} style={[styles.controlIcon, isPhone && styles.controlIconPhone]} resizeMode="contain" />
        </Pressable>

        <Pressable
          style={[styles.iconButton, (!currentTrack || isLoading) && styles.disabledButton]}
          onPress={togglePlayPause}
          disabled={!currentTrack || isLoading}
        >
          <Image
            source={status?.playing ? PAUSE_ICON : PLAY_ICON}
            style={[styles.playControlIcon, isPhone && styles.playControlIconPhone]}
            resizeMode="contain"
          />
        </Pressable>

        <Pressable
          style={[styles.iconButton, (!currentTrack || isLoading) && styles.disabledButton]}
          onPress={() => seekBy(15)}
          disabled={!currentTrack || isLoading}
        >
          <Image source={SKIP_FORWARD_ICON} style={[styles.controlIcon, isPhone && styles.controlIconPhone]} resizeMode="contain" />
        </Pressable>
      </View>

      <View style={[styles.progressRow, { maxWidth: contentMaxWidth }]}>
        <Text style={[styles.time, isPhone && styles.timePhone]}>{formatTime(shownPositionSeconds)}</Text>

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

        <Text style={[styles.time, isPhone && styles.timePhone]}>{formatTime(durationSeconds)}</Text>
      </View>

      <Text style={[styles.listTitle, isPhone && styles.listTitlePhone]}>Archive Files</Text>
      <View style={[styles.sortRow, { maxWidth: contentMaxWidth }]}>
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
      <ScrollView style={[styles.trackList, { maxWidth: contentMaxWidth, maxHeight: trackListMaxHeight }]} contentContainerStyle={styles.trackListContent}>
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
                  <Text style={styles.trackItemTitle}>{`"${track.title}"`}</Text>
                  <Text style={styles.trackItemMeta}>{new Date(track.createdAt).toLocaleString()}</Text>
                </View>
                <Pressable
                  style={[styles.downloadButton, isNarrowPhone && styles.downloadButtonPhone]}
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
  containerPhone: {
    paddingHorizontal: 12,
    paddingTop: 56,
    paddingBottom: 18,
  },
  title: { fontSize: 22, fontWeight: "700", color: '#ffffff', marginBottom: 18, fontFamily: "clarendon" },
  titlePhone: { marginBottom: 12 },
  subtitle: {
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitlePhone: {
    textAlign: "center",
    marginBottom: 10,
  },
  socialCornerRow: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 10,
  },
  socialCornerRowPhone: {
    top: 10,
    right: 10,
    gap: 8,
  },
  socialButton: { borderRadius: 999, overflow: "hidden" },
  spotifyButtonSpacing: { marginLeft: 2 },
  socialIcon: { width: 26, height: 26 },
  controlsRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 },
  controlsRowPhone: { gap: 12, marginBottom: 14 },
  iconButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  disabledButton: { opacity: 0.45 },
  controlIcon: { width: 30, height: 30 },
  controlIconPhone: { width: 26, height: 26 },
  playControlIcon: { width: 48, height: 48 },
  playControlIconPhone: { width: 42, height: 42 },
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
  timePhone: { width: 34, fontSize: 12 },
  listTitle: { marginTop: 18, marginBottom: 8, fontSize: 16, fontWeight: "600", color: '#ffffff' },
  listTitlePhone: { marginTop: 14, marginBottom: 7, fontSize: 15 },
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
    alignItems: "stretch",
    justifyContent: "space-between",
    gap: 10,
  },
  trackItemInfo: {
    flex: 1,
    justifyContent: "center",
  },
  trackItemSelected: {
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  trackItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  trackItemMeta: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  downloadButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignSelf: "stretch",
    justifyContent: "center",
    minWidth: 92,
  },
  downloadButtonPhone: {
    minWidth: 80,
    paddingHorizontal: 8,
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
