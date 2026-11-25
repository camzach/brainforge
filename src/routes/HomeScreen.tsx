import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { queryCards } from "../cards/card-db";
import { getCardImageUrl } from "../cards/card-image-utils";
import styles from "./HomeScreen.module.css";

const MODES = [
  {
    slug: "shard-of-knowledge",
    title: "Shard of Knowledge",
    description:
      "Practice your card recognition and recall across expansions. Get prepared for sealed!",
    actionLabel: "Start challenge",
    href: "/practice/setup" as const,
    houseColor: "logos",
    actionClass: "btn-primary",
  },
  {
    slug: "codex-of-true-names",
    title: "Codex of True Names",
    description:
      "Browse the full card pool before you challenge yourself. Filter by expansion, house, and type.",
    actionLabel: "Open viewer",
    href: "/viewer" as const,
    houseColor: "dis",
    actionClass: "btn-secondary",
  },
];

export function HomeScreen() {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let isCurrent = true;
    Promise.all(
      MODES.map(async (mode) => {
        const cards = await queryCards({ slug: mode.slug });
        const img = cards[0] ? getCardImageUrl(cards[0]) : "";
        return [mode.slug, img] as const;
      }),
    ).then((entries) => {
      if (!isCurrent) return;
      setImages(Object.fromEntries(entries));
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>BrainForge</h1>
        <p className={styles.tagline}>
          "I taught me everything you know."
          <br />— Professor Sutterkin
        </p>
      </header>

      <div className={styles.grid}>
        {MODES.map((mode) => {
          const imageUrl = images[mode.slug];

          return (
            <Link
              key={mode.title}
              to={mode.href}
              className={`${styles.card} ${styles[mode.houseColor] || ""}`}
            >
              <div className={styles.artFrame}>
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={mode.title}
                    className={styles.cardImage}
                    loading="lazy"
                  />
                )}
                <div className={styles.artOverlay} />
              </div>

              <div className={styles.body}>
                <h2 className={styles.visuallyHidden}>{mode.title}</h2>
                <p className={styles.description}>{mode.description}</p>
              </div>

              <div className={styles.actions}>
                <span className={`btn ${mode.actionClass} ${styles.actionBtn}`}>
                  {mode.actionLabel} →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
