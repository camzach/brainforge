import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { Expansion, CardKind, House } from "../../types";
import { Expansions } from "../../types";
import {
  cardTypeZoneMaps,
  ZONE_DISPLAY,
  type Zone,
} from "../../cards/card-utils";
import { getExpansionMeta } from "../../cards/card-db";
import {
  encodePracticeSearch,
  type PracticeSearchParams,
} from "./practice-utils";

function deriveCardTypes(
  typesByHouse: Map<House, Set<CardKind>>,
  house: House | null,
): CardKind[] {
  const types = house
    ? (typesByHouse.get(house) ?? new Set<CardKind>())
    : new Set<CardKind>(Array.from(typesByHouse.values()).flatMap((s) => Array.from(s)));
  return Array.from(types)
    .filter((t) => t in cardTypeZoneMaps)
    .sort();
}

export function SetupScreen() {
  const navigate = useNavigate();
  const [expansion, setExpansion] = useState<Expansion | null>(null);
  const [expansionHouses, setExpansionHouses] = useState<House[]>([]);
  const [typesByHouse, setTypesByHouse] = useState<Map<House, Set<CardKind>>>(new Map());
  const [targetCardTypes, setTargetCardTypes] = useState<CardKind[]>([]);
  const [house, setHouse] = useState<House | null>(null);
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

  // Single query when expansion changes — fetches houses + type-by-house map.
  useEffect(() => {
    if (!expansion) return;
    getExpansionMeta(expansion).then(({ houses, typesByHouse: tbh }) => {
      setExpansionHouses(houses);
      setTypesByHouse(tbh);
      setTargetCardTypes(deriveCardTypes(tbh, null));
    });
  }, [expansion]);

  // Derive card types from cached data whenever house selection changes.
  useEffect(() => {
    setTargetCardTypes(deriveCardTypes(typesByHouse, house));
  }, [house, typesByHouse]);

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
    const practiceSearch: PracticeSearchParams = encodePracticeSearch({
      expansion,
      house,
      cardTypes,
      zones,
    });
    navigate({
      to: "/practice/play",
      search: practiceSearch,
    });
  };

  return (
    <div id="center">
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <button className="btn-secondary">← Back to Home</button>
        </Link>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/viewer" style={{ textDecoration: "none" }}>
            <button
              style={{
                padding: "0.5rem 1rem",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Card Viewer
            </button>
          </Link>
        </div>
      </div>

      <h1>Fragment Challenge Setup</h1>
      <p>Configure your practice set by matching clipped regions</p>

      <div className="setup-section">
        <h3>1. Select Expansion</h3>
        <select
          value={expansion || ""}
          onChange={(e) => {
            setExpansion((e.target.value as Expansion) || null);
            setHouse(null);
            setExpansionHouses([]);
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

      {expansion && (
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
            {targetCardTypes.map((cardType) => (
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
