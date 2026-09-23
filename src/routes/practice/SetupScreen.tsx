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
import styles from "./SetupScreen.module.css";

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

  useEffect(() => {
    if (!expansion) return;
    getExpansionMeta(expansion).then(({ houses, typesByHouse: tbh }) => {
      setExpansionHouses(houses);
      setTypesByHouse(tbh);
      setTargetCardTypes(deriveCardTypes(tbh, null));
    });
  }, [expansion]);

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
    <div className={styles.page}>
      <div className={styles.back}>
        <Link to="/" className="btn btn-ghost">← Back</Link>
      </div>

      <div className={styles.header}>
        <h1>Challenge Setup</h1>
        <p className={styles.subtitle}>Configure your practice session</p>
      </div>

      <div className={styles.form}>
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Expansion</span>
          <select
            value={expansion || ""}
            onChange={(e) => {
              setExpansion((e.target.value as Expansion) || null);
              setHouse(null);
              setExpansionHouses([]);
            }}
            className={styles.select}
          >
            <option value="">— Select —</option>
            {Object.keys(Expansions).map((exp) => (
              <option key={exp} value={exp}>
                {Expansions[exp as Expansion]}
              </option>
            ))}
          </select>
        </div>

        {expansion && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>
              House
              <span className={styles.sectionHint}>optional</span>
            </span>
            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggle} ${!house ? styles.active : ""}`}
                onClick={() => setHouse(null)}
              >
                All
              </button>
              {expansionHouses.map((h) => (
                <button
                  key={h}
                  className={`${styles.toggle} ${house === h ? styles.active : ""}`}
                  onClick={() => setHouse(h)}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}

        {expansion && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Card types</span>
            <div className={styles.buttonGroup}>
              {targetCardTypes.map((cardType) => (
                <label
                  key={cardType}
                  className={`${styles.buttonGroupLabel} ${cardTypes.has(cardType) ? styles.active : ""}`}
                >
                  <input
                    type="checkbox"
                    className={styles.visuallyHidden}
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
            <div key={cardType} className={styles.section}>
              <span className={styles.sectionLabel}>Zones — {cardType}</span>
              <div className={styles.buttonGroup}>
                {(Object.keys(cardTypeZoneMaps[cardType]) as Zone[]).map(
                  (zone) => (
                    <label
                      key={zone}
                      className={`${styles.buttonGroupLabel} ${zones[cardType].has(zone) ? styles.active : ""}`}
                    >
                      <input
                        type="checkbox"
                        className={styles.visuallyHidden}
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
      </div>

      <div className={styles.footer}>
        <button className="btn btn-primary" onClick={handleStart} disabled={!canStart}>
          Start challenge
        </button>
        {!canStart && expansion && (
          <span className={styles.footerHint}>
            {cardTypes.size === 0
              ? "Select at least one card type"
              : "Select zones for each card type"}
          </span>
        )}
      </div>
    </div>
  );
}
