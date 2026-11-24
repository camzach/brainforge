import { getRouteApi, Link } from "@tanstack/react-router";
import { decodePracticeSearch } from "./practice-utils";
import { ChallengeScreen } from "./ChallengeScreen";

const route = getRouteApi("/practice/play");

export function PracticePlayRoute() {
  const search = route.useSearch();
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
}
