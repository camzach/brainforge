import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";

export const rootRoute = createRootRoute({
  component: () => (
    <Suspense>
      <Outlet />
    </Suspense>
  ),
});
