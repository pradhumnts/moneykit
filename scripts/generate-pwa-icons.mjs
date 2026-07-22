import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "public/MoneyKit-icon.svg");
const svg = await readFile(svgPath);

// Extra inset so home-screen icons keep comfortable white margins.
const PADDING_RATIO = 0.04;

const outputs = [
  { path: join(root, "public/icon-192.png"), size: 192 },
  { path: join(root, "public/icon-512.png"), size: 512 },
  { path: join(root, "public/apple-touch-icon.png"), size: 180 },
  { path: join(root, "app/apple-icon.png"), size: 180 },
];

for (const { path, size } of outputs) {
  await mkdir(dirname(path), { recursive: true });

  const inset = Math.round(size * PADDING_RATIO);
  const logoSize = size - inset * 2;
  const logo = await sharp(svg).resize(logoSize, logoSize).png().toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: logo, left: inset, top: inset }])
    .png()
    .toFile(path);
}

await writeFile(join(root, "app/icon.svg"), svg);
console.log("Generated PWA icons from MoneyKit-icon.svg");
