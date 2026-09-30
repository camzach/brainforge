import classNames from "classnames";
import React, { Suspense, use, useId, useRef } from "react";
import { getCardImageUrl } from "../../cards/card-image-utils";
import { queryCards } from "../../cards/card-db";
import type { Card } from "../../types";
import styles from "./puzzles.module.css";
import type { KeyforgePuzzle } from "./types";

type CardInPlay = NonNullable<
  NonNullable<KeyforgePuzzle["setup"]["friendly"]["battleline"]>[number]
>;

// ─── Card singleton ──────────────────────────────────────────────────────────
// Caches slug → Card lookups for the lifetime of the page.

const cardCache = new Map<string, Promise<Card | undefined>>();

function getCardPromise(slug: string): Promise<Card | undefined> {
  if (!cardCache.has(slug)) {
    cardCache.set(
      slug,
      queryCards({ slug }).then((results) => results[0]),
    );
  }
  return cardCache.get(slug)!;
}

// ─── CardThumb ────────────────────────────────────────────────────────────────

export type CardThumbProps = {
  card: CardInPlay | string;
  /** Unique per-instance id — same card slug can appear more than once in a
   * zone, so this can't just be the slug. e.g. `${slug}-${index}`. */
  id: string;
};

export function CardThumb({ card, id }: CardThumbProps) {
  const slug = typeof card === "string" ? card : card.slug;
  const pc = typeof card === "string" ? null : card;
  const popoverRef = useRef<HTMLDivElement>(null);

  const uid = useId();
  const anchorName = `--card-${uid}`;

  const upgrades = pc?.upgrades ?? [];
  const underneath = pc?.underneath ?? [];
  const hasExtraCards = upgrades.length > 0 || underneath.length > 0;
  // Fan display order: upgrades first, then the main card, then cards underneath (or whatever order makes sense)
  const fanCards: (CardInPlay | string)[] = hasExtraCards
    ? [...upgrades, pc!, ...underneath]
    : [card];

  type Badge = { key: string; content: React.ReactNode };
  const badges: Badge[] = [];
  if (pc?.amber)
    badges.push({
      key: "amber",
      content: (
        <>
          <img src="/aember.png" alt="æmber" className={styles.aemberIcon} />
          {pc.amber}
        </>
      ),
    });
  if (pc?.damage) badges.push({ key: "damage", content: `💥 ${pc.damage}` });

  function openZoom() {
    try {
      popoverRef.current?.showPopover();
    } catch {
      /* already open */
    }
  }
  function closeZoom() {
    try {
      popoverRef.current?.hidePopover();
    } catch {
      /* already closed */
    }
  }

  return (
    <Suspense fallback={<div className={styles.cardSkeleton} />}>
      <div
        className={classNames(styles.cardThumb, {
          [styles.cardExhausted]: pc?.ready === false,
        })}
        style={{ anchorName } as React.CSSProperties}
        title={slug}
        onMouseEnter={openZoom}
        onMouseLeave={closeZoom}
      >
        {/* Upgrades stack */}
        {!!pc?.upgrades?.length && (
          <div className={styles.upgradeStack}>
            {pc.upgrades.map((u, i) => (
              <CardImg key={`${id}-upgrade-${i}`} card={u} />
            ))}
          </div>
        )}

        {/* Underneath cards stack */}
        {!!underneath?.length && (
          <div className={styles.underneathStack}>
            {underneath.slice(0, 2).map((c, i) => (
              <CardImg key={`${id}-underneath-${i}`} card={c} />
            ))}
          </div>
        )}

        {/* Main card */}
        <div className={styles.cardMain}>
          <CardImg card={card} />
        </div>

        {/* Stack count badge if cards tucked underneath */}
        {underneath.length > 0 && (
          <span className={styles.cardStackCount}>+{underneath.length}</span>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className={styles.cardThumbBadges}>
            {badges.map((b) => (
              <span key={b.key} className={styles.cardThumbBadge}>
                {b.content}
              </span>
            ))}
          </div>
        )}

        {/* Popover: zoomed single image for normal cards; fan tray for stacks */}
        <div
          ref={popoverRef}
          popover="manual"
          className={classNames(styles.cardZoomPopover, {
            [styles.cardStackFan]: hasExtraCards,
          })}
          style={{ positionAnchor: anchorName } as React.CSSProperties}
        >
          {hasExtraCards ? (
            fanCards.map((c, i) => <CardImg key={`${id}-fan-${i}`} card={c} />)
          ) : (
            <CardImg card={card} />
          )}
        </div>
      </div>
    </Suspense>
  );
}

// ─── CardImg ──────────────────────────────────────────────────────────────────
// Suspense-based image that resolves its card via the singleton.
// Used in both the stacked layers and the fan popover.

function CardImg({
  card,
  className,
}: {
  card: CardInPlay | string;
  className?: string;
}) {
  const slug = typeof card === "string" ? card : card.slug;
  const cardObj = use(getCardPromise(slug));
  const src = cardObj ? getCardImageUrl(cardObj) : "";
  return (
    <img
      src={src}
      alt={slug}
      className={className}
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).style.visibility = "hidden";
      }}
    />
  );
}
