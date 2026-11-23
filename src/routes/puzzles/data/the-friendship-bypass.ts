import type { KeyforgePuzzle } from "../types";

const puzzle: KeyforgePuzzle = {
  id: "frog-under-pressure",
  publishedAt: "2026-11-23",
  author: "BrainForge",
  spec: {
    title: "The Friendship Bypass",
    description: "Forge a key this turn.",
    player1: {
      house: "sanctum",
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
      ],
      hand: ["friendship"],
    },
    player2: {
      houses: ["unfathomable", "dis", "sanctum"],
      amber: 1,
      inPlay: [
        { card: "drecker", tokens: { ward: 1 } },
        "gub",
        { card: "the-vaultkeeper", tokens: { armor: 1 } },
      ],
    },
  },
};

export default puzzle;
