import { useCallback, useState } from "react";
import { SetupScreen } from "./screens/SetupScreen";
import { ChallengeScreen } from "./screens/ChallengeScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { CardViewerScreen } from "./screens/CardViewerScreen";
import "./App.css";
import type { GameConfig } from "./types";

type Screen = "setup" | "challenge" | "results" | "viewer";

function App() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [score, setScore] = useState<number>(0);

  const handleStart = useCallback((newConfig: GameConfig) => {
    setConfig(newConfig);
    setScreen("challenge");
  }, []);

  const handleFinish = useCallback((score: number) => {
    setScreen("results");
    setScore(score);
  }, []);

  if (screen === "viewer") {
    return (
      <div>
        <button 
          onClick={() => setScreen("setup")}
          style={{ margin: "1rem", padding: "0.5rem 1rem" }}
        >
          ← Back to Game
        </button>
        <CardViewerScreen />
      </div>
    );
  }

  if (screen === "challenge" && config) {
    return <ChallengeScreen config={config} onFinish={handleFinish} />;
  }

  if (screen === "results") {
    return (
      <ResultsScreen
        score={score}
        onNewGame={() => {
          setConfig(null);
          setScreen("setup");
        }}
        onReplay={() => setScreen("challenge")}
      />
    );
  }

  return (
    <div>
      <button 
        onClick={() => setScreen("viewer")}
        style={{ 
          position: "absolute",
          top: "1rem",
          right: "1rem",
          padding: "0.5rem 1rem",
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "4px",
          color: "white",
          cursor: "pointer"
        }}
      >
        Card Viewer
      </button>
      <SetupScreen onStart={handleStart} />
    </div>
  );
}

export default App;
