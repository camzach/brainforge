import { Suspense, useState } from "react";
import { Link } from "@tanstack/react-router";
import classNames from "classnames";
import styles from "./puzzles.module.css";
import { puzzleDetailRoute } from "./routes";
import type { KeyforgePuzzle } from "./types";
import { CardThumb } from "./CardThumb";

type CardInPlay = NonNullable<
  NonNullable<KeyforgePuzzle["setup"]["friendly"]["battleline"]>[number]
>;

type PlayerSetup = KeyforgePuzzle["setup"]["friendly" | "opponent"];

type BoardZoneProps = {
  label: string;
  cards: (CardInPlay | string)[];
  stack?: boolean;
};

function BoardZone({ label, cards, stack }: BoardZoneProps) {
  if (!cards.length) return null;

  // Collapse the zone into a single stacked CardThumb: top card with the rest underneath.
  if (stack && cards.length > 0) {
    const toCardInPlay = (c: CardInPlay | string): CardInPlay =>
      typeof c === "string" ? { slug: c } : c;
    const [top, ...rest] = cards.map(toCardInPlay);
    const stacked: CardInPlay = { ...top, underneath: rest };
    return (
      <div className={styles.boardZone}>
        <div className={styles.zoneName}>{label}</div>
        <div className={styles.cardRow}>
          <Suspense fallback={null}>
            <CardThumb id={`${label}-stack`} card={stacked} />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.boardZone}>
      <div className={styles.zoneName}>{label}</div>
      <div className={styles.cardRow}>
        {cards.map((c, i) => {
          const id = typeof c === "string" ? c : `${c.slug}-${i}`;
          return (
            <Suspense key={id} fallback={null}>
              <CardThumb id={id} card={c} />
            </Suspense>
          );
        })}
      </div>
    </div>
  );
}

type BoardProps = {
  player: PlayerSetup;
  /** When true, reverses zone order so both Battlelines face the divider. */
  isOpponent?: boolean;
};

function Board({ player, isOpponent }: BoardProps) {
  const mainZones = isOpponent
    ? [
        { label: "Hand", cards: player.hand ?? [] },
        { label: "Artifacts", cards: player.artifacts ?? [] },
        { label: "Battleline", cards: player.battleline ?? [] },
      ]
    : [
        { label: "Battleline", cards: player.battleline ?? [] },
        { label: "Artifacts", cards: player.artifacts ?? [] },
        { label: "Hand", cards: player.hand ?? [] },
      ];

  const sideZones = isOpponent
    ? [
        { label: "Deck", cards: player.draw ?? [] },
        { label: "Discard", cards: player.discard ?? [] },
        { label: "Archive", cards: player.archive ?? [] },
      ]
    : [
        { label: "Archive", cards: player.archive ?? [] },
        { label: "Discard", cards: player.discard ?? [] },
        { label: "Deck", cards: player.draw ?? [] },
      ];

  return (
    <div className={styles.board}>
      {mainZones.map((z, i) => {
        const side = sideZones[i];
        const hasSide = side.cards.length > 0;
        return (
          <div key={z.label} className={styles.boardRow}>
            <BoardZone label={z.label} cards={z.cards} />
            {hasSide && (
              <BoardZone label={side.label} cards={side.cards} stack />
            )}
          </div>
        );
      })}
    </div>
  );
}

const KEY_COLORS: Record<"red" | "blue" | "yellow", string> = {
  red: "#ef4444",
  blue: "#60a5fa",
  yellow: "#f2d93b",
};

function PlayerStats({
  player,
  chains,
}: {
  player: PlayerSetup;
  chains?: number;
}) {
  return (
    <span className={styles.stripChip}>
      <img src="/aember.png" alt="æmber" className={styles.aemberIcon} />
      {player.aember ?? 0}
      <span className={styles.playerStats}>
        🔑
        {(["red", "blue", "yellow"] as const).map((color) => (
          <span
            key={color}
            className={classNames(styles.keyPip, {
              [styles.keyForged]: player.keys?.[color],
            })}
            style={{
              background: player.keys?.[color] ? KEY_COLORS[color] : undefined,
            }}
            title={`${color} key${player.keys?.[color] ? " (forged)" : ""}`}
          />
        ))}
      </span>
      {chains ? <span>⛓ {chains}</span> : null}
    </span>
  );
}

export function PuzzleDetailScreen() {
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  const puzzle = puzzleDetailRoute.useLoaderData();

  const toggleHint = (i: number) =>
    setRevealedHints((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );

  if (!puzzle) return null;

  const { setup } = puzzle;
  const f = setup.friendly;
  const o = setup.opponent;

  return (
    <div className={styles.detailWrap}>
      {/* ── Top bar ── */}
      <div className={styles.detailTopBar}>
        <Link to="/puzzles" className="btn btn-ghost">
          ← Puzzles
        </Link>
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
        <div className={styles.detailGoal}>{puzzle.goal}</div>
      </div>

      {/* ── Boards with stats embedded in the divider ── */}
      <Board player={o} isOpponent />
      <div className={styles.sideDivider}>
        <div className={styles.sideDividerRow}>
          <div className={styles.sideDividerLine} />
          <PlayerStats player={o} />
          <span>↑ Opponent · You ↓</span>
          <PlayerStats player={f} chains={f.chains} />
          <div className={styles.sideDividerLine} />
        </div>
      </div>
      <Board player={f} />

      {/* ── Hints + Solution ── */}
      <div className={styles.bottomRow}>
        {puzzle.hints && puzzle.hints.length > 0 && (
          <div className={styles.collapsible}>
            <div className={styles.collapseBar}>
              {puzzle.hints.map((hint, idx) => {
                const open = revealedHints.includes(idx);
                return (
                  <div key={idx} className={styles.hintItem}>
                    <button
                      className={styles.hintToggle}
                      onClick={() => toggleHint(idx)}
                    >
                      💡 Hint {idx + 1} {open ? "▲" : "▼"}
                    </button>
                    {open && <span className={styles.hintText}>{hint}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.solutionBlock}>
          <button
            className={classNames(styles.btnSolutionToggle, {
              [styles.revealed]: showSolution,
            })}
            onClick={() => setShowSolution(!showSolution)}
          >
            {showSolution ? "Hide Solution ▲" : "Reveal Solution ▼"}
          </button>
          {showSolution && (
            <div className={styles.solutionContent}>
              {puzzle.solution.overview && (
                <p className={styles.solutionOverview}>
                  {puzzle.solution.overview}
                </p>
              )}
              <ol className={styles.solutionSteps}>
                {puzzle.solution.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              {puzzle.solution.explanation && (
                <p className={styles.solutionExplanation}>
                  {puzzle.solution.explanation}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
