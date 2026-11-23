import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { KeyforgePuzzle } from "./types";
import styles from "./puzzles.module.css";
import { puzzlesDirectoryRoute } from "./routes";
import { getPlayUrl } from "./encode";

type Reveal = number | "solution" | null;

function PuzzleCard({ puzzle }: { puzzle: KeyforgePuzzle }) {
  // Which hint (by index) or the solution is open. Only one at a time.
  const [open, setOpen] = useState<Reveal>(null);
  // How many solution steps have been revealed so far.
  const [revealedSteps, setRevealedSteps] = useState(0);
  const toggle = (which: Reveal) =>
    setOpen((current) => (current === which ? null : which));
  const { hints, solution } = puzzle;

  return (
    <div className={styles.puzzleCard}>
      <div className={styles.puzzleCardTop}>
        <span className={styles.puzzleDate}>📅 {puzzle.publishedAt}</span>
        {puzzle.difficulty && (
          <span
            className={`${styles.difficultyTag} ${styles[puzzle.difficulty.toLowerCase() as keyof typeof styles]}`}
          >
            {puzzle.difficulty}
          </span>
        )}
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
        <a href={getPlayUrl(puzzle.spec)} className="btn btn-primary">
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
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const puzzles = puzzlesDirectoryRoute.useLoaderData();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.navTop}>
          <Link to="/" className="btn btn-ghost">
            ← Back
          </Link>
        </div>
        <h1>KeyForge Puzzle Directory</h1>
        <p className={styles.subtitle}>
          Sharpen your piloting skills with tactical scenarios, sequencing
          puzzles, and lethal math challenges.
        </p>
      </header>

      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search puzzles by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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

      <div className={styles.puzzleGrid}>
        {puzzles.map((puzzle) => (
          <PuzzleCard key={puzzle.id} puzzle={puzzle} />
        ))}

        {puzzles.length === 0 && (
          <div className={styles.noPuzzlesMessage}>
            <p>No puzzles matched your current search and filters.</p>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setSearchTerm("");
                setDifficultyFilter("all");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
