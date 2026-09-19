// Gera os ícones PWA (Android/iOS/Google TV) a partir do isotipo do
// DriveStream. Executado uma vez via `node scripts/generate-icons.mjs`;
// os PNGs resultantes são versionados em public/icons.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

function triangleSvg({ size, canvasFill, scale, background }) {
  const cx = size / 2;
  const half = (size * scale) / 2;
  const top = cx - half * 1.05;
  const bottom = cx + half * 0.95;
  const left = cx - half;
  const right = cx + half;

  const playScale = scale / 0.875;
  const playW = 13 * (size / 32) * playScale;
  const playH = 9 * (size / 32) * playScale;
  const playX = cx - playW / 2.6;
  const playY = cx - playH / 2;

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="${left}" y1="${bottom}" x2="${right}" y2="${top}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#06B6D4" />
      <stop offset="50%" stop-color="#6366F1" />
      <stop offset="100%" stop-color="#A855F7" />
    </linearGradient>
    <mask id="play">
      <rect width="${size}" height="${size}" fill="white" />
      <path d="M${playX} ${playY} L${playX + playW} ${playY + playH / 2} L${playX} ${playY + playH} Z" fill="black" />
    </mask>
  </defs>
  ${background ? `<rect width="${size}" height="${size}" fill="${canvasFill}" />` : ""}
  <path d="M${cx} ${top} L${right} ${bottom} L${left} ${bottom} Z" fill="url(#g)" mask="url(#play)" stroke-linejoin="round" />
</svg>`;
}

const targets = [
  // Ícones padrão (purpose "any"): pouco respiro, ocupam quase todo o canvas.
  { name: "icon-192.png", size: 192, scale: 0.72, background: true },
  { name: "icon-512.png", size: 512, scale: 0.72, background: true },
  // Ícone maskable: conteúdo dentro da "safe zone" central (~80%) para que
  // Android/Google TV possam recortar em círculo/squircle sem cortar o logo.
  { name: "icon-maskable-512.png", size: 512, scale: 0.5, background: true },
  // Apple touch icon: iOS não suporta transparência/máscara própria.
  { name: "apple-touch-icon.png", size: 180, scale: 0.68, background: true },
];

for (const target of targets) {
  const svg = triangleSvg({
    size: target.size,
    canvasFill: "#09090b",
    scale: target.scale,
    background: target.background,
  });
  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(outDir, target.name));
  console.log(`Gerado ${target.name}`);
}
