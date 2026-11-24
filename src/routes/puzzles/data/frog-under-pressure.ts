import type { KeyforgePuzzle } from "../types";

const puzzle: KeyforgePuzzle = {
  publishedAt: "2026-11-23",
  difficulty: "Easy",
  author: "BrainForge",
  hints: [
    "Keyfrog forges a key at the current cost when it is destroyed, so you need 6 Æmber at that moment.",
    "Keyfrog is exhausted, so you can't destroy it by using it to fight. Maybe there's another way?",
    "Friendship divides any damage dealt to its creature among that creature’s neighbors. Troll’s neighbors are Keyfrog and Commander Remiel.",
    "Friendship gives you 1 Æmber when played, and Commander Remiel’s reap gives you another: 4 + 1 + 1 = 6.",
  ],
  solution: {
    steps: [
      "Play Friendship on Troll, gaining 1 Æmber (5 Æmber).",
      "Reap with Commander Remiel (6 Æmber). Use his reap ability to use Troll.",
      "Fight Gub with Troll. Troll destroys Gub, and Gub deals 6 damage to Troll in return. Friendship divides that damage between Keyfrog and Commander Remiel, 3 each.",
      "Keyfrog is destroyed (so is Commander Remiel, but you’ve already used him). Keyfrog’s destroyed ability forges a key at the current cost of 6 Æmber.",
    ],
    commentary:
      "Friendship turns the damage Troll takes into damage on its neighbors. That is how you get Keyfrog destroyed on your own turn.",
  },
  spec: {
    title: "Frog Under Pressure",
    description: "Forge a key this turn.",
    player1: {
      houses: ["sanctum", "untamed", "brobnar"],
      amber: 4,
      inPlay: [
        {
          card: "keyfrog",
          exhausted: true,
          upgrades: ["under-pressure"],
        },
        "troll",
        "commander-remiel",
        "bumpsy",
      ],
      hand: [
        "loot-the-bodies",
        "friendship",
        "lava-ball",
        "mushroom-with-a-view",
        "anger",
        "fuzzy-gruen",
      ],
    },
    player2: {
      houses: ["unfathomable", "dis", "sanctum"],
      amber: 1,
      inPlay: [
        { card: "charette", tokens: { amber: 3 } },
        "gub",
        { card: "the-vaultkeeper", tokens: { armor: 1 } },
      ],
    },
  },
};

export default puzzle;
