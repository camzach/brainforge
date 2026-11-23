import type { KeyforgePuzzle } from "../types";

const puzzle: KeyforgePuzzle = {
  id: "final-refrain-might-makes-right",
  publishedAt: "2026-11-23",
  difficulty: "Hard",
  author: "BrainForge",
  hints: [
    "Tribute Collector can capture Æmber onto any friendly creature.",
    "Igon the Green must be destroyed before you can play Igon the Terrible.",
  ],
  solution: {
    steps: [
      "Scrap Igon the Green.",
      "Play Final Refrain, putting the 3 Tribute Collectors, Igon the Green and Igon the Terrible into play.",
      "Fight a Grenade Snib with each Tribute Collector, capturing Æmber onto Awakened Titan (3 Æmber in total). Each destroyed Grenade Snib would make you lose 2 Æmber, but your pool is empty.",
      "Fight Groggins with Igon the Terrible, destroying both. Igon the Green has no enemy creature left to fight.",
      "Final Refrain destroys your remaining creatures. Igon the Green purges itself and returns Igon the Terrible to your hand.",
      "Play Terrance Surefoot and Igon the Terrible.",
      "Reap with Awakened Titan.",
      "Play Alaka’s Brew on any friendly creature.",
      "Play Might Makes Right, sacrificing Igon the Terrible, Terrance Surefoot, Awakened Titan and Dimo, Elderghast to forge a key for free. Dimo’s destroyed trigger on Awakened Titan gains you 3 Æmber, leaving you with 6.",
    ],
  },
  spec: {
    title: "The Crowded Graveyard",
    description:
      "Forge a key this turn and finish with 6 Æmber, enough to forge another key next turn.",
    player1: {
      house: "brobnar",
      houses: ["brobnar", "geistoid", "untamed"],
      keys: { red: true },
      inPlay: [
        { card: "dimo-elderghast", tokens: { armor: 2 } },
        "awakened-titan",
      ],
      hand: [
        "final-refrain",
        "might-makes-right",
        "alaka-s-brew",
        "igon-the-green",
        "terrance-surefoot",
      ],
      discard: [
        "tribute-collector",
        "tribute-collector",
        "tribute-collector",
        "igon-the-terrible",
        ...Array<string>(5).fill("anger"),
      ],
    },
    player2: {
      houses: ["brobnar", "untamed", "sanctum"],
      amber: 3,
      keys: { red: true, yellow: true },
      inPlay: ["grenade-snib", "grenade-snib", "grenade-snib", "groggins"],
    },
    goal: [{ type: "keys", count: 2 }, { type: "amber", min: 6 }],
  },
};

export default puzzle;
