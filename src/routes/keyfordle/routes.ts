import { createRoute } from "@tanstack/react-router";
import { lazy } from "react";
import { rootRoute } from "../root";

const KeyfordleScreen = lazy(() =>
  import("./KeyfordleScreen.tsx").then((m) => ({
    default: m.KeyfordleScreen,
  })),
);

export const keyfordleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/keyfordle",
  component: KeyfordleScreen,
});
