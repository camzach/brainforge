import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { KeyforgePuzzle } from "./types";
import styles from "./puzzles.module.css";
import { puzzlesDirectoryRoute } from "./routes";
import { getPlayUrl } from "./encode";

const SUBMIT_EMAIL = "brainforge-puzzles@camza.ch";

type Reveal = number | "solution" | null;

function PuzzleCard({
  puzzle,
  featured,
}: {
  puzzle: KeyforgePuzzle;
  featured?: boolean;
}) {
  // Which hint (by index) or the solution is open. Only one at a time.
  const [open, setOpen] = useState<Reveal>(null);
  // How many solution steps have been revealed so far.
  const [revealedSteps, setRevealedSteps] = useState(0);
  const toggle = (which: Reveal) =>
    setOpen((current) => (current === which ? null : which));
  const { hints, solution } = puzzle;

  return (
    <div className={`${styles.puzzleCard} ${featured ? styles.featured : ""}`}>
      <div className={styles.puzzleCardTop}>
        <span className={styles.puzzleDate}>📅 {puzzle.publishedAt}</span>
        <span
          className={`${styles.difficultyTag} ${styles[puzzle.difficulty.toLowerCase() as keyof typeof styles]}`}
        >
          {puzzle.difficulty}
        </span>
      </div>

      <h3 className={styles.puzzleTitle}>{puzzle.spec.title}</h3>

      <p className={styles.puzzleCardDesc}>{puzzle.spec.description}</p>

      <div className={styles.puzzleCardFooter}>
        {(hints?.length || solution) && (
          <div className={styles.spoilerButtons}>
            {hints?.map((_, i) => (
              <button
                key={i}
                type="button"
                className={styles.spoilerButton}
                aria-pressed={open === i}
                aria-label={`Hint ${i + 1}`}
                title={`Hint ${i + 1}`}
                onClick={() => toggle(i)}
              >
                💡
              </button>
            ))}
            {solution && (
              <button
                type="button"
                className={styles.spoilerButton}
                aria-pressed={open === "solution"}
                onClick={() => toggle("solution")}
              >
                Solution
              </button>
            )}
          </div>
        )}
        <a
          href={getPlayUrl(puzzle.spec)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Play →
        </a>
      </div>

      {typeof open === "number" && hints && (
        <div className={styles.spoilerPanel}>
          <strong>Hint {open + 1}</strong>
          <p>{hints[open]}</p>
        </div>
      )}
      {open === "solution" && solution && (
        <div className={styles.spoilerPanel}>
          {revealedSteps > 0 && (
            <ol>
              {solution.steps.slice(0, revealedSteps).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          )}
          {revealedSteps < solution.steps.length ? (
            <div className={styles.spoilerActions}>
              <button
                type="button"
                className={styles.spoilerButton}
                onClick={() => setRevealedSteps(revealedSteps + 1)}
              >
                {revealedSteps === 0 ? "Show first step" : "Show next step"} (
                {revealedSteps}/{solution.steps.length})
              </button>
              <button
                type="button"
                className={styles.spoilerButton}
                onClick={() => setRevealedSteps(solution.steps.length)}
              >
                Show all
              </button>
            </div>
          ) : (
            solution.commentary && <p>{solution.commentary}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function PuzzleDirectoryScreen() {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const puzzles = puzzlesDirectoryRoute.useLoaderData();
  // Newest first; the newest puzzle is featured. Ties keep their original order.
  const sorted = puzzles
    .filter(
      (p) => difficultyFilter === "all" || p.difficulty === difficultyFilter,
    )
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.navTop}>
          <Link to="/" className="btn btn-ghost">
            ← Back
          </Link>
        </div>
        <h1>Rooftop Laboratory</h1>
      </header>

      <div className={styles.controlsBar}>
        <div className={styles.filtersRow}>
          <div className={styles.filterItem}>
            <label htmlFor="difficulty-filter">Difficulty:</label>
            <select
              id="difficulty-filter"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.puzzleGrid}>
          {sorted.map((puzzle, i) => (
            <PuzzleCard
              key={puzzle.spec.title}
              puzzle={puzzle}
              featured={i === 0}
            />
          ))}

          {sorted.length === 0 && (
            <div className={styles.noPuzzlesMessage}>
              <p>No puzzles match this difficulty.</p>
              <button
                className="btn btn-ghost"
                onClick={() => setDifficultyFilter("all")}
              >
                Show all puzzles
              </button>
            </div>
          )}
        </div>

        <aside className={styles.submitCard}>
          <h3 className={styles.puzzleTitle}>Submit a puzzle</h3>
          <p>
            Do you have an idea for a puzzle? Share it with me and I may feature
            it here!
          </p>
          <p>Please include:</p>
          <ul>
            <li>
              The goal (e.g. "Forge a key", "Get to check", "Stop your
              opponent's key")
            </li>
            <li>The puzzle setup</li>
            <li>Your step-by-step solution</li>
            <li>The name you want credited</li>
          </ul>
          <p>
            Send your puzzle to{" "}
            <a href={`mailto:${SUBMIT_EMAIL}`}>{SUBMIT_EMAIL}</a>.
          </p>
        </aside>
      </div>
    </div>
  );
}
