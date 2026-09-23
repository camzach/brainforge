import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../root";
import { CardViewerScreen } from "./CardViewerScreen";

export const viewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/viewer",
  component: CardViewerScreen,
});
