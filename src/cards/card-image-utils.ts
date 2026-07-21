import type { Card, Expansion } from "../types";

export function normalizeHouseForUrl(house: string): string {
  let normalized = house.toLowerCase();
  if (normalized === "skybeast") {
    normalized = "skyborn";
  }
  if (normalized === "revenant") {
    normalized = "geistoid";
  }
  return normalized;
}

export function getCardImageUrl(
  slug: string,
  house: string,
  baseUrl?: string,
): string {
  const normalizedHouse = normalizeHouseForUrl(house);
  const base =
    baseUrl ||
    import.meta.env.VITE_CARD_IMAGE_BASEURL ||
    "https://keyforge-card-images.s3-us-west-2.amazonaws.com/";
  return `${base}${normalizedHouse}/${slug}.png`;
}

export function getCardHouses(card: Card): string[] {
  const houses = new Set<string>();

  if (typeof card.house === "string") {
    houses.add(card.house);
  } else if (Array.isArray(card.house)) {
    card.house.forEach((h) => houses.add(h));
  } else if (typeof card.house === "object") {
    // It's an object with expansion keys
    Object.values(card.house).forEach((h) => {
      if (typeof h === "string") {
        houses.add(h);
      } else if (Array.isArray(h)) {
        h.forEach((house) => houses.add(house));
      }
    });
  }

  return Array.from(houses);
}

export function getCardHouse(
  card: Card,
  expansion: Expansion,
): string | string[] {
  if (typeof card.house === "object" && !Array.isArray(card.house)) {
    return card.house[expansion];
  }
  return card.house;
}
