import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../root";
import { PuzzleDirectoryScreen } from "./PuzzleDirectoryScreen";
import { PuzzleDetailScreen } from "./PuzzleDetailScreen";
import { puzzleModules } from "./puzzles";

async function loadAll() {
  const modules = await Promise.all(Object.values(puzzleModules).map((m) => m()));
  return modules.map((m) => m.default);
}

export const puzzlesDirectoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/puzzles",
  component: PuzzleDirectoryScreen,
  loader: () => loadAll(),
});

export const puzzleDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/puzzles/$puzzleId",
  component: PuzzleDetailScreen,
  loader: async ({ params }) => {
    const all = await loadAll();
    return all.find((p) => p.id === params.puzzleId);
  },
});
