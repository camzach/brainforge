import type { Card, Expansion, House } from "../types";

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

export function getCardHouses(card: Card, expansion?: Expansion): House[] {
  if (typeof card.house === "string") {
    return [card.house];
  }
  if (Array.isArray(card.house)) {
    return card.house;
  }
  if (expansion && card.house[expansion]) {
    const h = card.house[expansion]!;
    return Array.isArray(h) ? h : [h];
  }
  const houses = new Set<House>();
  Object.values(card.house).forEach((h) => {
    if (typeof h === "string") {
      houses.add(h);
    } else if (Array.isArray(h)) {
      h.forEach((house) => houses.add(house));
    }
  });
  return Array.from(houses);
}

