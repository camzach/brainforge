import type { Card, CardKind, Expansion } from "../types";

export type Zone = "pips" | "rules" | "power" | "armor" | "traits" | "name";

export const ZONE_DISPLAY: Record<Zone, string> = {
  pips: "Pips",
  rules: "Rules Text",
  power: "Power",
  armor: "Armor",
  traits: "Traits",
  name: "Name",
};

export type ZoneRect = { pos: [number, number]; size: [number, number] };

export const cardTypeZoneMaps: Record<
  CardKind,
  Partial<Record<Zone, ZoneRect>>
> = {
  Creature: {
    pips: { pos: [10, 60], size: [50, 125] },
    name: { pos: [70, 220], size: [160, 50] },
    traits: { pos: [10, 270], size: [280, 20] },
    power: { pos: [15, 220], size: [55, 55] },
    armor: { pos: [230, 220], size: [55, 55] },
    rules: { pos: [10, 285], size: [280, 100] },
  },
  TokenCreature: {
    name: { pos: [70, 220], size: [160, 50] },
    power: { pos: [15, 220], size: [55, 55] },
    rules: { pos: [10, 285], size: [280, 100] },
  },
  Action: {
    pips: { pos: [10, 60], size: [50, 125] },
    name: { pos: [10, 220], size: [280, 50] },
    rules: { pos: [10, 280], size: [280, 105] },
  },
  Artifact: {
    pips: { pos: [10, 60], size: [50, 125] },
    name: { pos: [10, 10], size: [280, 50] },
    traits: { pos: [10, 260], size: [280, 20] },
    rules: { pos: [10, 280], size: [280, 105] },
  },
  Upgrade: {
    name: { pos: [10, 10], size: [280, 50] },
    pips: { pos: [10, 60], size: [50, 125] },
    rules: { pos: [60, 60], size: [230, 125] },
  },
};

export function getPipsRect(amber: number): ZoneRect {
  const baseWidth = 20;
  const width = amber * baseWidth + 10;
  return {
    pos: [10, 60],
    size: [width, 50],
  };
}

export function getZoneRect(card: Card, zone: Zone): ZoneRect | undefined {
  if (zone === "pips" && card.amber !== undefined) {
    return getPipsRect(card.amber);
  }
  if (card.type in cardTypeZoneMaps) {
    const zoneMap = cardTypeZoneMaps[card.type];
    return zoneMap[zone];
  }
}

export function makeId() {
  return String.fromCharCode(
    ...Array.from(
      new Array(10),
      () => "a".charCodeAt(0) + Math.floor(Math.random() * 26),
    ),
  );
}

export function getCardHouse(card: Card, expansion: Expansion) {
  if (typeof card.house === "object" && !Array.isArray(card.house)) {
    return card.house[expansion];
  }
  return card.house;
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();
export function loadCardImage(slug: string, house: string) {
  let uriHouse = house.toLowerCase();
  if (uriHouse === "skybeast") {
    uriHouse = "skyborn";
  }
  if (uriHouse === "revenant") {
    uriHouse = "geistoid";
  }
  const src = `${import.meta.env.VITE_CARD_IMAGE_BASEURL}${uriHouse}/${slug}.png`;
  const cachedPromise = imageCache.get(src);
  if (cachedPromise) {
    return cachedPromise;
  }

  const { promise, resolve, reject } =
    Promise.withResolvers<HTMLImageElement>();

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = src;
  image.onload = () => {
    resolve(image);
  };
  image.onerror = () => {
    reject();
  };
  imageCache.set(src, promise);

  return promise;
}
