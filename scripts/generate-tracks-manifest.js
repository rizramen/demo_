const fs = require("fs/promises");
const path = require("path");

const SUPPORTED_EXTENSIONS = new Set([".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"]);

function toTrackId(filename) {
  const base = filename.replace(/\.[^/.]+$/, "");
  const id = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return id || "track";
}

function jsString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function generateTracksManifest() {
  const projectRoot = path.resolve(__dirname, "..");
  const tracksDir = path.join(projectRoot, "assets", "demo_tracks");
  const outputPath = path.join(projectRoot, "src", "data", "tracks.generated.ts");

  const dirEntries = await fs.readdir(tracksDir, { withFileTypes: true });

  const fileEntries = await Promise.all(
    dirEntries
      .filter((entry) => entry.isFile())
      .filter((entry) => !entry.name.startsWith("."))
      .filter((entry) => SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .map(async (entry) => {
        const fullPath = path.join(tracksDir, entry.name);
        const stats = await fs.stat(fullPath);

        return {
          filename: entry.name,
          createdAt: stats.mtime.toISOString(),
          id: toTrackId(entry.name),
        };
      })
  );

  fileEntries.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const lines = [];
  lines.push('import type { TrackSeed } from "@/src/types/track";');
  lines.push("");
  lines.push("export const GENERATED_TRACKS: TrackSeed[] = [");

  for (const entry of fileEntries) {
    lines.push("  {");
    lines.push(`    id: "${jsString(entry.id)}",`);
    lines.push(`    filename: "${jsString(entry.filename)}",`);
    lines.push(`    source: require("../../assets/demo_tracks/${jsString(entry.filename)}"),`);
    lines.push(`    createdAt: "${entry.createdAt}",`);
    lines.push("  },");
  }

  lines.push("];\n");

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${lines.join("\n")}`, "utf8");

  console.log(`Generated ${outputPath} with ${fileEntries.length} track(s).`);
}

generateTracksManifest().catch((error) => {
  console.error("Failed to generate tracks manifest:");
  console.error(error);
  process.exit(1);
});
