import { Suspense, use, useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { countCards, getCardByIndex, queryCards } from "../../cards/card-db";
import type { Card } from "../../types";
import { getCardHouses } from "../../cards/card-image-utils";

import styles from "./KeyfordleScreen.module.css";

type GameMode = "daily" | "infinite";

function getDailyDateKey(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    // It's my game I can use whatever time zone I want
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

async function getDailyCard(dateKey = getDailyDateKey()): Promise<Card> {
  const uint8Buffer = new TextEncoder().encode(dateKey);
  const hash = await crypto.subtle.digest("SHA-256", uint8Buffer);
  const seed = new DataView(hash).getUint32(0);

  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  t = ((t ^ (t >>> 14)) >>> 0) / 4294967296;

  const count = await countCards();
  const n = Math.floor(t * count);

  const card = await getCardByIndex(n);
  if (!card) {
    throw new Error("Failed to get a card for the day");
  }
  return card;
}

async function getRandomCard(excludeSlug?: string): Promise<Card> {
  const count = await countCards();
  if (count <= 1) {
    const card = await getCardByIndex(0);
    if (!card) throw new Error("Failed to get a random card");
    return card;
  }

  let card: Card | null = null;
  for (let i = 0; i < 5; i++) {
    const n = Math.floor(Math.random() * count);
    card = await getCardByIndex(n);
    if (card && card.slug !== excludeSlug) {
      return card;
    }
  }

  return card || (await getCardByIndex(0))!;
}

const dailyCardPromise = getDailyCard();

type MatchStatus = "correct" | "partial" | "incorrect";

function compareSets<T>(targetList: T[], guessList: T[]): MatchStatus {
  const targetSet = new Set(targetList);
  const guessSet = new Set(guessList);

  const hasOverlap = guessList.some((item) => targetSet.has(item));
  if (!hasOverlap) return "incorrect";

  const isExact =
    targetSet.size === guessSet.size &&
    guessList.every((item) => targetSet.has(item));

  return isExact ? "correct" : "partial";
}

function compareNumeric(
  targetVal: number | undefined,
  guessVal: number | undefined,
): { status: MatchStatus; arrow?: "↑" | "↓" } {
  if (targetVal === undefined || guessVal === undefined) {
    return { status: targetVal === guessVal ? "correct" : "incorrect" };
  }
  if (targetVal === guessVal) {
    return { status: "correct" };
  }
  return {
    status: "incorrect",
    arrow: guessVal < targetVal ? "↑" : "↓",
  };
}

type LetterMatch = {
  char: string;
  status: MatchStatus;
};

function compareLetters(
  targetTitle: string,
  guessTitle: string,
): LetterMatch[] {
  const targetChars = Array.from(targetTitle);
  const guessChars = Array.from(guessTitle);

  // Count un-matched occurrences in target for partial (yellow) matching
  const targetCounts: Record<string, number> = {};
  for (const ch of targetChars) {
    const lower = ch.toLowerCase();
    targetCounts[lower] = (targetCounts[lower] || 0) + 1;
  }

  const results: LetterMatch[] = guessChars.map((char) => ({
    char,
    status: "incorrect",
  }));

  // First pass: exact position matches (green)
  guessChars.forEach((char, i) => {
    const tChar = targetChars[i];
    if (tChar && char.toLowerCase() === tChar.toLowerCase()) {
      results[i].status = "correct";
      const lower = char.toLowerCase();
      targetCounts[lower] = (targetCounts[lower] || 0) - 1;
    }
  });

  // Second pass: position mismatch but present in target (yellow)
  guessChars.forEach((char, i) => {
    if (results[i].status === "correct") return;
    const lower = char.toLowerCase();
    if (targetCounts[lower] && targetCounts[lower] > 0) {
      results[i].status = "partial";
      targetCounts[lower] -= 1;
    }
  });

  return results;
}

type GameStats = {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
  lastPlayedDate: string;
};

type DailyState = {
  guesses: Card[];
  givenUp: boolean;
};

const STATS_STORAGE_KEY = "brainforge:keyfordle:stats";
const DAILY_STATE_STORAGE_KEY_PREFIX = "brainforge:keyfordle:state:";

function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read Keyfordle stats from localStorage:", err);
  }
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: {},
    lastPlayedDate: "",
  };
}

function saveStats(stats: GameStats) {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn("Could not save Keyfordle stats to localStorage:", err);
  }
}

function loadDailyState(dateKey: string): DailyState {
  try {
    const raw = localStorage.getItem(DAILY_STATE_STORAGE_KEY_PREFIX + dateKey);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read daily state from localStorage:", err);
  }
  return { guesses: [], givenUp: false };
}

function saveDailyState(dateKey: string, state: DailyState) {
  try {
    localStorage.setItem(
      DAILY_STATE_STORAGE_KEY_PREFIX + dateKey,
      JSON.stringify(state),
    );
  } catch (err) {
    console.warn("Could not save daily state to localStorage:", err);
  }
}

function getCellStatusClass(status: MatchStatus) {
  switch (status) {
    case "correct":
      return styles.statusCorrect;
    case "partial":
      return styles.statusPartial;
    case "incorrect":
      return styles.statusIncorrect;
  }
}

function getTileStatusClass(status: MatchStatus) {
  switch (status) {
    case "correct":
      return styles.statusCorrectSolid;
    case "partial":
      return styles.statusPartialSolid;
    case "incorrect":
      return styles.statusIncorrectSolid;
  }
}

type KeyfordleGameViewProps = {
  mode: GameMode;
  targetCard: Card;
  state: DailyState;
  onGuess: (card: Card) => void;
  onGiveUp: () => void;
  onPlayAgain?: () => void;
  stats?: GameStats;
};

function KeyfordleGameView({
  mode,
  targetCard,
  state,
  onGuess,
  onGiveUp,
  onPlayAgain,
  stats,
}: KeyfordleGameViewProps) {
  const { guesses, givenUp } = state;
  const [currentGuess, setCurrentGuess] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const term = currentGuess.trim();
    if (term.length < 2) {
      return;
    }

    let active = true;
    const timeoutId = setTimeout(() => {
      queryCards({ search: term }).then((cards) => {
        if (active) {
          setSuggestions(cards.slice(0, 20).map((c) => c.title));
        }
      });
    }, 150);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [currentGuess]);

  const targetHouses = getCardHouses(targetCard);
  const targetExpansions = targetCard.expansions;

  const isSolved = guesses.length > 0 && guesses[0].slug === targetCard.slug;
  const isGameOver = isSolved || givenUp;

  const submit = useCallback(async () => {
    if (isGameOver) return;

    const term = currentGuess.trim();
    if (!term) return;

    const results = await queryCards({ exactSearch: term });
    if (results.length === 0) {
      setErrorMsg(`No card found matching "${term}"`);
      return;
    }

    const matchedCard = results[0];

    setErrorMsg(null);
    setCurrentGuess("");
    setSuggestions([]);

    if (guesses.some((g) => g.slug === matchedCard.slug)) {
      setErrorMsg(`"${matchedCard.title}" has already been guessed`);
      return;
    }

    onGuess(matchedCard);
  }, [currentGuess, guesses, isGameOver, onGuess]);

  return (
    <div className={styles.gameWrapper}>
      {/* Stats bar (Daily mode only) */}
      {mode === "daily" && stats && (
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Played</span>
            <span className={styles.statValue}>{stats.played}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Wins</span>
            <span className={styles.statValue}>{stats.wins}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Win %</span>
            <span className={styles.statValue}>
              {stats.played > 0
                ? Math.round((stats.wins / stats.played) * 100)
                : 0}
              %
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Streak</span>
            <span className={styles.statValue}>{stats.currentStreak}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Max Streak</span>
            <span className={styles.statValue}>{stats.maxStreak}</span>
          </div>
        </div>
      )}

      {/* Guess Histogram (Daily mode only) */}
      {mode === "daily" && stats && isGameOver && stats.wins > 0 && (
        <div className={styles.histogramCard}>
          <div className={styles.histogramHeading}>Guess Distribution</div>
          {(() => {
            const counts = Object.keys(stats.guessDistribution).map(Number);
            const maxGuess = counts.length > 0 ? Math.max(...counts, 6) : 6;
            const maxVal = Math.max(
              ...Object.values(stats.guessDistribution),
              1,
            );

            const rows = [];
            for (let i = 1; i <= maxGuess; i++) {
              const count = stats.guessDistribution[i] || 0;
              const pct = (count / maxVal) * 100;
              const isCurrentWin = isSolved && guesses.length === i;

              rows.push(
                <div key={i} className={styles.histogramRow}>
                  <span className={styles.histogramIndex}>{i}</span>
                  <div className={styles.histogramTrack}>
                    <div
                      className={`${styles.histogramFill} ${
                        isCurrentWin ? styles.histogramFillCurrent : ""
                      }`}
                      style={{
                        width: count > 0 ? `${Math.max(pct, 8)}%` : "0%",
                      }}
                    >
                      {count > 0 ? count : ""}
                    </div>
                  </div>
                </div>,
              );
            }
            return rows;
          })()}
        </div>
      )}

      {/* Outcome message */}
      {isSolved ? (
        <div className={`${styles.outcomeMessage} ${styles.messageSolved}`}>
          🎉 You got it in {guesses.length}{" "}
          {guesses.length === 1 ? "guess" : "guesses"}! The card was{" "}
          {targetCard.title}.
        </div>
      ) : givenUp ? (
        <div className={`${styles.outcomeMessage} ${styles.messageGivenUp}`}>
          💀 You gave up! The card was {targetCard.title}.
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className={styles.guessForm}
        >
          <div className={styles.inputWrapper}>
            <input
              value={currentGuess}
              placeholder="Type card name..."
              onChange={(e) => {
                const val = e.target.value;
                setCurrentGuess(val);
                if (val.trim().length < 2) {
                  setSuggestions([]);
                }
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className={styles.guessInput}
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className={styles.suggestionList}>
                {suggestions.map((title) => (
                  <li
                    key={title}
                    className={styles.suggestionItem}
                    onMouseDown={() => {
                      setCurrentGuess(title);
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                  >
                    {title}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" className="btn btn-primary">
            SUBMIT
          </button>
          <button
            type="button"
            onClick={onGiveUp}
            className={`btn ${styles.btnGiveUp}`}
          >
            GIVE UP
          </button>
        </form>
      )}

      {/* Play Again (Infinite mode only) */}
      {mode === "infinite" && isGameOver && onPlayAgain && (
        <div className={styles.playAgainWrapper}>
          <button
            type="button"
            onClick={onPlayAgain}
            className="btn btn-primary"
          >
            Play Again
          </button>
        </div>
      )}

      {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

      {guesses.length > 0 && (
        <>
          {/* Desktop: table */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Card</th>
                  <th>House(s)</th>
                  <th>Type</th>
                  <th>Power</th>
                  <th>Armor</th>
                  <th>Æmber</th>
                  <th>Expansion(s)</th>
                </tr>
              </thead>
              <tbody>
                {guesses.map((guess) => {
                  const houses = getCardHouses(guess);
                  const houseMatch = compareSets(targetHouses, houses);
                  const typeMatch: MatchStatus =
                    guess.type === targetCard.type ? "correct" : "incorrect";
                  const powerComparison = compareNumeric(
                    targetCard.power,
                    guess.power,
                  );
                  const armorComparison = compareNumeric(
                    targetCard.armor,
                    guess.armor,
                  );
                  const amberComparison = compareNumeric(
                    targetCard.amber,
                    guess.amber,
                  );
                  const expMatch = compareSets(
                    targetExpansions,
                    guess.expansions,
                  );

                  return (
                    <tr key={guess.slug}>
                      <td className={styles.cellTitle}>
                        <div className={styles.letterList}>
                          {compareLetters(targetCard.title, guess.title).map(
                            (lm, idx) => (
                              <span
                                key={idx}
                                className={`${styles.letterTile} ${getTileStatusClass(lm.status)}`}
                              >
                                {lm.char === " " ? "\u00A0" : lm.char}
                              </span>
                            ),
                          )}
                        </div>
                      </td>
                      <td className={getCellStatusClass(houseMatch)}>
                        {houses.join(", ")}
                      </td>
                      <td className={getCellStatusClass(typeMatch)}>
                        {guess.type}
                      </td>
                      <td className={getCellStatusClass(powerComparison.status)}>
                        <span>
                          {guess.power ?? "-"}
                          {powerComparison.arrow && (
                            <span className={styles.arrow}>
                              {" "}
                              ({powerComparison.arrow})
                            </span>
                          )}
                        </span>
                      </td>
                      <td className={getCellStatusClass(armorComparison.status)}>
                        <span>
                          {guess.armor ?? "-"}
                          {armorComparison.arrow && (
                            <span className={styles.arrow}>
                              {" "}
                              ({armorComparison.arrow})
                            </span>
                          )}
                        </span>
                      </td>
                      <td className={getCellStatusClass(amberComparison.status)}>
                        <span>
                          {guess.amber ?? 0}
                          {amberComparison.arrow && (
                            <span className={styles.arrow}>
                              {" "}
                              ({amberComparison.arrow})
                            </span>
                          )}
                        </span>
                      </td>
                      <td className={getCellStatusClass(expMatch)}>
                        {guess.expansions.join(", ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: flex cards */}
          <div className={styles.guessList}>
            {guesses.map((guess) => {
              const houses = getCardHouses(guess);
              const houseMatch = compareSets(targetHouses, houses);
              const typeMatch: MatchStatus =
                guess.type === targetCard.type ? "correct" : "incorrect";
              const powerComparison = compareNumeric(
                targetCard.power,
                guess.power,
              );
              const armorComparison = compareNumeric(
                targetCard.armor,
                guess.armor,
              );
              const amberComparison = compareNumeric(
                targetCard.amber,
                guess.amber,
              );
              const expMatch = compareSets(targetExpansions, guess.expansions);

              return (
                <div key={guess.slug} className={styles.guessRow}>
                  <div
                    className={`${styles.guessCell} ${styles.guessCellTitle}`}
                  >
                    <span className={styles.cellLabel}>Card</span>
                    <div className={styles.letterList}>
                      {compareLetters(targetCard.title, guess.title).map(
                        (lm, idx) => (
                          <span
                            key={idx}
                            className={`${styles.letterTile} ${getTileStatusClass(lm.status)}`}
                          >
                            {lm.char === " " ? "\u00A0" : lm.char}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                  <div
                    className={`${styles.guessCell} ${getCellStatusClass(houseMatch)}`}
                  >
                    <span className={styles.cellLabel}>House(s)</span>
                    {houses.join(", ")}
                  </div>
                  <div
                    className={`${styles.guessCell} ${getCellStatusClass(typeMatch)}`}
                  >
                    <span className={styles.cellLabel}>Type</span>
                    {guess.type}
                  </div>
                  <div
                    className={`${styles.guessCell} ${getCellStatusClass(powerComparison.status)}`}
                  >
                    <span className={styles.cellLabel}>Power</span>
                    <span>
                      {guess.power ?? "-"}
                      {powerComparison.arrow && (
                        <span className={styles.arrow}>
                          {" "}
                          ({powerComparison.arrow})
                        </span>
                      )}
                    </span>
                  </div>
                  <div
                    className={`${styles.guessCell} ${getCellStatusClass(armorComparison.status)}`}
                  >
                    <span className={styles.cellLabel}>Armor</span>
                    <span>
                      {guess.armor ?? "-"}
                      {armorComparison.arrow && (
                        <span className={styles.arrow}>
                          {" "}
                          ({armorComparison.arrow})
                        </span>
                      )}
                    </span>
                  </div>
                  <div
                    className={`${styles.guessCell} ${getCellStatusClass(amberComparison.status)}`}
                  >
                    <span className={styles.cellLabel}>Æmber</span>
                    <span>
                      {guess.amber ?? 0}
                      {amberComparison.arrow && (
                        <span className={styles.arrow}>
                          {" "}
                          ({amberComparison.arrow})
                        </span>
                      )}
                    </span>
                  </div>
                  <div
                    className={`${styles.guessCell} ${getCellStatusClass(expMatch)}`}
                  >
                    <span className={styles.cellLabel}>Expansion(s)</span>
                    {guess.expansions.join(", ")}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function DailyKeyfordleCard({
  stats,
  setStats,
  dailyState,
  setDailyState,
  dateKey,
}: {
  stats: GameStats;
  setStats: React.Dispatch<React.SetStateAction<GameStats>>;
  dailyState: DailyState;
  setDailyState: React.Dispatch<React.SetStateAction<DailyState>>;
  dateKey: string;
}) {
  const targetCard = use(dailyCardPromise);

  const handleGuess = useCallback(
    (matchedCard: Card) => {
      const nextGuesses = [matchedCard, ...dailyState.guesses];
      const nextState: DailyState = { ...dailyState, guesses: nextGuesses };
      setDailyState(nextState);
      saveDailyState(dateKey, nextState);

      if (matchedCard.slug === targetCard.slug) {
        setStats((prev) => {
          if (prev.lastPlayedDate === dateKey) return prev;

          const guessCount = nextGuesses.length;
          const newWins = prev.wins + 1;
          const newPlayed = prev.played + 1;
          const newStreak = prev.currentStreak + 1;
          const newMaxStreak = Math.max(prev.maxStreak, newStreak);
          const newDistribution = {
            ...prev.guessDistribution,
            [guessCount]: (prev.guessDistribution[guessCount] || 0) + 1,
          };

          const updated: GameStats = {
            played: newPlayed,
            wins: newWins,
            currentStreak: newStreak,
            maxStreak: newMaxStreak,
            guessDistribution: newDistribution,
            lastPlayedDate: dateKey,
          };
          saveStats(updated);
          return updated;
        });
      }
    },
    [dailyState, dateKey, setDailyState, setStats, targetCard.slug],
  );

  const handleGiveUp = useCallback(() => {
    const nextState: DailyState = { ...dailyState, givenUp: true };
    setDailyState(nextState);
    saveDailyState(dateKey, nextState);

    setStats((prev) => {
      if (prev.lastPlayedDate === dateKey) return prev;

      const updated: GameStats = {
        played: prev.played + 1,
        wins: prev.wins,
        currentStreak: 0,
        maxStreak: prev.maxStreak,
        guessDistribution: prev.guessDistribution,
        lastPlayedDate: dateKey,
      };
      saveStats(updated);
      return updated;
    });
  }, [dailyState, dateKey, setDailyState, setStats]);

  return (
    <KeyfordleGameView
      key={dateKey}
      mode="daily"
      targetCard={targetCard}
      state={dailyState}
      onGuess={handleGuess}
      onGiveUp={handleGiveUp}
      stats={stats}
    />
  );
}

function InfiniteKeyfordleCard({
  infiniteCardPromise,
  infiniteState,
  setInfiniteState,
  onPlayAgain,
}: {
  infiniteCardPromise: Promise<Card>;
  infiniteState: DailyState;
  setInfiniteState: React.Dispatch<React.SetStateAction<DailyState>>;
  onPlayAgain: () => void;
}) {
  const targetCard = use(infiniteCardPromise);

  const handleGuess = useCallback(
    (matchedCard: Card) => {
      const nextGuesses = [matchedCard, ...infiniteState.guesses];
      const nextState: DailyState = { ...infiniteState, guesses: nextGuesses };
      setInfiniteState(nextState);
    },
    [infiniteState, setInfiniteState],
  );

  const handleGiveUp = useCallback(() => {
    const nextState: DailyState = { ...infiniteState, givenUp: true };
    setInfiniteState(nextState);
  }, [infiniteState, setInfiniteState]);

  return (
    <KeyfordleGameView
      key={targetCard.slug}
      mode="infinite"
      targetCard={targetCard}
      state={infiniteState}
      onGuess={handleGuess}
      onGiveUp={handleGiveUp}
      onPlayAgain={onPlayAgain}
    />
  );
}

export function KeyfordleScreen() {
  const dateKey = getDailyDateKey();

  const [mode, setMode] = useState<GameMode>("daily");
  const [dailyState, setDailyState] = useState<DailyState>(() =>
    loadDailyState(dateKey),
  );
  const [stats, setStats] = useState<GameStats>(() => loadStats());
  const [infiniteState, setInfiniteState] = useState<DailyState>({
    guesses: [],
    givenUp: false,
  });
  const [infiniteCardPromise, setInfiniteCardPromise] = useState<Promise<Card>>(
    () => getRandomCard(),
  );

  const handlePlayAgain = useCallback(() => {
    setInfiniteCardPromise((prevPromise) =>
      prevPromise
        .then((prevCard) => getRandomCard(prevCard.slug))
        .catch(() => getRandomCard()),
    );
    setInfiniteState({ guesses: [], givenUp: false });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.back}>
        <Link to="/" className="btn btn-ghost">
          ← Back
        </Link>
      </div>

      <h1 className={styles.title}>Keyfordle</h1>

      <div
        className={styles.modeToggleGroup}
        role="tablist"
        aria-label="Game Mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "daily"}
          className={`${styles.modeToggle} ${mode === "daily" ? styles.modeToggleActive : ""}`}
          onClick={() => setMode("daily")}
        >
          Daily
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "infinite"}
          className={`${styles.modeToggle} ${mode === "infinite" ? styles.modeToggleActive : ""}`}
          onClick={() => setMode("infinite")}
        >
          Infinite
        </button>
      </div>

      <Suspense fallback={<div className={styles.loading}>Loading card...</div>}>
        {mode === "daily" ? (
          <DailyKeyfordleCard
            stats={stats}
            setStats={setStats}
            dailyState={dailyState}
            setDailyState={setDailyState}
            dateKey={dateKey}
          />
        ) : (
          <InfiniteKeyfordleCard
            infiniteCardPromise={infiniteCardPromise}
            infiniteState={infiniteState}
            setInfiniteState={setInfiniteState}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </Suspense>
    </div>
  );
}
