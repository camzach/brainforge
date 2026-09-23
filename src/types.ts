import type { Zone } from "./cards/card-utils";
import type { Expansion, House } from "./constants";
export type { Expansion, House } from "./constants";
export {
  EXPANSIONS,
  Expansions,
  HOUSES,
  EXPANSION_TO_ID,
  ID_TO_EXPANSION,
  HOUSE_TO_ID,
  ID_TO_HOUSE,
} from "./constants";

export type CardKind =
  | "Creature"
  | "TokenCreature"
  | "Action"
  | "Artifact"
  | "Upgrade";

export type HouseData =
  | House
  | House[]
  | Partial<Record<Expansion, House | House[]>>;

export type Card = {
  type: CardKind;
  title: string;
  slug: string;
  power?: number;
  armor?: number;
  amber?: number;
  house: HouseData;
  expansions: Expansion[];
};

export function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export type Fragment = {
  id: string;
  zone: Zone;
  card: Card;
  house: House;
  isCorrect: boolean;
};

export type GameConfig = {
  expansion: Expansion;
  house: House | null;
  cardTypes: Set<CardKind>;
  zones: Record<CardKind, Set<Zone>>;
};
