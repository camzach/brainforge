import { Link } from "@tanstack/react-router";
import styles from "./puzzles.module.css";
import { puzzleDetailRoute } from "./routes";

const PLAY_URL = import.meta.env.DEV
  ? "http://localhost:4000/play"
  : "https://brainforge-puzzles.fly.dev/play";

export function PuzzleDetailScreen() {
  const puzzle = puzzleDetailRoute.useLoaderData();

  if (!puzzle) return null;

  return (
    <div className={styles.detailWrap}>
      <div>
        <Link to="/puzzles" className="btn btn-ghost">
          ← Puzzles
        </Link>
      </div>
      <div className={styles.detailTitle}>
        <span>{puzzle.title}</span>
        {puzzle.difficulty && (
          <span
            className={`${styles.difficultyTag} ${styles[puzzle.difficulty.toLowerCase() as keyof typeof styles]}`}
          >
            {puzzle.difficulty}
          </span>
        )}
      </div>
      {puzzle.description && (
        <p className={styles.detailDescription}>{puzzle.description}</p>
      )}
      <div className={styles.detailGoal}>{puzzle.goal}</div>
      <div>
        <a
          href={`${PLAY_URL}?code=${encodeURIComponent(puzzle.code)}`}
          className="btn btn-primary"
        >
          Play puzzle →
        </a>
      </div>
    </div>
  );
}
