import fs from "fs";
import crypto from "crypto";
import Database from "better-sqlite3";
import {
  EXPANSION_TO_ID,
  HOUSE_TO_ID,
  ID_TO_EXPANSION,
  type CardKind,
  type Expansion,
  type House,
} from "../src/constants.ts";

const sqliteOutputFile = "public/card-db.sqlite";
const versionOutputFile = "public/card-db.version.json";

// Map card types to our CardKind enum
const TYPE_MAP: Record<string, CardKind> = {
  action: "Action",
  artifact: "Artifact",
  creature: "Creature",
  upgrade: "Upgrade",
  "gigantic creature base": "Creature",
  "token creature": "TokenCreature",
};

// Card types to skip
const SKIP_TYPES = new Set([
  "archon power",
  "prophecy",
  "the tide",
  "gigantic creature art",
]);

// Normalize house names to match our format
const HOUSE_MAP: Record<string, House> = {
  brobnar: "Brobnar",
  dis: "Dis",
  logos: "Logos",
  mars: "Mars",
  sanctum: "Sanctum",
  shadows: "Shadows",
  untamed: "Untamed",
  saurian: "Saurian",
  staralliance: "StarAlliance",
  "star alliance": "StarAlliance",
  unfathomable: "Unfathomable",
  ekwidon: "Ekwidon",
  geistoid: "Geistoid",
  skyborn: "Skyborn",
  keyraken: "Keyraken",
  elders: "Elders",
  ironyxrebels: "IronyxRebels",
  "ironyx rebels": "IronyxRebels",
  ouboros: "Ouboros",
  redemption: "Redemption",
  anomaly: "Anomaly",
  skybeast: "Skybeast",
};

// Skybeast card IDs (appear in AS and CC, can go in any house)
const SKYBEAST_IDS = new Set([
  "akugyo",
  "alien-puffer",
  "anvil-crawler",
  "beehemoth",
  "blue-æmberdrake",
  "colossipede",
  "falcron",
  "grinder-swarm",
  "grizzled-wyvern",
  "hungry-hippogriff",
  "icarus-20",
  "impzilla",
  "lancet",
  "malifi-dragon",
  "naja",
  "red-æmberdrake",
  "rorqual",
  "screeyan",
  "sentient-cloud",
  "titanarpon",
  "tyrannus-aquilae",
  "volax",
  "yellow-æmberdrake",
]);

// Cards that should be forced to a specific house
const FORCED_HOUSE_CARDS: Record<string, House> = {
  "exchange-officer": "StarAlliance",
};

type DatabaseCardRow = {
  card_title: string;
  card_title_en: string;
  house: string;
  card_type: string;
  front_image: string | null;
  amber: number;
  power: string | number | null;
  armor: string | number | null;
  expansion: number | null;
  is_anomaly: number;
  card_number?: string;
};

function normalizeHouse(house: string): House {
  const normalized = HOUSE_MAP[house.trim().toLowerCase()];
  if (!normalized) {
    console.warn(`Unknown house: ${house}`);
    return house as House;
  }
  return normalized;
}

function parsePowerArmor(
  val: string | number | null | undefined,
): number | undefined {
  if (val === null || val === undefined) return undefined;
  if (typeof val === "number") return val;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? undefined : parsed;
}

function normalizeTitle(title: string): string {
  return title
    .replace(/Æ/g, "AE")
    .replace(/æ/g, "ae")
    .replace(/[""]/g, '"')
    .replace(/'/g, "'")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function generateSlug(title: string): string {
  return normalizeTitle(title)
    .split(/\s+/)
    .map((part) => part.replace(/[^a-z0-9]/g, ""))
    .filter((part) => part.length > 0)
    .join("-");
}

/** Source images are PNGs; we serve (and download-convert to) WebP. */
function toWebpFilename(url: string | null): string | null {
  const basename = url?.split("/").pop();
  return basename ? basename.replace(/\.png$/i, ".webp") : null;
}

function buildCardsFromDb(sourceDbPath: string) {
  console.log(`Reading cards from source SQLite database: ${sourceDbPath}`);
  const srcDb = new Database(sourceDbPath, { readonly: true });

  const rows = srcDb
    .prepare(
      `SELECT
        card_title,
        card_title_en,
        house,
        card_type,
        front_image,
        amber,
        power,
        armor,
        expansion,
        is_anomaly,
        card_number
      FROM cards
      WHERE is_maverick = 0 AND is_non_deck = 0 AND is_enhanced = 0`,
    )
    .all() as DatabaseCardRow[];

  console.log(`Found ${rows.length} canonical card records in source DB`);

  // Map: slug -> base card info
  const cardsMap = new Map<
    string,
    {
      title: string;
      slug: string;
      type: CardKind;
      amber: number;
      power?: number;
      armor?: number;
    }
  >();

  // slug -> expansion -> house -> image filename
  const cardPrintingsMap = new Map<
    string,
    Map<Expansion, Map<House, string | null>>
  >();

  for (const row of rows) {
    if (!row.card_type) continue;
    const typeKey = row.card_type.toLowerCase();
    if (SKIP_TYPES.has(typeKey)) continue;

    const cardType = TYPE_MAP[typeKey];
    if (!cardType) {
      console.warn(
        `Unknown card type: ${row.card_type} for ${row.card_title_en || row.card_title}`,
      );
      continue;
    }

    const title = row.card_title_en || row.card_title;
    const slug = generateSlug(title);

    const amber = row.amber || 0;
    const power = parsePowerArmor(row.power);
    const armor = parsePowerArmor(row.armor);

    const expansion = row.expansion ? ID_TO_EXPANSION[row.expansion] : undefined;
    if (!expansion) {
      console.warn(
        `Unknown Master Vault expansion ID: ${row.expansion} for ${title}`,
      );
      continue;
    }

    let house: House | House[];
    let targetExpansion = expansion;

    const isSkybeast = SKYBEAST_IDS.has(slug);
    const isAnomaly =
      row.is_anomaly === 1 || expansion === "ANOMALY_EXPANSION";

    if (FORCED_HOUSE_CARDS[slug]) {
      house = FORCED_HOUSE_CARDS[slug];
    } else if (isSkybeast) {
      house = "Skybeast";
    } else if (isAnomaly) {
      house = "Anomaly";
      targetExpansion = "ANOMALY_EXPANSION";
    } else {
      house = normalizeHouse(row.house || "");
    }

    if (!cardsMap.has(slug)) {
      cardsMap.set(slug, { title, slug, type: cardType, amber, power, armor });
    } else {
      // If previously set without power/armor (e.g. from an art half or empty row), update with stats if available
      const existing = cardsMap.get(slug)!;
      if (existing.power === undefined && power !== undefined) {
        existing.power = power;
      }
      if (existing.armor === undefined && armor !== undefined) {
        existing.armor = armor;
      }
    }

    if (!cardPrintingsMap.has(slug)) {
      cardPrintingsMap.set(slug, new Map());
    }

    const expMap = cardPrintingsMap.get(slug)!;
    if (!expMap.has(targetExpansion)) {
      expMap.set(targetExpansion, new Map());
    }

    // A later row without an image never overwrites one that has an image.
    const houseMap = expMap.get(targetExpansion)!;
    const imageFile = toWebpFilename(row.front_image);
    for (const h of Array.isArray(house) ? house : [house]) {
      if (imageFile || !houseMap.has(h)) houseMap.set(h, imageFile);
    }
  }

  srcDb.close();

  console.log(`\nProcessed ${cardsMap.size} unique cards`);

  // Ensure public directory exists
  if (!fs.existsSync("public")) {
    fs.mkdirSync("public", { recursive: true });
  }

  if (fs.existsSync(sqliteOutputFile)) {
    fs.unlinkSync(sqliteOutputFile);
  }

  const db = new Database(sqliteOutputFile);
  db.pragma("page_size = 1024");
  db.pragma("journal_mode = DELETE");

  // Create Schema:
  // 1. cards (integer primary key; slug is a unique lookup key)
  // 2. card_printings WITHOUT ROWID (primary key expansion_id, house_id, card_id)
  // The table is small enough that scans are cheap, so only indexes the
  // queries actually benefit from are kept (each one costs download size).
  db.exec(`
    CREATE TABLE cards (
      id INTEGER PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      title_normalized TEXT NOT NULL,
      type TEXT NOT NULL,
      amber INTEGER NOT NULL DEFAULT 0,
      power INTEGER,
      armor INTEGER
    );

    CREATE TABLE card_printings (
      expansion_id INTEGER NOT NULL,
      house_id INTEGER NOT NULL,
      card_id INTEGER NOT NULL,
      image_file TEXT,
      PRIMARY KEY (expansion_id, house_id, card_id),
      FOREIGN KEY (card_id) REFERENCES cards(id)
    ) WITHOUT ROWID;

    CREATE INDEX idx_printings_card ON card_printings(card_id);
  `);

  const insertCard = db.prepare(`
    INSERT INTO cards (slug, title, title_normalized, type, amber, power, armor)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPrinting = db.prepare(`
    INSERT INTO card_printings (expansion_id, house_id, card_id, image_file)
    VALUES (?, ?, ?, ?)
  `);

  const sortedCards = Array.from(cardsMap.values()).sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  const populate = db.transaction(() => {
    for (const card of sortedCards) {
      const cardId = Number(
        insertCard.run(
          card.slug,
          card.title,
          normalizeTitle(card.title),
          card.type,
          card.amber ?? 0,
          card.power ?? null,
          card.armor ?? null,
        ).lastInsertRowid,
      );

      for (const [exp, houseMap] of cardPrintingsMap.get(card.slug) ?? []) {
        const expId = EXPANSION_TO_ID[exp];
        for (const [h, imageFile] of houseMap) {
          const houseId = HOUSE_TO_ID[h];
          if (!houseId) {
            console.warn(`No ID found for house: ${h}`);
            continue;
          }
          insertPrinting.run(expId, houseId, cardId, imageFile);
        }
      }
    }
  });

  populate();

  db.exec("VACUUM;");
  db.close();

  const sqliteBuffer = fs.readFileSync(sqliteOutputFile);
  const checksum = crypto
    .createHash("sha256")
    .update(sqliteBuffer)
    .digest("hex");

  // Write version metadata
  const version = {
    version: new Date().toISOString(),
    cardCount: cardsMap.size,
    checksum: checksum,
    sizeBytes: sqliteBuffer.length,
  };
  fs.writeFileSync(versionOutputFile, JSON.stringify(version, null, 2));

  console.log(
    `\n✅ Written ${cardsMap.size} cards to SQLite database: ${sqliteOutputFile}`,
  );
  console.log(
    `   Database size: ${(sqliteBuffer.length / 1024).toFixed(1)} KB`,
  );
  console.log(`   Checksum: ${checksum}`);
  console.log(`✅ Written version metadata to ${versionOutputFile}`);
}

const sourceDbPath =
  process.env.SOURCE_DB_PATH ||
  (fs.existsSync("keyforge.db") ? "keyforge.db" : null);

if (!sourceDbPath || !fs.existsSync(sourceDbPath)) {
  console.error(
    `Source database not found. Set SOURCE_DB_PATH or place keyforge.db in the project root.`,
  );
  process.exit(1);
}

try {
  buildCardsFromDb(sourceDbPath);
} catch (error) {
  console.error("Error building cards:", error);
  process.exit(1);
}
