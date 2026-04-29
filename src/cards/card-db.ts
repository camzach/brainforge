import type { Card, CardKind, Expansion } from "../types";

const DB_NAME = "card-db";
const DB_VERSION = 2;
const STORE_NAME = "cards";

const INDEX_CARD_TYPE = "cardType";
const INDEX_EXPANSION = "expansionIdx";
const INDEX_HOUSE = "houseIdx";

let dbInstance: IDBDatabase | null = null;

export async function openCardDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      store.createIndex(INDEX_CARD_TYPE, "cardType", { unique: false });
      store.createIndex(INDEX_EXPANSION, "expansionIdx", {
        unique: false,
        multiEntry: true,
      });
      store.createIndex(INDEX_HOUSE, "houseIdx", {
        unique: false,
        multiEntry: true,
      });
      seedCardDB();
    };
  });
}

export async function seedCardDB(): Promise<void> {
  const db = await openCardDB();
  return import("../../filtered-cards.json").then(
    ({ default: cards }) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        store.clear();

        let id = 0;
        for (const card of cards) {
          let houseIdx;
          if (typeof card.house === "string") {
            houseIdx = [card.house];
          } else if (Array.isArray(card.house)) {
            houseIdx = card.house;
          } else {
            houseIdx = Object.values(card.house).flat();
          }

          store.add({
            id: id++,
            houseIdx,
            expansionIdx: card.expansions,
            ...card,
          });
        }

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      }),
  );
}

export async function getAllCards(): Promise<Card[]> {
  const db = await openCardDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getCardsByType(cardType: CardKind): Promise<Card[]> {
  const db = await openCardDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index(INDEX_CARD_TYPE);
    const request = index.getAll(cardType);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getCardsByExpansion(
  expansion: Expansion,
): Promise<Card[]> {
  const db = await openCardDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index(INDEX_EXPANSION);
    const request = index.getAll(expansion);
    console.log(request);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getCardByTitle(title: string): Promise<Card | undefined> {
  const db = await openCardDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const allCards = request.result as Card[];
      resolve(allCards.find((c) => c.title === title));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getCardsByHouse(house: string): Promise<Card[]> {
  const db = await openCardDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index(INDEX_HOUSE);
    const request = index.getAll(house);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export type CardQuery = {
  expansion?: Expansion;
  house?: string | null;
  cardTypes?: Set<CardKind>;
};

export async function queryCards(query: CardQuery): Promise<Card[]> {
  const { expansion, house, cardTypes } = query;

  const getCards = async (): Promise<Card[]> => {
    if (expansion) {
      return getCardsByExpansion(expansion) as Promise<Card[]>;
    }
    if (house) {
      return getCardsByHouse(house) as Promise<Card[]>;
    }
    return getAllCards() as Promise<Card[]>;
  };

  let cards = await getCards();

  if (house) {
    cards = cards.filter((c) => {
      if (typeof c.house === "string") {
        return c.house === house;
      }
      if (Array.isArray(c.house)) {
        return c.house.includes(house);
      }
      return Object.values(c.house).some((h) => h.includes(house));
    });
  }

  if (cardTypes && cardTypes.size > 0) {
    cards = cards.filter((c) => cardTypes.has(c.type));
  }

  return cards;
}
