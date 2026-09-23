import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  cardTypeZoneMaps,
  getCardHouse,
  makeId,
  ZONE_DISPLAY,
  type Zone,
} from "../../cards/card-utils";
import {
  type Card as CardType,
  pickRandom,
  type Fragment as FragmentType,
  type GameConfig,
  type House,
} from "../../types";
import { queryCards } from "../../cards/card-db";
import { loadCardImage } from "../../cards/card-utils";
import { Card } from "../../cards/Card";
import { Fragment } from "../../cards/Fragment";
import styles from "./ChallengeScreen.module.css";

type Props = {
  config: GameConfig;
};

type Phase = "loading" | "challenge" | "results";

export function ChallengeScreen({ config }: Props) {
  const [allCards, setAllCards] = useState<CardType[] | null>(null);
  const [card, setCard] = useState<CardType | null>(null);
  const [cardHouse, setCardHouse] = useState<House | null>(config.house);
  const [fragments, setFragments] = useState<FragmentType[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const [selections, setSelections] = useState<Record<Zone, string | null>>({
    name: null,
    traits: null,
    power: null,
    armor: null,
    amber: null,
    rules: null,
  });
  const [results, setResults] = useState<Record<Zone, boolean>>({
    name: false,
    traits: false,
    power: false,
    armor: false,
    amber: false,
    rules: false,
  });
  const [correctCards, setCorrectCards] = useState<string[]>([]);

  const totalCards = allCards?.length ?? 0;
  const completedCards = correctCards.length;
  const percent = totalCards > 0 ? (completedCards / totalCards) * 100 : 0;

  const correctCardsRef = useRef(correctCards);
  useEffect(() => {
    correctCardsRef.current = correctCards;
  }, [correctCards]);

  const handleFinish = useCallback((score: number) => {
    setFinalScore(score);
  }, []);

  const loadNextCard = useCallback(
    (cards: CardType[]) => {
      const incompleteCards = cards.filter(
        (c) => !correctCardsRef.current.includes(c.title),
      );

      if (incompleteCards.length === 0) {
        handleFinish(correctCardsRef.current.length);
        return;
      }

      const targetCard = pickRandom(incompleteCards);
      setCard(targetCard);

      const targetHouseOrHouses = getCardHouse(targetCard, config.expansion);
      const targetHouse: House =
        config.house ??
        (Array.isArray(targetHouseOrHouses)
          ? pickRandom(targetHouseOrHouses)
          : targetHouseOrHouses);

      setCardHouse(targetHouse);

      const cardsOfTargetType = cards.filter((c) => {
        if (c.type !== targetCard.type) return false;
        const distractorHouse = getCardHouse(c, config.expansion);
        if (typeof distractorHouse === "string") {
          return targetHouse === distractorHouse;
        }
        return (
          Array.isArray(distractorHouse) &&
          distractorHouse.includes(targetHouse)
        );
      });

      const cardsOfTargetTypeAllHouses = cards.filter(
        (c) => c.type === targetCard.type,
      );

      const newFragments: FragmentType[] = [];

      for (const zone of config.zones[targetCard.type]) {
        const usedCards = new Set<string>([targetCard.title]);
        const usedValues = new Set<number | undefined>(
          zone in targetCard
            ? [
                targetCard[zone as keyof typeof targetCard] as
                  | number
                  | undefined,
              ]
            : [0],
        );

        const cardPool =
          zone === "power" || zone === "armor" || zone === "amber"
            ? cardsOfTargetTypeAllHouses
            : cardsOfTargetType;

        for (let i = 0; i < 3; i++) {
          const eligibleCards = cardPool.filter((c) => {
            if (usedCards.has(c.title)) return false;
            if (zone === "power" || zone === "armor" || zone === "amber") {
              const cardValue = c[zone] ?? 0;
              if (usedValues.has(cardValue)) return false;
            }
            return true;
          });

          if (eligibleCards.length > 0) {
            const distractor = pickRandom(eligibleCards);
            usedCards.add(distractor.title);
            if (zone === "power" || zone === "armor" || zone === "amber") {
              const distractorValue = (distractor[
                zone as keyof typeof distractor
              ] ?? 0) as number;
              usedValues.add(distractorValue);
            }
            const distractorHouseData = getCardHouse(
              distractor,
              config.expansion,
            );
            const distractorHouse: House = Array.isArray(distractorHouseData)
              ? pickRandom(distractorHouseData)
              : distractorHouseData;
            newFragments.push({
              id: makeId(),
              zone,
              card: distractor,
              house: distractorHouse,
              isCorrect: false,
            });
          }
        }
        newFragments.push({
          id: makeId(),
          zone,
          card: targetCard,
          house: targetHouse,
          isCorrect: true,
        });
      }

      for (let i = newFragments.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        [newFragments[i], newFragments[j]] = [newFragments[j], newFragments[i]];
      }
      setFragments(newFragments);

      setSelections({
        name: null,
        traits: null,
        power: null,
        armor: null,
        amber: null,
        rules: null,
      });

      setPhase("challenge");
    },
    [config.expansion, config.house, config.zones, handleFinish],
  );

  useEffect(() => {
    queryCards({
      expansion: config.expansion,
      house: config.house ?? undefined,
      type: Array.from(config.cardTypes),
    }).then((cards) => {
      setAllCards(cards);
      loadNextCard(cards);

      for (const c of cards) {
        const houseOrHouses = getCardHouse(c, config.expansion);
        const house =
          config.house ??
          (Array.isArray(houseOrHouses) ? houseOrHouses[0] : houseOrHouses);
        loadCardImage(c.slug, house);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClipClick = useCallback(
    (fragmentId: string) => {
      const fragment = fragments.find((f) => f.id === fragmentId);
      if (!fragment) return;

      const zone = fragment.zone as Zone;
      setSelections((prev) => ({
        ...prev,
        [zone]: prev[zone] === fragmentId ? null : fragmentId,
      }));
    },
    [fragments],
  );

  const checkAnswers = useCallback(() => {
    if (!card?.type) return;

    const newResults: Record<Zone, boolean> = {
      name: false,
      traits: false,
      power: false,
      armor: false,
      amber: false,
      rules: false,
    };

    let cardCorrect = true;
    for (const zone of config.zones[card?.type]) {
      const fragmentId = selections[zone];
      if (fragmentId) {
        const fragment = fragments.find((f) => f.id === fragmentId);
        const isCorrect = fragment?.isCorrect ?? false;
        cardCorrect &&= isCorrect;
        newResults[zone] = isCorrect;
      }
    }
    if (cardCorrect) {
      setCorrectCards((correct) => [...correct, card.title]);
    }
    setResults(newResults);
    setPhase("results");
  }, [card?.type, card?.title, config.zones, selections, fragments]);

  const handleReplay = () => {
    setCorrectCards([]);
    correctCardsRef.current = [];
    setFinalScore(null);
    setPhase("loading");
    if (allCards) loadNextCard(allCards);
  };

  if (finalScore !== null) {
    return (
      <div className={styles.gameOver}>
        <h1>Game Over!</h1>
        <div className={`${styles.finalScore} surface-raised`}>
          <span className={styles.scoreLabel}>Final Score</span>
          <span className={styles.scoreValue}>
            {finalScore} / {totalCards}
          </span>
        </div>
        <div className={styles.buttonGroup}>
          <button className="btn btn-primary" onClick={handleReplay}>
            Play Again
          </button>
          <Link to="/practice/setup" className="btn btn-secondary">
            New Setup
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className={styles.loading}>
        <h2>Loading cards…</h2>
      </div>
    );
  }

  if (phase === "challenge" && card) {
    const zones = Array.from(config.zones[card.type]);
    const unassignedZones = zones.filter((z) => selections[z] === null);

    return (
      <div className={styles.challengePage}>
        <div className={styles.progressContainer}>
          <span className={styles.progressText}>
            Progress: {completedCards} / {totalCards} cards{" "}
          </span>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className={styles.challenge}>
          <div className={styles.cardSection}>
            <h2>Match the clipped regions</h2>
            <Card card={card} house={cardHouse!} hiddenZones={zones} />
          </div>

          <div className={styles.fragmentsPanel}>
            <h3>Select One Per Category</h3>
            <p className={styles.instruction}>
              {unassignedZones.length > 0
                ? `Still needed: ${unassignedZones.map((z) => ZONE_DISPLAY[z]).join(", ")}`
                : "Ready to check!"}
            </p>
            <div className={`${styles.fragmentsScroll} surface`}>
              {zones.map((zone) => {
                const zoneFragments = fragments.filter((f) => f.zone === zone);
                return (
                  <div key={zone} className={styles.zoneGroup}>
                    <span className={styles.zoneLabel}>
                      {ZONE_DISPLAY[zone]}
                    </span>
                    <div className={styles.fragmentClips}>
                      {zoneFragments.map((fragment) => (
                        <Fragment
                          key={fragment.id}
                          card={fragment.card}
                          house={fragment.house}
                          zone={fragment.zone}
                          selected={
                            selections[zone]?.includes(fragment.id) ?? false
                          }
                          onClick={() => handleClipClick(fragment.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              className="btn btn-primary"
              onClick={checkAnswers}
              disabled={unassignedZones.length > 0}
            >
              Check Answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results" && card) {
    const zones = Object.keys(cardTypeZoneMaps[card.type]).filter((z) =>
      config.zones[card.type].has(z as Zone),
    ) as Zone[];
    const allCorrect = zones.every((z) => results[z]);

    return (
      <div className={styles.page}>
        <div className={styles.progressContainer}>
          <span className={styles.progressText}>
            Progress: {completedCards} / {totalCards} cards{" "}
          </span>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <h2>{allCorrect ? "✓ Perfect!" : "Not quite…"}</h2>
        <Card
          card={card}
          house={cardHouse!}
          hiddenZones={[]}
          showResults={results}
        />
        <div className={styles.resultsList}>
          {zones.map((zone) => {
            const fragment = fragments.find(
              (f) => f.id === selections[zone as Zone],
            );
            const correct = results[zone];
            return (
              <div
                key={zone}
                className={`${styles.result} ${correct ? styles.correct : styles.incorrect}`}
              >
                <span className={styles.resultZone}>{ZONE_DISPLAY[zone]}</span>
                {fragment ? (
                  <div className={styles.resultFragment}>
                    <Fragment
                      card={fragment.card}
                      house={fragment.house}
                      zone={zone}
                    />
                    <span className={styles.resultIcon}>
                      {correct ? "✓" : "✗"}
                    </span>
                  </div>
                ) : (
                  <span>Not answered ✗</span>
                )}
              </div>
            );
          })}
        </div>
        <div className={styles.buttonGroup}>
          {allCorrect ? (
            <button
              className="btn btn-primary"
              onClick={() => allCards && loadNextCard(allCards)}
            >
              Next Card →
            </button>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={() => handleFinish(correctCards.length)}
            >
              See Results
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
