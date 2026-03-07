import type { Track } from "@/src/types/track";

const GITHUB_OWNER = "rizramen";
const GITHUB_REPO = "demo_";
const GITHUB_BRANCH = "main";

export function getTrackDownloadUrl(track: Pick<Track, "section" | "filename">): string | null {
  if (!track.filename) {
    return null;
  }

  // Keep section-aware paths in sync with how files are stored in the repo.
  const pathSegments =
    track.section === "archive"
      ? ["assets", "demo_tracks", "ARCHIVE", track.filename]
      : ["assets", "demo_tracks", track.filename];

  // Encode each segment so spaces/special characters remain valid in the URL.
  const encodedPath = pathSegments.map((segment) => encodeURIComponent(segment)).join("/");
  return `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/raw/refs/heads/${GITHUB_BRANCH}/${encodedPath}`;
}
