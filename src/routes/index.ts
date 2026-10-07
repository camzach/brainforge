import { createRoute } from "@tanstack/react-router";
import { lazy } from "react";
import { rootRoute } from "./root";

const HomeScreen = lazy(() =>
  import("./HomeScreen").then((m) => ({ default: m.HomeScreen }))
);

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeScreen,
});
