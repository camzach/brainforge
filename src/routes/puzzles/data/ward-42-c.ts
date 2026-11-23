import type { KeyforgePuzzle } from "../types";

const puzzle: KeyforgePuzzle = {
  id: "ward-42-c",
  publishedAt: "2026-11-23",
  author: "BrainForge",
  spec: {
    title: "Ward 42-C",
    description: "Forge a key this turn without losing Sample 42-C or Kartanoo.",
    player1: {
      house: "staralliance",
      houses: ["staralliance", "geistoid", "untamed"],
      inPlay: ["kartanoo", { card: "sample-42-c", tokens: { amber: 3 } }],
      hand: ["encounter-suit"],
      deck: ["animating-force"],
    },
    player2: {
      houses: ["untamed", "staralliance", "sanctum"],
      amber: 1,
      inPlay: [
        { card: "cauldron", under: ["refit", "gleaming-the-cube"] },
        "kangaphant",
      ],
    },
    goal: [
      { type: "keys", count: 1 },
      { type: "card", card: "sample-42-c", location: "play area" },
      { type: "card", card: "kartanoo", location: "play area" },
    ],
  },
};

export default puzzle;
