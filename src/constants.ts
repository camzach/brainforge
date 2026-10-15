export type CardKind =
  | "Creature"
  | "TokenCreature"
  | "Action"
  | "Artifact"
  | "Upgrade";

/**
 * Master Vault expansion IDs mapped to their proper display names.
 * These are the IDs stored in the card DB and used by the source DB,
 * so they double as the release sort order for expansions.
 */
export const EXPANSIONS = {
  341: "Call of the Archons",
  435: "Age of Ascension",
  452: "Worlds Collide",
  453: "Anomaly",
  479: "Mass Mutation",
  496: "Dark Tidings",
  600: "Winds of Exchange",
  609: "Vault Masters 2023",
  700: "Grim Reminders",
  722: "Menagerie",
  737: "Vault Masters 2024",
  800: "Aember Skies",
  855: "Tokens of Change",
  874: "More Mutation",
  886: "Prophetic Visions",
  892: "Martian Civil War",
  907: "Discovery",
  918: "Crucible Clash",
  928: "Draconian Measures",
  939: "Vault Masters 2025",
  964: "Vault Masters 2026",
} as const;

export type Expansion = keyof typeof EXPANSIONS;

export const HOUSES = [
  "Brobnar",
  "Dis",
  "Logos",
  "Mars",
  "Sanctum",
  "Shadows",
  "Untamed",
  "Saurian",
  "Star Alliance",
  "Unfathomable",
  "Ekwidon",
  "Geistoid",
  "Skyborn",
  "Keyraken",
  "Elders",
  "Ironyx Rebels",
  "Ouboros",
  "Redemption",
  "Skybeast",
  "Anomaly",
] as const;

export type House = (typeof HOUSES)[number];
