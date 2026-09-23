import { createSQLiteHTTPPool, type SQLiteHTTPPool } from "sqlite-wasm-http";
import type { Card, CardKind, Expansion, House } from "../types";
import {
  EXPANSION_TO_ID,
  HOUSE_TO_ID,
  ID_TO_EXPANSION,
  ID_TO_HOUSE,
} from "../types";

type SQLBindable = string | number | bigint | Uint8Array | null | undefined;

let poolPromise: Promise<SQLiteHTTPPool> | null = null;
function getRemoteDbUrl(): string {
  const baseUrl = import.meta.env.BASE_URL;
  const dbPath = `${baseUrl}card-db.sqlite`.replace(/\/+/g, "/");
  return new URL(dbPath, window.location.href).href;
}

export async function openCardDB(): Promise<SQLiteHTTPPool> {
  if (!poolPromise) {
    poolPromise = (async () => {
      const pool = await createSQLiteHTTPPool({
        workers: 1,
        httpOptions: {
          maxPageSize: 1024,
          cacheSize: 4096,
        },
      });
      await pool.open(getRemoteDbUrl());
      return pool;
    })();
  }
  return poolPromise;
}

type RawCardRow = {
  slug: string;
  title: string;
  type: string;
  amber: number;
  power: number | null;
  armor: number | null;
}

function constructCard(
  cardRow: RawCardRow,
  printings: { expansion: Expansion; house: House }[],
): Card {
  const expMap = new Map<Expansion, Set<House>>();
  for (const p of printings) {
    if (!expMap.has(p.expansion)) {
      expMap.set(p.expansion, new Set());
    }
    expMap.get(p.expansion)!.add(p.house);
  }

  const expansions = Array.from(expMap.keys());
  let houseValue: Card["house"];

  if (expansions.length === 1) {
    const housesInExp = Array.from(expMap.get(expansions[0])!);
    houseValue = housesInExp.length === 1 ? housesInExp[0] : housesInExp;
  } else {
    const houseMap: Partial<Record<Expansion, House | House[]>> = {};
    for (const [exp, houses] of expMap.entries()) {
      const houseArr = Array.from(houses);
      houseMap[exp] = houseArr.length === 1 ? houseArr[0] : houseArr;
    }
    houseValue = houseMap;
  }

  return {
    title: cardRow.title,
    slug: cardRow.slug,
    type: cardRow.type as CardKind,
    amber: cardRow.amber,
    power: cardRow.power ?? undefined,
    armor: cardRow.armor ?? undefined,
    house: houseValue,
    expansions,
  };
}

export type QueryCardsFilter = {
  expansion?: Expansion;
  house?: House;
  type?: CardKind | CardKind[];
  search?: string;
  slug?: string;
}

export async function queryCards(
  filter: QueryCardsFilter = {},
): Promise<Card[]> {
  const pool = await openCardDB();
  const conditions: string[] = [];
  const params: Record<string, SQLBindable> = {};

  if (filter.expansion) {
    const expId = EXPANSION_TO_ID[filter.expansion];
    if (!expId) return [];
    conditions.push("p.expansion_id = $expansion_id");
    params.$expansion_id = expId;
  }

  if (filter.house) {
    const houseId = HOUSE_TO_ID[filter.house];
    if (!houseId) return [];
    conditions.push("p.house_id = $house_id");
    params.$house_id = houseId;
  }

  if (filter.type) {
    if (Array.isArray(filter.type)) {
      if (filter.type.length === 0) return [];
      const placeholders = filter.type.map((_, i) => `$type_${i}`);
      conditions.push(`c.type IN (${placeholders.join(", ")})`);
      filter.type.forEach((t, i) => {
        params[`$type_${i}`] = t;
      });
    } else {
      conditions.push("c.type = $type");
      params.$type = filter.type;
    }
  }

  if (filter.slug) {
    conditions.push("c.slug = $slug");
    params.$slug = filter.slug;
  }

  if (filter.search) {
    conditions.push("c.title LIKE $search");
    params.$search = `%${filter.search}%`;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT DISTINCT c.slug, c.title, c.type, c.amber, c.power, c.armor, p.expansion_id, p.house_id
    FROM card_printings p
    JOIN cards c ON c.slug = p.card_slug
    ${whereClause}
    ORDER BY c.title ASC
  `;

  type CombinedRow = RawCardRow & { house_id: number; expansion_id: number };
  const rowsResult = await pool.exec(sql, params, { rowMode: "object" });
  const rows = (rowsResult as unknown as { row: CombinedRow }[]).map(
    (r) => r.row,
  );

  const cardMap = new Map<
    string,
    { card: RawCardRow; printings: { expansion: Expansion; house: House }[] }
  >();

  for (const row of rows) {
    if (!cardMap.has(row.slug)) {
      cardMap.set(row.slug, {
        card: {
          slug: row.slug,
          title: row.title,
          type: row.type,
          amber: row.amber,
          power: row.power,
          armor: row.armor,
        },
        printings: [],
      });
    }
    const exp = ID_TO_EXPANSION[row.expansion_id];
    const h = ID_TO_HOUSE[row.house_id];
    if (exp && h) {
      cardMap.get(row.slug)!.printings.push({ expansion: exp, house: h });
    }
  }

  return Array.from(cardMap.values()).map(({ card, printings }) =>
    constructCard(card, printings),
  );
}

export async function getExpansionMeta(
  expansion: Expansion,
): Promise<{ houses: House[]; typesByHouse: Map<House, Set<CardKind>> }> {
  const expId = EXPANSION_TO_ID[expansion];
  if (!expId) return { houses: [], typesByHouse: new Map() };

  const pool = await openCardDB();
  const rowsResult = await pool.exec(
    `SELECT DISTINCT p.house_id, c.type
     FROM card_printings p
     JOIN cards c ON c.slug = p.card_slug
     WHERE p.expansion_id = $expId`,
    { $expId: expId },
    { rowMode: "object" },
  );

  const rows = (
    rowsResult as unknown as { row: { house_id: number; type: string } }[]
  ).map((r) => r.row);

  const typesByHouse = new Map<House, Set<CardKind>>();
  for (const row of rows) {
    const house = ID_TO_HOUSE[row.house_id];
    if (!house) continue;
    if (!typesByHouse.has(house)) typesByHouse.set(house, new Set());
    typesByHouse.get(house)!.add(row.type as CardKind);
  }

  const houses = Array.from(typesByHouse.keys()).sort();
  return { houses, typesByHouse };
}
