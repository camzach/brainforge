import { Link } from "@tanstack/react-router";
import styles from "./HomeScreen.module.css";

const MODES = [
  {
    title: "Well of Memory",
    description:
      "Practice your card recognition and recall across expansions. Get prepared for sealed!",
    actionLabel: "Start challenge",
    href: "/practice/setup" as const,
    image: `${import.meta.env.BASE_URL}card-images/700_126_4ae80953d364_en.webp`,
    houseColor: "geistoid",
    actionClass: "btn-primary",
  },
  {
    title: "Library of Polliasaurus",
    description:
      "Browse the full card pool before you challenge yourself. Filter by expansion, house, and type.",
    actionLabel: "Open viewer",
    href: "/viewer" as const,
    image: `${import.meta.env.BASE_URL}card-images/452_204_JRRJJM5V5G3Q_en.webp`,
    houseColor: "saurian",
    actionClass: "btn-secondary",
  },
];

export function HomeScreen() {
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>BrainForge</h1>
        <p className={styles.tagline}>
          Learn to recognise cards by their parts.
        </p>
      </header>

      <div className={styles.grid}>
        {MODES.map((mode) => (
          <Link
            key={mode.title}
            to={mode.href}
            className={`${styles.card} ${styles[mode.houseColor] || ""}`}
          >
            <div className={styles.artFrame}>
              <img
                src={mode.image}
                alt={mode.title}
                className={styles.cardImage}
                loading="lazy"
              />
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
        ))}
      </div>
    </div>
  );
}
