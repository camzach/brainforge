import type { KeyforgePuzzle } from "../types";

// ── Layout test ───────────────────────────────────────────────────────────────
// This puzzle exists solely to exercise every rendering feature of the puzzle
// detail page. It is not a real puzzle.
//
// Zones covered:          friendly + opponent
//   Hand, Artifacts, Battleline, Archive, Discard, Deck (draw)
//
// Card states covered:
//   ready (default), exhausted (ready: false)
//   amber badge, damage badge, upgrade badge
//   stack (underneath), deep stack (>3 cards shows count correctly)
//
// Player-strip covered:
//   aember count, all 3 keys (mixed forged/unforged), chains
//
// Puzzle metadata covered:
//   difficulty, author, description, goal, hints (3), solution w/ overview +
//   steps + explanation, additionalNotes

const puzzle: KeyforgePuzzle = {
  id: "layout-test",
  title: "Layout Test — Every Feature",
  publishedAt: "2024-01-01",
  difficulty: "Easy",
  author: "BrainForge",
  description:
    "This is a layout test puzzle that exercises every visual feature of the puzzle detail page: all zones, all card badges, stacks, exhausted cards, both player strips, hints, and solution blocks.",
  goal: "Verify that every UI element renders correctly.",
  setup: {
    activeHouse: "Shadows",
    keyCost: 6,
    friendly: {
      aember: 5,
      keys: { red: true, blue: true, yellow: false },
      chains: 3,
      // Hand — plain slugs
      hand: ["bait-and-switch", "ronnie-wristclocks", "miasma", "key-charge"],
      // Artifacts — one plain, one with amber on it
      artifacts: [
        { slug: "phase-shift" },
        { slug: "loot-the-bodies", amber: 2 },
      ],
      // Battleline — exercises: ready, exhausted, amber, damage, upgrade, stack
      battleline: [
        // Ready card with amber token
        { slug: "dodger", amber: 3 },
        // Exhausted card with damage
        { slug: "dodger", ready: false, damage: 2 },
        // Card with an upgrade attached
        {
          slug: "hydrogan",
          upgrades: [{ slug: "poison-wave" }],
        },
        // Card with all three badges simultaneously
        {
          slug: "hydrogan",
          ready: false,
          amber: 1,
          damage: 4,
          upgrades: [{ slug: "protect-the-weak" }],
        },
        // Shallow stack (2 underneath → fan shows 3 cards)
        {
          slug: "cauldron",
          underneath: [{ slug: "bad-penny" }, { slug: "toad" }],
        },
        // Deep stack (13 underneath → count badge = 13)
        {
          slug: "cauldron",
          underneath: [
            { slug: "toad" },
            { slug: "toad" },
            { slug: "toad" },
            { slug: "toad" },
            { slug: "toad" },
            { slug: "toad" },
            { slug: "toad" },
            { slug: "toad" },
            { slug: "toad" },
            { slug: "toad" },
            { slug: "toad" },
            { slug: "toad" },
            { slug: "toad" },
          ],
        },
        // Lots of shit to cause a scroll
        ...Array.from(new Array(6), () => ({ slug: "toad" })),
      ],
      // Right-column zones
      archive: ["bait-and-switch", "miasma"],
      discard: ["ronnie-wristclocks", "key-charge", "dodger"],
      draw: ["bad-penny", "toad"],
    },
    opponent: {
      aember: 10,
      keys: { red: false, yellow: false, blue: false },
      // Hand
      hand: ["bait-and-switch", "miasma"],
      // Artifacts
      artifacts: [{ slug: "loot-the-bodies" }],
      // Battleline — mix of ready and exhausted
      battleline: [
        { slug: "bad-penny", ready: true },
        { slug: "bad-penny", ready: false },
        { slug: "bad-penny", ready: false, damage: 1 },
        { slug: "bad-penny", amber: 1 },
        { slug: "bad-penny", ready: false, amber: 2, damage: 3 },
      ],
      // Right-column zones
      archive: ["toad"],
      discard: ["bad-penny", "dodger"],
      draw: ["miasma", "key-charge", "toad"],
    },
    additionalNotes: [
      "Key cost is 6 Æmber.",
      "This puzzle is for layout testing only — it is not solvable.",
      "Every card badge, zone, and UI state should be visible on this page.",
    ],
  },
  hints: [
    "This is hint 1 — check that the hint toggle reveals and hides text.",
    "This is hint 2 — multiple hints should stack without overlapping.",
    "This is hint 3 — the last hint should have no extra bottom margin.",
  ],
  solution: {
    overview: "This is the solution overview paragraph.",
    steps: [
      "Step 1 — the ordered list should be indented and readable.",
      "Step 2 — line height should be comfortable for multi-line steps that wrap across the available width.",
      "Step 3 — the last step should have no extra bottom margin inside the list.",
    ],
    explanation:
      "This is the explanation paragraph, shown in italic dimmed text below the steps.",
  },
};

export default puzzle;
