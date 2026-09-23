import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getExpansionMeta, queryCards } from "../../cards/card-db";
import { Fragment } from "../../cards/Fragment";
import type { Card, CardKind, Expansion, House } from "../../types";
import { Expansions, HOUSES } from "../../types";
import {
  cardTypeZoneMaps,
  getCardHouse,
  ZONE_DISPLAY,
  type Zone,
} from "../../cards/card-utils";
import { getCardImageUrl } from "../../cards/card-image-utils";
import styles from "./CardViewerScreen.module.css";

const CARD_TYPES: CardKind[] = [
  "Creature",
  "TokenCreature",
  "Action",
  "Artifact",
  "Upgrade",
];

export function CardViewerScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedExpansion, setSelectedExpansion] = useState<Expansion | "">("");
  const [selectedHouse, setSelectedHouse] = useState<House | "">("");
  const [selectedCardTypes, setSelectedCardTypes] = useState<Set<CardKind>>(
    new Set(),
  );
  const [expansionHouses, setExpansionHouses] = useState<House[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFragments, setShowFragments] = useState(false);

  const availableHouses = expansionHouses ?? [...HOUSES].sort();

  useEffect(() => {
    let isCurrent = true;
    if (selectedExpansion) {
      getExpansionMeta(selectedExpansion).then(({ houses }) => {
        if (!isCurrent) return;
        setExpansionHouses(houses);
        setSelectedHouse((prev) => (prev && !houses.includes(prev) ? "" : prev));
      });
    }
    return () => { isCurrent = false; };
  }, [selectedExpansion]);

  const handleExpansionChange = (newExp: Expansion | "") => {
    setSelectedExpansion(newExp);
    if (!newExp) setExpansionHouses(null);
  };

  useEffect(() => {
    let isCurrent = true;
    const hasFilter =
      Boolean(selectedExpansion) ||
      Boolean(selectedHouse) ||
      selectedCardTypes.size > 0;

    if (!hasFilter) return;

    queryCards({
      expansion: selectedExpansion || undefined,
      house: selectedHouse || undefined,
      type: selectedCardTypes.size > 0 ? Array.from(selectedCardTypes) : undefined,
    })
      .then((results) => {
        if (!isCurrent) return;
        setCards(results);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => { isCurrent = false; };
  }, [selectedExpansion, selectedHouse, selectedCardTypes]);

  const getCardDisplayHouse = (card: Card, expansion: Expansion | ""): string => {
    if (expansion) {
      const house = getCardHouse(card, expansion);
      if (typeof house === "string") return house;
      if (Array.isArray(house)) return house[0];
    }
    if (typeof card.house === "string") return card.house;
    if (Array.isArray(card.house)) return card.house[0];
    const firstExpansion = card.expansions?.[0];
    if (firstExpansion) {
      const house = card.house[firstExpansion];
      if (typeof house === "string") return house;
      if (Array.isArray(house)) return house[0];
    }
    return "Unknown";
  };

  const hasFilter =
    Boolean(selectedExpansion) ||
    Boolean(selectedHouse) ||
    selectedCardTypes.size > 0;

  const displayedCards = (() => {
    if (!hasFilter) return [];
    return [...cards].sort((a, b) => {
      const houseA = getCardDisplayHouse(a, selectedExpansion);
      const houseB = getCardDisplayHouse(b, selectedExpansion);
      if (houseA !== houseB) return houseA.localeCompare(houseB);
      return a.title.localeCompare(b.title);
    });
  })();

  const toggleCardType = (type: CardKind) => {
    setLoading(true);
    const newTypes = new Set(selectedCardTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedCardTypes(newTypes);
  };

  const getCardFragmentZones = (card: Card): Zone[] => {
    const zoneMap = cardTypeZoneMaps[card.type];
    if (!zoneMap) return [];
    return Object.keys(zoneMap) as Zone[];
  };

  return (
    <div className={styles.page}>
      <div className={styles.back}>
        <Link to="/" className="btn btn-ghost">← Back</Link>
      </div>

      <h1 className={styles.title}>Card Viewer</h1>

      <div className={`${styles.filters} surface`}>
        <div className={styles.filterGroup}>
          <label htmlFor="expansion-select" className={styles.filterLabel}>
            Expansion
          </label>
          <select
            id="expansion-select"
            value={selectedExpansion}
            onChange={(e) => {
              setLoading(true);
              handleExpansionChange(e.target.value as Expansion | "");
            }}
            className={styles.select}
          >
            <option value="">All Expansions</option>
            {Object.entries(Expansions).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="house-select" className={styles.filterLabel}>
            House
          </label>
          <select
            id="house-select"
            value={selectedHouse}
            onChange={(e) => {
              setLoading(true);
              setSelectedHouse(e.target.value as House | "");
            }}
            className={styles.select}
          >
            <option value="">All Houses</option>
            {availableHouses.map((house) => (
              <option key={house} value={house}>{house}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Card Types</span>
          <div className={styles.checkboxList}>
            {CARD_TYPES.map((type) => (
              <label key={type} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedCardTypes.has(type)}
                  onChange={() => toggleCardType(type)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>
      </div>

      {!hasFilter ? (
        <div className={styles.emptyState}>
          <p>Select an expansion, house, or card type to load cards.</p>
        </div>
      ) : loading ? (
        <p style={{ textAlign: "center", color: "var(--text-dim)" }}>Loading cards…</p>
      ) : (
        <div className={styles.resultsBar}>
          <span>Showing {displayedCards.length} cards</span>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showFragments}
              onChange={(e) => setShowFragments(e.target.checked)}
            />
            Show Fragments
          </label>
        </div>
      )}

      {!loading && hasFilter && (
        <div className={styles.cardsGrid}>
          {displayedCards.map((card, index) => {
            const house = getCardDisplayHouse(card, selectedExpansion);
            const zones = getCardFragmentZones(card);

            return (
              <div key={`${card.slug}-${index}`} className={`${styles.cardItem} surface`}>
                <div className={styles.cardPreview}>
                  <img
                    src={getCardImageUrl(card.slug, house)}
                    alt={card.title}
                    loading="lazy"
                  />
                </div>

                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardMeta}>
                    <span className={styles.cardType}>{card.type}</span>
                    {" · "}
                    <span className={styles.cardHouse}>{house}</span>
                  </p>
                  {(card.power !== undefined || card.armor !== undefined || card.amber !== undefined) && (
                    <div className={styles.cardStats}>
                      {card.power !== undefined && (
                        <span className={styles.cardStat}>P {card.power}</span>
                      )}
                      {card.armor !== undefined && (
                        <span className={styles.cardStat}>A {card.armor}</span>
                      )}
                      {card.amber !== undefined && (
                        <span className={styles.cardStat}>Æ {card.amber}</span>
                      )}
                    </div>
                  )}
                </div>

                {showFragments && (
                  <div className={styles.fragmentsSection}>
                    <h4 className={styles.fragmentsTitle}>
                      Fragments ({zones.length})
                    </h4>
                    <div className={styles.fragmentsGrid}>
                      {zones.map((zone) => (
                        <div key={zone} className={styles.fragmentItem}>
                          <span className={styles.fragmentLabel}>
                            {ZONE_DISPLAY[zone]}
                          </span>
                          <Fragment card={card} house={house} zone={zone} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
