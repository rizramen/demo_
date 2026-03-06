import type { AudioSource } from "expo-audio";

export type TrackSection = "vault" | "archive";

export type Track = {
  id: string;
  title: string;
  source: AudioSource;
  section: TrackSection;
  filename?: string;
  createdAt: string;
};

export type TrackSeed = Omit<Track, "title"> & {
  title?: string;
};
