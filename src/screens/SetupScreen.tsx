import { useEffect, useState } from "react";
import type { Expansion, CardKind, GameConfig } from "../types";
import { Expansions } from "../types";
import {
  cardTypeZoneMaps,
  getCardHouse,
  ZONE_DISPLAY,
  type Zone,
} from "../cards/card-utils";
import { queryCards } from "../cards/card-db";

type Props = {
  onStart: (config: GameConfig) => void;
};

const ALL_CARD_TYPES: CardKind[] = [
  "Creature",
  "Action",
  "Artifact",
  "Upgrade",
];

export function SetupScreen({ onStart }: Props) {
  const [expansion, setExpansion] = useState<Expansion | null>(null);
  const [expansionHouses, setExpansionHouses] = useState<string[] | null>(null);
  const [house, setHouse] = useState<string | null>(null);
  const [cardTypes, setCardTypes] = useState<Set<CardKind>>(new Set());
  const [zones, setZones] = useState<Record<CardKind, Set<Zone>>>({
    Creature: new Set(),
    TokenCreature: new Set(),
    Action: new Set(),
    Artifact: new Set(),
    Upgrade: new Set(),
  });

  const canStart =
    expansion &&
    cardTypes.size > 0 &&
    Array.from(cardTypes).every((ct) => zones[ct].size > 0);

  useEffect(() => {
    if (!expansion) {
      return;
    }
    queryCards({ expansion: expansion ?? undefined }).then((cards) => {
      const houses = new Set(cards.map((c) => getCardHouse(c, expansion)));
      setExpansionHouses(Array.from(houses));
    });
  }, [expansion]);

  const handleCardTypeToggle = (cardType: CardKind) => {
    setCardTypes((prev) => {
      const next = new Set(prev);
      if (next.has(cardType)) {
        next.delete(cardType);
      } else {
        next.add(cardType);
      }
      return next;
    });
  };

  const handleZoneToggle = (cardType: CardKind, zone: Zone) => {
    setZones((prev) => ({
      ...prev,
      [cardType]: (() => {
        const next = new Set(prev[cardType]);
        if (next.has(zone)) {
          next.delete(zone);
        } else {
          next.add(zone);
        }
        return next;
      })(),
    }));
  };

  const handleStart = () => {
    if (!expansion || !canStart) return;
    onStart({ expansion, house, cardTypes, zones });
  };

  return (
    <div id="center">
      <h1>BrainForge</h1>
      <p>Learn KeyForge cards by matching clipped regions</p>

      <div className="setup-section">
        <h3>1. Select Expansion</h3>
        <select
          value={expansion || ""}
          onChange={(e) => {
            setExpansion((e.target.value as Expansion) || null);
            setHouse(null);
            setExpansionHouses(null);
          }}
          className="expansion-select"
        >
          <option value="">-- Select Expansion --</option>
          {Object.keys(Expansions).map((exp) => (
            <option key={exp} value={exp}>
              {Expansions[exp as Expansion]}
            </option>
          ))}
        </select>
      </div>

      {expansion && expansionHouses && (
        <div className="setup-section">
          <h3>2. Select House (optional)</h3>
          <div className="house-buttons">
            <button
              className={!house ? "selected" : ""}
              onClick={() => setHouse(null)}
            >
              All Houses
            </button>
            {expansionHouses.map((h) => (
              <button
                key={h}
                className={house === h ? "selected" : ""}
                onClick={() => setHouse(h)}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {expansion && (
        <div className="setup-section">
          <h3>3. Select Card Types to Practice</h3>
          <div className="zone-selectors">
            {ALL_CARD_TYPES.map((cardType) => (
              <label key={cardType}>
                <input
                  type="checkbox"
                  checked={cardTypes.has(cardType)}
                  onChange={() => handleCardTypeToggle(cardType)}
                />
                {cardType}
              </label>
            ))}
          </div>
        </div>
      )}

      {expansion &&
        Array.from(cardTypes).map((cardType) => (
          <div key={cardType} className="setup-section">
            <h3>Zones for {cardType}</h3>
            <div className="zone-selectors">
              {(Object.keys(cardTypeZoneMaps[cardType]) as Zone[]).map(
                (zone) => (
                  <label key={zone}>
                    <input
                      type="checkbox"
                      checked={zones[cardType].has(zone)}
                      onChange={() => handleZoneToggle(cardType, zone)}
                    />
                    {ZONE_DISPLAY[zone]}
                  </label>
                ),
              )}
            </div>
          </div>
        ))}

      <button onClick={handleStart} disabled={!canStart}>
        Start Challenge
      </button>
    </div>
  );
}
