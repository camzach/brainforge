import type { KeyforgePuzzle } from "../types";

const puzzle: KeyforgePuzzle = {
  id: "final-refrain-might-makes-right",
  title: "Final Refrain Might Makes Right",
  publishedAt: "2026-11-23",
  difficulty: "Expert",
  author: "BrainForge",
  description:
    "Player 1 is in Brobnar with Dimo, Elderghast and Awakened Titan in play, and Final Refrain, Might Makes Right, Alaka’s Brew, Igon the Green and Terrance Surefoot in hand. Their discard pile holds 3 Tribute Collectors, Igon the Terrible and 5 actions. The opponent has 3 Æmber, 3 Grenade Snibs and Groggins in play. Forge a key this turn with Might Makes Right and finish with 6 Æmber, enough to forge another key next turn.",
  goal: "Finish the turn on check for key 3",
  setup: {
    activeHouse: "Brobnar",
    friendly: {
      aember: 0,
      keys: { red: true, blue: false, yellow: false },
      hand: [
        "final-refrain",
        "might-makes-right",
        "alakas-brew",
        "igon-the-green",
        "terrance-surefoot",
      ],
      battleline: [{ slug: "dimo-elderghast" }, { slug: "awakened-titan" }],
      discard: [
        "tribute-collector",
        "tribute-collector",
        "tribute-collector",
        "igon-the-terrible",
        "anger",
        "anger",
        "anger",
        "anger",
        "anger",
      ],
    },
    opponent: {
      aember: 3,
      keys: { red: true, blue: false, yellow: true },
      battleline: [
        { slug: "grenade-snib" },
        { slug: "grenade-snib" },
        { slug: "grenade-snib" },
        { slug: "groggins" },
      ],
    },
    additionalNotes: [
      "Your discard pile has 9 cards. The 5 actions are irrelevant apart from counting towards being haunted (10 or more cards in the discard pile).",
    ],
  },
  hints: [
    "Tribute Collector can capture onto any friendly creature",
    "Igon the Green must be destroyed before you can play Igon the Terrible",
  ],
  solution: {
    overview:
      "Use Final Refrain to bring back your discard pile of creatures, stock Awakened Titan with captured Æmber, then sacrifice a board of 26 power with Might Makes Right to forge for free and cash in Dimo, Elderghast.",
    steps: [
      "Scrap Igon the Green.",
      "Play Final Refrain, putting the 3 Tribute Collectors, Igon the Green and Igon the Terrible into play.",
      "Fight with each Tribute Collector into a Grenade Snib, capturing onto Awakened Titan (3 Æmber). Each destroyed Snib makes you lose 2 Æmber, but your pool is empty.",
      "Fight with Igon the Terrible into Groggins, destroying both. Igon the Green has no enemy creature left to fight.",
      "Final Refrain destroys the remaining creatures. Igon the Green purges itself and returns Igon the Terrible to your hand.",
      "Play Terrance Surefoot and Igon the Terrible",
      "Reap with Awakened Titan.",
      "Play Alaka’s Brew on any friendly creature.",
      "Play Might Makes Right, sacrificing Igon the Terrible, Terrance Surefoot, Awakened Titan and Dimo, Elderghast to forge a key for free. Dimo’s destroyed trigger on Awakened Titan gains 3 Æmber, leaving you at 6.",
    ],
  },
};

export default puzzle;
