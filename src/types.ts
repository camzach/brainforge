import type { Zone } from "./cards/card-utils";

export type CardKind =
  | "Creature"
  | "TokenCreature"
  | "Action"
  | "Artifact"
  | "Upgrade";

export type Expansion =
  | "AEMBER_SKIES"
  | "AGE_OF_ASCENSION"
  | "ANOMALY_EXPANSION"
  | "CALL_OF_THE_ARCHONS"
  | "CRUCIBLE_CLASH"
  | "DARK_TIDINGS"
  | "DISCOVERY"
  | "GRIM_REMINDERS"
  | "MARTIAN_CIVIL_WAR"
  | "MASS_MUTATION"
  | "MENAGERIE_2024"
  | "MORE_MUTATION"
  | "PROPHETIC_VISIONS"
  | "TOKENS_OF_CHANGE"
  | "VAULT_MASTERS_2023"
  | "VAULT_MASTERS_2024"
  | "VAULT_MASTERS_2025"
  | "WINDS_OF_EXCHANGE"
  | "WORLDS_COLLIDE";

export type HouseData = string | Record<Expansion, string>;

export type Card = {
  type: CardKind;
  title: string;
  slug: string;
  power?: number;
  armor?: number;
  amber?: number;
  house: HouseData;
};

export const Expansions: Record<Expansion, string> = {
  AEMBER_SKIES: "Aember Skies",
  AGE_OF_ASCENSION: "Age of Ascension",
  ANOMALY_EXPANSION: "Anomaly",
  CALL_OF_THE_ARCHONS: "Call of the Archons",
  CRUCIBLE_CLASH: "Crucible Clash",
  DARK_TIDINGS: "Dark Tidings",
  DISCOVERY: "Discovery",
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

export function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export type Fragment = {
  id: string;
  zone: Zone;
  card: Card;
  isCorrect: boolean;
};

export type GameConfig = {
  expansion: Expansion;
  house: string | null;
  cardTypes: Set<CardKind>;
  zones: Record<CardKind, Set<Zone>>;
};
