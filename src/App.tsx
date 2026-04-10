import { useCallback, useState } from "react";
import { SetupScreen } from "./screens/SetupScreen";
import { ChallengeScreen } from "./screens/ChallengeScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import "./App.css";
import type { GameConfig } from "./types";

type Screen = "setup" | "challenge" | "results";

function App() {
  const [screen, setScreen] = useState<Screen>("challenge");
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

  return <SetupScreen onStart={handleStart} />;
}

export default App;
