import type { KeyforgePuzzle } from "../types";

const puzzle: KeyforgePuzzle = {
  id: "keep-the-sample",
  code: "eyJ2ZXJzaW9uIjoxLCJ0aXRsZSI6IktlZXAgdGhlIFNhbXBsZSIsImRlc2NyaXB0aW9uIjoiRm9yZ2UgYSBrZXkgdGhpcyB0dXJuIHdpdGhvdXQgbG9zaW5nIFNhbXBsZSA0Mi1DIG9yIEthcnRhbm9vLiIsInBsYXllcjEiOnsiaG91c2UiOiJzdGFyYWxsaWFuY2UiLCJob3VzZXMiOlsic3RhcmFsbGlhbmNlIiwiZ2Vpc3RvaWQiLCJ1bnRhbWVkIl0sImluUGxheSI6WyJrYXJ0YW5vbyIseyJjYXJkIjoic2FtcGxlLTQyLWMiLCJ0b2tlbnMiOnsiYW1iZXIiOjN9fV0sImhhbmQiOlsiZW5jb3VudGVyLXN1aXQiXSwiZGVjayI6WyJhbmltYXRpbmctZm9yY2UiXX0sInBsYXllcjIiOnsiaG91c2VzIjpbInVudGFtZWQiLCJzdGFyYWxsaWFuY2UiLCJzYW5jdHVtIl0sImFtYmVyIjoxLCJpblBsYXkiOlt7ImNhcmQiOiJjYXVsZHJvbiIsInVuZGVyIjpbInJlZml0IiwiZ2xlYW1pbmctdGhlLWN1YmUiXX0sImthbmdhcGhhbnQiXSwiaGFuZCI6WyJhbmNpZW50LWJlYXIiLCJhbmNpZW50LWJlYXIiLCJhbmNpZW50LWJlYXIiLCJhbmNpZW50LWJlYXIiLCJhbmNpZW50LWJlYXIiLCJhbmNpZW50LWJlYXIiXSwiZGVjayI6W119fQ",
  title: "Keep the Sample",
  publishedAt: "2024-04-01",
  difficulty: "Hard",
  author: "BrainForge",
  description:
    "Player 1 has Kartanoo and Sample 42-C (with 3 Æmber on it) in play, Encounter Suit in hand, and Animating Force on top of the deck. The opponent has a Cauldron (with Refit and Gleaming the Cube already stacked under it) and Kangaphant in play. Forge a key this turn without losing Sample 42-C or Kartanoo.",
  goal: "Forge a key while keeping both Sample 42-C and Kartanoo in play.",
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
