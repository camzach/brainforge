import type { CardKind, Expansion, GameConfig } from "../../types";
import { cardTypeZoneMaps, type Zone } from "../../cards/card-utils";

/**
 * Practice search params schema
 * e.g. /practice/play?exp=CALL_OF_THE_ARCHONS&house=Brobnar&types=Creature,Action&zones=Creature:name+power,Action:rules
 */
export type PracticeSearchParams = {
  exp?: Expansion;
  house?: string;
  types?: string;
  zones?: string;
};

export function encodePracticeSearch(config: GameConfig): PracticeSearchParams {
  const result: PracticeSearchParams = {
    exp: config.expansion,
  };
  if (config.house) {
    result.house = config.house;
  }
  if (config.cardTypes.size > 0) {
    result.types = Array.from(config.cardTypes).join(",");
  }
  const zoneEntries: string[] = [];
  for (const cardType of config.cardTypes) {
    const activeZones = config.zones[cardType];
    if (activeZones && activeZones.size > 0) {
      zoneEntries.push(`${cardType}:${Array.from(activeZones).join("+")}`);
    }
  }
  if (zoneEntries.length > 0) {
    result.zones = zoneEntries.join(",");
  }
  return result;
}

export function decodePracticeSearch(
  search: PracticeSearchParams,
): GameConfig | null {
  if (!search.exp) return null;

  const cardTypes = new Set<CardKind>();
  if (search.types) {
    search.types.split(",").forEach((t) => {
      const trimmed = t.trim() as CardKind;
      if (trimmed in cardTypeZoneMaps) {
        cardTypes.add(trimmed);
      }
    });
  }

  const zones: Record<CardKind, Set<Zone>> = {
    Creature: new Set(),
    TokenCreature: new Set(),
    Action: new Set(),
    Artifact: new Set(),
    Upgrade: new Set(),
  };

  if (search.zones) {
    const typeEntries = search.zones.split(",");
    for (const entry of typeEntries) {
      const [typeStr, zoneList] = entry.split(":");
      const typeKey = typeStr?.trim() as CardKind;
      if (typeKey && typeKey in zones && zoneList) {
        zoneList.split("+").forEach((z) => {
          const zoneKey = z.trim() as Zone;
          if (cardTypeZoneMaps[typeKey]?.[zoneKey]) {
            zones[typeKey].add(zoneKey);
          }
        });
      }
    }
  }

  // Fallback: If no zones were specified for a selected cardType, default to all available zones for that cardType
  for (const ct of cardTypes) {
    if (zones[ct].size === 0) {
      const availableZones = Object.keys(cardTypeZoneMaps[ct]) as Zone[];
      availableZones.forEach((z) => zones[ct].add(z));
    }
  }

  if (cardTypes.size === 0) {
    return null;
  }

  return {
    expansion: search.exp,
    house: search.house || null,
    cardTypes,
    zones,
  };
}
