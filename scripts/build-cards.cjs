const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { encode } = require("@msgpack/msgpack");

const KEYTEKI_PACKS_DIR = "./packs";
const outputFile = "filtered-cards.json";
const binaryOutputFile = "public/card-db.bin";
const versionOutputFile = "public/card-db.version.json";

// Map KeyTeki expansion codes to our expansion enum values
const EXPANSION_MAP = {
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

// Map KeyTeki card types to our CardKind enum
const TYPE_MAP = {
  action: "Action",
  artifact: "Artifact",
  creature: "Creature",
  upgrade: "Upgrade",
  "token creature": "TokenCreature",
};

// Card types to skip (not needed for the app)
const SKIP_TYPES = new Set(["archon power", "prophecy", "the tide"]);

// Normalize house names to match our format
const HOUSE_MAP = {
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
const EXPANSION_HOUSES = {
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
// Exchange Officer appears in multiple houses in KeyTeki due to its effect, but is actually StarAlliance
const FORCED_HOUSE_CARDS = {
  "exchange-officer": "StarAlliance"
};

function normalizeHouse(house) {
  const normalized = HOUSE_MAP[house.toLowerCase()];
  if (!normalized) {
    console.warn(`Unknown house: ${house}`);
    return house;
  }
  return normalized;
}

function readExpansionFile(filename) {
  const filePath = path.join(KEYTEKI_PACKS_DIR, filename);
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content);
}

function transformCard(keytekiCard, expansionCode) {
  // Skip special card types that aren't needed for the app
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

  // Generate slug from card name: lowercase first, replace æ with ae, split on spaces, remove non-alphanumeric, join with hyphens
  const slug = keytekiCard.name
    .toLowerCase()
    .replace(/æ/g, 'ae')  // Replace æ with ae after lowercasing
    .split(/\s+/)
    .map(part => part.replace(/[^a-z0-9]/g, ''))
    .filter(part => part.length > 0)
    .join('-');

  // Check if this card has a forced house override
  if (FORCED_HOUSE_CARDS[slug]) {
    return {
      title: keytekiCard.name,
      slug: slug,
      type: cardType,
      amber: keytekiCard.amber || 0,
      power: keytekiCard.power || undefined,
      armor: keytekiCard.armor || undefined,
      house: FORCED_HOUSE_CARDS[slug],
      expansion: EXPANSION_MAP[expansionCode],
    };
  }

  // Handle special card types
  // GR: Revenants have card numbers starting with "R" (R01-R11) - can go in any house in their expansion
  // AS/CC: Skybeasts are identified by card ID - go in "Skybeast" house
  // Anomalies: Cards with expansion ID 453 (appear in WC, WoE, PV, VM25) - go in "Anomaly" house and expansion
  let house;
  let expansion;
  const isRevenant =
    expansionCode === "GR" && keytekiCard.number?.startsWith("R");
  const isSkybeast = SKYBEAST_IDS.has(keytekiCard.id);
  const isAnomaly = keytekiCard.expansion === ANOMALY_EXPANSION_ID;

  if (isSkybeast) {
    house = "Skybeast";
    expansion = EXPANSION_MAP[expansionCode];
  } else if (isAnomaly) {
    house = "Anomaly";
    expansion = "ANOMALY_EXPANSION";
  } else if (isRevenant && EXPANSION_HOUSES[expansionCode]) {
    house = EXPANSION_HOUSES[expansionCode];
    expansion = EXPANSION_MAP[expansionCode];
  } else {
    house = normalizeHouse(keytekiCard.house);
    expansion = EXPANSION_MAP[expansionCode];
  }

  return {
    title: keytekiCard.name,
    slug: slug,
    type: cardType,
    amber: keytekiCard.amber || 0,
    power: keytekiCard.power || undefined,
    armor: keytekiCard.armor || undefined,
    house: house,
    expansion: expansion,
  };
}

function main() {
  console.log("Reading KeyTeki expansion files...");

  // Get all expansion JSON files
  const expansionFiles = fs
    .readdirSync(KEYTEKI_PACKS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  console.log(
    `Found ${expansionFiles.length} expansion files:`,
    expansionFiles.join(", "),
  );

  // Map to store all card appearances across expansions
  // Key: card slug, Value: array of {expansion, house, ...cardData}
  const cardAppearances = new Map();

  // Process each expansion file
  for (const filename of expansionFiles) {
    const expansionCode = filename.replace(".json", "");
    const expansionData = readExpansionFile(filename);

    console.log(
      `Processing ${expansionData.name} (${expansionCode}): ${expansionData.cards.length} cards`,
    );

    for (const keytekiCard of expansionData.cards) {
      const transformed = transformCard(keytekiCard, expansionCode);
      if (!transformed) continue;

      const slug = transformed.slug;

      if (!cardAppearances.has(slug)) {
        cardAppearances.set(slug, []);
      }

      // For forced house cards, only add the first appearance per expansion
      if (FORCED_HOUSE_CARDS[slug]) {
        const existingInExpansion = cardAppearances.get(slug).find(
          app => app.expansion === transformed.expansion
        );
        if (existingInExpansion) {
          continue; // Skip duplicate appearances in same expansion
        }
      }

      cardAppearances.get(slug).push(transformed);
    }
  }

  console.log(`\nProcessed ${cardAppearances.size} unique cards`);

  // Build final card list with proper house handling
  const finalCards = [];

  for (const [slug, appearances] of cardAppearances.entries()) {
    // Use the first appearance as the base
    const baseCard = appearances[0];

    // Group appearances by expansion to handle multiple houses per expansion
    const expansionMap = new Map();
    for (const appearance of appearances) {
      if (!expansionMap.has(appearance.expansion)) {
        expansionMap.set(appearance.expansion, []);
      }
      expansionMap.get(appearance.expansion).push(appearance.house);
    }

    // Collect all expansions this card appears in
    const expansions = Array.from(expansionMap.keys());

    // Determine house value based on appearances
    let houseValue;

    if (expansions.length === 1) {
      // Card only in one expansion
      const housesInExpansion = expansionMap.get(expansions[0]);
      if (housesInExpansion.length === 1) {
        // Single house - simple case
        houseValue = housesInExpansion[0];
      } else {
        // Multiple houses in same expansion (e.g., gigantic-fetching cards)
        // Check if all are arrays (special cards) or all are strings
        const firstHouse = housesInExpansion[0];
        if (Array.isArray(firstHouse)) {
          // All should be the same array (special cards like Revenants/Skybeasts)
          houseValue = firstHouse;
        } else {
          // Multiple different houses - combine into array
          houseValue = [...new Set(housesInExpansion)];
        }
      }
    } else {
      // Card in multiple expansions - create a map
      const houseMap = {};
      for (const [expansion, houses] of expansionMap.entries()) {
        if (houses.length === 1) {
          houseMap[expansion] = houses[0];
        } else {
          // Multiple houses in this expansion
          const firstHouse = houses[0];
          if (Array.isArray(firstHouse)) {
            houseMap[expansion] = firstHouse;
          } else {
            houseMap[expansion] = [...new Set(houses)];
          }
        }
      }
      houseValue = houseMap;
    }

    finalCards.push({
      title: baseCard.title,
      slug: slug,
      type: baseCard.type,
      amber: baseCard.amber,
      power: baseCard.power,
      armor: baseCard.armor,
      house: houseValue,
      expansions: expansions,
    });
  }

  // Sort by title for consistency
  finalCards.sort((a, b) => a.title.localeCompare(b.title));

  // Write JSON output (for development/debugging)
  fs.writeFileSync(outputFile, JSON.stringify(finalCards, null, 2));
  console.log(`\n✅ Written ${finalCards.length} cards to ${outputFile}`);

  // Encode to MessagePack binary format
  const encoded = encode(finalCards);

  // Ensure public directory exists
  if (!fs.existsSync("public")) {
    fs.mkdirSync("public", { recursive: true });
  }

  // Write binary bundle
  fs.writeFileSync(binaryOutputFile, encoded);

  // Calculate checksum
  const checksum = crypto.createHash("sha256").update(encoded).digest("hex");

  // Write version metadata
  const version = {
    version: new Date().toISOString(),
    cardCount: finalCards.length,
    checksum: checksum,
    sizeBytes: encoded.length,
  };
  fs.writeFileSync(versionOutputFile, JSON.stringify(version, null, 2));

  // Calculate size savings
  const jsonSize = Buffer.byteLength(JSON.stringify(finalCards));
  const binarySize = encoded.length;
  const savings = ((1 - binarySize / jsonSize) * 100).toFixed(1);

  console.log(`✅ Written compressed bundle to ${binaryOutputFile}`);
  console.log(`   JSON size: ${(jsonSize / 1024).toFixed(1)} KB`);
  console.log(`   Binary size: ${(binarySize / 1024).toFixed(1)} KB`);
  console.log(`   Savings: ${savings}%`);
  console.log(`✅ Written version metadata to ${versionOutputFile}`);
}

try {
  main();
} catch (error) {
  console.error("Error building cards:", error);
  process.exit(1);
}
