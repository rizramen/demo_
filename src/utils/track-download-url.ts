import type { Track } from "@/src/types/track";

const GITHUB_OWNER = "rizramen";
const GITHUB_REPO = "demo_";
const GITHUB_BRANCH = "main";

export function getTrackDownloadUrl(track: Pick<Track, "section" | "filename">): string | null {
  if (!track.filename) {
    return null;
  }

  const pathSegments =
    track.section === "archive"
      ? ["assets", "demo_tracks", "ARCHIVE", track.filename]
      : ["assets", "demo_tracks", track.filename];

  const encodedPath = pathSegments.map((segment) => encodeURIComponent(segment)).join("/");
  return `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/raw/refs/heads/${GITHUB_BRANCH}/${encodedPath}`;
}
