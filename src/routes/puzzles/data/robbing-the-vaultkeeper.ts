import type { KeyforgePuzzle } from "../types";

const puzzle: KeyforgePuzzle = {
  publishedAt: "2026-11-23",
  difficulty: "Medium",
  author: "BrainForge",
  hints: [
    "Key of Darkness forges at +6 Æmber over the current cost, or only +2 if your opponent has no Æmber. Aim to forge at 8.",
    "The Vaultkeeper stops your opponent’s Æmber from being stolen, so it has to go before you play Urchin.",
    "Troll is holding 4 Æmber. If it leaves play, that Æmber comes to you.",
    "Seabringer Kekoa raises the tide when it is destroyed, and Operative Espion then lets you use any creature, whatever its house.",
    "Reap with Silvertooth and Noddy the Thief before anything else happens. Noddy’s steal won’t work while The Vaultkeeper is in play.",
  ],
  solution: {
    steps: [
      "Reap with Silvertooth (1 Æmber).",
      "Reap with Noddy the Thief (2 Æmber). Don’t use his action: The Vaultkeeper prevents the steal.",
      "Play Life for a Life, gaining 1 Æmber (3 Æmber). Destroy Seabringer Kekoa. Its destroyed ability raises the tide.",
      "Operative Espion triggers. Use Operative Espion to fight The Vaultkeeper. Its armor absorbs 1 damage, and the other 3 finish it off. Operative Espion is destroyed in return.",
      "Now resolve the rest of Life for a Life: deal 6 damage to Troll. With the 2 damage it already has, it is destroyed, and its 4 Æmber comes to you (7 Æmber).",
      "Play Urchin and steal 1 Æmber. Your opponent now has 0 Æmber, and you have 8.",
      "Play Key of Darkness. Because your opponent has no Æmber, the key costs only +2, for 8 in total. Forge the key.",
    ],
  },
  spec: {
    title: "Robbing the Vaultkeeper",
    description:
      "Forge a key this turn. You start with no Æmber, and keys cost 6.",
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
