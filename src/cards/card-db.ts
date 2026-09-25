import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import type { Card, CardKind, Expansion, House } from "../types";
import {
  EXPANSION_TO_ID,
  HOUSE_TO_ID,
  ID_TO_EXPANSION,
  ID_TO_HOUSE,
} from "../types";

const LOCAL_STORAGE_CHECKSUM_KEY = "brainforge:card-db:checksum";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SqliteDB = any;

let dbPromise: Promise<SqliteDB> | null = null;

async function fetchDbBytes(): Promise<ArrayBuffer> {
  const baseUrl = import.meta.env.BASE_URL || "/";
  const versionUrl = `${baseUrl}card-db.version.json`.replace(/\/+/g, "/");
  const sqliteUrl = `${baseUrl}card-db.sqlite`.replace(/\/+/g, "/");

  let checksumParam = "";
  try {
    const versionRes = await fetch(versionUrl, { cache: "no-cache" });
    if (versionRes.ok) {
      const versionData = await versionRes.json();
      const currentChecksum = versionData.checksum;
      const storedChecksum = localStorage.getItem(LOCAL_STORAGE_CHECKSUM_KEY);

      if (currentChecksum) {
        if (storedChecksum && storedChecksum !== currentChecksum) {
          console.log(
            `Database version changed (${storedChecksum} -> ${currentChecksum}). Invalidating cache.`,
          );
        }
        localStorage.setItem(LOCAL_STORAGE_CHECKSUM_KEY, currentChecksum);
        checksumParam = `?v=${currentChecksum}`;
      }
    }
  } catch (err) {
    console.warn("Could not check card-db version metadata:", err);
  }

  const fetchUrl = `${sqliteUrl}${checksumParam}`;
  const fetchOptions: RequestInit = checksumParam ? {} : { cache: "no-cache" };
  const res = await fetch(fetchUrl, fetchOptions);
  if (!res.ok) {
    throw new Error(`Failed to fetch card database from ${fetchUrl}: ${res.statusText}`);
  }
  return res.arrayBuffer();
}

export async function openCardDB(): Promise<SqliteDB> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const [sqlite3, dbFile] = await Promise.all([
        sqlite3InitModule(),
        fetchDbBytes(),
      ]);

      const db = new sqlite3.oo1.DB();
      const bytes = new Uint8Array(dbFile);
      const pData = sqlite3.wasm.allocFromTypedArray(bytes);

      sqlite3.capi.sqlite3_deserialize(
        db,
        "main",
        pData,
        bytes.byteLength,
        bytes.byteLength,
        sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE |
          sqlite3.capi.SQLITE_DESERIALIZE_RESIZEABLE,
      );

      return db;
    })();
  }
  return dbPromise;
}

type RawCardRow = {
  slug: string;
  title: string;
  type: string;
  amber: number;
  power: number | null;
  armor: number | null;
};

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
};

export async function queryCards(
  filter: QueryCardsFilter = {},
): Promise<Card[]> {
  const db = await openCardDB();
  const conditions: string[] = [];
  const bind: Record<string, string | number> = {};

  if (filter.expansion) {
    const expId = EXPANSION_TO_ID[filter.expansion];
    if (!expId) return [];
    conditions.push("p.expansion_id = $expansion_id");
    bind.$expansion_id = expId;
  }

  if (filter.house) {
    const houseId = HOUSE_TO_ID[filter.house];
    if (!houseId) return [];
    conditions.push("p.house_id = $house_id");
    bind.$house_id = houseId;
  }

  if (filter.type) {
    if (Array.isArray(filter.type)) {
      if (filter.type.length === 0) return [];
      const placeholders = filter.type.map((_, i) => `$type_${i}`);
      conditions.push(`c.type IN (${placeholders.join(", ")})`);
      filter.type.forEach((t, i) => {
        bind[`$type_${i}`] = t;
      });
    } else {
      conditions.push("c.type = $type");
      bind.$type = filter.type;
    }
  }

  if (filter.slug) {
    conditions.push("c.slug = $slug");
    bind.$slug = filter.slug;
  }

  if (filter.search) {
    conditions.push("c.title LIKE $search");
    bind.$search = `%${filter.search}%`;
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
  const rows = db.exec({
    sql,
    bind,
    rowMode: "object",
    returnValue: "resultRows",
  }) as CombinedRow[];

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

  const db = await openCardDB();
  const rows = db.exec({
    sql: `SELECT DISTINCT p.house_id, c.type
     FROM card_printings p
     JOIN cards c ON c.slug = p.card_slug
     WHERE p.expansion_id = $expId`,
    bind: { $expId: expId },
    rowMode: "object",
    returnValue: "resultRows",
  }) as { house_id: number; type: string }[];

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
