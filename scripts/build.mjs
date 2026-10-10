// Copies only the public website files into dist/ for deployment.
// Usage: npm run build
import { cp, rm, mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const publicFiles = ["index.html", "robots.txt", "assets"];

await rm(dist, { recursive: true, force: true });
await mkdir(dist);

for (const file of publicFiles) {
  await cp(path.join(root, file), path.join(dist, file), { recursive: true });
}

console.log(`Built ${publicFiles.join(", ")} -> dist/`);
