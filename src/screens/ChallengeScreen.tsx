import { useState, useEffect, useCallback } from "react";
import {
  cardTypeZoneMaps,
  getCardHouse,
  makeId,
  ZONE_DISPLAY,
  type Zone,
} from "../cards/card-utils";
import {
  type Card as CardType,
  pickRandom,
  type Fragment as FragmentType,
  type GameConfig,
} from "../types";

import { getCardsByExpansion, openCardDB } from "../cards/card-db";
import { Card } from "../cards/Card";
import { Fragment } from "../cards/Fragment";

type Props = {
  config: GameConfig;
  onFinish: (score: number) => void;
};

type Phase = "loading" | "challenge" | "results";

export function ChallengeScreen({ config, onFinish }: Props) {
  const [card, setCard] = useState<CardType | null>(null);
  const [cardHouse, setCardHouse] = useState<string | null>(config.house);
  const [fragments, setFragments] = useState<FragmentType[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
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

  const loadNextCard = useCallback(() => {
    openCardDB().then(() => {
      getCardsByExpansion(config.expansion)
        .then((cards) =>
          cards.filter((c) => {
            if (!config.cardTypes.has(c.type)) {
              return false;
            }
            if (config.house !== null) {
              const cardHouse = getCardHouse(c, config.expansion);
              if (typeof cardHouse === "string") {
                return cardHouse === config.house;
              }
              return cardHouse.includes(config.house);
            }
            return true;
          }),
        )
        .then((cards) => {
          const incompleteCards = cards.filter(
            (c) => !correctCards.includes(c.title),
          );

          if (incompleteCards.length === 0) {
            onFinish(correctCards.length);
            return;
          }

          const targetCard = pickRandom(incompleteCards);
          setCard(targetCard);

          const targetHouseOrHouses = getCardHouse(
            targetCard,
            config.expansion,
          );
          const targetHouse =
            config.house ??
            (Array.isArray(targetHouseOrHouses)
              ? pickRandom(targetHouseOrHouses)
              : targetHouseOrHouses);

          setCardHouse(targetHouse);

          const cardsOfTargetType = cards.filter((c) => {
            if (c.type !== targetCard.type) {
              return false;
            }
            const distractorHouse = getCardHouse(c, config.expansion);
            if (typeof distractorHouse === "string") {
              return targetHouse === distractorHouse;
            }
            return distractorHouse.includes(targetHouse);
          });

          const cardsOfTargetTypeAllHouses = cards.filter((c) => c.type === targetCard.type);

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

            const cardPool = (zone === "power" || zone === "armor" || zone === "amber") 
              ? cardsOfTargetTypeAllHouses 
              : cardsOfTargetType;

            for (let i = 0; i < 3; i++) {
              const eligibleCards = cardPool.filter((c) => {
                if (usedCards.has(c.title)) return false;
                if (zone === "power" || zone === "armor" || zone === "amber") {
                  const cardValue = c[zone] ?? 0;
                  if (usedValues.has(cardValue)) {
                    return false;
                  }
                }
                return true;
              });

              if (eligibleCards.length > 0) {
                const distractor = pickRandom(eligibleCards);
                console.log(usedValues, targetCard[zone], distractor[zone]);
                console.log(zone, distractor);
                usedCards.add(distractor.title);
                if (zone === "power" || zone === "armor" || zone === "amber") {
                  const distractorValue = (distractor[
                    zone as keyof typeof distractor
                  ] ?? 0) as number;
                  usedValues.add(distractorValue);
                }
                const distractorHouseData = getCardHouse(distractor, config.expansion);
                const distractorHouse = Array.isArray(distractorHouseData) 
                  ? pickRandom(distractorHouseData) 
                  : distractorHouseData;
                newFragments.push({
                  id: makeId(),
                  zone,
                  card: distractor,
                  house: distractorHouse,
                  isCorrect: false,
                });
              } else {
                console.log("exhausted eligible cards");
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
            [newFragments[i], newFragments[j]] = [
              newFragments[j],
              newFragments[i],
            ];
          }
          setFragments(newFragments);

          setPhase("challenge");
        });
    });
  }, [
    config.cardTypes,
    config.expansion,
    config.house,
    config.zones,
    correctCards,
    onFinish,
  ]);

  // This effect is intended to run only once, hence the empty deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => loadNextCard(), []);

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

  if (phase === "loading") {
    return (
      <div id="center">
        <h2>Loading card...</h2>
      </div>
    );
  }

  if (phase === "challenge" && card) {
    const zones = Array.from(config.zones[card.type]);
    const unassignedZones = zones.filter((z) => selections[z] === null);

    return (
      <div id="center" className="challenge-container">
        <div className="card-section">
          <h2>Match the clipped regions</h2>
          <Card card={card} house={cardHouse!} hiddenZones={zones} />
        </div>

        <div className="fragments-section">
          <h3>Select One Per Category</h3>
          <p className="instruction">
            {unassignedZones.length > 0
              ? `Select: ${unassignedZones.map((z) => ZONE_DISPLAY[z]).join(", ")}`
              : "Ready to check!"}
          </p>
          <div className="fragments-grid">
            {zones.map((zone) => {
              const zoneFragments = fragments.filter((f) => f.zone === zone);
              return (
                <div key={zone} className="fragment-zone-group">
                  <h4>{ZONE_DISPLAY[zone]}</h4>
                  <div className="fragment-clips">
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
          <button onClick={checkAnswers} disabled={unassignedZones.length > 0}>
            Check Answers
          </button>
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
      <div id="center">
        <h2>{allCorrect ? "Perfect!" : "Not quite..."}</h2>
        <Card
          card={card}
          house={cardHouse!}
          hiddenZones={[]}
          showResults={results}
        />
        <div className="results-list">
          {zones.map((zone) => {
            const fragment = fragments.find(
              (f) => f.id === selections[zone as Zone],
            );
            return (
              <div
                key={zone}
                className={`result ${results[zone] ? "correct" : "incorrect"}`}
              >
                <span className="result-zone">{ZONE_DISPLAY[zone]}: </span>
                {fragment ? (
                  <div className="result-fragment">
                    <Fragment
                      card={fragment.card}
                      house={fragment.house}
                      zone={zone}
                    />
                    <span>{results[zone] ? "✓" : "✗"}</span>
                  </div>
                ) : (
                  <span>Not answered ✗</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="button-group">
          {allCorrect ? (
            <button onClick={loadNextCard}>Next Card</button>
          ) : (
            <button onClick={() => onFinish(correctCards.length)}>
              See Results
            </button>
          )}
        </div>
      </div>
    );
  }
}
