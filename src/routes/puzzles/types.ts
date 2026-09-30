type CardInPlay = {
  slug: string;
  ready?: boolean;
  amber?: number;
  damage?: number;
  upgrades?: CardInPlay[];
  tokens?: Record<string, number>;
  /** Cards placed underneath this card. Index 0 = directly under the top card. */
  underneath?: CardInPlay[];
};

type PlayerState = {
  hand?: string[];
  battleline?: CardInPlay[];
  artifacts?: CardInPlay[];
  draw?: string[];
  discard?: string[];
  archive?: string[];
  chains?: number;
  aember?: number;
  keys?: Record<"red" | "blue" | "yellow", boolean>;
};

type PuzzleSetup = {
  activeHouse?: string;
  keyCost?: number;
  friendly: PlayerState;
  opponent: PlayerState;

  additionalNotes?: string[];
};

export type KeyforgePuzzle = {
  id: string;
  title: string;
  publishedAt: string; // YYYY-MM-DD
  difficulty?: "Easy" | "Medium" | "Hard" | "Expert";
  author?: string;
  description?: string;
  goal: string;
  setup: PuzzleSetup;
  hints?: string[];
  solution: {
    overview?: string;
    steps: string[];
    explanation?: string;
  };
};
