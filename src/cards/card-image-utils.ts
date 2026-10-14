import type { Card, Expansion, House } from "../types";

/**
 * Picks the printing image that best matches the requested house/expansion
 * (house match outranks expansion match), falling back to any printing with an
 * image. Returns "" if the card has no image at all.
 */
export function getCardImageUrl(
  card: Card,
  house?: string,
  expansion?: Expansion,
): string {
  const score = (p: Card["printings"][number]) =>
    (p.house === house ? 2 : 0) + (p.expansion === expansion ? 1 : 0);

  let best: Card["printings"][number] | undefined;
  for (const p of card.printings) {
    if (p.imageFile && (!best || score(p) > score(best))) best = p;
  }

  return best
    ? `${import.meta.env.BASE_URL}card-images/${best.imageFile}`
    : "";
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
