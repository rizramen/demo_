import type { AudioSource } from "expo-audio";

export type Track = {
  id: string;
  title: string;
  source: AudioSource;
  filename?: string;
  createdAt: string;
};

export type TrackSeed = Omit<Track, "title"> & {
  title?: string;
};
