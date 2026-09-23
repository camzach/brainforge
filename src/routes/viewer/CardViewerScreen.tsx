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

const CARD_TYPES: CardKind[] = [
  "Creature",
  "TokenCreature",
  "Action",
  "Artifact",
  "Upgrade",
];

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1400px",
    margin: "0 auto",
  } as React.CSSProperties,
  title: {
    marginBottom: "2rem",
    textAlign: "center",
  } as React.CSSProperties,
  filters: {
    display: "flex",
    gap: "2rem",
    flexWrap: "wrap",
    marginBottom: "2rem",
    padding: "1.5rem",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
  } as React.CSSProperties,
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    minWidth: "200px",
  } as React.CSSProperties,
  filterLabel: {
    fontWeight: 600,
    fontSize: "0.9rem",
    color: "rgba(255, 255, 255, 0.9)",
  } as React.CSSProperties,
  select: {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    background: "rgba(0, 0, 0, 0.3)",
    color: "white",
    fontSize: "1rem",
  } as React.CSSProperties,
  checkboxContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  } as React.CSSProperties,
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
    fontWeight: "normal",
  } as React.CSSProperties,
  resultsSummary: {
    marginBottom: "1rem",
    textAlign: "center",
    fontSize: "1.1rem",
    color: "rgba(255, 255, 255, 0.8)",
  } as React.CSSProperties,
  warningBox: {
    padding: "2rem",
    background: "rgba(255, 200, 0, 0.1)",
    borderRadius: "8px",
    border: "2px solid rgba(255, 200, 0, 0.3)",
  } as React.CSSProperties,
  warningTitle: {
    fontSize: "1.2rem",
    marginBottom: "0.5rem",
  } as React.CSSProperties,
  warningText: {
    fontSize: "0.9rem",
    color: "rgba(255, 255, 255, 0.7)",
  } as React.CSSProperties,
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "2rem",
  } as React.CSSProperties,
  cardItem: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  } as React.CSSProperties,
  cardPreview: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "200px",
  } as React.CSSProperties,
  cardInfo: {
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    paddingTop: "1rem",
  } as React.CSSProperties,
  cardTitle: {
    margin: "0 0 0.5rem 0",
    fontSize: "1.2rem",
  } as React.CSSProperties,
  cardMeta: {
    margin: "0.5rem 0",
    color: "rgba(255, 255, 255, 0.7)",
  } as React.CSSProperties,
  cardType: {
    fontWeight: 600,
    color: "#4a9eff",
  } as React.CSSProperties,
  cardHouse: {
    fontStyle: "italic",
  } as React.CSSProperties,
  cardStat: {
    margin: "0.25rem 0",
    fontSize: "0.9rem",
    color: "rgba(255, 255, 255, 0.8)",
  } as React.CSSProperties,
  fragmentsContainer: {
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    paddingTop: "1rem",
  } as React.CSSProperties,
  fragmentsTitle: {
    margin: "0 0 1rem 0",
    fontSize: "1rem",
    color: "rgba(255, 255, 255, 0.9)",
  } as React.CSSProperties,
  fragmentsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "1rem",
  } as React.CSSProperties,
  fragmentItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    alignItems: "center",
  } as React.CSSProperties,
  fragmentLabel: {
    fontSize: "0.8rem",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  } as React.CSSProperties,
};

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
  const [hideErrorCards, setHideErrorCards] = useState(false);
  const [cardImageErrors, setCardImageErrors] = useState<Set<string>>(
    new Set(),
  );

  const availableHouses = expansionHouses ?? [...HOUSES].sort();

  // Update available houses when expansion changes
  useEffect(() => {
    let isCurrent = true;
    if (selectedExpansion) {
      getExpansionMeta(selectedExpansion).then(({ houses }) => {
        if (!isCurrent) return;
        setExpansionHouses(houses);
        setSelectedHouse((prev) => (prev && !houses.includes(prev) ? "" : prev));
      });
    }
    return () => {
      isCurrent = false;
    };
  }, [selectedExpansion]);

  const handleExpansionChange = (newExp: Expansion | "") => {
    setSelectedExpansion(newExp);
    if (!newExp) {
      setExpansionHouses(null);
    }
  };

  // Query database when filters change
  useEffect(() => {
    let isCurrent = true;
    const hasFilter =
      Boolean(selectedExpansion) ||
      Boolean(selectedHouse) ||
      selectedCardTypes.size > 0;

    if (!hasFilter) {
      return;
    }

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
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedExpansion, selectedHouse, selectedCardTypes]);

  // Helper function to get display house for a card
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
    if (!hasFilter) {
      return [];
    }
    let list = cards;
    if (hideErrorCards) {
      list = list.filter((card) => cardImageErrors.has(card.slug));
    }
    return [...list].sort((a, b) => {
      const houseA = getCardDisplayHouse(a, selectedExpansion);
      const houseB = getCardDisplayHouse(b, selectedExpansion);

      if (houseA !== houseB) {
        return houseA.localeCompare(houseB);
      }

      return a.title.localeCompare(b.title);
    });
  })();

  const handleImageError = (cardSlug: string) => {
    setCardImageErrors((prev) => new Set(prev).add(cardSlug));
  };

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
    <div style={styles.container}>
      <div style={{ marginBottom: "1rem" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <button style={{ padding: "0.5rem 1rem" }}>← Back to Game</button>
        </Link>
      </div>
      <h1 style={styles.title}>Card Viewer</h1>

      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label htmlFor="expansion-select" style={styles.filterLabel}>
            Expansion:
          </label>
          <select
            id="expansion-select"
            value={selectedExpansion}
            onChange={(e) => {
              setLoading(true);
              handleExpansionChange(e.target.value as Expansion | "");
            }}
            style={styles.select}
          >
            <option value="">All Expansions</option>
            {Object.entries(Expansions).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label htmlFor="house-select" style={styles.filterLabel}>
            House:
          </label>
          <select
            id="house-select"
            value={selectedHouse}
            onChange={(e) => {
              setLoading(true);
              setSelectedHouse(e.target.value as House | "");
            }}
            style={styles.select}
          >
            <option value="">All Houses</option>
            {availableHouses.map((house) => (
              <option key={house} value={house}>
                {house}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Card Types:</label>
          <div style={styles.checkboxContainer}>
            {CARD_TYPES.map((type) => (
              <label key={type} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedCardTypes.has(type)}
                  onChange={() => toggleCardType(type)}
                  style={{ cursor: "pointer" }}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showFragments}
              onChange={(e) => setShowFragments(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            Show Fragments
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={hideErrorCards}
              onChange={(e) => setHideErrorCards(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            Show Only Cards with Image Errors
          </label>
        </div>
      </div>

      <div style={styles.resultsSummary}>
        {!selectedExpansion &&
        !selectedHouse &&
        selectedCardTypes.size === 0 ? (
          <div style={styles.warningBox}>
            <p style={styles.warningTitle}>
              ⚠️ Please select at least one filter to view cards
            </p>
            <p style={styles.warningText}>
              Select an expansion, house, or card type to query matching cards from the database.
            </p>
          </div>
        ) : loading ? (
          <p>Loading cards...</p>
        ) : (
          <p>Showing {displayedCards.length} cards</p>
        )}
      </div>

      <div style={styles.cardsGrid}>
        {!loading &&
          (selectedExpansion ||
            selectedHouse ||
            selectedCardTypes.size > 0) &&
          displayedCards.map((card, index) => {
            const house = getCardDisplayHouse(card, selectedExpansion);
            const zones = getCardFragmentZones(card);

            return (
              <div key={`${card.slug}-${index}`} style={styles.cardItem}>
                <div style={styles.cardPreview}>
                  <img
                    src={getCardImageUrl(card.slug, house)}
                    alt={card.title}
                    loading="lazy"
                    onError={() => handleImageError(card.slug)}
                    style={{
                      height: "420px",
                      width: "300px",
                      objectFit: "contain",
                    }}
                  />
                </div>

                <div style={styles.cardInfo}>
                  <h3 style={styles.cardTitle}>{card.title}</h3>
                  <p style={styles.cardMeta}>
                    <span style={styles.cardType}>{card.type}</span>
                    {" • "}
                    <span style={styles.cardHouse}>{house}</span>
                  </p>
                  {card.power !== undefined && (
                    <p style={styles.cardStat}>Power: {card.power}</p>
                  )}
                  {card.armor !== undefined && (
                    <p style={styles.cardStat}>Armor: {card.armor}</p>
                  )}
                  {card.amber !== undefined && (
                    <p style={styles.cardStat}>Amber: {card.amber}</p>
                  )}
                </div>

                {showFragments && (
                  <div style={styles.fragmentsContainer}>
                    <h4 style={styles.fragmentsTitle}>
                      Fragments ({zones.length})
                    </h4>
                    <div style={styles.fragmentsGrid}>
                      {zones.map((zone) => (
                        <div key={zone} style={styles.fragmentItem}>
                          <div style={styles.fragmentLabel}>
                            {ZONE_DISPLAY[zone]}
                          </div>
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
    </div>
  );
}
