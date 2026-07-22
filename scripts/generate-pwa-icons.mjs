import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "public/MoneyKit-icon.svg");
const svg = await readFile(svgPath);

const outputs = [
  { path: join(root, "public/icon-192.png"), size: 192 },
  { path: join(root, "public/icon-512.png"), size: 512 },
  { path: join(root, "public/apple-touch-icon.png"), size: 180 },
  { path: join(root, "app/apple-icon.png"), size: 180 },
];

for (const { path, size } of outputs) {
  await mkdir(dirname(path), { recursive: true });
  await sharp(svg).resize(size, size).png().toFile(path);
}

await writeFile(join(root, "app/icon.svg"), svg);
console.log("Generated PWA icons from MoneyKit-icon.svg");
