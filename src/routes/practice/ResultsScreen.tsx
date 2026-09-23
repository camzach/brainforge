type Props = {
  score: number;
  onNewGame: () => void;
  onReplay: () => void;
};

export function ResultsScreen({ score, onNewGame, onReplay }: Props) {
  return (
    <div id="center">
      <h1>Game Over!</h1>
      <div className="final-score">
        <span className="score-label">Final Score</span>
        <span className="score-value">{score}</span>
      </div>
      <div className="button-group">
        <button onClick={onReplay}>Play Again</button>
        <button onClick={onNewGame}>New Setup</button>
      </div>
    </div>
  );
}