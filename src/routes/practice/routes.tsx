import { createRoute, Link, useSearch } from "@tanstack/react-router";
import { lazy } from "react";
import { rootRoute } from "../root";
import {
  decodePracticeSearch,
  type PracticeSearchParams,
} from "./practice-utils";
import type { Expansion } from "../../types";

const SetupScreen = lazy(() =>
  import("./SetupScreen").then((m) => ({ default: m.SetupScreen }))
);
const ChallengeScreen = lazy(() =>
  import("./ChallengeScreen").then((m) => ({ default: m.ChallengeScreen }))
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
    return {
      exp: (search.exp as Expansion) || undefined,
      house: (search.house as PracticeSearchParams["house"]) || undefined,
      types: (search.types as string) || undefined,
      zones: (search.zones as string) || undefined,
    };
  },
  component: function PracticePlayRouteComponent() {
    const search = useSearch({ from: practicePlayRoute.id });
    const config = decodePracticeSearch(search);

    if (!config) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "64px 24px" }}>
          <h2>Invalid practice configuration</h2>
          <p style={{ color: "var(--text)" }}>Please select an expansion and card types from the setup screen.</p>
          <Link to="/practice/setup" className="btn btn-primary">← Return to Setup</Link>
        </div>
      );
    }

    return <ChallengeScreen config={config} />;
  },
});
