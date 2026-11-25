import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARD_DB_PATH = path.join(__dirname, "../public/card-db.sqlite");
const OUTPUT_DIR = path.join(__dirname, "../public/card-images");
const SOURCE_URL =
  "https://mastervault-storage-prod.s3.amazonaws.com/media/card_front/en/";
const CARD_WIDTH = 300;
const CARD_HEIGHT = 420;
const CONCURRENCY = 10;
const WEBP_QUALITY = 80;

type PrintingRow = {
  image_file: string;
  card_id: number;
  house: string;
};

/** `{expansion}_{number}_{hash}_{lang}.webp` -> `{hash}` */
function assetHash(filename: string): string | undefined {
  return filename.split("_")[2];
}

/**
 * Master Vault builds `front_image` URLs from a pattern when a card record is
 * inserted; it never checks that the file was actually uploaded to S3. Special
 * reprint sets (e.g. Menagerie 722, Unchained 601) have records and URLs but
 * no rendered images, so those URLs are missing. The reprint shares its asset
 * hash with the original printing (700_068_<hash>_en.png resolves,
 * 722_146_<hash>_en.png doesn't), so the original's image is the correct art.
 *
 * Returns, per image file, the other files to try when it's missing, in order:
 *   1. files with the same asset hash
 *   2. files for the same card + house from other printings, earliest first
 */
function buildFallbacks(rows: PrintingRow[]): Map<string, string[]> {
  const byHash = new Map<string, Set<string>>();
  const byCardHouse = new Map<string, Set<string>>();
  const cardHousesByFile = new Map<string, Set<string>>();

  const add = <K, V>(map: Map<K, Set<V>>, key: K, value: V) => {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(value);
  };

  // Rows arrive ordered by expansion_id, so Sets keep earliest printing first.
  for (const { image_file, card_id, house } of rows) {
    const cardHouse = `${card_id}:${house}`;
    const hash = assetHash(image_file);
    if (hash) add(byHash, hash, image_file);
    add(byCardHouse, cardHouse, image_file);
    add(cardHousesByFile, image_file, cardHouse);
  }

  const fallbacks = new Map<string, string[]>();
  for (const [file, cardHouses] of cardHousesByFile) {
    const hash = assetHash(file);
    const candidates = new Set<string>([
      ...(hash ? (byHash.get(hash) ?? []) : []),
      ...[...cardHouses].flatMap((ch) => [...byCardHouse.get(ch)!]),
    ]);
    candidates.delete(file);
    fallbacks.set(file, [...candidates]);
  }
  return fallbacks;
}

/**
 * Returns the PNG bytes, or null if the object doesn't exist. The bucket
 * doesn't grant ListBucket, so S3 answers 403 (not 404) for missing keys.
 */
async function fetchSourcePng(filename: string): Promise<Buffer | null> {
  const url = `${SOURCE_URL}${filename.replace(/\.webp$/i, ".png")}`;
  const res = await fetch(url);
  if (res.status === 403 || res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Gigantic creatures are named `{exp}_{num}_{baseHash}+{artHash}_{lang}.webp`
 * (see build-cards.ts). Each half is rotated 90° counter-clockwise, then the
 * art half is stacked on top of the base half. The result is scaled back to
 * the standard card size so the rest of the app can treat it like any card.
 */
async function fetchGiganticPng(filename: string): Promise<Buffer | null> {
  const [exp, num, hashes, lang] = filename.replace(/\.webp$/i, "").split("_");
  const [baseHash, artHash] = hashes.split("+");
  const [basePng, artPng] = await Promise.all([
    fetchSourcePng(`${exp}_${num}_${baseHash}_${lang}.webp`),
    fetchSourcePng(`${exp}_${num}_${artHash}_${lang}.webp`),
  ]);
  if (!basePng || !artPng) return null;

  const rotate = async (png: Buffer) =>
    sharp(png).rotate(-90).png().toBuffer({ resolveWithObject: true });
  const [base, art] = await Promise.all([rotate(basePng), rotate(artPng)]);

  const width = Math.max(base.info.width, art.info.width);
  const stacked = await sharp({
    create: {
      width,
      height: art.info.height + base.info.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([
      { input: art.data, left: 0, top: 0 },
      { input: base.data, left: 0, top: art.info.height },
    ])
    .png()
    .toBuffer();
  // Resize in a second pass: sharp applies resize before composite.
  return sharp(stacked).resize(CARD_WIDTH, CARD_HEIGHT).png().toBuffer();
}

function fetchPng(filename: string): Promise<Buffer | null> {
  return assetHash(filename)?.includes("+")
    ? fetchGiganticPng(filename)
    : fetchSourcePng(filename);
}

/**
 * Saves `filename` as WebP, substituting a fallback's image if the original
 * is missing (see buildFallbacks). Returns the file the image came from.
 */
async function downloadAsWebp(
  filename: string,
  fallbacks: string[],
  dest: string,
): Promise<string> {
  let source = filename;
  let png = await fetchPng(source);
  for (const fallback of fallbacks) {
    if (png) break;
    source = fallback;
    png = await fetchPng(source);
  }
  if (!png) throw new Error("not found and no fallback available");

  // Write via a temp file so an interrupted run never leaves a partial image
  // that the exists-check would later treat as cached.
  const tmp = `${dest}.tmp`;
  await sharp(png).webp({ quality: WEBP_QUALITY }).toFile(tmp);
  fs.renameSync(tmp, dest);
  return source;
}

async function downloadCardImages() {
  if (!fs.existsSync(CARD_DB_PATH)) {
    console.error(`Card DB not found at ${CARD_DB_PATH}. Run build:cards first.`);
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const db = new Database(CARD_DB_PATH, { readonly: true });
  const rows = db
    .prepare(
      `SELECT image_file, card_id, house FROM card_printings
       WHERE image_file IS NOT NULL ORDER BY expansion_id`,
    )
    .all() as PrintingRow[];
  db.close();

  const fallbacks = buildFallbacks(rows);
  const filenames = [...fallbacks.keys()];
  const validFilenames = new Set(filenames);
  console.log(`Found ${filenames.length} unique card images`);

  let deleted = 0;
  for (const file of fs.readdirSync(OUTPUT_DIR)) {
    if (!validFilenames.has(file)) {
      const filePath = path.join(OUTPUT_DIR, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
        deleted++;
      }
    }
  }
  if (deleted > 0) {
    console.log(`Pruned ${deleted} unreferenced images from cache.`);
  }

  let downloaded = 0;
  let substituted = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < filenames.length; i += CONCURRENCY) {
    const batch = filenames.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (filename) => {
        const dest = path.join(OUTPUT_DIR, filename);

        if (fs.existsSync(dest)) {
          skipped++;
          return;
        }

        try {
          const source = await downloadAsWebp(
            filename,
            fallbacks.get(filename)!,
            dest,
          );
          downloaded++;
          if (source !== filename) {
            substituted++;
            console.warn(`\nSubstituted ${filename} <- ${source}`);
          }
        } catch (err) {
          failed++;
          console.error(`\nFailed: ${filename} — ${(err as Error).message}`);
        }
      }),
    );
    process.stdout.write(
      `\rProgress: ${i + batch.length}/${filenames.length} (${downloaded} downloaded, ${skipped} cached, ${failed} failed)`,
    );
  }

  console.log(
    `\n\n✅ Done. ${downloaded} downloaded (${substituted} via fallback), ${skipped} already cached, ${deleted} pruned, ${failed} failed.`,
  );
  if (failed > 0) process.exit(1);
}

downloadCardImages();
