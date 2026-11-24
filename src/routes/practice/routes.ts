import { createRoute } from "@tanstack/react-router";
import { lazy } from "react";
import { rootRoute } from "../root";
import type { PracticeSearchParams } from "./practice-utils";
import type { Expansion } from "../../types";
import { EXPANSIONS } from "../../types";

const SetupScreen = lazy(() =>
  import("./SetupScreen").then((m) => ({ default: m.SetupScreen }))
);
const PracticePlayRoute = lazy(() =>
  import("./PracticePlayRoute").then((m) => ({ default: m.PracticePlayRoute }))
);

export const practiceSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/setup",
  component: SetupScreen,
});

export const practicePlayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/play",
  validateSearch: (search: Record<string, unknown>): PracticeSearchParams => {
    const rawExp = search.exp !== undefined ? Number(search.exp) : undefined;
    const exp = rawExp && rawExp in EXPANSIONS ? (rawExp as Expansion) : undefined;
    return {
      exp,
      house: (search.house as PracticeSearchParams["house"]) || undefined,
      types: (search.types as string) || undefined,
      zones: (search.zones as string) || undefined,
    };
  },
  component: PracticePlayRoute,
});
