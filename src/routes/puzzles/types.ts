// Puzzle scenario consumed by the play app (https://brainforge-puzzles.fly.dev).
// Mirrors its JSON schema (version 1). Serialized as base64 JSON in the `code`
// query param — see encode.ts.

type KeyColor = "red" | "blue" | "yellow";
type PlayerNumber = 1 | 2;

type InPlayCardSpec = {
  card: string;
  /** Absolute counts; they replace printed values such as armor. */
  tokens?: Record<string, number>;
  damage?: number;
  exhausted?: boolean;
  upgrades?: string[];
  /** Faceup cards under this card, owned by the same player. */
  under?: string[];
};

type PlayerSpec = {
  house?: string;
  houses?: string[];
  amber?: number;
  chains?: number;
  keys?: Partial<Record<KeyColor, boolean>>;
  token?: string;
  inPlay?: (string | InPlayCardSpec)[];
  hand?: string[];
  /** The whole draw pile, top card first. Nothing is added. */
  deck?: string[];
  /** Top of the pile first. */
  discard?: string[];
  purged?: string[];
  archives?: string[];
};

type GoalCondition =
  | { type: "keys"; player?: PlayerNumber; count: number }
  | ({ type: "amber"; player?: PlayerNumber } & (
      | { min: number; max?: number }
      | { min?: number; max: number }
    ))
  | {
      type: "card";
      player?: PlayerNumber;
      card: string;
      location:
        | "play area"
        | "inPlay"
        | "hand"
        | "deck"
        | "discard"
        | "purged"
        | "archives";
      not?: boolean;
    };

type ActionArg = string | number | boolean | { card: string; location?: string };

type PuzzleAction = {
  player: PlayerNumber;
  action:
    | "clickCard"
    | "clickPrompt"
    | "endTurn"
    | "fightWith"
    | "forgeKey"
    | "moveCard"
    | "play"
    | "playCreature"
    | "playUpgrade"
    | "reap"
    | "scrap"
    | "useAction"
    | "useOmni";
  args?: ActionArg[];
};

export type PuzzleSpec = {
  /** Optional in the schema, but required here: our pages display these. */
  title: string;
  author?: string;
  description: string;
  player1?: PlayerSpec;
  player2?: PlayerSpec;
  goal?: GoalCondition | GoalCondition[];
  actions?: PuzzleAction[];
};

export type KeyforgePuzzle = {
  id: string;
  publishedAt: string; // YYYY-MM-DD
  difficulty?: "Easy" | "Medium" | "Hard" | "Expert";
  author?: string;
  hints?: string[];
  solution?: {
    steps: string[];
    /** Optional. Only for when the steps alone don’t explain the puzzle. */
    commentary?: string;
  };
  spec: PuzzleSpec;
};
