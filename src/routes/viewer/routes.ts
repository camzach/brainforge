import { createRoute } from "@tanstack/react-router";
import { lazy } from "react";
import { rootRoute } from "../root";

const CardViewerScreen = lazy(() =>
  import("./CardViewerScreen").then((m) => ({ default: m.CardViewerScreen }))
);

export const viewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/viewer",
  component: CardViewerScreen,
});
