import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./routes/root";
import { indexRoute } from "./routes/index";
import {
  practiceSetupRoute,
  practicePlayRoute,
} from "./routes/practice/routes";
import { viewerRoute } from "./routes/viewer/routes";
import { keyfordleRoute } from "./routes/keyfordle/routes";

// Create Route Tree & Router
const routeTree = rootRoute.addChildren([
  indexRoute,
  practiceSetupRoute,
  practicePlayRoute,
  viewerRoute,
  keyfordleRoute,
]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
