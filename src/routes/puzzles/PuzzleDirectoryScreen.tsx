import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import styles from "./puzzles.module.css";
import { puzzlesDirectoryRoute } from "./routes";

export function PuzzleDirectoryScreen() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const puzzles = puzzlesDirectoryRoute.useLoaderData();
  console.log(puzzles);

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
            placeholder="Search puzzles by title, goal, or cards..."
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
        {puzzles.map((puzzle) => {
          const house = puzzle.setup.activeHouse;
          return (
            <div
              key={puzzle.id}
              className={styles.puzzleCard}
              onClick={() =>
                navigate({
                  to: "/puzzles/$puzzleId",
                  params: { puzzleId: puzzle.id },
                })
              }
            >
              <div className={styles.puzzleCardTop}>
                <span className={styles.puzzleDate}>
                  📅 {puzzle.publishedAt}
                </span>
                {puzzle.difficulty && (
                  <span
                    className={`${styles.difficultyTag} ${styles[puzzle.difficulty.toLowerCase() as keyof typeof styles]}`}
                  >
                    {puzzle.difficulty}
                  </span>
                )}
              </div>

              <h3 className={styles.puzzleTitle}>{puzzle.title}</h3>

              {puzzle.description && (
                <p className={styles.puzzleCardDesc}>{puzzle.description}</p>
              )}

              <div className={styles.puzzleCardGoal}>
                <strong>Goal: </strong>
                <span>{puzzle.goal}</span>
              </div>

              <div className={styles.puzzleCardFooter}>
                <div className={styles.puzzleTags}>
                  {house && (
                    <span className={styles.houseTagBadge}>House: {house}</span>
                  )}
                  {puzzle.hints && puzzle.hints.length > 0 && (
                    <span className={styles.hintsBadge}>
                      💡 {puzzle.hints.length} hint
                      {puzzle.hints.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                <Link
                  to="/puzzles/$puzzleId"
                  params={{ puzzleId: puzzle.id }}
                  className="btn btn-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  Solve →
                </Link>
              </div>
            </div>
          );
        })}

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
