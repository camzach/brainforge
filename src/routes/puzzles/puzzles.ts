// Lazy glob — each puzzle becomes its own split chunk
import type { KeyforgePuzzle } from "./types";

export const puzzleModules = import.meta.glob<{ default: KeyforgePuzzle }>(
  "./data/*.ts",
);
