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
  Partial<Record<Zone, { bbox: ZoneRect; path: Path2D }>>
> = {
  Creature: {
    pips: {
      bbox: {
        pos: [10, 60],
        size: [50, 125],
      },
      path: new Path2D("M 10 60 l 50 0 l 0 125 l -50 0 z"),
    },
    name: {
      bbox: {
        pos: [56, 221],
        size: [197, 48],
      },
      path: new Path2D(
        "M 56.051661,233.76384 C 112.4103,221.63067 173.4307,214.92263 240.73801,232.21402 c 0.63927,15.54769 4.12675,27.73057 11.62361,36.42067 -64.24146,-14.59119 -123.1877,-20.6898 -195.049784,-2.90266 l -0.637922,-5.40869 6.958501,-6.6702 c 0.748952,-1.65114 1.857304,-4.31161 0.273971,-6.68588 l -7.854725,-7.77907 z",
      ),
    },
    traits: {
      bbox: {
        pos: [10, 270],
        size: [280, 20],
      },
      path: new Path2D("M 10 270 l 280 0 l 0 20 l -280 0 z"),
    },
    power: {
      bbox: {
        pos: [16, 225],
        size: [49, 49],
      },
      path: new Path2D(
        "m 24.345018,233.82841 5.876384,-0.0646 6.845019,-6.71587 c 2.281673,-1.69141 4.886224,-1.92177 7.167896,0 l 6.941882,6.94188 h 5.004613 v 5.26292 l 7.038745,7.03874 c 1.479148,2.32472 2.629669,4.90775 0.516605,7.23247 l -6.81273,6.81273 -0.129151,5.65037 -5.908672,0.38746 -6.845019,6.26384 c -2.303198,1.51043 -5.385131,1.91192 -7.297048,0 l -6.845018,-6.84502 h -5.553506 v -5.81181 l -7.006457,-6.74816 c -1.002192,-2.46003 -1.231049,-4.24143 -0.193727,-6.03782 l 7.151753,-7.79751 z",
      ),
    },
    armor: {
      bbox: {
        pos: [239, 225],
        size: [43, 49],
      },
      path: new Path2D(
        "m 239.08559,232.78425 c 5.73556,-1.07805 12.47803,-3.163 21.36976,-7.39722 5.85827,2.60123 11.085,5.31391 20.91314,7.21457 -0.50163,27.12995 -10.36624,34.86513 -20.91314,41.18701 -10.51568,-6.72172 -20.85433,-13.80593 -21.36976,-41.00436 z",
      ),
    },
    rules: {
      bbox: {
        pos: [10, 285],
        size: [280, 100],
      },
      path: new Path2D("M 10 285 l 280 0 l 0 100 l -280 0 z"),
    },
  },
  TokenCreature: {
    name: {
      bbox: {
        pos: [70, 220],
        size: [160, 50],
      },
      path: new Path2D("M 70 220 l 160 0 l 0 50 l -160 0 z"),
    },
    power: {
      bbox: {
        pos: [15, 220],
        size: [55, 55],
      },
      path: new Path2D("M 15 220 l 55 0 l 0 55 l -55 0 z"),
    },
    rules: {
      bbox: {
        pos: [10, 285],
        size: [280, 100],
      },
      path: new Path2D("M 10 285 l 280 0 l 0 100 l -280 0 z"),
    },
  },
  Action: {
    name: {
      bbox: {
        pos: [28, 218],
        size: [240, 45],
      },
      path: new Path2D(
        "m 28.493011,257.89828 c 10.299761,-7.52141 21.59984,-12.64206 28.662679,-27.93209 91.93243,6.4626 131.54172,-24.38265 210.97085,-5.67505 -8.97825,6.80183 -17.99169,13.35733 -26.30124,24.84006 -109.32783,-3.05596 -99.92066,23.89496 -213.332289,8.76708 z",
      ),
    },
    rules: {
      bbox: {
        pos: [10, 280],
        size: [280, 105],
      },
      path: new Path2D("M 10 280 l 280 0 l 0 105 l -280 0 z"),
    },
  },
  Artifact: {
    pips: {
      bbox: {
        pos: [10, 60],
        size: [50, 125],
      },
      path: new Path2D("M 10 60 l 50 0 l 0 125 l -50 0 z"),
    },
    name: {
      bbox: {
        pos: [10, 10],
        size: [280, 50],
      },
      path: new Path2D("M 10 10 l 280 0 l 0 50 l -280 0 z"),
    },
    traits: {
      bbox: {
        pos: [10, 260],
        size: [280, 20],
      },
      path: new Path2D("M 10 260 l 280 0 l 0 20 l -280 0 z"),
    },
    rules: {
      bbox: {
        pos: [10, 280],
        size: [280, 105],
      },
      path: new Path2D("M 10 280 l 280 0 l 0 105 l -280 0 z"),
    },
  },
  Upgrade: {
    name: {
      bbox: {
        pos: [10, 10],
        size: [280, 50],
      },
      path: new Path2D("M 10 10 l 280 0 l 0 50 l -280 0 z"),
    },
    pips: {
      bbox: {
        pos: [10, 60],
        size: [50, 125],
      },
      path: new Path2D("M 10 60 l 50 0 l 0 125 l -50 0 z"),
    },
    rules: {
      bbox: {
        pos: [60, 60],
        size: [230, 125],
      },
      path: new Path2D("M 60 60 l 230 0 l 0 125 l -230 0 z"),
    },
  },
};

// export function getPipsRect(amber: number): Path2D {
//   const baseWidth = 20;
//   const width = amber * baseWidth + 10;
//   return {
//     pos: [10, 60],
//     size: [width, 50],
//   };
// }

export function getClipPath(
  card: Card,
  zone: Zone,
): { bbox: ZoneRect; path: Path2D } | undefined {
  if (zone === "pips" && card.amber !== undefined) {
    // return getPipsRect(card.amber);
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
