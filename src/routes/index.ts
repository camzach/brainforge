import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { HomeScreen } from "./HomeScreen";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeScreen,
});
