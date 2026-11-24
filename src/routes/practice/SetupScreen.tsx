import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { Expansion, CardKind, House } from "../../types";
import { EXPANSIONS } from "../../types";
import {
  CARD_TYPE_DISPLAY,
  cardTypeZoneMaps,
  ZONE_DISPLAY,
  type Zone,
} from "../../cards/card-utils";
import {
  getExpansionMeta,
  getExpansionsWithCards,
  queryCards,
} from "../../cards/card-db";
import {
  encodePracticeSearch,
  type PracticeSearchParams,
} from "./practice-utils";
import styles from "./SetupScreen.module.css";

type ExpansionMeta = Awaited<ReturnType<typeof getExpansionMeta>>;

function zonesOf(cardType: CardKind): Zone[] {
  return Object.keys(cardTypeZoneMaps[cardType]) as Zone[];
}

function allZones(): Record<CardKind, Set<Zone>> {
  const result = {} as Record<CardKind, Set<Zone>>;
  for (const cardType of Object.keys(cardTypeZoneMaps) as CardKind[]) {
    result[cardType] = new Set(zonesOf(cardType));
  }
  return result;
}

function deriveCardTypes(
  typesByHouse: Map<House, Set<CardKind>>,
  house: House | null,
): CardKind[] {
  const types = house
    ? (typesByHouse.get(house) ?? new Set<CardKind>())
    : new Set<CardKind>(Array.from(typesByHouse.values()).flatMap((s) => Array.from(s)));
  return Array.from(types)
    .filter((t) => t in cardTypeZoneMaps && zonesOf(t).length > 0)
    .sort();
}

export function SetupScreen() {
  const navigate = useNavigate();
  const [availableExpansions, setAvailableExpansions] = useState<Expansion[]>([]);
  const [expansion, setExpansion] = useState<Expansion | null>(null);
  const [meta, setMeta] = useState<ExpansionMeta | null>(null);
  const [house, setHouse] = useState<House | null>(null);
  const [cardTypes, setCardTypes] = useState<Set<CardKind>>(new Set());
  const [zones, setZones] = useState<Record<CardKind, Set<Zone>>>(allZones);
  const [count, setCount] = useState<{ key: string; value: number } | null>(null);

  useEffect(() => {
    getExpansionsWithCards().then(setAvailableExpansions);
  }, []);

  useEffect(() => {
    if (!expansion) return;
    let cancelled = false;
    getExpansionMeta(expansion).then((m) => {
      if (!cancelled) setMeta(m);
    });
    return () => {
      cancelled = true;
    };
  }, [expansion]);

  const targetCardTypes =
    expansion && meta ? deriveCardTypes(meta.typesByHouse, house) : [];
  const activeTypes = targetCardTypes.filter((t) => cardTypes.has(t));
  const typeWithoutZones = activeTypes.find((t) => zones[t].size === 0);
  const canStart =
    expansion !== null && activeTypes.length > 0 && !typeWithoutZones;

  const activeTypesKey = activeTypes.join(",");
  const countKey = `${expansion}|${house}|${activeTypesKey}`;
  useEffect(() => {
    if (!expansion || !activeTypesKey) return;
    let cancelled = false;
    queryCards({
      expansion,
      house: house ?? undefined,
      type: activeTypesKey.split(",") as CardKind[],
    }).then((cards) => {
      if (!cancelled) {
        setCount({ key: `${expansion}|${house}|${activeTypesKey}`, value: cards.length });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [expansion, house, activeTypesKey]);
  const cardCount = count?.key === countKey ? count.value : null;

  const handleExpansionChange = (value: string) => {
    setExpansion(value ? (Number(value) as Expansion) : null);
    setHouse(null);
    setMeta(null);
  };

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
    setZones((prev) => {
      const next = new Set(prev[cardType]);
      if (next.has(zone)) {
        next.delete(zone);
      } else {
        next.add(zone);
      }
      return { ...prev, [cardType]: next };
    });
  };

  const setAllZonesFor = (cardType: CardKind, on: boolean) => {
    setZones((prev) => ({
      ...prev,
      [cardType]: on ? new Set(zonesOf(cardType)) : new Set(),
    }));
  };

  const handleStart = () => {
    if (!expansion || !canStart) return;
    const practiceSearch: PracticeSearchParams = encodePracticeSearch({
      expansion,
      house,
      cardTypes: new Set(activeTypes),
      zones,
    });
    navigate({
      to: "/practice/play",
      search: practiceSearch,
    });
  };

  const describeZones = (cardType: CardKind) => {
    const all = zonesOf(cardType);
    const selected = all.filter((z) => zones[cardType].has(z));
    return selected.length === all.length
      ? "all parts"
      : selected.map((z) => ZONE_DISPLAY[z]).join(", ");
  };

  let summary: string;
  if (!expansion) {
    summary = "Choose an expansion to begin";
  } else if (activeTypes.length === 0) {
    summary = "Select at least one card type";
  } else if (typeWithoutZones) {
    summary = `Select at least one part for ${CARD_TYPE_DISPLAY[typeWithoutZones]}`;
  } else {
    const details = activeTypes
      .map((t) => `${CARD_TYPE_DISPLAY[t]}: ${describeZones(t)}`)
      .join(" · ");
    const countText =
      cardCount === null
        ? "counting cards…"
        : `${cardCount} ${cardCount === 1 ? "card" : "cards"}`;
    summary = `${details} · ${countText}`;
  }

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
          <label htmlFor="setup-expansion" className={styles.sectionLabel}>
            Expansion
          </label>
          <select
            id="setup-expansion"
            value={expansion || ""}
            onChange={(e) => handleExpansionChange(e.target.value)}
            className={styles.select}
          >
            <option value="">— Select —</option>
            {availableExpansions.map((exp) => (
              <option key={exp} value={exp}>
                {EXPANSIONS[exp]}
              </option>
            ))}
          </select>
        </div>

        {expansion && (
          <div className={styles.section}>
            <span id="setup-house-label" className={styles.sectionLabel}>
              House
              <span className={styles.sectionHint}>optional</span>
            </span>
            <div
              className={styles.toggleGroup}
              role="group"
              aria-labelledby="setup-house-label"
            >
              <button
                type="button"
                className={`${styles.toggle} ${!house ? styles.active : ""}`}
                aria-pressed={!house}
                onClick={() => setHouse(null)}
              >
                All
              </button>
              {(meta?.houses ?? []).map((h) => (
                <button
                  type="button"
                  key={h}
                  className={`${styles.toggle} ${house === h ? styles.active : ""}`}
                  aria-pressed={house === h}
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
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>
                Card types
                <span className={styles.sectionHint}>and the parts to practice</span>
              </span>
              <div className={styles.sectionActions}>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => setCardTypes(new Set(targetCardTypes))}
                  aria-label="Select all card types"
                >
                  Select all
                </button>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => setCardTypes(new Set())}
                  aria-label="Deselect all card types"
                >
                  Deselect all
                </button>
              </div>
            </div>

            <div className={styles.typeList}>
              {targetCardTypes.map((cardType) => {
                const selected = cardTypes.has(cardType);
                const typeZones = zonesOf(cardType);
                const allOn = typeZones.every((z) => zones[cardType].has(z));
                return (
                  <div key={cardType} className={styles.typeRow}>
                    <label
                      className={`${styles.buttonGroupLabel} ${styles.typeToggle} ${selected ? styles.active : ""}`}
                    >
                      <input
                        type="checkbox"
                        className={styles.visuallyHidden}
                        checked={selected}
                        onChange={() => handleCardTypeToggle(cardType)}
                      />
                      {CARD_TYPE_DISPLAY[cardType]}
                    </label>

                    <div
                      className={styles.zoneChips}
                      role="group"
                      aria-label={`${CARD_TYPE_DISPLAY[cardType]} parts`}
                    >
                      {typeZones.map((zone) => {
                        const on = selected && zones[cardType].has(zone);
                        return (
                          <label
                            key={zone}
                            className={`${styles.buttonGroupLabel} ${on ? styles.active : ""} ${selected ? "" : styles.disabled}`}
                          >
                            <input
                              type="checkbox"
                              className={styles.visuallyHidden}
                              checked={on}
                              disabled={!selected}
                              onChange={() => handleZoneToggle(cardType, zone)}
                            />
                            {ZONE_DISPLAY[zone]}
                          </label>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className={styles.linkButton}
                      disabled={!selected}
                      onClick={() => setAllZonesFor(cardType, !allOn)}
                      aria-label={`${allOn ? "Deselect" : "Select"} all ${CARD_TYPE_DISPLAY[cardType]} parts`}
                    >
                      {allOn ? "None" : "All"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <p className={styles.summary} aria-live="polite">
          {summary}
        </p>
        <button className="btn btn-primary" onClick={handleStart} disabled={!canStart}>
          Start challenge
        </button>
      </div>
    </div>
  );
}
