import type { KeyforgePuzzle } from "../types";

const puzzle: KeyforgePuzzle = {
  id: "keep-the-sample",
  title: "Keep the Sample",
  publishedAt: "2024-04-01",
  difficulty: "Hard",
  author: "BrainForge",
  description:
    "Player 1 has Kartanoo and Sample 42-C (with 3 Æmber on it) in play, Encounter Suit in hand, and Animating Force on top of the deck. The opponent has a Cauldron (with Refit and Gleaming the Cube already stacked under it) and Kangaphant in play. Forge a key this turn without losing Sample 42-C or Kartanoo.",
  goal: "Forge a key while keeping both Sample 42-C and Kartanoo in play.",
  setup: {
    activeHouse: "Star Alliance",
    friendly: {
      hand: ["encounter-suit"],
      battleline: [{ slug: "kartanoo" }],
      artifacts: [{ slug: "sample-42c", amber: 3 }],
      draw: ["animating-force"],
    },
    opponent: {
      aember: 1,
      battleline: [
        {
          slug: "cauldron",
          underneath: [{ slug: "gleaming-the-cube" }, { slug: "refit" }],
        },
        { slug: "kangaphant" },
      ],
    },
    additionalNotes: [
      "Cards under Cauldron are in order (top to bottom): Refit, Gleaming the Cube.",
      "Animating Force is the top card of the player's deck.",
      "Kartanoo's after-reap ability lets the player use a friendly or enemy artifact.",
      "Cauldron's action draws a card and plays it, sequentially triggering the remaining cards beneath it.",
      "Gleaming the Cube uses a friendly creature, then destroys it (blocked by a ward token).",
      "Refit moves an upgrade from one friendly creature to another.",
      "Kangaphant destroys the weakest friendly creature at end of turn.",
    ],
  },
  hints: [
    "Encounter Suit wards Kartanoo before being moved by Refit — the ward stays on Kartanoo.",
    "Animating Force gives Sample 42-C +1 power, making it a valid 4-power creature for Gleaming the Cube.",
    "Gleaming the Cube triggers Encounter Suit's ward ability on Sample 42-C, preventing the destruction.",
    "Kangaphant's end-of-turn effect tries to destroy Kartanoo, but the ward from Encounter Suit saves it.",
    "Gleaming the Cube uses Sample 42-C's action ability to forge a key for free.",
  ],
  solution: {
    overview:
      "Equip Encounter Suit on Kartanoo, reap with Kartanoo to trigger Cauldron via its after-reap, then let the sequential plays of Animating Force → Refit → Gleaming the Cube forge a key while wards protect both creatures.",
    steps: [
      "Play Encounter Suit on Kartanoo. Encounter Suit wards Kartanoo.",
      "Reap with Kartanoo.",
      "Use Kartanoo's after-reap ability to use the Cauldron. Cauldron draws Animating Force (top of deck) and plays it.",
      "Sequential play — Animating Force: target Sample 42-C, placing it to the Left. Sample 42-C is now a 4-power creature.",
      "Sequential play — Refit: move Encounter Suit from Kartanoo to Sample 42-C. Encounter Suit wards Kartanoo as it leaves, then wards Sample 42-C when it attaches.",
      "Sequential play — Gleaming the Cube: triggers Encounter Suit on Sample 42-C to apply a ward token. Gleaming the Cube then uses Sample 42-C's action ability, forging a key for free (choosing red). The purge is blocked by Sample 42-C's ward token.",
      "End of turn: Kangaphant attempts to destroy Kartanoo, but Kartanoo's ward (applied when Encounter Suit left) absorbs the effect.",
    ],
    explanation:
      "The key insight is that Encounter Suit wards its host when it moves away, meaning Kartanoo retains a ward even after Refit relocates the upgrade. Sample 42-C then gains its own ward from Encounter Suit attaching to it, which blocks Gleaming the Cube's destruction. Both creatures survive the turn with Kangaphant's threat nullified.",
  },
};

export default puzzle;
