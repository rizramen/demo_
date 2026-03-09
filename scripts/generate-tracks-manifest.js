const fs = require("fs/promises");
const path = require("path");

const SUPPORTED_EXTENSIONS = new Set([".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"]);

function toTrackId(relativePath) {
  // Derive a stable, URL-friendly id from the relative file path.
  const base = relativePath.replace(/\.[^/.]+$/, "");
  const id = base
    .toLowerCase()
    .replace(/[\\/]+/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return id || "track";
}

function jsString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function collectAudioFiles(rootDir, currentDir = rootDir) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      // Recurse through nested folders (including ARCHIVE).
      const nestedFiles = await collectAudioFiles(rootDir, fullPath);
      files.push(...nestedFiles);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;

    const stats = await fs.stat(fullPath);
    const relativePath = path.relative(rootDir, fullPath);
    const normalizedPath = relativePath.split(path.sep).join("/");
    const pathSegments = normalizedPath.toLowerCase().split("/");
    // Infer the section directly from folder structure to avoid manual metadata.
    const section = pathSegments.includes("archive")
      ? "archive"
      : pathSegments.includes("beats")
        ? "beats"
        : "vault";

    files.push({
      id: toTrackId(normalizedPath),
      filename: entry.name,
      relativePath: normalizedPath,
      section,
      createdAt: stats.mtime.toISOString(),
    });
  }

  return files;
}

async function generateTracksManifest() {
  const projectRoot = path.resolve(__dirname, "..");
  const tracksDir = path.join(projectRoot, "assets", "demo_tracks");
  const outputPath = path.join(projectRoot, "src", "data", "tracks.generated.ts");
  const fileEntries = await collectAudioFiles(tracksDir);

  // Keep newest files first to match the default in-app ordering.
  fileEntries.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const lines = [];
  lines.push('import type { TrackSeed } from "@/src/types/track";');
  lines.push("");
  lines.push("export const GENERATED_TRACKS: TrackSeed[] = [");

  for (const entry of fileEntries) {
    lines.push("  {");
    lines.push(`    id: "${jsString(entry.id)}",`);
    lines.push(`    filename: "${jsString(entry.filename)}",`);
    lines.push(`    section: "${entry.section}",`);
    lines.push(`    source: require("../../assets/demo_tracks/${jsString(entry.relativePath)}"),`);
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
