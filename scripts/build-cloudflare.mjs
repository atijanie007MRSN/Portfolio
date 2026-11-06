import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(projectRoot, "dist");
const optimizedVideo = join(projectRoot, "cloudflare-assets", "Semaine pro.mp4");
const maxAssetSize = 25 * 1024 * 1024;
const publicExtensions = new Set([".css", ".html", ".js", ".mp4", ".pdf", ".png", ".svg"]);
const relativeOutput = relative(projectRoot, outputDirectory);

if (!relativeOutput || relativeOutput.startsWith(`..${sep}`)) {
  throw new Error("Cloudflare output directory must remain inside the project.");
}

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });

function copyPublicFile(source, destination) {
  const { size } = statSync(source);
  if (size > maxAssetSize) {
    throw new Error(`Cloudflare Pages asset exceeds 25 MiB: ${relative(projectRoot, source)}`);
  }

  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}

for (const entry of readdirSync(projectRoot, { withFileTypes: true })) {
  if (
    !entry.isFile() ||
    entry.name === "Semaine pro.mp4" ||
    !publicExtensions.has(extname(entry.name).toLowerCase())
  ) {
    continue;
  }

  const source = join(projectRoot, entry.name);
  copyPublicFile(source, join(outputDirectory, entry.name));
}

for (const entry of readdirSync(join(projectRoot, "assets"), { withFileTypes: true })) {
  if (!entry.isFile()) {
    throw new Error(`Unexpected nested asset directory: ${entry.name}`);
  }

  const source = join(projectRoot, "assets", entry.name);
  copyPublicFile(source, join(outputDirectory, "assets", entry.name));
}

copyPublicFile(
  optimizedVideo,
  join(outputDirectory, "Semaine pro.mp4"),
);

const fileCount = readdirSync(outputDirectory, { recursive: true }).filter((entry) =>
  statSync(join(outputDirectory, entry)).isFile(),
).length;
console.log(`Prepared ${fileCount} static files in ${relative(projectRoot, outputDirectory)}.`);
