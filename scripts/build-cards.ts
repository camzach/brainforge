import fs from "fs";
import path from "path";
import crypto from "crypto";
import Database from "better-sqlite3";
import {
  EXPANSION_TO_ID,
  HOUSE_TO_ID,
  type Expansion,
  type House,
} from "../src/constants.ts";
import type { CardKind } from "../src/types.ts";

const KEYTEKI_PACKS_DIR = "./packs";
const sqliteOutputFile = "public/card-db.sqlite";
const versionOutputFile = "public/card-db.version.json";

// Map Master Vault numeric expansion codes to our expansion enum values
const MV_EXPANSION_MAP: Record<number, Expansion> = {
  341: "CALL_OF_THE_ARCHONS",
  435: "AGE_OF_ASCENSION",
  452: "WORLDS_COLLIDE",
  453: "ANOMALY_EXPANSION",
  479: "MASS_MUTATION",
  496: "DARK_TIDINGS",
  600: "WINDS_OF_EXCHANGE",
  609: "VAULT_MASTERS_2023",
  700: "GRIM_REMINDERS",
  701: "MENAGERIE_2024",
  800: "AEMBER_SKIES",
  801: "TOKENS_OF_CHANGE",
  802: "MORE_MUTATION",
  803: "DISCOVERY",
  900: "PROPHETIC_VISIONS",
  901: "DRACONIAN_MEASURES",
  939: "VAULT_MASTERS_2025",
  940: "CRUCIBLE_CLASH",
};

// Map KeyTeki expansion codes to our expansion enum values
const EXPANSION_MAP: Record<string, Expansion> = {
  CotA: "CALL_OF_THE_ARCHONS",
  AoA: "AGE_OF_ASCENSION",
  WC: "WORLDS_COLLIDE",
  MM: "MASS_MUTATION",
  DT: "DARK_TIDINGS",
  WoE: "WINDS_OF_EXCHANGE",
  GR: "GRIM_REMINDERS",
  MoMu: "MORE_MUTATION",
  VM25: "VAULT_MASTERS_2025",
  AS: "AEMBER_SKIES",
  ToC: "TOKENS_OF_CHANGE",
  DM: "DRACONIAN_MEASURES",
  CC: "CRUCIBLE_CLASH",
  PV: "PROPHETIC_VISIONS",
  MG24: "MENAGERIE_2024",
};

// Map card types to our CardKind enum
const TYPE_MAP: Record<string, CardKind> = {
  action: "Action",
  artifact: "Artifact",
  creature: "Creature",
  upgrade: "Upgrade",
  "token creature": "TokenCreature",
  "token-creature": "TokenCreature",
  tokencreature: "TokenCreature",
  token: "TokenCreature",
};

// Card types to skip (not needed for the app)
const SKIP_TYPES = new Set(["archon power", "prophecy", "the tide"]);

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
  unfathomable: "Unfathomable",
  ekwidon: "Ekwidon",
  geistoid: "Geistoid",
  skyborn: "Skyborn",
  keyraken: "Keyraken",
  elders: "Elders",
  ironyxrebels: "IronyxRebels",
  ouboros: "Ouboros",
  redemption: "Redemption",
};

// Houses available in each expansion (for Revenant/Skybeast/Anomaly cards that can go in any house)
const EXPANSION_HOUSES: Record<string, House[]> = {
  GR: [
    "Brobnar",
    "Ekwidon",
    "Geistoid",
    "Mars",
    "StarAlliance",
    "Unfathomable",
    "Untamed",
  ],
  AS: ["Brobnar", "Dis", "Ekwidon", "Geistoid", "Logos", "Mars", "Skyborn"],
  CC: ["Brobnar", "Dis", "Mars", "Sanctum", "Saurian", "Skyborn", "Untamed"],
  WC: [
    "Brobnar",
    "Dis",
    "Logos",
    "Saurian",
    "Shadows",
    "StarAlliance",
    "Untamed",
  ],
  WoE: [
    "Brobnar",
    "Ekwidon",
    "Mars",
    "Sanctum",
    "Saurian",
    "StarAlliance",
    "Unfathomable",
  ],
  PV: [
    "Dis",
    "Logos",
    "Redemption",
    "Sanctum",
    "Saurian",
    "Shadows",
    "StarAlliance",
    "Untamed",
  ],
  VM25: [
    "Ekwidon",
    "Geistoid",
    "Logos",
    "Mars",
    "Saurian",
    "Shadows",
    "Unfathomable",
  ],
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

// Anomaly expansion ID (cards that can go in any house)
const ANOMALY_EXPANSION_ID = 453;

// Cards that should be forced to a specific house (overrides KeyTeki data)
const FORCED_HOUSE_CARDS: Record<string, House> = {
  "exchange-officer": "StarAlliance",
};

type KeytekiCard = {
  name: string;
  type: string;
  amber?: number;
  power?: number;
  armor?: number;
  house?: string;
  id?: string;
  number?: string;
  expansion?: number;
}

type TransformedAppearance = {
  title: string;
  slug: string;
  type: CardKind;
  amber: number;
  power?: number;
  armor?: number;
  house: House | House[];
  expansion: Expansion;
}

function normalizeHouse(house: string): House {
  const normalized = HOUSE_MAP[house.toLowerCase()];
  if (!normalized) {
    console.warn(`Unknown house: ${house}`);
    return house as House;
  }
  return normalized;
}

function readExpansionFile(filename: string): { name: string; cards: KeytekiCard[] } {
  const filePath = path.join(KEYTEKI_PACKS_DIR, filename);
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content);
}

function transformCard(keytekiCard: KeytekiCard, expansionCode: string): TransformedAppearance | null {
  if (SKIP_TYPES.has(keytekiCard.type)) {
    return null;
  }

  const cardType = TYPE_MAP[keytekiCard.type];
  if (!cardType) {
    console.warn(
      `Unknown card type: ${keytekiCard.type} for card ${keytekiCard.name}`,
    );
    return null;
  }

  const slug = keytekiCard.name
    .toLowerCase()
    .replace(/æ/g, "ae")
    .split(/\s+/)
    .map((part) => part.replace(/[^a-z0-9]/g, ""))
    .filter((part) => part.length > 0)
    .join("-");

  const expansion = EXPANSION_MAP[expansionCode];
  if (!expansion) {
    return null;
  }

  if (FORCED_HOUSE_CARDS[slug]) {
    return {
      title: keytekiCard.name,
      slug,
      type: cardType,
      amber: keytekiCard.amber || 0,
      power: keytekiCard.power || undefined,
      armor: keytekiCard.armor || undefined,
      house: FORCED_HOUSE_CARDS[slug],
      expansion,
    };
  }

  const isRevenant = expansionCode === "GR" && keytekiCard.number?.startsWith("R");
  const isSkybeast = keytekiCard.id ? SKYBEAST_IDS.has(keytekiCard.id) : false;
  const isAnomaly = keytekiCard.expansion === ANOMALY_EXPANSION_ID;

  let house: House | House[];
  let targetExpansion = expansion;

  if (isSkybeast) {
    house = "Skybeast";
  } else if (isAnomaly) {
    house = "Anomaly";
    targetExpansion = "ANOMALY_EXPANSION";
  } else if (isRevenant && EXPANSION_HOUSES[expansionCode]) {
    house = EXPANSION_HOUSES[expansionCode];
  } else {
    house = normalizeHouse(keytekiCard.house || "");
  }

  return {
    title: keytekiCard.name,
    slug,
    type: cardType,
    amber: keytekiCard.amber || 0,
    power: keytekiCard.power || undefined,
    armor: keytekiCard.armor || undefined,
    house,
    expansion: targetExpansion,
  };
}

type DatabaseCardRow = {
  card_title_en: string;
  house: string;
  card_type: string;
  amber: number;
  power: string | number | null;
  armor: string | number | null;
  expansion: number | null;
  is_anomaly: number;
  card_number?: string;
  id?: string;
};

function parsePowerArmor(val: string | number | null | undefined): number | undefined {
  if (val === null || val === undefined) return undefined;
  if (typeof val === "number") return val;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? undefined : parsed;
}

function processSqliteSource(
  sourceDbPath: string,
  cardsMap: Map<string, { title: string; slug: string; type: CardKind; amber: number; power?: number; armor?: number }>,
  cardPrintingsMap: Map<string, Map<Expansion, Set<House>>>,
) {
  console.log(`Reading cards from SQLite source: ${sourceDbPath}`);
  const srcDb = new Database(sourceDbPath, { readonly: true });

  const rows = srcDb
    .prepare(
      `SELECT
        card_title_en,
        house,
        card_type,
        amber,
        power,
        armor,
        expansion,
        is_anomaly,
        card_number,
        id
      FROM cards
      WHERE is_maverick = 0 AND is_non_deck = 0 AND is_enhanced = 0`,
    )
    .all() as DatabaseCardRow[];

  console.log(`Found ${rows.length} canonical card records in source DB`);

  for (const row of rows) {
    if (!row.card_type) continue;
    const typeKey = row.card_type.toLowerCase();
    if (SKIP_TYPES.has(typeKey)) continue;

    const cardType = TYPE_MAP[typeKey];
    if (!cardType) {
      console.warn(`Unknown card type: ${row.card_type} for ${row.card_title_en}`);
      continue;
    }

    const title = row.card_title_en;
    const slug = title
      .toLowerCase()
      .replace(/æ/g, "ae")
      .split(/\s+/)
      .map((part) => part.replace(/[^a-z0-9]/g, ""))
      .filter((part) => part.length > 0)
      .join("-");

    const amber = row.amber || 0;
    const power = parsePowerArmor(row.power);
    const armor = parsePowerArmor(row.armor);

    const expansion = row.expansion ? MV_EXPANSION_MAP[row.expansion] : undefined;
    if (!expansion) {
      console.warn(`Unknown Master Vault expansion ID: ${row.expansion} for ${title}`);
      continue;
    }

    let house: House | House[];
    let targetExpansion = expansion;

    const isSkybeast = row.id ? SKYBEAST_IDS.has(row.id) : false;
    const isAnomaly = row.is_anomaly === 1 || row.expansion === ANOMALY_EXPANSION_ID;

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
    }

    if (!cardPrintingsMap.has(slug)) {
      cardPrintingsMap.set(slug, new Map());
    }

    const expMap = cardPrintingsMap.get(slug)!;
    if (!expMap.has(targetExpansion)) {
      expMap.set(targetExpansion, new Set());
    }

    const houseSet = expMap.get(targetExpansion)!;
    if (Array.isArray(house)) {
      for (const h of house) houseSet.add(h);
    } else {
      houseSet.add(house);
    }
  }

  srcDb.close();
}

function processPacksDirectory(
  cardsMap: Map<string, { title: string; slug: string; type: CardKind; amber: number; power?: number; armor?: number }>,
  cardPrintingsMap: Map<string, Map<Expansion, Set<House>>>,
) {
  console.log("Reading KeyTeki expansion files...");

  const expansionFiles = fs
    .readdirSync(KEYTEKI_PACKS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  console.log(
    `Found ${expansionFiles.length} expansion files:`,
    expansionFiles.join(", "),
  );

  for (const filename of expansionFiles) {
    const expansionCode = filename.replace(".json", "");
    const expansionData = readExpansionFile(filename);

    console.log(
      `Processing ${expansionData.name} (${expansionCode}): ${expansionData.cards.length} cards`,
    );

    for (const keytekiCard of expansionData.cards) {
      const transformed = transformCard(keytekiCard, expansionCode);
      if (!transformed) continue;

      const { slug, title, type, amber, power, armor, house, expansion } = transformed;

      if (!cardsMap.has(slug)) {
        cardsMap.set(slug, { title, slug, type, amber, power, armor });
      }

      if (!cardPrintingsMap.has(slug)) {
        cardPrintingsMap.set(slug, new Map());
      }

      const expMap = cardPrintingsMap.get(slug)!;
      if (!expMap.has(expansion)) {
        expMap.set(expansion, new Set());
      }

      const houseSet = expMap.get(expansion)!;
      if (Array.isArray(house)) {
        for (const h of house) houseSet.add(h);
      } else {
        houseSet.add(house);
      }
    }
  }
}

function main() {
  // Map: slug -> Map<expansion, Set<house>>
  const cardPrintingsMap = new Map<string, Map<Expansion, Set<House>>>();
  // Map: slug -> base card info
  const cardsMap = new Map<string, { title: string; slug: string; type: CardKind; amber: number; power?: number; armor?: number }>();

  const sourceDbPath =
    process.env.SOURCE_DB_PATH ||
    (fs.existsSync("keyforge-source.db") ? "keyforge-source.db" : null) ||
    (fs.existsSync("test-source.db") ? "test-source.db" : null);

  if (sourceDbPath && fs.existsSync(sourceDbPath)) {
    processSqliteSource(sourceDbPath, cardsMap, cardPrintingsMap);
  } else if (fs.existsSync(KEYTEKI_PACKS_DIR)) {
    processPacksDirectory(cardsMap, cardPrintingsMap);
  } else {
    console.error(
      "No card source found. Please provide SOURCE_DB_PATH or ensure packs/ directory exists.",
    );
    process.exit(1);
  }

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
  // 1. cards (primary key slug)
  // 2. card_printings WITHOUT ROWID (primary key expansion_id, house_id, card_slug)
  db.exec(`
    CREATE TABLE cards (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      amber INTEGER NOT NULL DEFAULT 0,
      power INTEGER,
      armor INTEGER
    );

    CREATE TABLE card_printings (
      expansion_id INTEGER NOT NULL,
      house_id INTEGER NOT NULL,
      card_slug TEXT NOT NULL,
      PRIMARY KEY (expansion_id, house_id, card_slug),
      FOREIGN KEY (card_slug) REFERENCES cards(slug)
    ) WITHOUT ROWID;

    CREATE INDEX idx_printings_card ON card_printings(card_slug);
    CREATE INDEX idx_printings_house ON card_printings(house_id);
    CREATE INDEX idx_cards_title ON cards(title);
    CREATE INDEX idx_cards_type ON cards(type);
    CREATE INDEX idx_cards_slug_type ON cards(slug, type);
  `);

  const insertCard = db.prepare(`
    INSERT INTO cards (slug, title, type, amber, power, armor)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertPrinting = db.prepare(`
    INSERT INTO card_printings (expansion_id, house_id, card_slug)
    VALUES (?, ?, ?)
  `);

  const sortedCards = Array.from(cardsMap.values()).sort((a, b) => a.title.localeCompare(b.title));

  const populate = db.transaction(() => {
    for (const card of sortedCards) {
      insertCard.run(
        card.slug,
        card.title,
        card.type,
        card.amber ?? 0,
        card.power ?? null,
        card.armor ?? null,
      );

      const expMap = cardPrintingsMap.get(card.slug);
      if (expMap) {
        for (const [exp, houses] of expMap.entries()) {
          const expId = EXPANSION_TO_ID[exp];
          if (!expId) {
            console.warn(`No ID found for expansion: ${exp}`);
            continue;
          }
          for (const h of houses) {
            const houseId = HOUSE_TO_ID[h];
            if (!houseId) {
              console.warn(`No ID found for house: ${h}`);
              continue;
            }
            insertPrinting.run(expId, houseId, card.slug);
          }
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

  console.log(`\n✅ Written ${cardsMap.size} cards to SQLite database: ${sqliteOutputFile}`);
  console.log(`   Database size: ${(sqliteBuffer.length / 1024).toFixed(1)} KB`);
  console.log(`   Checksum: ${checksum}`);
  console.log(`✅ Written version metadata to ${versionOutputFile}`);
}

try {
  main();
} catch (error) {
  console.error("Error building cards:", error);
  process.exit(1);
}
