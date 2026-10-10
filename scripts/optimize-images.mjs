// Converts every JPG/PNG in images-src/ into responsive WebP files in assets/img/.
// Usage: npm install && npm run images
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const srcDir = path.join(root, "images-src");
const outDir = path.join(root, "assets", "img");
const widths = [480, 960];

await mkdir(outDir, { recursive: true });

const files = (await readdir(srcDir)).filter((f) => /\.(jpe?g|png)$/i.test(f));

for (const file of files) {
  const name = path.parse(file).name;
  for (const width of widths) {
    const out = path.join(outDir, `${name}-${width}.webp`);
    const info = await sharp(path.join(srcDir, file))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 74, effort: 5 })
      .toFile(out);
    console.log(`${path.relative(root, out)}  ${(info.size / 1024).toFixed(1)} KB`);
  }
}
