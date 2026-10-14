export type CardKind =
  | "Creature"
  | "TokenCreature"
  | "Action"
  | "Artifact"
  | "Upgrade";

export const EXPANSIONS = [
  "AEMBER_SKIES",
  "AGE_OF_ASCENSION",
  "ANOMALY_EXPANSION",
  "CALL_OF_THE_ARCHONS",
  "CRUCIBLE_CLASH",
  "DARK_TIDINGS",
  "DISCOVERY",
  "DRACONIAN_MEASURES",
  "GRIM_REMINDERS",
  "MARTIAN_CIVIL_WAR",
  "MASS_MUTATION",
  "MENAGERIE_2024",
  "MORE_MUTATION",
  "PROPHETIC_VISIONS",
  "TOKENS_OF_CHANGE",
  "VAULT_MASTERS_2023",
  "VAULT_MASTERS_2024",
  "VAULT_MASTERS_2025",
  "VAULT_MASTERS_2026",
  "WINDS_OF_EXCHANGE",
  "WORLDS_COLLIDE",
] as const;

export type Expansion = (typeof EXPANSIONS)[number];

export const Expansions: Record<Expansion, string> = {
  AEMBER_SKIES: "Aember Skies",
  AGE_OF_ASCENSION: "Age of Ascension",
  ANOMALY_EXPANSION: "Anomaly",
  CALL_OF_THE_ARCHONS: "Call of the Archons",
  CRUCIBLE_CLASH: "Crucible Clash",
  DARK_TIDINGS: "Dark Tidings",
  DISCOVERY: "Discovery",
  DRACONIAN_MEASURES: "Draconian Measures",
  GRIM_REMINDERS: "Grim Reminders",
  MARTIAN_CIVIL_WAR: "Martian Civil War",
  MASS_MUTATION: "Mass Mutation",
  MENAGERIE_2024: "Menagerie",
  MORE_MUTATION: "More Mutation",
  PROPHETIC_VISIONS: "Prophetic Visions",
  TOKENS_OF_CHANGE: "Tokens of Change",
  VAULT_MASTERS_2023: "Vault Masters 2023",
  VAULT_MASTERS_2024: "Vault Masters 2024",
  VAULT_MASTERS_2025: "Vault Masters 2025",
  VAULT_MASTERS_2026: "Vault Masters 2026",
  WINDS_OF_EXCHANGE: "Winds of Exchange",
  WORLDS_COLLIDE: "Worlds Collide",
};

function invert<K extends string>(
  record: Record<K, number>,
): Record<number, K> {
  return Object.fromEntries(
    Object.entries(record).map(([key, id]) => [id, key]),
  );
}

/**
 * Master Vault expansion IDs. These are the IDs stored in the card DB and used
 * by the source DB, so they double as the sort order for expansions.
 */
export const EXPANSION_TO_ID: Record<Expansion, number> = {
  CALL_OF_THE_ARCHONS: 341,
  AGE_OF_ASCENSION: 435,
  WORLDS_COLLIDE: 452,
  ANOMALY_EXPANSION: 453,
  MASS_MUTATION: 479,
  DARK_TIDINGS: 496,
  WINDS_OF_EXCHANGE: 600,
  VAULT_MASTERS_2023: 609,
  GRIM_REMINDERS: 700,
  MENAGERIE_2024: 722,
  VAULT_MASTERS_2024: 737,
  AEMBER_SKIES: 800,
  TOKENS_OF_CHANGE: 855,
  MORE_MUTATION: 874,
  PROPHETIC_VISIONS: 886,
  MARTIAN_CIVIL_WAR: 892,
  DISCOVERY: 907,
  CRUCIBLE_CLASH: 918,
  DRACONIAN_MEASURES: 928,
  VAULT_MASTERS_2025: 939,
  VAULT_MASTERS_2026: 964,
};

export const ID_TO_EXPANSION = invert(EXPANSION_TO_ID);

export const HOUSES = [
  "Brobnar",
  "Dis",
  "Logos",
  "Mars",
  "Sanctum",
  "Shadows",
  "Untamed",
  "Saurian",
  "StarAlliance",
  "Unfathomable",
  "Ekwidon",
  "Geistoid",
  "Skyborn",
  "Keyraken",
  "Elders",
  "IronyxRebels",
  "Ouboros",
  "Redemption",
  "Skybeast",
  "Anomaly",
] as const;

export type House = (typeof HOUSES)[number];

export const HOUSE_TO_ID: Record<House, number> = Object.fromEntries(
  HOUSES.map((house, idx) => [house, idx + 1]),
) as Record<House, number>;

export const ID_TO_HOUSE = invert(HOUSE_TO_ID);
