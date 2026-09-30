import { createRoute } from "@tanstack/react-router";
import { lazy } from "react";
import { rootRoute } from "../root";
import { puzzleModules } from "./puzzles";

const PuzzleDirectoryScreen = lazy(() =>
  import("./PuzzleDirectoryScreen").then((m) => ({
    default: m.PuzzleDirectoryScreen,
  }))
);
const PuzzleDetailScreen = lazy(() =>
  import("./PuzzleDetailScreen").then((m) => ({
    default: m.PuzzleDetailScreen,
  }))
);

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
