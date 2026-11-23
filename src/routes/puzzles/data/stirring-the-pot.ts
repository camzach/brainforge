import type { KeyforgePuzzle } from "../types";

const puzzle: KeyforgePuzzle = {
  publishedAt: "2026-11-23",
  difficulty: "Medium",
  author: "BrainForge",
  hints: [
    "Encounter Suit wards Kartanoo before Refit moves it, so the ward stays on Kartanoo.",
    "Animating Force gives Sample 42-C +1 power, making it a valid 4-power creature for Gleaming the Cube.",
    "Gleaming the Cube triggers Encounter Suit’s ward ability on Sample 42-C, preventing its destruction.",
    "Kangaphant’s end-of-turn effect tries to destroy Kartanoo, but the ward from Encounter Suit saves it.",
    "Gleaming the Cube uses Sample 42-C’s action ability to forge a key for free.",
  ],
  solution: {
    steps: [
      "Play Encounter Suit on Kartanoo. Encounter Suit wards Kartanoo.",
      "Reap with Kartanoo.",
      "Use Kartanoo’s after-reap ability to use Cauldron. Cauldron draws Animating Force (the top card of your deck) and plays it.",
      "Sequential play, Animating Force: target Sample 42-C and place it on the left. Sample 42-C is now a 4-power creature.",
      "Sequential play, Refit: move Encounter Suit from Kartanoo to Sample 42-C. Encounter Suit wards Kartanoo as it leaves, then wards Sample 42-C when it attaches.",
      "Sequential play, Gleaming the Cube: Encounter Suit puts a ward token on Sample 42-C. Gleaming the Cube then uses Sample 42-C’s action ability, forging a key for free (choose red). The purge is blocked by Sample 42-C’s ward token.",
      "End of turn: Kangaphant tries to destroy Kartanoo, but Kartanoo’s ward (applied when Encounter Suit left) absorbs the effect.",
    ],
    commentary:
      "The key insight is that Encounter Suit wards its host when it moves away, so Kartanoo keeps a ward even after Refit relocates the upgrade. Sample 42-C then gains its own ward from Encounter Suit attaching to it, which blocks Gleaming the Cube’s destruction. Both creatures survive the turn, and Kangaphant’s threat is nullified.",
  },
  spec: {
    title: "Stirring the Pot",
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
