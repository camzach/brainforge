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
  WINDS_OF_EXCHANGE: "Winds of Exchange",
  WORLDS_COLLIDE: "Worlds Collide",
};

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

export const EXPANSION_TO_ID: Record<Expansion, number> = Object.fromEntries(
  EXPANSIONS.map((exp, idx) => [exp, idx + 1]),
) as Record<Expansion, number>;

export const ID_TO_EXPANSION: Record<number, Expansion> = Object.fromEntries(
  EXPANSIONS.map((exp, idx) => [idx + 1, exp]),
);

export const HOUSE_TO_ID: Record<House, number> = Object.fromEntries(
  HOUSES.map((house, idx) => [house, idx + 1]),
) as Record<House, number>;

export const ID_TO_HOUSE: Record<number, House> = Object.fromEntries(
  HOUSES.map((house, idx) => [idx + 1, house]),
);
