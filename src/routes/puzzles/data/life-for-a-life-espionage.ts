import type { KeyforgePuzzle } from "../types";

const puzzle: KeyforgePuzzle = {
  id: "life-for-a-life-espionage",
  publishedAt: "2026-11-23",
  author: "BrainForge",
  spec: {
    title: "Life for a Life Espionage",
    description:
      "Forge a key this turn, starting from 0 Æmber with Key of Darkness in hand. Keys cost 6 Æmber.",
    player1: {
      house: "shadows",
      houses: ["shadows", "unfathomable", "staralliance"],
      inPlay: [
        "seabringer-kekoa",
        "operative-espion",
        "silvertooth",
        "noddy-the-thief",
      ],
      hand: ["life-for-a-life", "urchin", "key-of-darkness"],
    },
    player2: {
      houses: ["brobnar", "shadows", "sanctum"],
      amber: 1,
      inPlay: [
        { card: "troll", tokens: { amber: 4 }, damage: 2 },
        "bad-penny",
        { card: "the-vaultkeeper", tokens: { armor: 1 }, damage: 2 },
      ],
    },
  },
};

export default puzzle;
