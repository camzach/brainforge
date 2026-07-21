import type { Card, CardKind, Expansion } from "../types";
import { getCardImageUrl } from "./card-image-utils";

export type Zone = "amber" | "rules" | "power" | "armor" | "traits" | "name";

export const ZONE_DISPLAY: Record<Zone, string> = {
  amber: "Æmber",
  rules: "Rules Text",
  power: "Power",
  armor: "Armor",
  traits: "Traits",
  name: "Name",
};

const ONE_AEMBER = new Path2D(
  "m 21.408915 59.436964 11.799549 10.113902 2.528481 -2.287672 11.317943 -0.842759 9.7527 14.689247 -4.81615 9.752655 -15.772887 4.575383 -14.809636 12.04033 -6.260992 -2.64888 -0.722419 -40.21482 z",
);
const TWO_AEMBER = new Path2D(
  "m 21.529311 59.918589 10.95673 8.789442 3.973323 -1.926425 10.354722 -0.120567 9.87309 14.568832 -6.260991 10.354696 -8.789458 2.889713 0.240794 4.816139 6.863002 0.240756 7.946638 13.485205 -6.020179 9.2711 -8.789461 5.17735 -5.658974 -0.602 -15.05046 14.20762 -5.899778 -4.57534 V 64.132498 Z",
);
const THREE_AEMBER = new Path2D(
  "m 14.864523 64.385008 0.510829 100.803632 5.789401 3.91638 12.430179 -11.40854 8.513824 0.17046 12.941012 -9.70576 1.021659 -8.5138 -8.002991 -9.19495 -6.81106 0.34054 0.85138 -2.55417 8.684099 -4.93803 5.789401 -8.5138 -6.470498 -12.77076 -6.81106 -1.36218 0.480983 -5.219221 5.989515 -2.783773 7.32189 -9.876056 -9.194929 -14.132939 -11.067971 -0.340535 -4.256914 1.702752 -10.386859 -10.38686 z",
);
export const FOUR_AEMBER = new Path2D(
  "m 21.079612 59.532094 11.408519 9.450369 3.916363 -2.554167 10.982833 0.255496 9.109788 13.536983 -5.363709 10.301707 -8.088129 2.383899 -0.08511 6.470513 5.95968 0.936496 7.832719 12.60045 -5.533992 8.59899 -9.02465 6.12994 v 2.80955 l 6.215093 0.085 7.407027 8.5138 v 8.68411 l -13.877529 9.7909 0.340535 2.12844 2.469011 -0.17045 11.49366 13.45183 -3.490669 13.02618 -11.66394 6.98131 -4.256915 -0.25549 -15.495161 13.87755 -5.448839 -3.91638 -0.510829 -138.094187 z",
);

export type ZoneRect = { pos: [number, number]; size: [number, number] };

export const cardTypeZoneMaps: Record<
  CardKind,
  Partial<Record<Zone, { bbox: ZoneRect; path: Path2D }>>
> = {
  Creature: {
    amber: {
      bbox: {
        pos: [14, 60],
        size: [42, 148],
      },
      path: new Path2D(), // Placeholder - actual path determined dynamically in getClipPath
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
    amber: {
      bbox: {
        pos: [10, 60],
        size: [50, 125],
      },
      path: new Path2D(), // Placeholder - actual path determined dynamically in getClipPath
    },
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
    amber: {
      bbox: {
        pos: [10, 60],
        size: [50, 125],
      },
      path: new Path2D(), // Placeholder - actual path determined dynamically in getClipPath
    },
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
    amber: {
      bbox: {
        pos: [10, 60],
        size: [50, 125],
      },
      path: new Path2D(), // Placeholder - actual path determined dynamically in getClipPath
    },
    name: {
      bbox: {
        pos: [30, 15],
        size: [243, 47],
      },
      path: new Path2D(
        "M 44.402624,29.199867 C 111.78441,10.867753 194.63993,9.0861613 260.63799,30.684781 l 12.42003,20.456521 -20.63916,10.410908 c -67.38429,-18.748446 -135.66329,-20.49741 -205.113155,0 L 30.752833,46.115807 Z",
      ),
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
    amber: {
      bbox: {
        pos: [10, 60],
        size: [50, 125],
      },
      path: new Path2D(), // Placeholder - actual path determined dynamically in getClipPath
    },
    name: {
      bbox: {
        pos: [30, 15],
        size: [243, 47],
      },
      path: new Path2D(
        "M 44.402624,29.199867 C 111.78441,10.867753 194.63993,9.0861613 260.63799,30.684781 l 12.42003,20.456521 -20.63916,10.410908 c -67.38429,-18.748446 -135.66329,-20.49741 -205.113155,0 L 30.752833,46.115807 Z",
      ),
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
  if (zone === "amber" && card.amber !== undefined) {
    const amberPath = [ONE_AEMBER, TWO_AEMBER, THREE_AEMBER, FOUR_AEMBER][
      card.amber - 1
    ];
    if (amberPath) {
      return {
        bbox: {
          pos: [10, 60],
          size: [50, 125],
        },
        path: amberPath,
      };
    }
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
  const src = getCardImageUrl(slug, house);
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
